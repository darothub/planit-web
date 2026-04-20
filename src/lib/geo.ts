/**
 * Geo helpers — proximity search for "Find events near you".
 *
 * Used by:
 * - Showcase: assigns synthetic coords to demo listings + computes distances
 * - Production: city-name → coords lookup for the manual location picker
 *
 * Real API listings already carry `latitude` / `longitude`; the backend does the
 * radius filter via `EventListingSpecification.withinRadius`. This file is purely
 * for client-side fallbacks and the location picker.
 */

/** Lat/Lng tuple. Coords are WGS-84 decimal degrees. */
export type Coords = { lat: number; lng: number }

// ─── Country city tables ──────────────────────────────────────────────────
//
// 20 representative cities per country, used to populate the manual city
// picker. ISO-3166-1 alpha-2 country codes (matches `x-vercel-ip-country`).
// Coords are city-centre (city-hall) WGS-84 — accuracy good enough for
// proximity badges. Add countries as the planner footprint grows.

export const COUNTRY_CITIES: Record<string, Record<string, Coords>> = {
  // ── United Kingdom ────────────────────────────────────────────────────
  GB: {
    London:      { lat: 51.5074, lng: -0.1278 },
    Manchester:  { lat: 53.4808, lng: -2.2426 },
    Birmingham:  { lat: 52.4862, lng: -1.8904 },
    Liverpool:   { lat: 53.4084, lng: -2.9916 },
    Leeds:       { lat: 53.8008, lng: -1.5491 },
    Sheffield:   { lat: 53.3811, lng: -1.4701 },
    Bristol:     { lat: 51.4545, lng: -2.5879 },
    Newcastle:   { lat: 54.9783, lng: -1.6178 },
    Nottingham:  { lat: 52.9548, lng: -1.1581 },
    Cardiff:     { lat: 51.4816, lng: -3.1791 },
    Edinburgh:   { lat: 55.9533, lng: -3.1883 },
    Glasgow:     { lat: 55.8642, lng: -4.2518 },
    Brighton:    { lat: 50.8225, lng: -0.1372 },
    Cambridge:   { lat: 52.2053, lng:  0.1218 },
    Oxford:      { lat: 51.7520, lng: -1.2577 },
    Bath:        { lat: 51.3811, lng: -2.3590 },
    Belfast:     { lat: 54.5973, lng: -5.9301 },
    Southampton: { lat: 50.9097, lng: -1.4044 },
    York:        { lat: 53.9591, lng: -1.0815 },
    Aberdeen:    { lat: 57.1497, lng: -2.0943 },
  },
  // ── Nigeria ────────────────────────────────────────────────────────────
  NG: {
    Lagos:         { lat:  6.5244, lng:  3.3792 },
    Abuja:         { lat:  9.0765, lng:  7.3986 },
    Kano:          { lat: 12.0022, lng:  8.5920 },
    Ibadan:        { lat:  7.3775, lng:  3.9470 },
    'Port Harcourt': { lat: 4.8156, lng:  7.0498 },
    'Benin City':  { lat:  6.3350, lng:  5.6037 },
    Kaduna:        { lat: 10.5105, lng:  7.4165 },
    Onitsha:       { lat:  6.1659, lng:  6.7860 },
    Warri:         { lat:  5.5170, lng:  5.7500 },
    Calabar:       { lat:  4.9588, lng:  8.3220 },
    Enugu:         { lat:  6.5244, lng:  7.5102 },
    Aba:           { lat:  5.1066, lng:  7.3667 },
    Jos:           { lat:  9.8965, lng:  8.8583 },
    Ilorin:        { lat:  8.5373, lng:  4.5443 },
    Abeokuta:      { lat:  7.1475, lng:  3.3619 },
    Owerri:        { lat:  5.4836, lng:  7.0335 },
    Uyo:           { lat:  5.0420, lng:  7.9157 },
    Maiduguri:     { lat: 11.8333, lng: 13.1500 },
    Sokoto:        { lat: 13.0059, lng:  5.2476 },
    Akure:         { lat:  7.2500, lng:  5.1950 },
  },
  // ── United States ─────────────────────────────────────────────────────
  US: {
    'New York':      { lat: 40.7128, lng:  -74.0060 },
    'Los Angeles':   { lat: 34.0522, lng: -118.2437 },
    Chicago:         { lat: 41.8781, lng:  -87.6298 },
    Houston:         { lat: 29.7604, lng:  -95.3698 },
    Phoenix:         { lat: 33.4484, lng: -112.0740 },
    Philadelphia:    { lat: 39.9526, lng:  -75.1652 },
    'San Antonio':   { lat: 29.4241, lng:  -98.4936 },
    'San Diego':     { lat: 32.7157, lng: -117.1611 },
    Dallas:          { lat: 32.7767, lng:  -96.7970 },
    Austin:          { lat: 30.2672, lng:  -97.7431 },
    Jacksonville:    { lat: 30.3322, lng:  -81.6557 },
    'San Francisco': { lat: 37.7749, lng: -122.4194 },
    Charlotte:       { lat: 35.2271, lng:  -80.8431 },
    Indianapolis:    { lat: 39.7684, lng:  -86.1581 },
    Seattle:         { lat: 47.6062, lng: -122.3321 },
    Denver:          { lat: 39.7392, lng: -104.9903 },
    Boston:          { lat: 42.3601, lng:  -71.0589 },
    Washington:      { lat: 38.9072, lng:  -77.0369 },
    Atlanta:         { lat: 33.7490, lng:  -84.3880 },
    Miami:           { lat: 25.7617, lng:  -80.1918 },
  },
  // ── Canada ────────────────────────────────────────────────────────────
  CA: {
    Toronto:        { lat: 43.6532, lng: -79.3832 },
    Montreal:       { lat: 45.5017, lng: -73.5673 },
    Vancouver:      { lat: 49.2827, lng: -123.1207 },
    Calgary:        { lat: 51.0447, lng: -114.0719 },
    Edmonton:       { lat: 53.5461, lng: -113.4938 },
    Ottawa:         { lat: 45.4215, lng: -75.6972 },
    Winnipeg:       { lat: 49.8951, lng: -97.1384 },
    'Quebec City':  { lat: 46.8139, lng: -71.2080 },
    Hamilton:       { lat: 43.2557, lng: -79.8711 },
    Kitchener:      { lat: 43.4516, lng: -80.4925 },
    Victoria:       { lat: 48.4284, lng: -123.3656 },
    Halifax:        { lat: 44.6488, lng: -63.5752 },
    Oshawa:         { lat: 43.8971, lng: -78.8658 },
    Windsor:        { lat: 42.3149, lng: -83.0364 },
    Saskatoon:      { lat: 52.1332, lng: -106.6700 },
    Regina:         { lat: 50.4452, lng: -104.6189 },
    "St. John's":   { lat: 47.5615, lng: -52.7126 },
    Sherbrooke:     { lat: 45.4040, lng: -71.8929 },
    Barrie:         { lat: 44.3894, lng: -79.6903 },
    Burnaby:        { lat: 49.2488, lng: -122.9805 },
  },
  // ── Ireland ───────────────────────────────────────────────────────────
  IE: {
    Dublin:      { lat: 53.3498, lng: -6.2603 },
    Cork:        { lat: 51.8985, lng: -8.4756 },
    Limerick:    { lat: 52.6638, lng: -8.6267 },
    Galway:      { lat: 53.2707, lng: -9.0568 },
    Waterford:   { lat: 52.2593, lng: -7.1101 },
    Drogheda:    { lat: 53.7185, lng: -6.3478 },
    Swords:      { lat: 53.4597, lng: -6.2178 },
    Dundalk:     { lat: 54.0014, lng: -6.4058 },
    Bray:        { lat: 53.2026, lng: -6.0985 },
    Navan:       { lat: 53.6539, lng: -6.6810 },
    Ennis:       { lat: 52.8436, lng: -8.9864 },
    Kilkenny:    { lat: 52.6541, lng: -7.2448 },
    Tralee:      { lat: 52.2713, lng: -9.7016 },
    Carlow:      { lat: 52.8408, lng: -6.9261 },
    Newbridge:   { lat: 53.1810, lng: -6.7986 },
    Naas:        { lat: 53.2167, lng: -6.6667 },
    Athlone:     { lat: 53.4239, lng: -7.9407 },
    Letterkenny: { lat: 54.9558, lng: -7.7344 },
    Mullingar:   { lat: 53.5258, lng: -7.3403 },
    Wexford:     { lat: 52.3369, lng: -6.4633 },
  },
  // ── France ────────────────────────────────────────────────────────────
  FR: {
    Paris:           { lat: 48.8566, lng:  2.3522 },
    Marseille:       { lat: 43.2965, lng:  5.3698 },
    Lyon:            { lat: 45.7640, lng:  4.8357 },
    Toulouse:        { lat: 43.6047, lng:  1.4442 },
    Nice:            { lat: 43.7102, lng:  7.2620 },
    Nantes:          { lat: 47.2184, lng: -1.5536 },
    Montpellier:     { lat: 43.6108, lng:  3.8767 },
    Strasbourg:      { lat: 48.5734, lng:  7.7521 },
    Bordeaux:        { lat: 44.8378, lng: -0.5792 },
    Lille:           { lat: 50.6292, lng:  3.0573 },
    Rennes:          { lat: 48.1173, lng: -1.6778 },
    Reims:           { lat: 49.2583, lng:  4.0317 },
    'Saint-Étienne': { lat: 45.4397, lng:  4.3872 },
    Toulon:          { lat: 43.1242, lng:  5.9280 },
    'Le Havre':      { lat: 49.4944, lng:  0.1079 },
    Grenoble:        { lat: 45.1885, lng:  5.7245 },
    Dijon:           { lat: 47.3220, lng:  5.0415 },
    Angers:          { lat: 47.4784, lng: -0.5632 },
    Nîmes:           { lat: 43.8367, lng:  4.3601 },
    Aix:             { lat: 43.5297, lng:  5.4474 },
  },
  // ── Germany ───────────────────────────────────────────────────────────
  DE: {
    Berlin:    { lat: 52.5200, lng: 13.4050 },
    Hamburg:   { lat: 53.5511, lng:  9.9937 },
    Munich:    { lat: 48.1351, lng: 11.5820 },
    Cologne:   { lat: 50.9375, lng:  6.9603 },
    Frankfurt: { lat: 50.1109, lng:  8.6821 },
    Stuttgart: { lat: 48.7758, lng:  9.1829 },
    Düsseldorf:{ lat: 51.2277, lng:  6.7735 },
    Leipzig:   { lat: 51.3397, lng: 12.3731 },
    Dortmund:  { lat: 51.5136, lng:  7.4653 },
    Essen:     { lat: 51.4556, lng:  7.0116 },
    Bremen:    { lat: 53.0793, lng:  8.8017 },
    Dresden:   { lat: 51.0504, lng: 13.7373 },
    Hanover:   { lat: 52.3759, lng:  9.7320 },
    Nuremberg: { lat: 49.4521, lng: 11.0767 },
    Duisburg:  { lat: 51.4344, lng:  6.7623 },
    Bochum:    { lat: 51.4818, lng:  7.2162 },
    Wuppertal: { lat: 51.2562, lng:  7.1508 },
    Bielefeld: { lat: 52.0302, lng:  8.5325 },
    Bonn:      { lat: 50.7374, lng:  7.0982 },
    Münster:   { lat: 51.9607, lng:  7.6261 },
  },
  // ── Spain ─────────────────────────────────────────────────────────────
  ES: {
    Madrid:           { lat: 40.4168, lng: -3.7038 },
    Barcelona:        { lat: 41.3851, lng:  2.1734 },
    Valencia:         { lat: 39.4699, lng: -0.3763 },
    Seville:          { lat: 37.3891, lng: -5.9845 },
    Zaragoza:         { lat: 41.6488, lng: -0.8891 },
    Málaga:           { lat: 36.7213, lng: -4.4214 },
    Murcia:           { lat: 37.9922, lng: -1.1307 },
    Palma:            { lat: 39.5696, lng:  2.6502 },
    'Las Palmas':     { lat: 28.1235, lng: -15.4366 },
    Bilbao:           { lat: 43.2630, lng: -2.9350 },
    Alicante:         { lat: 38.3452, lng: -0.4810 },
    Córdoba:          { lat: 37.8882, lng: -4.7794 },
    Valladolid:       { lat: 41.6523, lng: -4.7245 },
    Vigo:             { lat: 42.2406, lng: -8.7207 },
    Gijón:            { lat: 43.5453, lng: -5.6619 },
    Granada:          { lat: 37.1773, lng: -3.5986 },
    'A Coruña':       { lat: 43.3623, lng: -8.4115 },
    'Vitoria-Gasteiz':{ lat: 42.8467, lng: -2.6716 },
    Elche:            { lat: 38.2664, lng: -0.6987 },
    Oviedo:           { lat: 43.3614, lng: -5.8493 },
  },
  // ── Italy ─────────────────────────────────────────────────────────────
  IT: {
    Rome:     { lat: 41.9028, lng: 12.4964 },
    Milan:    { lat: 45.4642, lng:  9.1900 },
    Naples:   { lat: 40.8518, lng: 14.2681 },
    Turin:    { lat: 45.0703, lng:  7.6869 },
    Palermo:  { lat: 38.1157, lng: 13.3615 },
    Genoa:    { lat: 44.4056, lng:  8.9463 },
    Bologna:  { lat: 44.4949, lng: 11.3426 },
    Florence: { lat: 43.7696, lng: 11.2558 },
    Bari:     { lat: 41.1171, lng: 16.8719 },
    Catania:  { lat: 37.5079, lng: 15.0830 },
    Venice:   { lat: 45.4408, lng: 12.3155 },
    Verona:   { lat: 45.4384, lng: 10.9916 },
    Messina:  { lat: 38.1938, lng: 15.5540 },
    Padua:    { lat: 45.4064, lng: 11.8768 },
    Trieste:  { lat: 45.6495, lng: 13.7768 },
    Brescia:  { lat: 45.5416, lng: 10.2118 },
    Taranto:  { lat: 40.4644, lng: 17.2470 },
    Prato:    { lat: 43.8777, lng: 11.1023 },
    Parma:    { lat: 44.8015, lng: 10.3279 },
    Modena:   { lat: 44.6471, lng: 10.9252 },
  },
  // ── Australia ─────────────────────────────────────────────────────────
  AU: {
    Sydney:      { lat: -33.8688, lng: 151.2093 },
    Melbourne:   { lat: -37.8136, lng: 144.9631 },
    Brisbane:    { lat: -27.4698, lng: 153.0251 },
    Perth:       { lat: -31.9505, lng: 115.8605 },
    Adelaide:    { lat: -34.9285, lng: 138.6007 },
    'Gold Coast':{ lat: -28.0167, lng: 153.4000 },
    Newcastle:   { lat: -32.9283, lng: 151.7817 },
    Canberra:    { lat: -35.2809, lng: 149.1300 },
    Wollongong:  { lat: -34.4278, lng: 150.8931 },
    Geelong:     { lat: -38.1499, lng: 144.3617 },
    Hobart:      { lat: -42.8821, lng: 147.3272 },
    Townsville:  { lat: -19.2589, lng: 146.8169 },
    Cairns:      { lat: -16.9203, lng: 145.7710 },
    Darwin:      { lat: -12.4634, lng: 130.8456 },
    Toowoomba:   { lat: -27.5598, lng: 151.9507 },
    Ballarat:    { lat: -37.5622, lng: 143.8503 },
    Bendigo:     { lat: -36.7570, lng: 144.2794 },
    Albury:      { lat: -36.0737, lng: 146.9135 },
    Launceston:  { lat: -41.4332, lng: 147.1441 },
    Mackay:      { lat: -21.1411, lng: 149.1860 },
  },
  // ── South Africa ──────────────────────────────────────────────────────
  ZA: {
    Johannesburg:    { lat: -26.2041, lng:  28.0473 },
    'Cape Town':     { lat: -33.9249, lng:  18.4241 },
    Durban:          { lat: -29.8587, lng:  31.0218 },
    Pretoria:        { lat: -25.7479, lng:  28.2293 },
    'Port Elizabeth':{ lat: -33.9608, lng:  25.6022 },
    Bloemfontein:    { lat: -29.0852, lng:  26.1596 },
    'East London':   { lat: -33.0153, lng:  27.9116 },
    Pietermaritzburg:{ lat: -29.6094, lng:  30.3781 },
    Polokwane:       { lat: -23.9045, lng:  29.4689 },
    Soweto:          { lat: -26.2678, lng:  27.8585 },
    Tembisa:         { lat: -25.9966, lng:  28.2266 },
    Vereeniging:     { lat: -26.6736, lng:  27.9263 },
    Welkom:          { lat: -27.9770, lng:  26.7350 },
    Nelspruit:       { lat: -25.4753, lng:  30.9694 },
    Kimberley:       { lat: -28.7282, lng:  24.7499 },
    Rustenburg:      { lat: -25.6672, lng:  27.2424 },
    Centurion:       { lat: -25.8602, lng:  28.1885 },
    Roodepoort:      { lat: -26.1625, lng:  27.8725 },
    Krugersdorp:     { lat: -26.0853, lng:  27.7747 },
    Boksburg:        { lat: -26.2125, lng:  28.2625 },
  },
  // ── Ghana ─────────────────────────────────────────────────────────────
  GH: {
    Accra:                { lat:  5.6037, lng: -0.1870 },
    Kumasi:               { lat:  6.6885, lng: -1.6244 },
    Tamale:               { lat:  9.4034, lng: -0.8424 },
    'Sekondi-Takoradi':   { lat:  4.9344, lng: -1.7134 },
    Sunyani:              { lat:  7.3399, lng: -2.3266 },
    'Cape Coast':         { lat:  5.1054, lng: -1.2466 },
    Tema:                 { lat:  5.6698, lng:  0.0166 },
    Koforidua:            { lat:  6.0935, lng: -0.2591 },
    Wa:                   { lat: 10.0606, lng: -2.5057 },
    Ho:                   { lat:  6.6004, lng:  0.4713 },
    Bolgatanga:           { lat: 10.7856, lng: -0.8514 },
    Tarkwa:               { lat:  5.3007, lng: -1.9961 },
    Obuasi:               { lat:  6.2027, lng: -1.6786 },
    Madina:               { lat:  5.6837, lng: -0.1666 },
    Achimota:             { lat:  5.6164, lng: -0.2345 },
    Ashaiman:             { lat:  5.6913, lng: -0.0427 },
    Teshie:               { lat:  5.5891, lng: -0.0987 },
    Nungua:               { lat:  5.6004, lng: -0.0750 },
    Berekum:              { lat:  7.4565, lng: -2.5836 },
    Techiman:             { lat:  7.5815, lng: -1.9395 },
  },
  // ── Kenya ─────────────────────────────────────────────────────────────
  KE: {
    Nairobi:  { lat: -1.2921, lng: 36.8219 },
    Mombasa:  { lat: -4.0435, lng: 39.6682 },
    Kisumu:   { lat: -0.1022, lng: 34.7617 },
    Nakuru:   { lat: -0.3031, lng: 36.0800 },
    Eldoret:  { lat:  0.5143, lng: 35.2698 },
    Thika:    { lat: -1.0333, lng: 37.0833 },
    Malindi:  { lat: -3.2175, lng: 40.1191 },
    Kitale:   { lat:  1.0157, lng: 35.0062 },
    Garissa:  { lat: -0.4569, lng: 39.6583 },
    Kakamega: { lat:  0.2827, lng: 34.7519 },
    Kisii:    { lat: -0.6817, lng: 34.7666 },
    Machakos: { lat: -1.5177, lng: 37.2634 },
    Meru:     { lat:  0.0500, lng: 37.6500 },
    Nyeri:    { lat: -0.4167, lng: 36.9500 },
    Naivasha: { lat: -0.7172, lng: 36.4314 },
    Kericho:  { lat: -0.3692, lng: 35.2837 },
    Ruiru:    { lat: -1.1448, lng: 36.9608 },
    Voi:      { lat: -3.3964, lng: 38.5560 },
    Bungoma:  { lat:  0.5635, lng: 34.5606 },
    Embu:     { lat: -0.5310, lng: 37.4505 },
  },
  // ── India ─────────────────────────────────────────────────────────────
  IN: {
    Mumbai:        { lat: 19.0760, lng: 72.8777 },
    Delhi:         { lat: 28.7041, lng: 77.1025 },
    Bangalore:     { lat: 12.9716, lng: 77.5946 },
    Hyderabad:     { lat: 17.3850, lng: 78.4867 },
    Ahmedabad:     { lat: 23.0225, lng: 72.5714 },
    Chennai:       { lat: 13.0827, lng: 80.2707 },
    Kolkata:       { lat: 22.5726, lng: 88.3639 },
    Pune:          { lat: 18.5204, lng: 73.8567 },
    Jaipur:        { lat: 26.9124, lng: 75.7873 },
    Surat:         { lat: 21.1702, lng: 72.8311 },
    Lucknow:       { lat: 26.8467, lng: 80.9462 },
    Kanpur:        { lat: 26.4499, lng: 80.3319 },
    Nagpur:        { lat: 21.1458, lng: 79.0882 },
    Indore:        { lat: 22.7196, lng: 75.8577 },
    Bhopal:        { lat: 23.2599, lng: 77.4126 },
    Visakhapatnam: { lat: 17.6868, lng: 83.2185 },
    Patna:         { lat: 25.5941, lng: 85.1376 },
    Vadodara:      { lat: 22.3072, lng: 73.1812 },
    Ghaziabad:     { lat: 28.6692, lng: 77.4538 },
    Ludhiana:      { lat: 30.9010, lng: 75.8573 },
  },
  // ── United Arab Emirates ──────────────────────────────────────────────
  AE: {
    Dubai:                { lat: 25.2048, lng: 55.2708 },
    'Abu Dhabi':          { lat: 24.4539, lng: 54.3773 },
    Sharjah:              { lat: 25.3463, lng: 55.4209 },
    'Al Ain':             { lat: 24.2075, lng: 55.7447 },
    Ajman:                { lat: 25.4052, lng: 55.5136 },
    'Ras Al Khaimah':     { lat: 25.7895, lng: 55.9432 },
    Fujairah:             { lat: 25.1288, lng: 56.3265 },
    'Umm Al Quwain':      { lat: 25.5648, lng: 55.5532 },
    'Khor Fakkan':        { lat: 25.3389, lng: 56.3422 },
    'Madinat Zayed':      { lat: 23.6553, lng: 53.7019 },
    Ruwais:               { lat: 24.0894, lng: 52.7308 },
    'Liwa Oasis':         { lat: 23.1333, lng: 53.7833 },
    Hatta:                { lat: 24.8061, lng: 56.1297 },
    Kalba:                { lat: 25.0667, lng: 56.3500 },
    Dhaid:                { lat: 25.2872, lng: 55.8806 },
    'Jebel Ali':          { lat: 25.0089, lng: 55.0639 },
    'Khalifa City':       { lat: 24.4257, lng: 54.5764 },
    'Mohammed Bin Zayed City': { lat: 24.3819, lng: 54.5611 },
    Mussafah:             { lat: 24.3642, lng: 54.5031 },
    'Al Dhafra':          { lat: 24.2620, lng: 54.5470 },
  },
}

/** ISO-3166-1 alpha-2 → human-readable country name (for the picker title). */
export const COUNTRY_NAMES: Record<string, string> = {
  GB: 'United Kingdom',
  NG: 'Nigeria',
  US: 'United States',
  CA: 'Canada',
  IE: 'Ireland',
  FR: 'France',
  DE: 'Germany',
  ES: 'Spain',
  IT: 'Italy',
  AU: 'Australia',
  ZA: 'South Africa',
  GH: 'Ghana',
  KE: 'Kenya',
  IN: 'India',
  AE: 'United Arab Emirates',
}

/** Country used when the caller's country is unknown or unsupported. */
const DEFAULT_COUNTRY = 'GB'

/**
 * Top cities for the given country code. Falls back to the default country
 * (GB) if the code is missing or unsupported.
 */
export function getCitiesForCountry(country: string | null | undefined): Record<string, Coords> {
  if (!country) return COUNTRY_CITIES[DEFAULT_COUNTRY]
  const upper = country.toUpperCase()
  return COUNTRY_CITIES[upper] ?? COUNTRY_CITIES[DEFAULT_COUNTRY]
}

/** Display name for the country code, with the same fallback rules. */
export function getCountryName(country: string | null | undefined): string {
  if (!country) return COUNTRY_NAMES[DEFAULT_COUNTRY]
  const upper = country.toUpperCase()
  return COUNTRY_NAMES[upper] ?? COUNTRY_NAMES[DEFAULT_COUNTRY]
}

/** Whether we have a city table for this country code. */
export function isSupportedCountry(country: string | null | undefined): boolean {
  if (!country) return false
  return COUNTRY_CITIES[country.toUpperCase()] != null
}

/**
 * Look up a city's centre coordinates by name. Searches the user's country
 * first (if provided), then falls back across all supported countries — so
 * a saved location from a previous trip still resolves.
 *
 * Returns `null` if the city is unknown anywhere.
 */
export function cityToCoords(
  city: string | null | undefined,
  country?: string | null,
): Coords | null {
  if (!city) return null
  const inCountry = getCitiesForCountry(country)[city]
  if (inCountry) return inCountry
  // Cross-country lookup — handles saved manual picks after IP changes
  for (const cities of Object.values(COUNTRY_CITIES)) {
    const hit = cities[city]
    if (hit) return hit
  }
  return null
}

/**
 * Backward-compat alias for code that still imports `UK_CITY_COORDS`.
 * New callers should prefer `getCitiesForCountry('GB')`.
 */
export const UK_CITY_COORDS = COUNTRY_CITIES.GB

// ─── Distance helpers ─────────────────────────────────────────────────────

/**
 * Haversine distance between two coordinates, in kilometres.
 * Accuracy ±0.5% — fine for "12 km away" badges.
 */
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371 // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Convert km → miles, rounded to nearest integer. UK-centric formatting. */
export function kmToMiles(km: number): number {
  return Math.round(km * 0.621371)
}

/** Format a distance for display: "2 mi" / "47 mi" / "<1 mi". */
export function formatDistance(km: number): string {
  const mi = kmToMiles(km)
  if (mi < 1) return '<1 mi'
  return `${mi} mi`
}
