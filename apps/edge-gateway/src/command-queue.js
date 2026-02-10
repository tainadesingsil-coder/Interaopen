const MAX_RETRIES_DEFAULT = 5;
const RETRY_BASE_MS_DEFAULT = 1000;
const RETRY_MAX_MS_DEFAULT = 30000;

const CRITICAL_COMMAND_TYPES = new Set([
  'access.approve',
  'access.deny',
  'emergency.lockdown',
]);

function calculateBackoffDelayMs(
  retryCount,
  baseDelayMs = RETRY_BASE_MS_DEFAULT,
  maxDelayMs = RETRY_MAX_MS_DEFAULT
) {
  const normalizedRetry = Math.max(1, retryCount);
  const delay = baseDelayMs * 2 ** (normalizedRetry - 1);
  return Math.min(maxDelayMs, delay);
}

function computeFailureTransition({
  retryCount,
  maxRetries = MAX_RETRIES_DEFAULT,
  baseDelayMs = RETRY_BASE_MS_DEFAULT,
  maxDelayMs = RETRY_MAX_MS_DEFAULT,
  nowMs = Date.now(),
}) {
  const nextRetryCount = retryCount + 1;
  const willRetry = nextRetryCount < maxRetries;
  const nextAttemptAt = willRetry
    ? new Date(
        nowMs + calculateBackoffDelayMs(nextRetryCount, baseDelayMs, maxDelayMs)
      ).toISOString()
    : null;

  return {
    status: 'failed',
    retry_count: nextRetryCount,
    will_retry: willRetry,
    next_attempt_at: nextAttemptAt,
  };
}

function shouldExecuteLocallyOnly(commandType, offlineMode) {
  return Boolean(offlineMode && CRITICAL_COMMAND_TYPES.has(commandType));
}

function transitionToDispatched(command, updatedAtIso) {
  return {
    ...command,
    status: 'dispatched',
    updated_at: updatedAtIso,
  };
}

function transitionToSuccess(command, updatedAtIso) {
  return {
    ...command,
    status: 'success',
    updated_at: updatedAtIso,
    last_error: null,
    next_attempt_at: null,
  };
}

module.exports = {
  MAX_RETRIES_DEFAULT,
  RETRY_BASE_MS_DEFAULT,
  RETRY_MAX_MS_DEFAULT,
  CRITICAL_COMMAND_TYPES,
  calculateBackoffDelayMs,
  computeFailureTransition,
  shouldExecuteLocallyOnly,
  transitionToDispatched,
  transitionToSuccess,
};
