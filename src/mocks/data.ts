import { Post } from '../types';

// Current time reference: 2026-10-15T08:53:45Z (UTC)
// Local time: 2026-10-15T14:23:45+05:30

const now = new Date();

function hoursFromNow(hours: number): string {
  return new Date(now.getTime() + hours * 3600000).toISOString();
}

function daysFromNow(days: number, hour = 10, minute = 0): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number, hour = 10): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

export const mockPosts: Post[] = [
  // ─── Today — Scheduled ───────────────────────────────────────────────────
  {
    id: 'post-001',
    content:
      '🚀 Big news! We\'re launching our new product line this Friday. Stay tuned for exclusive deals and behind-the-scenes content. Drop a 🔥 in the comments if you\'re excited!',
    platforms: ['facebook', 'instagram'],
    mediaUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800',
    mediaUrls: [
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600',
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600',
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600',
    ],
    scheduledAt: hoursFromNow(2),
    status: 'scheduled',
  },
  {
    id: 'post-002',
    content:
      'New blog post alert 📝 We just dropped an in-depth guide on how to grow your audience organically in 2026. Link in bio!',
    platforms: ['x', 'facebook'],
    scheduledAt: hoursFromNow(4),
    status: 'scheduled',
  },
  {
    id: 'post-003',
    content: '✨ Monday motivation: Success is not final, failure is not fatal — it\'s the courage to continue that counts. Have a great week, everyone! 💪',
    platforms: ['instagram', 'x'],
    mediaUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
    mediaUrls: [
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
    ],
    scheduledAt: hoursFromNow(6),
    status: 'scheduled',
  },
  {
    id: 'post-004',
    content: 'Behind the scenes of our creative process 🎬 Watch us build something amazing from scratch. What would you like to see us create next?',
    platforms: ['tiktok', 'instagram'],
    mediaUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800',
    mediaUrls: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600',
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600',
    ],
    scheduledAt: hoursFromNow(8),
    status: 'scheduled',
  },
  {
    id: 'post-005',
    content: 'Customer spotlight 🌟 Shoutout to @sarah_creates for the amazing work she\'s doing with our tools! Tag someone who inspires you daily.',
    platforms: ['facebook'],
    scheduledAt: hoursFromNow(10),
    status: 'scheduled',
  },

  // ─── Today — Published ────────────────────────────────────────────────────
  {
    id: 'post-006',
    content: 'Good morning, world! ☀️ Start your day with purpose and positivity. What\'s your #1 goal for today? Tell us in the comments!',
    platforms: ['facebook', 'instagram', 'x'],
    scheduledAt: hoursFromNow(-2),
    status: 'published',
  },
  {
    id: 'post-007',
    content: '🎉 We just hit 100K followers! This milestone means everything to us. Thank you for your incredible support. HUGE giveaway coming this week!',
    platforms: ['instagram', 'tiktok'],
    mediaUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    mediaUrls: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
    ],
    scheduledAt: hoursFromNow(-4),
    status: 'published',
  },
  {
    id: 'post-008',
    content: 'Pro tip of the day 💡 Use the Pomodoro technique to stay focused: 25 min work, 5 min break. Repeat 4 times then take a longer break. Game changer!',
    platforms: ['x'],
    scheduledAt: hoursFromNow(-1),
    status: 'published',
  },

  // ─── Today — Failed ───────────────────────────────────────────────────────
  {
    id: 'post-009',
    content: 'Flash sale starts NOW! 🔥 Get 40% off everything in our store for the next 24 hours only. Use code FLASH40 at checkout. Shop the link in bio!',
    platforms: ['facebook', 'instagram', 'x', 'tiktok'],
    mediaUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
    scheduledAt: hoursFromNow(-3),
    status: 'failed',
    errorMessage: 'Network timeout: Failed to upload media asset. Please retry.',
  },
  {
    id: 'post-010',
    content: 'Join us live tonight at 8PM EST for a Q&A session! We\'ll be answering your questions about growth strategies and the future of content creation.',
    platforms: ['instagram', 'tiktok'],
    scheduledAt: hoursFromNow(-5),
    status: 'failed',
    errorMessage: 'Rate limit exceeded: Too many posts in a short time window.',
  },

  // ─── Tomorrow — Scheduled ─────────────────────────────────────────────────
  {
    id: 'post-011',
    content: '📊 Weekly industry report is out! Key insights on social media trends for Q4 2026. Read our full breakdown on the blog. Link below 👇',
    platforms: ['facebook', 'x'],
    scheduledAt: daysFromNow(1, 9, 0),
    status: 'scheduled',
  },
  {
    id: 'post-012',
    content: 'Recipe Tuesday 🍕 Try our quick 15-minute pasta recipe that\'s perfect for busy weeknights. Save this post for later!',
    platforms: ['instagram', 'tiktok'],
    mediaUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    mediaUrls: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600',
    ],
    scheduledAt: daysFromNow(1, 12, 0),
    status: 'scheduled',
  },
  {
    id: 'post-013',
    content: 'Reminder: Our free webinar on "Mastering Short-Form Video in 2026" starts tomorrow at 3PM EST. Register now — spots are filling up fast! 🎙️',
    platforms: ['facebook', 'instagram', 'x'],
    scheduledAt: daysFromNow(1, 14, 0),
    status: 'scheduled',
  },
  {
    id: 'post-014',
    content: 'Throwback to when we started in a tiny apartment with zero budget 😅 Look how far we\'ve come! Your support made this possible. #TBT #Grateful',
    platforms: ['instagram'],
    mediaUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    scheduledAt: daysFromNow(1, 17, 0),
    status: 'scheduled',
  },
  {
    id: 'post-015',
    content: 'New collab dropping tomorrow 👀 We teamed up with @techbrand to bring you something you\'ve never seen before. Be the first to know by turning on notifications!',
    platforms: ['x', 'tiktok'],
    scheduledAt: daysFromNow(1, 20, 0),
    status: 'scheduled',
  },

  // ─── Day +2 ───────────────────────────────────────────────────────────────
  {
    id: 'post-016',
    content: '🌍 World Mental Health Day reminder: It\'s okay to not be okay. Take care of your mental health today and every day. Share this with someone who needs to hear it.',
    platforms: ['facebook', 'instagram', 'x'],
    scheduledAt: daysFromNow(2, 10, 0),
    status: 'scheduled',
  },
  {
    id: 'post-017',
    content: 'Product demo video dropping Wednesday! 🎬 See how our platform cuts your workflow time in half. No more switching between 10 different tools.',
    platforms: ['tiktok', 'instagram'],
    mediaUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
    scheduledAt: daysFromNow(2, 13, 0),
    status: 'scheduled',
  },
  {
    id: 'post-018',
    content: 'Hiring alert! 🚨 We\'re looking for a passionate UX Designer to join our remote team. Check the link in bio for details. Tag someone who would be perfect!',
    platforms: ['facebook', 'x'],
    scheduledAt: daysFromNow(2, 15, 30),
    status: 'scheduled',
  },

  // ─── Day +3 ───────────────────────────────────────────────────────────────
  {
    id: 'post-019',
    content: 'Thursday Threads 🧵 A quick thread on why consistency beats perfection every single time in content creation. Save this and re-read when you feel stuck. [1/7]',
    platforms: ['x'],
    scheduledAt: daysFromNow(3, 8, 0),
    status: 'scheduled',
  },
  {
    id: 'post-020',
    content: '🎁 GIVEAWAY TIME! Win a 1-year Pro subscription worth $599! To enter: 1) Follow us 2) Like this post 3) Tag 2 friends in comments. Winner announced Friday!',
    platforms: ['instagram', 'tiktok', 'facebook'],
    mediaUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800',
    mediaUrls: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600',
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600',
    ],
    scheduledAt: daysFromNow(3, 11, 0),
    status: 'scheduled',
  },
  {
    id: 'post-021',
    content: 'Case study: How @startup_x grew from 0 to 50K followers in 3 months using our platform. Read the full story on our blog. The results will surprise you!',
    platforms: ['facebook', 'x'],
    scheduledAt: daysFromNow(3, 14, 0),
    status: 'scheduled',
  },

  // ─── Day +4 ───────────────────────────────────────────────────────────────
  {
    id: 'post-022',
    content: 'Friday vibes 🎶 What\'s your go-to playlist for a productive work session? Drop your recommendations below — we\'ll feature the best ones in our next story!',
    platforms: ['instagram', 'x'],
    scheduledAt: daysFromNow(4, 9, 30),
    status: 'scheduled',
  },
  {
    id: 'post-023',
    content: 'Weekend reading list 📚 5 books every entrepreneur should read before 2027:\n1. Zero to One\n2. The Lean Startup\n3. Atomic Habits\n4. Start With Why\n5. The Hard Thing About Hard Things',
    platforms: ['facebook', 'x', 'instagram'],
    scheduledAt: daysFromNow(4, 16, 0),
    status: 'scheduled',
  },
  {
    id: 'post-024',
    content: 'ICYMI: Our biggest feature update ever just dropped! Real-time analytics, AI-powered captions, and bulk scheduling are now live for all Pro users. 🚀',
    platforms: ['facebook', 'instagram', 'x', 'tiktok'],
    mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    mediaUrls: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
    ],
    scheduledAt: daysFromNow(4, 18, 0),
    status: 'scheduled',
  },

  // ─── Day +5 ───────────────────────────────────────────────────────────────
  {
    id: 'post-025',
    content: 'Saturday Spotlight ✨ This week we\'re featuring the incredible work of our community member @maria_designs. Her designs are absolutely stunning — go show her some love!',
    platforms: ['instagram', 'facebook'],
    mediaUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    scheduledAt: daysFromNow(5, 10, 0),
    status: 'scheduled',
  },
  {
    id: 'post-026',
    content: 'Myth busted 🕵️ "You need to post 3x a day to grow." FALSE. Quality > quantity always. Here\'s our data from analyzing 10,000 accounts over 6 months...',
    platforms: ['x', 'facebook'],
    scheduledAt: daysFromNow(5, 14, 0),
    status: 'scheduled',
  },

  // ─── Day +7 ───────────────────────────────────────────────────────────────
  {
    id: 'post-027',
    content: '🎯 New month, new goals! What are you working on this October? Share your main focus in the comments and let\'s keep each other accountable!',
    platforms: ['instagram', 'facebook', 'x'],
    scheduledAt: daysFromNow(7, 9, 0),
    status: 'scheduled',
  },
  {
    id: 'post-028',
    content: 'Podcast episode alert 🎙️ We sat down with @founder_jane to talk about building a $10M business from scratch with no funding. Episode drops Monday!',
    platforms: ['facebook', 'x'],
    mediaUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800',
    scheduledAt: daysFromNow(7, 12, 0),
    status: 'scheduled',
  },

  // ─── Additional upcoming posts ────────────────────────────────────────────
  {
    id: 'post-035',
    content: 'A little reminder for today: progress is built one small step at a time. What is one thing you are proud of this week?',
    platforms: ['instagram', 'facebook'],
    scheduledAt: hoursFromNow(1),
    status: 'scheduled',
  },
  {
    id: 'post-036',
    content: 'Quick tip: keep your best-performing content ideas in one place so inspiration never goes to waste. What is your favorite planning habit?',
    platforms: ['x', 'facebook'],
    scheduledAt: hoursFromNow(3),
    status: 'scheduled',
  },
  {
    id: 'post-037',
    content: 'Tomorrow\'s prompt: introduce your team to the people behind the brand. A friendly hello can make your next post feel more personal.',
    platforms: ['facebook', 'instagram'],
    scheduledAt: daysFromNow(1, 10, 0),
    status: 'scheduled',
  },
  {
    id: 'post-038',
    content: 'Behind every great idea is a first draft. Share yours, learn from the feedback, and keep creating. What are you working on?',
    platforms: ['x', 'tiktok'],
    scheduledAt: daysFromNow(1, 16, 0),
    status: 'scheduled',
  },
  {
    id: 'post-039',
    content: 'Creator spotlight: we love seeing the clever ways our community brings big ideas to life. Tag a creator whose work deserves more attention.',
    platforms: ['instagram', 'facebook'],
    scheduledAt: daysFromNow(2, 9, 0),
    status: 'scheduled',
  },
  {
    id: 'post-040',
    content: 'Make your next campaign easier: pick one clear goal, one audience, and one message. Simple plans are easier to put into action.',
    platforms: ['x', 'facebook'],
    scheduledAt: daysFromNow(2, 15, 0),
    status: 'scheduled',
  },
  {
    id: 'post-041',
    content: 'What is one question your customers ask all the time? Answer it in your next post and help someone get started.',
    platforms: ['instagram', 'tiktok'],
    scheduledAt: daysFromNow(3, 9, 30),
    status: 'scheduled',
  },
  {
    id: 'post-042',
    content: 'A great community is built through conversation. Take a moment to reply to a comment and keep the discussion going.',
    platforms: ['facebook', 'x'],
    scheduledAt: daysFromNow(3, 15, 30),
    status: 'scheduled',
  },
  {
    id: 'post-043',
    content: 'Save this for your next planning session: brainstorm freely first, then choose the ideas that best serve your audience.',
    platforms: ['instagram', 'x'],
    scheduledAt: daysFromNow(4, 10, 0),
    status: 'scheduled',
  },
  {
    id: 'post-044',
    content: 'Show, do not just tell. A short demo can make a useful feature much easier to understand. What would you like to see demonstrated?',
    platforms: ['tiktok', 'facebook'],
    scheduledAt: daysFromNow(4, 16, 0),
    status: 'scheduled',
  },
  {
    id: 'post-045',
    content: 'Friday check-in: celebrate the small wins, thank the people who helped, and make a little room for what comes next.',
    platforms: ['instagram', 'facebook'],
    scheduledAt: daysFromNow(5, 10, 0),
    status: 'scheduled',
  },
  {
    id: 'post-046',
    content: 'Which format should we make more of: quick tips, behind-the-scenes clips, or customer stories? Tell us below.',
    platforms: ['x', 'instagram'],
    scheduledAt: daysFromNow(5, 16, 0),
    status: 'scheduled',
  },
  {
    id: 'post-047',
    content: 'Weekend inspiration: take a fresh look at an old idea. A new example or perspective can make it useful all over again.',
    platforms: ['facebook', 'tiktok'],
    scheduledAt: daysFromNow(6, 10, 0),
    status: 'scheduled',
  },
  {
    id: 'post-048',
    content: 'Your audience has great ideas too. Ask them what they want to learn next, then turn the answers into your content calendar.',
    platforms: ['instagram', 'x'],
    scheduledAt: daysFromNow(6, 16, 0),
    status: 'scheduled',
  },
  {
    id: 'post-049',
    content: 'New week, new opportunity to share something helpful. What is one useful lesson you can pass on to your community?',
    platforms: ['facebook', 'instagram', 'x'],
    scheduledAt: daysFromNow(7, 10, 0),
    status: 'scheduled',
  },

  // ─── Past — Published ─────────────────────────────────────────────────────
  {
    id: 'post-029',
    content: '🎤 Our co-founder just gave an incredible talk at TechConf 2026. Watch the full recording on our YouTube channel. It\'s a must-watch for any entrepreneur!',
    platforms: ['facebook', 'x', 'instagram'],
    mediaUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    scheduledAt: daysAgo(1, 14),
    status: 'published',
  },
  {
    id: 'post-030',
    content: 'We asked, you answered! 📊 Here are the results of our poll on your biggest social media challenges. Swipe to see the full breakdown and our tips!',
    platforms: ['instagram'],
    scheduledAt: daysAgo(2, 10),
    status: 'published',
  },
  {
    id: 'post-031',
    content: 'Happy Friday everyone! 🎊 Hope you all crushed your goals this week. Celebrate your wins, no matter how small. You deserve it!',
    platforms: ['facebook', 'instagram', 'x', 'tiktok'],
    scheduledAt: daysAgo(3, 16),
    status: 'published',
  },
  {
    id: 'post-032',
    content: 'Our new dashboard is LIVE and our users are loving it 💙 Clean, fast, and powerful. This is just the beginning of what we have planned for 2026.',
    platforms: ['x', 'facebook'],
    scheduledAt: daysAgo(5, 11),
    status: 'published',
  },

  // ─── Past — Failed ────────────────────────────────────────────────────────
  {
    id: 'post-033',
    content: 'Summer sale ends tonight at midnight! ☀️ Last chance to grab 50% off our annual plan. Don\'t miss out — this deal won\'t come around again!',
    platforms: ['facebook', 'instagram'],
    scheduledAt: daysAgo(4, 9),
    status: 'failed',
    errorMessage: 'Authentication error: Access token expired. Please reconnect your account.',
  },
  {
    id: 'post-034',
    content: 'Breaking: We just partnered with @globaltech to expand our reach to 15 new markets! 🌏 This is a massive step forward for our community worldwide.',
    platforms: ['x', 'facebook'],
    scheduledAt: daysAgo(6, 13),
    status: 'failed',
    errorMessage: 'Content policy violation: Post flagged for manual review.',
  },
];
