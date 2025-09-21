import NewsCard from '@/components/NewsCard';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { News } from '@/types';

// This function fetches data from Firestore on the server side.
async function getNews() {
  try {
    const newsCollection = collection(db, 'news');
    const q = query(newsCollection, orderBy('createdAt', 'desc'));
    const newsSnapshot = await getDocs(q);
    
    const newsList = newsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<News, 'id'>),
    }));

    return newsList;
  } catch (error) {
    console.error("Error fetching news: ", error);
    return []; // Return an empty array in case of an error
  }
}

// This is a React Server Component, which can be async.
const NewsPage = async () => {
  const allNews = await getNews();

  return (
    <div>
      <h1 className="text-4xl font-black mb-8 text-gray-900 dark:text-white">All News</h1>
      {allNews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allNews.map((news) => (
            <NewsCard
              key={news.id} // Use Firestore document ID as key
              title={news.title}
              imageUrl={news.imageUrl}
              category={news.category}
              date={news.date}
              slug={news.slug}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">No news articles found. Please add some to the &apos;news&apos; collection in Firestore.</p>
      )}
    </div>
  );
};

export default NewsPage;
