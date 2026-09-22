<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/9ec2eb01-a761-4415-9b39-6792fbdec0f2

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Routes
| Path | Page | Purpose |
|---|---|---|
| `/` | `Landing.tsx` | Marketing/pitch page |
| `/onboarding` | `Onboarding.tsx` | Onboarding wizard: language → name → email (optional) → address → face capture → review |
| `/app` | `App.tsx` | The virtual POS: look up by name/phone → face verify → speak a request → confirm → face verify → receipt |
| `/pos` | `Pos.tsx` | Read-only agent view — Paystack payout/storage status, transaction status lookup by ID, no customer data |
| `/history` | `History.tsx` | Transaction history for the demo account |
>>>>>>> 75f2459 (Replace BMONI withdrawals with Paystack transfers)
**Onboarding** (`Onboarding.tsx`): pick a language, the agent types the customer's full name, address, and optional email as they say them, then captures a real face descriptor via the device camera, before `POST /api/accounts/register` + `POST /api/face/register`.

**Session auth** (`App.tsx`, `card`/`faceAuth`/`authFailed` steps): agent enters the customer's name or phone number (no card number needed once onboarded), then a real face check gates entry — client-captured descriptor, `POST /api/face/authorize`. Accounts with no registered face (the two seeded demo accounts) fall back to a disclosed simulated match instead.

**Transaction** (`listen`/`confirm`/`clarify`/`face`/`processing`/`receipt` steps): speak or pick a quick-demo intent; if the recipient isn't recognized, the agent looks them up by bank + account number and the resolved name is read back (with a repeat button) for the customer to confirm; a real face check gates the transaction before the backend executes against the configured payment path and a receipt is shown.

## Honest limitations
- Face verification is real for any account with a registered descriptor; only the two seeded legacy demo accounts fall back to a disclosed simulated match, shown clearly on-screen.
- `voice_auth`-related client code (`authorizeVoice`, `registerVoice`, `challenge.ts`) still exists and works against the backend, but nothing in the active UI calls it — voice authentication is parked for a later phase, not deleted.
- Yorùbá/Hausa/Igbo/Pidgin strings in `phrases.ts` are best-effort translations, not reviewed by native speakers.
