// node-polyfills.js
import { webcrypto } from 'node:crypto';

// Polyfill for crypto.getRandomValues
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

export {};
