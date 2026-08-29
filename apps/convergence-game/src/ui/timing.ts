export class FlowAbortError extends Error {
  constructor() {
    super("Dialogue flow aborted");
    this.name = "FlowAbortError";
  }
}

export function isFlowAbort(error: unknown): boolean {
  return error instanceof FlowAbortError;
}

export class FlowClock {
  private paused = false;
  private readonly resumeWaiters = new Set<() => void>();

  constructor(private readonly reducedMotion: boolean) {}

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    for (const resolve of this.resumeWaiters) resolve();
    this.resumeWaiters.clear();
  }

  async wait(milliseconds: number, signal?: AbortSignal): Promise<void> {
    this.throwIfAborted(signal);
    if (this.reducedMotion) return;
    await this.waitUntilResumed(signal);
    this.throwIfAborted(signal);
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        signal?.removeEventListener("abort", abort);
        resolve();
      }, milliseconds);
      const abort = () => {
        clearTimeout(timeout);
        reject(new FlowAbortError());
      };
      signal?.addEventListener("abort", abort, { once: true });
    });
    await this.waitUntilResumed(signal);
  }

  private waitUntilResumed(signal?: AbortSignal): Promise<void> {
    this.throwIfAborted(signal);
    if (!this.paused) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const resume = () => {
        signal?.removeEventListener("abort", abort);
        resolve();
      };
      const abort = () => {
        this.resumeWaiters.delete(resume);
        reject(new FlowAbortError());
      };
      this.resumeWaiters.add(resume);
      signal?.addEventListener("abort", abort, { once: true });
    });
  }

  private throwIfAborted(signal?: AbortSignal): void {
    if (signal?.aborted) throw new FlowAbortError();
  }
}
