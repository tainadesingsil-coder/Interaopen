import Image, { type ImageProps } from 'next/image';

type Props = Omit<ImageProps, 'src'> & {
  src: string;
};

export const OptimizedImage = ({ src, ...props }: Props) => (
  <Image src={src} decoding='async' {...props} />
);
