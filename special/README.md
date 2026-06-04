# Special invite pages

Private invitations for VIP guests — **not linked** from the public site. Security is the **secret URL** only you share.

## Create a new special invite

1. Duplicate `TEMPLATE.html` → rename to something unguessable, e.g. `khaled-x8f2.html`
2. Edit the `<html>` tag attributes (see below)
3. Push to GitHub (Vercel redeploys automatically)
4. Share: `https://project-2zfzh.vercel.app/special/khaled-x8f2.html`

## Per-guest fields (on `<html>`)

| Attribute | Where it shows | Example |
|-----------|----------------|---------|
| `data-guest-name` | Act 1 eyebrow | `"Khaled"` → *💌 Khaled, you're invited…* |
| `data-guest-message` | Act 1 eyebrow (overrides name) | `"💌 Khaled — you mean the world to us"` |
| `data-our-story-title` | Act 2 card title | `"Our Story"` (default) |
| `data-our-story` | Act 2 card body | See below |

### Our Story message (Act 2)

**Option A — attribute (good for scripts / “backend” generation)**

Set `data-our-story` on `<html>`. Use a blank line between paragraphs:

```html
data-our-story="We met in 2019 and you were there from the start.

Thank you for being part of our journey — we cannot wait to celebrate with you."
```

**Option B — edit HTML in the duplicated file**

Leave `data-our-story=""` and edit the content inside `#our-story-body`:

```html
<div class="our-story-body" id="our-story-body">
  <p>Your first paragraph…</p>
  <p>Your second paragraph…</p>
</div>
```

If both are set, `data-our-story` **replaces** the HTML inside `#our-story-body`.

## What’s different from public invites

- **English layout** (like `en.html`)
- **Both songs side by side** (Arabic + English lyrics)
- **Our Story card** instead of RSVP (template only)
- **`noindex`** so search engines don’t list the page

## Example with RSVP

`vip-x7k9m2.html` still includes the RSVP form. New invites from `TEMPLATE.html` use Our Story instead.

## Tips

- Use random filenames — not guest names alone
- Keep a private list: guest → URL
- Public `en.html` / `ar.html` still use RSVP → Supabase / Google Sheet
