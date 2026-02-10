'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import {
  Activity,
  BellRing,
  Building2,
  Cpu,
  ShieldCheck,
  Siren,
  UsersRound,
} from 'lucide-react';
import { toast } from 'sonner';

import { DashboardSidebar } from '@/app/components/dashboard/sidebar';
import { EventFeed } from '@/app/components/dashboard/event-feed';
import { HealthStatusRing } from '@/app/components/dashboard/health-status-ring';
import { SecurityMap } from '@/app/components/dashboard/security-map';
import { UserStatusList } from '@/app/components/dashboard/user-status-list';
import { VisitorAlertModal } from '@/app/components/dashboard/visitor-alert-modal';
import { VitalsSheet } from '@/app/components/dashboard/vitals-sheet';
import {
  accessEvents,
  initialMapAgents,
  monitoredUsers,
} from '@/app/components/dashboard/mock-data';
import type {
  AccessEvent,
  DashboardScreen,
  MapAgent,
  MonitoredUser,
} from '@/app/components/dashboard/types';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Toaster } from '@/app/components/ui/sonner';

const networkHealthScore = 94;
const networkNodesOnline = 47;
const networkNodesTotal = 49;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function Page() {
  const [activeScreen, setActiveScreen] = useState<DashboardScreen>('overview');
  const [events, setEvents] = useState<AccessEvent[]>(accessEvents);
  const [agents, setAgents] = useState<MapAgent[]>(initialMapAgents);
  const [selectedUser, setSelectedUser] = useState<MonitoredUser | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visitorModalOpen, setVisitorModalOpen] = useState(false);

  const criticalCount = useMemo(
    () => monitoredUsers.filter((user) => user.status === 'critical').length,
    []
  );
  const attentionCount = useMemo(
    () => monitoredUsers.filter((user) => user.status === 'attention').length,
    []
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAgents((previous) =>
        previous.map((agent) => ({
          ...agent,
          x: clamp(agent.x + (Math.random() * 8 - 4), 8, 92),
          y: clamp(agent.y + (Math.random() * 8 - 4), 10, 90),
        }))
      );
    }, 2200);

    return () => window.clearInterval(timer);
  }, []);

  const openVitals = (user: MonitoredUser) => {
    setSelectedUser(user);
    setSheetOpen(true);
  };

  const simulateVisitorCall = () => {
    const event: AccessEvent = {
      id: `evt-${Date.now()}`,
      actor: 'Visitante: Camila',
      action: 'Interfone',
      zone: 'Portaria Torre A',
      timestamp: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      severity: 'critical',
    };
    setEvents((prev) => [event, ...prev].slice(0, 8));
    setVisitorModalOpen(true);
    toast.warning('Visitante aguardando validacao no smartwatch', {
      description: 'Toque para abrir o painel e aprovar ou negar.',
      icon: <BellRing className='h-4 w-4' />,
    });
  };

  const approveVisitor = () => {
    setVisitorModalOpen(false);
    toast.success('Acesso aprovado remotamente', {
      description: 'Comando de abertura enviado para a fechadura local.',
    });
    setEvents((prev) => [
      {
        id: `evt-${Date.now()}-approved`,
        actor: 'Morador responsavel',
        action: 'Entrada',
        zone: 'Torre A - Unidade 1203',
        timestamp: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        severity: 'stable',
      },
      ...prev,
    ]);
  };

  const denyVisitor = () => {
    setVisitorModalOpen(false);
    toast.error('Acesso negado com sucesso', {
      description: 'Evento registrado e log enviado para a portaria.',
    });
  };

  const renderScreen = () => {
    if (activeScreen === 'people') {
      return (
        <div className='grid gap-4 xl:grid-cols-[1fr_1.2fr]'>
          <Card>
            <CardHeader>
              <CardTitle className='inline-flex items-center gap-2'>
                <UsersRound className='h-5 w-5 text-cyan-300' />
                Moradores e Funcionarios
              </CardTitle>
              <CardDescription>Pulseira de status em tempo real por HR e localizacao.</CardDescription>
            </CardHeader>
            <CardContent>
              <UserStatusList users={monitoredUsers} onSelectUser={openVitals} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='inline-flex items-center gap-2'>
                <Activity className='h-5 w-5 text-emerald-300' />
                Telemetria Global
              </CardTitle>
              <CardDescription>
                Clique em qualquer perfil para abrir o painel lateral com ECG, estresse e pressao.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-3 sm:grid-cols-3'>
                <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-4'>
                  <p className='text-xs uppercase tracking-[0.15em] text-zinc-500'>Monitorados</p>
                  <p className='mt-1 text-2xl font-semibold text-zinc-100'>{monitoredUsers.length}</p>
                </div>
                <div className='rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4'>
                  <p className='text-xs uppercase tracking-[0.15em] text-amber-100/70'>Atencao</p>
                  <p className='mt-1 text-2xl font-semibold text-amber-200'>{attentionCount}</p>
                </div>
                <div className='rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4'>
                  <p className='text-xs uppercase tracking-[0.15em] text-rose-100/70'>Criticos</p>
                  <p className='mt-1 text-2xl font-semibold text-rose-200'>{criticalCount}</p>
                </div>
              </div>
              <div className='rounded-2xl border border-white/10 bg-black/25 p-5'>
                <p className='text-sm text-zinc-300'>
                  O protocolo de coacao fica armado quando HR ultrapassa o limiar sem atividade
                  fisica. O operador da portaria recebe alerta silencioso no dashboard e no feed de
                  seguranca.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeScreen === 'events') {
      return (
        <div className='grid gap-4 lg:grid-cols-[1.15fr_0.85fr]'>
          <EventFeed events={events} onSimulateVisitor={simulateVisitorCall} />
          <Card>
            <CardHeader>
              <CardTitle className='inline-flex items-center gap-2'>
                <ShieldCheck className='h-5 w-5 text-emerald-300' />
                Acao de Interfonia no Pulso
              </CardTitle>
              <CardDescription>
                Fluxo de aprovacao/negacao enviado ao relogio por write characteristic.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 text-sm text-zinc-300'>
              <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-4'>
                <p className='mb-2 text-zinc-200'>Passos da operacao em tempo real</p>
                <ol className='space-y-2 text-zinc-400'>
                  <li>1. Portaria envia webhook de visitante.</li>
                  <li>2. Middleware dispara vibracao no smartwatch.</li>
                  <li>3. Morador aprova/nega por toque.</li>
                  <li>4. Comando de abertura local executado (modo edge).</li>
                </ol>
              </div>
              <div className='rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4 text-emerald-200'>
                SLA de decisao no pulso: 2.1s medio nos ultimos 30 eventos.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeScreen === 'map') {
      return (
        <div className='grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'>
          <SecurityMap agents={agents} />
          <Card>
            <CardHeader>
              <CardTitle className='inline-flex items-center gap-2'>
                <Cpu className='h-5 w-5 text-cyan-300' />
                Ronda e Geo-Proximidade
              </CardTitle>
              <CardDescription>
                Posicao atualizada por RSSI de beacons e roteadores internos.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-zinc-300'>
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className='flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2.5'
                >
                  <span>{agent.name}</span>
                  <Badge
                    variant={
                      agent.status === 'stable'
                        ? 'default'
                        : agent.status === 'attention'
                          ? 'warning'
                          : 'danger'
                    }
                  >
                    {agent.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className='grid gap-4 xl:grid-cols-[1.5fr_0.9fr]'>
        <div className='space-y-4'>
          <Card className='overflow-hidden'>
            <CardContent className='p-0'>
              <div className='grid gap-4 p-5 lg:grid-cols-[1.15fr_0.85fr] lg:p-6'>
                <div>
                  <p className='mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500'>
                    Monitoramento Local-First
                  </p>
                  <h2 className='text-3xl font-semibold leading-tight text-zinc-100 lg:text-4xl'>
                    Plataforma Codexion
                  </h2>
                  <p className='mt-3 max-w-xl text-sm text-zinc-400'>
                    Seguranca patrimonial e saude industrial em um unico cockpit operacional.
                    Processamento critico no edge para manter acesso e alertas mesmo sem internet.
                  </p>

                  <div className='mt-5 grid gap-3 sm:grid-cols-3'>
                    <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-3'>
                      <p className='text-xs uppercase tracking-[0.12em] text-zinc-500'>Alertas</p>
                      <p className='mt-1 text-2xl font-semibold text-zinc-100'>{criticalCount + attentionCount}</p>
                    </div>
                    <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-3'>
                      <p className='text-xs uppercase tracking-[0.12em] text-zinc-500'>Acessos Hoje</p>
                      <p className='mt-1 text-2xl font-semibold text-zinc-100'>184</p>
                    </div>
                    <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-3'>
                      <p className='text-xs uppercase tracking-[0.12em] text-zinc-500'>Edge Nodes</p>
                      <p className='mt-1 text-2xl font-semibold text-zinc-100'>{networkNodesOnline}</p>
                    </div>
                  </div>
                </div>
                <div className='flex items-center justify-center'>
                  <HealthStatusRing
                    score={networkHealthScore}
                    onlineNodes={networkNodesOnline}
                    totalNodes={networkNodesTotal}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className='grid gap-4 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='inline-flex items-center gap-2'>
                  <UsersRound className='h-5 w-5 text-cyan-300' />
                  Monitoramento Biometrico
                </CardTitle>
                <CardDescription>
                  Clique no usuario para abrir o painel lateral com sinais vitais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserStatusList users={monitoredUsers} onSelectUser={openVitals} />
              </CardContent>
            </Card>
            <SecurityMap agents={agents} compact />
          </div>
        </div>
        <EventFeed events={events} onSimulateVisitor={simulateVisitorCall} />
      </div>
    );
  };

  return (
    <MotionConfig reducedMotion='user'>
      <div className='min-h-screen bg-codexionBg text-zinc-100'>
        <div className='pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(16,185,129,0.15),transparent_36%),radial-gradient(circle_at_82%_4%,rgba(34,211,238,0.12),transparent_30%)]' />
        <div className='relative mx-auto flex max-w-[1700px] flex-col gap-4 p-4 lg:flex-row lg:p-4'>
          <DashboardSidebar activeScreen={activeScreen} onChangeScreen={setActiveScreen} />

          <main
            id='main-content'
            className='flex-1 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-2xl lg:p-6'
          >
            <header className='mb-5 flex flex-wrap items-start justify-between gap-3'>
              <div>
                <p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Condominio / Industria</p>
                <h1 className='text-2xl font-semibold text-zinc-100 lg:text-3xl'>
                  Central Operacional de Seguranca
                </h1>
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge variant='outline' className='px-3 py-1'>
                  <Building2 className='mr-1 h-3.5 w-3.5' />
                  Edge Processing ON
                </Badge>
                <Badge variant={criticalCount > 0 ? 'danger' : 'default'} className='px-3 py-1'>
                  <Siren className='mr-1 h-3.5 w-3.5' />
                  {criticalCount > 0 ? `${criticalCount} alerta(s) criticos` : 'Sem alertas criticos'}
                </Badge>
              </div>
            </header>

            <AnimatePresence mode='wait'>
              <motion.section
                key={activeScreen}
                initial={{ opacity: 0, y: 18, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.995 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
              >
                {renderScreen()}
              </motion.section>
            </AnimatePresence>
          </main>
        </div>

        <VisitorAlertModal
          open={visitorModalOpen}
          visitorName='Camila Ferreira'
          destination='Torre A - Unidade 1203'
          photoUrl='https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=420&q=80'
          onApprove={approveVisitor}
          onDeny={denyVisitor}
        />
        <VitalsSheet user={selectedUser} open={sheetOpen} onOpenChange={setSheetOpen} />
        <Toaster />
      </div>
    </MotionConfig>
  );
}
