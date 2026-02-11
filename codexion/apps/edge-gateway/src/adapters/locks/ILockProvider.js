class ILockProvider {
  /**
   * @param {'service_gate'|'main_gate'} target
   * @returns {Promise<{ok: boolean, target: string, provider: string, error?: string, details?: object}>}
   */
  async openGate(_target) {
    throw new Error('ILockProvider.openGate must be implemented by provider');
  }
}

module.exports = {
  ILockProvider,
};
