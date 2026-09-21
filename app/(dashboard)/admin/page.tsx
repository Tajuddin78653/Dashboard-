'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Settings, Users, BarChart2, Link, MessageCircle, ClipboardList,
  UserPlus, Eye, EyeOff, Clipboard, Save, Send,
  Edit2, Trash2, CheckCircle, ShieldCheck, Landmark, X, Loader2,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Switch } from '@/components/ui';
import { cn } from '@/lib/utils';
import { apiRequest, getUsers, createUser, updateUser, deleteUser } from '@/lib/api';
import type { AdminConfig, UserResponse } from '@/lib/api';

type Section = 'users' | 'strategies' | 'webhook' | 'broker' | 'telegram' | 'audit';

const SECTIONS: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'users',      label: 'Users',       icon: Users },
  { id: 'strategies', label: 'Strategies',  icon: BarChart2 },
  { id: 'webhook',    label: 'Webhook',     icon: Link },
  { id: 'broker',     label: 'Broker',      icon: Landmark },
  { id: 'telegram',   label: 'Telegram',    icon: MessageCircle },
  { id: 'audit',      label: 'Audit Logs',  icon: ClipboardList },
];

const AUDIT_LOGS = [
  { time: '13:45:12', user: 'Tajuddin', action: 'Login',  details: 'Successful login from browser', ip: '192.168.1.10' },
  { time: '13:44:58', user: 'System',   action: 'Signal', details: 'New signal: RELIANCE BUY @ 2921', ip: '—' },
  { time: '13:43:20', user: 'Tajuddin', action: 'Trade',  details: 'Entered RELIANCE BUY, Qty 10', ip: '192.168.1.10' },
  { time: '13:40:05', user: 'Ahmed Trader', action: 'Login', details: 'Successful login', ip: '10.0.0.55' },
  { time: '13:38:44', user: 'System',   action: 'Signal', details: 'New signal: TCS SELL @ 3875', ip: '—' },
  { time: '13:30:11', user: 'Tajuddin', action: 'Config', details: 'Updated Telegram bot token', ip: '192.168.1.10' },
  { time: '13:22:09', user: 'System',   action: 'Signal', details: 'New signal: HDFCBANK BUY @ 1710', ip: '—' },
  { time: '13:15:00', user: 'Ahmed Trader', action: 'Trade', details: 'Exit WIPRO, P&L +₹600', ip: '10.0.0.55' },
  { time: '13:10:30', user: 'Tajuddin', action: 'Config', details: 'Enabled Pro Engine strategy', ip: '192.168.1.10' },
  { time: '13:00:00', user: 'System',   action: 'Signal', details: 'Webhook received 3 signals', ip: '—' },
];

const ACTION_COLORS: Record<string, string> = {
  Login:  'text-blue-400',
  Signal: 'text-gold-400',
  Trade:  'text-success',
  Config: 'text-orange-400',
};

// ─── User modal types ────────────────────────────────────────────────────────
type UserModalMode = 'add' | 'edit';
interface UserModalState {
  mode: UserModalMode;
  user?: UserResponse;
  name: string;
  email: string;
  password: string;
  role: string;
  is_active: boolean;
}

export default function AdminPage() {
  const [activeSection, setActiveSection]   = useState<Section>('users');
  const [strategyEnabled, setStrategyEnabled] = useState({ ema: true, gap: true, stadx: true, pro: false });
  const [showToken1, setShowToken1]         = useState(false);
  const [showToken2, setShowToken2]         = useState(false);
  const [showDhanToken, setShowDhanToken]   = useState(false);
  const [copiedBot, setCopiedBot]           = useState<1 | 2 | null>(null);
  const [telegramAlerts, setTelegramAlerts] = useState({
    newSignal: true, tradeEntry: true, targetHit: true, slHit: true, dailySummary: false,
  });
  const [config, setConfig]     = useState<AdminConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(false);

  // ── Users state ────────────────────────────────────────────────────────────
  const [users, setUsers]           = useState<UserResponse[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userModal, setUserModal]   = useState<UserModalState | null>(null);
  const [userSaving, setUserSaving] = useState(false);
  const [userError, setUserError]   = useState<string | null>(null);

  // Fetch users when entering Users tab
  useEffect(() => {
    if (activeSection === 'users') {
      setUsersLoading(true);
      getUsers()
        .then(setUsers)
        .catch(() => setUsers([]))
        .finally(() => setUsersLoading(false));
    }
  }, [activeSection]);

  function openAddModal() {
    setUserError(null);
    setUserModal({ mode: 'add', name: '', email: '', password: '', role: 'viewer', is_active: true });
  }
  function openEditModal(u: UserResponse) {
    setUserError(null);
    setUserModal({ mode: 'edit', user: u, name: u.name, email: u.email, password: '', role: u.role, is_active: u.is_active });
  }
  function closeModal() { setUserModal(null); setUserError(null); }

  async function handleSaveUser() {
    if (!userModal) return;
    setUserSaving(true);
    setUserError(null);
    try {
      if (userModal.mode === 'add') {
        const created = await createUser({ email: userModal.email, password: userModal.password, name: userModal.name, role: userModal.role });
        setUsers(prev => [...prev, created]);
      } else if (userModal.user) {
        const updated = await updateUser(userModal.user.id, { name: userModal.name, role: userModal.role, is_active: userModal.is_active });
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      }
      closeModal();
    } catch (e) {
      setUserError(e instanceof Error ? e.message : 'Failed to save user');
    } finally {
      setUserSaving(false);
    }
  }

  async function handleDeleteUser(u: UserResponse) {
    if (!confirm(`Delete user ${u.name}? This cannot be undone.`)) return;
    try {
      await deleteUser(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete user');
    }
  }

  // Fetch real config from API when entering webhook or broker tab
  useEffect(() => {
    if (activeSection === 'webhook' || activeSection === 'broker') {
      setConfigLoading(true);
      apiRequest<AdminConfig>('/admin/config')
        .then(data => setConfig(data))
        .catch(() => setConfig(null))
        .finally(() => setConfigLoading(false));
    }
  }, [activeSection]);

  function copyToClipboard(text: string, bot: 1 | 2) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedBot(bot);
      setTimeout(() => setCopiedBot(null), 2000);
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <Settings className="w-7 h-7 text-gold-400" />
            <h1 className="text-2xl font-bold text-white">Admin Console</h1>
          </div>
          <p className="text-muted mt-1 text-sm">System configuration and management</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold">
          Admin Access
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sub-nav */}
        <div className="md:w-44 shrink-0">
          <div className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  activeSection === id
                    ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                    : 'text-muted hover:bg-navy-700 hover:text-white',
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* USERS */}
          {activeSection === 'users' && (
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-gold-400" /> Users
                </h2>
                <Button variant="primary" size="sm" onClick={openAddModal}>
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Add User
                </Button>
              </div>

              {usersLoading ? (
                <div className="flex items-center justify-center py-10 text-muted text-sm gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading users...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        {['Name', 'Email', 'Role', 'Status', 'Actions'].map(col => (
                          <th key={col} className="text-left py-2 px-3 text-xs text-muted font-medium uppercase tracking-wide">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr><td colSpan={5} className="py-8 text-center text-sm text-muted">No users found</td></tr>
                      ) : users.map((u) => (
                        <tr key={u.id} className="border-b border-[var(--color-border)]/50 hover:bg-navy-700/30 transition-colors">
                          <td className="py-3 px-3 font-semibold text-white">{u.name}</td>
                          <td className="py-3 px-3 text-muted text-xs">{u.email}</td>
                          <td className="py-3 px-3">
                            <span className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-semibold capitalize',
                              u.role === 'admin'  ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' :
                              u.role === 'trader' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              'bg-navy-600 text-muted border border-[var(--color-border)]',
                            )}>{u.role}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold',
                              u.is_active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
                            )}>
                              {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEditModal(u)}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleDeleteUser(u)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* STRATEGIES */}
          {activeSection === 'strategies' && (
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-gold-400" /> Strategies
                </h2>
                <Button variant="primary" size="sm">
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Add Strategy
                </Button>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'ema'   as const, name: '13/50 EMA',  desc: 'EMA crossover strategy for trend following' },
                  { key: 'gap'   as const, name: 'Gap D/U',    desc: 'Gap up/down breakout strategy' },
                  { key: 'stadx' as const, name: 'ST+ADX',     desc: 'Supertrend combined with ADX strength filter' },
                  { key: 'pro'   as const, name: 'Pro Engine', desc: 'Multi-factor momentum strategy' },
                ].map(({ key, name, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-navy-800/50 rounded-lg border border-[var(--color-border)]">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="font-semibold text-white text-sm">{name}</p>
                      <p className="text-xs text-muted mt-0.5">{desc}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Button variant="ghost" size="sm">Configure</Button>
                      <Switch
                        checked={strategyEnabled[key]}
                        onChange={v => setStrategyEnabled(s => ({ ...s, [key]: v }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* WEBHOOK */}
          {activeSection === 'webhook' && (
            <Card>
              <h2 className="font-semibold text-white flex items-center gap-2 mb-5">
                <ShieldCheck className="w-4 h-4 text-gold-400" /> Webhook Configuration
              </h2>

              {configLoading && (
                <div className="text-muted text-sm py-4 text-center">Loading webhook URLs...</div>
              )}

              {!configLoading && (
                <div className="space-y-6">

                  {/* Security badge */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-emerald-400 font-medium">
                      Secure UUID tokens active — each URL is unique and unknown to outsiders
                    </span>
                  </div>

                  {/* Bot 1 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-muted">Bot 1 — Chartink Webhook URL</label>
                      {config?.webhook_token_bot1 && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          token: {showToken1 ? config.webhook_token_bot1 : '••••••••'}
                          <button onClick={() => setShowToken1(v => !v)} className="ml-1.5 text-muted hover:text-white">
                            {showToken1 ? <EyeOff className="w-3 h-3 inline" /> : <Eye className="w-3 h-3 inline" />}
                          </button>
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={config?.webhook_url_bot1 ?? 'Loading...'}
                        className="flex-1 bg-navy-800 border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => config && copyToClipboard(config.webhook_url_bot1, 1)}
                      >
                        {copiedBot === 1
                          ? <><CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" />Copied!</>
                          : <><Clipboard className="w-3.5 h-3.5 mr-1" />Copy</>
                        }
                      </Button>
                    </div>
                  </div>

                  {/* Bot 2 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-muted">Bot 2 — Chartink Webhook 2 URL</label>
                      {config?.webhook_token_bot2 && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          token: {showToken2 ? config.webhook_token_bot2 : '••••••••'}
                          <button onClick={() => setShowToken2(v => !v)} className="ml-1.5 text-muted hover:text-white">
                            {showToken2 ? <EyeOff className="w-3 h-3 inline" /> : <Eye className="w-3 h-3 inline" />}
                          </button>
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={config?.webhook_url_bot2 ?? 'Loading...'}
                        className="flex-1 bg-navy-800 border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => config && copyToClipboard(config.webhook_url_bot2, 2)}
                      >
                        {copiedBot === 2
                          ? <><CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" />Copied!</>
                          : <><Clipboard className="w-3.5 h-3.5 mr-1" />Copy</>
                        }
                      </Button>
                    </div>
                  </div>

                  {/* Live config stats */}
                  {config && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-navy-800/50 rounded-lg border border-[var(--color-border)]">
                      <div>
                        <p className="text-xs text-muted">Mode</p>
                        <p className="text-sm font-semibold text-white mt-0.5">
                          {config.paper_trading ? '📄 Paper' : '🔴 Live'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">Capital / Trade</p>
                        <p className="text-sm font-semibold text-white mt-0.5">₹{config.capital_per_trade.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">Force Exit</p>
                        <p className="text-sm font-semibold text-white mt-0.5">{config.force_exit_time} IST</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">Telegram</p>
                        <p className={cn('text-sm font-semibold mt-0.5', config.telegram_bot1_configured ? 'text-emerald-400' : 'text-danger')}>
                          {config.telegram_bot1_configured ? '✅ Connected' : '❌ Not set'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-1">
                    <p className="text-xs text-muted mb-2">
                      Copy the URL above and paste it into Chartink → Create Alert → Webhook URL field.
                      The token is unique per strategy — if leaked, contact admin to regenerate.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* BROKER */}
          {activeSection === 'broker' && (
            <Card>
              <h2 className="font-semibold text-white flex items-center gap-2 mb-5">
                <Landmark className="w-4 h-4 text-gold-400" /> Broker
              </h2>

              {configLoading && (
                <div className="text-muted text-sm py-4 text-center">Loading broker config...</div>
              )}

              {!configLoading && (
                <div className="space-y-5">

                  {/* Trading Mode */}
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Trading Mode</p>
                    {config?.paper_trading !== false ? (
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <span className="text-xl leading-none mt-0.5">📄</span>
                        <div>
                          <p className="text-sm font-semibold text-amber-400">Paper Trading</p>
                          <p className="text-xs text-muted mt-1">
                            Simulated trades only — no real orders placed on any exchange.
                            Set <span className="font-mono text-amber-300">PAPER_TRADING=false</span> in
                            environment variables and redeploy to go live.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <span className="relative flex h-3 w-3 mt-1 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-green-400">Dhan Live Trading</p>
                          <p className="text-xs text-muted mt-1">
                            Real orders are being placed on NSE via Dhan API.
                            All signals trigger actual intraday market buy orders.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dhan Credentials */}
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Dhan Credentials</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Client ID */}
                      <div>
                        <label className="text-xs font-medium text-muted block mb-1">Client ID</label>
                        <div className="flex items-center gap-2 bg-navy-800 border border-[var(--color-border)] rounded-lg px-3 py-2">
                          <span className="flex-1 text-xs font-mono text-white">
                            {config?.dhan_client_id_hint
                              ? config.dhan_client_id_hint
                              : <span className="text-muted italic">not set</span>
                            }
                          </span>
                        </div>
                      </div>
                      {/* Access Token */}
                      <div>
                        <label className="text-xs font-medium text-muted block mb-1">Access Token</label>
                        <div className="flex items-center gap-2 bg-navy-800 border border-[var(--color-border)] rounded-lg px-3 py-2">
                          <span className="flex-1 text-xs font-mono text-white">
                            {config?.dhan_configured
                              ? (showDhanToken ? '(set via env var — not exposed)' : '●●●●●●●●●●●●●●●●')
                              : <span className="text-muted italic">not set</span>
                            }
                          </span>
                          {config?.dhan_configured && (
                            <button
                              onClick={() => setShowDhanToken(v => !v)}
                              className="text-muted hover:text-white transition-colors"
                            >
                              {showDhanToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connection Status */}
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium',
                    config?.dhan_configured
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400',
                  )}>
                    <span>{config?.dhan_configured ? '✅' : '❌'}</span>
                    {config?.dhan_configured
                      ? 'Dhan credentials configured — ready for live trading'
                      : 'Dhan credentials not set — add DHAN_CLIENT_ID and DHAN_ACCESS_TOKEN to environment variables'
                    }
                  </div>

                  {/* Info note */}
                  <p className="text-xs text-muted">
                    Credentials are read from server environment variables and never stored in the database.
                    To update them, edit your Render / deployment environment and redeploy.
                  </p>

                </div>
              )}
            </Card>
          )}

          {/* TELEGRAM */}
          {activeSection === 'telegram' && (
            <Card>
              <h2 className="font-semibold text-white flex items-center gap-2 mb-5">
                <MessageCircle className="w-4 h-4 text-gold-400" /> Telegram Configuration
              </h2>
              <div className="space-y-4">
                <Input label="Bot Token" type="password" defaultValue="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz" />
                <Input label="Chat ID" defaultValue="-100123456789" />
                <div className="space-y-3 pt-1">
                  <p className="text-xs font-medium text-muted uppercase tracking-wide">Alert Settings</p>
                  {[
                    { key: 'newSignal'    as const, label: 'New Signal Alerts' },
                    { key: 'tradeEntry'   as const, label: 'Trade Entry Alerts' },
                    { key: 'targetHit'    as const, label: 'Target Hit Alerts' },
                    { key: 'slHit'        as const, label: 'Stop Loss Alerts' },
                    { key: 'dailySummary' as const, label: 'Daily Summary' },
                  ].map(({ key, label }) => (
                    <Switch
                      key={key}
                      label={label}
                      checked={telegramAlerts[key]}
                      onChange={v => setTelegramAlerts(a => ({ ...a, [key]: v }))}
                    />
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="primary" size="sm">
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Configuration
                  </Button>
                  <Button variant="secondary" size="sm">
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Test Connection
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* AUDIT LOGS */}
          {activeSection === 'audit' && (
            <Card>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-gold-400" /> Audit Logs
                </h2>
                <Button variant="secondary" size="sm">
                  <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
                  Export Logs
                </Button>
              </div>
              <div className="flex gap-3 mb-4 flex-wrap">
                <Input className="flex-1 min-w-[140px]" type="date" defaultValue="2024-12-05" />
                <Select
                  className="flex-1 min-w-[140px]"
                  options={[
                    { value: 'all',    label: 'All Actions' },
                    { value: 'login',  label: 'Login' },
                    { value: 'signal', label: 'Signal' },
                    { value: 'trade',  label: 'Trade' },
                    { value: 'config', label: 'Config' },
                  ]}
                  defaultValue="all"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      {['Time', 'User', 'Action', 'Details', 'IP'].map(col => (
                        <th key={col} className="text-left py-2 px-3 text-xs text-muted font-medium uppercase tracking-wide">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {AUDIT_LOGS.map((log, i) => (
                      <tr key={i} className={cn(
                        'border-b border-[var(--color-border)]/50 hover:bg-navy-700/30',
                        i % 2 === 0 ? '' : 'bg-navy-800/20',
                      )}>
                        <td className="py-2.5 px-3 font-mono text-xs text-muted">{log.time}</td>
                        <td className="py-2.5 px-3 text-white text-sm font-medium">{log.user}</td>
                        <td className={cn('py-2.5 px-3 text-xs font-semibold', ACTION_COLORS[log.action])}>{log.action}</td>
                        <td className="py-2.5 px-3 text-muted text-xs">{log.details}</td>
                        <td className="py-2.5 px-3 font-mono text-xs text-muted">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

        </div>
      </div>

      {/* USER MODAL — rendered at page root to avoid clipping */}
      {userModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-navy-900 border border-[#1e2d5a] rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2d5a]">
              <h3 className="font-semibold text-white text-sm">
                {userModal.mode === 'add' ? 'Add New User' : `Edit — ${userModal.user?.name}`}
              </h3>
              <button onClick={closeModal} className="text-muted hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <Input
                label="Full Name"
                value={userModal.name}
                onChange={e => setUserModal(m => m ? { ...m, name: e.target.value } : m)}
                placeholder="Tajuddin"
              />
              {userModal.mode === 'add' && (
                <>
                  <Input
                    label="Email"
                    type="email"
                    value={userModal.email}
                    onChange={e => setUserModal(m => m ? { ...m, email: e.target.value } : m)}
                    placeholder="user@tradedash.com"
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={userModal.password}
                    onChange={e => setUserModal(m => m ? { ...m, password: e.target.value } : m)}
                    placeholder="••••••••"
                  />
                </>
              )}
              <Select
                label="Role"
                value={userModal.role}
                onChange={e => setUserModal(m => m ? { ...m, role: e.target.value } : m)}
                options={[
                  { value: 'admin',  label: 'Admin' },
                  { value: 'trader', label: 'Trader' },
                  { value: 'viewer', label: 'Viewer' },
                ]}
              />
              {userModal.mode === 'edit' && (
                <Switch
                  label="Active"
                  checked={userModal.is_active}
                  onChange={v => setUserModal(m => m ? { ...m, is_active: v } : m)}
                />
              )}
              {userError && (
                <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{userError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-[#1e2d5a]">
              <Button variant="secondary" size="sm" onClick={closeModal}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSaveUser} disabled={userSaving}>
                {userSaving
                  ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Saving…</>
                  : <><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Save</>
                }
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
