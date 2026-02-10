'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import {
  BellRing,
  Building2,
  Clock3,
  DoorOpen,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  UserRound,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Toaster } from '@/app/components/ui/sonner';

type ResidentStatus = 'ok' | 'atencao' | 'offline';
type GuardStatus = 'em_rota' | 'posto' | 'alerta';
type FeedLevel = 'normal' | 'warning' | 'critical';

interface Resident {
  id: string;
  nome: string;
  unidade: string;
  batimento: number;
  status: ResidentStatus;
  localizacao: string;
}

interface Guard {
  id: string;
  nome: string;
  posto: string;
  status: GuardStatus;
  ultimaRonda: string;
}

interface FeedEvent {
  id: string;
  horario: string;
  titulo: string;
  detalhe: string;
  level: FeedLevel;
}

const moradores: Resident[] = [
  {
    id: 'mor-01',
    nome: 'Ana Lima',
    unidade: 'Torre A - 1203',
    batimento: 76,
    status: 'ok',
    localizacao: 'Lobby',
  },
  {
    id: 'mor-02',
    nome: 'Bruno Costa',
    unidade: 'Torre B - 502',
    batimento: 104,
    status: 'atencao',
    localizacao: 'Garagem',
  },
  {
    id: 'mor-03',
    nome: 'Marcia Souza',
    unidade: 'Torre A - 804',
    batimento: 0,
    status: 'offline',
    localizacao: 'Sem sinal',
  },
  {
    id: 'mor-04',
    nome: 'Carlos Neri',
    unidade: 'Torre C - 210',
    batimento: 82,
    status: 'ok',
    localizacao: 'Piscina',
  },
];

const seguranca: Guard[] = [
  {
    id: 'seg-01',
    nome: 'Joao Pereira',
    posto: 'Portaria Norte',
    status: 'posto',
    ultimaRonda: '18:25',
  },
  {
    id: 'seg-02',
    nome: 'Rafael Alves',
    posto: 'Ronda Bloco B',
    status: 'em_rota',
    ultimaRonda: '18:21',
  },
  {
    id: 'seg-03',
    nome: 'Paulo Nunes',
    posto: 'Portao Servico',
    status: 'alerta',
    ultimaRonda: '18:11',
  },
];

const feedInicial: FeedEvent[] = [
  {
    id: 'feed-01',
    horario: '18:28',
    titulo: 'Entrada liberada',
    detalhe: 'Ana Lima - Torre A - 1203',
    level: 'normal',
  },
  {
    id: 'feed-02',
    horario: '18:26',
    titulo: 'Interfone acionado',
    detalhe: 'Visitante para Torre B - 502',
    level: 'warning',
  },
  {
    id: 'feed-03',
    horario: '18:22',
    titulo: 'Alerta de ronda',
    detalhe: 'Checkpoint C3 atrasado',
    level: 'critical',
  },
  {
    id: 'feed-04',
    horario: '18:17',
    titulo: 'Saida registrada',
    detalhe: 'Bruno Costa - Torre B - 502',
    level: 'normal',
  },
];

const residentPulse: Record<ResidentStatus, string> = {
  ok: 'bg-emerald-400 shadow-[0_0_0_8px_rgba(16,185,129,0.18)]',
  atencao: 'bg-amber-300 shadow-[0_0_0_8px_rgba(251,191,36,0.18)]',
  offline: 'bg-zinc-500 shadow-[0_0_0_8px_rgba(113,113,122,0.16)]',
};

const residentBadge: Record<ResidentStatus, 'default' | 'warning' | 'outline'> = {
  ok: 'default',
  atencao: 'warning',
  offline: 'outline',
};

const guardBadge: Record<GuardStatus, 'default' | 'warning' | 'danger'> = {
  posto: 'default',
  em_rota: 'warning',
  alerta: 'danger',
};

const guardText: Record<GuardStatus, string> = {
  posto: 'No posto',
  em_rota: 'Em rota',
  alerta: 'Alerta',
};

const feedDot: Record<FeedLevel, string> = {
  normal: 'bg-emerald-400',
  warning: 'bg-amber-300',
  critical: 'bg-rose-500',
};

function horarioAtual() {
  return new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Page() {
  const [feed, setFeed] = useState<FeedEvent[]>(feedInicial);
  const [visitorModalOpen, setVisitorModalOpen] = useState(false);

  const moradoresOnline = useMemo(
    () => moradores.filter((item) => item.status !== 'offline').length,
    []
  );
  const alertasAtivos = useMemo(
    () =>
      moradores.filter((item) => item.status === 'atencao').length +
      seguranca.filter((item) => item.status === 'alerta').length,
    []
  );

  const abrirInterfone = () => {
    const novoEvento: FeedEvent = {
      id: `feed-${Date.now()}`,
      horario: horarioAtual(),
      titulo: 'Interfone acionado',
      detalhe: 'Visitante para Torre A - 1203',
      level: 'warning',
    };
    setFeed((atual) => [novoEvento, ...atual].slice(0, 10));
    setVisitorModalOpen(true);
    toast.warning('Visitante aguardando aprovacao da portaria');
  };

  const aprovarVisitante = () => {
    setVisitorModalOpen(false);
    setFeed((atual) => [
      {
        id: `feed-${Date.now()}-ok`,
        horario: horarioAtual(),
        titulo: 'Acesso aprovado',
        detalhe: 'Fechadura da Torre A liberada',
        level: 'normal',
      },
      ...atual,
    ]);
    toast.success('Visitante aprovado');
  };

  const negarVisitante = () => {
    setVisitorModalOpen(false);
    setFeed((atual) => [
      {
        id: `feed-${Date.now()}-no`,
        horario: horarioAtual(),
        titulo: 'Acesso negado',
        detalhe: 'Evento registrado na portaria',
        level: 'critical',
      },
      ...atual,
    ]);
    toast.error('Visitante negado');
  };

  return (
    <MotionConfig reducedMotion='user'>
      <div className='min-h-screen bg-codexionBg text-zinc-100'>
        <div className='pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(34,211,238,0.1),transparent_32%)]' />

        <main id='main-content' className='relative mx-auto max-w-[1500px] p-4 lg:p-6'>
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className='mb-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl'
          >
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div>
                <p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Portaria Digital</p>
                <h1 className='mt-1 text-2xl font-semibold lg:text-3xl'>
                  Dashboard de Condominio
                </h1>
                <p className='mt-1 text-sm text-zinc-400'>
                  Operacao separada entre moradores e seguranca.
                </p>
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge variant='outline' className='px-3 py-1'>
                  <Building2 className='mr-1 h-3.5 w-3.5' />
                  Residencial Bella Vista
                </Badge>
                <Badge variant={alertasAtivos > 0 ? 'warning' : 'default'} className='px-3 py-1'>
                  <ShieldAlert className='mr-1 h-3.5 w-3.5' />
                  {alertasAtivos} alerta(s) ativo(s)
                </Badge>
              </div>
            </div>
          </motion.header>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className='mb-4 grid gap-3 md:grid-cols-4'
          >
            <Card>
              <CardContent className='p-4'>
                <p className='text-xs uppercase tracking-[0.14em] text-zinc-500'>Moradores online</p>
                <p className='mt-1 text-2xl font-semibold'>{moradoresOnline}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-xs uppercase tracking-[0.14em] text-zinc-500'>Equipe de seguranca</p>
                <p className='mt-1 text-2xl font-semibold'>{seguranca.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-xs uppercase tracking-[0.14em] text-zinc-500'>Acessos hoje</p>
                <p className='mt-1 text-2xl font-semibold'>186</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-xs uppercase tracking-[0.14em] text-zinc-500'>Ultima atualizacao</p>
                <p className='mt-1 inline-flex items-center gap-1 text-xl font-semibold'>
                  <Clock3 className='h-4 w-4 text-cyan-300' />
                  {horarioAtual()}
                </p>
              </CardContent>
            </Card>
          </motion.section>

          <div className='grid gap-4 xl:grid-cols-2'>
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.08 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className='inline-flex items-center gap-2'>
                    <Users className='h-5 w-5 text-cyan-300' />
                    Moradores
                  </CardTitle>
                  <CardDescription>Status de batimento e localizacao no condominio.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {moradores.map((item) => (
                    <div
                      key={item.id}
                      className='flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-3'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='relative h-10 w-10 rounded-full border border-white/15 bg-zinc-800/70'>
                          <span
                            className={`absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full animate-pulse ${residentPulse[item.status]}`}
                          />
                        </div>
                        <div>
                          <p className='text-sm font-medium text-zinc-100'>{item.nome}</p>
                          <p className='text-xs text-zinc-400'>{item.unidade}</p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <Badge variant={residentBadge[item.status]}>
                          {item.status === 'ok'
                            ? 'Estavel'
                            : item.status === 'atencao'
                              ? 'Atencao'
                              : 'Offline'}
                        </Badge>
                        <p className='mt-1 text-xs text-zinc-400'>
                          {item.status === 'offline' ? item.localizacao : `${item.batimento} bpm`}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.12 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className='inline-flex items-center gap-2'>
                    <ShieldCheck className='h-5 w-5 text-emerald-300' />
                    Seguranca
                  </CardTitle>
                  <CardDescription>Posto atual, ronda e status de cada vigilante.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {seguranca.map((item) => (
                    <div
                      key={item.id}
                      className='flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-3'
                    >
                      <div className='flex items-center gap-2'>
                        <UserRound className='h-4 w-4 text-zinc-400' />
                        <div>
                          <p className='text-sm font-medium text-zinc-100'>{item.nome}</p>
                          <p className='text-xs text-zinc-400'>{item.posto}</p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <Badge variant={guardBadge[item.status]}>{guardText[item.status]}</Badge>
                        <p className='mt-1 text-xs text-zinc-400'>Ronda: {item.ultimaRonda}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.section>
          </div>

          <div className='mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]'>
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.16 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className='inline-flex items-center gap-2'>
                    <BellRing className='h-5 w-5 text-cyan-300' />
                    Feed da Portaria
                  </CardTitle>
                  <CardDescription>Entradas, saidas, interfone e alertas da operacao.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-2.5'>
                  {feed.map((item) => (
                    <div
                      key={item.id}
                      className='flex items-start justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2.5'
                    >
                      <div className='flex items-start gap-2'>
                        <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${feedDot[item.level]}`} />
                        <div>
                          <p className='text-sm text-zinc-100'>{item.titulo}</p>
                          <p className='text-xs text-zinc-400'>{item.detalhe}</p>
                        </div>
                      </div>
                      <span className='text-xs text-zinc-500'>{item.horario}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Acoes Rapidas</CardTitle>
                  <CardDescription>Comandos operacionais da portaria.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <Button className='w-full justify-start' onClick={abrirInterfone}>
                    <BellRing className='mr-2 h-4 w-4' />
                    Simular chamada de interfone
                  </Button>
                  <Button variant='secondary' className='w-full justify-start'>
                    <DoorOpen className='mr-2 h-4 w-4' />
                    Liberar portao de servico
                  </Button>
                  <Button variant='danger' className='w-full justify-start'>
                    <ShieldX className='mr-2 h-4 w-4' />
                    Bloqueio de emergencia
                  </Button>
                </CardContent>
              </Card>
            </motion.section>
          </div>
        </main>

        <AnimatePresence>
          {visitorModalOpen ? (
            <motion.div
              className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className='w-full max-w-md rounded-3xl border border-white/15 bg-[#141615]/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.65)]'
              >
                <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>Interfone</p>
                <h3 className='mt-1 text-xl font-semibold'>Visitante aguardando resposta</h3>
                <p className='mt-2 text-sm text-zinc-400'>
                  Maria Oliveira solicitou acesso para Torre A - 1203.
                </p>
                <div className='mt-5 grid grid-cols-2 gap-2'>
                  <Button variant='danger' onClick={negarVisitante}>
                    Negar
                  </Button>
                  <Button onClick={aprovarVisitante}>Aprovar</Button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <Toaster />
      </div>
    </MotionConfig>
  );
}
