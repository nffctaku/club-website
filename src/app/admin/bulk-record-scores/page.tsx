'use client';

import { useState, useEffect } from 'react';
import withAdminAuth from '@/components/withAdminAuth';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { Fixture } from '@/types';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';

const BulkRecordScoresPage = () => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [fixtures, setFixtures] = useState<(Fixture & { id: string })[]>([]);
  const [scores, setScores] = useState<{ [key: string]: { home: string; away: string } }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);

  // State for manual entry mode
  const [manualMatches, setManualMatches] = useState(() => 
    Array.from({ length: 10 }, (_, i) => ({ id: `manual-${i}`, homeTeam: '', awayTeam: '', competition: 'Premier League', date: '' }))
  );

  const totalWeeks = 38;

  useEffect(() => {
    const fetchFixturesForWeek = async () => {
      if (selectedWeek === null) return;
      setIsLoading(true);
      try {
        const fixturesCollection = collection(db, 'fixtures');
        let q;
        if (selectedWeek > 0) {
          // Fetching a specific league week
          q = query(fixturesCollection, where('matchWeek', '==', selectedWeek));
        } else {
          // Fetching non-league games (Cup games, etc.)
          q = query(fixturesCollection, where('competition', '!=', 'Premier League'));
        }
        const snapshot = await getDocs(q);
        const weekFixtures = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() })) as (Fixture & { id: string })[];
        
        weekFixtures.sort((a, b) => a.homeTeam.localeCompare(b.homeTeam));

        if (isManualMode) {
          // MANUAL MODE: Populate the form with existing fixtures
          const existingMatches = weekFixtures.map(f => ({
            id: f.id,
            homeTeam: f.homeTeam,
            awayTeam: f.awayTeam,
            competition: f.competition,
            date: f.date,
          }));

          const emptyRows = Array.from({ length: Math.max(0, 10 - existingMatches.length) }, (_, i) => ({
            id: `manual-new-${i}`, homeTeam: '', awayTeam: '', competition: 'Premier League', date: ''
          }));

          setManualMatches([...existingMatches, ...emptyRows]);

        } else {
          // NORMAL MODE: Populate fixtures for score entry
          setFixtures(weekFixtures);
          const initialScores: { [key: string]: { home: string; away: string } } = {};
          weekFixtures.forEach(f => {
            initialScores[f.id] = { home: '', away: '' };
          });
          setScores(initialScores);
        }

      } catch (error) {
        console.error(`Error fetching fixtures for week ${selectedWeek}:`, error);
        toast.error(`第${selectedWeek}節の日程読み込みに失敗しました。`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFixturesForWeek();
  }, [selectedWeek, isManualMode]);

  const handleScoreChange = (fixtureId: string, team: 'home' | 'away', value: string) => {
    setScores(prev => ({
      ...prev,
      [fixtureId]: {
        ...prev[fixtureId],
        [team]: value,
      },
    }));
  };

  const handleManualMatchChange = (index: number, field: 'homeTeam' | 'awayTeam' | 'competition' | 'date', value: string) => {
    const newMatches = [...manualMatches];
    newMatches[index][field] = value;
    setManualMatches(newMatches);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let itemsAdded = 0;

    if (isManualMode) {
      // MANUAL MODE: Overwrite fixtures for the selected week.
      try {
        const fixturesCollection = collection(db, 'fixtures');
        let q;
        if (selectedWeek > 0) {
          q = query(fixturesCollection, where('matchWeek', '==', selectedWeek));
        } else {
          q = query(fixturesCollection, where('competition', '!=', 'Premier League'));
        }
        const snapshot = await getDocs(q);
        
        const deleteBatch = writeBatch(db);
        snapshot.docs.forEach(doc => {
          deleteBatch.delete(doc.ref);
        });
        await deleteBatch.commit();

        const addBatch = writeBatch(db);
        for (const match of manualMatches) {
          if (match.homeTeam && match.awayTeam) {
            const fixtureDocRef = doc(fixturesCollection);
            const newFixture: Omit<Fixture, 'id' | 'matchWeek'> = {
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              competition: match.competition,
              date: match.date,
              time: '', // Time can be added later
              createdAt: serverTimestamp(),
            };

            if (selectedWeek > 0) {
              (newFixture as Fixture).matchWeek = selectedWeek;
            }
            addBatch.set(fixtureDocRef, newFixture);
            itemsAdded++;
          }
        }

        if (itemsAdded === 0) {
          toast.error('保存する対戦カードが入力されていません。');
          setIsSubmitting(false);
          return;
        }

        await addBatch.commit();
        toast.success(`第${selectedWeek}節の試合日程を${itemsAdded}件、上書き保存しました！`);

      } catch (error) {
        console.error("Error overwriting fixtures:", error);
        toast.error('試合日程の上書き保存に失敗しました。');
      } finally {
        setIsSubmitting(false);
      }

    } else {
      // NORMAL MODE: Save scores to the 'matches' collection
      const matchesCollection = collection(db, 'matches');
      const batch = writeBatch(db);
      for (const fixture of fixtures) {
        const score = scores[fixture.id];
        if (score && score.home && score.away) {
          const homeScore = parseInt(score.home, 10);
          const awayScore = parseInt(score.away, 10);

          if (!isNaN(homeScore) && !isNaN(awayScore)) {
            const matchDocRef = doc(matchesCollection);
            const newMatch = {
              competition: fixture.competition,
              date: fixture.date,
              season: '2025-2026',
              homeTeam: fixture.homeTeam,
              awayTeam: fixture.awayTeam,
              scoreHome: homeScore,
              scoreAway: awayScore,
              isHome: fixture.homeTeam === 'Nottm Forest',
              opponent: fixture.homeTeam === 'Nottm Forest' ? fixture.awayTeam : fixture.homeTeam,
              result: 'Draw', // Simplified
              matchWeek: selectedWeek,
              playerStats: [],
              teamStats: { possession: 0, shots: 0, shotsOnTarget: 0 },
            };
            batch.set(matchDocRef, newMatch);
            itemsAdded++;
          }
        }
      }

      if (itemsAdded === 0) {
        toast.error('保存するスコアが入力されていません。');
        setIsSubmitting(false);
        return;
      }

      try {
        await batch.commit();
        toast.success(`${itemsAdded}件の試合結果を保存しました！`);
      } catch (error) {
        console.error("Error saving match results:", error);
        toast.error('試合結果の保存に失敗しました。');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">一括スコア入力</h1>

      <div className="flex items-center justify-end mb-6">
        <span className="mr-3 text-sm font-medium text-gray-300">通常モード</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={isManualMode} onChange={() => setIsManualMode(!isManualMode)} className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
        </label>
        <span className="ml-3 text-sm font-medium text-gray-300">手動入力モード</span>
      </div>

      <div className="mb-6">
        <label htmlFor="week-selector" className="block text-sm font-medium text-gray-300 mb-2">節を選択:</label>
        <select 
          id="week-selector"
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
        >
          <option value="0">カップ戦など</option>
          {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(week => (
            <option key={week} value={week}>第{week}節</option>
          ))}
        </select>
      </div>

      {isManualMode ? (
        <div className="space-y-4">
          {manualMatches.map((match, index) => (
            <div key={match.id} className="bg-gray-800 p-4 rounded-lg grid grid-cols-12 gap-3 items-center">
              {/* Competition */}
              <select 
                value={match.competition}
                onChange={e => handleManualMatchChange(index, 'competition', e.target.value)}
                className="col-span-3 p-2 rounded bg-gray-700 border border-gray-600 text-sm"
              >
                <option>Premier League</option>
                <option>FA Cup</option>
                <option>EFL Cup</option>
                <option>Champions League</option>
                <option>Europa League</option>
                <option>Friendly</option>
              </select>

              {/* Home Team */}
              <select 
                value={match.homeTeam}
                onChange={e => handleManualMatchChange(index, 'homeTeam', e.target.value)}
                className="col-span-3 p-2 rounded bg-gray-700 border border-gray-600"
              >
                <option value="" disabled>ホーム...</option>
                {['Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds', 'Liverpool', 'Man City', 'Man Utd', 'Newcastle', 'Nottm Forest', 'Sunderland', 'Tottenham', 'West Ham', 'Wolves'].map(team => <option key={`${match.id}-h-${team}`} value={team}>{team}</option>)}
              </select>

              <span className="col-span-1 text-center text-gray-400">vs</span>

              {/* Away Team */}
              <select 
                value={match.awayTeam}
                onChange={e => handleManualMatchChange(index, 'awayTeam', e.target.value)}
                className="col-span-3 p-2 rounded bg-gray-700 border border-gray-600"
              >
                <option value="" disabled>アウェイ...</option>
                {['Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds', 'Liverpool', 'Man City', 'Man Utd', 'Newcastle', 'Nottm Forest', 'Sunderland', 'Tottenham', 'West Ham', 'Wolves'].map(team => <option key={`${match.id}-a-${team}`} value={team}>{team}</option>)}
              </select>

              {/* Date */}
              <input 
                type="date"
                value={match.date}
                onChange={e => handleManualMatchChange(index, 'date', e.target.value)}
                className="col-span-2 p-2 rounded bg-gray-700 border border-gray-600 text-sm"
              />
            </div>
          ))}
           <div className="mt-8">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded disabled:bg-gray-500 transition-colors"
            >
              {isSubmitting ? <FaSpinner className="animate-spin mx-auto" /> : `手動入力した日程を保存`}
            </button>
          </div>
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="text-center py-8"><FaSpinner className="animate-spin mx-auto text-2xl" /></div>
          ) : (
            <div className="space-y-4">
              {fixtures.map(fixture => (
                <div key={fixture.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex-grow">
                    <span className="font-bold text-lg">{fixture.homeTeam}</span>
                    <span className="mx-2">vs</span>
                    <span className="font-bold text-lg">{fixture.awayTeam}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={scores[fixture.id]?.home || ''}
                      onChange={e => handleScoreChange(fixture.id, 'home', e.target.value)}
                      className="w-16 p-2 text-center bg-gray-700 rounded"
                      placeholder="H"
                    />
                    <span>-</span>
                    <input 
                      type="number" 
                      value={scores[fixture.id]?.away || ''}
                      onChange={e => handleScoreChange(fixture.id, 'away', e.target.value)}
                      className="w-16 p-2 text-center bg-gray-700 rounded"
                      placeholder="A"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || fixtures.length === 0}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded disabled:bg-gray-500 transition-colors"
            >
              {isSubmitting ? <FaSpinner className="animate-spin mx-auto" /> : `第${selectedWeek}節のスコアを保存`}
            </button>
          </div>
        </>
      )}

    </div>
  );
};

export default withAdminAuth(BulkRecordScoresPage);
