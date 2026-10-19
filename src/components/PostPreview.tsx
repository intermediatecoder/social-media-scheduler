import React, { useEffect, useRef, useState } from 'react';
import { X, Eye, Image, Video, Play, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp } from 'lucide-react';
import { Platform, PLATFORM_LABELS } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { MediaFile } from './MediaUploader';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface PostPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  platforms: Platform[];
  mediaFiles: MediaFile[];
  scheduledDate: string;
  scheduledTime: string;
}

// ─── Platform-specific previews ───────────────────────────────────────────────

interface PreviewProps {
  content: string;
  mediaFiles: MediaFile[];
  scheduledDate: string;
  scheduledTime: string;
}

function ExpandableText({
  text,
  children,
  maxLines,
  className,
  moreClassName,
}: {
  text: string;
  children: React.ReactNode;
  maxLines: number;
  className: string;
  moreClassName: string;
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [text]);

  useEffect(() => {
    const element = textRef.current;
    if (!element || expanded) return;

    const measureOverflow = () => {
      setIsOverflowing(element.scrollHeight > element.clientHeight + 1);
    };
    measureOverflow();

    const observer = new ResizeObserver(measureOverflow);
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded, maxLines, text]);

  return (
    <div>
      <p
        ref={textRef}
        className={className}
        style={expanded ? undefined : {
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: maxLines,
          overflow: 'hidden',
        }}
      >
        {children}
      </p>
      {isOverflowing && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className={moreClassName}
        >
          {expanded ? 'less' : 'more'}
        </button>
      )}
    </div>
  );
}

function MediaCarousel({ files }: { files: MediaFile[] }) {
  const [idx, setIdx] = useState(0);
  if (files.length === 0) return null;

  const current = files[idx];

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      {current.type === 'image' ? (
        <img
          src={current.url}
          alt="Media preview"
          className="w-full object-cover max-h-72"
        />
      ) : (
        <video
          src={current.url}
          className="w-full max-h-72 object-cover"
          controls
          muted
          playsInline
        />
      )}

      {/* Navigation */}
      {files.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-30 hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIdx((i) => Math.min(files.length - 1, i + 1))}
            disabled={idx === files.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-30 hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {files.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  i === idx ? 'bg-white scale-125' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        </>
      )}

      {/* Type indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium">
        {current.type === 'video' ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
        {idx + 1}/{files.length}
      </div>
    </div>
  );
}

function InstagramPreview({ content, mediaFiles, scheduledDate, scheduledTime }: PreviewProps) {
  const scheduledFor = scheduledDate && scheduledTime
    ? format(new Date(`${scheduledDate}T${scheduledTime}`), 'MMM d, h:mm a')
    : '';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden font-[system-ui]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-400 flex items-center justify-center text-white text-xs font-bold">Y</div>
          <div>
            <p className="text-xs font-semibold text-gray-900">yourhandle</p>
            {scheduledFor && <p className="text-[10px] text-gray-500">Scheduled · {scheduledFor}</p>}
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-600" />
      </div>

      {/* Media */}
      {mediaFiles.length > 0 ? (
        <MediaCarousel files={mediaFiles} />
      ) : (
        <div className="bg-gradient-to-br from-violet-100 to-fuchsia-100 h-48 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Image className="w-8 h-8 mx-auto mb-1 opacity-50" />
            <p className="text-xs">No media</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-gray-700" />
            <MessageCircle className="w-5 h-5 text-gray-700" />
            <Share2 className="w-5 h-5 text-gray-700" />
          </div>
          <Bookmark className="w-5 h-5 text-gray-700" />
        </div>
        <p className="text-xs font-semibold text-gray-900 mb-1">0 likes</p>
        <ExpandableText
          text={content}
          maxLines={2}
          className="text-xs text-gray-800 leading-relaxed"
          moreClassName="text-xs font-medium text-gray-500 hover:text-gray-800"
        >
          <span className="font-semibold">yourhandle </span>
          {content || <span className="text-gray-400 italic">Write your caption...</span>}
        </ExpandableText>
      </div>
    </div>
  );
}

function FacebookPreview({ content, mediaFiles, scheduledDate, scheduledTime }: PreviewProps) {
  const scheduledFor = scheduledDate && scheduledTime
    ? format(new Date(`${scheduledDate}T${scheduledTime}`), 'MMM d, h:mm a')
    : '';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden font-[system-ui]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">Y</div>
        <div>
          <p className="text-xs font-semibold text-gray-900">Your Page</p>
          <p className="text-[10px] text-gray-500">{scheduledFor ? `Scheduled · ${scheduledFor}` : 'Just now · 🌐'}</p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-500 ml-auto" />
      </div>

      {/* Content */}
      {content && (
        <div className="px-3 pb-2">
          <ExpandableText
            text={content}
            maxLines={3}
            className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap"
            moreClassName="text-xs font-medium text-gray-500 hover:text-gray-800"
          >
            {content}
          </ExpandableText>
        </div>
      )}

      {/* Media */}
      {mediaFiles.length > 0 && <MediaCarousel files={mediaFiles} />}

      {/* Reactions */}
      <div className="px-3 py-2 border-t border-gray-100 mt-1">
        <div className="flex items-center justify-between text-gray-500 text-[11px]">
          <span>👍 ❤️ 😮  0 reactions</span>
          <span>0 comments</span>
        </div>
        <div className="flex items-center justify-around mt-2 pt-2 border-t border-gray-100">
          <button className="flex items-center gap-1 text-gray-500 text-[11px] font-medium hover:text-blue-600 transition-colors">
            <ThumbsUp className="w-4 h-4" /> Like
          </button>
          <button className="flex items-center gap-1 text-gray-500 text-[11px] font-medium hover:text-blue-600 transition-colors">
            <MessageCircle className="w-4 h-4" /> Comment
          </button>
          <button className="flex items-center gap-1 text-gray-500 text-[11px] font-medium hover:text-blue-600 transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}

function XPreview({ content, mediaFiles, scheduledDate, scheduledTime }: PreviewProps) {
  const scheduledFor = scheduledDate && scheduledTime
    ? format(new Date(`${scheduledDate}T${scheduledTime}`), 'MMM d, h:mm a')
    : '';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden font-[system-ui]">
      <div className="flex gap-2.5 px-3 pt-3 pb-2">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-bold shrink-0">Y</div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs font-bold text-gray-900">Your Account</span>
            <span className="text-xs text-gray-500">@yourhandle</span>
            {scheduledFor && (
              <span className="text-xs text-gray-400 ml-auto">· {scheduledFor}</span>
            )}
          </div>

          {/* Content */}
          <div className="mb-2">
            <ExpandableText
              text={content}
              maxLines={5}
              className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap"
              moreClassName="text-xs font-medium text-blue-500 hover:text-blue-700"
            >
              {content || <span className="text-gray-400 italic">Start your tweet...</span>}
            </ExpandableText>
          </div>

          {/* Media */}
          {mediaFiles.length > 0 && (
            <div className="mb-2 rounded-xl overflow-hidden">
              <MediaCarousel files={mediaFiles} />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4" /> 0
            </button>
            <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
              <Share2 className="w-4 h-4" /> 0
            </button>
            <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4" /> 0
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TikTokPreview({ content, mediaFiles }: PreviewProps) {
  const hasVideo = mediaFiles.some((f) => f.type === 'video');
  const videoFile = mediaFiles.find((f) => f.type === 'video');
  const imageFile = mediaFiles.find((f) => f.type === 'image');

  return (
    <div className="bg-black rounded-xl overflow-hidden font-[system-ui] relative min-h-[280px] flex items-end">
      {/* Background */}
      {videoFile ? (
        <video
          src={videoFile.url}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          muted
          loop
          playsInline
          autoPlay
        />
      ) : imageFile ? (
        <img
          src={imageFile.url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <Video className="w-10 h-10 mx-auto mb-2" />
            <p className="text-xs">Upload a video</p>
          </div>
        </div>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Right actions */}
      <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3 z-10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 border-2 border-white" />
        <div className="flex flex-col items-center">
          <Heart className="w-6 h-6 text-white" />
          <span className="text-white text-[10px]">0</span>
        </div>
        <div className="flex flex-col items-center">
          <MessageCircle className="w-6 h-6 text-white" />
          <span className="text-white text-[10px]">0</span>
        </div>
        <div className="flex flex-col items-center">
          <Share2 className="w-6 h-6 text-white" />
          <span className="text-white text-[10px]">Share</span>
        </div>
      </div>

      {/* Bottom content */}
      <div className="relative z-10 p-3 w-full">
        <p className="text-white text-xs font-semibold mb-1">@yourhandle</p>
        <ExpandableText
          text={content}
          maxLines={3}
          className="text-white text-[11px] leading-relaxed"
          moreClassName="text-[11px] font-semibold text-white/80 hover:text-white"
        >
          {content || <span className="text-gray-400 italic">Your caption will appear here...</span>}
        </ExpandableText>
        <p className="text-white/60 text-[10px] mt-1">♪ Original Sound</p>
      </div>
    </div>
  );
}

// ─── Preview shell per platform ───────────────────────────────────────────────

const PREVIEW_COMPONENTS: Record<Platform, React.FC<PreviewProps>> = {
  instagram: InstagramPreview,
  facebook: FacebookPreview,
  x: XPreview,
  tiktok: TikTokPreview,
};

// ─── Main PostPreview ─────────────────────────────────────────────────────────

export function PostPreview({
  isOpen,
  onClose,
  content,
  platforms,
  mediaFiles,
  scheduledDate,
  scheduledTime,
}: PostPreviewProps) {
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);

  const platformsToShow = platforms;
  const currentPlatform = activePlatform && platforms.includes(activePlatform)
    ? activePlatform
    : platforms[0];
  const PreviewComponent = currentPlatform ? PREVIEW_COMPONENTS[currentPlatform] : null;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Post Preview"
        className={cn(
          'fixed z-[70] bg-white dark:bg-gray-900',
          'inset-x-4 top-4 bottom-4',
          'sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2',
          'sm:w-full sm:max-w-md sm:max-h-[90vh]',
          'rounded-2xl shadow-2xl flex flex-col overflow-hidden',
          'border border-gray-100 dark:border-gray-700'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-violet-500" />
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-none">Preview</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">See how your post will look</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-preview"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform tabs */}
        <div className="flex gap-2 px-6 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0 overflow-x-auto">
          {platformsToShow.map((p) => (
            <button
              key={p}
              onClick={() => setActivePlatform(p)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all',
                currentPlatform === p
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <PlatformIcon platform={p} size="sm" />
              {PLATFORM_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Preview content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-950">
          {/* Hint */}
          {PreviewComponent ? (
            <PreviewComponent
              content={content}
              mediaFiles={mediaFiles}
              scheduledDate={scheduledDate}
              scheduledTime={scheduledTime}
            />
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Choose a platform to preview</h3>
              <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-gray-400">
                Select one or more social platforms in the composer to see how your post will look.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
