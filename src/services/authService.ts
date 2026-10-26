/**
 * authService.ts — Client-side PIN authentication
 *
 * SECURITY DISCLOSURE (shown to user on registration):
 * - This is a LOCAL access gate only. No server is involved.
 * - Phone number is stored as SHA-256 hash — NOT verified via SMS.
 * - PIN is hashed with SHA-256(random-salt + pin). Never stored plain.
 * - Rate limiting: 5 failed attempts → 30-second lockout.
 * - This does NOT provide cross-device sync or true multi-user isolation.
 */

import { dbService } from './db';
import { AuthRecord } from '../types';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-().]/g, '').toLowerCase();
}

export interface AuthResult {
  success: boolean;
  error?: string;
  lockedUntil?: Date;
  attemptsRemaining?: number;
}

let sessionAuthenticated = false;

export const authService = {
  isSessionAuthenticated(): boolean { return sessionAuthenticated; },
  setSessionAuthenticated(v: boolean): void { sessionAuthenticated = v; },

  async isRegistered(): Promise<boolean> {
    const r = await dbService.getAuth();
    return r !== null;
  },

  async isLockedOut(): Promise<{ locked: boolean; lockedUntil?: Date }> {
    const r = await dbService.getAuth();
    if (!r?.lockedUntil) return { locked: false };
    const t = new Date(r.lockedUntil);
    if (new Date() < t) return { locked: true, lockedUntil: t };
    await dbService.saveAuth({ ...r, failedAttempts: 0, lockedUntil: null, updatedAt: new Date().toISOString() });
    return { locked: false };
  },

  async register(phoneNumber: string, pin: string, confirmPin: string): Promise<AuthResult> {
    const norm = normalizePhone(phoneNumber);
    if (!/^\+?[1-9]\d{6,14}$/.test(norm))
      return { success: false, error: 'Enter a valid phone number with country code (e.g. +91 98765 43210).' };
    if (!/^\d{6}$/.test(pin))
      return { success: false, error: 'PIN must be exactly 6 digits.' };
    if (pin !== confirmPin)
      return { success: false, error: 'PINs do not match. Please try again.' };

    const existing = await dbService.getAuth();
    if (existing)
      return { success: false, error: 'An account already exists on this device. Log in or reset data in Profile.' };

    const salt = generateSalt();
    const record: AuthRecord = {
      id: 'pin_auth',
      phoneNumberHash: await sha256(norm),
      pinHash: await sha256(salt + pin),
      salt,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await dbService.saveAuth(record);
    sessionAuthenticated = true;
    return { success: true };
  },

  async login(phoneNumber: string, pin: string): Promise<AuthResult> {
    const record = await dbService.getAuth();
    if (!record) return { success: false, error: 'No account found. Please register first.' };

    if (record.lockedUntil) {
      const t = new Date(record.lockedUntil);
      if (new Date() < t) return { success: false, error: `Too many attempts. Try again after ${t.toLocaleTimeString()}.`, lockedUntil: t };
    }

    const phoneHash = await sha256(normalizePhone(phoneNumber));
    const pinHash = await sha256(record.salt + pin);
    const match = phoneHash === record.phoneNumberHash && pinHash === record.pinHash;

    if (!match) {
      const attempts = record.failedAttempts + 1;
      const lockedUntil = attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS).toISOString() : null;
      await dbService.saveAuth({ ...record, failedAttempts: attempts, lockedUntil, updatedAt: new Date().toISOString() });
      const remaining = Math.max(0, MAX_ATTEMPTS - attempts);
      if (attempts >= MAX_ATTEMPTS) return { success: false, error: 'Too many failed attempts. Locked for 30 seconds.', attemptsRemaining: 0 };
      return { success: false, error: `Incorrect phone number or PIN. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`, attemptsRemaining: remaining };
    }

    await dbService.saveAuth({ ...record, failedAttempts: 0, lockedUntil: null, updatedAt: new Date().toISOString() });
    sessionAuthenticated = true;
    return { success: true };
  },

  async changePin(phone: string, currentPin: string, newPin: string): Promise<AuthResult> {
    const v = await this.login(phone, currentPin);
    if (!v.success) return v;
    if (!/^\d{6}$/.test(newPin)) return { success: false, error: 'New PIN must be exactly 6 digits.' };
    const r = await dbService.getAuth();
    if (!r) return { success: false, error: 'Auth record not found.' };
    const salt = generateSalt();
    await dbService.saveAuth({ ...r, pinHash: await sha256(salt + newPin), salt, updatedAt: new Date().toISOString() });
    return { success: true };
  },

  logout(): void { sessionAuthenticated = false; },
  async resetAccount(): Promise<void> { await dbService.clearAuth(); sessionAuthenticated = false; }
};
