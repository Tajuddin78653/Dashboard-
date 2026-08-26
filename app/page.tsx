export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy-950">
      <div className="animate-fade-in flex flex-col items-center gap-4 text-center">
        {/* Gold accent bar */}
        <div className="h-1 w-24 rounded-full bg-gold-500" />

        <h1 className="text-3xl font-semibold tracking-tight text-gold-400">
          TradeDash
        </h1>
        <p className="text-base text-muted">
          Design System Loading&hellip;
        </p>

        {/* Spinner */}
        <div className="mt-4 h-6 w-6 animate-spin rounded-full border-2 border-gold-600 border-t-gold-400" />
      </div>
    </main>
  );
}
