import { describe, it, expect } from 'vitest';

import scannerModule from '../src/adapters/ble/beaconScanner.js';

const { parseIBeacon } = scannerModule;

function buildIBeaconBuffer({ uuidHex, major, minor, txPower = -59 }) {
  const buffer = Buffer.alloc(25);
  buffer.writeUInt16LE(0x004c, 0);
  buffer.writeUInt8(0x02, 2);
  buffer.writeUInt8(0x15, 3);

  Buffer.from(uuidHex, 'hex').copy(buffer, 4);
  buffer.writeUInt16BE(major, 20);
  buffer.writeUInt16BE(minor, 22);
  buffer.writeInt8(txPower, 24);
  return buffer;
}

describe('parseIBeacon', () => {
  it('extrai uuid/major/minor de manufacturerData iBeacon', () => {
    const data = buildIBeaconBuffer({
      uuidHex: 'fda50693a4e24fb1afcfc6eb07647825',
      major: 100,
      minor: 7,
    });

    const parsed = parseIBeacon(data);
    expect(parsed).toEqual({
      uuid: 'fda50693-a4e2-4fb1-afcf-c6eb07647825',
      major: 100,
      minor: 7,
      tx_power: -59,
    });
  });

  it('retorna null para payload invalido', () => {
    const invalid = Buffer.from([0x00, 0x01, 0x02]);
    expect(parseIBeacon(invalid)).toBeNull();
  });
});
