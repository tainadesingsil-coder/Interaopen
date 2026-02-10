import { mapEmbedUrl } from '@/app/lib/constants';

type Props = {
  title: string;
};

export const LocationMap = ({ title }: Props) => (
  <div className='relative h-[340px] w-full overflow-hidden rounded-[24px] border border-white/10 md:h-[360px]'>
    <iframe
      title={title}
      src={mapEmbedUrl}
      className='h-full w-full border-0'
      loading='lazy'
      referrerPolicy='no-referrer-when-downgrade'
    />
  </div>
);
