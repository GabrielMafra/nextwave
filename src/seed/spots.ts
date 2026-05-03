import prisma from '../lib/prisma.js';

const PORTUGUESE_SPOTS = [
  { name: 'Supertubos', latitude: 39.354, longitude: -9.379 },
  { name: 'Praia do Norte (Nazaré)', latitude: 39.601, longitude: -9.071 },
  { name: 'Ericeira', latitude: 38.963, longitude: -9.416 },
  { name: 'Costa da Caparica', latitude: 38.544, longitude: -9.245 },
  { name: 'Guincho', latitude: 38.726, longitude: -9.474 },
  { name: 'Praia Grande (Sintra)', latitude: 38.838, longitude: -9.473 },
  { name: 'Figueira da Foz', latitude: 40.149, longitude: -8.868 },
  { name: 'Viana do Castelo', latitude: 41.694, longitude: -8.851 },
  { name: 'Praia de Moledo', latitude: 41.851, longitude: -8.876 },
  { name: 'São Jacinto', latitude: 40.666, longitude: -8.744 },
];

async function seed() {
  const existing = await prisma.surfSpot.count();
  if (existing > 0) {
    console.log(`Spots already seeded (${existing} found). Skipping.`);
    await prisma.$disconnect();
    return;
  }
  await prisma.surfSpot.createMany({ data: PORTUGUESE_SPOTS });
  console.log(`Seeded ${PORTUGUESE_SPOTS.length} spots.`);
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
