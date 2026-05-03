import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchSpotConditions } from '../../src/services/conditions.js';

afterEach(() => vi.restoreAllMocks());

describe('fetchSpotConditions', () => {
  it('fetches and returns combined wave and wind data', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            current: { wave_height: 1.5, wave_period: 12.0, wave_direction: 280 },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            current: { wind_speed_10m: 15.0, wind_direction_10m: 220 },
          }),
        }),
    );

    const result = await fetchSpotConditions(39.354, -9.379);

    expect(result).toEqual({
      waveHeight: 1.5,
      period: 12.0,
      direction: 280,
      windSpeed: 15.0,
      windDirection: 220,
    });
  });

  it('throws when the marine API returns an error status', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 503 })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) }),
    );

    await expect(fetchSpotConditions(39.354, -9.379)).rejects.toThrow(
      'Open-Meteo API error',
    );
  });

  it('throws when the forecast API returns an error status', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            current: { wave_height: 1.5, wave_period: 12, wave_direction: 280 },
          }),
        })
        .mockResolvedValueOnce({ ok: false, status: 503 }),
    );

    await expect(fetchSpotConditions(39.354, -9.379)).rejects.toThrow(
      'Open-Meteo API error',
    );
  });
});
