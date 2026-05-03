export interface RawCondition {
  waveHeight: number;
  period: number;
  direction: number;
  windSpeed: number;
  windDirection: number;
}

export async function fetchSpotConditions(
  latitude: number,
  longitude: number,
): Promise<RawCondition> {
  const [marineRes, windRes] = await Promise.all([
    fetch(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&current=wave_height,wave_period,wave_direction&timezone=auto`,
    ),
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=wind_speed_10m,wind_direction_10m&timezone=auto`,
    ),
  ]);

  if (!marineRes.ok || !windRes.ok) {
    throw new Error('Open-Meteo API error');
  }

  const marine = await marineRes.json();
  const wind = await windRes.json();

  return {
    waveHeight: marine.current.wave_height,
    period: marine.current.wave_period,
    direction: marine.current.wave_direction,
    windSpeed: wind.current.wind_speed_10m,
    windDirection: wind.current.wind_direction_10m,
  };
}
