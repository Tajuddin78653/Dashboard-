'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Mail,
  Lock,
  LogIn,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { loginUser } from '@/lib/api';
import { saveToken } from '@/lib/auth';

/* ── Mock stock-chart SVG decoration ───────────────────────────────────────── */
function MiniChart() {
  return (
    <svg
      viewBox="0 0 280 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full opacity-40"
      aria-hidden="true"
    >
      {/* Grid lines */}
      {[0, 20, 40, 60, 80].map((y) => (
        <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="#1a3380" strokeWidth="0.5" />
      ))}
      {/* Price line */}
      <polyline
        points="0,65 35,55 55,60 80,42 110,46 135,30 160,35 185,20 210,28 240,15 280,22"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Area fill */}
      <polygon
        points="0,65 35,55 55,60 80,42 110,46 135,30 160,35 185,20 210,28 240,15 280,22 280,80 0,80"
        fill="url(#chartGrad)"
        opacity="0.25"
      />
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Feature bullet ─────────────────────────────────────────────────────────── */
function FeatureBullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
      <span className="text-sm text-slate-300">{text}</span>
    </li>
  );
}

/* ── Role badge ─────────────────────────────────────────────────────────────── */
function RoleBadge({
  label,
  colorClass,
}: {
  label: string;
  colorClass: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        colorClass,
      )}
    >
      {label}
    </span>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await loginUser(email, password);
      saveToken(response.access_token);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    }
  }

  return (
    /*
     * Full-screen container — navy-950 background with a faint grid overlay
     * built from two layered repeating-linear-gradients.
     */
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-navy-950 lg:items-stretch"
      style={{
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 39px,
            rgba(18, 38, 102, 0.18) 39px,
            rgba(18, 38, 102, 0.18) 40px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 39px,
            rgba(18, 38, 102, 0.18) 39px,
            rgba(18, 38, 102, 0.18) 40px
          )
        `,
      }}
    >
      {/* ── Two-column layout: branding (left) + card (right) ── */}
      <div className="flex w-full max-w-screen-xl lg:divide-x lg:divide-navy-800">

        {/* ─────────────────────── LEFT — Branding panel ──────────────────────── */}
        <aside className="hidden lg:flex lg:w-1/2 flex-col items-center justify-between bg-navy-900 px-16 py-20">
          {/* Top: logo + tagline */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-gold-500/30 bg-navy-800 shadow-lg">
              <TrendingUp className="h-10 w-10 text-gold-500" />
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-gold-400">
              TradeDash
            </h1>
            <p className="mb-12 text-lg font-medium text-slate-400">
              Smart Trading. Real Insights.
            </p>

            {/* Feature bullets */}
            <ul className="space-y-5 text-left">
              <FeatureBullet text="Real-time Chartink signal processing" />
              <FeatureBullet text="Multi-strategy analytics & reporting" />
              <FeatureBullet text="Telegram alerts & broker integration" />
            </ul>
          </div>

          {/* Bottom: mini decorative chart */}
          <div className="w-full max-w-xs">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-muted">
              Live Performance
            </p>
            <MiniChart />
          </div>
        </aside>

        {/* ─────────────────────── RIGHT — Login card ─────────────────────────── */}
        <main className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2 lg:px-16">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="rounded-xl border-t-4 border-gold-500 bg-navy-900 shadow-2xl">
              <div className="px-8 pb-8 pt-8">

                {/* ── Header ── */}
                <div className="mb-8 flex flex-col items-center text-center">
                  {/* Show icon only on mobile (hidden on lg where the left panel has it) */}
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-gold-500/30 bg-navy-800 lg:hidden">
                    <TrendingUp className="h-7 w-7 text-gold-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gold-400">TradeDash</h2>
                  <p className="mt-1 text-sm text-muted">Professional Trading Dashboard</p>
                </div>

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    icon={Mail}
                    placeholder="trader@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />

                  <div className="space-y-1">
                    <Input
                      label="Password"
                      type="password"
                      icon={Lock}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-xs text-gold-500 hover:text-gold-400 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    className="mt-2 w-full"
                  >
                    {!loading && <LogIn className="h-4 w-4" />}
                    {loading ? 'Signing in…' : 'Sign In'}
                  </Button>
                  {error && (
                    <p className="mt-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-center text-sm text-danger">
                      {error}
                    </p>
                  )}
                </form>

                {/* ── Divider ── */}
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-navy-800" />
                  <span className="text-xs text-muted">or continue with</span>
                  <div className="h-px flex-1 bg-navy-800" />
                </div>

                {/* ── Role info strip ── */}
                <div className="rounded-lg border border-navy-800 bg-navy-950/60 px-4 py-4 text-center">
                  <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted">
                    Role-based access control
                  </p>
                  <div className="flex justify-center gap-2">
                    <RoleBadge
                      label="Admin"
                      colorClass="bg-gold-500/15 text-gold-400 ring-1 ring-gold-500/30"
                    />
                    <RoleBadge
                      label="Trader"
                      colorClass="bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30"
                    />
                    <RoleBadge
                      label="Viewer"
                      colorClass="bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-muted">
              © 2025 TradeDash. Secure trading platform.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
