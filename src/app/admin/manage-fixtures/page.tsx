'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Fixture } from '@/types';
import Link from 'next/link';
import withAdminAuth from '@/components/withAdminAuth';

interface FixtureWithId extends Fixture {
  id: string;
}

const EditFixtureModal = ({ fixture, onClose, onSave }: { fixture: FixtureWithId; onClose: () => void; onSave: (updatedData: Partial<Fixture>) => void }) => {
  const [formData, setFormData] = useState<Partial<Fixture>>({
    date: fixture.date || '',
    homeTeam: fixture.homeTeam || '',
    awayTeam: fixture.awayTeam || '',
    competition: fixture.competition || '',
    matchWeek: fixture.matchWeek || undefined,
    time: fixture.time || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg text-gray-800">
        <h2 className="text-2xl font-bold mb-6">試合日程を編集</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">日付</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ホームチーム</label>
            <input type="text" name="homeTeam" value={formData.homeTeam} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">アウェイチーム</label>
            <input type="text" name="awayTeam" value={formData.awayTeam} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">大会</label>
            <input type="text" name="competition" value={formData.competition} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">節</label>
            <input type="number" name="matchWeek" value={formData.matchWeek || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">時間</label>
            <input type="time" name="time" value={formData.time} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">キャンセル</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageFixturesPageInternal = () => {
  const [fixtures, setFixtures] = useState<FixtureWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFixture, setEditingFixture] = useState<FixtureWithId | null>(null);

  const handleDelete = async (fixtureId: string) => {
    if (window.confirm('この試合日程を本当に削除しますか？')) {
      try {
        await deleteDoc(doc(db, 'fixtures', fixtureId));
        setFixtures(fixtures.filter((fixture) => fixture.id !== fixtureId));
      } catch (err) {
        setError('削除に失敗しました。');
        console.error(err);
      }
    }
  };

  const handleOpenModal = (fixture: FixtureWithId) => {
    setEditingFixture(fixture);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingFixture(null);
    setIsModalOpen(false);
  };

  const handleSaveFixture = async (updatedData: Partial<Fixture>) => {
    if (!editingFixture) return;

    const fixtureRef = doc(db, 'fixtures', editingFixture.id);
    try {
      await updateDoc(fixtureRef, updatedData);
      setFixtures(fixtures.map(f => 
        f.id === editingFixture.id ? { ...f, ...updatedData } : f
      ));
      handleCloseModal();
    } catch (err) {
      setError('更新に失敗しました。');
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const fixturesQuery = query(collection(db, 'fixtures'), orderBy('date', 'asc'));
        const querySnapshot = await getDocs(fixturesQuery);
        const fixturesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Fixture),
        }));
        setFixtures(fixturesData);
      } catch (err) {
        setError('試合日程の読み込みに失敗しました。');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">試合日程の管理</h1>
        <nav className="flex gap-4 flex-wrap">
          <Link href="/admin" className="text-blue-400 hover:underline">ダッシュボード</Link>
          <Link href="/admin/players" className="text-blue-400 hover:underline">選手管理</Link>
          <Link href="/admin/seasons" className="text-blue-400 hover:underline">シーズン管理</Link>
          <Link href="/admin/manage-fixtures" className="text-blue-400 hover:underline font-bold">試合日程の管理</Link>
          <Link href="/admin/migrate-players" className="text-yellow-400 hover:underline">シーズンデータ移行</Link>
          <Link href="/admin/fix-matches" className="text-orange-400 hover:underline">試合データ修正</Link>
        </nav>
      </div>

      {loading && <p>読み込み中...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">対戦カード</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">大会</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fixtures.map((fixture) => (
                  <tr key={fixture.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fixture.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {fixture.homeTeam} vs {fixture.awayTeam}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fixture.competition} {fixture.matchWeek && `第${fixture.matchWeek}節`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenModal(fixture)} className="text-indigo-600 hover:text-indigo-900 mr-4">編集</button>
                      <button onClick={() => handleDelete(fixture.id)} className="text-red-600 hover:text-red-900">削除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && editingFixture && (
        <EditFixtureModal 
          fixture={editingFixture}
          onClose={handleCloseModal}
          onSave={handleSaveFixture}
        />
      )}
    </div>
  );
};

const ManageFixturesPage = withAdminAuth(ManageFixturesPageInternal);

export default ManageFixturesPage;
