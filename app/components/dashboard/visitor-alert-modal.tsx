'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Camera, DoorOpen, ShieldBan } from 'lucide-react';

import { Button } from '@/app/components/ui/button';

interface VisitorAlertModalProps {
  open: boolean;
  visitorName: string;
  destination: string;
  photoUrl?: string;
  onApprove: () => void;
  onDeny: () => void;
}

export function VisitorAlertModal({
  open,
  visitorName,
  destination,
  photoUrl,
  onApprove,
  onDeny,
}: VisitorAlertModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className='fixed right-4 top-20 z-50 w-[min(92vw,420px)] rounded-2xl border border-white/15 bg-[#131613]/90 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl'
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.26, ease: 'easeOut' }}
        >
          <div className='mb-3 flex items-center justify-between'>
            <p className='text-sm font-semibold text-zinc-100'>Visitante no Interfone</p>
            <span className='rounded-full border border-amber-300/35 bg-amber-300/15 px-2 py-0.5 text-[11px] text-amber-200'>
              acao imediata
            </span>
          </div>

          <div className='mb-4 flex gap-3'>
            <div className='h-20 w-20 overflow-hidden rounded-xl border border-white/15 bg-black/40'>
              {photoUrl ? (
                <img src={photoUrl} alt={`Foto de ${visitorName}`} className='h-full w-full object-cover' />
              ) : (
                <div className='flex h-full w-full items-center justify-center text-zinc-500'>
                  <Camera className='h-5 w-5' />
                </div>
              )}
            </div>
            <div className='flex-1'>
              <p className='text-base font-medium text-zinc-100'>{visitorName}</p>
              <p className='text-sm text-zinc-400'>{destination}</p>
              <p className='mt-2 text-xs text-zinc-500'>
                Confirmar abertura remota da fechadura pelo smartwatch?
              </p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <Button variant='danger' onClick={onDeny}>
              <ShieldBan className='mr-1.5 h-4 w-4' />
              Negar
            </Button>
            <Button onClick={onApprove}>
              <DoorOpen className='mr-1.5 h-4 w-4' />
              Aprovar
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
