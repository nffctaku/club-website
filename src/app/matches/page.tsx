'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import Image from 'next/image';
import { getTeamLogo } from '@/lib/teamLogos';
import { MatchRecord, Fixture } from '@/types';
import { FaSpinner } from 'react-icons/fa';

interface DisplayMatch extends Fixture {
  isResult: boolean;
  scoreHome?: number;
  scoreAway?: number;
}

const MatchRow = ({ match }: { match: DisplayMatch }) => {
  const getScoreColor = (score1: number, score2: number) => {
    if (score1 > score2) return 'bg-green-500';
    if (score1 < score2) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '日付未定';
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}月${day}日(${dayOfWeek})`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center justify-between">
      <div className="text-sm text-gray-600 dark:text-gray-400 w-1/6">
        {formatDisplayDate(match.date)}
      </div>
      <div className="flex-grow flex items-center justify-center space-x-4">
        <span className="font-semibold text-right w-2/5 text-gray-800 dark:text-gray-200">{match.homeTeam}</span>
        <Image src={getTeamLogo(match.homeTeam.trim())} alt={match.homeTeam} width={28} height={28} />
        
        {match.isResult ? (
          <div className="flex items-center font-bold text-white text-lg">
            <span className={`px-3 py-1 rounded-l-md ${getScoreColor(match.scoreHome!, match.scoreAway!)}`}>{match.scoreHome}</span>
            <span className={`px-3 py-1 rounded-r-md ${getScoreColor(match.scoreAway!, match.scoreHome!)}`}>{match.scoreAway}</span>
          </div>
        ) : (
          <div className="text-lg font-bold text-gray-400 dark:text-gray-500">
            {match.time || 'vs'}
          </div>
        )}

        <Image src={getTeamLogo(match.awayTeam.trim())} alt={match.awayTeam} width={28} height={28} />
        <span className="font-semibold text-left w-2/5 text-gray-800 dark:text-gray-200">{match.awayTeam}</span>
      </div>
      <div className="text-xs text-gray-500 w-1/6 text-right">
        {match.competition}
      </div>
    </div>
  );
};

const PremierLeagueSection = ({ matches }: { matches: DisplayMatch[] }) => {
  const groupedByWeek = useMemo(() => {
    return matches.reduce((acc, match) => {
      const week = match.matchWeek || 'N/A';
      if (!acc[week]) acc[week] = [];
      acc[week].push(match);
      return acc;
    }, {} as { [key: string]: DisplayMatch[] });
  }, [matches]);

  return (
    <div className="space-y-8">
      {Object.keys(groupedByWeek).sort((a, b) => Number(a) - Number(b)).map(week => (
        <div key={week}>
          <h3 className="text-xl font-semibold mb-3 text-gray-600 dark:text-gray-400">第{week}節</h3>
          <div className="space-y-4">
            {groupedByWeek[week].map(match => <MatchRow key={match.id} match={match} />)}
          </div>
        </div>
      ))}
    </div>
  );
};

const MatchesPage = () => {
  const [allMatches, setAllMatches] = useState<DisplayMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setIsLoading(true);
      try {
        const fixturesQuery = query(collection(db, 'fixtures'));
        const matchesQuery = query(collection(db, 'matches'));
        
        const [fixturesSnapshot, matchesSnapshot] = await Promise.all([
          getDocs(fixturesQuery),
          getDocs(matchesQuery),
        ]);

        const allFixtures = fixturesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Fixture[];
        const allMatchesData = matchesSnapshot.docs.map(doc => doc.data() as MatchRecord);

        const resultsMap = new Map<string, MatchRecord>();
        allMatchesData.forEach(match => {
          const key = `${match.matchWeek}-${match.homeTeam}-${match.awayTeam}`;
          resultsMap.set(key, match);
        });

        const combinedData = allFixtures.map(fixture => {
          const key = `${fixture.matchWeek}-${fixture.homeTeam}-${fixture.awayTeam}`;
          const result = resultsMap.get(key);
          return {
            ...fixture,
            isResult: !!result,
            scoreHome: result?.scoreHome,
            scoreAway: result?.scoreAway,
          };
        });
        
        setAllMatches(combinedData);

      } catch (error) {
        console.error("Error fetching and processing data: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndProcessData();
  }, []);

  const groupedByCompetition = useMemo(() => {
    return allMatches.reduce((acc, match) => {
      const competition = match.competition || 'Unknown';
      if (!acc[competition]) acc[competition] = [];
      acc[competition].push(match);
      return acc;
    }, {} as { [key: string]: DisplayMatch[] });
  }, [allMatches]);
  
  const competitionOrder = ['Premier League', 'FA Cup', 'EFL Cup', 'Champions League', 'Europa League', 'Friendly'];

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">試合日程・結果</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-20"><FaSpinner className="animate-spin mx-auto text-5xl text-red-500" /></div>
        ) : (
          <div className="space-y-12">
            {Object.keys(groupedByCompetition).sort((a, b) => competitionOrder.indexOf(a) - competitionOrder.indexOf(b)).map(competition => (
              <section key={competition}>
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 border-l-4 border-red-500 pl-4">
                  {competition}
                </h2>
                {competition === 'Premier League' ? (
                  <PremierLeagueSection matches={groupedByCompetition[competition]} />
                ) : (
                  <div className="space-y-4">
                    {groupedByCompetition[competition]
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map(match => <MatchRow key={match.id} match={match} />)}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;



