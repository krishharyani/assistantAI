# AssistantAI

AI-powered email assistant that classifies incoming Gmail, surfaces important messages as "Actions," generates draft replies via OpenAI, and lets the user approve/edit/send through a chat-based UI.

## Commands

- `npm run dev` — Start Next.js dev server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run Next.js linter
- `npm run typecheck` — TypeScript check (`tsc --noEmit`)

## Architecture

```
app/                    Next.js App Router (pages + API routes)
  api/actions/          Action CRUD, chat refinement, send reply
  api/gmail/inbox/      Poll unread emails → classify → create actions
  api/auth/google/      OAuth start + callback
  page.tsx              Single-page chat UI (client component)

src/lib/
  ai/                   OpenAI integration (classify, generateReply, client singleton)
  google/               Gmail API client (list, get, getFullMessage, modify, send)
  email/                MIME normalization (base64url decoding, header parsing)
  store/                In-memory actions store (globalThis for dev HMR survival)
```

### Data Flow

```
Poll Gmail (is:unread) → skip junk labels → classify with OpenAI (gpt-4o-mini)
  → if important: generate reply (gpt-4o) → create Action → show in UI
  → if not important: mark as dismissed + read
```

### Key Patterns

- **In-memory store**: `src/lib/store/actions.ts` uses `globalThis` to survive Next.js dev HMR. Lost on full server restart — processed emails are marked read in Gmail to prevent re-classification.
- **OAuth tokens**: File-based `.tokens.json` (dev only). User must re-authenticate after scope changes.
- **AI structured output**: Classification uses `response_format: { type: "json_object" }` + Zod validation.
- **Chat refinement**: AI responses containing `UPDATED_REPLY:` marker trigger suggested reply updates.
- **Next.js 15 dynamic routes**: `params` is a `Promise` — must `await params`.

## Path Aliases

- `@/*` → `./src/*`
- `@/app/*` → `./app/*`

## Environment Variables

Required in `.env.local`:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
AI_API_KEY=           # OpenAI API key
AI_MODEL=gpt-4o       # used for reply generation + chat; classification hardcoded to gpt-4o-mini
```

## Gotchas

- Gmail `format=full` responses can be large — body is truncated before sending to OpenAI (500 chars for classify, 3000 for reply)
- `Buffer.from(data, "base64url")` requires Node 15.7+ (fine with Next.js 15)
- OAuth scopes: `gmail.modify`, `gmail.send`, `calendar.events`, `userinfo.email` — adding scopes requires user re-auth
- Emails in Promotions/Social/Updates/Forums/Spam/Trash are skipped without calling OpenAI
- Classification limited to 5 emails per poll cycle to control API costs
