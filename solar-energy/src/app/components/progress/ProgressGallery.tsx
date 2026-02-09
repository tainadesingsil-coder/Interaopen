'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { blurDataUrl } from '@/app/lib/constants';
import { useGallery } from '@/app/hooks/useGallery';

type Props = {
  images: string[];
  alt: string;
  reduceMotion: boolean;
};

export const ProgressGallery = ({ images, alt, reduceMotion }: Props) => {
  const { index, setIndex } = useGallery({
    length: images.length,
    reduceMotion,
    auto: true,
  });

  return (
    <>
      <div className='relative aspect-[16/10] overflow-hidden rounded-2xl'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={images[index]}
            className='absolute inset-0'
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.6 }}
          >
            <Image
              src={images[index]}
              alt={alt}
              fill
              sizes='(min-width: 1024px) 50vw, 90vw'
              className='object-cover'
              placeholder='blur'
              blurDataURL={blurDataUrl}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className='mt-4 flex items-center justify-center gap-2'>
        {images.map((_, dotIndex) => (
          <button
            key={dotIndex}
            type='button'
            onClick={() => setIndex(dotIndex)}
            className={`h-2 w-2 rounded-full transition ${
              dotIndex === index ? 'bg-[var(--gold)]' : 'bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Imagem ${dotIndex + 1}`}
          />
        ))}
      </div>
    </>
  );
};
