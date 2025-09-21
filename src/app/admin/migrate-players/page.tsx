'use client';

import { useState } from 'react';
import withAdminAuth from '@/components/withAdminAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import toast from 'react-hot-toast';

const MigratePlayersPage = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState('');

  const handleMigration = async () => {
    if (!confirm('すべての選手データに "season: 2025-2026" を追加します。この操作は元に戻せません。よろしいですか？')) {
      return;
    }

    setIsMigrating(true);
    setMigrationResult('');

    try {
      const playersCollection = collection(db, 'players');
      const playersSnapshot = await getDocs(playersCollection);

      if (playersSnapshot.empty) {
        toast.error('選手データが見つかりません。');
        setMigrationResult('選手データが見つかりませんでした。');
        setIsMigrating(false);
        return;
      }

      const batch = writeBatch(db);
      let migratedCount = 0;

      playersSnapshot.docs.forEach(doc => {
        // 既にseasonフィールドがある場合はスキップ
        if (!doc.data().season) {
          batch.update(doc.ref, { season: '2025-2026' });
          migratedCount++;
        }
      });

      if (migratedCount === 0) {
        setMigrationResult('すべての選手に既にシーズンフィールドが存在します。移行は不要です。');
        toast.success('移行は不要です。');
        setIsMigrating(false);
        return;
      }

      await batch.commit();
      
      const resultMessage = `${migratedCount}人の選手データを更新し、シーズン「2025-2026」を割り当てました。`;
      setMigrationResult(resultMessage);
      toast.success('データ移行が完了しました！');

    } catch (error) {
      console.error("Migration failed: ", error);
      const errorMessage = 'データ移行中にエラーが発生しました。';
      setMigrationResult(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">選手データ シーズン移行ツール</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <p className="text-gray-300 mb-4">
          このツールは、既存のすべての選手データに、現在のシーズンである「2025-2026」を割り当てるためのものです。
          <br />
          この操作は、今後のシーズン別データ管理機能に必要です。
        </p>
        <p className="text-yellow-400 mb-6">
          <strong>注意:</strong> この操作は一度だけ実行してください。実行すると、`season`フィールドがないすべての選手ドキュメントが更新されます。
        </p>

        <button 
          onClick={handleMigration}
          disabled={isMigrating}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isMigrating ? '移行中...' : 'シーズンデータ（2025-2026）を割り当てる'}
        </button>

        {migrationResult && (
          <div className="mt-6 p-4 bg-gray-700 rounded-md">
            <p className="text-white whitespace-pre-wrap">{migrationResult}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default withAdminAuth(MigratePlayersPage);
