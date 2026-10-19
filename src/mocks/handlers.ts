import { http, HttpResponse, delay } from 'msw';
import { mockPosts } from './data';
import { Post, CreatePostPayload } from '../types';

// In-memory store
let posts: Post[] = [...mockPosts];

export const handlers = [
  // GET /api/posts
  http.get('/api/posts', async () => {
    await delay(600);
    return HttpResponse.json(posts);
  }),

  // POST /api/posts
  http.post('/api/posts', async ({ request }) => {
    await delay(800);
    const payload = (await request.json()) as CreatePostPayload;
    const newPost: Post = {
      id: `post-${Date.now()}`,
      ...payload,
      status: 'scheduled',
    };
    posts = [newPost, ...posts];
    return HttpResponse.json(newPost, { status: 201 });
  }),

  // PATCH /api/posts/:id — edit posts that have not been published
  http.patch('/api/posts/:id', async ({ params, request }) => {
    await delay(500);
    const id = params['id'] as string;
    const post = posts.find((item) => item.id === id);
    if (!post) {
      return HttpResponse.json({ error: 'Post not found.' }, { status: 404 });
    }
    if (post.status === 'published') {
      return HttpResponse.json({ error: 'Published posts can no longer be edited.' }, { status: 409 });
    }

    const payload = (await request.json()) as CreatePostPayload;
    const mediaUrls = payload.mediaUrls
      ?? (payload.mediaUrl ? [payload.mediaUrl] : post.mediaUrls ?? (post.mediaUrl ? [post.mediaUrl] : []));
    const updated: Post = {
      ...post,
      ...payload,
      mediaUrl: mediaUrls[0],
      mediaUrls,
    };
    posts = posts.map((item) => item.id === id ? updated : item);
    return HttpResponse.json(updated);
  }),

  // DELETE /api/posts/:id
  http.delete('/api/posts/:id', async ({ params }) => {
    await delay(500);
    const id = params['id'] as string;
    posts = posts.filter((p) => p.id !== id);
    return HttpResponse.json({ success: true });
  }),

  // PATCH /api/posts/:id/retry
  http.patch('/api/posts/:id/retry', async ({ params }) => {
    await delay(1000);
    const id = params['id'] as string;
    const post = posts.find((item) => item.id === id);
    if (!post) {
      return HttpResponse.json({ error: 'Post not found.' }, { status: 404 });
    }
    if (Math.random() < 0.2) {
      return HttpResponse.json(
        { error: 'The retry failed because of a simulated publishing error. Please try again.' },
        { status: 503 }
      );
    }

    const updated = { ...post, status: 'scheduled' as const, errorMessage: undefined };
    posts = posts.map((item) => item.id === id ? updated : item);
    return HttpResponse.json(updated);
  }),
];
