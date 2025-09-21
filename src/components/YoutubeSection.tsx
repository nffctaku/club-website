import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { YoutubeLink } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

async function getYoutubeLinks() {
  try {
    const linksCollection = collection(db, 'youtubeLinks');
    const q = query(linksCollection, orderBy('order', 'asc'));
    const linksSnapshot = await getDocs(q);
    return linksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as YoutubeLink[];
  } catch (error) {
    console.error("Error fetching YouTube links for homepage: ", error);
    return [];
  }
}

const YoutubeSection = async () => {
  const youtubeLinks = await getYoutubeLinks();

  if (youtubeLinks.length === 0) {
    return null; // Don't render the section if there are no videos
  }

  return (
    <section className="bg-red-700 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-black text-white uppercase mb-8">Club TV</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {youtubeLinks.map((link) => (
            <Link key={link.id} href={`https://www.youtube.com/watch?v=${link.videoId}`} target="_blank" rel="noopener noreferrer" className="bg-white rounded-lg overflow-hidden group">
              <div className="relative">
                <Image 
                  src={`https://i.ytimg.com/vi/${link.videoId}/hqdefault.jpg`}
                  alt={link.title}
                  width={720}
                  height={480}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 leading-tight truncate">{link.title}</h3>
              </div>
            </Link>
          ))}
        </div>
        {/* Optional: Add a 'View More' button if needed */}
        {/* <div className="text-center mt-8">
          <Link href="#" className="bg-white text-red-700 font-bold py-2 px-6 rounded-full border-2 border-white hover:bg-transparent hover:text-white transition-colors">
            View More
          </Link>
        </div> */}
      </div>
    </section>
  );
};

export default YoutubeSection;
