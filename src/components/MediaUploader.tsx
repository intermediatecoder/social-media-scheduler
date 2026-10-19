import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Image, Video, Play, AlertCircle, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export interface MediaFile {
  id: string;
  file: File;
  url: string; // object URL for preview
  type: 'image' | 'video';
  name: string;
  size: number;
}

interface MediaUploaderProps {
  files: MediaFile[];
  onChange: (files: MediaFile[]) => void;
  maxFiles?: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaThumbnail({ file, onRemove }: { file: MediaFile; onRemove: () => void }) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (videoPlaying) {
      videoRef.current.pause();
      setVideoPlaying(false);
    } else {
      videoRef.current.play();
      setVideoPlaying(true);
    }
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
        title="Remove media"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Type badge */}
      <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium">
        {file.type === 'image' ? (
          <Image className="w-3 h-3" />
        ) : (
          <Video className="w-3 h-3" />
        )}
        {file.type}
      </div>

      {/* Preview */}
      {file.type === 'image' ? (
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-28 object-cover"
        />
      ) : (
        <div className="relative w-full h-28">
          <video
            ref={videoRef}
            src={file.url}
            className="w-full h-28 object-cover"
            loop
            muted
            playsInline
            onEnded={() => setVideoPlaying(false)}
          />
          <button
            type="button"
            onClick={toggleVideo}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
              {videoPlaying ? (
                <div className="flex gap-0.5">
                  <div className="w-1 h-3 bg-gray-800 rounded-sm" />
                  <div className="w-1 h-3 bg-gray-800 rounded-sm" />
                </div>
              ) : (
                <Play className="w-4 h-4 text-gray-800 ml-0.5" />
              )}
            </div>
          </button>
        </div>
      )}

      {/* File info */}
      <div className="px-2 py-1.5 bg-white dark:bg-gray-800">
        <p className="text-[11px] text-gray-600 dark:text-gray-300 truncate font-medium">{file.name}</p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500">{formatBytes(file.size)}</p>
      </div>
    </div>
  );
}

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/mov',
  'video/quicktime',
  'video/webm',
  'video/avi',
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function MediaUploader({ files, onChange, maxFiles = 10 }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback(
    (rawFiles: FileList | File[]) => {
      setError(null);
      const arr = Array.from(rawFiles);
      const remaining = maxFiles - files.length;

      if (arr.length > remaining) {
        setError(`You can add up to ${maxFiles} media files total.`);
        return;
      }

      const invalid = arr.filter(
        (f) => !ACCEPTED_TYPES.includes(f.type) || f.size > MAX_FILE_SIZE
      );
      if (invalid.length > 0) {
        setError('Some files were skipped (unsupported type or > 100 MB).');
      }

      const valid = arr.filter(
        (f) => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE
      );

      const newMedia: MediaFile[] = valid.map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        file: f,
        url: URL.createObjectURL(f),
        type: f.type.startsWith('video/') ? 'video' : 'image',
        name: f.name,
        size: f.size,
      }));

      onChange([...files, ...newMedia]);
    },
    [files, onChange, maxFiles]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const removeFile = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file) URL.revokeObjectURL(file.url);
    onChange(files.filter((f) => f.id !== id));
  };

  const canAdd = files.length < maxFiles;

  return (
    <div className="space-y-3">
      {/* Thumbnails grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((file) => (
            <MediaThumbnail
              key={file.id}
              file={file}
              onRemove={() => removeFile(file.id)}
            />
          ))}

          {/* Add more button inside grid */}
          {canAdd && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                'h-full min-h-[120px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5',
                'text-gray-400 dark:text-gray-600',
                'border-gray-200 dark:border-gray-700',
                'hover:border-violet-400 hover:text-violet-500 dark:hover:border-violet-600 dark:hover:text-violet-400',
                'transition-colors'
              )}
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs font-medium">Add more</span>
            </button>
          )}
        </div>
      )}

      {/* Drop zone (shown when no files or always visible) */}
      {files.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative flex flex-col items-center justify-center gap-3 py-8 px-4 rounded-xl cursor-pointer',
            'border-2 border-dashed transition-all duration-200',
            dragOver
              ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 scale-[1.01]'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50',
            'hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/10'
          )}
        >
          <div
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center transition-colors',
              dragOver
                ? 'bg-violet-100 dark:bg-violet-900/40'
                : 'bg-gray-100 dark:bg-gray-800'
            )}
          >
            <Upload
              className={cn(
                'w-6 h-6 transition-colors',
                dragOver ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500'
              )}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Drop files here or{' '}
              <span className="text-violet-600 dark:text-violet-400">browse</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Images (JPG, PNG, GIF, WebP) · Videos (MP4, MOV, WebM) · Max 100 MB each
            </p>
          </div>
          <div className="flex items-center gap-3 text-gray-300 dark:text-gray-700">
            <Image className="w-5 h-5" />
            <Video className="w-5 h-5" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}

      {/* File count info */}
      {files.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {files.length}/{maxFiles} file{files.length !== 1 ? 's' : ''} selected
        </p>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={handleFileChange}
        id="media-upload-input"
      />
    </div>
  );
}
