/**
 * Safe wrapper around browser localStorage with in-memory fallback.
 */

const memoryStore = {};

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`Error reading localStorage key "${key}":`, e);
      return memoryStore[key] !== undefined ? memoryStore[key] : defaultValue;
    }
  },

  set: (key, value) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
      memoryStore[key] = value;
    } catch (e) {
      console.warn(`Error setting localStorage key "${key}":`, e);
      memoryStore[key] = value;
    }
  },

  remove: (key) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      delete memoryStore[key];
    } catch (e) {
      console.warn(`Error removing localStorage key "${key}":`, e);
      delete memoryStore[key];
    }
  },
};
