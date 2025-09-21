'use client';

import { useState, useEffect } from 'react';
import withAdminAuth from '@/components/withAdminAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, doc, updateDoc, query, orderBy, writeBatch } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface Season {
  id: string;
  name: string;
  isCurrent: boolean;
}

const SeasonsAdminPage = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [newSeasonName, setNewSeasonName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSeasons = async () => {
    setIsLoading(true);
    try {
      const seasonsCollection = collection(db, 'seasons');
      const q = query(seasonsCollection, orderBy('name', 'desc'));
      const seasonsSnapshot = await getDocs(q);
      const seasonsData = seasonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Season[];
      setSeasons(seasonsData);
    } catch (error) {
      toast.error('シーズンの読み込みに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasons();
  }, []);

  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeasonName.match(/^\d{4}-\d{4}$/)) {
      toast.error('シーズン名は「YYYY-YYYY」形式で入力してください。例: 2025-2026');
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'seasons'), {
        name: newSeasonName,
        isCurrent: false, // 新しく追加するシーズンはデフォルトで「現在」ではない
        // createdAt: serverTimestamp(), // Temporarily commented out for debugging
      });
      setNewSeasonName('');
      toast.success('新しいシーズンを追加しました。');
      fetchSeasons();
    } catch (error) {
      toast.error('シーズンの追加に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetCurrentSeason = async (seasonIdToSet: string) => {
    if (seasons.length === 0) {
      toast.error('シーズンが見つかりません。');
      return;
    }

    const batch = writeBatch(db);

    // Find the current season and set it to false
    const currentSeason = seasons.find(s => s.isCurrent);
    if (currentSeason) {
      const currentSeasonRef = doc(db, 'seasons', currentSeason.id);
      batch.update(currentSeasonRef, { isCurrent: false });
    }

    // Set the new season to true
    const newCurrentSeasonRef = doc(db, 'seasons', seasonIdToSet);
    batch.update(newCurrentSeasonRef, { isCurrent: true });

    try {
      await batch.commit();
      toast.success('現在のシーズンを更新しました。');
      fetchSeasons(); // Re-fetch to update the UI
    } catch (error) {
      console.error('Failed to set current season: ', error);
      toast.error('現在のシーズンの更新に失敗しました。');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">シーズン管理</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4 text-white">新しいシーズンを追加</h2>
        <form onSubmit={handleAddSeason} className="flex gap-4">
          <input
            type="text"
            value={newSeasonName}
            onChange={(e) => setNewSeasonName(e.target.value)}
            placeholder="例: 2026-2027"
            className="flex-grow bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:bg-gray-500">
            {isSubmitting ? '追加中...' : '追加'}
          </button>
        </form>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white">シーズン一覧</h2>
        {isLoading ? (
          <p className="text-gray-300">読み込み中...</p>
        ) : (
          <ul className="space-y-2">
            {seasons.map(season => (
              <li key={season.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                <span className={`font-bold ${season.isCurrent ? 'text-green-400' : 'text-white'}`}>
                  {season.name} {season.isCurrent && '(現在のシーズン)'}
                </span>
                {!season.isCurrent && (
                  <button onClick={() => handleSetCurrentSeason(season.id)} className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded transition">
                    現在のシーズンに設定
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default withAdminAuth(SeasonsAdminPage);
