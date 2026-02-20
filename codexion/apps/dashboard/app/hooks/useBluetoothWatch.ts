'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type BluetoothState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

type DeviceLike = {
  id?: string;
  name?: string | null;
  gatt?: {
    connected?: boolean;
    connect: () => Promise<unknown>;
    disconnect: () => void;
    getPrimaryService: (service: string) => Promise<any>;
  } | null;
  addEventListener?: (event: string, handler: () => void) => void;
  removeEventListener?: (event: string, handler: () => void) => void;
};

type WatchTelemetrySample = {
  device_id: string;
  hr: number;
  steps: number;
  spo2: number | null;
  timestamp: string;
  battery_level?: number | null;
};

interface UseBluetoothWatchOptions {
  onConnected?: (info: { device_id: string; device_name: string | null }) => void | Promise<void>;
  onDisconnected?: (info: { device_id: string }) => void | Promise<void>;
  onHeartbeat?: (sample: {
    device_id: string;
    timestamp: string;
    battery_level?: number | null;
    hr?: number | null;
    steps?: number | null;
    spo2?: number | null;
  }) => void | Promise<void>;
  onTelemetry?: (sample: WatchTelemetrySample) => void | Promise<void>;
}

const VVFIT_SERVICE_UUID_CANDIDATES = [
  'heart_rate',
  'battery_service',
  '0000fee0-0000-1000-8000-00805f9b34fb',
];

const VVFIT_NAME_HINTS = ['vvfit', 'm6', 'm7', 'smart watch', 'smartwatch'];

function normalizeName(name: string | null | undefined) {
  return String(name || '').trim().toLowerCase();
}

function nowIso() {
  return new Date().toISOString();
}

function parseHeartRate(value: DataView) {
  const flags = value.getUint8(0);
  const isUint16 = (flags & 0x01) === 1;
  return isUint16 ? value.getUint16(1, true) : value.getUint8(1);
}

export function useBluetoothWatch(options: UseBluetoothWatchOptions = {}) {
  const [state, setState] = useState<BluetoothState>('idle');
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceLike | null>(null);
  const [lastHeartbeatAt, setLastHeartbeatAt] = useState<string | null>(null);
  const [latestHr, setLatestHr] = useState<number | null>(null);
  const [latestSpo2, setLatestSpo2] = useState<number | null>(null);
  const [latestSteps, setLatestSteps] = useState<number>(0);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const heartbeatIntervalRef = useRef<number | null>(null);
  const metricsRef = useRef<{
    hr: number | null;
    spo2: number | null;
    steps: number;
    battery: number | null;
  }>({
    hr: null,
    spo2: null,
    steps: 0,
    battery: null,
  });

  const supported = useMemo(
    () => typeof navigator !== 'undefined' && Boolean((navigator as any).bluetooth),
    []
  );

  useEffect(() => {
    metricsRef.current = {
      hr: latestHr,
      spo2: latestSpo2,
      steps: latestSteps,
      battery: batteryLevel,
    };
  }, [latestHr, latestSpo2, latestSteps, batteryLevel]);

  const stopHeartbeatLoop = () => {
    if (heartbeatIntervalRef.current !== null) {
      window.clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const startHeartbeatLoop = (currentDeviceId: string) => {
    stopHeartbeatLoop();
    heartbeatIntervalRef.current = window.setInterval(() => {
      const timestamp = nowIso();
      const snapshot = metricsRef.current;
      setLastHeartbeatAt(timestamp);
      options.onHeartbeat?.({
        device_id: currentDeviceId,
        timestamp,
        battery_level: snapshot.battery,
        hr: snapshot.hr,
        steps: snapshot.steps,
        spo2: snapshot.spo2,
      });

      // Periodic telemetry fallback so operations keep flowing even when
      // notifications are sparse on some watch firmwares.
      if (typeof snapshot.hr === 'number') {
        options.onTelemetry?.({
          device_id: currentDeviceId,
          hr: snapshot.hr,
          steps: snapshot.steps,
          spo2: snapshot.spo2,
          timestamp,
          battery_level: snapshot.battery,
        });
      }
    }, 5000);
  };

  const sendImmediateHeartbeat = (currentDeviceId: string) => {
    const timestamp = nowIso();
    const snapshot = metricsRef.current;
    setLastHeartbeatAt(timestamp);
    options.onHeartbeat?.({
      device_id: currentDeviceId,
      timestamp,
      battery_level: snapshot.battery,
      hr: snapshot.hr,
      steps: snapshot.steps,
      spo2: snapshot.spo2,
    });

    if (typeof snapshot.hr === 'number') {
      options.onTelemetry?.({
        device_id: currentDeviceId,
        hr: snapshot.hr,
        steps: snapshot.steps,
        spo2: snapshot.spo2,
        timestamp,
        battery_level: snapshot.battery,
      });
    }
  };

  useEffect(() => {
    return () => {
      stopHeartbeatLoop();
    };
  }, []);

  useEffect(() => {
    if (!device) {
      return;
    }

    const onDisconnected = () => {
      stopHeartbeatLoop();
      setState('disconnected');
      if (deviceId) {
        options.onDisconnected?.({
          device_id: deviceId,
        });
      }
    };

    device.addEventListener?.('gattserverdisconnected', onDisconnected);
    return () => {
      device.removeEventListener?.('gattserverdisconnected', onDisconnected);
    };
  }, [device, deviceId]);

  const setupBatteryMonitor = async (selected: DeviceLike, currentDeviceId: string) => {
    try {
      const service = await selected.gatt?.getPrimaryService('battery_service');
      const characteristic = await service?.getCharacteristic?.('battery_level');
      if (!characteristic) {
        return;
      }
      const value = await characteristic.readValue();
      if (value) {
        const level = value.getUint8(0);
        setBatteryLevel(level);
        metricsRef.current.battery = level;
        options.onHeartbeat?.({
          device_id: currentDeviceId,
          timestamp: nowIso(),
          battery_level: level,
          hr: metricsRef.current.hr,
          steps: metricsRef.current.steps,
          spo2: metricsRef.current.spo2,
        });
      }
    } catch (_error) {
      // Battery service may not exist on every watch model.
    }
  };

  const setupHeartRateMonitor = async (selected: DeviceLike, currentDeviceId: string) => {
    try {
      const service = await selected.gatt?.getPrimaryService('heart_rate');
      const characteristic = await service?.getCharacteristic?.('heart_rate_measurement');
      if (!characteristic) {
        return;
      }

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
        const target = event.target as { value?: DataView };
        if (!target?.value) {
          return;
        }
        const hr = parseHeartRate(target.value);
        setLatestHr(hr);
        metricsRef.current.hr = hr;
        const sample: WatchTelemetrySample = {
          device_id: currentDeviceId,
          hr,
          steps: metricsRef.current.steps,
          spo2: metricsRef.current.spo2,
          timestamp: nowIso(),
          battery_level: metricsRef.current.battery,
        };
        options.onTelemetry?.(sample);
      });
    } catch (_error) {
      // Heart rate profile may be unavailable depending on firmware.
    }
  };

  const connect = async () => {
    if (!supported) {
      setError('Web Bluetooth nao disponivel neste navegador/dispositivo.');
      setState('error');
      return false;
    }

    try {
      setState('connecting');
      setError(null);

      const requestOptions = {
        acceptAllDevices: true,
        optionalServices: VVFIT_SERVICE_UUID_CANDIDATES,
      };

      const selected = await (navigator as any).bluetooth.requestDevice(requestOptions);
      const selectedName = selected.name || 'Dispositivo sem nome';
      const selectedId = String(selected.id || selectedName || 'watch-unknown');
      const normalized = normalizeName(selected.name);

      if (!VVFIT_NAME_HINTS.some((hint) => normalized.includes(hint))) {
        setError(
          `Conectado em "${selectedName}". Se nao for Vvfit, valide o modelo e servicos BLE.`
        );
      }

      if (!selected.gatt) {
        throw new Error('Dispositivo sem suporte GATT.');
      }

      await selected.gatt.connect();

      setDevice(selected);
      setDeviceName(selectedName);
      setDeviceId(selectedId);
      setState('connected');
      await options.onConnected?.({
        device_id: selectedId,
        device_name: selectedName,
      });

      await setupBatteryMonitor(selected, selectedId);
      await setupHeartRateMonitor(selected, selectedId);
      sendImmediateHeartbeat(selectedId);
      startHeartbeatLoop(selectedId);
      return true;
    } catch (unknownError) {
      setState('error');
      setDevice(null);
      setDeviceId(null);
      stopHeartbeatLoop();
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : 'Falha ao conectar via Bluetooth.';
      setError(message);
      return false;
    }
  };

  const disconnect = async () => {
    let disconnectedByGattEvent = false;
    try {
      if (device?.gatt?.connected) {
        device.gatt.disconnect();
        disconnectedByGattEvent = true;
      }
    } catch (_error) {
      // Ignore disconnect exceptions from browser adapters.
    }
    stopHeartbeatLoop();
    if (!disconnectedByGattEvent && deviceId) {
      await options.onDisconnected?.({ device_id: deviceId });
    }
    setDevice(null);
    setDeviceName(null);
    setDeviceId(null);
    setState('disconnected');
  };

  return {
    supported,
    state,
    deviceName,
    deviceId,
    error,
    connecting: state === 'connecting',
    connected: state === 'connected',
    lastHeartbeatAt,
    latestHr,
    latestSpo2,
    latestSteps,
    batteryLevel,
    connect,
    disconnect,
  };
}
