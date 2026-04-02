const SPRITES = {
  egg: [
    '    ___,  ',
    '  /     \\ ',
    ' /       \\',
    ' |       |',
    '  \\,___,/ ',
  ],
  baby: [
    '   /\\_/\\  ',
    null, // animated eye line
    '  (  u  )  ',
    "   '---'   ",
  ],
  teen: [
    '   /\\_/\\   ',
    null, // animated eye line
    '  (  u  )  ',
    "   '----'  ",
  ],
  adult: [
    '   /\\_/\\    ',
    null, // animated eye line
    '.[   u   ]. ',
    "  '-----'  ",
    '   `   `   ',
  ],
  dead: [
    '   /\\.__/\\ ',
    ' ,( x . x ),',
    '  (  ---  ) ',
    "   '-----' ",
    '  [ R.I.P ]',
  ],
};

const EYE_LINES = {
  baby: {
    normal:    '  ( . _ . )',
    lookRight: '  ( .  _.)',
    lookLeft:  '  (._  . )',
    blink:     '  ( - _ - )',
  },
  teen: {
    normal:    ' ,( . _ . ),',
    lookRight: ' ,( .  _.),',
    lookLeft:  ' ,(._  . ),',
    blink:     ' ,( - _ - ),',
  },
  adult: {
    normal:    ' ,( . _ . ),',
    lookRight: ' ,( .  _.),',
    lookLeft:  ' ,(._  . ),',
    blink:     ' ,( - _ - ),',
  },
};

const EYE_LINE_INDEX = { baby: 1, teen: 1, adult: 1 };

function renderHungerBar(hunger) {
  const filled = Math.round(hunger / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/ /g, '&#160;');
}

function renderAnimatedEyeLine(eyes, x, y) {
  const FONT = "'Courier New', Courier, monospace";
  const frames = [
    { text: eyes.normal,    values: '1;1;0;0;0;0;0;1;1', keyTimes: '0;0.5;0.501;0.625;0.626;0.75;0.751;0.875;1' },
    { text: eyes.lookRight, values: '0;0;1;1;0;0;0;0;0', keyTimes: '0;0.499;0.5;0.625;0.626;0.75;0.751;0.875;1' },
    { text: eyes.lookLeft,  values: '0;0;0;0;1;1;0;0;0', keyTimes: '0;0.499;0.5;0.624;0.625;0.75;0.751;0.875;1' },
    { text: eyes.blink,     values: '0;0;0;0;0;0;1;1;0', keyTimes: '0;0.499;0.5;0.624;0.625;0.749;0.75;0.875;1' },
  ];

  return frames.map(({ text, values, keyTimes }, i) => `
    <text x="${x}" y="${y}" font-family="${FONT}" font-size="13" fill="#000" opacity="${i === 0 ? 1 : 0}">${escapeXml(text)}<animate attributeName="opacity" dur="4s" repeatCount="indefinite" values="${values}" keyTimes="${keyTimes}" calcMode="discrete"/></text>`).join('');
}

/**
 * @param {{ stage: string, status: string, hunger: number, daysWithCommits30d: number }} params
 * @returns {string} SVG markup
 */
export function renderSVG({ stage, status, hunger, daysWithCommits30d }) {
  const isStatic = status === 'dead' || stage === 'egg';
  const spriteKey = status === 'dead' ? 'dead' : stage;
  const lines = SPRITES[spriteKey];

  const FONT = "'Courier New', Courier, monospace";
  const PAD = 20;
  const LINE_H = 18;
  const TITLE_Y = PAD + 14;
  const SPRITE_START_Y = TITLE_Y + LINE_H * 2;
  const EYE_IDX = EYE_LINE_INDEX[spriteKey];
  const WIDTH = 380;

  let spriteLinesHtml = '';
  lines.forEach((line, i) => {
    const y = SPRITE_START_Y + i * LINE_H;
    if (!isStatic && i === EYE_IDX) {
      spriteLinesHtml += renderAnimatedEyeLine(EYE_LINES[spriteKey], PAD, y);
    } else if (line !== null) {
      spriteLinesHtml += `\n    <text x="${PAD}" y="${y}" font-family="${FONT}" font-size="13" fill="#000">${escapeXml(line)}</text>`;
    }
  });

  const statsStartY = SPRITE_START_Y + lines.length * LINE_H + LINE_H;
  const HEIGHT = statsStartY + LINE_H * 3 + PAD;
  const hungerBar = renderHungerBar(hunger);
  const stageLabel = stage.toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="100%" height="100%" fill="#fff" rx="6"/>
  <text x="${PAD}" y="${TITLE_Y}" font-family="${FONT}" font-size="14" font-weight="bold" fill="#000">GITCHI</text>
  ${spriteLinesHtml}
  <text x="${PAD}" y="${statsStartY}" font-family="${FONT}" font-size="13" fill="#000">HUNGER  ${escapeXml(hungerBar)}  ${hunger}%</text>
  <text x="${PAD}" y="${statsStartY + LINE_H}" font-family="${FONT}" font-size="13" fill="#000">STAGE   ${stageLabel}</text>
  <text x="${PAD}" y="${statsStartY + LINE_H * 2}" font-family="${FONT}" font-size="13" fill="#000">DAYS    ${daysWithCommits30d} / 30</text>
</svg>`;
}
