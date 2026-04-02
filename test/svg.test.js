import { describe, it, expect } from 'vitest';
import { renderSVG } from '../lib/svg.js';

describe('renderSVG', () => {
  it('returns a string starting with <svg', () => {
    const result = renderSVG({ stage: 'baby', status: 'normal', hunger: 60, daysWithCommits30d: 4 });
    expect(result).toMatch(/^<svg/);
  });

  it('includes the hunger bar', () => {
    const result = renderSVG({ stage: 'baby', status: 'normal', hunger: 60, daysWithCommits30d: 4 });
    expect(result).toContain('HUNGER');
    expect(result).toContain('██████░░░░');
  });

  it('includes stage label', () => {
    const result = renderSVG({ stage: 'teen', status: 'normal', hunger: 40, daysWithCommits30d: 9 });
    expect(result).toContain('TEEN');
  });

  it('shows dead sprite when status is dead', () => {
    const result = renderSVG({ stage: 'adult', status: 'dead', hunger: 0, daysWithCommits30d: 20 });
    expect(result).toContain('R.I.P');
  });

  it('includes SMIL animation elements for non-dead stages', () => {
    const result = renderSVG({ stage: 'baby', status: 'normal', hunger: 50, daysWithCommits30d: 4 });
    expect(result).toContain('<animate');
  });

  it('shows egg sprite for egg stage', () => {
    const result = renderSVG({ stage: 'egg', status: 'normal', hunger: 0, daysWithCommits30d: 1 });
    expect(result).toContain('___,');
  });

  it('shows adult sprite for adult stage', () => {
    const result = renderSVG({ stage: 'adult', status: 'normal', hunger: 80, daysWithCommits30d: 20 });
    expect(result).toContain('`   `');
  });
});
