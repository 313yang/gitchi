const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

const QUERY = `
query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
`;

/**
 * @param {string} username
 * @param {string} registeredAt - ISO date string YYYY-MM-DD
 * @param {string} token - GitHub personal access token
 * @returns {Promise<{ commits24h: number, hoursSinceLastCommit: number, daysSinceLastCommit: number, daysWithCommits30d: number }>}
 */
export async function fetchGitHubData(username, registeredAt, token) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const regDate = new Date(registeredAt);
  const from = regDate > thirtyDaysAgo ? regDate : thirtyDaysAgo;

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { username, from: from.toISOString(), to: now.toISOString() },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  const days = data.data.user.contributionsCollection.contributionCalendar.weeks
    .flatMap((w) => w.contributionDays);

  const todayStr = now.toISOString().slice(0, 10);
  const commits24h = days.find((d) => d.date === todayStr)?.contributionCount ?? 0;

  const activeDays = days.filter((d) => d.contributionCount > 0);
  const daysWithCommits30d = activeDays.length;

  if (activeDays.length === 0) {
    return { commits24h, hoursSinceLastCommit: 999, daysSinceLastCommit: 999, daysWithCommits30d: 0 };
  }

  const lastActiveDay = activeDays[activeDays.length - 1].date;
  const lastDate = new Date(lastActiveDay);
  const diffMs = now - lastDate;
  const daysSinceLastCommit = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hoursSinceLastCommit = daysSinceLastCommit === 0 ? 0 : daysSinceLastCommit * 24;

  return { commits24h, hoursSinceLastCommit, daysSinceLastCommit, daysWithCommits30d };
}
