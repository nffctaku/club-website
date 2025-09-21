'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface PlayerStat {
  name: string;
  value: number;
  imageUrl: string;
}

interface PlayerStatRowProps extends PlayerStat {
  isRating?: boolean;
}

interface Competition {
  name: string;
  season: string;
  logo: string;
}

interface StatsCardProps {
  title: string;
  players: PlayerStat[];
  isRating?: boolean;
}

// --- Dummy Data ---
const dummyPlayers: { [key: string]: PlayerStat[] } = {
  scorers: [
    { name: 'Chris Wood', value: 2, imageUrl: 'https://placehold.co/100x100/ffffff/000000?text=CW' },
    { name: 'Callum Hudson-Odoi', value: 1, imageUrl: 'https://placehold.co/100x100/ffffff/000000?text=CHO' },
    { name: 'Dan Ndoye', value: 1, imageUrl: 'https://placehold.co/100x100/ffffff/000000?text=DN' },
  ],
  assists: [
    { name: 'Elliot Anderson', value: 1, imageUrl: 'https://placehold.co/100x100/ffffff/000000?text=EA' },
    { name: 'Morgan Gibbs-White', value: 1, imageUrl: 'https://placehold.co/100x100/ffffff/000000?text=MGW' },
    { name: 'Dan Ndoye', value: 1, imageUrl: 'https://placehold.co/100x100/ffffff/000000?text=DN' },
  ],
  contributions: [
    { name: 'Chris Wood', value: 2, imageUrl: 'https://placehold.co/100x100/ffffff/000000?text=CW' },
    { name: 'Dan Ndoye', value: 2, imageUrl: 'https://placehold.co/100x100/ffffff/000000?text=DN' },
    { name: 'Morgan Gibbs-White', value: 1, imageUrl: 'https://placehold.co/100x100/ffffff/000000?text=MGW' },
  ],
  ratings: [
    { name: 'Elliot Anderson', value: 7.29, imageUrl: 'https://placehold.co/100x100/ffffff/000000?text=EA' },
    { name: 'Ola Aina', value: 7.09, imageUrl: 'https://placehold.co/100x100/ffffff/000000?text=OA' },
    { name: 'Dan Ndoye', value: 6.98, imageUrl: 'https://placehold.co/100x100/ffffff/000000?text=DN' },
  ],
};

// --- Components ---

const PlayerStatRow: React.FC<PlayerStatRowProps> = ({ name, value, imageUrl, isRating = false }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center">
      <Image src={imageUrl} alt={name} width={32} height={32} className="rounded-full mr-3" />
      <span className="text-gray-800 dark:text-gray-200">{name}</span>
    </div>
    <span className={`font-bold text-lg ${isRating ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'} rounded-full px-3 py-1`}>
      {value}
    </span>
  </div>
);

const StatsCard: React.FC<StatsCardProps> = ({ title, players, isRating = false }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h3>
      <FaChevronRight className="text-gray-400" />
    </div>
    <div className="space-y-1">
      {players.length > 0 ? (
        players.map(player => (
          <PlayerStatRow key={player.name} {...player} isRating={isRating} />
        ))
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">記録なし</p>
      )}
    </div>
  </div>
);

const competitions: Competition[] = [
  { name: 'Premier League', season: '2025/2026', logo: '/PremiereLeague.png' },
  { name: 'FA Cup', season: '2025/2026', logo: '/FA杯.png' },
  { name: 'EFL Cup', season: '2025/2026', logo: '/EFLCIP.png' },
  { name: 'Europa League', season: '2025/2026', logo: '/EuropeLeague.png' },
  { name: '親善試合', season: '2025', logo: '/親善試合.png' },
];

const StatsPage = () => {
  const [activeTab, setActiveTab] = useState('選手');
  const [selectedCompetition, setSelectedCompetition] = useState<Competition>(competitions[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCompetitionSelect = (competition: Competition) => {
    setSelectedCompetition(competition);
    setIsDropdownOpen(false);
    // Later, you will trigger data refetching here
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 dark:bg-gray-900">
      {/* Header Controls */}
      <div className="relative inline-block text-left mb-6">
        <div>
          <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="inline-flex items-center justify-center w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-red-500">
            <Image src={selectedCompetition.logo} alt={selectedCompetition.name} width={24} height={24} />
            <span className="mx-2 font-semibold">{selectedCompetition.name} {selectedCompetition.season}</span>
            <FaChevronDown className="-mr-1 ml-2 h-5 w-5" />
          </button>
        </div>
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
            >
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {competitions.map((comp) => (
                  <a
                    key={comp.name}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCompetitionSelect(comp);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <Image src={comp.logo} alt={comp.name} width={20} height={20} />
                    <span className="ml-3">{comp.name} {comp.season}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-300 dark:border-gray-700">
          <button 
            onClick={() => setActiveTab('選手')}
            className={`px-4 py-2 font-semibold ${activeTab === '選手' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500'}`}>
            選手
          </button>
          <button 
            onClick={() => setActiveTab('チーム')}
            className={`px-4 py-2 font-semibold ${activeTab === 'チーム' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500'}`}>
            チーム
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">重要スタッツ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard title="得点王" players={[]} />
        <StatsCard title="アシスト" players={[]} />
        <StatsCard title="ゴール+アシスト数" players={[]} />
        <StatsCard title="平均評価" players={[]} isRating={true} />
      </div>

      {/* Restored Sections */}
      <div className="space-y-8 mt-8">
        <div className="bg-gray-800 dark:bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 border-l-4 border-amber-500 pl-4 text-white">獲得タイトル</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>プレミアリーグ (1回): 1977/1978</li>
            <li>チャンピオンシップ (3回): 1997/1998, 1921/1922, 1906/1907</li>
            <li>チャンピオンズリーグ (2回): 1979/1980, 1978/1979</li>
            <li>コミュニティ・シールド (1回): 1978/1979</li>
            <li>FAカップ (2回): 1958/1959, 1897/1898</li>
            <li>EFLカップ (4回): 1989/1990, 1988/1989, 1978/1979, 1977/1978</li>
            <li>UEFAスーパーカップ (1回): 1979/1980</li>
          </ul>
        </div>

        <div className="bg-gray-800 dark:bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 border-l-4 border-amber-500 pl-4 text-white">シーズン成績</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700/50 dark:bg-gray-950/50">
                <tr>
                  <th scope="col" className="px-6 py-3">シーズン</th>
                  <th scope="col" className="px-6 py-3">リーグ</th>
                  <th scope="col" className="px-6 py-3 text-center">順位</th>
                  <th scope="col" className="px-6 py-3">得点王</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-6 py-4">2024/25</td><td className="px-6 py-4">プレミアリーグ</td><td className="px-6 py-4 text-center">7位</td><td className="px-6 py-4">-</td></tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-6 py-4">2023/24</td><td className="px-6 py-4">プレミアリーグ</td><td className="px-6 py-4 text-center">17位</td><td className="px-6 py-4">-</td></tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-6 py-4">2022/23</td><td className="px-6 py-4">プレミアリーグ</td><td className="px-6 py-4 text-center">16位</td><td className="px-6 py-4">-</td></tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50 bg-green-900/30"><td className="px-6 py-4">2021/22</td><td className="px-6 py-4">チャンピオンシップ</td><td className="px-6 py-4 text-center">4位 (昇格)</td><td className="px-6 py-4">-</td></tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-6 py-4">2020/21</td><td className="px-6 py-4">チャンピオンシップ</td><td className="px-6 py-4 text-center">17位</td><td className="px-6 py-4">-</td></tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-6 py-4">2019/20</td><td className="px-6 py-4">チャンピオンシップ</td><td className="px-6 py-4 text-center">7位</td><td className="px-6 py-4">-</td></tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-6 py-4">2018/19</td><td className="px-6 py-4">チャンピオンシップ</td><td className="px-6 py-4 text-center">9位</td><td className="px-6 py-4">-</td></tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-6 py-4">2017/18</td><td className="px-6 py-4">チャンピオンシップ</td><td className="px-6 py-4 text-center">17位</td><td className="px-6 py-4">-</td></tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-6 py-4">2016/17</td><td className="px-6 py-4">チャンピオンシップ</td><td className="px-6 py-4 text-center">21位</td><td className="px-6 py-4">-</td></tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-6 py-4">2015/16</td><td className="px-6 py-4">チャンピオンシップ</td><td className="px-6 py-4 text-center">16位</td><td className="px-6 py-4">-</td></tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-6 py-4">2014/15</td><td className="px-6 py-4">チャンピオンシップ</td><td className="px-6 py-4 text-center">14位</td><td className="px-6 py-4">-</td></tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-6 py-4">2013/14</td><td className="px-6 py-4">チャンピオンシップ</td><td className="px-6 py-4 text-center">11位</td><td className="px-6 py-4">-</td></tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-6 py-4">2012/13</td><td className="px-6 py-4">チャンピオンシップ</td><td className="px-6 py-4 text-center">8位</td><td className="px-6 py-4">-</td></tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-6 py-4">2011/12</td><td className="px-6 py-4">チャンピオンシップ</td><td className="px-6 py-4 text-center">19位</td><td className="px-6 py-4">-</td></tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-6 py-4">2010/11</td><td className="px-6 py-4">チャンピオンシップ</td><td className="px-6 py-4 text-center">6位</td><td className="px-6 py-4">-</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
