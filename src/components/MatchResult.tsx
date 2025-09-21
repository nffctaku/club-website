import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MatchRecord } from '@/types';
import { getTeamLogo } from '@/lib/teamLogos';

export async function getLatestResult(): Promise<MatchRecord | null> {
  try {
    const teamName = 'Nottm Forest';
    const matchesCollection = collection(db, 'matches');

    // As Firestore doesn't support OR queries on different fields, we do two separate queries.
    const homeQuery = query(matchesCollection, where('homeTeam', '==', teamName));
    const awayQuery = query(matchesCollection, where('awayTeam', '==', teamName));

    const [homeSnapshot, awaySnapshot] = await Promise.all([
      getDocs(homeQuery),
      getDocs(awayQuery)
    ]);

    const allMatches = [
      ...homeSnapshot.docs.map(doc => doc.data() as MatchRecord),
      ...awaySnapshot.docs.map(doc => doc.data() as MatchRecord)
    ];

    if (allMatches.length === 0) {
      return null;
    }

    // Sort by date descending to find the most recent match
    allMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return allMatches[0];

  } catch (error) {
    console.error("Error fetching latest result:", error);
    return null;
  }
}

const MatchResult = async () => {
  const lastMatch = await getLatestResult();

  if (!lastMatch) {
    return null; // Render nothing if no match found, parent component will handle layout
  }

  const ourTeamName = 'Nottm Forest';
  const isOurTeamHome = lastMatch.homeTeam === ourTeamName;
  const ourScore = isOurTeamHome ? lastMatch.scoreHome : lastMatch.scoreAway;
  const opponentScore = isOurTeamHome ? lastMatch.scoreAway : lastMatch.scoreHome;
  
  let resultText = 'DRAW';
  let resultColor = 'text-gray-400';
  if (ourScore > opponentScore) {
    resultText = 'WIN';
    resultColor = 'text-green-400';
  } else if (ourScore < opponentScore) {
    resultText = 'LOSS';
    resultColor = 'text-red-400';
  }

  const matchDate = new Date(lastMatch.date);
  const dateString = matchDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 h-full flex flex-col">
      <h3 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-wider">Latest Result</h3>
      <div className="flex-grow flex flex-col items-center justify-center py-2">
        <div className="flex items-center justify-around w-full mb-4">
          <div className="flex flex-col items-center gap-2 w-1/3">
            <Image src={getTeamLogo(lastMatch.homeTeam)} alt={lastMatch.homeTeam} width={64} height={64} />
            <span className="font-bold text-center text-white">{lastMatch.homeTeam}</span>
          </div>
          
          <div className="text-center w-1/3">
            <div className="text-5xl font-black text-white">
              <span>{lastMatch.scoreHome}</span>
              <span className="mx-2">-</span>
              <span>{lastMatch.scoreAway}</span>
            </div>
            <div className={`text-sm font-bold mt-1 ${resultColor}`}>
              {resultText}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 w-1/3">
            <Image src={getTeamLogo(lastMatch.awayTeam)} alt={lastMatch.awayTeam} width={64} height={64} />
            <span className="font-bold text-center text-white">{lastMatch.awayTeam}</span>
          </div>
        </div>
        <div className="text-center text-gray-400 text-xs mt-2">
          <p>{dateString}</p>
          <p>
            {lastMatch.competition}
            {lastMatch.matchWeek && ` 第${lastMatch.matchWeek}節`}
          </p>
        </div>
      </div>
       <div className="text-center mt-4">
          <Link href="/matches" className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-500 transition-all duration-300">
            View Report
          </Link>
        </div>
    </div>
  );
};

export default MatchResult;
