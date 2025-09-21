import PlayerCard from '@/components/PlayerCard';

const squad = {
  'ゴールキーパー': [
    { name: 'Alex Goalie', number: 1, position: 'Goalkeeper', imageUrl: 'https://placehold.co/400x500/1f2937/ffffff?text=Player', slug: 'alex-goalie' },
  ],
  'ディフェンダー': [
    { name: 'Ben Defender', number: 2, position: 'Defender', imageUrl: 'https://placehold.co/400x500/1f2937/ffffff?text=Player', slug: 'ben-defender' },
    { name: 'Chris Centreback', number: 5, position: 'Defender', imageUrl: 'https://placehold.co/400x500/1f2937/ffffff?text=Player', slug: 'chris-centreback' },
    { name: 'David Fullback', number: 3, position: 'Defender', imageUrl: 'https://placehold.co/400x500/1f2937/ffffff?text=Player', slug: 'david-fullback' },
  ],
  'ミッドフィールダー': [
    { name: 'Ethan Engine', number: 8, position: 'Midfielder', imageUrl: 'https://placehold.co/400x500/b91c1c/ffffff?text=Star', slug: 'ethan-engine' },
    { name: 'Frank Playmaker', number: 10, position: 'Midfielder', imageUrl: 'https://placehold.co/400x500/1f2937/ffffff?text=Player', slug: 'frank-playmaker' },
  ],
  'フォワード': [
    { name: 'Gabriel Goalscorer', number: 9, position: 'Forward', imageUrl: 'https://placehold.co/400x500/1f2937/ffffff?text=Player', slug: 'gabriel-goalscorer' },
    { name: 'Harry Winger', number: 11, position: 'Forward', imageUrl: 'https://placehold.co/400x500/1f2937/ffffff?text=Player', slug: 'harry-winger' },
  ],
};

const PlayersPage = () => {
  return (
    <section>
      <h1 className="text-4xl font-bold mb-8 text-center">トップチーム</h1>
      {Object.entries(squad).map(([position, players]) => (
        <div key={position} className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-500 pl-4">{position}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {players.map((player) => (
              <PlayerCard key={player.slug} {...player} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default PlayersPage;
