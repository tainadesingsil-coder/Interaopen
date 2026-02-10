'use client';

type Props = {
  label: string;
  onDownload: () => void;
};

export const PDFGenerator = ({ label, onDownload }: Props) => (
  <button
    type='button'
    onClick={onDownload}
    className='text-center text-xs text-white/60 underline-offset-4 transition hover:text-white hover:underline'
  >
    {label}
  </button>
);
