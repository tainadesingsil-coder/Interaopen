'use client';

import { useEffect, useMemo, useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { toast } from 'sonner';

import { CommandBar } from '@/app/components/console/CommandBar';
import { CommandQueueBar } from '@/app/components/console/CommandQueueBar';
import { ConfirmDialog } from '@/app/components/console/ConfirmDialog';
import { ContextPanel } from '@/app/components/console/ContextPanel';
import { Timeline } from '@/app/components/console/Timeline';
import { Toaster } from '@/app/components/ui/sonner';
import { useRealtimeFeed } from '@/app/hooks/useRealtimeFeed';
import { mockCommands } from '@/src/mock/commands';
import type {
  CommandItem,
  EventAction,
  EventActionType,
  EventType,
  FeedEvent,
} from '@/src/mock/types';

const condominiumOptions = [
  'Residencial Bella Vista',
  'Condomínio Parque Sul',
  'Condomínio Atlântico',
];

const eventTypeLabels: Record<EventType, string> = {
  intercom: 'Interfone',
  access: 'Acesso',
  patrol: 'Ronda',
  duress: 'Coação',
  emergency: 'Emergência',
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

function randomId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now()}`;
}

function findAction(event: FeedEvent, type: EventActionType): EventAction | null {
  return event.actions.find((action) => action.type === type) || null;
}

function commandTemplateFromAction(
  event: FeedEvent,
  action: EventAction,
  reason: string
): Pick<CommandItem, 'type' | 'target' | 'actor' | 'notes'> {
  switch (action.type) {
    case 'approve':
      return {
        type: 'access.approve',
        target: 'main_gate',
        actor: 'Operador Portaria',
        notes: `Interfone ${event.tower} ${event.unit}${reason ? ` | ${reason}` : ''}`,
      };
    case 'deny':
      return {
        type: 'access.deny',
        target: `${event.tower}/${event.unit}`,
        actor: 'Operador Portaria',
        notes: reason || 'Recusa operacional',
      };
    case 'open_gate':
      return {
        type: 'access.open_gate',
        target: 'service_gate',
        actor: 'Operador Portaria',
        notes: reason || `Solicitação manual ${event.tower}/${event.unit}`,
      };
    case 'view_camera':
      return {
        type: 'camera.open',
        target: `camera://${event.tower.toLowerCase().replace(/\s+/g, '-')}`,
        actor: 'Operador Portaria',
        notes: 'Visualização em tempo real',
      };
    case 'create_incident':
      return {
        type: 'incident.create',
        target: `${event.tower}/${event.unit}`,
        actor: 'Operador Portaria',
        notes: reason || 'Ocorrência operacional aberta',
      };
    case 'acknowledge':
    default:
      return {
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
    type,
    severity,
    title:
      status === 'success'
        ? `${action.label} executado`
        : `${action.label} falhou`,
    description:
      status === 'success'
        ? `Comando concluído para ${event.tower}/${event.unit}.`
        : `Comando não confirmado para ${event.tower}/${event.unit}.`,
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

export default function Page() {
  const [selectedCondominium, setSelectedCondominium] = useState(condominiumOptions[0]);
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

  const {
    events,
    connectionState,
    loading,
    error,
    offlineMode,
    pushLocalEvent,
    clearFeed,
  } = useRealtimeFeed();

  const edgeOnline = connectionState === 'online' || connectionState === 'mock';
  const bleScanning = edgeOnline && !offlineMode;

  useEffect(() => {
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
  }, [edgeOnline]);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events.filter((event) => {
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
  }, [events, activeFilters, searchQuery]);

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
    () => events.find((event) => event.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  const relatedEvents = useMemo(() => {
    if (!selectedEvent) {
      return [];
    }
    return events.filter(
      (event) =>
        event.id !== selectedEvent.id &&
        event.tower === selectedEvent.tower &&
        event.unit === selectedEvent.unit
    );
  }, [events, selectedEvent]);

  const auditTrail = useMemo(() => {
    if (!selectedEvent) {
      return commands.slice(0, 5);
    }
    const lowerUnit = selectedEvent.unit.toLowerCase();
    const lowerTower = selectedEvent.tower.toLowerCase();
    const related = commands.filter((command) => {
      const target = command.target.toLowerCase();
      const notes = (command.notes || '').toLowerCase();
      return (
        target.includes(lowerUnit) ||
        target.includes(lowerTower) ||
        notes.includes(lowerUnit) ||
        notes.includes(lowerTower)
      );
    });
    return (related.length > 0 ? related : commands).slice(0, 5);
  }, [commands, selectedEvent]);

  const activeAlerts = useMemo(
    () => events.filter((event) => event.severity !== 'info').length,
    [events]
  );

  const enqueueCommandExecution = (
    commandTemplate: Pick<CommandItem, 'type' | 'target' | 'actor' | 'notes'>,
    eventContext?: {
      sourceEvent: FeedEvent;
      action: EventAction;
    }
  ) => {
    const commandId = randomId('cmd');
    const timestamp = getCurrentTimeLabel();
    const base: CommandItem = {
      id: commandId,
      type: commandTemplate.type,
      target: commandTemplate.target,
      timestamp,
      status: 'pending',
      actor: commandTemplate.actor,
      notes: commandTemplate.notes,
    };

    setCommands((previous) => [base, ...previous].slice(0, 60));
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
        toast.success(`Comando ${base.type} concluído`);
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
    const template = commandTemplateFromAction(event, action, reason);
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
      return 'Ativar modo emergência';
    }
    return `Confirmar ação: ${confirmIntent.action.label}`;
  }, [confirmIntent]);

  const confirmDialogDescription = useMemo(() => {
    if (!confirmIntent) {
      return '';
    }
    if (confirmIntent.kind === 'emergency') {
      return 'Esta ação acionará protocolo operacional e notificará a segurança.';
    }
    return `${confirmIntent.event.tower}/${confirmIntent.event.unit} • ${confirmIntent.event.title}`;
  }, [confirmIntent]);

  const handleConfirmDialog = (reason: string) => {
    if (!confirmIntent) {
      return;
    }
    if (confirmIntent.kind === 'emergency') {
      const emergencyEvent: FeedEvent = {
        id: randomId('evt-emg'),
        type: 'emergency',
        severity: 'critical',
        title: 'Modo emergência solicitado',
        description: 'Protocolo de contingência iniciado pela portaria.',
        tower: 'Condomínio',
        unit: 'GLOBAL',
        timestamp: getCurrentTimeLabel(),
        payload: {
          reason: reason || 'sem motivo informado',
        },
        actions: [{ type: 'acknowledge', label: 'Reconhecer' }],
      };
      pushLocalEvent(emergencyEvent);
      enqueueCommandExecution({
        type: 'emergency.lockdown',
        target: 'all_gates',
        actor: 'Operador Portaria',
        notes: reason || 'Ativação manual',
      });
      toast.warning('Modo emergência acionado');
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

  return (
    <MotionConfig reducedMotion='user'>
      <div className='min-h-screen bg-[#070a0d] text-zinc-100'>
        <CommandBar
          condominiums={condominiumOptions}
          selectedCondominium={selectedCondominium}
          onSelectCondominium={setSelectedCondominium}
          edgeOnline={edgeOnline}
          edgePingMs={edgePingMs}
          bleScanning={bleScanning}
          activeAlerts={activeAlerts}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onEmergencyRequest={() => setConfirmIntent({ kind: 'emergency' })}
        />

        <main id='main-content' className='mx-auto max-w-[1800px] px-3 pb-[140px] pt-[104px]'>
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
        </main>

        <CommandQueueBar commands={commands} onRetryFailed={handleRetryFailed} />

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
