const { EventEmitter } = require('events');

function normalizeUuid(uuidRaw) {
  const hex = String(uuidRaw || '')
    .toLowerCase()
    .replace(/[^0-9a-f]/g, '');
  if (hex.length !== 32) {
    return null;
  }
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function parseIBeacon(manufacturerData) {
  if (!manufacturerData || manufacturerData.length < 25) {
    return null;
  }

  const companyId = manufacturerData.readUInt16LE(0);
  const beaconType = manufacturerData.readUInt8(2);
  const dataLength = manufacturerData.readUInt8(3);

  if (companyId !== 0x004c || beaconType !== 0x02 || dataLength !== 0x15) {
    return null;
  }

  const uuidHex = manufacturerData.slice(4, 20).toString('hex');
  const uuid = normalizeUuid(uuidHex);
  if (!uuid) {
    return null;
  }

  return {
    uuid,
    major: manufacturerData.readUInt16BE(20),
    minor: manufacturerData.readUInt16BE(22),
    tx_power: manufacturerData.readInt8(24),
  };
}

class BeaconScanner extends EventEmitter {
  constructor(options = {}) {
    super();
    this.logger = options.logger || console;
    this.allowDuplicates = options.allowDuplicates !== false;
    this.noble = options.nobleModule || null;
    this.running = false;
    this.available = false;

    this._onStateChange = this._onStateChange.bind(this);
    this._onDiscover = this._onDiscover.bind(this);
  }

  isRunning() {
    return this.running;
  }

  _loadNoble() {
    if (this.noble) {
      return this.noble;
    }

    try {
      // Noble-compatible maintained fork.
      this.noble = require('@abandonware/noble');
      return this.noble;
    } catch (_error) {
      try {
        // Fallback to original package name, if available.
        this.noble = require('noble');
        return this.noble;
      } catch (_error2) {
        return null;
      }
    }
  }

  async _startScanning() {
    if (!this.noble) {
      return;
    }
    if (typeof this.noble.startScanningAsync === 'function') {
      await this.noble.startScanningAsync([], this.allowDuplicates);
      return;
    }
    await new Promise((resolve, reject) => {
      this.noble.startScanning([], this.allowDuplicates, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  async _stopScanning() {
    if (!this.noble) {
      return;
    }
    if (typeof this.noble.stopScanningAsync === 'function') {
      await this.noble.stopScanningAsync();
      return;
    }
    await new Promise((resolve) => {
      this.noble.stopScanning(() => resolve());
    });
  }

  async start() {
    if (this.running) {
      return true;
    }

    const noble = this._loadNoble();
    if (!noble) {
      this.available = false;
      this.logger.warn(
        'BLE scanner desativado: Noble nao encontrado. Instale @abandonware/noble.'
      );
      return false;
    }

    this.available = true;
    noble.on('stateChange', this._onStateChange);
    noble.on('discover', this._onDiscover);

    if (noble.state === 'poweredOn') {
      try {
        await this._startScanning();
        this.running = true;
      } catch (error) {
        this.logger.error('Falha ao iniciar scanning BLE:', error);
        this.running = false;
      }
    } else {
      this.logger.info(
        `BLE aguardando adaptador poweredOn (estado atual: ${noble.state || 'unknown'})`
      );
    }

    this.emit('status', {
      available: this.available,
      running: this.running,
      state: noble.state || 'unknown',
    });
    return this.running;
  }

  async stop() {
    if (!this.noble) {
      this.running = false;
      return;
    }
    try {
      await this._stopScanning();
    } catch (_error) {
      // Ignore adapter stop errors on shutdown.
    }
    this.noble.removeListener('stateChange', this._onStateChange);
    this.noble.removeListener('discover', this._onDiscover);
    this.running = false;
  }

  async _onStateChange(state) {
    this.emit('status', {
      available: this.available,
      running: this.running,
      state,
    });

    if (state === 'poweredOn') {
      try {
        await this._startScanning();
        this.running = true;
      } catch (error) {
        this.running = false;
        this.logger.error('Falha ao iniciar scanning após stateChange:', error);
      }
      return;
    }

    this.running = false;
    try {
      await this._stopScanning();
    } catch (_error) {
      // Ignore when adapter is transitioning.
    }
  }

  _onDiscover(peripheral) {
    const manufacturerData = peripheral?.advertisement?.manufacturerData;
    const beacon = parseIBeacon(manufacturerData);
    if (!beacon) {
      return;
    }

    this.emit('beacon', {
      ...beacon,
      rssi: Number(peripheral?.rssi ?? -200),
      address: peripheral?.address || null,
      local_name: peripheral?.advertisement?.localName || null,
      seen_at: new Date().toISOString(),
    });
  }
}

module.exports = {
  BeaconScanner,
  parseIBeacon,
  normalizeUuid,
};
