import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

import { kv } from '@vercel/kv';
import { getRegisteredAt, setRegisteredAt, resetRegisteredAt, getDiedAt, setDiedAt, clearDiedAt } from '../lib/kv.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getRegisteredAt', () => {
  it('returns stored date string', async () => {
    kv.get.mockResolvedValue('2026-04-02');
    const result = await getRegisteredAt('rina');
    expect(result).toBe('2026-04-02');
    expect(kv.get).toHaveBeenCalledWith('gitchi:registered:rina');
  });

  it('returns null when not found', async () => {
    kv.get.mockResolvedValue(null);
    const result = await getRegisteredAt('unknown');
    expect(result).toBeNull();
  });
});

describe('setRegisteredAt', () => {
  it('sets with nx option to avoid overwriting', async () => {
    kv.set.mockResolvedValue('OK');
    await setRegisteredAt('rina', '2026-04-02');
    expect(kv.set).toHaveBeenCalledWith('gitchi:registered:rina', '2026-04-02', { nx: true });
  });
});

describe('resetRegisteredAt', () => {
  it('overwrites without nx', async () => {
    kv.set.mockResolvedValue('OK');
    await resetRegisteredAt('rina', '2026-04-02');
    expect(kv.set).toHaveBeenCalledWith('gitchi:registered:rina', '2026-04-02');
  });
});

describe('getDiedAt / setDiedAt / clearDiedAt', () => {
  it('gets died date', async () => {
    kv.get.mockResolvedValue('2026-03-15');
    expect(await getDiedAt('rina')).toBe('2026-03-15');
    expect(kv.get).toHaveBeenCalledWith('gitchi:died:rina');
  });

  it('sets died date with nx', async () => {
    kv.set.mockResolvedValue('OK');
    await setDiedAt('rina', '2026-03-15');
    expect(kv.set).toHaveBeenCalledWith('gitchi:died:rina', '2026-03-15', { nx: true });
  });

  it('clears died date', async () => {
    kv.del.mockResolvedValue(1);
    await clearDiedAt('rina');
    expect(kv.del).toHaveBeenCalledWith('gitchi:died:rina');
  });
});
