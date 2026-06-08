# Back2U — Project Context for Claude Code

## What is Back2U
Cameroon's first lost and found + missing persons recovery platform. Built as a university final year project.
Live: https://back2u.vercel.app
Repo: https://github.com/Neh-lizza/Back2u

## Stack
- Next.js 16.1.6 (App Router, Turbopack)
- Supabase (PostgreSQL + PostGIS + pgvector + Storage + Auth)
- Tailwind CSS
- Framer Motion
- Mapbox GL JS
- MeSomb (mobile money payments — MTN & Orange)
- Hugging Face API (CLIP model for AI image matching)
- Vercel (deployment)

## Brand
- Primary: #009A49 (green)
- Secondary: #FCD116 (yellow)
- Accent: #CE1126 (red)
- Dark: #061209
- Background (light pages): #F0F4F8
- Fonts: Clash Grotesk (headings) + Satoshi (body)

## Critical Rules
- NEVER use emojis anywhere — not in code, UI, or text
- NEVER use em dashes (—) anywhere
- Found items are always free, forever
- Missing persons are always free, forever
- First lost report is free
- After first free post: 300 XAF/year subscription required
- No unlock fees (removed entirely — subscription model replaced it)

## Admin
- Admin email: nehhlizza@gmail.com
- Supabase project: vncsjlcianjbgcuyzyeq
- Admin role set in users table

## Pages & Their Theme
- `/` — homepage (white bg)
- `/browse` — light theme (#F0F4F8)
- `/report` — light theme (#F0F4F8) with dark hero banner (#061209)
- `/dashboard` — light theme (#F0F4F8)
- `/chat` — light theme
- `/admin` — light theme (#F0F4F8)
- `/subscribe` — dark theme (#061209)
- `/banned` — dark theme (#061209)
- `/auth` — existing (do not change)
- `/browse/[id]` — dark theme

## Completed Phases
- Phase 1-19: Core features (auth, items, matching, chat, recovery, notifications, admin)
- Phase 20: AI Image Matching (CLIP + pgvector, Hugging Face API)
- Phase 20b: AI Category Auto-Detection (CLIP zero-shot classification)
- Phase 21: Fraud Detection (6 rules — R1 rapid posting, R2 duplicate title, R3 item flags, R4 user ban, R5 suspicious unlocks, R6 low recovery rate)
- Phase 22: Facebook Share Requests (admin reviews and posts manually)
- Missing Persons system (free forever, exempt from archiving)
- Subscription model (300 XAF/year for lost item posters)

## Pending SQL (run in Supabase SQL Editor)
- `subscription-model.sql`
- `phase-21-fraud-detection.sql`
- `phase-22-facebook-requests.sql`
- `fix-handle-new-user.sql` — fixes "Welcome, Guardian" bug
- `fix-admin-rls.sql` — fixes admin seeing only 1 user

## Key Database Tables
- `users` — id, full_name, email, city, region, role, is_banned, is_flagged, is_subscribed, subscription_end, recovery_count, guardian_points
- `items` — id, user_id, type (lost/found), title, description, category, photos, location_name, city, region, sensitivity, status, is_missing_person, missing_person_name, missing_person_age, missing_person_gender, embedding (vector 512)
- `chats` — id, item_id, participant_a, participant_b, is_unlocked
- `messages` — id, chat_id, sender_id, content, created_at
- `matches` — id, item_a_id, item_b_id, score
- `visual_matches` — id, item_a_id, item_b_id, similarity
- `recoveries` — id, chat_id, confirmed_by_a, confirmed_by_b
- `notifications` — id, user_id, type, title, body, data, read
- `flags` — id, item_id, user_id, reason
- `facebook_share_requests` — id, item_id, user_id, status, posted_at
- `subscriptions` — id, user_id, amount, status, mesomb_ref, paid_at

## Key Functions (Supabase RPC)
- `find_visual_matches(query_embedding, match_item_id, match_type, similarity_threshold, max_results)` — AI visual matching
- `can_user_post(p_user_id)` — checks subscription for lost items
- `activate_subscription(p_user_id)` — activates 1 year subscription
- `get_unlock_fee(item_id)` — returns 0 (subscription model, no unlock fees)
- `check_suspicious_unlocks(p_user_id, p_item_id)` — fraud rule R5

## API Routes
- `/api/match-image` — triggers CLIP image matching after item insert
- `/api/detect-category` — CLIP zero-shot category detection from photo
- `/api/subscribe` — MeSomb payment for 300 XAF subscription

## Environment Variables (Vercel)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_MAPBOX_TOKEN
- HUGGINGFACE_API_KEY
- MESOMB_APP_KEY
- MESOMB_ACCESS_KEY
- MESOMB_SECRET_KEY

## Remaining Phases
- Phase 23: WhatsApp Bot
- Phase 24: USSD

## UI Issues to Fix (priority order)
1. Browse page cards — need better visual hierarchy and hover states
2. Dashboard — stat cards need more visual weight
3. All pages — touch targets too small on mobile (min 44px required)
4. All pages — text too small in some places (min 12px body text)
5. Loading skeleton states missing on most pages
6. Report page — step indicators too small on mobile

## Notes
- Middleware exports as `proxy` (not `middleware`) — do not rename
- Mapbox CSS loaded via link tag in layout.tsx head — do not import via CSS
- `globals.css` — do not modify
- All chat links must point to `/chat` not `/messages`
- `canvas-confetti` should be removed from package.json (no longer used)
