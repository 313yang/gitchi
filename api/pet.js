import { fetchGitHubData } from '../lib/github.js';
import { getRegisteredAt, setRegisteredAt, resetRegisteredAt, getDiedAt, setDiedAt, clearDiedAt } from '../lib/kv.js';
import { calcPetState } from '../lib/game.js';
import { renderSVG } from '../lib/svg.js';

export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).send('username is required');
  }

  const token = process.env.GITHUB_TOKEN;
  const today = new Date().toISOString().slice(0, 10);

  let registeredAt = await getRegisteredAt(username);
  if (!registeredAt) {
    await setRegisteredAt(username, today);
    registeredAt = today;
  }

  let githubData;
  try {
    githubData = await fetchGitHubData(username, registeredAt, token);
  } catch {
    githubData = { commits24h: 0, hoursSinceLastCommit: 999, daysSinceLastCommit: 999, daysWithCommits30d: 0 };
  }

  const diedAt = await getDiedAt(username);
  let effectiveDaysWithCommits = githubData.daysWithCommits30d;

  if (diedAt && githubData.daysSinceLastCommit <= 1) {
    await resetRegisteredAt(username, today);
    await clearDiedAt(username);
    effectiveDaysWithCommits = githubData.commits24h > 0 ? 1 : 0;
  }

  const { hunger, stage, status } = calcPetState({
    ...githubData,
    daysWithCommits30d: effectiveDaysWithCommits,
  });

  if (status === 'dead' && !diedAt) {
    await setDiedAt(username, today);
  }

  const svg = renderSVG({ stage, status, hunger, daysWithCommits30d: effectiveDaysWithCommits });

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, max-age=3600');
  res.send(svg);
}
