# RSVP → Google Sheet setup

The site sends RSVPs to a **Google Sheet** using a free Google Apps Script web app.

## Step 1 — Create the sheet

1. Go to [Google Sheets](https://sheets.google.com) → **Blank spreadsheet**
2. Name it e.g. `Mohab & Hams RSVP`
3. In **row 1**, add these headers:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Timestamp | Name | Attending | Plus One | Message | Page |

## Step 2 — Add the script

1. **Extensions → Apps Script**
2. Delete any default code
3. Paste the contents of `google-apps-script/Code.gs` from this project
4. **Save** (name the project `Wedding RSVP`)

## Step 3 — Deploy as web app

1. **Deploy → New deployment**
2. Type: **Web app**
3. **Execute as:** Me
4. **Who has access:** Anyone
5. Click **Deploy** → authorize when asked
6. **Copy the Web app URL** (looks like `https://script.google.com/macros/s/...../exec`)

## Step 4 — Connect the website

Open `config.js` and paste your URL:

```javascript
rsvp: {
  scriptUrl: "https://script.google.com/macros/s/YOUR_ID_HERE/exec",
},
```

Commit, push to GitHub, wait for Vercel to redeploy (~1 min).

## Test

1. Open `en.html` on your live site
2. Submit a test RSVP
3. Check the Google Sheet — a new row should appear within a few seconds

## Troubleshooting

- **No rows appearing:** Redeploy the script as **New version**, ensure access is **Anyone**
- **Form says “not connected”:** `scriptUrl` is empty in `config.js` on the deployed site
- **Duplicate submissions:** Normal if guests submit twice; filter by name in the sheet
