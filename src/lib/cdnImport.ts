/** Dynamic import for CDN ESM modules. Turbopack cannot resolve these statically. */

export class CdnLoadError extends Error {
  constructor(message = "Could not load required script from the network.") {
    super(message);
    this.name = "CdnLoadError";
  }
}

export function importFromUrl<T>(url: string): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const dyn = new Function("u", "return import(u)") as (u: string) => Promise<T>;
  return dyn(url).catch((err: unknown) => {
    throw err instanceof CdnLoadError
      ? err
      : new CdnLoadError(
          err instanceof Error ? err.message : "Could not load required script.",
        );
  });
}
