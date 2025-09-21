import { Player } from '@/types'; // Import from index.ts
import Image from 'next/image';

interface PlayerCardProps {
  player: Player;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
    // A simple mapping from nationality name to country code for flags
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getNationalityCode = (nationality: string) => {
    const map: { [key: string]: string } = {
      'Brazil': 'br',
      'Scotland': 'gb-sct',
      'Belgium': 'be',
      'Wales': 'gb-wls',
      'Ivory Coast': 'ci',
      'Serbia': 'rs',
      'Nigeria': 'ng',
      'Ukraine': 'ua',
      'Italy': 'it',
      'England': 'gb-eng',
      'Argentina': 'ar',
      'New Zealand': 'nz',
      'Sweden': 'se',
      // Add other nationalities here as needed
    };
    return map[nationality] || 'xx'; // Return a placeholder for unknown
  };

  const nationalityCode = getNationalityCode(player.nationality);

  return (
    <div className="text-center">
      <div className="relative w-full aspect-[4/5] overflow-hidden group">
        <Image
          src={player.photoUrl || `https://ui-avatars.com/api/?name=${getInitials(player.name)}&background=random&color=fff&size=256`}
          alt={player.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className={`group-hover:scale-105 transition-transform duration-300 ${player.photoUrl ? 'object-cover' : 'object-contain p-4'}`}

        />
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-sm font-bold px-2 py-1 rounded">
          {player.jerseyNumber}
        </div>
      </div>
      <div className="mt-2">
        <p className="font-bold text-lg text-white">{player.name}</p>
        <div className="flex items-center justify-center mt-1 space-x-2">
          {nationalityCode !== 'xx' && (
            <Image 
              src={`https://flagcdn.com/w20/${nationalityCode}.png`}
              alt={player.nationality}
              width={20}
              height={15}
            />
          )}
          <span className="text-sm text-gray-400">{player.nationality}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
