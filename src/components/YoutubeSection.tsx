'use client';

import React from 'react';
import { YoutubeLink } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';

interface YoutubeSectionProps {
  youtubeLinks: YoutubeLink[];
}

const YoutubeSection = ({ youtubeLinks }: YoutubeSectionProps) => {
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
  });

  if (youtubeLinks.length === 0) {
    return null; // Don't render the section if there are no videos
  }

  return (
    <section className="bg-red-700 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-black text-white uppercase mb-8">Club TV</h2>
        
        {/* Embla Carousel container */}
        <div className="overflow-hidden" ref={emblaRef}>
          {/* Embla slides container */}
          <div className="flex -ml-4">
            {youtubeLinks.map((link) => (
              // Each slide
              <div key={link.id} className="relative flex-[0_0_80%] sm:flex-[0_0_45%] md:flex-[0_0_33.33%] lg:flex-[0_0_20%] pl-4">
                <Link href={`https://www.youtube.com/watch?v=${link.videoId}`} target="_blank" rel="noopener noreferrer" className="bg-white rounded-lg overflow-hidden group block">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default YoutubeSection;
