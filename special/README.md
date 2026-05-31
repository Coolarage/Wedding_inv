# Special invite pages

Private invitations for VIP guests — **not linked** from the public site. Security is the **secret URL** only you share.

## Create a new special invite

1. Duplicate `TEMPLATE.html` → rename to something unguessable, e.g. `khaled-x8f2.html`
2. Edit the `<html>` tag attributes:
   - `data-guest-name="Khaled"` — shown in the eyebrow
   - `data-guest-message=""` — optional full custom eyebrow (overrides guest name)
3. Push to GitHub (Vercel redeploys automatically)
4. Share: `https://project-2zfzh.vercel.app/special/khaled-x8f2.html`

## What’s different from public invites

- **English layout** (like `en.html`)
- **Both songs side by side** (Arabic + English lyrics)
- **RSVP form** included
- **`noindex`** so search engines don’t list the page

## Example

See `vip-x7k9m2.html` for a working sample (change or delete before sharing widely).

## Tips

- Use random filenames — not guest names alone
- Keep a private list: guest → URL
- RSVPs include the `Page` column so you know which link they used
