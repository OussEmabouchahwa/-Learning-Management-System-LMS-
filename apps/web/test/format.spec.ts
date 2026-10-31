import { describe, it, expect } from 'vitest';
import { formatDate, formatDuration, formatPercent, formatGrade } from '../src/lib/format';

describe('format utilities', () => {
  it('formats dates consistently', () => {
    const d = new Date('2026-10-31T12:00:00Z');
    const formatted = formatDate(d);
    expect(formatted).toContain('Oct');
  });

  it('formats duration', () => {
    expect(formatDuration(60)).toBe('1 minute');
    expect(formatDuration(120)).toBe('2 minutes');
    expect(formatDuration(3600)).toBe('1 hour');
    expect(formatDuration(3660)).toBe('1 hour 1 minute');
  });

  it('formats percent', () => {
    expect(formatPercent(58)).toBe('58%');
    expect(formatPercent(58.4)).toBe('58%');
  });

  it('formats grade string', () => {
    expect(formatGrade(86.4, 100)).toBe('86.4 out of 100');
  });
});
