import * as admin from 'firebase-admin';

// The service account key file is expected to be in the root directory
const serviceAccount = require('../service-account-key.json');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Consistent team names matching teamLogos.ts
const TEAMS = {
  LIV: 'Liverpool', BOU: 'Bournemouth', AVL: 'Aston Villa', NEW: 'Newcastle',
  BRI: 'Brighton', FUL: 'Fulham', SUN: 'Sunderland', WHU: 'West Ham',
  TOT: 'Tottenham', BUR: 'Burnley', WOL: 'Wolves', MCI: 'Man City',
  CHE: 'Chelsea', CRY: 'Crystal Palace', NFO: 'Nottm Forest', BRE: 'Brentford',
  MUN: 'Man Utd', ARS: 'Arsenal', LEE: 'Leeds', EVE: 'Everton'
};

const allFixtures = [
  // Match Week 1
  { matchWeek: 1, home: TEAMS.LIV, away: TEAMS.BOU },
  { matchWeek: 1, home: TEAMS.AVL, away: TEAMS.NEW },
  { matchWeek: 1, home: TEAMS.BRI, away: TEAMS.FUL },
  { matchWeek: 1, home: TEAMS.SUN, away: TEAMS.WHU },
  { matchWeek: 1, home: TEAMS.TOT, away: TEAMS.BUR },
  { matchWeek: 1, home: TEAMS.WOL, away: TEAMS.MCI },
  { matchWeek: 1, home: TEAMS.CHE, away: TEAMS.CRY },
  { matchWeek: 1, home: TEAMS.NFO, away: TEAMS.BRE },
  { matchWeek: 1, home: TEAMS.MUN, away: TEAMS.ARS },
  { matchWeek: 1, home: TEAMS.LEE, away: TEAMS.EVE },

  // Match Week 2
  { matchWeek: 2, home: TEAMS.WHU, away: TEAMS.CHE },
  { matchWeek: 2, home: TEAMS.MCI, away: TEAMS.TOT },
  { matchWeek: 2, home: TEAMS.BOU, away: TEAMS.WOL },
  { matchWeek: 2, home: TEAMS.BRE, away: TEAMS.AVL },
  { matchWeek: 2, home: TEAMS.BUR, away: TEAMS.SUN },
  { matchWeek: 2, home: TEAMS.ARS, away: TEAMS.LEE },
  { matchWeek: 2, home: TEAMS.CRY, away: TEAMS.NFO },
  { matchWeek: 2, home: TEAMS.EVE, away: TEAMS.BRI },
  { matchWeek: 2, home: TEAMS.FUL, away: TEAMS.MUN },
  { matchWeek: 2, home: TEAMS.NEW, away: TEAMS.LIV },

  // Match Week 3
  { matchWeek: 3, home: TEAMS.CHE, away: TEAMS.FUL },
  { matchWeek: 3, home: TEAMS.MUN, away: TEAMS.BUR },
  { matchWeek: 3, home: TEAMS.SUN, away: TEAMS.BRE },
  { matchWeek: 3, home: TEAMS.TOT, away: TEAMS.BOU },
  { matchWeek: 3, home: TEAMS.WOL, away: TEAMS.EVE },
  { matchWeek: 3, home: TEAMS.LEE, away: TEAMS.NEW },
  { matchWeek: 3, home: TEAMS.BRI, away: TEAMS.MCI },
  { matchWeek: 3, home: TEAMS.NFO, away: TEAMS.WHU },
  { matchWeek: 3, home: TEAMS.LIV, away: TEAMS.ARS },
  { matchWeek: 3, home: TEAMS.AVL, away: TEAMS.CRY },
];

const seedFixtures = async () => {
  const fixturesCollection = db.collection('fixtures');
  console.log('Starting to seed fixtures with Admin SDK...');
  const batch = db.batch();

  allFixtures.forEach((fixtureData) => {
    const docRef = fixturesCollection.doc(); // Automatically generate a new ID
    const newFixture = {
      homeTeam: fixtureData.home,
      awayTeam: fixtureData.away,
      matchWeek: fixtureData.matchWeek,
      date: '2025-08-17', // Placeholder date
      time: '15:00', // Placeholder time
      competition: 'Premier League',
      // The 'venue' field is complex to determine without knowing your team's schedule, 
      // so we'll omit it for now. It can be added later if needed.
    };
    batch.set(docRef, newFixture);
    console.log(`Preparing to add Match Week ${fixtureData.matchWeek}: ${fixtureData.home} vs ${fixtureData.away}`);
  });

  try {
    await batch.commit();
    console.log(`Successfully seeded ${allFixtures.length} fixtures to the database.`);
  } catch (error) {
    console.error('Error seeding fixtures:', error);
  }
};

seedFixtures().then(() => {
  console.log('Seeding process finished.');
  process.exit(0);
}).catch(error => {
  console.error('Unhandled error in seeding process:', error);
  process.exit(1);
});
