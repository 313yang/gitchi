import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchGitHubData } from '../lib/github.js';

const TODAY = '2026-04-02';

function makeContribDay(date, count) {
  return { date, contributionCount: count };
}

function makeMockResponse(days) {
  return {
    ok: true,
    json: async () => ({
      data: {
        user: {
          contributionsCollection: {
            contributionCalendar: {
              weeks: [{ contributionDays: days }],
            },
          },
        },
      },
    }),
  };
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${TODAY}T12:00:00Z`));
});

describe('fetchGitHubData', () => {
  it('returns commits24h from today', async () => {
    fetch.mockResolvedValue(makeMockResponse([
      makeContribDay(TODAY, 4),
    ]));

    const result = await fetchGitHubData('rina', '2026-03-01', 'token');
    expect(result.commits24h).toBe(4);
  });

  it('counts days with commits since registration', async () => {
    fetch.mockResolvedValue(makeMockResponse([
      makeContribDay('2026-03-10', 2),
      makeContribDay('2026-03-11', 0),
      makeContribDay('2026-03-12', 1),
      makeContribDay(TODAY, 3),
    ]));

    const result = await fetchGitHubData('rina', '2026-03-01', 'token');
    expect(result.daysWithCommits30d).toBe(3);
  });

  it('calculates daysSinceLastCommit', async () => {
    fetch.mockResolvedValue(makeMockResponse([
      makeContribDay('2026-03-29', 1), // 4 days ago
    ]));

    const result = await fetchGitHubData('rina', '2026-03-01', 'token');
    expect(result.daysSinceLastCommit).toBe(4);
  });

  it('returns 999 days when no commits found', async () => {
    fetch.mockResolvedValue(makeMockResponse([]));

    const result = await fetchGitHubData('rina', '2026-03-01', 'token');
    expect(result.daysSinceLastCommit).toBe(999);
    expect(result.commits24h).toBe(0);
  });

  it('throws on non-ok response', async () => {
    fetch.mockResolvedValue({ ok: false, status: 401 });

    await expect(fetchGitHubData('rina', '2026-03-01', 'token'))
      .rejects.toThrow('GitHub API error: 401');
  });
});
