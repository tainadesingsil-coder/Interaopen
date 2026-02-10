const { ILockProvider } = require('./ILockProvider');
const { MockLockProvider } = require('./MockLockProvider');
const { RelayLockProvider } = require('./RelayLockProvider');

function createLockProviderFromEnv(env = process.env) {
  const providerName = String(env.LOCK_PROVIDER || 'mock')
    .trim()
    .toLowerCase();

  if (providerName === 'relay') {
    return new RelayLockProvider({
      endpoint: env.RELAY_LOCK_ENDPOINT,
      authToken: env.RELAY_LOCK_AUTH_TOKEN,
    });
  }

  return new MockLockProvider({
    delayMs: Number(env.MOCK_LOCK_DELAY_MS || 400),
    successRate: Number(env.MOCK_LOCK_SUCCESS_RATE || 0.9),
  });
}

module.exports = {
  ILockProvider,
  MockLockProvider,
  RelayLockProvider,
  createLockProviderFromEnv,
};
