const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Types ──────────────────────────────────────────────────────────────────
export interface UserResponse {
  id: string; email: string; name: string; role: string; is_active: boolean;
}
export interface SignalResponse {
  id: string; signal_id: string; symbol: string; signal_type: string;
  entry_price: number | null; status: string; timestamp: string; strategy_id: string | null;
}
export interface SignalListResponse {
  total: number; page: number; page_size: number; items: SignalResponse[];
}
export interface OpenPositionResponse {
  trade_id: string; symbol: string; signal_type: string; entry_price: number;
  current_price: number | null; mtm: number | null; pnl_pct: number | null;
  stop_loss: number; target_price: number; quantity: number; status: string; entry_time: string;
}
export interface TradeResponse {
  id: string; trade_id: string; symbol: string; signal_type: string;
  entry_price: number; exit_price: number | null; stop_loss: number; target_price: number;
  quantity: number; gross_pnl: number | null; charges: number | null; net_pnl: number | null;
  status: string; reason: string | null; entry_time: string; exit_time: string | null;
}
export interface TradeListResponse {
  total: number; page: number; page_size: number; items: TradeResponse[];
}
export interface SummaryStats {
  total_signals: number;    // lifetime total
  today_signals: number;    // signals received today
  open_trades: number;
  today_pnl: number;
  overall_win_rate: number | null;
}
export interface StrategyMetrics {
  strategy_id: string; strategy_name: string; total_signals: number; total_trades: number;
  winners: number; losers: number; win_rate: number | null; profit_factor: number | null;
  avg_return: number | null; max_drawdown: number | null; net_pnl: number;
}
export interface MonthlyPnL { month: number; month_name: string; net_pnl: number; }
export interface EquityCurvePoint { date: string; cumulative_pnl: number; }
export interface StrategyResponse {
  id: string; name: string; description: string | null; is_active: boolean; created_at: string;
}
export interface AuditLogItem {
  id: string; user_id: string | null; action: string; details: string | null;
  ip_address: string | null; created_at: string;
}
export interface AuditLogResponse {
  total: number; page: number; page_size: number; items: AuditLogItem[];
}
export interface ReportData {
  summary: { total_trades: number; winners: number; losers: number; net_pnl: number; date_from: string; date_to: string; };
  trades: Record<string, unknown>[];
}

// ── Fetch helper ───────────────────────────────────────────────────────────
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tradedash_token');
}

// Generic GET helper — used by pages that need direct API access (e.g. Admin page)
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  return apiFetch<T>(path, options);
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tradedash_token');
      window.location.href = '/login';
    }
  }
  if (!res.ok) {
    const err = await res.text().catch(() => `${res.status}`);
    throw new Error(err || `API error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Auth ───────────────────────────────────────────────────────────────────
export async function loginUser(email: string, password: string) {
  return apiFetch<{ access_token: string; token_type: string; user: UserResponse }>(
    '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }
  );
}
export async function getCurrentUser() {
  return apiFetch<UserResponse>('/auth/me');
}

// ── Signals ────────────────────────────────────────────────────────────────
export async function getSignals(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<SignalListResponse>(`/signals${qs}`);
}

// ── Trades ─────────────────────────────────────────────────────────────────
export async function getOpenTrades() {
  return apiFetch<OpenPositionResponse[]>('/trades/open');
}
export async function getTrades(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<TradeListResponse>(`/trades${qs}`);
}
export async function exitTrade(tradeId: string, exitPrice: number, reason = 'manual-exit') {
  return apiFetch(`/trades/${tradeId}/exit`, {
    method: 'PUT', body: JSON.stringify({ exit_price: exitPrice, reason }),
  });
}

// ── Analytics ──────────────────────────────────────────────────────────────
export async function getAnalyticsSummary() {
  return apiFetch<SummaryStats>('/analytics/summary');
}
export async function getStrategyMetrics() {
  return apiFetch<StrategyMetrics[]>('/analytics/strategies');
}
export async function getMonthlyPnL(year?: number) {
  return apiFetch<MonthlyPnL[]>(`/analytics/monthly-pnl${year ? `?year=${year}` : ''}`);
}
export async function getEquityCurve() {
  return apiFetch<EquityCurvePoint[]>('/analytics/equity-curve');
}

// ── Reports ────────────────────────────────────────────────────────────────
export async function generateReport(params: Record<string, string>) {
  return apiFetch<ReportData>('/reports/generate?' + new URLSearchParams(params).toString());
}

// ── Strategies ─────────────────────────────────────────────────────────────
export async function getStrategies() {
  return apiFetch<StrategyResponse[]>('/strategies');
}
export async function updateStrategy(id: string, body: Partial<{ name: string; is_active: boolean }>) {
  return apiFetch<StrategyResponse>(`/strategies/${id}`, {
    method: 'PUT', body: JSON.stringify(body),
  });
}

// ── Users (admin) ──────────────────────────────────────────────────────────
export async function getUsers() {
  return apiFetch<UserResponse[]>('/users');
}
export async function createUser(body: { email: string; password: string; name: string; role: string }) {
  return apiFetch<UserResponse>('/users', { method: 'POST', body: JSON.stringify(body) });
}
export async function deleteUser(id: string) {
  return apiFetch<void>(`/users/${id}`, { method: 'DELETE' });
}

// ── Audit logs ─────────────────────────────────────────────────────────────
export async function getAuditLogs(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<AuditLogResponse>(`/audit-logs${qs}`);
}

// ── Admin ──────────────────────────────────────────────────────────────────
export async function testTelegram() {
  return apiFetch<{ status: string }>('/admin/telegram/test', { method: 'POST' });
}
export async function getAdminConfig() {
  return apiFetch<Record<string, unknown>>('/admin/config');
}
