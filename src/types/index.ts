export type Platform = 'facebook' | 'instagram' | 'x' | 'tiktok';

export type PostStatus = 'scheduled' | 'published' | 'failed';

export interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  mediaUrl?: string;       // legacy single URL
  mediaUrls?: string[];    // multiple media files
  scheduledAt: string;     // ISO UTC string
  status: PostStatus;
  errorMessage?: string;
}

export interface CreatePostPayload {
  content: string;
  platforms: Platform[];
  mediaUrl?: string;
  mediaUrls?: string[];
  scheduledAt: string;     // ISO UTC string
}

export const PLATFORM_CHAR_LIMITS: Record<Platform, number> = {
  x: 280,
  instagram: 2200,
  tiktok: 2200,
  facebook: 5000,
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  x: 'X (Twitter)',
  tiktok: 'TikTok',
};

export const ALL_PLATFORMS: Platform[] = ['facebook', 'instagram', 'x', 'tiktok'];
