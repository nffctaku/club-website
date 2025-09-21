'use client';

import { useState } from 'react';
import withAdminAuth from '@/components/withAdminAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, query, where } from 'firebase/firestore';
import toast from 'react-hot-toast';

const FixMatchesPage = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState('');

  const handleFix = async () => {
    if (!confirm('既存の試合データにシーズン情報「2025-2026」を追加します。この操作は一度だけ実行してください。よろしいですか？')) {
      return;
    }

    setIsFixing(true);
    setFixResult('');

    try {
      const matchesCollection = collection(db, 'matches');
      // Get ALL match documents to forcefully update them
      const snapshot = await getDocs(matchesCollection);

      if (snapshot.empty) {
        const msg = '試合データが1件も登録されていません。';
        setFixResult(msg);
        toast.error(msg);
        setIsFixing(false);
        return;
      }

      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        // Force update the season field for every document
        batch.update(doc.ref, { season: '2025-2026' });
      });

      await batch.commit();
      
      const resultMessage = `${snapshot.size}件のすべての試合データを走査し、シーズンを「2025-2026」に強制的に更新しました。`;
      setFixResult(resultMessage);
      toast.success('データ修正が完了しました！');

    } catch (error) {
        // Fallback query for environments where '!=' or 'not-in' might be restricted
        // This part is a bit more complex and might be needed if the above fails.
        // For now, we assume the simple query works. A more robust solution would fetch all and filter client-side.
        console.error("Data fix failed: ", error);
        const errorMessage = 'データ修正中にエラーが発生しました。コンソールを確認してください。';
        setFixResult(errorMessage);
        toast.error(errorMessage);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">試合データ修正ツール</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <p className="text-gray-300 mb-4">
          このツールは、過去に登録された試合データにシーズン情報が欠落している問題を修正するためのものです。
        </p>
        <p className="text-yellow-400 mb-6">
          <strong>注意:</strong> このボタンを押すと、シーズン情報がない全ての試合に「2025-2026」が割り当てられます。通常は一度だけ実行してください。
        </p>

        <button 
          onClick={handleFix}
          disabled={isFixing}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isFixing ? '修正中...' : '全試合のシーズンを「2025-2026」に強制更新する'}
        </button>

        {fixResult && (
          <div className="mt-6 p-4 bg-gray-700 rounded-md">
            <p className="text-white whitespace-pre-wrap">{fixResult}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default withAdminAuth(FixMatchesPage);
