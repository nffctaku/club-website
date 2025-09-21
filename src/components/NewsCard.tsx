import Image from 'next/image';
import Link from 'next/link';

type NewsCardProps = {
  title: string;
  imageUrl: string;
  category: string;
  date: string;
  slug: string;
};

const NewsCard = ({ title, imageUrl, category, date, slug }: NewsCardProps) => {
  return (
    <Link href={`/news/${slug}`} className="block group">
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-red-900/50 transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative w-full h-40">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <p className="text-red-400 text-xs font-bold uppercase tracking-wider">{category}</p>
          <h3 className="text-md font-bold mt-2 text-white leading-tight h-12">{title}</h3>
          <p className="text-gray-500 text-xs mt-3">{new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
