export function ToolContentFallback() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 space-y-3">
        <div className="h-9 w-48 animate-pulse rounded-md bg-border/70" />
        <div className="h-4 w-full max-w-md animate-pulse rounded-md bg-border/50" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-[12px] bg-border/40" />
        <div className="h-64 animate-pulse rounded-[12px] bg-border/40" />
      </div>
    </main>
  );
}
