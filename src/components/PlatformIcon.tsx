import React from 'react';
import { Platform } from '../types';
import { cn } from '../lib/utils';

interface PlatformIconProps {
  platform: Platform;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function PlatformIcon({ platform, size = 'md', className }: PlatformIconProps) {
  const sizeClass = sizes[size];

  if (platform === 'facebook') {
    return (
      <svg
        className={cn(sizeClass, className)}
        viewBox="0 0 24 24"
        fill="#1877F2"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Facebook"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }

  if (platform === 'instagram') {
    return (
      <svg
        className={cn(sizeClass, className)}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Instagram"
      >
        <defs>
          <radialGradient id="ig-grad" r="150%" cx="30%" cy="107%">
            <stop stopColor="#fdf497" offset="0" />
            <stop stopColor="#fd5949" offset="0.45" />
            <stop stopColor="#d6249f" offset="0.6" />
            <stop stopColor="#285AEB" offset="0.9" />
          </radialGradient>
        </defs>
        <rect width="24" height="24" rx="5" fill="url(#ig-grad)" />
        <path
          d="M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 7.5a3 3 0 110-6 3 3 0 010 6zm5.25-8.25a1.05 1.05 0 100 2.1 1.05 1.05 0 000-2.1z"
          fill="white"
        />
      </svg>
    );
  }

  if (platform === 'x') {
    return (
      <svg
        className={cn(sizeClass, className)}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="X (Twitter)"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  if (platform === 'tiktok') {
    return (
      <svg
        className={cn(sizeClass, className)}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="TikTok"
      >
        <path
          d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.77a4.86 4.86 0 01-1-.08z"
          fill="black"
        />
      </svg>
    );
  }

  return null;
}

interface PlatformBadgeProps {
  platform: Platform;
  className?: string;
}

const platformColors: Record<Platform, string> = {
  facebook: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  instagram: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  x: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  tiktok: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const labels: Record<Platform, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    x: 'X',
    tiktok: 'TikTok',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        platformColors[platform],
        className
      )}
    >
      <PlatformIcon platform={platform} size="sm" />
      {labels[platform]}
    </span>
  );
}
