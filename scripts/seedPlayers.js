// This script is for one-time use to populate the Firestore 'players' collection.
// Before running: 
// 1. Make sure you have firebase-admin installed: `npm install firebase-admin`
// 2. Download your service account key from Firebase Console > Project Settings > Service accounts
//    and save it as 'serviceAccountKey.json' in the root of your project.
// 3. Run the script from your project root: `node scripts/seedPlayers.js`

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccount.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// --- Player Data Transcribed from Screenshots ---

// Helper to calculate date of birth from age
const getDOB = (age) => {
  const today = new Date();
  const year = today.getFullYear() - age;
  // To make it simple, we'll use a fixed month and day
  const month = Math.floor(Math.random() * 12) + 1; 
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const playersData = [
  // Image 1
  { name: 'John Victor', position: 'GK', nationality: 'ブラジル', jerseyNumber: 13, age: 29, height: 196 },
  { name: 'Angus Gunn', position: 'GK', nationality: 'スコットランド', jerseyNumber: 18, age: 29, height: 196 },
  { name: 'Matz Sels', position: 'GK', nationality: 'ベルギー', jerseyNumber: 26, age: 33, height: 188 },
  { name: 'Ola Aina', position: 'RB, LB, RWB, RM', nationality: 'ナイジェリア', jerseyNumber: 34, age: 28, height: 184, status: 'ハムストリング損傷 - 9月 2025下旬' },
  { name: 'Nicolo Savona', position: 'RB, CB, LB', nationality: 'イタリア', jerseyNumber: 37, age: 22, height: 192 },
  { name: 'Morato', position: 'CB, LB', nationality: 'ブラジル', jerseyNumber: 4, age: 24, height: 192 },
  { name: 'Murillo', position: 'CB', nationality: 'ブラジル', jerseyNumber: 5, age: 23, height: 182 },
  { name: 'Jair Cunha', position: 'CB, RB', nationality: 'ブラジル', jerseyNumber: 23, age: 20, height: 198 },
  { name: 'Willy Boly', position: 'CB', nationality: 'コートジボワール', jerseyNumber: 30, age: 34, height: 195 },
  { name: 'Nikola Milenkovic', position: 'CB', nationality: 'セルビア', jerseyNumber: 31, age: 27, height: 195 },
  { name: 'Zach Abbott', position: 'CB', nationality: 'イングランド', jerseyNumber: 44, age: 19, height: 195 },
  { name: 'Neco Williams', position: 'LB, RB, LM, LWB', nationality: 'ウェールズ', jerseyNumber: 3, age: 24, height: 183 },
  { name: 'Oleksandr Zinchenko', position: 'LB, AM, CM', nationality: 'ウクライナ', jerseyNumber: 35, age: 28, height: 175 },
  { name: 'Dilane Bakwa', position: 'RWB, RW, RM, AM', nationality: 'フランス', jerseyNumber: 29, age: 23, height: 180 },
  // Image 2
  { name: 'Ibrahim Sangaré', position: 'DM', nationality: 'コートジボワール', jerseyNumber: 6, age: 27, height: 191 },
  { name: 'Elliot Anderson', position: 'DM, CM, LW, AM', nationality: 'イングランド', jerseyNumber: 8, age: 22, height: 179 },
  { name: 'Douglas Luiz', position: 'DM, AM', nationality: 'ブラジル', jerseyNumber: 12, age: 27, height: 179 },
  { name: 'Nicolás Domínguez', position: 'DM, AM', nationality: 'アルゼンチン', jerseyNumber: 16, age: 27, height: 179, status: '半月板損傷 - 10月 2025上旬' },
  { name: 'Ryan Yates', position: 'DM, AM, CM', nationality: 'イングランド', jerseyNumber: 22, age: 27, height: 190 },
  { name: 'Morgan Gibbs-White', position: 'AM, CM, RW', nationality: 'イングランド', jerseyNumber: 10, age: 25, height: 171 },
  { name: 'Omari Hutchinson', position: 'AM, RW, LW, RM, LM', nationality: 'イングランド', jerseyNumber: 21, age: 21, height: 175 },
  { name: 'James McAtee', position: 'AM, RW', nationality: 'イングランド', jerseyNumber: 24, age: 22, height: 180 },
  { name: 'Callum Hudson-Odoi', position: 'LW, RW, LM', nationality: 'イングランド', jerseyNumber: 7, age: 24, height: 182 },
  { name: 'Dan Ndoye', position: 'LW, RW, ST, RM', nationality: 'スイス', jerseyNumber: 14, age: 24, height: 183 },
  { name: 'Taiwo Awoniyi', position: 'ST', nationality: 'ナイジェリア', jerseyNumber: 9, age: 28, height: 183 },
  { name: 'Chris Wood', position: 'ST', nationality: 'ニュージーランド', jerseyNumber: 11, age: 33, height: 187 },
  { name: 'Arnaud Kalimuendo-Muinga', position: 'ST', nationality: 'フランス', jerseyNumber: 15, age: 23, height: 175 },
  { name: 'Igor Jesus', position: 'ST', nationality: 'ブラジル', jerseyNumber: 19, age: 24, height: 180 },
].map(p => ({
  ...p,
  dateOfBirth: getDOB(p.age),
  // Placeholder for photoUrl. You can update these later in the admin panel.
  photoUrl: `https://ui-avatars.com/api/?name=${p.name.replace(/ /g, '+')}&background=random&color=fff`,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
}));

const seedPlayers = async () => {
  const playersCollection = db.collection('players');
  console.log('Starting to seed players...');

  for (const playerData of playersData) {
    // Check if a player with the same name already exists to avoid duplicates
    const querySnapshot = await playersCollection.where('name', '==', playerData.name).get();
    
    if (querySnapshot.empty) {
      await playersCollection.add(playerData);
      console.log(`Added: ${playerData.name}`);
    } else {
      console.log(`Skipped (already exists): ${playerData.name}`);
    }
  }

  console.log('Seeding complete!');
};

seedPlayers().catch(console.error);
