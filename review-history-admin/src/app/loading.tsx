export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-5 py-4 shadow-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm font-medium text-foreground">Loading admin...</span>
      </div>
    </div>
  );
}

