/** Wedding data & invitation copy. Edit when you add photos or GIFs. */
window.WEDDING_CONFIG = {
  groom: "مهاب",
  bride: "همs",
  groomEn: "Mohab",
  brideEn: "Hams",
  date: "2026-09-30T18:00:00+03:00",
  venue: {
    nameEn: "La Terrace, JW Marriott",
    areaEn: "Fifth Settlement, Cairo",
    mapsUrl:
      "https://www.google.com/maps/place/Club+House/@30.07078,31.4359958,18z/data=!4m6!3m5!1s0x145817197b9f1de9:0x1bf309708d796b1f!8m2!3d30.0699596!4d31.4344754!16s%2Fg%2F11vdbcj_fv?entry=ttu&g_ep=EgoyMDI2MDUyNi4wIKXMDSoASAFQAw%3D%3D",
  },
  eventEn: {
    dateLine: "Wednesday · 30 September 2026",
    dateDetail: "30 / 9 / 2026",
  },
  eventAr: {
    dateLine: "الأربعاء · ٣٠ سبتمبر ٢٠٢٦",
    dateDetail: "٣٠ / ٩ / ٢٠٢٦",
  },
  /** Always shown in Arabic on both invitation pages. */
  quranVerse: {
    text: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    ref: "الروم · ٣٠:٢١",
  },
  photos: [
    "Photo1.jpeg",
    "Photo2.jpeg",
    "Photo 3.jpeg",
    "Photo4.jpeg",
    "Photo5.jpeg",
    "Photo6.jpeg",
    "Photo7.jpeg",
  ],
  /**
   * RSVP backend — use **one** of these:
   *
   * A) Supabase (recommended if Apps Script fails) — see supabase/README.md
   * B) Google Sheet via Apps Script — see google-apps-script/README.md
   */
  rsvp: {
    scriptUrl:
      "https://script.google.com/macros/s/AKfycbykrlIW-JyHpB4J98qnr8oClQYGx1y8X6v1lotYiBohTUrB2DiQDnWg7jxvM42qy73D/exec",
    supabase: {
      url: "",
      anonKey: "",
      table: "rsvps",
    },
  },
};
