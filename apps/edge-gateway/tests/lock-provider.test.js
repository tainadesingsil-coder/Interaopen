import { describe, it, expect } from 'vitest';
import locksModule from '../src/adapters/locks/index.js';

const { MockLockProvider, RelayLockProvider } = locksModule;

describe('MockLockProvider', () => {
  it('abre portao com sucesso quando random abaixo da taxa', async () => {
    const provider = new MockLockProvider({
      delayMs: 0,
      successRate: 0.9,
      randomFn: () => 0.1,
    });

    const result = await provider.openGate('main_gate');
    expect(result.ok).toBe(true);
    expect(result.target).toBe('main_gate');
    expect(result.provider).toBe('mock');
  });

  it('falha quando random acima da taxa', async () => {
    const provider = new MockLockProvider({
      delayMs: 0,
      successRate: 0.9,
      randomFn: () => 0.95,
    });

    const result = await provider.openGate('service_gate');
    expect(result.ok).toBe(false);
    expect(result.target).toBe('service_gate');
    expect(result.error).toBe('mock_gate_open_failed');
  });
});

describe('RelayLockProvider', () => {
  it('mantem assinatura e retorna not implemented', async () => {
    const provider = new RelayLockProvider({
      endpoint: 'http://relay.local',
    });
    await expect(provider.openGate('main_gate')).rejects.toThrow(
      'RelayLockProvider.openGate is not implemented yet'
    );
  });
});
