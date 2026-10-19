import React, { useMemo, useState } from 'react';
import { Post } from '../types';
import { useFilters } from '../hooks/useFilters';
import { PostCard } from './PostCard';
import { groupPostsByDay } from '../lib/utils';
import { Calendar, Inbox, Sparkles, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { isBefore, startOfDay } from 'date-fns';

interface PostQueueProps {
  posts: Post[];
  onRetryError: (message: string) => void;
  onEditSuccess: () => void;
}

interface DayGroupProps {
  dayLabel: string;
  dayPosts: Post[];
  isExpanded: boolean;
  onToggle: () => void;
  onRetryError: (message: string) => void;
  onEditSuccess: () => void;
}

function DayGroup({ dayLabel, dayPosts, isExpanded, onToggle, onRetryError, onEditSuccess }: DayGroupProps) {
  const dayId = dayLabel.replace(/\s/g, '-').toLowerCase();

  return (
    <section id={`day-group-${dayId}`}>
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={`day-posts-${dayId}`}
        onClick={onToggle}
        className="group flex w-full items-center gap-3 mb-3 text-left"
      >
        <span className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0',
          dayLabel === 'Today'
            ? 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30'
            : dayLabel === 'Tomorrow'
            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30'
            : 'bg-white text-slate-600 border-slate-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700'
        )}>
          {dayLabel === 'Today' }
          <Calendar className="w-3 h-3" />
          {dayLabel}
          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', !isExpanded && '-rotate-90')} />
        </span>
        <span className="flex-1 h-px bg-slate-200 dark:bg-gray-800" />
        <span className="text-xs text-slate-500 dark:text-gray-500 font-medium shrink-0">
          {dayPosts.length} post{dayPosts.length !== 1 ? 's' : ''}
        </span>
      </button>

      {isExpanded && (
        <div id={`day-posts-${dayId}`} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {dayPosts.map((post) => (
            <PostCard key={post.id} post={post} onRetryError={onRetryError} onEditSuccess={onEditSuccess} />
          ))}
        </div>
      )}
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-4 animate-pulse">
      <div className="flex gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-gray-800" />
        <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-gray-800" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-slate-100 dark:bg-gray-800 rounded-full w-full" />
        <div className="h-3 bg-slate-100 dark:bg-gray-800 rounded-full w-5/6" />
        <div className="h-3 bg-slate-100 dark:bg-gray-800 rounded-full w-4/6" />
      </div>
      <div className="h-32 bg-slate-100 dark:bg-gray-800 rounded-xl mb-4" />
      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-gray-800">
        <div className="h-3 w-20 bg-slate-100 dark:bg-gray-800 rounded-full" />
        <div className="h-5 w-20 bg-slate-100 dark:bg-gray-800 rounded-full" />
      </div>
    </div>
  );
}

export function PostQueueSkeleton() {
  return (
    <div className="space-y-8">
      {[0, 1].map((g) => (
        <section key={g}>
          <div className="h-6 w-24 bg-slate-200 dark:bg-gray-800 rounded-xl mb-4 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

export function PostQueue({ posts, onRetryError, onEditSuccess }: PostQueueProps) {
  const { platforms, statuses, query } = useFilters();
  const [expandedDays, setExpandedDays] = useState<Set<string> | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (platforms.length > 0 && !post.platforms.some((p) => platforms.includes(p))) return false;
      if (statuses.length > 0 && !statuses.includes(post.status)) return false;
      if (query && !post.content.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [posts, platforms, statuses, query]);

  const sortedPosts = useMemo(() =>
    [...filteredPosts].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [filteredPosts]
  );

  const today = startOfDay(new Date());
  const historyPosts = sortedPosts.filter((post) =>
    isBefore(startOfDay(new Date(post.scheduledAt)), today)
  );
  const upcomingPosts = sortedPosts.filter((post) =>
    !isBefore(startOfDay(new Date(post.scheduledAt)), today)
  );
  const upcomingGroups = groupPostsByDay(upcomingPosts);
  const historyGroups = groupPostsByDay(historyPosts);

  if (filteredPosts.length === 0) {
    const hasFilters = platforms.length > 0 || statuses.length > 0 || query;
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-3xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 flex items-center justify-center mb-5 shadow-sm">
          <Inbox className="w-9 h-9 text-slate-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-2">
          {hasFilters ? 'No posts match your filters' : 'No posts yet'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-gray-400 max-w-xs leading-relaxed">
          {hasFilters
            ? 'Try adjusting your filters or search term.'
            : 'Hit "New Post" to schedule your first piece of content.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {upcomingGroups.map(([dayLabel, dayPosts], groupIndex) => {
        const isExpanded = expandedDays === null ? groupIndex < 4 : expandedDays.has(dayLabel);
        return (
          <DayGroup
            key={dayLabel}
            dayLabel={dayLabel}
            dayPosts={dayPosts}
            isExpanded={isExpanded}
            onRetryError={onRetryError}
            onEditSuccess={onEditSuccess}
            onToggle={() => setExpandedDays((current) => {
              const next = current
                ? new Set(current)
                : new Set(upcomingGroups.slice(0, 4).map(([label]) => label));
              if (next.has(dayLabel)) next.delete(dayLabel);
              else next.add(dayLabel);
              return next;
            })}
          />
        );
      })}

      {historyGroups.length > 0 && (
        <section className="border-t border-slate-200 pt-4 dark:border-gray-800">
          <button
            type="button"
            aria-expanded={historyOpen}
            aria-controls="post-history"
            onClick={() => setHistoryOpen((open) => !open)}
            className="flex w-full items-center gap-3 text-left"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-gray-300">
              <Calendar className="h-4 w-4 text-slate-400 dark:text-gray-500" />
              History
              <ChevronDown className={cn('h-4 w-4 transition-transform', !historyOpen && '-rotate-90')} />
            </span>
            <span className="flex-1 h-px bg-slate-200 dark:bg-gray-800" />
            <span className="text-xs font-medium text-slate-500 dark:text-gray-500">
              {historyPosts.length} post{historyPosts.length !== 1 ? 's' : ''}
            </span>
          </button>

          {historyOpen && (
            <div id="post-history" className="mt-4 space-y-4">
              {historyGroups.map(([dayLabel, dayPosts]) => (
                <DayGroup
                  key={`history-${dayLabel}`}
                  dayLabel={dayLabel}
                  dayPosts={dayPosts}
                  isExpanded={expandedDays?.has(`history-${dayLabel}`) ?? false}
                  onRetryError={onRetryError}
                  onEditSuccess={onEditSuccess}
                  onToggle={() => setExpandedDays((current) => {
                    const next = current ? new Set(current) : new Set(upcomingGroups.slice(0, 4).map(([label]) => label));
                    const key = `history-${dayLabel}`;
                    if (next.has(key)) next.delete(key);
                    else next.add(key);
                    return next;
                  })}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
