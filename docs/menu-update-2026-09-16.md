# September 16 menu and typography update

Menu source: 58906129_1.pdf. All 176 priced rows plus the unpriced Red Bull Long entry were transcribed into 177 entries across 26 categories. Source rows are retained in data/menu.json. The importer handles split LEI prices and conditional salmon/mashed-potato allergens. The PDF was rendered and visually reviewed in full.

Mains replace Loaded fresh fries. Toast/egg cutoff hours are absent from the new PDF and were removed; mains and sides start at 14:00. The user-confirmed kitchen closing time remains 21:00. Becks bottle volume is printed as 3300 ml, so it is flagged for staff confirmation rather than silently corrected.

Brandon Grotesque: licensed Medium (500) and Bold (700) OTF files supplied by the user are bundled in app/fonts and loaded with next/font/local. Urbanist has been removed from the font stack. Titles and uppercase labels use Bold; body text uses Medium.

