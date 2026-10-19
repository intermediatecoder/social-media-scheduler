import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, Trash2, RefreshCw, AlertCircle, CheckCircle2, Calendar, ChevronLeft, ChevronRight, Video, Image as ImageIcon, X, Eye, Pencil } from 'lucide-react';
import { PLATFORM_LABELS, Post } from '../types';
import { cn } from '../lib/utils';
import { PlatformIcon } from './PlatformIcon';
import { usePostsStore } from '../store/postsStore';
import { ConfirmDialog } from './ConfirmDialog';
import { Composer } from './Composer';

interface PostCardProps {
  post: Post;
  onRetryError?: (message: string) => void;
  onEditSuccess?: () => void;
}

const statusConfig = {
  scheduled: {
    label: 'Scheduled',
    icon: Calendar,
    className: 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30',
    bar: 'bg-gradient-to-b from-violet-500 to-fuchsia-500',
  },
  published: {
    label: 'Published',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    bar: 'bg-gradient-to-b from-emerald-500 to-teal-500',
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    className: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    bar: 'bg-gradient-to-b from-red-500 to-rose-600',
  },
};

/** Resolves all media URLs for a post (handles both legacy mediaUrl and new mediaUrls array) */
function getMediaUrls(post: Post): string[] {
  if (post.mediaUrls && post.mediaUrls.length > 0) return post.mediaUrls;
  if (post.mediaUrl) return [post.mediaUrl];
  return [];
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|mov|webm|avi)(?:$|[?#])/i.test(url);
}

function MediaGallery({ urls, onOpen }: { urls: string[]; onOpen: (index: number) => void }) {
  if (urls.length === 0) return null;

  const firstUrl = urls[0];

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onOpen(0);
      }}
      className="group/media relative mb-3 block w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-gray-700 dark:bg-gray-800"
      aria-label={`View post details and ${urls.length} media item${urls.length === 1 ? '' : 's'}`}
    >
      {isVideoUrl(firstUrl) ? (
        <video src={firstUrl} className="h-32 w-full object-cover transition-transform group-hover/media:scale-[1.02]" muted playsInline preload="metadata" />
      ) : (
        <img src={firstUrl} alt="Post media preview" className="h-32 w-full object-cover transition-transform group-hover/media:scale-[1.02]" />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 transition-colors group-hover/media:bg-slate-950/20">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover/media:opacity-100">
          <Eye className="h-3.5 w-3.5" />
          View post
        </span>
      </span>
      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-slate-950/70 px-2 py-1 text-[10px] font-medium text-white">
        {isVideoUrl(firstUrl) ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
        {urls.length > 1 ? `${urls.length} items` : isVideoUrl(firstUrl) ? 'Video' : 'Image'}
      </span>
    </button>
  );
}

function PostDetailsModal({ post, mediaUrls, initialMediaIndex, onClose }: {
  post: Post;
  mediaUrls: string[];
  initialMediaIndex: number;
  onClose: () => void;
}) {
  const [mediaIndex, setMediaIndex] = useState(initialMediaIndex);
  const [mediaError, setMediaError] = useState(false);
  const currentMedia = mediaUrls[mediaIndex];
  const status = statusConfig[post.status];
  const StatusIcon = status.icon;
  const scheduledAt = format(parseISO(post.scheduledAt), 'EEEE, MMMM d, yyyy · h:mm a');

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    setMediaError(false);
  }, [currentMedia]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-details-title"
        className="relative flex h-[min(760px,90dvh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-gray-900 md:flex-row"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-slate-950 md:flex-[1.4]">
          {currentMedia ? (
            mediaError ? (
              <div className="flex flex-col items-center gap-2 px-6 text-center text-slate-300">
                <ImageIcon className="h-8 w-8 opacity-60" />
                <p className="text-sm">This media couldn’t be displayed.</p>
              </div>
            ) : isVideoUrl(currentMedia) ? (
              <video key={currentMedia} src={currentMedia} className="max-h-full max-w-full object-contain" controls playsInline onError={() => setMediaError(true)} />
            ) : (
              <img key={currentMedia} src={currentMedia} alt={`Post media ${mediaIndex + 1}`} className="max-h-full max-w-full object-contain" onError={() => setMediaError(true)} />
            )
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 text-center text-slate-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <ImageIcon className="h-7 w-7 opacity-70" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">No media added</p>
                <p className="mt-1 text-xs text-slate-400">This post doesn’t include an image or video.</p>
              </div>
            </div>
          )}
          {mediaUrls.length > 1 && (
            <>
              <button type="button" onClick={() => setMediaIndex((index) => Math.max(0, index - 1))} disabled={mediaIndex === 0} aria-label="Previous media" className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 disabled:opacity-30">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => setMediaIndex((index) => Math.min(mediaUrls.length - 1, index + 1))} disabled={mediaIndex === mediaUrls.length - 1} aria-label="Next media" className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 disabled:opacity-30">
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                {mediaIndex + 1} / {mediaUrls.length}
              </span>
            </>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-1">
          <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-gray-800">
            <div>
              <h2 id="post-details-title" className="text-base font-bold text-slate-900 dark:text-white">Post details</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-gray-400">{mediaUrls.length} media item{mediaUrls.length === 1 ? '' : 's'}</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close post details" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-gray-500">Publishing to</p>
              <div className="flex flex-wrap gap-2">
                {post.platforms.map((platform) => (
                  <span key={platform} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-gray-700 dark:text-gray-200">
                    <PlatformIcon platform={platform} size="sm" />
                    {PLATFORM_LABELS[platform]}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-gray-500">Post content</p>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700 dark:text-gray-200">
                {post.content || <span className="italic text-slate-400">No text content</span>}
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-gray-800/70">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-gray-400" />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-gray-200">{scheduledAt}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-gray-400">{post.status === 'published' ? 'Published' : 'Scheduled time'}</p>
              </div>
              <span className={cn('ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium', status.className)}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </span>
            </div>

            {post.status === 'failed' && post.errorMessage && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="leading-relaxed">{post.errorMessage}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export function PostCard({ post, onRetryError, onEditSuccess }: PostCardProps) {
  const { retryPost, deletePost, retryingIds, deletingIds } = usePostsStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [detailsMediaIndex, setDetailsMediaIndex] = useState<number | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const isRetrying = retryingIds.has(post.id);
  const isDeleting = deletingIds.has(post.id);

  const status = statusConfig[post.status];
  const StatusIcon = status.icon;
  const localTime = format(parseISO(post.scheduledAt), 'MMM d · h:mm a');

  const mediaUrls = getMediaUrls(post);

  const handleRetry = async () => {
    try {
      await retryPost(post.id);
    } catch (err) {
      onRetryError?.((err as Error).message);
    }
  };

  const handleDeleteConfirmed = () => {
    setShowDeleteConfirm(false);
    deletePost(post.id);
  };

  return (
    <>
      <article
        onClick={() => setDetailsMediaIndex(0)}
        className={cn(
          'group relative flex h-full flex-col rounded-2xl border overflow-hidden',
          'bg-white border-slate-200/90 dark:bg-gray-900 dark:border-gray-800',
          'hover:border-violet-200 hover:-translate-y-0.5 dark:hover:border-gray-700',
          'shadow-sm shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-200/60 dark:shadow-none dark:hover:shadow-black/20',
          'transition-all duration-200 focus-within:border-violet-300',
          isDeleting && 'opacity-40 pointer-events-none scale-95'
        )}
      >
        {/* Status accent bar */}
        <div className={cn('absolute left-0 top-0 bottom-0 w-[3px]', status.bar)} />

        <div className="flex flex-1 flex-col pl-4 pr-3 pt-3 pb-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-2.5">
            {/* Platform icons */}
            <div className="flex items-center gap-1.5">
              {post.platforms.map((p) => (
                <div key={p} className="w-6 h-6 rounded-lg overflow-hidden">
                  <PlatformIcon platform={p} size="sm" />
                </div>
              ))}
              <span className="text-[11px] text-slate-500 dark:text-gray-500 ml-1">
                {post.platforms.length} platform{post.platforms.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Actions — visible on hover */}
            <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity duration-200" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                onClick={() => setDetailsMediaIndex(0)}
                className="p-1.5 rounded-lg text-slate-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                title="View post details"
                aria-label="View post details"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              {post.status !== 'published' && (
                <button
                  type="button"
                  onClick={() => setShowEditor(true)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-violet-50 hover:text-violet-600 dark:text-gray-500 dark:hover:bg-violet-500/10 dark:hover:text-violet-400"
                  title="Edit post"
                  aria-label="Edit post"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {post.status === 'failed' && (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="p-1.5 rounded-lg text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/15 transition-colors disabled:opacity-50"
                  title="Retry"
                  id={`retry-${post.id}`}
                >
                  <RefreshCw className={cn('w-3.5 h-3.5', isRetrying && 'animate-spin')} />
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg text-slate-400 dark:text-gray-500 hover:text-rose-600 dark:hover:text-red-400 hover:bg-rose-50 dark:hover:bg-red-500/10 transition-colors"
                title="Delete"
                id={`delete-${post.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <p className="text-sm text-slate-700 dark:text-gray-200 leading-relaxed line-clamp-3 mb-3 font-medium">
            {post.content}
          </p>

          {/* Media gallery or empty-media placeholder */}
          {mediaUrls.length > 0 ? (
            <MediaGallery urls={mediaUrls} onOpen={setDetailsMediaIndex} />
          ) : (
            <div className="mb-3 flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-400">
              <ImageIcon className="h-5 w-5 opacity-70" />
              <div className="text-center">
                <p className="text-xs font-semibold">No media added</p>
                <p className="mt-0.5 text-[11px]">This post has no image or video</p>
              </div>
            </div>
          )}

          {/* Error */}
          {post.status === 'failed' && post.errorMessage && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300 text-xs rounded-xl p-2.5 mb-3">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{post.errorMessage}</span>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{localTime}</span>
            </div>

            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium',
              status.className
            )}>
              {isRetrying ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <StatusIcon className="w-3 h-3" />
              )}
              {isRetrying ? 'Retrying…' : status.label}
            </span>
          </div>
        </div>
      </article>

      {detailsMediaIndex !== null && (
        <PostDetailsModal
          post={post}
          mediaUrls={mediaUrls}
          initialMediaIndex={detailsMediaIndex}
          onClose={() => setDetailsMediaIndex(null)}
        />
      )}

      {showEditor && (
        <Composer
          post={post}
          onClose={() => setShowEditor(false)}
          onSuccess={() => {
            setShowEditor(false);
            onEditSuccess?.();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirmed}
        title="Delete this post?"
        message="This post will be permanently removed from your queue and cannot be recovered."
        confirmLabel="Delete Post"
        cancelLabel="Keep It"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
