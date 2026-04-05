# PlaceMe

PlaceMe is a private AI-powered virtual travel photo studio MVP for personal testing with close friends and family.

The current build focuses on the core validation loop:

- clean onboarding
- Google sign-in with Firebase Auth
- profile library management
- reference photo uploads to Firebase Storage
- readiness tracking for profiles
- generation job creation
- jobs history and detail views
- unified gallery/history
- a mock generation pipeline that is ready to be replaced by a Gemini backend

## Stack

- Next.js 16.2.2 with App Router
- React 19 + TypeScript
- Tailwind CSS v4
- Firebase Auth
- Firestore
- Firebase Storage
- installable PWA with manifest, icon assets, and service worker registration

## Project structure

```text
app/
  layout.tsx
  manifest.ts
  login/page.tsx
  app/
    layout.tsx
    page.tsx
    profiles/
    generate/
    jobs/
    gallery/
components/
  app-shell.tsx
  protected-route.tsx
  profile-card.tsx
  photo-uploader.tsx
  readiness-checklist.tsx
  job-card.tsx
  scene-pack-preview.tsx
  empty-state.tsx
  loading-state.tsx
firebase/
  config.ts
  auth.ts
  firestore.ts
  storage.ts
hooks/
  use-auth.tsx
  use-profiles.ts
  use-jobs.ts
lib/
  constants.ts
  readiness.ts
  mock-images.ts
  format.ts
services/
  profile-service.ts
  job-service.ts
  user-service.ts
  generation/
    provider.ts
    prompt-builder.ts
    mock-provider.ts
    job-orchestrator.ts
types/
  domain.ts
```

## Routes

- `/login`: landing and Google sign-in
- `/app`: dashboard
- `/app/profiles`: all saved profiles
- `/app/profiles/new`: create profile flow
- `/app/profiles/[id]`: profile detail, uploads, readiness, manual tag coverage
- `/app/generate`: generation job creation
- `/app/jobs`: job list with status filtering
- `/app/jobs/[id]`: job detail and generated outputs
- `/app/gallery`: unified completed outputs gallery

## Firestore data model

Implemented client-facing TypeScript models live in `types/domain.ts`.

Collections:

- `users`
- `profiles`
- `profilePhotos`
- `generationJobs`
- `generatedImages`

`scenePacks` are static in code for the MVP and live in `lib/constants.ts`.

## Setup

1. Install dependencies.

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in your Firebase web app config.

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Required variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

3. Create a Firebase project.

4. In Firebase Authentication:
   Enable `Google` under `Authentication > Sign-in method`.

5. In Firestore:
   Create a Firestore database in production or test mode.
   Deploy `firestore.rules`.
   Create the composite indexes from `firestore.indexes.json`.

6. In Storage:
   Create a default storage bucket.
   Deploy `storage.rules`.

7. Start the app.

```bash
npm run dev
```

8. Production validation:

```bash
npm run lint
npm run typecheck
npm run build
```

## Firebase notes

### Google Auth

- Only Google sign-in is implemented.
- The app uses the Firebase client SDK directly from the browser.
- Protected app routes are enforced in the UI and all reads and writes are scoped by `userId`.

### Firestore indexes

The included `firestore.indexes.json` covers the current query patterns:

- profiles by `userId + updatedAt`
- profile photos by `userId + profileId + uploadedAt`
- jobs by `userId + createdAt`
- job images by `userId + jobId + createdAt`
- gallery images by `userId + createdAt`

### Storage layout

Reference photos use this pattern:

- `users/{uid}/profiles/{profileId}/...`

Mock generated outputs currently store a reserved storage-style path in Firestore:

- `mock/users/{uid}/generated/{jobId}/{sceneKey}.svg`

That keeps the schema ready for future real generated assets without requiring a data model rewrite.

## MVP behavior

### Real integrations

- Firebase Google sign-in
- user document sync to Firestore
- profile CRUD in Firestore
- photo uploads to Firebase Storage
- profile photo metadata in Firestore
- readiness recalculation based on uploaded photos and manual checklist tag coverage
- generation jobs persisted in Firestore
- generated image documents persisted in Firestore

### Mocked behavior

- image generation itself
- image analysis and automatic tagging
- quality validation of uploaded photos
- real generated output uploads to Firebase Storage
- background worker or Cloud Function orchestration

The current mock generator is intentionally deterministic and lives in:

- `services/generation/provider.ts`
- `services/generation/mock-provider.ts`
- `services/generation/prompt-builder.ts`
- `services/generation/job-orchestrator.ts`

## PWA notes

This MVP includes:

- `app/manifest.ts`
- generated app icons
- service worker registration via `components/pwa-registration.tsx`
- a basic cache-first service worker in `public/sw.js`

Offline behavior is intentionally minimal. The goal is installability, not a full offline-first experience.

## Readiness logic

Current readiness is simple by design:

- minimum 8 uploaded photos changes a profile to `ready`
- checklist coverage is tracked manually through photo tags
- the readiness UI shows which angle/expression/lighting categories are covered

The readiness logic lives in:

- `lib/readiness.ts`

## Recommended next steps for Gemini backend integration

1. Move generation orchestration from the client into a trusted backend worker.
2. Replace `MockGenerationProvider` with a `GeminiGenerationProvider` that implements the same `GenerationProvider` interface.
3. Store generated image binaries in Firebase Storage and persist public or signed URLs in `generatedImages`.
4. Add background processing with Cloud Functions, Cloud Run, or another worker queue so jobs keep running after the user leaves the page.
5. Persist prompt snapshots and provider metadata on each job for reproducibility.
6. Add automated input validation for uploaded profile photos and write checklist tags automatically.
7. Add job retry support and structured provider error logging.

## Current validation status

- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm run build`: pass
