import { describe, it, expect } from 'vitest';
import { calcHunger, calcStage, calcStatus, calcPetState } from '../lib/game.js';

describe('calcHunger', () => {
  it('returns 0 when no commits and last commit was long ago', () => {
    expect(calcHunger(0, 999)).toBe(0);
  });

  it('adds 5% per commit', () => {
    expect(calcHunger(4, 0)).toBe(20);
  });

  it('caps at 100', () => {
    expect(calcHunger(30, 0)).toBe(100);
  });

  it('decays 1% per hour since last commit', () => {
    expect(calcHunger(10, 3)).toBe(47); // min(100, 50) - 3
  });

  it('does not go below 0', () => {
    expect(calcHunger(1, 100)).toBe(0); // 5 - 100 = clamped to 0
  });
});

describe('calcStage', () => {
  it('returns egg for 0-2 days', () => {
    expect(calcStage(0)).toBe('egg');
    expect(calcStage(2)).toBe('egg');
  });

  it('returns baby for 3-6 days', () => {
    expect(calcStage(3)).toBe('baby');
    expect(calcStage(6)).toBe('baby');
  });

  it('returns teen for 7-13 days', () => {
    expect(calcStage(7)).toBe('teen');
    expect(calcStage(13)).toBe('teen');
  });

  it('returns adult for 14+ days', () => {
    expect(calcStage(14)).toBe('adult');
    expect(calcStage(30)).toBe('adult');
  });
});

describe('calcStatus', () => {
  it('returns dead when last commit > 14 days ago', () => {
    expect(calcStatus(15, 0)).toBe('dead');
  });

  it('returns danger when hunger is 0 and not dead', () => {
    expect(calcStatus(5, 0)).toBe('danger');
  });

  it('returns normal when hunger > 0', () => {
    expect(calcStatus(1, 50)).toBe('normal');
  });

  it('dead takes priority over danger', () => {
    expect(calcStatus(20, 0)).toBe('dead');
  });
});

describe('calcPetState', () => {
  it('returns combined state', () => {
    const state = calcPetState({
      commits24h: 6,
      hoursSinceLastCommit: 2,
      daysSinceLastCommit: 0,
      daysWithCommits30d: 10,
    });
    expect(state.hunger).toBe(28); // min(100, 30) - 2
    expect(state.stage).toBe('teen');
    expect(state.status).toBe('normal');
  });
});
