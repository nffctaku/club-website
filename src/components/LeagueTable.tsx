import Image from 'next/image';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MatchRecord } from '@/types';
import { getTeamLogo } from '@/lib/teamLogos';

interface TeamStats {
  name: string;
  p: number; // Played
  w: number; // Wins
  d: number; // Draws
  l: number; // Losses
  gf: number; // Goals For
  ga: number; // Goals Against
  gd: number; // Goal Difference
  pts: number; // Points
}

async function getLeagueTableData(): Promise<TeamStats[]> {
  try {
    const matchesCollection = collection(db, 'matches');
    // We only care about Premier League matches for this table
    const q = query(matchesCollection, where('competition', '==', 'Premier League'));
    const snapshot = await getDocs(q);
    const matches = snapshot.docs.map(doc => doc.data() as MatchRecord);

    const teamStats: { [key: string]: TeamStats } = {};

    const initializeTeam = (teamName: string) => {
      if (!teamStats[teamName]) {
        teamStats[teamName] = { name: teamName, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      }
    };

    matches.forEach(match => {
      const { homeTeam, awayTeam, scoreHome, scoreAway } = match;
      initializeTeam(homeTeam);
      initializeTeam(awayTeam);

      const home = teamStats[homeTeam];
      const away = teamStats[awayTeam];

      home.p += 1;
      away.p += 1;
      home.gf += scoreHome;
      away.gf += scoreAway;
      home.ga += scoreAway;
      away.ga += scoreHome;

      if (scoreHome > scoreAway) {
        home.w += 1;
        home.pts += 3;
        away.l += 1;
      } else if (scoreAway > scoreHome) {
        away.w += 1;
        away.pts += 3;
        home.l += 1;
      } else {
        home.d += 1;
        away.d += 1;
        home.pts += 1;
        away.pts += 1;
      }
    });

    // If no teams were processed (i.e., no matches found), return a provisional table.
    if (Object.keys(teamStats).length === 0) {
      const allTeams = [
        'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 
        'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds', 
        'Liverpool', 'Man City', 'Man Utd', 'Newcastle', 'Nottm Forest', 
        'Sunderland', 'Tottenham', 'West Ham', 'Wolves'
      ].sort(); // Sort alphabetically

      return allTeams.map(teamName => ({
        name: teamName, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0
      }));
    }

    const table = Object.values(teamStats).map(team => ({
      ...team,
      gd: team.gf - team.ga,
    }));

    // Sort table: 1. Points (desc), 2. Goal Difference (desc), 3. Goals For (desc)
    table.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    return table;

  } catch (error) {
    console.error("Error calculating league table:", error);
    return []; // Return empty array on error
  }
}

const LeagueTable = async () => {
  const tableData = await getLeagueTableData();
  const ourTeamName = 'Nottm Forest'; // As defined in record-match page

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col">
      <h3 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-wider">Premier League</h3>
      <div className="overflow-x-auto flex-grow">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
            <tr>
              <th scope="col" className="px-2 py-3 text-center">Pos</th>
              <th scope="col" className="px-6 py-3">Club</th>
              <th scope="col" className="px-2 py-3 text-center">P</th>
              <th scope="col" className="px-2 py-3 text-center">GD</th>
              <th scope="col" className="px-2 py-3 text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((team, index) => (
              <tr key={team.name} className={`border-b border-gray-700 hover:bg-gray-700/50 ${team.name === ourTeamName ? 'bg-red-600/20' : ''}`}>
                <td className="px-2 py-3 font-medium text-center">{index + 1}</td>
                <th scope="row" className="px-6 py-3 font-medium text-white flex items-center gap-3">
                  <div className="w-5 h-5 relative">
                     <Image src={getTeamLogo(team.name)} alt={`${team.name} crest`} fill style={{ objectFit: 'contain' }} />
                  </div>
                  <span className="truncate">{team.name}</span>
                </th>
                <td className="px-2 py-3 text-center">{team.p}</td>
                <td className="px-2 py-3 text-center">{team.gd}</td>
                <td className="px-2 py-3 font-bold text-center text-white">{team.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeagueTable;
