# Mohab & Hams — Wedding Invitation

Two separate invitation pages (plus an optional picker at the site root).

## Guest links

| Language | File | Example URL (after deploy) |
|----------|------|----------------------------|
| **Arabic** | `ar.html` | `https://yoursite.com/ar.html` |
| **English** | `en.html` | `https://yoursite.com/en.html` |
| Picker (optional) | `index.html` | `https://yoursite.com/` |

Share **`ar.html`** with Arabic-speaking guests and **`en.html`** with English-speaking guests — no toggle on either page.

## Names

| Page | Names shown |
|------|-------------|
| Arabic (`ar.html`) | مهاب & همس |
| English (`en.html`) | **Mohab & Hams** (hero + footer) |

## Qur'an verse

Surah Ar-Rum (30:21) is shown **in Arabic on both pages** (text + reference).

## Run locally

```powershell
cd C:\Users\selmi\Projects\mehab-hams-wedding
npx --yes serve .
```

- Arabic: http://localhost:3000/ar.html  
- English: http://localhost:3000/en.html  

## Add photos

1. Put images in `assets/photos/`.
2. List exact filenames in `config.js` → `photos: [...]`.

Both invitation pages show the same **animated photo stack** (auto-flips every few seconds; tap the top photo or a dot to change).

Currently registered: Photo1–Photo7 (including `Photo 3.jpeg`).

## Event details

| | |
|---|---|
| Couple | مهاب (Mohab) & همس (Hams) |
| Date | 30 September 2026 |
| Venue | La Terrace, JW Marriott, Fifth Settlement, Cairo |

Date and venue are always in English on both invitation pages. Countdown runs left → right: Days · Hours · Minutes · Seconds.

## Mobile compatibility

Both `ar.html` and `en.html` are built **mobile-first**:

- Responsive viewport with notch safe areas (`viewport-fit=cover`)
- Fluid name sizing (`clamp`) so titles fit small screens
- Touch-friendly buttons and map link (min 48px tap targets)
- Swipeable meme carousel (`touch-action: pan-x`, scroll snap)
- No horizontal page scroll; images/videos scale to screen width
- Uses `100dvh` / `100svh` for reliable full-height on mobile browsers

Test on your phone: open the local URLs or deployed links in Safari (iOS) and Chrome (Android).
