# SpeechWhiz MVP

SpeechWhiz is a Next.js MVP for speech-language pathologists to turn current-events topics into classroom-ready reading comprehension worksheets.

## What this app does

- Shows "Today’s Stories" from a provider-based ingestion layer.
- Lets the user choose a reading level (`8th Grade` or `High School`).
- Generates an original 5-sentence passage plus:
  - 3 multiple-choice questions (main idea, detail, inferencing)
  - answer key
  - 3-5 vocabulary words with student-friendly definitions
- Supports copy, print, regenerate, and save-to-library flows.
- Includes a manual-entry fallback workflow.
- Includes admin/library behaviors to reopen and delete prior worksheets.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Typed local JSON storage (lightweight MVP database)
- OpenAI API (`chat.completions` with JSON schema output)

## Data model

TypeScript models in `lib/types.ts`:

1. `SourceStory`
- `id`
- `sourceTitle`
- `sourceSummary`
- `sourceUrl`
- `sourcePublishedAt`
- `rawContent` (optional)
- `createdAt`

2. `GeneratedWorksheet`
- `id`
- `sourceStoryId`
- `readingLevel`
- `title`
- `story`
- `questionsJson`
- `answerKeyJson`
- `vocabularyJson`
- `createdAt`

## Provider abstraction

Source ingestion is abstracted behind `SourceProvider`:

- `lib/providers/types.ts`
- `lib/providers/googleNewsProvider.ts`
- `lib/providers/manualProvider.ts`

The app currently ships with:
- Google News provider (`news.google.com` RSS)
- manual-entry fallback

This makes it straightforward to add RSS/news API ingestion later without changing generation/UI logic.

## Setup

1. Install dependencies

```bash
npm install
```

2. Create env file

```bash
cp .env.example .env
```

3. Add your OpenAI key to `.env`

```env
DATABASE_FILE="db.json"
OPENAI_API_KEY="your_openai_api_key"
```

4. Pull latest Google News stories into local storage

```bash
npm run db:setup
```

5. Start dev server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Routes

- `/` Dashboard (today’s stories + generation)
- `/manual-entry` Manual source entry
- `/library` Saved materials
- `/worksheets/[id]` Saved worksheet detail view

## API endpoints

- `GET /api/source-stories`
- `POST /api/source-stories/ingest`
- `POST /api/generate`
- `GET /api/worksheets`
- `POST /api/worksheets`
- `GET /api/worksheets/:id`
- `DELETE /api/worksheets/:id`

## Notes on content safety and copyright intent

Generation prompts explicitly instruct the model to:
- produce original educational material inspired by topic gist
- avoid copying source text
- keep output concise and classroom-safe

## MVP extras included

- Regenerate with simpler vocabulary
- Regenerate with harder inferencing
- Print-friendly layout

## Not yet included (optional next)

- native PDF export
- in-place editable worksheet fields before saving
- automated daily cron ingestion from RSS/news API
