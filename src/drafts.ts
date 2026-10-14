import { randomUUID } from "node:crypto";
import type { Language } from "./contrast.js";

export type Binding = { user: string; guild: string; channel: string; message: string };
type Draft = Binding & { content: string; lang: Language; expires: number };
export class Drafts {
  private readonly entries = new Map<string, Draft>();
  private readonly cooldowns = new Map<string, number>();
  constructor(private readonly now: () => number = Date.now) {}
  sweep() {
    for (const [key, d] of this.entries) if (d.expires <= this.now()) this.entries.delete(key);
    for (const [key, expiry] of this.cooldowns)
      if (expiry <= this.now()) this.cooldowns.delete(key);
  }
  reserve(key: string, ms: number): boolean {
    this.sweep();
    if (this.cooldowns.has(key) || this.cooldowns.size >= 500) return false;
    this.cooldowns.set(key, this.now() + ms);
    return true;
  }
  create(binding: Binding, content: string, lang: Language): string {
    this.sweep();
    if (this.entries.size >= 100) throw new Error("capacity");
    const id = randomUUID();
    this.entries.set(id, { ...binding, content, lang, expires: this.now() + 300_000 });
    return id;
  }
  bindMessage(id: string, message: string) {
    const d = this.entries.get(id);
    if (d) d.message = message;
  }
  find(id: string, binding: Binding): Draft | undefined {
    this.sweep();
    const d = this.entries.get(id);
    if (
      !d?.message ||
      d.user !== binding.user ||
      d.guild !== binding.guild ||
      d.channel !== binding.channel ||
      d.message !== binding.message
    )
      return undefined;
    return d;
  }
  remove(id: string) {
    this.entries.delete(id);
  }
  consume(id: string, binding: Binding, share: boolean): Draft | undefined {
    const d = this.find(id, binding);
    if (!d) return undefined;
    if (share && !this.reserve(`channel:${d.channel}`, 60_000)) return undefined;
    this.entries.delete(id);
    return d;
  }
}
