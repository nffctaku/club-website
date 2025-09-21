'use client';

import { useState, useEffect, FormEvent } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, doc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaSpinner } from 'react-icons/fa';
import { News } from '@/types';
import Modal from '@/components/Modal';
import toast from 'react-hot-toast';
import slugify from 'slugify';

const NewsAdmin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsList, setNewsList] = useState<News[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [slug, setSlug] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<News | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editSlug, setEditSlug] = useState('');

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const newsCollection = collection(db, 'news');
      const q = query(newsCollection, orderBy('createdAt', 'desc'));
      const newsSnapshot = await getDocs(q);
      const newsData = newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as News[];
      setNewsList(newsData);
    } catch (error) {
      console.error("Error fetching news: ", error);
      toast.error('ニュースの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setSlug(slugify(newTitle, { lower: true, strict: true }));
  };

  const handleEditTitleChange = (newTitle: string) => {
    setEditTitle(newTitle);
    setEditSlug(slugify(newTitle, { lower: true, strict: true }));
  };

  const handleNewsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageFile) return toast.error('画像ファイルを選択してください');
    setIsSubmitting(true);
    try {
      const imageRef = ref(storage, `images/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'news'), {
        title, category, imageUrl, slug,
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });

      setTitle(''); setCategory(''); setImageFile(null); setSlug('');
      await fetchNews();
      toast.success('記事を正常に作成しました');
    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error('記事の作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewsDelete = async (id: string) => {
    if (!window.confirm('本当にこの記事を削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'news', id));
      await fetchNews();
      toast.success('記事を正常に削除しました');
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast.error('記事の削除に失敗しました');
    }
  };

  const handleNewsUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentArticle?.id) return;
    setIsSubmitting(true);
    try {
      let newImageUrl = editImageUrl;
      if (editImageFile) {
        const imageRef = ref(storage, `images/${Date.now()}_${editImageFile.name}`);
        const snapshot = await uploadBytes(imageRef, editImageFile);
        newImageUrl = await getDownloadURL(snapshot.ref);
      }
      await updateDoc(doc(db, 'news', currentArticle.id), { title: editTitle, category: editCategory, imageUrl: newImageUrl, slug: editSlug });
      setIsModalOpen(false);
      await fetchNews();
      toast.success('記事を正常に更新しました');
    } catch (error) {
      console.error("Error updating document: ", error);
      toast.error('記事の更新に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (article: News) => {
    setCurrentArticle(article);
    setEditTitle(article.title);
    setEditCategory(article.category);
    setEditImageUrl(article.imageUrl);
    setEditImageFile(null);
    setEditSlug(article.slug);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">ニュース記事の管理</h2>
        {isLoading ? <p>ニュースを読み込み中...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">タイトル</th>
                  <th scope="col" className="px-6 py-3">カテゴリー</th>
                  <th scope="col" className="px-6 py-3">日付</th>
                  <th scope="col" className="px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {newsList.map((news) => (
                  <tr key={news.id} className="border-b border-gray-700 hover:bg-gray-600/50">
                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{news.title}</th>
                    <td className="px-6 py-4">{news.category}</td>
                    <td className="px-6 py-4">{new Date(news.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex gap-4">
                      <button onClick={() => openEditModal(news)} className="font-medium text-blue-500 hover:underline">編集</button>
                      <button onClick={() => handleNewsDelete(news.id!)} className="font-medium text-red-500 hover:underline">削除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">新しい記事を追加</h2>
        <form onSubmit={handleNewsSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="title" className="mb-2 font-semibold">タイトル</label>
              <input type="text" id="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
            </div>
            <div className="flex flex-col">
              <label htmlFor="category" className="mb-2 font-semibold">カテゴリー</label>
              <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label htmlFor="imageFile" className="mb-2 font-semibold">画像</label>
              <input type="file" id="imageFile" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="p-2 rounded bg-gray-700 border border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" required />
              {imageFile && <img src={URL.createObjectURL(imageFile)} alt="Preview" className="mt-4 h-32 w-auto object-cover rounded" />} 
            </div>
            <div className="flex flex-col md:col-span-2">
              <label htmlFor="slug" className="mb-2 font-semibold">スラッグ（URL用）</label>
              <input type="text" id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded disabled:bg-gray-500">
            {isSubmitting ? <FaSpinner className="animate-spin mx-auto" /> : '記事を追加'}
          </button>
        </form>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="記事を編集">
        <form onSubmit={handleNewsUpdate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex flex-col">
              <label htmlFor="edit-title" className="mb-2 font-semibold">タイトル</label>
              <input type="text" id="edit-title" value={editTitle} onChange={(e) => handleEditTitleChange(e.target.value)} className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
            </div>
            <div className="flex flex-col">
              <label htmlFor="edit-category" className="mb-2 font-semibold">カテゴリー</label>
              <input type="text" id="edit-category" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label htmlFor="edit-imageFile" className="mb-2 font-semibold">新しい画像 (任意)</label>
              <input type="file" id="edit-imageFile" onChange={(e) => setEditImageFile(e.target.files ? e.target.files[0] : null)} className="p-2 rounded bg-gray-700 border border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">現在の画像:</p>
                {editImageFile ? (
                  <img src={URL.createObjectURL(editImageFile)} alt="New Preview" className="h-32 w-auto object-cover rounded" />
                ) : (
                  <img src={editImageUrl} alt="Current" className="h-32 w-auto object-cover rounded" />
                )}
              </div>
            </div>
            <div className="flex flex-col md:col-span-2">
              <label htmlFor="edit-slug" className="mb-2 font-semibold">スラッグ（URL用）</label>
              <input type="text" id="edit-slug" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded disabled:bg-gray-500">
            {isSubmitting ? <FaSpinner className="animate-spin mx-auto" /> : '更新'}
          </button>
        </form>
      </Modal>
    </>
  );
};

export default NewsAdmin;
