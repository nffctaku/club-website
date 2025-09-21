'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Fixture } from '@/types';
import Image from 'next/image';
import { getTeamLogo } from '@/lib/teamLogos';
import { FaSpinner, FaCalendarAlt } from 'react-icons/fa';

const FixtureRow = ({ fixture }: { fixture: Fixture }) => {
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '日付未定';
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}月${day}日(${dayOfWeek})`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center justify-between transition-all hover:shadow-lg hover:scale-[1.01]">
      <div className="flex items-center space-x-3 w-1/4">
        <FaCalendarAlt className="text-red-500" />
        <div className="flex flex-col">
          <span className="font-bold text-gray-800 dark:text-gray-200">{formatDisplayDate(fixture.date)}</span>
          <span className="text-sm text-gray-500">{fixture.time || '時間未定'}</span>
        </div>
      </div>
      
      <div className="flex-grow flex items-center justify-center space-x-4">
        <span className={`font-bold text-lg text-right w-2/5 ${fixture.venue === 'Home' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{fixture.homeTeam}</span>
        <Image src={getTeamLogo(fixture.homeTeam.trim())} alt={fixture.homeTeam} width={32} height={32} />
        <span className="text-gray-400 dark:text-gray-500 text-lg font-mono">vs</span>
        <Image src={getTeamLogo(fixture.awayTeam.trim())} alt={fixture.awayTeam} width={32} height={32} />
        <span className={`font-bold text-lg text-left w-2/5 ${fixture.venue === 'Away' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{fixture.awayTeam}</span>
      </div>

      <div className="w-1/4 text-right text-sm text-gray-500 dark:text-gray-400">
        {fixture.competition}
      </div>
    </div>
  );
};


const FixturesPage = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFixtures = async () => {
      setIsLoading(true);
      try {
        const fixturesCollection = collection(db, 'fixtures');
        const ourTeamName = 'Nottm Forest';

        const homeQuery = query(fixturesCollection, where('homeTeam', '==', ourTeamName));
        const awayQuery = query(fixturesCollection, where('awayTeam', '==', ourTeamName));

        const [homeSnapshot, awaySnapshot] = await Promise.all([
          getDocs(homeQuery),
          getDocs(awayQuery),
        ]);

        const homeFixtures = homeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Fixture[];
        const awayFixtures = awaySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Fixture[];

        const allFixtures = [...homeFixtures, ...awayFixtures];
        const uniqueFixtures = Array.from(new Map(allFixtures.map(f => [f.id, f])).values());
        
        // **ここが最終修正点です！日付が空の試合（一括登録分）を除外します。**
        const manuallyEnteredFixtures = uniqueFixtures.filter(f => f.date && f.date !== '');

        manuallyEnteredFixtures.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateA - dateB;
        });
        
        setFixtures(manuallyEnteredFixtures);
      } catch (error) {
        console.error('Error fetching fixtures:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFixtures();
  }, []);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white tracking-tight">試合日程</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Nottm Forestの今後の試合</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-5xl text-red-500" />
          </div>
        ) : fixtures.length > 0 ? (
          <div className="space-y-4">
            {fixtures.map(fixture => (
              <FixtureRow key={fixture.id} fixture={fixture} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">登録されている試合日程はありません。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FixturesPage;