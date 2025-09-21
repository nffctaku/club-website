import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Fixture, MatchRecord } from '@/types';
import { getTeamLogo } from '@/lib/teamLogos';
import Image from 'next/image';

async function getNextFixture(): Promise<Fixture | null> {
  try {
    const teamName = 'Nottm Forest';

    // 1. Fetch all fixtures, sorted by date
    const fixturesQuery = query(collection(db, 'fixtures'), orderBy('date', 'asc'));
    const fixturesSnapshot = await getDocs(fixturesQuery);
    const allFixtures = fixturesSnapshot.docs.map(doc => doc.data() as Fixture);

    // 2. Fetch all match results
    const matchesSnapshot = await getDocs(collection(db, 'matches'));
    const allMatches = matchesSnapshot.docs.map(doc => doc.data() as MatchRecord);

    // 3. Create a Set of played matches for quick lookup.
    const playedMatchKeys = new Set(
      allMatches.map(match => `${match.date}-${match.homeTeam}-${match.awayTeam}`)
    );

    // 4. Filter fixtures to find the next one for OUR team.
    const nextFixtureForOurTeam = allFixtures
      // Filter out fixtures without a valid date
      .filter(fixture => fixture.date && typeof fixture.date === 'string')
      // Filter for fixtures involving our team
      .find(fixture => {
        const isOurTeam = fixture.homeTeam === teamName || fixture.awayTeam === teamName;
        if (!isOurTeam) return false;

        const fixtureKey = `${fixture.date}-${fixture.homeTeam}-${fixture.awayTeam}`;
        // Return true if this is the first unplayed match for our team
        return !playedMatchKeys.has(fixtureKey);
      });

    return nextFixtureForOurTeam || null;

  } catch (error) {
    console.error("Error fetching next fixture (final logic):", error);
    return null;
  }
}

const NextFixture = async () => {
  const fixture = await getNextFixture();

  if (!fixture) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center h-full flex flex-col justify-center">
        <h3 className="text-sm font-bold mb-2 text-gray-400 uppercase tracking-wider">NEXT MATCH</h3>
        <p className="text-gray-500">全日程終了、または次の試合の予定がありません。</p>
      </div>
    );
  }

  const fixtureDate = new Date(fixture.date);
  const dateString = fixtureDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center flex flex-col justify-center items-center h-full">
      <h3 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-wider">NEXT MATCH</h3>
      <div className="flex items-center justify-around w-full">
        <div className="flex flex-col items-center w-1/3">
          <Image src={getTeamLogo(fixture.homeTeam)} alt={fixture.homeTeam} width={64} height={64} />
          <span className="mt-2 font-semibold text-lg text-white">{fixture.homeTeam}</span>
        </div>
        <div className="text-4xl font-bold text-gray-400 mx-4">VS</div>
        <div className="flex flex-col items-center w-1/3">
          <Image src={getTeamLogo(fixture.awayTeam)} alt={fixture.awayTeam} width={64} height={64} />
          <span className="mt-2 font-semibold text-lg text-white">{fixture.awayTeam}</span>
        </div>
      </div>
      <div className="mt-4 text-gray-300">
        <p>{dateString}</p>
        <p>{fixture.time ? `${fixture.time} K.O.` : ''}</p>
        <p className="text-sm text-gray-500">
          {fixture.competition}
          {fixture.matchWeek && ` 第${fixture.matchWeek}節`}
        </p>
      </div>
    </div>
  );
};

export default NextFixture;
