import HeroSection from '@/components/HeroSection';
import NewsCard from '@/components/NewsCard';
import LeagueTable from '@/components/LeagueTable';
import MatchResult, { getLatestResult } from '@/components/MatchResult';
import NextFixture from '@/components/NextFixture';
import YoutubeSection from '@/components/YoutubeSection';
import NewsSection from '@/components/NewsSection';
import { News } from '@/types';
import { collection, getDocs, orderBy, query, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

// This function fetches raw data from Firestore, including the non-serializable Timestamp.
async function getRawNews() {
  try {
    const newsCollection = collection(db, 'news');
    const q = query(newsCollection, orderBy('createdAt', 'desc'), limit(3));
    const newsSnapshot = await getDocs(q);
    
    // Return the raw data, including the Timestamp object.
    return newsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<News, 'id'>),
      createdAt: doc.data().createdAt as Timestamp, // Explicitly type createdAt
    }));
  } catch (error) {
    console.error("Error fetching news for homepage: ", error);
    return [];
  }
}

export default async function Home() {
  // 1. Fetch raw data on the Server.
  const rawNews = await getRawNews();

  // 2. Convert the non-serializable data to a serializable format (string).
  const serializableNews = rawNews.map(news => ({
    ...news,
    // The 'date' field is already a string, but createdAt is a Timestamp.
    // We convert it to an ISO string, which is a safe, plain string.
    createdAt: news.createdAt.toDate().toISOString(),
  }));

  // 3. Pass the 100% safe, serializable data to the Client Components.
  const heroNews = serializableNews;

  // 4. Fetch data for server components on the page
  const latestResult = await getLatestResult();

  return (
    <div className="space-y-12">
      {/* This is now safe because heroNews contains only plain objects and strings */}
      {heroNews.length > 0 && <HeroSection newsItems={heroNews} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {latestResult ? (
              <>
                <MatchResult />
                <NextFixture />
              </>            
            ) : (
              <div className="md:col-span-2">
                <NextFixture />
              </div>
            )}
          </div>
          <YoutubeSection />
          <NewsSection />
        </div>
        <aside className="lg:col-span-1">
          <LeagueTable />
        </aside>
      </div>

    </div>
  );
}
