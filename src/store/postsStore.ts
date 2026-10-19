import { create } from 'zustand';
import { Post, CreatePostPayload } from '../types';

async function getResponseError(response: Response, action: string): Promise<Error> {
  const body = await response.text();
  if (body) {
    try {
      const data: unknown = JSON.parse(body);
      if (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string') {
        return new Error(data.error);
      }
    } catch {
      if (!body.trimStart().startsWith('<')) return new Error(body);
    }
  }

  const detail = response.status === 404
    ? 'The mock API endpoint was not found. Reload the app and try again.'
    : `The server returned ${response.status}${response.statusText ? ` ${response.statusText}` : ''}.`;
  return new Error(`${action} failed. ${detail}`);
}

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  retryingIds: Set<string>;
  deletingIds: Set<string>;

  fetchPosts: () => Promise<void>;
  createPost: (payload: CreatePostPayload) => Promise<void>;
  updatePost: (id: string, payload: CreatePostPayload) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  retryPost: (id: string) => Promise<void>;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,
  retryingIds: new Set<string>(),
  deletingIds: new Set<string>(),

  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/posts');
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data: Post[] = await res.json();
      set({ posts: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createPost: async (payload: CreatePostPayload) => {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw await getResponseError(res, 'Scheduling post');
    const newPost: Post = await res.json();
    set((state: PostsState) => ({ posts: [newPost, ...state.posts] }));
  },

  updatePost: async (id, payload) => {
    const currentPost = get().posts.find((post) => post.id === id);
    if (!currentPost) throw new Error('This post is no longer in the queue. Refresh and try again.');
    if (currentPost.status === 'published') throw new Error('Published posts can no longer be edited.');

    const res = await fetch(`/api/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw await getResponseError(res, 'Updating post');
    const updatedPost: Post = await res.json();
    if (updatedPost.id !== id) throw new Error('Update response did not match the requested post.');
    set((state: PostsState) => ({
      posts: state.posts.map((post) => post.id === id ? updatedPost : post),
    }));
  },

  deletePost: async (id: string) => {
    set((state: PostsState) => {
      const ids = new Set(state.deletingIds);
      ids.add(id);
      return { deletingIds: ids };
    });

    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      set((state: PostsState) => ({
        posts: state.posts.filter((p: Post) => p.id !== id),
        deletingIds: (() => {
          const ids = new Set(state.deletingIds);
          ids.delete(id);
          return ids;
        })(),
      }));
    } catch {
      set((state: PostsState) => {
        const ids = new Set(state.deletingIds);
        ids.delete(id);
        return { deletingIds: ids };
      });
    }
  },

  retryPost: async (id: string) => {
    const post = get().posts.find((item) => item.id === id);
    if (!post) throw new Error('This post is no longer in the queue. Refresh and try again.');
    if (get().retryingIds.has(id)) throw new Error('This post is already being retried.');

    set((state: PostsState) => {
      const ids = new Set(state.retryingIds);
      ids.add(id);
      return {
        retryingIds: ids,
        posts: state.posts.map((item) =>
          item.id === id ? { ...item, status: 'scheduled', errorMessage: undefined } : item
        ),
      };
    });

    try {
      const res = await fetch(`/api/posts/${id}/retry`, { method: 'PATCH' });
      if (!res.ok) throw await getResponseError(res, 'Retrying post');
      const updatedPost: Post = await res.json();
      if (updatedPost.id !== id) throw new Error('Retry response did not match the requested post.');
      set((state: PostsState) => ({
        posts: state.posts.map((item) => item.id === id ? updatedPost : item),
      }));
    } catch (err) {
      set((state: PostsState) => {
        return {
          posts: state.posts.map((item) =>
            item.id === id
              ? { ...post, errorMessage: err instanceof Error ? err.message : 'Retry failed. Please try again.' }
              : item
          ),
        };
      });
      throw err;
    } finally {
      set((state: PostsState) => {
        const ids = new Set(state.retryingIds);
        ids.delete(id);
        return { retryingIds: ids };
      });
    }
  },
}));
