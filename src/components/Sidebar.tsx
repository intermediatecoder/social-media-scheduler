import React from 'react';
import { Zap, LayoutDashboard, History, ChevronLeft, ChevronRight, Plus, Moon, Sun, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

export type NavPage = 'dashboard' | 'history';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  dark: boolean;
  onToggleDark: () => void;
  onCompose: () => void;
  onRefresh: () => void;
  loading: boolean;
  scheduledCount: number;
  publishedCount: number;
  failedCount: number;
}

const NAV_ITEMS: { id: NavPage; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'history', label: 'History', icon: History },
];

export function Sidebar({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  dark,
  onToggleDark,
  onCompose,
  onRefresh,
  loading,
  scheduledCount,
  publishedCount,
  failedCount,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen bg-gray-900 border-r border-gray-800',
        'transition-all duration-300 ease-in-out shrink-0',
        collapsed ? 'w-[72px]' : 'w-[220px]'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-gray-800', collapsed && 'justify-center px-2')}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-900/50 shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-white leading-none">Flintzy</p>
            <p className="text-[10px] text-gray-500 leading-none mt-0.5">Social Scheduler</p>
          </div>
        )}
      </div>

      {/* Compose button */}
      <div className={cn('px-3 py-4 border-b border-gray-800', collapsed && 'px-2')}>
        <button
          onClick={onCompose}
          id="open-composer"
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold',
            'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white',
            'hover:from-violet-500 hover:to-fuchsia-500',
            'shadow-md shadow-violet-900/40',
            'active:scale-95 transition-all duration-150',
            collapsed && 'justify-center px-2'
          )}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && 'New Post'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              collapsed && 'justify-center px-2',
              currentPage === id
                ? 'bg-violet-600/20 text-violet-400 border border-violet-600/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && label}
          </button>
        ))}
      </nav>

      {/* Stats mini */}
      {!collapsed && (
        <div className="px-3 pb-4 space-y-2">
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3">Overview</p>
          {[
            { label: 'Scheduled', value: scheduledCount, color: 'text-violet-400', dot: 'bg-violet-500' },
            { label: 'Published', value: publishedCount, color: 'text-emerald-400', dot: 'bg-emerald-500' },
            { label: 'Failed', value: failedCount, color: 'text-red-400', dot: 'bg-red-500' },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-2">
                <div className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
                <span className="text-xs text-gray-400">{s.label}</span>
              </div>
              <span className={cn('text-xs font-bold tabular-nums', s.color)}>{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom actions */}
      <div className={cn('px-3 py-4 border-t border-gray-800 flex flex-col gap-1', collapsed && 'px-2')}>
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh posts"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors disabled:opacity-50',
            collapsed && 'justify-center px-2'
          )}
        >
          <RefreshCw className={cn('w-4 h-4 shrink-0', loading && 'animate-spin')} />
          {!collapsed && 'Refresh'}
        </button>
        <button
          onClick={onToggleDark}
          title="Toggle theme"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          {dark ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          {!collapsed && (dark ? 'Light mode' : 'Dark mode')}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-700 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-600 flex items-center justify-center shadow-lg transition-all duration-150 z-10"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
