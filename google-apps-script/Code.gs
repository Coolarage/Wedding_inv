/**
 * Mohab & Hams — RSVP → Google Sheet
 *
 * If Extensions → Apps Script fails, use Supabase instead (see supabase/README.md)
 * or deploy via clasp CLI (see README.md in this folder).
 *
 * SETUP (standalone script — no Extensions menu needed):
 * 1. Create a Google Sheet with row 1 headers:
 *    Timestamp | Name | Attending | Plus One | Message | Page
 * 2. Copy the Sheet ID from the URL (long string between /d/ and /edit)
 * 3. Paste it in SHEET_ID below
 * 4. Go to https://script.google.com/home → New project → paste this file → Save
 * 5. Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone
 * 6. Copy the Web app URL into config.js → rsvp.scriptUrl
 */

var SHEET_ID = "PASTE_YOUR_SHEET_ID_HERE";

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    var p = e.parameter;

    sheet.appendRow([
      new Date(),
      p.name || "",
      p.attending || "",
      p.plusOne || "",
      p.message || "",
      p.page || "",
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonResponse({ ok: true, message: "RSVP endpoint is running." });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
