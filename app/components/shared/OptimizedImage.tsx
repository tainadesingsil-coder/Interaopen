'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useMemo, useState } from 'react';

const DEFAULT_WIDTHS = [480, 768, 1024, 1440];

const normalizeExt = (ext: string) => (ext === 'jpeg' ? 'jpg' : ext);

const getBaseInfo = (src: string) => {
  const match = src.match(/^(.*)\.(jpe?g|png|webp)$/i);
  if (!match) return null;
  return {
    base: match[1],
    ext: normalizeExt(match[2].toLowerCase()),
  };
};

const supportsWebp = () => {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
};

type Props = Omit<ImageProps, 'src'> & {
  src: string;
  widths?: number[];
};

export const OptimizedImage = ({ src, widths, onError, ...props }: Props) => {
  const info = getBaseInfo(src);
  const [webpSupported, setWebpSupported] = useState(false);
  const [webpFailed, setWebpFailed] = useState(false);
  const widthList = widths ?? DEFAULT_WIDTHS;
  const [selectedWidth, setSelectedWidth] = useState(
    widthList[widthList.length - 1]
  );

  useEffect(() => {
    setWebpSupported(supportsWebp());
  }, []);

  useEffect(() => {
    if (!info) return;
    const updateWidth = () => {
      const target =
        typeof window === 'undefined'
          ? widthList[widthList.length - 1]
          : Math.ceil(window.innerWidth * (window.devicePixelRatio || 1));
      const nextWidth = widthList.find((size) => size >= target) ?? widthList[widthList.length - 1];
      setSelectedWidth(nextWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [info, widthList]);

  const computedSrc = useMemo(() => {
    if (!info) return src;
    const ext = webpSupported && !webpFailed ? 'webp' : info.ext;
    return `${info.base}-${selectedWidth}.${ext}`;
  }, [info, selectedWidth, src, webpFailed, webpSupported]);

  if (!info) {
    return <Image src={src} onError={onError} {...props} />;
  }

  return (
    <Image
      {...props}
      src={computedSrc}
      onError={(event) => {
        if (webpSupported && !webpFailed) {
          setWebpFailed(true);
        }
        onError?.(event);
      }}
    />
  );
};
