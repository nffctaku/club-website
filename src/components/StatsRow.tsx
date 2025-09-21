import Image from 'next/image';

interface StatsRowProps {
  rank: number;
  player: {
    name: string;
    imageUrl: string;
  };
  value: number;
}

const StatsRow = ({ rank, player, value }: StatsRowProps) => {
  return (
    <div className="flex items-center p-3 bg-gray-800/50 rounded-lg transition-colors hover:bg-gray-700/80">
      <div className="w-8 text-center font-bold text-lg text-gray-400">{rank}</div>
      <div className="flex items-center flex-grow mx-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden mr-4">
          <Image src={player.imageUrl} alt={player.name} fill style={{ objectFit: 'cover' }} />
        </div>
        <span className="font-semibold text-white">{player.name}</span>
      </div>
      <div className="w-12 text-center font-black text-2xl text-amber-400">{value}</div>
    </div>
  );
};

export default StatsRow;
