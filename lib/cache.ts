type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

class Cache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private ttl: number;

  constructor(ttlInSeconds: number = 300) { // Default 5 minutes TTL
    this.ttl = ttlInSeconds * 1000; // Convert to milliseconds
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const productCache = new Cache(300); // 5 minutes cache for products
