# AssistantAI

AI-powered email assistant that classifies incoming emails from Gmail and Outlook, surfaces important messages as "Actions," generates draft replies via OpenAI, and lets the user approve/edit/send through a chat-based UI. Supports multiple accounts across both providers.

## Commands

- `npm run dev` — Start Next.js dev server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run Next.js linter
- `npm run typecheck` — TypeScript check (`tsc --noEmit`)

## Architecture

```
app/                        Next.js App Router (pages + API routes)
  api/actions/              Action CRUD, chat refinement, send reply
  api/gmail/                Gmail API routes (inbox poll, messages)
  api/outlook/              Outlook API routes (inbox poll, messages)
  api/auth/
    google/                 Google OAuth start + callback
    microsoft/              Microsoft OAuth start + callback
    status/                 Returns connected accounts list
  page.tsx                  Single-page chat UI (client component)

src/lib/
  ai/                       OpenAI integration (classify, generateReply, client singleton)
  auth/                     Multi-account token store (tokenStore.ts)
  google/                   Gmail API client + OAuth helpers
  microsoft/                Outlook API client + OAuth helpers
  email/                    MIME normalization (base64url decoding, header parsing)
  store/                    In-memory actions store (globalThis for dev HMR survival)

src/components/
  inbox/
    AccountSelector.tsx     Dropdown to filter by account
    EmailListView.tsx       Email list with account filtering
    SourceBadge.tsx         Gmail/Outlook provider badge
  layout/
    AccountManager.tsx      Modal for connecting/disconnecting accounts
    Header.tsx              Top bar with search and compose
```

### Data Flow

```
Poll Gmail/Outlook (unread) → skip junk folders → classify with OpenAI (gpt-4o-mini)
  → if important: generate reply (gpt-4o) → create Action → show in UI
  → if not important: mark as dismissed + read
```

### Multi-Account Architecture

- **Token Store**: `src/lib/auth/tokenStore.ts` manages tokens for multiple accounts
  - File-based `.tokens.json` with structure: `{ accounts: AccountTokens[] }`
  - Each account: `{ provider, email, access_token, refresh_token, ... }`
  - Auto-migrates legacy single-account format
- **Provider-Agnostic**: All emails normalized to `NormalizedEmail` interface
- **Account Discovery**: `GET /api/auth/status` returns `{ authenticated, accounts: [{ provider, email }] }`
- **Parallel Polling**: Inbox endpoints iterate through all connected accounts per provider
- **Different Pagination**: Gmail uses `pageToken`, Outlook uses `skip` offset

### Key Patterns

- **In-memory store**: `src/lib/store/actions.ts` uses `globalThis` to survive Next.js dev HMR. Lost on full server restart — processed emails are marked read in providers to prevent re-classification.
- **OAuth tokens**: File-based `.tokens.json` (dev only). User must re-authenticate after scope changes.
- **AI structured output**: Classification uses `response_format: { type: "json_object" }` + Zod validation.
- **Chat refinement**: AI responses containing `UPDATED_REPLY:` marker trigger suggested reply updates.
- **Next.js 15 dynamic routes**: `params` is a `Promise` — must `await params`.
- **Graceful degradation**: Account failures during polling don't crash entire operation—errors collected and returned.

## Path Aliases

- `@/*` → `./src/*`
- `@/app/*` → `./app/*`

## Environment Variables

Required in `.env.local`:

```
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Microsoft OAuth
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/auth/microsoft/callback

# OpenAI
AI_API_KEY=           # OpenAI API key
AI_MODEL=gpt-4o       # used for reply generation + chat; classification hardcoded to gpt-4o-mini
```

## OAuth Scopes

**Google (Gmail)**:
- `gmail.modify` — Read/modify emails
- `gmail.send` — Send emails
- `calendar.events` — Calendar access
- `userinfo.email` — Get user email

**Microsoft (Outlook)**:
- `offline_access` — Enables refresh token
- `User.Read` — Get user profile/email
- `Mail.Read` — Read emails
- `Mail.ReadWrite` — Mark emails as read
- `Mail.Send` — Send emails

Microsoft uses multi-tenant "common" endpoint for personal + work accounts.

## Skipped Folders

**Gmail**: Promotions, Social, Updates, Forums, Spam, Trash

**Outlook**: Junk Email, Deleted Items, Outbox, Sent Items, Drafts

## Gotchas

- Gmail `format=full` responses can be large — body is truncated before sending to OpenAI (500 chars for classify, 3000 for reply)
- `Buffer.from(data, "base64url")` requires Node 15.7+ (fine with Next.js 15)
- Adding OAuth scopes requires user re-auth
- Classification limited to 5 emails per poll cycle to control API costs
- Microsoft may or may not return a new refresh_token on refresh (code falls back to existing)
- Token expiration check includes 60s buffer for safety
