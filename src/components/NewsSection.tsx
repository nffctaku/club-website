import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { News } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

async function getNews() {
  try {
    const newsCollection = collection(db, 'news');
    // 最新の6件を取得
    const q = query(newsCollection, orderBy('createdAt', 'desc'), limit(6));
    const newsSnapshot = await getDocs(q);
    return newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as News[];
  } catch (error) {
    console.error("Error fetching news for homepage: ", error);
    return [];
  }
}

const NewsSection = async () => {
  const news = await getNews();

  if (news.length === 0) {
    return null; // ニュースがない場合はセクションを表示しない
  }

  const [firstArticle, ...otherArticles] = news;

  return (
    <section className="py-12 bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-black text-white uppercase mb-8 tracking-wider">News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Featured Article */}
          {firstArticle && (
            <Link href={`/news/${firstArticle.slug}`} className="block rounded-lg overflow-hidden group col-span-1 md:col-span-2 lg:row-span-2 relative">
              <Image 
                src={firstArticle.imageUrl}
                alt={firstArticle.title}
                width={1200}
                height={900}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <span className="text-xs bg-red-600 text-white font-semibold py-1 px-3 rounded-full uppercase">{firstArticle.category}</span>
                <h3 className="text-2xl font-bold text-white mt-2 leading-tight">{firstArticle.title}</h3>
              </div>
            </Link>
          )}

          {/* Other Articles */}
          {otherArticles.map((article) => (
            <Link key={article.id} href={`/news/${article.slug}`} className="block rounded-lg overflow-hidden group relative">
               <Image 
                src={article.imageUrl}
                alt={article.title}
                width={720}
                height={480}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4">
                <span className="text-xs bg-red-600 text-white font-semibold py-1 px-2 rounded-full uppercase">{article.category}</span>
                <h3 className="text-md font-bold text-white mt-1 leading-tight">{article.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
