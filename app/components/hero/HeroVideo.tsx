'use client';

import { useEffect, useRef, useState } from 'react';
import { blurDataUrl, heroPoster, heroVideoSources } from '@/app/lib/constants';
import { OptimizedImage } from '@/app/components/shared/OptimizedImage';

export const HeroVideo = () => {
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const [canLoadVideo, setCanLoadVideo] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shouldSaveData =
      'connection' in navigator &&
      Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    if (prefersReducedMotion || shouldSaveData) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setCanLoadVideo(true);
        observer.disconnect();
      },
      { rootMargin: '280px 0px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className='absolute inset-0' aria-hidden='true'>
      <OptimizedImage
        src={heroPoster}
        alt=''
        fill
        sizes='100vw'
        className={`absolute inset-0 h-full w-full object-cover hero-media transition-opacity duration-1000 ${
          heroVideoReady ? 'opacity-0' : 'opacity-100'
        }`}
        placeholder='blur'
        blurDataURL={blurDataUrl}
        priority
      />
      {canLoadVideo && (
        <video
          className={`absolute inset-0 h-full w-full object-cover hero-media transition-opacity duration-1000 ${
            heroVideoReady ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload='none'
          poster={heroPoster}
          onLoadedData={() => setHeroVideoReady(true)}
          onCanPlay={() => setHeroVideoReady(true)}
          onError={() => setHeroVideoReady(false)}
        >
          <source src={heroVideoSources.mobile} type='video/mp4' media='(max-width: 768px)' />
          <source src={heroVideoSources.desktop} type='video/mp4' media='(min-width: 769px)' />
        </video>
      )}
    </div>
  );
};
