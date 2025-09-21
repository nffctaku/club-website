import Image from 'next/image';

type Team = {
  name: string;
  crest: string;
};

type MatchCardProps = {
  competition: string;
  date: string;
  homeTeam: Team;
  awayTeam: Team;
  score?: {
    home: number;
    away: number;
  };
  time?: string;
};

const MatchCard = ({ competition, date, homeTeam, awayTeam, score, time }: MatchCardProps) => {
  const isHomeMatch = homeTeam.name === 'Club Website';

  return (
    <div className="bg-gray-700 rounded-lg shadow-lg p-4 flex flex-col items-center justify-center text-center">
      <p className="text-xs text-gray-400 font-semibold">{competition}</p>
      <p className="text-xs text-gray-400 mb-2">{date}</p>
      <div className="flex items-center justify-around w-full">
        <div className="flex flex-col items-center w-1/3">
          <div className="relative w-12 h-12 mb-1">
            <Image src={homeTeam.crest} alt={homeTeam.name} fill style={{ objectFit: 'contain' }} />
          </div>
          <p className="font-bold text-sm">{homeTeam.name}</p>
        </div>
        <div className="w-1/3">
          {score ? (
            <p className="text-3xl font-bold">{`${score.home} - ${score.away}`}</p>
          ) : (
            <p className="text-xl font-bold">{time}</p>
          )}
        </div>
        <div className="flex flex-col items-center w-1/3">
          <div className="relative w-12 h-12 mb-1">
            <Image src={awayTeam.crest} alt={awayTeam.name} fill style={{ objectFit: 'contain' }} />
          </div>
          <p className="font-bold text-sm">{awayTeam.name}</p>
        </div>
      </div>
      <div className="mt-4 border-t border-gray-600 w-full pt-2 text-center">
         <p className="text-sm font-bold">{isHomeMatch ? 'ホーム' : 'アウェイ'}</p>
      </div>
    </div>
  );
};

export default MatchCard;
