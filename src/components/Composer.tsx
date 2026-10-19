import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createPortal } from 'react-dom';
import { X, Send, AlertCircle, Eye, Smile, Link2, Plus, Upload } from 'lucide-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { Platform, Post, ALL_PLATFORMS, PLATFORM_CHAR_LIMITS, PLATFORM_LABELS } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { usePostsStore } from '../store/postsStore';
import { MediaUploader, MediaFile } from './MediaUploader';
import { PostPreview } from './PostPreview';
import { ConfirmDialog } from './ConfirmDialog';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const EmojiPicker = lazy(() => import('emoji-picker-react'));

// ─── Zod schema ──────────────────────────────────────────────────────────────
const composerSchema = z
  .object({
    content: z.string().min(1, 'Content is required'),
    platforms: z.array(z.enum(['facebook', 'instagram', 'x', 'tiktok'])).min(1, 'Select at least one platform'),
    scheduledDate: z.string().min(1, 'Date is required'),
    scheduledTime: z.string().min(1, 'Time is required'),
  })
  .refine(
    (data) => {
      const localDatetime = new Date(`${data.scheduledDate}T${data.scheduledTime}`);
      return localDatetime > new Date();
    },
    { message: 'Scheduled time must be in the future', path: ['scheduledTime'] }
  )
  .refine(
    (data) => {
      const overLimit = data.platforms.some(
        (p) => data.content.length > PLATFORM_CHAR_LIMITS[p]
      );
      return !overLimit;
    },
    { message: 'Content exceeds character limit for one or more platforms', path: ['content'] }
  );

type ComposerForm = z.infer<typeof composerSchema>;

// ─── Character counter ────────────────────────────────────────────────────────
function CharCounter({ content, platform }: { content: string; platform: Platform }) {
  const limit = PLATFORM_CHAR_LIMITS[platform];
  const count = content.length;
  const remaining = limit - count;
  const pct = Math.min((count / limit) * 100, 100);
  const isOver = count > limit;
  const isWarning = remaining < 30 && !isOver;

  return (
    <div className="flex items-center gap-2">
      <PlatformIcon platform={platform} size="sm" />
      <div className="flex-1 h-1 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isOver ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-violet-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          'text-xs font-mono tabular-nums min-w-[3rem] text-right',
          isOver ? 'text-red-500 font-semibold' : isWarning ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'
        )}
      >
        {isOver ? `-${Math.abs(remaining)}` : remaining}
      </span>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMinDatetime(): { date: string; time: string } {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  return {
    date: format(now, 'yyyy-MM-dd'),
    time: format(now, 'HH:mm'),
  };
}

function getDefaultDatetime(): { date: string; time: string } {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return {
    date: format(tomorrow, 'yyyy-MM-dd'),
    time: format(tomorrow, 'HH:mm'),
  };
}

// ─── Main Composer ────────────────────────────────────────────────────────────
interface ComposerProps {
  onClose: () => void;
  onSuccess: (wasEdit: boolean) => void;
  post?: Post;
}

export function Composer({ onClose, onSuccess, post }: ComposerProps) {
  const { createPost, updatePost } = usePostsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaUrlError, setMediaUrlError] = useState<string | null>(null);
  const [retainedMediaUrls, setRetainedMediaUrls] = useState<string[]>(() =>
    post?.mediaUrls?.length ? [...post.mediaUrls] : post?.mediaUrl ? [post.mediaUrl] : []
  );
  const [mediaInputMode, setMediaInputMode] = useState<'url' | 'upload'>('url');
  const [pendingMediaInputMode, setPendingMediaInputMode] = useState<'url' | 'upload' | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const contentInputRef = useRef<HTMLTextAreaElement | null>(null);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const emojiPanelRef = useRef<HTMLDivElement | null>(null);
  // Store validated form data so confirm dialog can use it
  const pendingDataRef = useRef<ComposerForm | null>(null);

  const defaults = post
    ? {
        date: format(new Date(post.scheduledAt), 'yyyy-MM-dd'),
        time: format(new Date(post.scheduledAt), 'HH:mm'),
      }
    : getDefaultDatetime();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ComposerForm>({
    resolver: zodResolver(composerSchema),
    defaultValues: {
      content: post?.content ?? '',
      platforms: post?.platforms ?? [],
      scheduledDate: defaults.date,
      scheduledTime: defaults.time,
    },
  });

  const content = watch('content');
  const selectedPlatforms = watch('platforms');
  const scheduledDate = watch('scheduledDate');
  const scheduledTime = watch('scheduledTime');
  const contentField = register('content');

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showEmojiPicker) {
        setShowEmojiPicker(false);
      } else if (!showPreview && !showConfirm) {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, showEmojiPicker, showPreview, showConfirm]);

  useEffect(() => {
    if (!showEmojiPicker) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!emojiPickerRef.current?.contains(target) && !emojiPanelRef.current?.contains(target)) {
        setShowEmojiPicker(false);
      }
    };

    const positionPicker = () => {
      const anchor = emojiPickerRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const width = Math.min(rect.width, window.innerWidth - 24);
      const belowSpace = window.innerHeight - rect.bottom - 20;
      const aboveSpace = rect.top - 20;
      const showBelow = belowSpace >= 300 || belowSpace >= aboveSpace;
      const availableHeight = showBelow ? belowSpace : aboveSpace;
      const height = Math.max(180, Math.min(340, availableHeight));
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
      const top = showBelow
        ? Math.min(rect.bottom + 8, window.innerHeight - height - 12)
        : Math.max(12, rect.top - height - 8);

      setEmojiPickerPosition({ top, left, width, height });
    };

    positionPicker();
    window.addEventListener('resize', positionPicker);
    document.addEventListener('scroll', positionPicker, true);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('resize', positionPicker);
      document.removeEventListener('scroll', positionPicker, true);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [showEmojiPicker]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      mediaFiles.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, []);

  const togglePlatform = (platform: Platform) => {
    const current = selectedPlatforms || [];
    const next = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    setValue('platforms', next, { shouldValidate: true });
  };

  const addMediaUrl = () => {
    const url = mediaUrlInput.trim();
    if (!url) {
      setMediaUrlError('Enter an image URL to add it.');
      return;
    }
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      setMediaUrlError('Enter a valid image URL starting with https:// or http://.');
      return;
    }
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      setMediaUrlError('Image URLs must start with https:// or http://.');
      return;
    }
    if (retainedMediaUrls.includes(url)) {
      setMediaUrlError('This image URL is already attached.');
      return;
    }
    if (retainedMediaUrls.length + mediaFiles.length >= 10) {
      setMediaUrlError('You can attach up to 10 media items.');
      return;
    }

    setRetainedMediaUrls((urls) => [...urls, url]);
    setMediaUrlInput('');
    setMediaUrlError(null);
  };

  const requestMediaInputMode = (mode: 'url' | 'upload') => {
    if (mode === mediaInputMode) return;
    if (retainedMediaUrls.length > 0 || mediaFiles.length > 0) {
      setPendingMediaInputMode(mode);
      return;
    }
    setMediaInputMode(mode);
    setMediaUrlInput('');
    setMediaUrlError(null);
  };

  const confirmMediaInputMode = () => {
    if (!pendingMediaInputMode) return;
    mediaFiles.forEach((file) => URL.revokeObjectURL(file.url));
    setMediaFiles([]);
    setRetainedMediaUrls([]);
    setMediaUrlInput('');
    setMediaUrlError(null);
    setMediaInputMode(pendingMediaInputMode);
    setPendingMediaInputMode(null);
  };

  const insertEmoji = (emoji: EmojiClickData) => {
    const textarea = contentInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextContent = `${content.slice(0, start)}${emoji.emoji}${content.slice(end)}`;
    const cursorPosition = start + emoji.emoji.length;

    setValue('content', nextContent, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    textarea.focus();
    textarea.setSelectionRange(cursorPosition, cursorPosition);
  };

  // Called after user confirms — uses data stored from the validation step
  const doSubmit = async () => {
    const data = pendingDataRef.current;
    if (!data) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const localDatetime = new Date(`${data.scheduledDate}T${data.scheduledTime}`);
      const scheduledAt = localDatetime.toISOString();

      // The mock API keeps these preview URLs; a real API should upload the files first.
      const mediaUrls = [...retainedMediaUrls, ...mediaFiles.map((file) => file.url)];

      const payload = {
        content: data.content,
        platforms: data.platforms as Platform[],
        mediaUrl: mediaUrls[0],
        mediaUrls,
        scheduledAt,
      };

      if (post) await updatePost(post.id, payload);
      else await createPost(payload);
      pendingDataRef.current = null;
      onSuccess(!!post);
    } catch (err) {
      setSubmitError((err as Error).message || 'Failed to schedule post. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  // Triggered by the Schedule button — validates then shows confirmation
  const onScheduleClick = handleSubmit((data) => {
    pendingDataRef.current = data;
    setShowConfirm(true);
  });

  const isOverLimit = selectedPlatforms?.some(
    (p) => content.length > PLATFORM_CHAR_LIMITS[p]
  );
  const minDate = getMinDatetime();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close composer"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Compose post"
        className={cn(
          'fixed z-50 bg-white dark:bg-gray-900',
          'inset-x-4 top-4 bottom-4',
          'sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2',
          'sm:w-full sm:max-w-xl sm:max-h-[92vh]',
          'rounded-2xl shadow-2xl flex flex-col overflow-hidden',
          'border border-gray-100 dark:border-gray-700'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{post ? 'Edit Post' : 'Compose Post'}</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {post ? 'Update your post before it is published' : 'Schedule your content across platforms'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Preview button */}
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              id="open-preview"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>

            <button
              onClick={onClose}
              id="close-composer"
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Platform selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Platforms <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  id={`composer-platform-${p}`}
                  onClick={() => togglePlatform(p)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-150',
                    selectedPlatforms?.includes(p)
                      ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200 dark:shadow-violet-900/30 scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-violet-300 dark:hover:border-violet-700'
                  )}
                >
                  <PlatformIcon platform={p} size="sm" />
                  {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
            {errors.platforms && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.platforms.message}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label htmlFor="composer-content" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <div
              className={cn(
                'relative rounded-xl border bg-gray-50 transition-all duration-200 dark:bg-gray-800',
                'focus-within:border-transparent focus-within:ring-2 focus-within:ring-violet-500',
                errors.content || isOverLimit
                  ? 'border-red-400 focus-within:ring-red-400'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <textarea
                id="composer-content"
                {...contentField}
                ref={(element) => {
                  contentField.ref(element);
                  contentInputRef.current = element;
                }}
                rows={5}
                placeholder="What's on your mind? Write your post content here..."
                className={cn(
                  'w-full rounded-t-xl border-0 bg-transparent px-4 py-3 text-sm resize-none',
                  'text-gray-900 dark:text-gray-100 placeholder-gray-400',
                  'focus:outline-none focus:ring-0'
                )}
              />
              <div ref={emojiPickerRef} className="relative flex items-center justify-between border-t border-gray-200 px-2 py-1.5 dark:border-gray-700">
                <button
                  type="button"
                  ref={emojiButtonRef}
                  onClick={() => setShowEmojiPicker((isOpen) => !isOpen)}
                  aria-label={showEmojiPicker ? 'Close emoji picker' : 'Open emoji picker'}
                  aria-expanded={showEmojiPicker}
                  aria-haspopup="dialog"
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                    showEmojiPicker
                      ? 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-violet-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-violet-300'
                  )}
                >
                  <Smile className="h-4 w-4" />
                  Emoji
                </button>
                <span className="pr-1 text-[11px] text-gray-400 dark:text-gray-500">Add a little expression</span>
                {showEmojiPicker && emojiPickerPosition && createPortal(
                  <div
                    ref={emojiPanelRef}
                    className="fixed z-[60] overflow-hidden rounded-2xl border border-gray-200 shadow-2xl dark:border-gray-700"
                    style={{
                      top: emojiPickerPosition.top,
                      left: emojiPickerPosition.left,
                      width: emojiPickerPosition.width,
                    }}
                  >
                    <Suspense
                      fallback={
                        <div
                          className="bg-white dark:bg-gray-900"
                          style={{ width: emojiPickerPosition.width, height: emojiPickerPosition.height }}
                        />
                      }
                    >
                      <EmojiPicker
                        onEmojiClick={insertEmoji}
                        width={emojiPickerPosition.width}
                        height={emojiPickerPosition.height}
                        theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                        searchPlaceholder="Search emojis..."
                        previewConfig={{ showPreview: false }}
                        lazyLoadEmojis
                      />
                    </Suspense>
                  </div>,
                  document.body
                )}
              </div>
            </div>
            {errors.content && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.content.message}
              </p>
            )}

            {/* Per-platform char counters */}
            {selectedPlatforms && selectedPlatforms.length > 0 && (
              <div className="mt-3 space-y-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Character limits</p>
                {selectedPlatforms.map((p) => (
                  <CharCounter key={p} platform={p} content={content || ''} />
                ))}
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Media{' '}
              <span className="text-gray-400 font-normal text-xs">(optional · images &amp; videos)</span>
            </label>
            <div className="mb-3 inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800" aria-label="Media input method">
              <button
                type="button"
                onClick={() => requestMediaInputMode('url')}
                aria-pressed={mediaInputMode === 'url'}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all',
                  mediaInputMode === 'url'
                    ? 'bg-white text-violet-700 shadow-sm dark:bg-gray-700 dark:text-violet-300'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                <Link2 className="h-3.5 w-3.5" />
                Image URL
              </button>
              <button
                type="button"
                onClick={() => requestMediaInputMode('upload')}
                aria-pressed={mediaInputMode === 'upload'}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all',
                  mediaInputMode === 'upload'
                    ? 'bg-white text-violet-700 shadow-sm dark:bg-gray-700 dark:text-violet-300'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                <Upload className="h-3.5 w-3.5" />
                Upload or drop
              </button>
            </div>
            {mediaInputMode === 'url' ? (
              <>
                <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                  <label htmlFor="composer-media-url" className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                    <Link2 className="h-3.5 w-3.5" />
                    Add an image by URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="composer-media-url"
                      type="text"
                      inputMode="url"
                      value={mediaUrlInput}
                      onChange={(event) => {
                        setMediaUrlInput(event.target.value);
                        if (mediaUrlError) setMediaUrlError(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addMediaUrl();
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                      aria-invalid={!!mediaUrlError}
                      aria-describedby={mediaUrlError ? 'composer-media-url-error' : undefined}
                      className={cn(
                        'min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
                        'focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-900 dark:text-gray-100',
                        mediaUrlError ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                      )}
                    />
                    <button
                      type="button"
                      onClick={addMediaUrl}
                      disabled={retainedMediaUrls.length >= 10}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add URL
                    </button>
                  </div>
                  {mediaUrlError && (
                    <p id="composer-media-url-error" className="mt-1.5 text-xs text-red-500">{mediaUrlError}</p>
                  )}
                  <p className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                    Add up to 10 image URLs. Switch input methods to upload or drop files instead.
                  </p>
                </div>
                {retainedMediaUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {retainedMediaUrls.map((url) => {
                      const isVideo = /\.(mp4|mov|webm|avi)(?:$|[?#])/i.test(url);
                      return (
                        <div key={url} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                          {isVideo ? (
                            <video src={url} className="h-28 w-full object-cover" muted playsInline preload="metadata" />
                          ) : (
                            <img src={url} alt="Attached post media" className="h-28 w-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => setRetainedMediaUrls((urls) => urls.filter((item) => item !== url))}
                            aria-label="Remove attached media"
                            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-100 transition-opacity hover:bg-black/80 sm:opacity-0 sm:group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <MediaUploader
                files={mediaFiles}
                onChange={setMediaFiles}
                maxFiles={10}
              />
            )}
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Schedule (your local time) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  id="composer-date"
                  type="date"
                  {...register('scheduledDate')}
                  min={minDate.date}
                  className={cn(
                    'w-full px-3 py-2.5 rounded-xl text-sm',
                    'bg-gray-50 dark:bg-gray-800 border',
                    'text-gray-900 dark:text-gray-100',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
                    'transition-all duration-200',
                    errors.scheduledDate ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                  )}
                />
                {errors.scheduledDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.scheduledDate.message}</p>
                )}
              </div>
              <div>
                <input
                  id="composer-time"
                  type="time"
                  {...register('scheduledTime')}
                  className={cn(
                    'w-full px-3 py-2.5 rounded-xl text-sm',
                    'bg-gray-50 dark:bg-gray-800 border',
                    'text-gray-900 dark:text-gray-100',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
                    'transition-all duration-200',
                    errors.scheduledTime ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                  )}
                />
                {errors.scheduledTime && (
                  <p className="text-xs text-red-500 mt-1">{errors.scheduledTime.message}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
              Stored in UTC · shown in your local timezone
            </p>
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-xl p-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            type="button"
            onClick={onScheduleClick}
            disabled={!!isOverLimit}
            id="composer-submit"
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold',
              'bg-violet-600 text-white',
              'hover:bg-violet-700 active:scale-95',
              'transition-all duration-150 shadow-md shadow-violet-200 dark:shadow-violet-900/30',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
            )}
          >
            <Send className="w-4 h-4" />
            {post ? 'Save Changes' : 'Schedule Post'}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      <PostPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        content={content || ''}
        platforms={selectedPlatforms || []}
        mediaFiles={mediaFiles}
        scheduledDate={scheduledDate || ''}
        scheduledTime={scheduledTime || ''}
      />

      {/* Confirm Schedule Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={doSubmit}
        title={post ? 'Save changes to this post?' : 'Schedule this post?'}
        message={`${post ? 'Your updated post will be scheduled for' : 'Your post will be scheduled for'} ${
          scheduledDate && scheduledTime
            ? format(new Date(`${scheduledDate}T${scheduledTime}`), 'MMMM d, yyyy \'at\' h:mm a')
            : 'the selected time'
        } across ${selectedPlatforms?.length || 0} platform${(selectedPlatforms?.length || 0) !== 1 ? 's' : ''}.`}
        confirmLabel={post ? 'Save Changes' : 'Yes, Schedule It'}
        cancelLabel="Go Back"
        variant="primary"
        isLoading={isSubmitting}
      />
      <ConfirmDialog
        isOpen={pendingMediaInputMode !== null}
        onClose={() => setPendingMediaInputMode(null)}
        onConfirm={confirmMediaInputMode}
        title="Switch media input method?"
        message={`Switching to ${pendingMediaInputMode === 'upload' ? 'upload or drop' : 'image URL'} will remove all media currently attached using ${mediaInputMode === 'upload' ? 'upload or drop' : 'image URL'}. This cannot be undone.`}
        confirmLabel="Remove media & switch"
        cancelLabel="Keep current media"
        variant="danger"
      />
    </>
  );
}
