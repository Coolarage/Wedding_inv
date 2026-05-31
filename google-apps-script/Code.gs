/**
 * Mohab & Hams — RSVP → Google Sheet
 *
 * SETUP:
 * 1. Create a Google Sheet with headers in row 1:
 *    Timestamp | Name | Email | Attending | Guests | Message | Page
 * 2. Extensions → Apps Script → paste this file → Save
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web app URL into config.js → rsvp.scriptUrl
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var p = e.parameter;

    sheet.appendRow([
      new Date(),
      p.name || "",
      p.email || "",
      p.attending || "",
      p.guests || "1",
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
