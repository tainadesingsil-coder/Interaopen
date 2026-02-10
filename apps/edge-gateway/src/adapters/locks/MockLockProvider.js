const { ILockProvider } = require('./ILockProvider');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class MockLockProvider extends ILockProvider {
  constructor(options = {}) {
    super();
    this.delayMs = Number(options.delayMs ?? 400);
    this.successRate = Number(options.successRate ?? 0.9);
    this.randomFn = options.randomFn ?? Math.random;
  }

  async openGate(target) {
    const startedAt = Date.now();
    await sleep(this.delayMs);
    const success = this.randomFn() < this.successRate;

    if (success) {
      return {
        ok: true,
        provider: 'mock',
        target,
        details: {
          simulated_delay_ms: this.delayMs,
          elapsed_ms: Date.now() - startedAt,
        },
      };
    }

    return {
      ok: false,
      provider: 'mock',
      target,
      error: 'mock_gate_open_failed',
      details: {
        simulated_delay_ms: this.delayMs,
        elapsed_ms: Date.now() - startedAt,
      },
    };
  }
}

module.exports = {
  MockLockProvider,
};
