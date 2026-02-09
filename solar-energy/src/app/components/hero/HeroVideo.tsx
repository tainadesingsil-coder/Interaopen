'use client';

import { useState } from 'react';
import Image from 'next/image';
import { blurDataUrl, heroPoster, heroVideoSources } from '@/app/lib/constants';

export const HeroVideo = () => {
  const [heroVideoReady, setHeroVideoReady] = useState(false);

  return (
    <div className='absolute inset-0' aria-hidden='true'>
      <Image
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
      <video
        className={`absolute inset-0 h-full w-full object-cover hero-media transition-opacity duration-1000 ${
          heroVideoReady ? 'opacity-100' : 'opacity-0'
        }`}
        autoPlay
        loop
        muted
        playsInline
        preload='metadata'
        poster={heroPoster}
        onLoadedData={() => setHeroVideoReady(true)}
        onCanPlay={() => setHeroVideoReady(true)}
      >
        <source src={heroVideoSources.mobile} type='video/mp4' media='(max-width: 768px)' />
        <source src={heroVideoSources.desktop} type='video/mp4' media='(min-width: 769px)' />
      </video>
    </div>
  );
};
