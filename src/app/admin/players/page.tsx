'use client';

import { useState, useEffect, FormEvent } from 'react';
import withAdminAuth from '@/components/withAdminAuth';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, doc, deleteDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaSpinner, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Player } from '@/types';
import Modal from '@/components/Modal';
import toast from 'react-hot-toast';

interface Season {
  id: string;
  name: string;
  isCurrent: boolean;
}
import Image from 'next/image';

const PlayersAdminPage = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [nationality, setNationality] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState(0);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [height, setHeight] = useState(0);
  const [status, setStatus] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');

  const fetchPlayers = async (season: string) => {
    try {
      const playersCollection = collection(db, 'players');
      const q = query(
        playersCollection,
        where('season', '==', season),
        orderBy('jerseyNumber', 'asc')
      );
      const playersSnapshot = await getDocs(q);
      const playersData = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Player[];
      setPlayers(playersData);
    } catch (error) {
      toast.error(`シーズン${season}の選手読み込みに失敗しました`);
    }
  };

  useEffect(() => {
    const fetchSeasonsAndPlayers = async () => {
      setIsLoading(true);
      try {
        const seasonsCollection = collection(db, 'seasons');
        const seasonsQuery = query(seasonsCollection, orderBy('name', 'desc'));
        const seasonsSnapshot = await getDocs(seasonsQuery);
        const seasonsData = seasonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Season[];
        setSeasons(seasonsData);

        let seasonToFetch = '';
        if (seasonsData.length > 0) {
          const currentSeason = seasonsData.find(s => s.isCurrent);
          seasonToFetch = currentSeason ? currentSeason.name : seasonsData[0].name;
          setSelectedSeason(seasonToFetch);
        }

        if (seasonToFetch) {
          await fetchPlayers(seasonToFetch);
        }

      } catch (error) {
        toast.error('シーズンと選手の読み込みに失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeasonsAndPlayers();
  }, []);

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSeason = e.target.value;
    setSelectedSeason(newSeason);
    setIsLoading(true);
    fetchPlayers(newSeason).finally(() => setIsLoading(false));
  };

  const resetForm = () => {
    setName('');
    setPosition('');
    setNationality('');
    setJerseyNumber(0);
    setDateOfBirth('');
    setHeight(0);
    setStatus('');
    setPhotoFile(null);
    setPhotoUrl('');
    setEditingPlayer(null);
  };

  const openModalForNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openModalForEdit = (player: Player) => {
    setEditingPlayer(player);
    setName(player.name);
    setPosition(player.position);
    setNationality(player.nationality);
    setJerseyNumber(player.jerseyNumber);
    setDateOfBirth(player.dateOfBirth);
    setHeight(player.height);
    setStatus(player.status || '');
    setPhotoUrl(player.photoUrl);
    setPhotoFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !position || !nationality || !dateOfBirth) return toast.error('必須項目を入力してください');
    if (!editingPlayer && !photoFile) return toast.error('新規作成時は顔写真が必須です');
    
    setIsSubmitting(true);
    try {
      let finalPhotoUrl = photoUrl;
      if (photoFile) {
        const photoRef = ref(storage, `players/${Date.now()}_${photoFile.name}`);
        const snapshot = await uploadBytes(photoRef, photoFile);
        finalPhotoUrl = await getDownloadURL(snapshot.ref);
      }

      const playerData = {
        name,
        position,
        nationality,
        jerseyNumber: Number(jerseyNumber),
        dateOfBirth,
        height: Number(height),
        status,
        photoUrl: finalPhotoUrl,
        season: selectedSeason,
      };

      if (editingPlayer) {
        // Update
        await updateDoc(doc(db, 'players', editingPlayer.id!), {
          ...playerData,
        });
        toast.success('選手情報を更新しました');
      } else {
        // Create
        await addDoc(collection(db, 'players'), {
          ...playerData,
          createdAt: serverTimestamp(),
        });
        toast.success('新しい選手を追加しました');
      }
      
      resetForm();
      setIsModalOpen(false);
      await fetchPlayers(selectedSeason);

    } catch (error) {
      console.error("Error submitting player data: ", error);
      toast.error('処理中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('本当にこの選手を削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'players', id));
      toast.success('選手を削除しました');
      await fetchPlayers(selectedSeason);
    } catch (error) {
      console.error("Error deleting player: ", error);
      toast.error('選手の削除に失敗しました');
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">選手管理</h1>
        <div className="flex items-center gap-4">
          {seasons.length > 0 && (
            <select 
              value={selectedSeason}
              onChange={handleSeasonChange}
              className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {seasons.map(season => (
                <option key={season.id} value={season.name}>
                  {season.name} {season.isCurrent && '(Current)'}
                </option>
              ))}
            </select>
          )}
          <button onClick={openModalForNew} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
            <FaPlus /> 新規選手を追加
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {isLoading ? (
          <p className="p-8 text-center">選手データを読み込み中...</p>
        ) : (
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Photo</th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Position</th>
                <th scope="col" className="px-6 py-3">Nationality</th>
                <th scope="col" className="px-6 py-3">#</th>
                <th scope="col" className="px-6 py-3">Age</th>
                <th scope="col" className="px-6 py-3">Height</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-b border-gray-700 hover:bg-gray-600/50 align-middle">
                  <td className="px-6 py-2">
                    <Image src={player.photoUrl} alt={player.name} width={40} height={40} className="rounded-full object-cover w-10 h-10" />
                  </td>
                  <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                    {player.name}
                    {player.status && <p className="text-xs text-amber-400 font-normal">{player.status}</p>}
                  </th>
                  <td className="px-6 py-4">{player.position}</td>
                  <td className="px-6 py-4">{player.nationality}</td>
                  <td className="px-6 py-4 text-center text-lg font-semibold">{player.jerseyNumber}</td>
                  <td className="px-6 py-4">{calculateAge(player.dateOfBirth)}</td>
                  <td className="px-6 py-4">{player.height}cm</td>
                  <td className="px-6 py-4 flex gap-4 items-center h-full">
                    <button onClick={() => openModalForEdit(player)} className="text-blue-400 hover:text-blue-300"><FaEdit /></button>
                    <button onClick={() => handleDelete(player.id!)} className="text-red-500 hover:red-400"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPlayer ? '選手情報の編集' : '新規選手の追加'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block mb-1">名前</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-gray-700 rounded" required /></div>
            <div><label className="block mb-1">背番号</label><input type="number" value={jerseyNumber} onChange={e => setJerseyNumber(Number(e.target.value))} className="w-full p-2 bg-gray-700 rounded" /></div>
            <div><label className="block mb-1">ポジション</label><input type="text" value={position} onChange={e => setPosition(e.target.value)} placeholder="例: CB, RB" className="w-full p-2 bg-gray-700 rounded" required /></div>
            <div><label className="block mb-1">国籍</label><input type="text" value={nationality} onChange={e => setNationality(e.target.value)} placeholder="例: ブラジル" className="w-full p-2 bg-gray-700 rounded" required /></div>
            <div><label className="block mb-1">生年月日</label><input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="w-full p-2 bg-gray-700 rounded" required /></div>
            <div><label className="block mb-1">身長 (cm)</label><input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full p-2 bg-gray-700 rounded" /></div>
          </div>
          <div><label className="block mb-1">ステータス (任意)</label><input type="text" value={status} onChange={e => setStatus(e.target.value)} placeholder="例: ハムストリング損傷" className="w-full p-2 bg-gray-700 rounded" /></div>
          <div>
            <label className="block mb-1">顔写真</label>
            <input type="file" onChange={e => setPhotoFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
            {(photoUrl || photoFile) && <div className="mt-4"><p>プレビュー:</p><Image src={photoFile ? URL.createObjectURL(photoFile) : photoUrl} alt="Preview" width={80} height={80} className="rounded-full object-cover w-20 h-20 mt-2" /></div>}
          </div>
          <div className="pt-4">
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded disabled:bg-gray-500">
              {isSubmitting ? <FaSpinner className="animate-spin mx-auto" /> : (editingPlayer ? '更新する' : '追加する')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default withAdminAuth(PlayersAdminPage);
