'use client';

export class SessionLRU {
  private readonly namespace: string;
  private readonly capacity: number;
  private map = new Map<string, number>();

  constructor(namespace: string, capacity: number) {
    this.namespace = namespace;
    this.capacity = capacity;
    this.restore();
  }

  has(key: string) {
    return this.map.has(key);
  }

  add(key: string) {
    this.map.set(key, Date.now());
    if (this.map.size > this.capacity) {
      const entries = [...this.map.entries()].sort((a, b) => a[1] - b[1]);
      const [oldest] = entries[0];
      this.map.delete(oldest);
    }
    this.persist();
  }

  clear() {
    this.map.clear();
    sessionStorage.removeItem(this.namespace);
  }

  private persist() {
    try {
      const payload = JSON.stringify([...this.map.entries()]);
      sessionStorage.setItem(this.namespace, payload);
    } catch {
      // ignore storage errors
    }
  }

  private restore() {
    try {
      const raw = sessionStorage.getItem(this.namespace);
      if (!raw) {
        return;
      }
      const entries = JSON.parse(raw) as [string, number][];
      this.map = new Map(entries);
    } catch {
      this.map = new Map();
    }
  }
}
