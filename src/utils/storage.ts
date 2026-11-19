const STORAGE_PREFIX = 'sth_v1_';
const MAX_VALUE_CHARS = 180_000;

const memoryFallback = new Map<string, string>();

let storageAvailableCache: boolean | null = null;

export function isLocalStorageAvailable(): boolean {
  if (storageAvailableCache !== null) return storageAvailableCache;
  try {
    const testKey = `${STORAGE_PREFIX}__probe__`;
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    storageAvailableCache = true;
    return true;
  } catch {
    storageAvailableCache = false;
    return false;
  }
}

export function safeGetJson<T>(key: string, fallback: T): T {
  const fullKey = `${STORAGE_PREFIX}${key}`;
  try {
    const raw = isLocalStorageAvailable()
      ? window.localStorage.getItem(fullKey)
      : memoryFallback.get(fullKey) ?? null;
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function safeSetJson<T>(key: string, value: T): boolean {
  const fullKey = `${STORAGE_PREFIX}${key}`;
  try {
    const serialized = JSON.stringify(value);
    if (serialized.length > MAX_VALUE_CHARS) {
      return false;
    }
    if (isLocalStorageAvailable()) {
      window.localStorage.setItem(fullKey, serialized);
    } else {
      memoryFallback.set(fullKey, serialized);
    }
    return true;
  } catch {
    try {
      memoryFallback.set(fullKey, JSON.stringify(value));
    } catch {
      // Ignore unserializable fallback
    }
    return false;
  }
}

export function safeRemove(key: string): void {
  const fullKey = `${STORAGE_PREFIX}${key}`;
  memoryFallback.delete(fullKey);
  try {
    if (isLocalStorageAvailable()) {
      window.localStorage.removeItem(fullKey);
    }
  } catch {
    // Ignore storage removal failure
  }
}
