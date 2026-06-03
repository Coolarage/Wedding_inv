# RSVP via Supabase (no Google Apps Script)

Use this if **Extensions → Apps Script** fails in Google Sheets. Your invitation form stays exactly the same; responses go to a free online table you can export to Excel/CSV anytime.

## 1 — Create a project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. **New project** → pick a name and password → wait ~2 minutes.

## 2 — Create the table

1. In your project: **SQL Editor** → **New query**.
2. Paste everything from `setup.sql` in this folder → **Run**.
3. You should see “Success”.

## 3 — Get your keys

1. **Project Settings** (gear icon) → **API**.
2. Copy:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ…`)

## 4 — Connect the website

Open `config.js` and fill in:

```javascript
rsvp: {
  scriptUrl: "",
  supabase: {
    url: "https://YOUR_PROJECT.supabase.co",
    anonKey: "YOUR_ANON_KEY",
    table: "rsvps",
  },
},
```

Save, commit, push to GitHub (or paste the same values if you edit on Vercel).

## 5 — Test

1. Open your live site → Act 2 → submit a test RSVP.
2. In Supabase: **Table Editor** → **rsvps** → the row should appear.

## View & export RSVPs

- **Table Editor** in Supabase — spreadsheet-like view, filter, sort.
- **Export** — select rows → download CSV.

## Security note

The anon key is safe to use on a public website because guests can **only insert** rows, not read or delete others’ RSVPs (see `setup.sql` policies). You view all data logged into Supabase as the project owner.
