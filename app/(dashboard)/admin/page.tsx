'use client';

import { useState } from 'react';
import {
  Settings, Users, BarChart2, Link, MessageCircle, ClipboardList,
  UserPlus, Eye, EyeOff, Clipboard, RefreshCw, Save, Send,
  Edit2, Trash2,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Switch, Table } from '@/components/ui';
import { cn } from '@/lib/utils';

type Section = 'users' | 'strategies' | 'webhook' | 'telegram' | 'audit';

const SECTIONS: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'strategies', label: 'Strategies', icon: BarChart2 },
  { id: 'webhook', label: 'Webhook', icon: Link },
  { id: 'telegram', label: 'Telegram', icon: MessageCircle },
  { id: 'audit', label: 'Audit Logs', icon: ClipboardList },
];

const MOCK_USERS = [
  { name: 'Tajuddin', email: 'tajuddin@trade.com', role: 'Admin', status: 'Active', lastLogin: '2 mins ago' },
  { name: 'Ahmed Trader', email: 'ahmed@trade.com', role: 'Trader', status: 'Active', lastLogin: '1 hr ago' },
  { name: 'Viewer User', email: 'viewer@trade.com', role: 'Viewer', status: 'Inactive', lastLogin: '3 days ago' },
];

const AUDIT_LOGS = [
  { time: '13:45:12', user: 'Tajuddin', action: 'Login', details: 'Successful login from browser', ip: '192.168.1.10' },
  { time: '13:44:58', user: 'System', action: 'Signal', details: 'New signal: RELIANCE BUY @ 2921', ip: '—' },
  { time: '13:43:20', user: 'Tajuddin', action: 'Trade', details: 'Entered RELIANCE BUY, Qty 10', ip: '192.168.1.10' },
  { time: '13:40:05', user: 'Ahmed Trader', action: 'Login', details: 'Successful login', ip: '10.0.0.55' },
  { time: '13:38:44', user: 'System', action: 'Signal', details: 'New signal: TCS SELL @ 3875', ip: '—' },
  { time: '13:30:11', user: 'Tajuddin', action: 'Config', details: 'Updated Telegram bot token', ip: '192.168.1.10' },
  { time: '13:22:09', user: 'System', action: 'Signal', details: 'New signal: HDFCBANK BUY @ 1710', ip: '—' },
  { time: '13:15:00', user: 'Ahmed Trader', action: 'Trade', details: 'Exit WIPRO, P&L +₹600', ip: '10.0.0.55' },
  { time: '13:10:30', user: 'Tajuddin', action: 'Config', details: 'Enabled Pro Engine strategy', ip: '192.168.1.10' },
  { time: '13:00:00', user: 'System', action: 'Signal', details: 'Webhook received 3 signals', ip: '—' },
];

const ACTION_COLORS: Record<string, string> = {
  Login: 'text-blue-400',
  Signal: 'text-gold-400',
  Trade: 'text-success',
  Config: 'text-orange-400',
};

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<Section>('users');
  const [strategyEnabled, setStrategyEnabled] = useState({ ema: true, gap: true, stadx: true, pro: false });
  const [showSecret, setShowSecret] = useState(false);
  const [webhookCopied, setWebhookCopied] = useState(false);
  const [telegramAlerts, setTelegramAlerts] = useState({
    newSignal: true, tradeEntry: true, targetHit: true, slHit: true, dailySummary: false,
  });

  function handleCopyWebhook() {
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
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
          {/* Mobile: horizontal scroll */}
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
                <Button variant="primary" size="sm">
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Add User
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      {['Name', 'Email', 'Role', 'Status', 'Last Login', 'Actions'].map(col => (
                        <th key={col} className="text-left py-2 px-3 text-xs text-muted font-medium uppercase tracking-wide">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_USERS.map((user, i) => (
                      <tr key={i} className="border-b border-[var(--color-border)]/50 hover:bg-navy-700/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-white">{user.name}</td>
                        <td className="py-3 px-3 text-muted text-xs">{user.email}</td>
                        <td className="py-3 px-3">
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-semibold',
                            user.role === 'Admin' ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' :
                            user.role === 'Trader' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-navy-600 text-muted border border-[var(--color-border)]',
                          )}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold',
                            user.status === 'Active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
                          )}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-muted text-xs">{user.lastLogin}</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm"><Edit2 className="w-3.5 h-3.5" /></Button>
                            <Button variant="danger" size="sm"><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                  { key: 'ema' as const, name: '13/50 EMA', desc: 'EMA crossover strategy for trend following' },
                  { key: 'gap' as const, name: 'Gap D/U', desc: 'Gap up/down breakout strategy' },
                  { key: 'stadx' as const, name: 'ST+ADX', desc: 'Supertrend combined with ADX strength filter' },
                  { key: 'pro' as const, name: 'Pro Engine', desc: 'Multi-factor momentum strategy' },
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
                <Link className="w-4 h-4 text-gold-400" /> Webhook Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Webhook URL</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value="https://tradedash.app/api/webhook/chartink"
                      className="flex-1 bg-navy-800 border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none"
                    />
                    <Button variant="secondary" size="sm" onClick={handleCopyWebhook}>
                      <Clipboard className="w-3.5 h-3.5 mr-1" />
                      {webhookCopied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Secret Key</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      type={showSecret ? 'text' : 'password'}
                      value="sk_live_abc123xyz789"
                      className="flex-1 bg-navy-800 border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none"
                    />
                    <Button variant="ghost" size="sm" onClick={() => setShowSecret(s => !s)}>
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-6 p-3 bg-navy-800/50 rounded-lg border border-[var(--color-border)]">
                  <div>
                    <p className="text-xs text-muted">Last Received</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <p className="text-sm text-white font-semibold">2 minutes ago</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Total Today</p>
                    <p className="text-sm text-white font-semibold font-mono mt-0.5">23 signals</p>
                  </div>
                </div>
                <div className="pt-2">
                  <Button variant="danger" size="sm">
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Regenerate Secret Key
                  </Button>
                </div>
              </div>
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
                    { key: 'newSignal' as const, label: 'New Signal Alerts' },
                    { key: 'tradeEntry' as const, label: 'Trade Entry Alerts' },
                    { key: 'targetHit' as const, label: 'Target Hit Alerts' },
                    { key: 'slHit' as const, label: 'Stop Loss Alerts' },
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
                    { value: 'all', label: 'All Actions' },
                    { value: 'login', label: 'Login' },
                    { value: 'signal', label: 'Signal' },
                    { value: 'trade', label: 'Trade' },
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
    </div>
  );
}
