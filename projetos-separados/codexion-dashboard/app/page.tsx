'use client';

import { useEffect, useMemo, useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { toast } from 'sonner';

import { AdminLogin } from '@/app/components/console/AdminLogin';
import { CommandBar } from '@/app/components/console/CommandBar';
import { CommandQueueBar } from '@/app/components/console/CommandQueueBar';
import { CondominiumOverview } from '@/app/components/console/CondominiumOverview';
import { ConfirmDialog } from '@/app/components/console/ConfirmDialog';
import { ContextPanel } from '@/app/components/console/ContextPanel';
import { Timeline } from '@/app/components/console/Timeline';
import { Toaster } from '@/app/components/ui/sonner';
import { useBluetoothWatch } from '@/app/hooks/useBluetoothWatch';
import { useEdgeWatchSession } from '@/app/hooks/useEdgeWatchSession';
import { useRealtimeFeed } from '@/app/hooks/useRealtimeFeed';
import { mockCommands } from '@/src/mock/commands';
import { mockCondominiums } from '@/src/mock/condominiums';
import type {
  CommandItem,
  CondominiumProfile,
  EventAction,
  EventActionType,
  EventType,
  FeedEvent,
} from '@/src/mock/types';

const eventTypeLabels: Record<EventType, string> = {
  intercom: 'Interfone',
  access: 'Acesso',
  patrol: 'Ronda',
  duress: 'Coacao',
  emergency: 'Emergencia',
};

type ConfirmationIntent =
  | {
      kind: 'emergency';
    }
  | {
      kind: 'event_action';
      event: FeedEvent;
      action: EventAction;
      requireReason: boolean;
      source: 'timeline' | 'context';
    }
  | null;

function requiresReason(intent: ConfirmationIntent) {
  if (!intent) {
    return false;
  }
  if (intent.kind === 'emergency') {
    return true;
  }
  return intent.requireReason;
}

function isDangerIntent(intent: ConfirmationIntent) {
  if (!intent) {
    return false;
  }
  if (intent.kind === 'emergency') {
    return true;
  }
  return Boolean(intent.action.critical);
}

function getCurrentTimeLabel() {
  return new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatHeartbeatLabel(value: string | null) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function randomId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now()}`;
}

function findAction(event: FeedEvent, type: EventActionType): EventAction | null {
  return event.actions.find((action) => action.type === type) || null;
}

function commandTemplateFromAction(
  event: FeedEvent,
  action: EventAction,
  reason: string,
  condominiumId: string
): Pick<CommandItem, 'condominiumId' | 'type' | 'target' | 'actor' | 'notes'> {
  switch (action.type) {
    case 'approve':
      return {
        condominiumId,
        type: 'access.approve',
        target: 'Portao Principal',
        actor: 'Operador Portaria',
        notes: `Interfone ${event.tower} ${event.unit}${reason ? ` | ${reason}` : ''}`,
      };
    case 'deny':
      return {
        condominiumId,
        type: 'access.deny',
        target: `${event.tower}/${event.unit}`,
        actor: 'Operador Portaria',
        notes: reason || 'Recusa operacional',
      };
    case 'open_gate':
      return {
        condominiumId,
        type: 'access.open_gate',
        target: 'Portao de Servico',
        actor: 'Operador Portaria',
        notes: reason || `Solicitacao manual ${event.tower}/${event.unit}`,
      };
    case 'view_camera':
      return {
        condominiumId,
        type: 'camera.open',
        target: `camera://${event.tower.toLowerCase().replace(/\s+/g, '-')}`,
        actor: 'Operador Portaria',
        notes: 'Visualizacao em tempo real',
      };
    case 'create_incident':
      return {
        condominiumId,
        type: 'incident.create',
        target: `${event.tower}/${event.unit}`,
        actor: 'Operador Portaria',
        notes: reason || 'Ocorrencia operacional aberta',
      };
    case 'acknowledge':
    default:
      return {
        condominiumId,
        type: 'event.acknowledge',
        target: event.id,
        actor: 'Operador Portaria',
        notes: reason || 'Evento reconhecido',
      };
  }
}

function eventFromAction(
  event: FeedEvent,
  action: EventAction,
  status: 'success' | 'fail'
): FeedEvent {
  const severity = status === 'success' ? 'info' : 'critical';
  const type = action.type === 'create_incident' ? 'emergency' : event.type;

  return {
    id: randomId('evt-local'),
    condominiumId: event.condominiumId,
    type,
    severity,
    title:
      status === 'success'
        ? `${action.label} executado`
        : `${action.label} falhou`,
    description:
      status === 'success'
        ? `Comando concluido para ${event.tower}/${event.unit}.`
        : `Comando nao confirmado para ${event.tower}/${event.unit}.`,
    tower: event.tower,
    unit: event.unit,
    timestamp: getCurrentTimeLabel(),
    payload: {
      source_event_id: event.id,
      action: action.type,
      status,
    },
    actions: [{ type: 'acknowledge', label: 'Reconhecer' }],
  };
}

function mapCondominiumById(items: CondominiumProfile[]) {
  const byId = new Map<string, CondominiumProfile>();
  for (const item of items) {
    byId.set(item.id, item);
  }
  return byId;
}

const condominiumById = mapCondominiumById(mockCondominiums);

export default function Page() {
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  const [selectedCondominiumId, setSelectedCondominiumId] = useState(
    mockCondominiums[0].id
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<EventType[]>([
    'intercom',
    'access',
    'patrol',
    'duress',
    'emergency',
  ]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [commands, setCommands] = useState<CommandItem[]>(mockCommands);
  const [edgePingMs, setEdgePingMs] = useState(31);
  const [confirmIntent, setConfirmIntent] = useState<ConfirmationIntent>(null);

  const edgeWatch = useEdgeWatchSession();

  const bluetooth = useBluetoothWatch({
    onConnected: async ({ device_id, device_name }) => {
      try {
        await edgeWatch.connectSession({ device_id, device_name });
      } catch (unknownError) {
        const message =
          unknownError instanceof Error
            ? unknownError.message
            : 'Falha ao registrar conexao do relogio no EDGE.';
        toast.error(message);
      }
    },
    onDisconnected: async ({ device_id }) => {
      try {
        await edgeWatch.disconnectSession({ device_id });
      } catch (_error) {
        // Session may already be closed on backend.
      }
    },
    onHeartbeat: async (sample) => {
      try {
        await edgeWatch.sendHeartbeat(sample);
      } catch (_error) {
        // Ignore transient EDGE heartbeat errors.
      }
    },
    onTelemetry: async (sample) => {
      try {
        await edgeWatch.sendTelemetry(sample);
      } catch (_error) {
        // Ignore telemetry submission failures while staying connected locally.
      }
    },
  });

  const {
    events,
    connectionState,
    loading,
    error,
    offlineMode,
    pushLocalEvent,
    clearFeed,
  } = useRealtimeFeed();

  useEffect(() => {
    const saved = window.localStorage.getItem('codexion-adm-session');
    if (saved === 'ok') {
      setAuthenticated(true);
      setAdminUser('ADM');
    }
  }, []);

  const handleLogin = () => {
    setAuthLoading(true);
    setAuthError(null);
    window.setTimeout(() => {
      const valid =
        adminUser.trim().toUpperCase() === 'ADM' &&
        adminPass.trim() === '123456';
      if (!valid) {
        setAuthLoading(false);
        setAuthError('Credenciais invalidas. Use ADM / 123456.');
        return;
      }
      window.localStorage.setItem('codexion-adm-session', 'ok');
      setAuthenticated(true);
      setAuthLoading(false);
      toast.success('ADM autenticado no console operacional');
    }, 500);
  };

  const selectedCondominium = condominiumById.get(selectedCondominiumId) || mockCondominiums[0];
  const edgeApiUrl = process.env.NEXT_PUBLIC_EDGE_API_URL || '';
  const edgeOnline = connectionState === 'online';
  const bleScanning = edgeOnline && !offlineMode;

  useEffect(() => {
    if (!edgeApiUrl) {
      const interval = window.setInterval(() => {
        if (!edgeOnline) {
          setEdgePingMs(0);
          return;
        }
        setEdgePingMs((previous) => {
          const jitter = Math.floor(Math.random() * 12) - 5;
          return Math.max(9, previous + jitter);
        });
      }, 2500);
      return () => window.clearInterval(interval);
    }

    let cancelled = false;

    const probe = async () => {
      const startedAt = performance.now();
      try {
        const response = await fetch(`${edgeApiUrl}/health`);
        if (!response.ok) {
          throw new Error(`health ${response.status}`);
        }
        if (!cancelled) {
          setEdgePingMs(Math.max(1, Math.round(performance.now() - startedAt)));
        }
      } catch (_error) {
        if (!cancelled) {
          setEdgePingMs(0);
        }
      }
    };

    probe();
    const interval = window.setInterval(() => {
      probe();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [edgeApiUrl, edgeOnline]);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events.filter((event) => {
      if (event.condominiumId !== selectedCondominiumId) {
        return false;
      }
      if (!activeFilters.includes(event.type)) {
        return false;
      }
      if (!q) {
        return true;
      }
      const payloadText = JSON.stringify(event.payload).toLowerCase();
      const haystack = [
        event.title,
        event.description,
        event.tower,
        event.unit,
        eventTypeLabels[event.type],
        payloadText,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [events, activeFilters, searchQuery, selectedCondominiumId]);

  useEffect(() => {
    if (filteredEvents.length === 0) {
      setSelectedEventId(null);
      return;
    }
    if (!selectedEventId || !filteredEvents.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(filteredEvents[0].id);
    }
  }, [filteredEvents, selectedEventId]);

  const selectedEvent = useMemo(
    () => filteredEvents.find((event) => event.id === selectedEventId) || null,
    [filteredEvents, selectedEventId]
  );

  const relatedEvents = useMemo(() => {
    if (!selectedEvent) {
      return [];
    }
    return filteredEvents.filter(
      (event) =>
        event.id !== selectedEvent.id &&
        event.tower === selectedEvent.tower &&
        event.unit === selectedEvent.unit
    );
  }, [filteredEvents, selectedEvent]);

  const condominiumCommands = useMemo(
    () => commands.filter((command) => command.condominiumId === selectedCondominiumId),
    [commands, selectedCondominiumId]
  );

  const auditTrail = useMemo(() => {
    if (!selectedEvent) {
      return condominiumCommands.slice(0, 5);
    }
    const lowerUnit = selectedEvent.unit.toLowerCase();
    const lowerTower = selectedEvent.tower.toLowerCase();
    const related = condominiumCommands.filter((command) => {
      const target = command.target.toLowerCase();
      const notes = (command.notes || '').toLowerCase();
      return (
        target.includes(lowerUnit) ||
        target.includes(lowerTower) ||
        notes.includes(lowerUnit) ||
        notes.includes(lowerTower)
      );
    });
    return (related.length > 0 ? related : condominiumCommands).slice(0, 5);
  }, [condominiumCommands, selectedEvent]);

  const activeAlerts = useMemo(
    () => filteredEvents.filter((event) => event.severity !== 'info').length,
    [filteredEvents]
  );

  const watchConnected = bluetooth.connected || Boolean(edgeWatch.activeSession?.connected);
  const watchName = bluetooth.deviceName || edgeWatch.activeSession?.device_name || null;
  const watchHeartbeatLabel = formatHeartbeatLabel(
    bluetooth.lastHeartbeatAt || edgeWatch.lastSeenAt
  );
  const watchHr =
    bluetooth.latestHr !== null && bluetooth.latestHr !== undefined
      ? bluetooth.latestHr
      : edgeWatch.latestHr;
  const watchBattery =
    bluetooth.batteryLevel !== null && bluetooth.batteryLevel !== undefined
      ? bluetooth.batteryLevel
      : edgeWatch.activeSession?.battery_level || null;

  const enqueueCommandExecution = (
    commandTemplate: Pick<
      CommandItem,
      'condominiumId' | 'type' | 'target' | 'actor' | 'notes'
    >,
    eventContext?: {
      sourceEvent: FeedEvent;
      action: EventAction;
    }
  ) => {
    const commandId = randomId('cmd');
    const timestamp = getCurrentTimeLabel();
    const base: CommandItem = {
      id: commandId,
      condominiumId: commandTemplate.condominiumId,
      type: commandTemplate.type,
      target: commandTemplate.target,
      timestamp,
      status: 'pending',
      actor: commandTemplate.actor,
      notes: commandTemplate.notes,
    };

    setCommands((previous) => [base, ...previous].slice(0, 80));
    toast.message(`Comando enfileirado: ${base.type}`);

    window.setTimeout(() => {
      setCommands((previous) =>
        previous.map((item) =>
          item.id === commandId ? { ...item, status: 'running' } : item
        )
      );
    }, 350);

    window.setTimeout(() => {
      const success = Math.random() > 0.16;
      const finalStatus: CommandItem['status'] = success ? 'success' : 'fail';
      setCommands((previous) =>
        previous.map((item) =>
          item.id === commandId ? { ...item, status: finalStatus } : item
        )
      );

      if (eventContext) {
        pushLocalEvent(
          eventFromAction(
            eventContext.sourceEvent,
            eventContext.action,
            success ? 'success' : 'fail'
          )
        );
      }
      if (success) {
        toast.success(`Comando ${base.type} concluido`);
      } else {
        toast.error(`Comando ${base.type} falhou`);
      }
    }, 1250);
  };

  const executeEventAction = (
    event: FeedEvent,
    action: EventAction,
    reason: string,
    source: 'timeline' | 'context'
  ) => {
    const template = commandTemplateFromAction(
      event,
      action,
      reason,
      selectedCondominiumId
    );
    enqueueCommandExecution(template, {
      sourceEvent: event,
      action,
    });
    if (source === 'timeline') {
      setSelectedEventId(event.id);
    }
  };

  const handleTimelineAction = (event: FeedEvent, actionType: EventActionType) => {
    const action = findAction(event, actionType);
    if (!action) {
      return;
    }
    const requireReason = Boolean(action.critical && event.severity === 'critical');
    if (requireReason) {
      setConfirmIntent({
        kind: 'event_action',
        event,
        action,
        requireReason: true,
        source: 'timeline',
      });
      return;
    }
    executeEventAction(event, action, '', 'timeline');
  };

  const handleContextAction = (
    event: FeedEvent,
    action: EventAction,
    options: { requireReason: boolean; source: 'context' }
  ) => {
    setConfirmIntent({
      kind: 'event_action',
      event,
      action,
      requireReason: options.requireReason,
      source: options.source,
    });
  };

  const handleRetryFailed = (command: CommandItem) => {
    setCommands((previous) =>
      previous.map((item) =>
        item.id === command.id ? { ...item, status: 'running' } : item
      )
    );
    toast.message(`Retry enviado para ${command.type}`);
    window.setTimeout(() => {
      const success = Math.random() > 0.22;
      setCommands((previous) =>
        previous.map((item) =>
          item.id === command.id
            ? { ...item, status: success ? 'success' : 'fail' }
            : item
        )
      );
    }, 900);
  };

  const toggleFilter = (type: EventType) => {
    setActiveFilters((previous) => {
      if (previous.includes(type)) {
        if (previous.length === 1) {
          return previous;
        }
        return previous.filter((item) => item !== type);
      }
      return [...previous, type];
    });
  };

  const confirmDialogTitle = useMemo(() => {
    if (!confirmIntent) {
      return '';
    }
    if (confirmIntent.kind === 'emergency') {
      return 'Ativar modo emergencia';
    }
    return `Confirmar acao: ${confirmIntent.action.label}`;
  }, [confirmIntent]);

  const confirmDialogDescription = useMemo(() => {
    if (!confirmIntent) {
      return '';
    }
    if (confirmIntent.kind === 'emergency') {
      return 'Esta acao acionara protocolo operacional e notificara a seguranca.';
    }
    return `${confirmIntent.event.tower}/${confirmIntent.event.unit} - ${confirmIntent.event.title}`;
  }, [confirmIntent]);

  const handleConfirmDialog = (reason: string) => {
    if (!confirmIntent) {
      return;
    }
    if (confirmIntent.kind === 'emergency') {
      const emergencyEvent: FeedEvent = {
        id: randomId('evt-emg'),
        condominiumId: selectedCondominiumId,
        type: 'emergency',
        severity: 'critical',
        title: 'Modo emergencia solicitado',
        description: 'Protocolo de contingencia iniciado pela portaria.',
        tower: 'Condominio',
        unit: 'GLOBAL',
        timestamp: getCurrentTimeLabel(),
        payload: {
          reason: reason || 'sem motivo informado',
        },
        actions: [{ type: 'acknowledge', label: 'Reconhecer' }],
      };
      pushLocalEvent(emergencyEvent);
      enqueueCommandExecution({
        condominiumId: selectedCondominiumId,
        type: 'emergency.lockdown',
        target: 'all_gates',
        actor: 'Operador Portaria',
        notes: reason || 'Ativacao manual',
      });
      toast.warning('Modo emergencia acionado');
      setConfirmIntent(null);
      return;
    }

    executeEventAction(
      confirmIntent.event,
      confirmIntent.action,
      reason,
      confirmIntent.source
    );
    setConfirmIntent(null);
  };

  const handleBluetoothToggle = async () => {
    if (bluetooth.connected) {
      await bluetooth.disconnect();
      toast.message('Relogio Bluetooth desconectado');
      return;
    }
    const ok = await bluetooth.connect();
    if (ok) {
      toast.success('Bluetooth conectado com sucesso');
    } else if (bluetooth.error) {
      toast.error(bluetooth.error);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('codexion-adm-session');
    setAuthenticated(false);
    setAdminPass('');
    toast.message('Sessao ADM encerrada');
  };

  if (!authenticated) {
    return (
      <>
        <AdminLogin
          username={adminUser}
          password={adminPass}
          loading={authLoading}
          error={authError}
          onUsernameChange={setAdminUser}
          onPasswordChange={setAdminPass}
          onSubmit={handleLogin}
        />
        <Toaster />
      </>
    );
  }

  return (
    <MotionConfig reducedMotion='user'>
      <div className='min-h-screen bg-[#070a0d] text-zinc-100'>
        <CommandBar
          adminName={adminUser || 'ADM'}
          condominiums={mockCondominiums.map((item) => item.name)}
          selectedCondominium={selectedCondominium.name}
          onSelectCondominium={(value) => {
            const match = mockCondominiums.find((item) => item.name === value);
            if (!match) {
              return;
            }
            setSelectedCondominiumId(match.id);
            setSelectedEventId(null);
          }}
          edgeOnline={edgeOnline}
          edgePingMs={edgePingMs}
          bleScanning={bleScanning}
          activeAlerts={activeAlerts}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          bluetoothSupported={bluetooth.supported}
          bluetoothConnected={watchConnected}
          bluetoothConnecting={bluetooth.connecting}
          bluetoothDeviceName={watchName}
          bluetoothHeartbeatAt={watchHeartbeatLabel}
          bluetoothHr={watchHr}
          bluetoothBattery={watchBattery}
          onBluetoothToggle={handleBluetoothToggle}
          onEmergencyRequest={() => setConfirmIntent({ kind: 'emergency' })}
        />

        <main id='main-content' className='mx-auto max-w-[1800px] px-3 pb-[140px] pt-[104px]'>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
          >
            <CondominiumOverview
              condominium={selectedCondominium}
              watchTelemetry={{
                connected: watchConnected,
                deviceName: watchName,
                hr: watchHr,
                spo2: edgeWatch.latestSpo2,
                steps: bluetooth.connected ? bluetooth.latestSteps : edgeWatch.latestSteps,
                battery: watchBattery,
                lastSeenAt: watchHeartbeatLabel,
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
            className='grid gap-2 lg:grid-cols-[1.5fr_1fr]'
          >
            <Timeline
              events={filteredEvents}
              selectedEventId={selectedEventId}
              activeFilters={activeFilters}
              loading={loading}
              error={error}
              offlineMode={offlineMode}
              onToggleFilter={toggleFilter}
              onSelectEvent={(event) => setSelectedEventId(event.id)}
              onAction={handleTimelineAction}
              onClearFeed={clearFeed}
            />

            <ContextPanel
              selectedEvent={selectedEvent}
              relatedEvents={relatedEvents}
              auditTrail={auditTrail}
              onActionRequest={handleContextAction}
            />
          </motion.div>

          <div className='mt-2 flex justify-end'>
            <button
              type='button'
              onClick={handleLogout}
              className='border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-zinc-300 transition hover:bg-zinc-800'
            >
              Sair da sessao ADM
            </button>
          </div>
        </main>

        <CommandQueueBar
          commands={condominiumCommands}
          onRetryFailed={handleRetryFailed}
        />

        <ConfirmDialog
          open={Boolean(confirmIntent)}
          title={confirmDialogTitle}
          description={confirmDialogDescription}
          requireReason={requiresReason(confirmIntent)}
          danger={isDangerIntent(confirmIntent)}
          confirmLabel='Confirmar'
          cancelLabel='Cancelar'
          onCancel={() => setConfirmIntent(null)}
          onConfirm={handleConfirmDialog}
        />

        <Toaster />
      </div>
    </MotionConfig>
  );
}
