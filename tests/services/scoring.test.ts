import { describe, it, expect } from 'vitest';
import { calculateScore, getLabel } from '../../src/services/scoring.js';

describe('calculateScore', () => {
  it('returns 97 for ideal conditions — wave at preferred, low wind, good period', () => {
    // waveScore = 100 * exp(0) = 100
    // windScore = 10 <= 20, so 100
    // periodScore = min(100, 12/14*100) = 85.71
    // total = 100*0.4 + 100*0.4 + 85.71*0.2 = 97.14 → 97
    const score = calculateScore({
      waveHeight: 1.5,
      period: 12,
      windSpeed: 10,
      preferredWaveHeight: 1.5,
      windTolerance: 20,
    });
    expect(score).toBe(97);
  });

  it('returns 7 for bad conditions — oversized waves, excessive wind, short period', () => {
    // waveScore = 100 * exp(-8) ≈ 0.034  (sigma=0.5, delta=2.0)
    // windScore = max(0, 100*(1-(40-15)/15)) = max(0,-66.7) = 0
    // periodScore = min(100, 5/14*100) = 35.71
    // total = 0.034*0.4 + 0*0.4 + 35.71*0.2 = 7.16 → 7
    const score = calculateScore({
      waveHeight: 3.0,
      period: 5,
      windSpeed: 40,
      preferredWaveHeight: 1.0,
      windTolerance: 15,
    });
    expect(score).toBe(7);
  });

  it('returns 100 for perfect conditions — exact preferred height, zero wind, 14s period', () => {
    const score = calculateScore({
      waveHeight: 2.0,
      period: 14,
      windSpeed: 0,
      preferredWaveHeight: 2.0,
      windTolerance: 25,
    });
    expect(score).toBe(100);
  });
});

describe('getLabel', () => {
  it('returns "great" for scores 75–100', () => {
    expect(getLabel(100)).toBe('great');
    expect(getLabel(97)).toBe('great');
    expect(getLabel(75)).toBe('great');
  });

  it('returns "good" for scores 50–74', () => {
    expect(getLabel(74)).toBe('good');
    expect(getLabel(50)).toBe('good');
  });

  it('returns "fair" for scores 25–49', () => {
    expect(getLabel(49)).toBe('fair');
    expect(getLabel(25)).toBe('fair');
  });

  it('returns "poor" for scores below 25', () => {
    expect(getLabel(24)).toBe('poor');
    expect(getLabel(7)).toBe('poor');
    expect(getLabel(0)).toBe('poor');
  });
});
