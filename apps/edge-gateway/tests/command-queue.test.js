import { describe, it, expect } from 'vitest';
import queueModule from '../src/command-queue.js';

const {
  calculateBackoffDelayMs,
  computeFailureTransition,
  shouldExecuteLocallyOnly,
  transitionToDispatched,
  transitionToSuccess,
} = queueModule;

describe('command queue backoff', () => {
  it('calcula backoff exponencial progressivo', () => {
    expect(calculateBackoffDelayMs(1, 1000, 30000)).toBe(1000);
    expect(calculateBackoffDelayMs(2, 1000, 30000)).toBe(2000);
    expect(calculateBackoffDelayMs(3, 1000, 30000)).toBe(4000);
  });

  it('respeita limite maximo de backoff', () => {
    expect(calculateBackoffDelayMs(10, 1000, 8000)).toBe(8000);
  });
});

describe('command status transitions', () => {
  it('transita para dispatched e depois success', () => {
    const base = {
      id: 'cmd-1',
      status: 'pending',
      updated_at: '2026-01-01T00:00:00.000Z',
      next_attempt_at: '2026-01-01T00:00:00.000Z',
      last_error: 'old-error',
    };
    const dispatched = transitionToDispatched(base, '2026-01-01T00:01:00.000Z');
    expect(dispatched.status).toBe('dispatched');
    expect(dispatched.updated_at).toBe('2026-01-01T00:01:00.000Z');

    const success = transitionToSuccess(dispatched, '2026-01-01T00:01:05.000Z');
    expect(success.status).toBe('success');
    expect(success.last_error).toBeNull();
    expect(success.next_attempt_at).toBeNull();
  });

  it('marca failed com retry quando ainda ha tentativas', () => {
    const transition = computeFailureTransition({
      retryCount: 1,
      maxRetries: 5,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      nowMs: Date.UTC(2026, 0, 1, 0, 0, 0),
    });

    expect(transition.status).toBe('failed');
    expect(transition.retry_count).toBe(2);
    expect(transition.will_retry).toBe(true);
    expect(transition.next_attempt_at).toBe('2026-01-01T00:00:02.000Z');
  });

  it('marca failed terminal quando atinge max retries', () => {
    const transition = computeFailureTransition({
      retryCount: 4,
      maxRetries: 5,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      nowMs: Date.UTC(2026, 0, 1, 0, 0, 0),
    });

    expect(transition.status).toBe('failed');
    expect(transition.retry_count).toBe(5);
    expect(transition.will_retry).toBe(false);
    expect(transition.next_attempt_at).toBeNull();
  });
});

describe('offline mode local-first', () => {
  it('forca execucao local para comandos criticos quando offline', () => {
    expect(shouldExecuteLocallyOnly('access.approve', true)).toBe(true);
    expect(shouldExecuteLocallyOnly('access.deny', true)).toBe(true);
    expect(shouldExecuteLocallyOnly('emergency.lockdown', true)).toBe(true);
  });

  it('nao forca local-only quando online', () => {
    expect(shouldExecuteLocallyOnly('access.approve', false)).toBe(false);
  });
});
