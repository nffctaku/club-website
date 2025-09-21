'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { News } from '@/types';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface HeroSectionProps {
  newsItems: News[];
}

const PrevButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} className="absolute top-1/2 left-4 -translate-y-1/2 z-20 bg-black/50 p-2 rounded-full hover:bg-black/75 transition-colors">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
  </button>
);

const NextButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} className="absolute top-1/2 right-4 -translate-y-1/2 z-20 bg-black/50 p-2 rounded-full hover:bg-black/75 transition-colors">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
  </button>
);

const DotButton = ({ selected, onClick }: { selected: boolean; onClick: () => void }) => (
  <button
    className={`w-3 h-3 rounded-full transition-colors ${selected ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
    onClick={onClick}
    type="button"
  />
);

const HeroSection = ({ newsItems }: HeroSectionProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  return (
    <div className="relative w-full h-[600px] text-white mb-8 overflow-hidden" ref={emblaRef}>
      <div className="flex h-full">
        {newsItems.map((news) => (
          <div key={news.id} className="relative flex-[0_0_100%] h-full">
            <Image
              src={news.imageUrl}
              alt={news.title}
              fill
              className="object-cover"
              priority={newsItems.indexOf(news) === 0} // Priority load only the first image
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-12">
              <div className="bg-white/90 backdrop-blur-sm text-gray-900 p-6 max-w-2xl rounded-lg">
                <div className="flex items-center gap-4 text-xs font-bold mb-2">
                  <span className="text-red-600 uppercase">{news.category}</span>
                  <span className="text-gray-500">{new Date(news.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black leading-tight text-red-700 uppercase">
                  {news.title}
                </h1>
                <Link href={`/news/${news.slug}`} className="font-bold uppercase tracking-wider text-gray-800 mt-4 inline-block hover:text-red-700 transition-colors">
                  Continue Reading →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PrevButton onClick={scrollPrev} />
      <NextButton onClick={scrollNext} />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {newsItems.map((_, index) => (
          <DotButton key={index} selected={index === selectedIndex} onClick={() => scrollTo(index)} />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
