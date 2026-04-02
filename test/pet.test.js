import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/github.js', () => ({ fetchGitHubData: vi.fn() }));
vi.mock('../lib/kv.js', () => ({
  getRegisteredAt: vi.fn(),
  setRegisteredAt: vi.fn(),
  resetRegisteredAt: vi.fn(),
  getDiedAt: vi.fn(),
  setDiedAt: vi.fn(),
  clearDiedAt: vi.fn(),
}));
vi.mock('../lib/svg.js', () => ({ renderSVG: vi.fn(() => '<svg>mock</svg>') }));

import { fetchGitHubData } from '../lib/github.js';
import { getRegisteredAt, setRegisteredAt, resetRegisteredAt, getDiedAt, setDiedAt, clearDiedAt } from '../lib/kv.js';
import { renderSVG } from '../lib/svg.js';
import handler from '../api/pet.js';

function makeReq(query = {}) {
  return { query };
}

function makeRes() {
  return {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.GITHUB_TOKEN = 'test-token';
  getRegisteredAt.mockResolvedValue('2026-03-01');
  getDiedAt.mockResolvedValue(null);
  fetchGitHubData.mockResolvedValue({
    commits24h: 3,
    hoursSinceLastCommit: 1,
    daysSinceLastCommit: 0,
    daysWithCommits30d: 8,
  });
});

describe('GET /api/pet', () => {
  it('returns 400 when username is missing', async () => {
    const req = makeReq({});
    const res = makeRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('username is required');
  });

  it('calls renderSVG and returns SVG with correct headers', async () => {
    const req = makeReq({ username: 'rina' });
    const res = makeRes();
    await handler(req, res);
    expect(renderSVG).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/svg+xml');
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, max-age=3600');
    expect(res.send).toHaveBeenCalledWith('<svg>mock</svg>');
  });

  it('stores registration date on first visit', async () => {
    getRegisteredAt.mockResolvedValue(null);
    const req = makeReq({ username: 'newuser' });
    const res = makeRes();
    await handler(req, res);
    expect(setRegisteredAt).toHaveBeenCalledWith('newuser', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });

  it('does not call setRegisteredAt on repeat visit', async () => {
    const req = makeReq({ username: 'rina' });
    const res = makeRes();
    await handler(req, res);
    expect(setRegisteredAt).not.toHaveBeenCalled();
  });

  it('resets registration and clears diedAt on revival', async () => {
    getDiedAt.mockResolvedValue('2026-03-15');
    fetchGitHubData.mockResolvedValue({
      commits24h: 2,
      hoursSinceLastCommit: 0,
      daysSinceLastCommit: 0,
      daysWithCommits30d: 20,
    });
    const req = makeReq({ username: 'rina' });
    const res = makeRes();
    await handler(req, res);
    expect(resetRegisteredAt).toHaveBeenCalled();
    expect(clearDiedAt).toHaveBeenCalled();
    expect(renderSVG).toHaveBeenCalledWith(expect.objectContaining({ daysWithCommits30d: 1 }));
  });

  it('stores diedAt when pet dies for the first time', async () => {
    fetchGitHubData.mockResolvedValue({
      commits24h: 0,
      hoursSinceLastCommit: 999,
      daysSinceLastCommit: 20,
      daysWithCommits30d: 0,
    });
    const req = makeReq({ username: 'rina' });
    const res = makeRes();
    await handler(req, res);
    expect(setDiedAt).toHaveBeenCalledWith('rina', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });
});
