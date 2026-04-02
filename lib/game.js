export function calcHunger(commits24h, hoursSinceLastCommit) {
  const base = Math.min(100, commits24h * 5);
  return Math.max(0, base - Math.floor(hoursSinceLastCommit));
}

export function calcStage(daysWithCommits) {
  if (daysWithCommits >= 14) return 'adult';
  if (daysWithCommits >= 7) return 'teen';
  if (daysWithCommits >= 3) return 'baby';
  return 'egg';
}

export function calcStatus(daysSinceLastCommit, hunger) {
  if (daysSinceLastCommit > 14) return 'dead';
  if (hunger === 0) return 'danger';
  return 'normal';
}

export function calcPetState({ commits24h, hoursSinceLastCommit, daysSinceLastCommit, daysWithCommits30d }) {
  const hunger = calcHunger(commits24h, hoursSinceLastCommit);
  const stage = calcStage(daysWithCommits30d);
  const status = calcStatus(daysSinceLastCommit, hunger);
  return { hunger, stage, status };
}
