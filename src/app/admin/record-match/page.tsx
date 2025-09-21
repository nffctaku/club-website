'use client';

import { useState, FormEvent, useEffect } from 'react';
import withAdminAuth from '@/components/withAdminAuth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { FaSpinner, FaPlus, FaTrash } from 'react-icons/fa';
import { MatchRecord, PlayerStat, TeamStats, Player, Fixture } from '@/types';
import toast from 'react-hot-toast';

const initialPlayerStat: PlayerStat = { playerId: '', name: '', goals: 0, assists: 0, rating: 6.0 };
const initialTeamStats: TeamStats = { possession: 50, shots: 0, shotsOnTarget: 0 };

const premierLeagueTeams = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Burnley',
  'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds', 'Liverpool',
  'Man City', 'Man Utd', 'Newcastle', 'Nottm Forest', 'Sunderland',
  'Tottenham', 'West Ham', 'Wolves'
];

const RecordMatchPage = () => {
  // Master Data
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);

  // General State
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Basic Match Info
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [competition, setCompetition] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [scoreHome, setScoreHome] = useState(0);
  const [scoreAway, setScoreAway] = useState(0);
  const [season, setSeason] = useState('2025-2026'); // Default or fetch from seasons collection
  const [matchWeek, setMatchWeek] = useState<number | undefined>();

  // Team Stats
  const [teamStats, setTeamStats] = useState<TeamStats>(initialTeamStats);

  // Player Stats (Dynamic)
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([initialPlayerStat]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersCollection = collection(db, 'players');
        const q = query(playersCollection, orderBy('jerseyNumber', 'asc'));
        const playersSnapshot = await getDocs(q);
        const playersData = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Player[];
        setAllPlayers(playersData);
      } catch (error) {
        console.error("Error fetching players: ", error);
        toast.error('選手マスターの読み込みに失敗しました');
      }
    };
    const fetchFixtures = async () => {
      try {
        const fixturesCollection = collection(db, 'fixtures');
        const q = query(fixturesCollection, orderBy('date', 'desc'));
        const fixturesSnapshot = await getDocs(q);
        const fixturesData = fixturesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Fixture[];
        setFixtures(fixturesData);
      } catch (error) {
        console.error("Error fetching fixtures: ", error);
        toast.error('試合日程の読み込みに失敗しました');
      }
    };

    fetchPlayers();
    fetchFixtures();
  }, []);

  const handlePlayerSelectionChange = (index: number, selectedPlayerId: string) => {
    const selectedPlayer = allPlayers.find(p => p.id === selectedPlayerId);
    if (!selectedPlayer) return;

    const newStats = [...playerStats];
    newStats[index].playerId = selectedPlayer.id!;
    newStats[index].name = selectedPlayer.name;
    setPlayerStats(newStats);
  };

  const handlePlayerStatChange = (index: number, field: keyof PlayerStat, value: string | number) => {
    const newStats = [...playerStats];
    (newStats[index] as any)[field] = value;
    setPlayerStats(newStats);
  };

  const addPlayerStat = () => {
    setPlayerStats([...playerStats, { ...initialPlayerStat }]);
  };

  const removePlayerStat = (index: number) => {
    const newStats = playerStats.filter((_, i) => i !== index);
    setPlayerStats(newStats);
  };

  const handleTeamStatChange = (field: keyof TeamStats, value: string | number) => {
    setTeamStats(prev => ({ ...prev, [field]: Number(value) }));
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setCompetition('');
    setHomeTeam('');
    setAwayTeam('');
    setScoreHome(0);
    setScoreAway(0);
    setTeamStats(initialTeamStats);
    setPlayerStats([initialPlayerStat]);
  };

  const handleFixtureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFixtureId = e.target.value;
    const selectedFixture = fixtures.find(f => f.id === selectedFixtureId);
    // Also set matchWeek if available
    if (selectedFixture?.matchWeek) {
      setMatchWeek(selectedFixture.matchWeek);
    }

    if (selectedFixture) {
      setDate(selectedFixture.date);
      setCompetition(selectedFixture.competition);
      setHomeTeam(selectedFixture.homeTeam);
      setAwayTeam(selectedFixture.awayTeam);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!homeTeam || !awayTeam) {
      toast.error('ホームチームとアウェイチームを選択してください。');
      return;
    }

    setIsSubmitting(true);

    // Determine result ('Win', 'Draw', 'Loss') from the perspective of 'Nottm Forest' if they are playing.
    const isOurTeamPlaying = homeTeam === 'Nottm Forest' || awayTeam === 'Nottm Forest';
    const isHomeGame = homeTeam === 'Nottm Forest';
    let result: 'Win' | 'Draw' | 'Loss';

    if (isOurTeamPlaying) {
      if (isHomeGame) {
        if (scoreHome > scoreAway) result = 'Win';
        else if (scoreHome < scoreAway) result = 'Loss';
        else result = 'Draw';
      } else { // Away game
        if (scoreAway > scoreHome) result = 'Win';
        else if (scoreAway < scoreHome) result = 'Loss';
        else result = 'Draw';
      }
    } else {
      // For neutral games, result is from the home team's perspective.
      if (scoreHome > scoreAway) result = 'Win';
      else if (scoreHome < scoreAway) result = 'Loss';
      else result = 'Draw';
    }

    // For backward compatibility with other components that might use 'opponent'
    const opponentName = isOurTeamPlaying ? (isHomeGame ? awayTeam : homeTeam) : awayTeam;

    const newMatch: Omit<MatchRecord, 'id' | 'createdAt'> = {
      date,
      competition,
      opponent: opponentName,
      isHome: isHomeGame, // This is only true if our team is playing at home
      homeTeam, // from state
      awayTeam, // from state
      scoreHome: Number(scoreHome),
      scoreAway: Number(scoreAway),
      result,
      teamStats,
      playerStats: playerStats.filter(p => p.playerId),
      season,
      matchWeek,
    };

    try {
      await addDoc(collection(db, 'matches'), {
        ...newMatch,
        createdAt: serverTimestamp(),
      });
      toast.success('試合結果を記録しました！');
      resetForm();
    } catch (error) {
      console.error("Error adding match record: ", error);
      toast.error('記録の保存に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">試合結果を記録</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Fixture Selection Section */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">試合を選択</h2>
          <div className="flex flex-col">
            <label htmlFor="fixture-select" className="mb-2 font-semibold">記録する試合</label>
            <select
              id="fixture-select"
              onChange={handleFixtureChange}
              className="p-2 rounded bg-gray-700 border border-gray-600"
              defaultValue=""
            >
              <option value="" disabled>試合日程から選択...</option>
              {fixtures.map(fixture => (
                <option key={fixture.id} value={fixture.id!}>
                  {fixture.date} - {fixture.homeTeam} vs {fixture.awayTeam} ({fixture.competition})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">基本情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label htmlFor="date" className="mb-2 font-semibold">試合日</label>
              <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 rounded bg-gray-700 border border-gray-600" required />
            </div>
            <div className="flex flex-col">
              <label htmlFor="competition" className="mb-2 font-semibold">大会名</label>
              <input type="text" id="competition" value={competition} onChange={(e) => setCompetition(e.target.value)} placeholder="Premier League" className="p-2 rounded bg-gray-700 border border-gray-600" required />
            </div>
            <div className="flex flex-col">
              <label htmlFor="matchWeek" className="mb-2 font-semibold">節</label>
              <input type="number" id="matchWeek" onChange={(e) => setMatchWeek(parseInt(e.target.value, 10))} placeholder="1" className="p-2 rounded bg-gray-700 border border-gray-600" />
            </div>
            <div className="flex flex-col md:col-span-3">
              <label htmlFor="homeTeam" className="mb-2 font-semibold">ホームチーム</label>
              <select id="homeTeam" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} className="p-2 rounded bg-gray-700 border border-gray-600" required>
                <option value="" disabled>選択してください...</option>
                {premierLeagueTeams.map(team => <option key={team} value={team}>{team}</option>)}
              </select>
            </div>
            <div className="flex flex-col md:col-span-3">
              <label htmlFor="awayTeam" className="mb-2 font-semibold">アウェイチーム</label>
              <select id="awayTeam" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} className="p-2 rounded bg-gray-700 border border-gray-600" required>
                <option value="" disabled>選択してください...</option>
                {premierLeagueTeams.map(team => <option key={team} value={team}>{team}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col w-full"><label htmlFor="scoreHome" className="mb-2 font-semibold">ホームスコア</label><input type="number" id="scoreHome" value={scoreHome} onChange={(e) => setScoreHome(parseInt(e.target.value, 10))} className="p-2 rounded bg-gray-700 border border-gray-600" required /></div>
              <span className="text-2xl font-bold mt-8">-</span>
              <div className="flex flex-col w-full"><label htmlFor="scoreAway" className="mb-2 font-semibold">アウェイスコア</label><input type="number" id="scoreAway" value={scoreAway} onChange={(e) => setScoreAway(parseInt(e.target.value, 10))} className="p-2 rounded bg-gray-700 border border-gray-600" required /></div>
            </div>
          </div>
        </div>

        {/* Team Stats Section */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">チームスタッツ</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col"><label htmlFor="possession" className="mb-2 font-semibold">ポゼッション (%)</label><input type="number" id="possession" value={teamStats.possession} onChange={e => handleTeamStatChange('possession', e.target.value)} className="p-2 rounded bg-gray-700 border border-gray-600" /></div>
            <div className="flex flex-col"><label htmlFor="shots" className="mb-2 font-semibold">シュート数</label><input type="number" id="shots" value={teamStats.shots} onChange={e => handleTeamStatChange('shots', e.target.value)} className="p-2 rounded bg-gray-700 border border-gray-600" /></div>
            <div className="flex flex-col"><label htmlFor="shotsOnTarget" className="mb-2 font-semibold">枠内シュート数</label><input type="number" id="shotsOnTarget" value={teamStats.shotsOnTarget} onChange={e => handleTeamStatChange('shotsOnTarget', e.target.value)} className="p-2 rounded bg-gray-700 border border-gray-600" /></div>
          </div>
        </div>

        {/* Player Stats Section */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">選手スタッツ</h2>
          <div className="space-y-4">
            {playerStats.map((stat, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-4">
                  <label className="text-sm mb-1 block">選手名</label>
                  <select 
                    value={stat.playerId} 
                    onChange={e => handlePlayerSelectionChange(index, e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                  >
                    <option value="" disabled>選手を選択...</option>
                    {allPlayers.map(player => (
                      <option key={player.id} value={player.id!}>{player.jerseyNumber}. {player.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2"><label className="text-sm mb-1 block">得点</label><input type="number" value={stat.goals} onChange={e => handlePlayerStatChange(index, 'goals', parseInt(e.target.value))} className="w-full p-2 rounded bg-gray-700 border border-gray-600" /></div>
                <div className="col-span-2"><label className="text-sm mb-1 block">アシスト</label><input type="number" value={stat.assists} onChange={e => handlePlayerStatChange(index, 'assists', parseInt(e.target.value))} className="w-full p-2 rounded bg-gray-700 border border-gray-600" /></div>
                <div className="col-span-2"><label className="text-sm mb-1 block">評価点</label><input type="number" step="0.1" value={stat.rating} onChange={e => handlePlayerStatChange(index, 'rating', parseFloat(e.target.value))} className="w-full p-2 rounded bg-gray-700 border border-gray-600" /></div>
                <div className="col-span-2 flex justify-end">
                  {playerStats.length > 1 && <button type="button" onClick={() => removePlayerStat(index)} className="text-red-500 hover:text-red-400 p-2"><FaTrash /></button>}
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addPlayerStat} className="mt-4 flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold">
            <FaPlus /> 選手を追加
          </button>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded disabled:bg-gray-500">
          {isSubmitting ? <FaSpinner className="animate-spin mx-auto" /> : 'この内容で記録する'}
        </button>
      </form>
    </div>
  );
};

export default withAdminAuth(RecordMatchPage);
