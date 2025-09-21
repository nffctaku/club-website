import PlayerCard from '@/components/PlayerCard';
import { Player } from '@/types';

const squadData: { [key: string]: Omit<Player, 'createdAt' | 'status'>[] } = {
  'ゴールキーパー': [
    { id: 'alex-goalie', name: 'Alex Goalie', jerseyNumber: 1, position: 'Goalkeeper', photoUrl: 'https://placehold.co/400x500/1f2937/ffffff?text=Player', nationality: 'England', dateOfBirth: '2000-01-01', height: 190 },
  ],
  'ディフェンダー': [
    { id: 'ben-defender', name: 'Ben Defender', jerseyNumber: 2, position: 'Defender', photoUrl: 'https://placehold.co/400x500/1f2937/ffffff?text=Player', nationality: 'Wales', dateOfBirth: '2000-01-01', height: 185 },
    { id: 'chris-centreback', name: 'Chris Centreback', jerseyNumber: 5, position: 'Defender', photoUrl: 'https://placehold.co/400x500/1f2937/ffffff?text=Player', nationality: 'Scotland', dateOfBirth: '2000-01-01', height: 188 },
    { id: 'david-fullback', name: 'David Fullback', jerseyNumber: 3, position: 'Defender', photoUrl: 'https://placehold.co/400x500/1f2937/ffffff?text=Player', nationality: 'England', dateOfBirth: '2000-01-01', height: 180 },
  ],
  'ミッドフィールダー': [
    { id: 'ethan-engine', name: 'Ethan Engine', jerseyNumber: 8, position: 'Midfielder', photoUrl: 'https://placehold.co/400x500/b91c1c/ffffff?text=Star', nationality: 'Brazil', dateOfBirth: '2000-01-01', height: 175 },
    { id: 'frank-playmaker', name: 'Frank Playmaker', jerseyNumber: 10, position: 'Midfielder', photoUrl: 'https://placehold.co/400x500/1f2937/ffffff?text=Player', nationality: 'Argentina', dateOfBirth: '2000-01-01', height: 170 },
  ],
  'フォワード': [
    { id: 'gabriel-goalscorer', name: 'Gabriel Goalscorer', jerseyNumber: 9, position: 'Forward', photoUrl: 'https://placehold.co/400x500/1f2937/ffffff?text=Player', nationality: 'Nigeria', dateOfBirth: '2000-01-01', height: 185 },
    { id: 'harry-winger', name: 'Harry Winger', jerseyNumber: 11, position: 'Forward', photoUrl: 'https://placehold.co/400x500/1f2937/ffffff?text=Player', nationality: 'Belgium', dateOfBirth: '2000-01-01', height: 178 },
  ],
};

const PlayersPage = () => {
  return (
    <section>
      <h1 className="text-4xl font-bold mb-8 text-center">トップチーム</h1>
      {Object.entries(squadData).map(([position, players]) => (
        <div key={position} className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-500 pl-4">{position}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player as Player} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default PlayersPage;
