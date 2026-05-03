import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import { fetchSpotConditions } from '../services/conditions.js';

export function startConditionsFetchJob() {
  cron.schedule('0 * * * *', async () => {
    const spots = await prisma.surfSpot.findMany();

    for (const spot of spots) {
      try {
        const raw = await fetchSpotConditions(spot.latitude, spot.longitude);
        await prisma.condition.create({
          data: { spotId: spot.id, ...raw },
        });
      } catch (error) {
        console.error(`Failed to fetch conditions for ${spot.name}:`, error);
      }
    }
  });

  console.log('Conditions fetch job scheduled (every hour).');
}
