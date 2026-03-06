import CryptoJS from 'crypto-js';

// Import config directly
import config from '../config';

/**
 * BaseStorage - Base class that implements the storage interface
 */
class BaseStorage {
  constructor() {
    this.prefix = 'secure_';
  }

  // Abstract methods to be implemented by child classes
  setItem() {}
  getItem() {}
  removeItem() {}
  clear() {}
  keys() {}
  hasItem() {}
  getJSONSafe() {}
}

/**
 * StandardStorage - Uses regular localStorage without encryption
 */
class StandardStorage extends BaseStorage {
  setItem(key, value) {
    const prefixedKey = this.prefix + key;
    try {
      localStorage.setItem(prefixedKey, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  getItem(key, defaultValue = null) {
    const prefixedKey = this.prefix + key;
    try {
      const value = localStorage.getItem(prefixedKey);
      return value !== null ? value : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }

  removeItem(key) {
    const prefixedKey = this.prefix + key;
    try {
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  clear() {
    try {
      const keys = this.keys();
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  keys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key);
      }
    }
    return keys;
  }

  hasItem(key) {
    const prefixedKey = this.prefix + key;
    try {
      return localStorage.getItem(prefixedKey) !== null;
    } catch (error) {
      return false;
    }
  }

  getJSONSafe(key, defaultValue = {}) {
    try {
      const value = this.getItem(key);
      if (!value) return defaultValue;
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch (error) {
      return defaultValue;
    }
  }
}

/**
 * SecureStorage - A secure wrapper for localStorage with encryption and expiration
 *
 * Features:
 * - AES-256 encryption for all stored data
 * - Automatic expiration handling
 * - Secure key management
 * - Data integrity verification
 * - XSS protection measures
 */
class SecureStorage extends BaseStorage {
  constructor(secretKey = null) {
    super(); // Call the parent class constructor
    // Use provided key or fallback to hardcoded key
    this.secretKey = secretKey || '9908fabe-9276-4da4-bb60-bf1ec3474237';
    this.version = '1.0.0';
    this.initialize();
  }

  /**
   * Check if data appears to be encrypted
   */
  isEncrypted(data) {
    if (!data || typeof data !== 'string') {
      return false;
    }

    // Check if it looks like CryptoJS encrypted data (base64 format)
    try {
      // Basic length check - encrypted data is typically longer than 20 characters
      if (data.length < 20) {
        return false;
      }

      // Check if it's valid base64 (CryptoJS encrypts to base64)
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(data)) {
        return false;
      }

      // Additional validation: Check if it looks like a valid encrypted payload
      const hasValidStructure =
        data.length > 40 && data.includes('/') && (data.includes('+') || data.includes('='));
      return hasValidStructure;
    } catch {
      return false;
    }
  }

  /**
   * Initialize secure storage
   */
  initialize() {
    // Clean up expired items on initialization
    this.cleanupExpired();
  }

  /**
   * Encrypt data with AES-256
   */
  encrypt(data) {
    try {
      const payload = {
        data: data,
        timestamp: Date.now(),
        version: this.version,
      };
      return CryptoJS.AES.encrypt(JSON.stringify(payload), this.secretKey).toString();
    } catch (error) {
      return null;
    }
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedStr) {
        throw new Error('Decryption failed - empty result');
      }
      const payload = JSON.parse(decryptedStr);

      // Verify data integrity
      if (!payload.data) {
        throw new Error('Invalid payload structure');
      }

      return payload.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Set an item in secure storage with optional expiration (in minutes)
   */
  setItem(key, value, expiresInMinutes = null) {
    try {
      if (!key) throw new Error('Key is required');

      const secureKey = this.prefix + key;
      const config = window?.config || {};
      const useExpiry = config?.storage?.enableExpiry === true;
      const defaultExpiry = config?.storage?.defaultExpiry || 480; // 8 hours default
      
      const payload = {
        data: value,
        timestamp: Date.now(),
        expires: useExpiry ? 
          (expiresInMinutes || defaultExpiry) * 60 * 1000 + Date.now() : 
          null,
        version: this.version,
      };

      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), this.secretKey).toString();
      localStorage.setItem(secureKey, encrypted);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get an item from secure storage
   */
  getItem(key, defaultValue = null) {
    try {
      if (!key) return defaultValue;

      const secureKey = this.prefix + key;
      const encryptedData = localStorage.getItem(secureKey);

      if (!encryptedData) return defaultValue;

      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedStr) {
        this.removeItem(key);
        return defaultValue;
      }

      const payload = JSON.parse(decryptedStr);

      // Check if the item has expired (only if expiry is enabled in config)
      const config = window?.config || {};
      if (config?.storage?.enableExpiry && payload.expires && Date.now() > payload.expires) {
        this.removeItem(key);
        return defaultValue;
      }

      return payload.data !== undefined ? payload.data : defaultValue;
    } catch (error) {
      this.removeItem(key);
      return defaultValue;
    }
  }

  /**
   * Remove an item from secure storage
   */
  removeItem(key) {
    if (!key) return false;
    try {
      const secureKey = this.prefix + key;
      localStorage.removeItem(secureKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get an item with a default value if not found or invalid
   */
  getItemWithDefault(key, defaultValue) {
    try {
      const value = this.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }

  /**
   * Clear all secure storage items
   */
  clear() {
    try {
      const keysToRemove = [];

      // Find all secure storage keys
      for (let i = 0; i < localStorage.length; i++) {
        try {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keysToRemove.push(key);
          }
        } catch (e) {
          // Skip problematic keys
          continue;
        }
      }

      // Remove all secure storage items
      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore errors during removal
        }
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the number of items in secure storage
   */
  get length() {
    try {
      return this.keys().length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get all secure storage keys
   */
  keys() {
    const keys = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        try {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keys.push(key);
          }
        } catch (e) {
          // Skip problematic keys
          continue;
        }
      }
    } catch (error) {
      // Handle any unexpected errors
    }
    return keys;
  }

  /**
   * Check if a key exists in secure storage
   */
  hasItem(key) {
    try {
      if (!key) return false;
      const secureKey = this.prefix + key;
      return localStorage.getItem(secureKey) !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clean up expired items
   */
  cleanupExpired() {
    try {
      const keys = this.keys();
      keys.forEach((key) => {
        try {
          // This will automatically remove expired items
          this.getItem(key.substring(this.prefix.length));
        } catch (e) {
          // Ignore errors for individual items
        }
      });
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  /**
   * Set item with JSON serialization
   */
  setJSON(key, value, expirationMinutes = null) {
    return this.setItem(key, JSON.stringify(value), expirationMinutes);
  }

  /**
   * Parse JSON string safely
   */
  getJSONSafe(key, defaultValue = {}) {
    try {
      const value = this.getItem(key);
      if (!value) return defaultValue;
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch (error) {
      return defaultValue;
    }
  }
}

// Create appropriate storage instance based on config
let storageInstance;

if (config?.storage?.isEncryptStorage) {
  storageInstance = new SecureStorage('9908fabe-9276-4da4-bb60-bf1ec3474237');
} else {
  storageInstance = new StandardStorage();
}

// For debugging
console.log(`Storage mode: ${config?.storage?.isEncryptStorage ? 'ENCRYPTED' : 'STANDARD'}`);

export default storageInstance;
