'use client';

import { useEffect, useMemo, useState } from 'react';

type BluetoothState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

type DeviceLike = {
  name?: string | null;
  gatt?: {
    connected?: boolean;
    connect: () => Promise<unknown>;
    disconnect: () => void;
  } | null;
  addEventListener?: (event: string, handler: () => void) => void;
  removeEventListener?: (event: string, handler: () => void) => void;
};

const VVFIT_SERVICE_UUID_CANDIDATES = [
  '0000fee0-0000-1000-8000-00805f9b34fb',
  '0000180d-0000-1000-8000-00805f9b34fb',
];

const VVFIT_NAME_HINTS = ['vvfit', 'm6', 'm7', 'smart watch', 'smartwatch'];

function normalizeName(name: string | null | undefined) {
  return String(name || '').trim().toLowerCase();
}

export function useBluetoothWatch() {
  const [state, setState] = useState<BluetoothState>('idle');
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceLike | null>(null);

  const supported = useMemo(
    () => typeof navigator !== 'undefined' && Boolean((navigator as any).bluetooth),
    []
  );

  useEffect(() => {
    if (!device) {
      return;
    }

    const onDisconnected = () => {
      setState('disconnected');
    };

    device.addEventListener?.('gattserverdisconnected', onDisconnected);
    return () => {
      device.removeEventListener?.('gattserverdisconnected', onDisconnected);
    };
  }, [device]);

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
      const normalized = normalizeName(selected.name);

      if (!VVFIT_NAME_HINTS.some((hint) => normalized.includes(hint))) {
        // Permit connection anyway for compatibility, but warn user.
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
      setState('connected');
      return true;
    } catch (unknownError) {
      setState('error');
      setDevice(null);
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : 'Falha ao conectar via Bluetooth.';
      setError(message);
      return false;
    }
  };

  const disconnect = async () => {
    try {
      if (device?.gatt?.connected) {
        device.gatt.disconnect();
      }
    } catch (_error) {
      // Ignore disconnect exceptions from browser adapters.
    }
    setDevice(null);
    setDeviceName(null);
    setState('disconnected');
  };

  return {
    supported,
    state,
    deviceName,
    error,
    connecting: state === 'connecting',
    connected: state === 'connected',
    connect,
    disconnect,
  };
}
