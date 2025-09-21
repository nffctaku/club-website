'use client';

import { useState, useEffect } from 'react';
import PlayerCard from '@/components/PlayerCard';
import { Player } from '@/types'; // Import from unified types
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

interface Season {
  id: string;
  name: string;
  isCurrent: boolean;
}

const TeamsPage = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSeasonsAndPlayers = async () => {
      setIsLoading(true);
      try {
        // Fetch all seasons
        const seasonsCollection = collection(db, 'seasons');
        const seasonsQuery = query(seasonsCollection, orderBy('name', 'desc'));
        const seasonsSnapshot = await getDocs(seasonsQuery);
        const seasonsData = seasonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Season[];
        setSeasons(seasonsData);

        // Determine the current or latest season
        let seasonToFetch = '';
        if (seasonsData.length > 0) {
          const currentSeason = seasonsData.find(s => s.isCurrent);
          seasonToFetch = currentSeason ? currentSeason.name : seasonsData[0].name;
          setSelectedSeason(seasonToFetch);
        }

        // Fetch players for that season
        if (seasonToFetch) {
          await fetchPlayers(seasonToFetch);
        }

      } catch (error) {
        console.error("Error fetching initial data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeasonsAndPlayers();
  }, []);

  const fetchPlayers = async (season: string) => {
    try {
      const playersCollection = collection(db, 'players');
      const q = query(
        playersCollection, 
        where('season', '==', season),
        orderBy('jerseyNumber', 'asc')
      );
      const playersSnapshot = await getDocs(q);
      const playersData = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Player[];
      setPlayers(playersData);
    } catch (error) {
      console.error(`Error fetching players for season ${season}: `, error);
    }
  };

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSeason = e.target.value;
    setSelectedSeason(newSeason);
    setIsLoading(true);
    fetchPlayers(newSeason).finally(() => setIsLoading(false));
  };

  // Exclusive grouping of players by position to prevent duplicates
  let unclassifiedPlayers = [...players];

  const goalkeepers = unclassifiedPlayers.filter((p) => 
    p.position.toUpperCase().includes('GOALKEEPER') || p.position.toUpperCase().includes('GK')
  );
  unclassifiedPlayers = unclassifiedPlayers.filter(p => !goalkeepers.includes(p));

  const defenders = unclassifiedPlayers.filter((p) => 
    p.position.toUpperCase().includes('DEFENDER') || ['CB', 'RB', 'LB', 'DF'].some(pos => p.position.toUpperCase().includes(pos))
  );
  unclassifiedPlayers = unclassifiedPlayers.filter(p => !defenders.includes(p));

  const midfielders = unclassifiedPlayers.filter((p) => 
    p.position.toUpperCase().includes('MIDFIELDER') || ['DM', 'CM', 'AM', 'MF'].some(pos => p.position.toUpperCase().includes(pos))
  );
  unclassifiedPlayers = unclassifiedPlayers.filter(p => !midfielders.includes(p));

  // Any remaining players are considered forwards
  const forwards = [...unclassifiedPlayers];

  const renderPlayers = (players: Player[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );

  return (
    <div className="bg-red-800 min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">TEAMS</h1>
          {seasons.length > 0 && (
            <select 
              value={selectedSeason}
              onChange={handleSeasonChange}
              className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {seasons.map(season => (
                <option key={season.id} value={season.name}>
                  {season.name} {season.isCurrent && '(Current)'}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex space-x-2 border border-white rounded-full p-1">
            {['GOALKEEPERS', 'DEFENDERS', 'MIDFIELDERS', 'FORWARDS'].map((position) => (
              <button key={position} className="px-4 py-1.5 text-sm font-semibold rounded-full hover:bg-white hover:text-red-800 transition-colors duration-200">
                {position}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-lg">選手データを読み込んでいます...</p>
        ) : (
          <main>
            <section id="goalkeepers" className="mb-16">
              <h2 className="text-2xl font-bold mb-6 border-l-4 border-white pl-4">GOALKEEPERS</h2>
              {renderPlayers(goalkeepers)}
            </section>

            <section id="defenders" className="mb-16">
              <h2 className="text-2xl font-bold mb-6 border-l-4 border-white pl-4">DEFENDERS</h2>
              {renderPlayers(defenders)}
            </section>

            <section id="midfielders" className="mb-16">
              <h2 className="text-2xl font-bold mb-6 border-l-4 border-white pl-4">MIDFIELDERS</h2>
              {renderPlayers(midfielders)}
            </section>

            <section id="forwards">
              <h2 className="text-2xl font-bold mb-6 border-l-4 border-white pl-4">FORWARDS</h2>
              {renderPlayers(forwards)}
            </section>
          </main>
        )}
      </div>
    </div>
  );
};

export default TeamsPage;
