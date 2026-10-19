# Flintzy Social Media Scheduler

A responsive, frontend-only social media scheduling dashboard built with React and TypeScript for the Flintzy Frontend Developer Assignment. Compose and manage sample posts for Facebook, Instagram, X, and TikTok from one dashboard.

## Features

- Queue of 49 mock posts grouped by day, with expandable past history, content previews, platform icons, local scheduled times, and status.
- Filter by one or more platforms and statuses, and search post content. Selections are encoded in URL query parameters and restored on refresh. For example:
  `/?platform=instagram&platform=x&status=scheduled&status=failed&q=launch`
- Compose and edit posts with text, multiple platform selection, a local date/time picker, and per-platform character counts.
- Attach optional media using one input method at a time: enter HTTP(S) image URLs or browse/drag image and video files into the composer. Switching methods after attaching media asks for confirmation before removing the current attachments. The composer previews and supports removing media, with a limit of 10 items.
- Validate that the scheduled time is in the future and convert local date/time input to a UTC ISO timestamp.
- Retry failed posts with an immediate optimistic status update, a simulated one-second API delay, and a 20% simulated failure rate. A failed retry restores the failed status and displays the returned error.
- Delete posts, preview posts, use the emoji picker, and switch between light and dark themes.
- Responsive layout, loading skeletons, empty states, and API error feedback.

## Tech stack

- React 18, TypeScript, and Vite
- Tailwind CSS and Lucide React
- React Router for URL query parameters
- Zustand for post state
- Mock Service Worker (MSW) for API responses
- React Hook Form and Zod for composer validation
- date-fns for date formatting

## Run locally

### Requirements

- Node.js 18 or later
- npm

### Install and start

```bash
git clone https://github.com/intermediatecoder/social-media-scheduler.git
cd social-media-scheduler
npm install
npm run dev
```

Open the local URL printed by Vite (usually <http://localhost:5173>).

### Production build

```bash
npm run build
npm run preview
```

## Mock API and data

MSW intercepts the app's `/api/posts` requests in the browser. The sample data and handlers are in `src/mocks/`. The mock API simulates response delays, including the one-second retry delay. Its data is held in memory, so changes made during a session reset when the page is refreshed. There is no real social network connection, authentication, server-side persistence, media upload service, or publishing.

Files selected or dropped into the composer use browser object URLs for local previews; those files are not uploaded. The image URL field accepts HTTP(S) URLs. These mock media values are only used by the local UI and are not sent to a social platform.

## Key decisions and assumptions

- **Frontend-only behavior:** As required, login, account linking, real publishing, and a production backend are out of scope. MSW provides mock API responses instead.
- **Post history:** Past-dated posts are shown in a separate expandable History section below the upcoming queue.
- **Multiple media items:** The assignment describes an optional `mediaUrl`; this implementation supports a URL plus drag-and-drop/file selection and multiple media previews, capped at 10 items.
- **Local media previews:** File previews use object URLs because no upload service is part of the assignment. They are temporary and reset with the page session.
- **Filter URL format:** Selected values use readable repeated parameters (`platform=instagram&platform=x`). Existing comma-separated platform/status values are also accepted.
- **Retry simulation:** A retry waits one second and has a 20% mock failure chance. On failure, the UI rolls the status back to failed and shows the error.
- **No permanent data storage:** Mock post changes reset on refresh; only filter state is preserved in the URL. The selected color theme is stored in local storage.

## Deployment

The app can be deployed as a static Vite site to a service such as Vercel or Netlify. Run `npm run build` and configure the service to use `npm run build` as its build command and `dist` as its output directory. Configure SPA fallback/rewrite behavior so direct navigation is served through `index.html`.

No live deployment URL is currently configured.

## Assignment submission

Repository: <https://github.com/intermediatecoder/social-media-scheduler>

This project was prepared for the Flintzy Frontend Developer Assignment. The live app should be deployed and the deployed URL added here before final submission.
