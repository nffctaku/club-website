import Link from 'next/link';

// Define the type for a match
interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  competition: string;
  status: 'Fixture' | 'Full-Time';
}

interface MatchListItemProps {
  match: Match;
}

const MatchListItem = ({ match }: MatchListItemProps) => {
  const matchDate = new Date(match.date);
  const isOurTeamHome = match.homeTeam === 'CLUB WEBSITE FC';

  let resultStyles = '';
  if (match.status === 'Full-Time') {
    const weWon = (isOurTeamHome && match.homeScore! > match.awayScore!) || (!isOurTeamHome && match.awayScore! > match.homeScore!);
    const weDrew = match.homeScore === match.awayScore;
    if (weWon) {
      resultStyles = 'bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500';
    } else if (weDrew) {
      resultStyles = 'bg-gray-100 dark:bg-gray-700/50 border-l-4 border-gray-500';
    } else {
      resultStyles = 'bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500';
    }
  } else {
    resultStyles = 'bg-white dark:bg-gray-800/50 border-l-4 border-amber-500';
  }

  return (
    <div className={`shadow-md rounded-lg p-4 flex items-center transition-all duration-300 hover:shadow-xl ${resultStyles}`}>
      <div className="w-24 text-center mr-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">{matchDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</div>
        <div className="font-bold text-lg text-gray-900 dark:text-white">{matchDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>

      <div className="flex-grow flex items-center justify-between">
        {/* Home Team */}
        <div className="flex items-center justify-end w-2/5">
          <span className="font-bold text-right hidden md:inline">{match.homeTeam}</span>
          <img src={match.homeLogo} alt={match.homeTeam} className="w-10 h-10 ml-3" />
        </div>

        {/* Score / Status */}
        <div className="w-1/5 text-center">
          {match.status === 'Full-Time' ? (
            <span className="text-2xl font-black text-gray-900 dark:text-white">{match.homeScore} - {match.awayScore}</span>
          ) : (
            <span className="text-xs font-bold bg-amber-500 text-gray-900 px-2 py-1 rounded">FIXTURE</span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center w-2/5">
          <img src={match.awayLogo} alt={match.awayTeam} className="w-10 h-10 mr-3" />
          <span className="font-bold text-left hidden md:inline">{match.awayTeam}</span>
        </div>
      </div>

      <div className="w-20 text-center ml-4">
        <Link href={`/matches/${match.id}`} className="text-sm text-amber-500 hover:text-amber-400 font-semibold">
          Details
        </Link>
      </div>
    </div>
  );
};

export default MatchListItem;
