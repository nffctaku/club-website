'use client';

import { useState, useEffect, FormEvent } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { FaSpinner } from 'react-icons/fa';
import { YoutubeLink } from '@/types';
import toast from 'react-hot-toast';

const YoutubeAdmin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [youtubeLinks, setYoutubeLinks] = useState<YoutubeLink[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoOrder, setVideoOrder] = useState(1);

  const fetchYoutubeLinks = async () => {
    setIsLoading(true);
    try {
      const linksCollection = collection(db, 'youtubeLinks');
      const q = query(linksCollection, orderBy('order', 'asc'));
      const linksSnapshot = await getDocs(q);
      const linksData = linksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as YoutubeLink[];
      setYoutubeLinks(linksData);
      setVideoOrder(linksData.length > 0 ? Math.max(...linksData.map(l => l.order)) + 1 : 1);
    } catch (error) {
      console.error("Error fetching YouTube links: ", error);
      toast.error('YouTubeリンクの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchYoutubeLinks();
  }, []);

  const handleYoutubeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let videoId = '';
    try {
      const url = new URL(youtubeUrl);
      videoId = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || '';
    } catch (error) {
      if (youtubeUrl.length === 11) videoId = youtubeUrl;
    }
    if (!videoId) return toast.error('有効なYouTube URLまたは動画IDを入力してください');
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'youtubeLinks'), {
        title: videoTitle,
        videoId,
        order: Number(videoOrder),
        createdAt: serverTimestamp(),
      });
      setYoutubeUrl(''); setVideoTitle('');
      await fetchYoutubeLinks();
      toast.success('YouTubeリンクを正常に追加しました');
    } catch (error) {
      console.error("Error adding YouTube link: ", error);
      toast.error('YouTubeリンクの追加に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleYoutubeDelete = async (id: string) => {
    if (!window.confirm('本当にこのリンクを削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'youtubeLinks', id));
      await fetchYoutubeLinks();
      toast.success('リンクを正常に削除しました');
    } catch (error) {
      console.error("Error deleting link: ", error);
      toast.error('リンクの削除に失敗しました');
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">YouTube動画の管理</h2>
      {isLoading ? <p>YouTubeリンクを読み込み中...</p> : (
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">表示順</th>
                <th scope="col" className="px-6 py-3">タイトル</th>
                <th scope="col" className="px-6 py-3">動画ID</th>
                <th scope="col" className="px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {youtubeLinks.map((link) => (
                <tr key={link.id} className="border-b border-gray-700 hover:bg-gray-600/50">
                  <td className="px-6 py-4">{link.order}</td>
                  <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{link.title}</th>
                  <td className="px-6 py-4">{link.videoId}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleYoutubeDelete(link.id!)} className="font-medium text-red-500 hover:underline">削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="text-xl font-bold mb-4">新しい動画を追加</h3>
      <form onSubmit={handleYoutubeSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="youtubeUrl" className="mb-2 font-semibold">YouTube URL または 動画ID</label>
            <input type="text" id="youtubeUrl" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
          </div>
          <div className="flex flex-col">
            <label htmlFor="videoOrder" className="mb-2 font-semibold">表示順</label>
            <input type="number" id="videoOrder" value={videoOrder} onChange={(e) => setVideoOrder(Number(e.target.value))} className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
          </div>
          <div className="flex flex-col md:col-span-3">
            <label htmlFor="videoTitle" className="mb-2 font-semibold">動画タイトル</label>
            <input type="text" id="videoTitle" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded disabled:bg-gray-500">
          {isSubmitting ? <FaSpinner className="animate-spin mx-auto" /> : '動画リンクを追加'}
        </button>
      </form>
    </div>
  );
};

export default YoutubeAdmin;
