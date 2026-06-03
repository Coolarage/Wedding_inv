# RSVP → Google Sheet (Apps Script)

**If Extensions → Apps Script shows “Sorry, the file cannot be opened”**, skip Google entirely and use **[Supabase](../supabase/README.md)** instead — same form on your site, ~5 minutes to set up.

---

## Option A — Supabase (easiest)

See **[supabase/README.md](../supabase/README.md)**. No Google Apps Script required.

---

## Option B — Apps Script without the Extensions menu

The Extensions menu often breaks when you’re signed into **multiple Google accounts**. Use this path instead:

### 1 — Create the sheet

1. Sign in to **one** Google account only (Incognito window helps).
2. [Google Sheets](https://sheets.google.com) → blank spreadsheet → name it `Mohab & Hams RSVP`.
3. Row 1 headers:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Timestamp | Name | Attending | Plus One | Message | Page |

4. Copy the **Sheet ID** from the URL:  
   `https://docs.google.com/spreadsheets/d/THIS_PART/edit`

### 2 — Create the script at script.google.com

1. Open **[script.google.com/home](https://script.google.com/home)** in the **same account** as the sheet.
2. **New project** → delete default code.
3. Paste `Code.gs` from this folder.
4. Replace `PASTE_YOUR_SHEET_ID_HERE` with your Sheet ID.
5. **Save** (name it `Wedding RSVP`).

### 3 — Deploy

1. **Deploy → New deployment → Web app**
2. Execute as: **Me**
3. Who has access: **Anyone**
4. **Deploy** → authorize → copy the URL ending in `/exec`

### 4 — Connect the site

In `config.js`:

```javascript
rsvp: {
  scriptUrl: "https://script.google.com/macros/s/YOUR_ID/exec",
  supabase: { url: "", anonKey: "", table: "rsvps" },
},
```

Push to GitHub so Vercel updates.

### 5 — Test

Open the `/exec` URL in a browser — you should see:

`{"ok":true,"message":"RSVP endpoint is running."}`

Then submit a test RSVP on the live site and check the sheet.

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| “File cannot be opened” from Extensions | Use **script.google.com** directly (step 2 above) or **Supabase** |
| `authuser=3` in the URL | Wrong Google account — use Incognito with one account |
| No rows in sheet | Redeploy as **New version**; access must be **Anyone** |
| Form says “not connected” | Both `scriptUrl` and `supabase` are empty in deployed `config.js` |
| Work/school Google account | Admin may block Apps Script — use **Supabase** or personal Gmail |
