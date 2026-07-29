## Goal
Ship a focused MVP for **سيگار صورتی** that feels like a living social platform, not a landing page. The first version covers the core loop: discover → follow → post → message.

## Design decisions (locked from your picks)
- **Palette:** Blush & Lavender — `#f8e8ee`, `#e8c5d0`, `#c9a0dc`, `#9b72cf`
- **Typography:** Space Grotesk headings + DM Sans body
- **Homepage:** Feed stream layout
- **Mood:** Soft, poetic, underground-youth energy with clean modern tech structure

## MVP scope
1. **Auth** — sign up / log in / log out via Lovable Cloud
2. **Feed** — chronological posts (text + image), like, comment count
3. **Create post** — text + optional generated/selected image
4. **Profile** — avatar, bio, follower/following counts, user's posts
5. **Explore** — suggested users + trending tags
6. **Direct messaging** — conversation list + single thread
7. **Responsive nav** — mobile bottom tab bar, desktop sidebar

## Out of scope for MVP
- Stories / reels
- Groups / events
- Music/poetry uploads
- Algorithmic recommendations
- Notifications center
- Real-time updates

## Routes
```text
/                 Landing + feed preview
/feed             Main feed (authenticated)
/profile/$id        User profile
/messages           Conversation list
/messages/$id       Conversation thread
/explore            Discover people & tags
/auth               Login / signup
```

## Backend (Lovable Cloud)
- Enable Lovable Cloud for auth + Postgres
- Tables: `profiles`, `posts`, `likes`, `comments`, `follows`, `conversations`, `messages`
- RLS policies per user
- Seed 3–5 demo users + posts so the feed isn't empty

## Design system
- Update `src/styles.css` with Blush & Lavender tokens
- Load Space Grotesk + DM Sans via Google Fonts in `__root.tsx`
- Custom feed card, avatar, tab bar, and message bubble components

## Verification
- Build passes
- Feed renders with seeded posts
- Auth flow works in preview
- Mobile bottom nav and desktop sidebar both functional

Want me to build this MVP?