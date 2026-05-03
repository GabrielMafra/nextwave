export type SurfLabel = 'great' | 'good' | 'fair' | 'poor';

export interface ScoreInput {
  waveHeight: number;
  period: number;
  windSpeed: number;
  preferredWaveHeight: number;
  windTolerance: number;
}

export function calculateScore(input: ScoreInput): number {
  const wave = waveHeightScore(input.waveHeight, input.preferredWaveHeight);
  const wind = windSpeedScore(input.windSpeed, input.windTolerance);
  const period = wavePeriodScore(input.period);
  return Math.round(wave * 0.4 + wind * 0.4 + period * 0.2);
}

export function getLabel(score: number): SurfLabel {
  if (score >= 75) return 'great';
  if (score >= 50) return 'good';
  if (score >= 25) return 'fair';
  return 'poor';
}

function waveHeightScore(actual: number, preferred: number): number {
  if (preferred === 0) return 0;
  const sigma = preferred * 0.5;
  return 100 * Math.exp(-0.5 * Math.pow((actual - preferred) / sigma, 2));
}

function windSpeedScore(speed: number, tolerance: number): number {
  if (tolerance === 0) return speed === 0 ? 100 : 0;
  if (speed <= tolerance) return 100;
  return Math.max(0, 100 * (1 - (speed - tolerance) / tolerance));
}

function wavePeriodScore(period: number): number {
  return Math.min(100, (period / 14) * 100);
}
