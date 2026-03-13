'use client';

import { useEffect, useRef, useState } from 'react';
import { mapEmbedUrl } from '@/app/lib/constants';

type Props = {
  title: string;
};

export const LocationMap = ({ title }: Props) => {
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setShouldLoadMap(true);
        observer.disconnect();
      },
      { rootMargin: '300px 0px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className='relative h-[340px] w-full overflow-hidden rounded-[24px] border border-white/10 md:h-[360px]'
    >
      {shouldLoadMap ? (
        <iframe
          title={title}
          src={mapEmbedUrl}
          className='h-full w-full border-0'
          loading='lazy'
          referrerPolicy='strict-origin-when-cross-origin'
          sandbox='allow-scripts allow-same-origin allow-popups'
        />
      ) : (
        <div className='flex h-full w-full items-center justify-center bg-[rgba(6,16,24,0.55)] text-sm text-white/65'>
          Carregando mapa...
        </div>
      )}
    </div>
  );
};
