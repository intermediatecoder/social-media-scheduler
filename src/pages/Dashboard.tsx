import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, LayoutDashboard, Zap, Moon, Sun, CalendarDays, CheckCircle2, AlertCircle } from 'lucide-react';
import { Post } from '../types';
import { usePostsStore } from '../store/postsStore';
import { PostQueue, PostQueueSkeleton } from '../components/PostQueue';
import { FilterBar } from '../components/FilterBar';
import { Composer } from '../components/Composer';
import { Toaster, useToasts } from '../components/Toast';
import { cn } from '../lib/utils';
import { useFilters } from '../hooks/useFilters';

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}

export function Dashboard() {
  const { posts, loading, error, fetchPosts } = usePostsStore();
  const [showComposer, setShowComposer] = useState(false);
  const { toasts, addToast, dismiss } = useToasts();
  const { dark, toggle: toggleDark } = useDarkMode();
  const { statuses, setFilters } = useFilters();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleRetryError = useCallback(
    (message: string) => {
      addToast('error', message);
    },
    [addToast]
  );

  const handleComposerClose = useCallback(() => {
    setShowComposer(false);
  }, []);

  const handleComposerSuccess = useCallback((wasEdit: boolean) => {
    setShowComposer(false);
    addToast('success', wasEdit ? 'Post updated successfully!' : 'Post scheduled successfully! 🎉');
  }, [addToast]);

  const handlePostEditSuccess = useCallback(() => {
    addToast('success', 'Post updated successfully!');
  }, [addToast]);

  // Stats
  const scheduledCount = posts.filter((p: Post) => p.status === 'scheduled').length;
  const publishedCount = posts.filter((p: Post) => p.status === 'published').length;
  const failedCount = posts.filter((p: Post) => p.status === 'failed').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200/70 dark:shadow-violet-900/30">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  Flintzy
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-none mt-1">
                  Social Scheduler
                </p>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Refresh */}
              <button
                onClick={() => fetchPosts()}
                id="refresh-posts"
                disabled={loading}
                className="p-2.5 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                title="Refresh posts"
                aria-label="Refresh posts"
              >
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={toggleDark}
                id="toggle-dark-mode"
                className="p-2.5 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Compose */}
              <button
                onClick={() => setShowComposer(true)}
                id="open-composer"
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                  'bg-violet-600 text-white hover:bg-violet-700',
                  'shadow-md shadow-violet-200/80 dark:shadow-violet-900/30',
                  'active:scale-95 transition-all duration-150'
                )}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Post</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        <section className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-xl sm:text-[28px] font-bold tracking-tight text-slate-950 dark:text-white">
            Content at a glance
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
            Keep every channel on schedule, all in one place.
          </p>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          {[
            { label: 'Scheduled', status: 'scheduled' as const, value: scheduledCount, icon: CalendarDays, color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-900/30', active: 'border-violet-300 ring-2 ring-violet-500/20 dark:border-violet-500/50' },
            { label: 'Published', status: 'published' as const, value: publishedCount, icon: CheckCircle2, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/30', active: 'border-emerald-300 ring-2 ring-emerald-500/20 dark:border-emerald-500/50' },
            { label: 'Failed', status: 'failed' as const, value: failedCount, icon: AlertCircle, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-900/30', active: 'border-rose-300 ring-2 ring-rose-500/20 dark:border-rose-500/50' },
          ].map((stat) => (
            <button
              type="button"
              key={stat.label}
              onClick={() => setFilters({
                statuses: statuses.includes(stat.status) ? statuses.filter((status) => status !== stat.status) : [stat.status],
              })}
              aria-pressed={statuses.includes(stat.status)}
              aria-label={`Filter posts by ${stat.label.toLowerCase()} status`}
              className={cn(
                'flex w-full items-center gap-2 sm:gap-3 rounded-xl border border-slate-200/80 bg-white px-2.5 py-2.5 text-left shadow-sm shadow-slate-200/40 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:px-4 sm:py-3',
                'dark:border-gray-800 dark:bg-gray-900 dark:shadow-none dark:hover:border-gray-700',
                statuses.includes(stat.status) && stat.active
              )}
            >
              <div className={cn('hidden sm:flex w-9 h-9 rounded-lg items-center justify-center shrink-0', stat.bg)}>
                <stat.icon className={cn('w-4 h-4', stat.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-nowrap items-baseline gap-x-1 sm:gap-x-2">
                  <span className={cn('text-lg sm:text-2xl font-bold tracking-tight tabular-nums', stat.color)}>
                    {loading ? '—' : stat.value}
                  </span>
                  <span className="whitespace-nowrap text-[10px] sm:text-sm font-medium text-slate-600 dark:text-gray-300">{stat.label}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="mb-5 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 sm:px-4 shadow-sm shadow-slate-200/40 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
          <FilterBar />
        </div>

        {/* Section heading */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Post queue</h2>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Failed to load posts
            </h3>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => fetchPosts()}
              className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !error && <PostQueueSkeleton />}

        {/* Posts */}
        {!loading && !error && (
          <PostQueue posts={posts} onRetryError={handleRetryError} onEditSuccess={handlePostEditSuccess} />
        )}
      </main>

      {/* Composer modal */}
      {showComposer && (
        <Composer onClose={handleComposerClose} onSuccess={handleComposerSuccess} />
      )}

      {/* Toasts */}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
