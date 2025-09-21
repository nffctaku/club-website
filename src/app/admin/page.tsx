'use client';

import Link from 'next/link';
import { FaDatabase } from 'react-icons/fa';
import withAdminAuth from '@/components/withAdminAuth';
import NewsAdmin from '@/components/NewsAdmin';
import YoutubeAdmin from '@/components/YoutubeAdmin';

const AdminPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">管理画面</h1>
        <nav className="flex gap-4">
          <Link href="/admin" className="text-blue-400 hover:underline">ダッシュボード</Link>
          <Link href="/admin/players" className="text-blue-400 hover:underline">選手管理</Link>
          <Link href="/admin/seasons" className="text-blue-400 hover:underline">シーズン管理</Link>
          <Link href="/admin/manage-fixtures" className="text-blue-400 hover:underline">試合日程の管理</Link>
          <Link href="/admin/migrate-players" className="text-yellow-400 hover:underline">シーズンデータ移行</Link>
          <Link href="/admin/fix-matches" className="text-orange-400 hover:underline">試合データ修正</Link>
        </nav>
      </div>
      <NewsAdmin />
      <YoutubeAdmin />
    </div>
  );
};

export default withAdminAuth(AdminPage);