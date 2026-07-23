/**
 * Security & Verification Code Service for eNews Address Book
 * Manages Admin Security Passcode, 6-Digit Email/SMS Verification Codes, and Session Locking.
 */

const PIN_STORAGE_KEY = 'eNews_Admin_PIN_v1';
const LOCK_ENABLED_KEY = 'eNews_Security_Lock_Enabled_v1';
const DEFAULT_PIN = '1234';

export const getAdminPIN = () => {
  return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
};

export const setAdminPIN = (newPin) => {
  localStorage.setItem(PIN_STORAGE_KEY, newPin);
};

export const isSecurityLockEnabled = () => {
  const val = localStorage.getItem(LOCK_ENABLED_KEY);
  return val === null ? true : val === 'true'; // Default enabled
};

export const setSecurityLockEnabled = (enabled) => {
  localStorage.setItem(LOCK_ENABLED_KEY, enabled ? 'true' : 'false');
};

// Generate a random 6-digit OTP verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
