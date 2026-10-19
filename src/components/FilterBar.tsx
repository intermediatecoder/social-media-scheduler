import React, { useCallback } from 'react';
import { useFilters } from '../hooks/useFilters';
import { Platform, PostStatus, ALL_PLATFORMS, PLATFORM_LABELS } from '../types';
import { cn } from '../lib/utils';
import { PlatformIcon } from './PlatformIcon';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';

const STATUS_OPTIONS: { value: PostStatus; label: string; active: string }[] = [
  { value: 'scheduled', label: 'Scheduled', active: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/40' },
  { value: 'published', label: 'Published', active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40' },
  { value: 'failed', label: 'Failed', active: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/40' },
];

export function FilterBar() {
  const { platforms, statuses, query, setFilters, clearFilters, hasActiveFilters } = useFilters();
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const activeFilterCount = platforms.length + statuses.length;

  const togglePlatform = useCallback((p: Platform) => {
    const next = platforms.includes(p) ? platforms.filter((x) => x !== p) : [...platforms, p];
    setFilters({ platforms: next });
  }, [platforms, setFilters]);

  const toggleStatus = useCallback((s: PostStatus) => {
    const next = statuses.includes(s) ? statuses.filter((x) => x !== s) : [...statuses, s];
    setFilters({ statuses: next });
  }, [statuses, setFilters]);

  const base = 'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900';
  const inactive = 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700 dark:hover:border-gray-500 dark:hover:text-gray-200';

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
        <input
          id="search-input"
          type="text"
          placeholder="Search your posts"
          value={query}
          onChange={(e) => setFilters({ query: e.target.value })}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100 dark:placeholder-gray-600"
          aria-label="Search posts"
        />
        {query && (
          <button onClick={() => setFilters({ query: '' })} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          aria-controls="post-filters"
          className={cn(
            'inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
            filtersOpen || hasActiveFilters
              ? 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-300'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] text-white">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', filtersOpen && 'rotate-180')} />
        </button>
      </div>

      {filtersOpen && (
        <div id="post-filters" className="mt-3 flex flex-wrap gap-2 items-center border-t border-slate-100 pt-3 dark:border-gray-800">
          {ALL_PLATFORMS.map((p) => (
            <button
              key={p}
              id={`filter-platform-${p}`}
              onClick={() => togglePlatform(p)}
              aria-pressed={platforms.includes(p)}
              className={cn(base, platforms.includes(p) ? 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/40' : inactive)}
            >
              <PlatformIcon platform={p} size="sm" />
              {PLATFORM_LABELS[p]}
            </button>
          ))}

          <div className="w-px h-5 bg-slate-200 dark:bg-gray-700 mx-1 hidden sm:block" />

          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              id={`filter-status-${s.value}`}
              onClick={() => toggleStatus(s.value)}
              aria-pressed={statuses.includes(s.value)}
              className={cn(base, statuses.includes(s.value) ? s.active : inactive)}
            >
              {s.label}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              id="clear-filters"
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 dark:text-gray-500 dark:hover:text-rose-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
