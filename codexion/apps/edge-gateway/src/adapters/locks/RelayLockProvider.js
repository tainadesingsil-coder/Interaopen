const { ILockProvider } = require('./ILockProvider');

class RelayLockProvider extends ILockProvider {
  constructor(options = {}) {
    super();
    this.endpoint = options.endpoint || null;
    this.authToken = options.authToken || null;
  }

  async openGate(_target) {
    throw new Error(
      'RelayLockProvider.openGate is not implemented yet. Configure real relay integration.'
    );
  }
}

module.exports = {
  RelayLockProvider,
};
