# PilatesHub Studio Scraping Pipeline Plan

> Last updated: 2026-03-23
> Status: Ready for implementation
> Author: Engineering

---

## 1. Data Source Comparison

| Source | Quality | Coverage | Cost | Legal Risk | Has API | Rate Limits |
|--------|---------|----------|------|------------|---------|-------------|
| **Google Places API (New)** | Excellent — rich metadata, photos, reviews | Global, near-complete | Essentials: 10k free/mo, then ~$32/1k requests (Nearby + Details). Pro: 5k free/mo, $40/1k | Safe (official API, TOS compliant) | Yes (REST + client libs) | Per-second QPS, generous |
| **OpenStreetMap Overpass** | Good — geo-accurate, variable metadata | Global but uneven; strong in EU cities, weaker in US suburbs | Completely free (ODbL license) | Safe (open data, attribution required) | Yes (Overpass QL) | 2 concurrent slots, 10k elements/query |
| **Yelp Fusion API** | Good — reviews, photos, hours | Strong in US, UK, FR major cities | Free tier: 5,000 calls/day, 500 businesses/search | Safe (official API) | Yes (REST) | 5,000/day, 50 results/page |
| **Outscraper** | Excellent — Google Maps data without API limits | Global (mirrors Google Maps) | $2-4/1k places scraped | Gray area (scrapes Google, not your legal risk but data provenance is murky) | Yes (REST) | Depends on plan |
| **Direct web scraping** | Variable — fragile, site-specific | Any site you target | Free (compute only) | Risky (TOS violations, potential legal action, CAPTCHAs) | No | N/A |
| **ClassPass / Gymlib APIs** | Good for class schedules | Urban areas with partnerships | Requires partnership / undocumented | Gray (no public API) | Unofficial | Unknown |

### Verdict

Google Places is the gold standard but costs money at scale. OSM is the best free starting point, especially for European cities where community mapping is strong. Yelp is a solid free supplement for US/EU cities. Outscraper and direct scraping are fallbacks we should avoid unless strictly necessary.

---

## 2. Recommended Approach: Hybrid Pipeline

```
Phase 1 (NOW - free)     → OpenStreetMap Overpass API
Phase 2 (Week 2 - €0-100/mo) → Google Places API with free tier credits
Phase 3 (Month 2+)       → Add Yelp Fusion + studio website enrichment
Phase 4 (Month 3+)       → Automated weekly pipeline with change detection
```

### Why hybrid?

- **OSM first**: Free, legal, good European coverage. We already have 16 OSM-sourced studios in Paris (see `src/data/real-studios.ts`). This gives us a baseline immediately.
- **Google Places second**: Fills gaps OSM misses (many boutique studios not mapped). Provides ratings, photos, phone numbers, opening hours that OSM often lacks.
- **Yelp third**: Adds review depth, price range indicators, and catches studios that exist on Yelp but not Google/OSM.
- **Website scraping last**: For enrichment only (class schedules, pricing, coach names) — not for discovery.

---

## 3. Data Points Per Studio

### Core fields (required)

| Field | Source Priority | DB Column |
|-------|---------------|-----------|
| `name` | OSM > Google > Yelp | `name` VARCHAR(255) |
| `address` | Google > OSM > Yelp | `address` TEXT |
| `lat` | OSM > Google | `lat` DECIMAL(10,7) |
| `lng` | OSM > Google | `lng` DECIMAL(10,7) |
| `city` | Derived from address | `city` VARCHAR(100) |
| `country` | Derived from address | `country` VARCHAR(2) |
| `source` | Pipeline metadata | `source` ENUM('osm','google','yelp','web') |
| `source_id` | OSM node ID / Google place_id | `source_id` VARCHAR(255) |

### Enrichment fields (optional, filled progressively)

| Field | Best Source | DB Column |
|-------|-----------|-----------|
| `phone` | Google > Yelp > OSM | `phone` VARCHAR(20) |
| `website` | Google > OSM > Yelp | `website` VARCHAR(500) |
| `opening_hours` | Google > OSM | `opening_hours` JSONB |
| `rating` | Google > Yelp | `rating` DECIMAL(2,1) |
| `review_count` | Google > Yelp | `review_count` INTEGER |
| `photos` | Google > Yelp | `photos` JSONB (array of URLs) |
| `price_range` | Yelp > website scrape | `price_range` SMALLINT (1-4) |
| `class_types` | Website scrape | `class_types` TEXT[] |
| `social_media` | Website scrape > OSM | `social_media` JSONB |
| `neighborhood` | Google > OSM | `neighborhood` VARCHAR(100) |
| `sport_types` | OSM tags > name analysis | `sport_types` TEXT[] |
| `is_verified` | Admin review | `is_verified` BOOLEAN DEFAULT false |

### Compatibility with existing `RealStudio` interface

Our current `src/data/real-studios.ts` already defines:
```typescript
interface RealStudio {
  id: number;
  osmId: number | null;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  neighborhood?: string;
  source: "osm" | "web";
  instagram?: string;
  sportType: "pilates" | "yoga" | "fitness";
}
```

The pipeline will output data compatible with this interface, then extended for the DB schema. Migration path: `RealStudio` -> `DbStudio` with additional fields.

---

## 4. Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SCHEDULER (cron)                        │
│            Daily for new cities, weekly refresh             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    CITY QUEUE (BullMQ)                      │
│  Paris → Lyon → Marseille → Bordeaux → Toulouse → ...      │
└──────────────────────┬──────────────────────────────────────┘
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ OSM      │ │ Google   │ │ Yelp     │
│ Scraper  │ │ Places   │ │ Fusion   │
│ Worker   │ │ Worker   │ │ Worker   │
└────┬─────┘ └────┬─────┘ └────┬─────┘
     │             │             │
     └──────┬──────┘─────────────┘
            ▼
┌─────────────────────────────────────────────────────────────┐
│                  RAW DATA STORE (JSON files)                │
│        /data/raw/{source}/{city}/{date}.json                │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    DEDUPLICATION                             │
│        Match by: name similarity (Levenshtein > 0.8)        │
│                + geo proximity (haversine < 100m)            │
│        Merge strategy: prefer Google > OSM > Yelp           │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    NORMALIZATION                             │
│        - Standardize phone formats (E.164)                  │
│        - Normalize addresses (title case, abbreviations)    │
│        - Parse opening hours → structured JSONB             │
│        - Classify sport_types from name + tags              │
│        - Geocode if missing lat/lng                         │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  CHANGE DETECTION                            │
│        Compare with existing DB records:                    │
│        - NEW: insert + flag for admin review                │
│        - UPDATED: update fields, log changes                │
│        - MISSING: mark as potentially_closed after 3 runs   │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              POSTGRESQL (studios table)                      │
│        Upsert with ON CONFLICT (source, source_id)          │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              ADMIN NOTIFICATION                              │
│        - Email/Slack: "12 new studios found in Lyon"        │
│        - Dashboard: pending review queue                    │
│        - Weekly digest: coverage stats per city             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Implementation Plan

### Phase 1: Overpass API Quick Script (TODAY)

**Goal**: Scrape all Pilates-related studios from OSM for French cities, output JSON, optionally insert into DB.

**Overpass QL query strategy**:

```
[out:json][timeout:30];
(
  // Explicit pilates sport tag
  node["sport"="pilates"]({{bbox}});
  way["sport"="pilates"]({{bbox}});

  // Fitness centres with pilates/reformer in the name
  node["leisure"="fitness_centre"]["name"~"pilates|reformer|barre",i]({{bbox}});
  way["leisure"="fitness_centre"]["name"~"pilates|reformer|barre",i]({{bbox}});

  // Sports centres with pilates in the name
  node["leisure"="sports_centre"]["name"~"pilates|reformer",i]({{bbox}});
  way["leisure"="sports_centre"]["name"~"pilates|reformer",i]({{bbox}});

  // Gyms tagged with pilates
  node["amenity"="gym"]["name"~"pilates|reformer",i]({{bbox}});
  way["amenity"="gym"]["name"~"pilates|reformer",i]({{bbox}});

  // Yoga studios (many offer pilates too)
  node["sport"="yoga"]["name"~"pilates",i]({{bbox}});
  way["sport"="yoga"]["name"~"pilates",i]({{bbox}});
);
out center;
```

**Why these tags?** OSM has no single canonical tag for Pilates studios. Studios appear under multiple tagging conventions:
- `sport=pilates` (most specific, least common)
- `leisure=fitness_centre` + name containing "pilates" (most common)
- `amenity=gym` (less common for boutique studios)
- Some are tagged `sport=yoga` but have "pilates" in the name

### Phase 2: Google Places Enrichment (Week 2)

- **Nearby Search (New)**: `type=gym`, `keyword=pilates` within a radius around city center
- **Place Details**: For each result, fetch phone, website, hours, photos, rating
- **Cost estimate** (2026 pricing):
  - Nearby Search Essentials: Free up to 10,000/mo, then $32 per 1,000
  - Place Details Pro (for hours, reviews, photos): Free up to 5,000/mo, then $40 per 1,000
  - Per city (assuming ~50 results): 1 search + 50 detail calls = ~$2/city
  - 5 cities: ~$10/month (well within free tier)
  - 20 cities: ~$40/month (mostly free tier)
  - 100 cities: ~$200/month

### Phase 3: Yelp + Website Enrichment (Month 2)

- **Yelp Fusion**: Search `categories=pilates`, `location={city}` — 5,000 free calls/day
- **Website scraping**: For each studio with a website URL, fetch homepage and extract:
  - Class types (Reformer, Mat, Barre, etc.)
  - Pricing info
  - Coach/instructor names
  - Social media links
  - Use lightweight `cheerio` parsing, not headless browser

### Phase 4: Automated Pipeline (Month 3)

- BullMQ queue with Redis for job management
- Cron: weekly full refresh per city, daily for newly added cities
- Deduplication, normalization, change detection
- Admin notification system

---

## 6. Code: Overpass Scraper

Complete implementation for `scripts/src/scrape-studios.ts`:

```typescript
/**
 * PilatesHub Studio Scraper - Phase 1: OpenStreetMap Overpass API
 *
 * Usage:
 *   npx tsx scripts/src/scrape-studios.ts
 *   npx tsx scripts/src/scrape-studios.ts --city paris
 *   npx tsx scripts/src/scrape-studios.ts --city all --output json
 *   npx tsx scripts/src/scrape-studios.ts --city lyon --dry-run
 *
 * Output:
 *   - Console: summary of studios found per city
 *   - JSON: data/raw/osm/{city}/{date}.json
 *   - DB: inserts into studios table (unless --dry-run)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface City {
  name: string;
  country: string;
  /** [south, west, north, east] */
  bbox: [number, number, number, number];
}

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  version: number;
  generator: string;
  osm3s: { timestamp_osm_base: string };
  elements: OverpassElement[];
}

interface ScrapedStudio {
  osmId: number;
  osmType: "node" | "way" | "relation";
  name: string;
  lat: number;
  lng: number;
  address: string | null;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  neighborhood: string | null;
  instagram: string | null;
  sportTypes: string[];
  rawTags: Record<string, string>;
  city: string;
  country: string;
  scrapedAt: string;
}

// ─── Configuration ────────────────────────────────────────────────────────────

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

/** Delay between city requests to respect Overpass rate limits */
const REQUEST_DELAY_MS = 2000;

const FRENCH_CITIES: City[] = [
  { name: "Paris",      country: "FR", bbox: [48.8155, 2.2241, 48.9022, 2.4699] },
  { name: "Lyon",       country: "FR", bbox: [45.7073, 4.7718, 45.8082, 4.8984] },
  { name: "Marseille",  country: "FR", bbox: [43.2165, 5.2890, 43.3803, 5.5320] },
  { name: "Bordeaux",   country: "FR", bbox: [44.8057, -0.6510, 44.8878, -0.5175] },
  { name: "Toulouse",   country: "FR", bbox: [43.5507, 1.3745, 43.6534, 1.5047] },
  { name: "Nice",       country: "FR", bbox: [43.6750, 7.1890, 43.7400, 7.3130] },
  { name: "Nantes",     country: "FR", bbox: [47.1780, -1.6200, 47.2680, -1.5000] },
  { name: "Strasbourg", country: "FR", bbox: [48.5500, 7.7000, 48.6200, 7.8100] },
  { name: "Montpellier",country: "FR", bbox: [43.5800, 3.8200, 43.6500, 3.9400] },
  { name: "Lille",      country: "FR", bbox: [50.6000, 3.0100, 50.6600, 3.1100] },
];

const EUROPEAN_CAPITALS: City[] = [
  { name: "London",     country: "GB", bbox: [51.3841, -0.3518, 51.6723, 0.1480] },
  { name: "Berlin",     country: "DE", bbox: [52.3382, 13.0883, 52.6755, 13.7612] },
  { name: "Madrid",     country: "ES", bbox: [40.3120, -3.8340, 40.5640, -3.5240] },
  { name: "Rome",       country: "IT", bbox: [41.7930, 12.3690, 41.9930, 12.5930] },
  { name: "Amsterdam",  country: "NL", bbox: [52.3100, 4.7290, 52.4310, 5.0160] },
  { name: "Barcelona",  country: "ES", bbox: [41.3200, 2.0690, 41.4680, 2.2280] },
  { name: "Lisbon",     country: "PT", bbox: [38.6916, -9.2298, 38.7955, -9.0871] },
  { name: "Vienna",     country: "AT", bbox: [48.1182, 16.1826, 48.3231, 16.5775] },
  { name: "Brussels",   country: "BE", bbox: [50.7963, 4.3137, 50.9131, 4.4370] },
  { name: "Zurich",     country: "CH", bbox: [47.3200, 8.4480, 47.4340, 8.6250] },
];

// ─── Overpass Query Builder ───────────────────────────────────────────────────

function buildOverpassQuery(bbox: [number, number, number, number]): string {
  const [south, west, north, east] = bbox;
  const bboxStr = `${south},${west},${north},${east}`;

  return `[out:json][timeout:30];
(
  node["sport"="pilates"](${bboxStr});
  way["sport"="pilates"](${bboxStr});
  node["leisure"="fitness_centre"]["name"~"pilates|reformer|barre",i](${bboxStr});
  way["leisure"="fitness_centre"]["name"~"pilates|reformer|barre",i](${bboxStr});
  node["leisure"="sports_centre"]["name"~"pilates|reformer",i](${bboxStr});
  way["leisure"="sports_centre"]["name"~"pilates|reformer",i](${bboxStr});
  node["amenity"="gym"]["name"~"pilates|reformer",i](${bboxStr});
  way["amenity"="gym"]["name"~"pilates|reformer",i](${bboxStr});
  node["sport"="yoga"]["name"~"pilates",i](${bboxStr});
  way["sport"="yoga"]["name"~"pilates",i](${bboxStr});
);
out center;`;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseElement(el: OverpassElement, city: City): ScrapedStudio | null {
  const tags = el.tags ?? {};
  const name = tags.name || tags["name:en"] || tags["name:fr"];

  if (!name) return null; // Skip unnamed elements

  // Get coordinates (nodes have lat/lon directly, ways have center)
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;

  if (!lat || !lng) return null;

  // Build address from OSM addr:* tags
  const addressParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:postcode"],
    tags["addr:city"],
  ].filter(Boolean);

  const address = addressParts.length > 0 ? addressParts.join(" ") : null;

  // Determine sport types from tags
  const sportTypes: string[] = [];
  const sport = tags.sport?.toLowerCase() ?? "";
  const nameLC = name.toLowerCase();

  if (sport.includes("pilates") || nameLC.includes("pilates") || nameLC.includes("reformer")) {
    sportTypes.push("pilates");
  }
  if (sport.includes("yoga") || nameLC.includes("yoga")) {
    sportTypes.push("yoga");
  }
  if (nameLC.includes("barre")) {
    sportTypes.push("barre");
  }
  if (sportTypes.length === 0) {
    sportTypes.push("fitness"); // fallback
  }

  // Extract social media
  const instagram =
    tags["contact:instagram"]?.replace(/^.*instagram\.com\//, "").replace(/\/$/, "") ?? null;

  return {
    osmId: el.id,
    osmType: el.type,
    name,
    lat,
    lng,
    address,
    phone: tags.phone || tags["contact:phone"] || null,
    website: tags.website || tags["contact:website"] || null,
    openingHours: tags.opening_hours || null,
    neighborhood: tags["addr:suburb"] || tags["addr:quarter"] || null,
    instagram,
    sportTypes,
    rawTags: tags,
    city: city.name,
    country: city.country,
    scrapedAt: new Date().toISOString(),
  };
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function scrapeCity(city: City): Promise<ScrapedStudio[]> {
  const query = buildOverpassQuery(city.bbox);

  console.log(`  Querying Overpass for ${city.name} (${city.country})...`);

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(query),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      console.warn(`  Rate limited for ${city.name}, waiting 30s and retrying...`);
      await sleep(30_000);
      return scrapeCity(city); // Retry once
    }
    throw new Error(`Overpass API error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data: OverpassResponse = await response.json();
  const studios = data.elements
    .map((el) => parseElement(el, city))
    .filter((s): s is ScrapedStudio => s !== null);

  console.log(`  Found ${data.elements.length} elements, parsed ${studios.length} studios`);

  return studios;
}

// ─── Deduplication ────────────────────────────────────────────────────────────

/**
 * Haversine distance in meters between two lat/lng points
 */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Simple Levenshtein-based name similarity (0 to 1)
 */
function nameSimilarity(a: string, b: string): number {
  const aLower = a.toLowerCase().trim();
  const bLower = b.toLowerCase().trim();
  if (aLower === bLower) return 1;

  const maxLen = Math.max(aLower.length, bLower.length);
  if (maxLen === 0) return 1;

  // Simple Levenshtein distance
  const matrix: number[][] = [];
  for (let i = 0; i <= aLower.length; i++) {
    matrix[i] = [i];
    for (let j = 1; j <= bLower.length; j++) {
      if (i === 0) {
        matrix[i][j] = j;
      } else {
        const cost = aLower[i - 1] === bLower[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
  }

  const distance = matrix[aLower.length][bLower.length];
  return 1 - distance / maxLen;
}

/**
 * Deduplicate studios: same name (similarity > 0.8) AND within 100m
 */
function deduplicateStudios(studios: ScrapedStudio[]): ScrapedStudio[] {
  const unique: ScrapedStudio[] = [];

  for (const studio of studios) {
    const isDuplicate = unique.some((existing) => {
      const nameMatch = nameSimilarity(existing.name, studio.name) > 0.8;
      const geoMatch = haversineDistance(existing.lat, existing.lng, studio.lat, studio.lng) < 100;
      return nameMatch && geoMatch;
    });

    if (!isDuplicate) {
      unique.push(studio);
    }
  }

  return unique;
}

// ─── File Output ──────────────────────────────────────────────────────────────

import * as fs from "node:fs";
import * as path from "node:path";

function saveRawJson(studios: ScrapedStudio[], city: City): string {
  const date = new Date().toISOString().slice(0, 10);
  const dir = path.join("data", "raw", "osm", city.name.toLowerCase());
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${date}.json`);
  fs.writeFileSync(filePath, JSON.stringify(studios, null, 2));
  return filePath;
}

// ─── DB Insert (when @workspace/db is available) ──────────────────────────────

/*
 * Uncomment and adapt when the DB package is ready:
 *
 * import { db } from "@workspace/db";
 * import { studios } from "@workspace/db/schema";
 * import { eq, and } from "drizzle-orm";
 *
 * async function upsertStudio(studio: ScrapedStudio) {
 *   const existing = await db.query.studios.findFirst({
 *     where: and(
 *       eq(studios.source, "osm"),
 *       eq(studios.sourceId, String(studio.osmId))
 *     ),
 *   });
 *
 *   if (existing) {
 *     await db.update(studios)
 *       .set({
 *         name: studio.name,
 *         lat: studio.lat,
 *         lng: studio.lng,
 *         address: studio.address,
 *         phone: studio.phone,
 *         website: studio.website,
 *         openingHours: studio.openingHours,
 *         neighborhood: studio.neighborhood,
 *         updatedAt: new Date(),
 *       })
 *       .where(eq(studios.id, existing.id));
 *     return "updated";
 *   } else {
 *     await db.insert(studios).values({
 *       name: studio.name,
 *       lat: studio.lat,
 *       lng: studio.lng,
 *       address: studio.address,
 *       phone: studio.phone,
 *       website: studio.website,
 *       openingHours: studio.openingHours,
 *       neighborhood: studio.neighborhood,
 *       city: studio.city,
 *       country: studio.country,
 *       source: "osm",
 *       sourceId: String(studio.osmId),
 *       sportTypes: studio.sportTypes,
 *       isVerified: false,
 *     });
 *     return "inserted";
 *   }
 * }
 */

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(): { city: string; dryRun: boolean; output: "console" | "json" } {
  const args = process.argv.slice(2);
  let city = "all";
  let dryRun = false;
  let output: "console" | "json" = "json";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--city" && args[i + 1]) city = args[i + 1];
    if (args[i] === "--dry-run") dryRun = true;
    if (args[i] === "--output" && args[i + 1]) output = args[i + 1] as "console" | "json";
  }

  return { city, dryRun, output };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { city: cityFilter, dryRun, output } = parseArgs();

  console.log("=== PilatesHub OSM Studio Scraper ===");
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Output: ${output}`);
  console.log("");

  // Select cities to scrape
  const allCities = [...FRENCH_CITIES, ...EUROPEAN_CAPITALS];
  const cities =
    cityFilter === "all"
      ? FRENCH_CITIES // Default: French cities only
      : cityFilter === "europe"
        ? allCities
        : allCities.filter((c) => c.name.toLowerCase() === cityFilter.toLowerCase());

  if (cities.length === 0) {
    console.error(`No city found matching "${cityFilter}"`);
    console.error(`Available: ${allCities.map((c) => c.name).join(", ")}`);
    process.exit(1);
  }

  console.log(`Scraping ${cities.length} cities: ${cities.map((c) => c.name).join(", ")}\n`);

  let totalStudios = 0;
  const allStudios: ScrapedStudio[] = [];

  for (const city of cities) {
    try {
      const studios = await scrapeCity(city);
      const deduplicated = deduplicateStudios(studios);

      console.log(`  After dedup: ${deduplicated.length} unique studios`);

      if (output === "json") {
        const filePath = saveRawJson(deduplicated, city);
        console.log(`  Saved to: ${filePath}`);
      }

      allStudios.push(...deduplicated);
      totalStudios += deduplicated.length;

      // Respect rate limits
      if (cities.indexOf(city) < cities.length - 1) {
        console.log(`  Waiting ${REQUEST_DELAY_MS}ms before next city...`);
        await sleep(REQUEST_DELAY_MS);
      }
    } catch (error) {
      console.error(`  ERROR scraping ${city.name}:`, error);
    }

    console.log("");
  }

  // Summary
  console.log("=== SUMMARY ===");
  console.log(`Total studios found: ${totalStudios}`);

  const bySportType: Record<string, number> = {};
  const byCity: Record<string, number> = {};
  for (const s of allStudios) {
    for (const sport of s.sportTypes) {
      bySportType[sport] = (bySportType[sport] ?? 0) + 1;
    }
    byCity[s.city] = (byCity[s.city] ?? 0) + 1;
  }

  console.log("\nBy city:");
  for (const [city, count] of Object.entries(byCity).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${city}: ${count}`);
  }

  console.log("\nBy sport type:");
  for (const [sport, count] of Object.entries(bySportType).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${sport}: ${count}`);
  }

  if (!dryRun) {
    console.log("\nTo insert into DB, uncomment the upsertStudio function and run again.");
  }
}

main().catch(console.error);
```

---

## 7. Code: Google Places Enrichment

For Phase 2, `scripts/src/enrich-google-places.ts`:

```typescript
/**
 * PilatesHub - Google Places API Enrichment (Phase 2)
 *
 * Prerequisites:
 *   - GOOGLE_PLACES_API_KEY env variable
 *   - Studios already in DB from Phase 1 (OSM scrape)
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=xxx npx tsx scripts/src/enrich-google-places.ts --city paris
 */

const GOOGLE_PLACES_BASE = "https://places.googleapis.com/v1/places";

interface GooglePlace {
  id: string;
  displayName: { text: string; languageCode: string };
  formattedAddress: string;
  location: { latitude: number; longitude: number };
  internationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: {
    weekdayDescriptions: string[];
    periods: Array<{
      open: { day: number; hour: number; minute: number };
      close: { day: number; hour: number; minute: number };
    }>;
  };
  rating?: number;
  userRatingCount?: number;
  photos?: Array<{ name: string; widthPx: number; heightPx: number }>;
  googleMapsUri?: string;
  priceLevel?: "PRICE_LEVEL_FREE" | "PRICE_LEVEL_INEXPENSIVE" | "PRICE_LEVEL_MODERATE" | "PRICE_LEVEL_EXPENSIVE" | "PRICE_LEVEL_VERY_EXPENSIVE";
}

interface NearbySearchResponse {
  places: GooglePlace[];
  nextPageToken?: string;
}

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!API_KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY environment variable");
  process.exit(1);
}

/**
 * Search for Pilates studios near a location using Places API (New)
 * Uses Nearby Search with field masking to control costs
 */
async function searchNearby(
  lat: number,
  lng: number,
  radiusMeters: number = 5000
): Promise<GooglePlace[]> {
  // Essentials fields (free tier: 10k/mo)
  // Adding rating, reviews, photos pushes to Pro tier (free tier: 5k/mo)
  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.regularOpeningHours",
    "places.rating",
    "places.userRatingCount",
    "places.photos",
    "places.googleMapsUri",
  ].join(",");

  const body = {
    includedTypes: ["gym", "fitness_center"],
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radiusMeters,
      },
    },
    languageCode: "fr",
    maxResultCount: 20,
    // textQuery would be better but costs more — use keyword filtering post-fetch
  };

  const response = await fetch(`${GOOGLE_PLACES_BASE}:searchNearby`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY!,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.status} ${await response.text()}`);
  }

  const data: NearbySearchResponse = await response.json();

  // Filter to only Pilates-related results
  const pilatesKeywords = /pilates|reformer|barre|hundred/i;
  return (data.places ?? []).filter(
    (p) =>
      pilatesKeywords.test(p.displayName?.text ?? "") ||
      pilatesKeywords.test(p.formattedAddress ?? "")
  );
}

/**
 * Use Text Search for more targeted results (costs slightly more but better recall)
 */
async function textSearch(query: string, lat: number, lng: number): Promise<GooglePlace[]> {
  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.regularOpeningHours",
    "places.rating",
    "places.userRatingCount",
    "places.googleMapsUri",
  ].join(",");

  const body = {
    textQuery: query,
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 10000,
      },
    },
    languageCode: "fr",
    maxResultCount: 20,
  };

  const response = await fetch(`${GOOGLE_PLACES_BASE}:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY!,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Google Places text search error: ${response.status}`);
  }

  const data: NearbySearchResponse = await response.json();
  return data.places ?? [];
}

/**
 * Strategy: Use Text Search with "pilates" keyword — better results than
 * Nearby Search filtered post-hoc. One API call per city quadrant.
 */
async function enrichCity(cityName: string, centerLat: number, centerLng: number) {
  console.log(`\nEnriching ${cityName} via Google Places...`);

  const queries = [
    `studio pilates ${cityName}`,
    `reformer pilates ${cityName}`,
    `cours pilates ${cityName}`,
  ];

  const allPlaces: GooglePlace[] = [];
  const seenIds = new Set<string>();

  for (const query of queries) {
    const places = await textSearch(query, centerLat, centerLng);
    for (const place of places) {
      if (!seenIds.has(place.id)) {
        seenIds.add(place.id);
        allPlaces.push(place);
      }
    }
    // Small delay between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`  Found ${allPlaces.length} unique places from Google`);

  // Convert to our format for merging
  return allPlaces.map((p) => ({
    googlePlaceId: p.id,
    name: p.displayName.text,
    address: p.formattedAddress,
    lat: p.location.latitude,
    lng: p.location.longitude,
    phone: p.internationalPhoneNumber ?? null,
    website: p.websiteUri ?? null,
    openingHours: p.regularOpeningHours?.weekdayDescriptions ?? null,
    rating: p.rating ?? null,
    reviewCount: p.userRatingCount ?? null,
    googleMapsUrl: p.googleMapsUri ?? null,
  }));
}

// Usage:
// const parisStudios = await enrichCity("Paris", 48.8566, 2.3522);
```

---

## 8. Cost Estimation

### Google Places API (New) — 2026 Pricing

| SKU | Free Tier | Pay-as-you-go | Our Usage |
|-----|-----------|---------------|-----------|
| Nearby Search (Essentials) | 10,000/mo | $32/1k requests | Low — we use Text Search instead |
| Text Search (Pro) | 5,000/mo | $40/1k requests | 3 queries/city = 3 calls/city |
| Place Details (Essentials) | 10,000/mo | $32/1k requests | Optional — Text Search returns most fields |
| Place Details (Pro) | 5,000/mo | $40/1k requests | Only if we need photos |

### Monthly Cost by Scale

| Phase | Cities | API Calls/mo | Monthly Cost |
|-------|--------|-------------|-------------|
| OSM only (Phase 1) | Any | 0 | **Free** |
| + Google Places, 5 cities | 5 | ~15 text searches + refresh | **Free** (within 5k free tier) |
| + Google Places, 10 cities | 10 | ~30 text searches/week = 120/mo | **Free** (within 5k free tier) |
| + Google Places, 20 cities | 20 | ~60/week = 240/mo | **Free** (within 5k free tier) |
| + Google Places, 50 cities | 50 | ~150/week = 600/mo | **Free** (within 5k free tier) |
| + Google Places, 100+ cities | 100+ | ~300/week = 1,200/mo | **~$0** (barely over free tier) |
| + Yelp Fusion | Any | Up to 5,000/day | **Free** |
| Infrastructure (Redis + cron) | - | - | **~$10-20/mo** (Railway/Fly.io) |

**Key insight**: With 5,000 free Pro calls/month, we can scrape ~1,600 cities per month (3 calls each) completely free. Google Places free tier is extremely generous for our use case. The main cost is infrastructure, not API calls.

### Worst-Case Budget

| Scenario | Monthly |
|----------|---------|
| Conservative (stay in free tier) | **$0** |
| Moderate (20 cities, weekly refresh, some overages) | **$10-50** |
| Aggressive (100+ cities, daily refresh, photos) | **$100-200** |
| Full scale (global, all enrichments) | **$300-500** |

---

## 9. Database Schema

SQL migration for the `studios` table (compatible with Drizzle ORM):

```sql
CREATE TABLE studios (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) NOT NULL UNIQUE,
  lat             DECIMAL(10, 7) NOT NULL,
  lng             DECIMAL(10, 7) NOT NULL,
  address         TEXT,
  city            VARCHAR(100) NOT NULL,
  country         VARCHAR(2) NOT NULL DEFAULT 'FR',
  neighborhood    VARCHAR(100),
  phone           VARCHAR(30),
  website         VARCHAR(500),
  opening_hours   JSONB,
  rating          DECIMAL(2, 1),
  review_count    INTEGER DEFAULT 0,
  price_range     SMALLINT CHECK (price_range BETWEEN 1 AND 4),
  sport_types     TEXT[] DEFAULT '{"pilates"}',
  class_types     TEXT[],
  photos          JSONB DEFAULT '[]',
  social_media    JSONB DEFAULT '{}',

  -- Source tracking
  source          VARCHAR(20) NOT NULL, -- 'osm', 'google', 'yelp', 'web'
  source_id       VARCHAR(255),         -- OSM node ID, Google place_id, etc.
  google_place_id VARCHAR(255),
  osm_id          BIGINT,

  -- Metadata
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  last_scraped_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Deduplication constraint
  UNIQUE(source, source_id)
);

-- Indexes for common queries
CREATE INDEX idx_studios_city ON studios(city);
CREATE INDEX idx_studios_country ON studios(country);
CREATE INDEX idx_studios_location ON studios USING GIST (
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)
);
CREATE INDEX idx_studios_sport_types ON studios USING GIN(sport_types);
CREATE INDEX idx_studios_active ON studios(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_studios_google_place_id ON studios(google_place_id) WHERE google_place_id IS NOT NULL;
```

---

## 10. Deduplication Strategy

Studios appear in multiple sources. We need robust deduplication:

```
Step 1: Exact match on source_id (same source, same ID = same studio)
Step 2: Name similarity + geo proximity
        - Levenshtein similarity > 0.8 on normalized names
        - Haversine distance < 100 meters
        - Both must match = duplicate
Step 3: Cross-source linking
        - When duplicate found across sources, keep all source_ids
        - Merge fields: prefer Google > OSM > Yelp for each field
        - Never overwrite a non-null field with null
```

**Name normalization before comparison**:
```
"POSES Studio - Marais"  → "poses studio marais"
"Poses Studio Marais"    → "poses studio marais"   → MATCH (similarity 1.0)
"Studio Poses"           → "studio poses"          → MATCH (similarity ~0.85)
```

**Edge cases**:
- Chain studios (multiple locations): Same name but > 100m apart = different studios. Correct behavior.
- Renamed studios: Old name in OSM, new name in Google. Will appear as two studios until manually merged by admin. Flag for review when geo proximity < 50m but name similarity < 0.5.

---

## 11. Scaling Plan

| Timeline | Cities | Studios (est.) | Sources | Automation |
|----------|--------|---------------|---------|------------|
| **Month 1** | Paris | ~50-80 | OSM + manual web | Script, manual run |
| **Month 2** | 5 French cities | ~150-250 | OSM + Google Places | Weekly cron |
| **Month 3-4** | 20 French cities | ~400-700 | OSM + Google + Yelp | BullMQ pipeline |
| **Month 5-6** | 10 European capitals | ~1,000-2,000 | All sources | Automated + monitoring |
| **Month 7-9** | 30 EU cities | ~3,000-5,000 | All + website scraping | Full pipeline + admin dashboard |
| **Month 10-12** | 50+ global cities | ~5,000-10,000 | All sources | Self-service city addition |

### City Prioritization

**Tier 1 — Launch cities** (Month 1-2):
Paris, Lyon, Marseille, Bordeaux, Toulouse

**Tier 2 — French expansion** (Month 3-4):
Nice, Nantes, Strasbourg, Montpellier, Lille, Rennes, Grenoble, Rouen, Toulon, Angers, Dijon, Brest, Le Mans, Aix-en-Provence, Clermont-Ferrand

**Tier 3 — European capitals** (Month 5-6):
London, Berlin, Amsterdam, Barcelona, Madrid, Rome, Lisbon, Vienna, Brussels, Zurich

**Tier 4 — Global** (Month 7+):
New York, Los Angeles, Sydney, Toronto, Dubai, Singapore, Tokyo, Seoul

### Quality Metrics to Track

- **Coverage score**: studios in DB / estimated total studios (via Google Maps manual count)
- **Data completeness**: % of studios with phone, website, hours, rating filled
- **Freshness**: average days since last_scraped_at
- **Accuracy**: % of studios confirmed active by admin spot-check

---

## 12. Legal & Compliance Notes

### Safe (use freely)
- **OpenStreetMap Overpass API**: Open data under ODbL license. Must attribute "OpenStreetMap contributors". Can use commercially.
- **Google Places API**: Official API with clear TOS. Store data for up to 30 days (caching policy). Must show "Powered by Google" when displaying their data.
- **Yelp Fusion API**: Official API. Cannot store data longer than 24 hours per TOS (must re-fetch). Cannot display Yelp ratings without Yelp branding.

### Requires caution
- **Studio website scraping**: Check robots.txt. Only scrape public pages. Respect rate limits. Do not scrape behind login walls.
- **Outscraper/ScrapingBee**: They handle the legal risk of scraping Google, but Google data used outside their API is technically a TOS violation. Use as last resort.

### Never do
- Scrape Google Maps directly (TOS violation, IP bans)
- Scrape review content from Google/Yelp (copyright issues)
- Store user review text (only aggregate rating + count)
- Pretend scraped data is our own original data

### GDPR Considerations (EU)
- Studio business data (name, address, phone) is not personal data under GDPR — it is public business information
- Do not scrape or store individual reviewer names/profiles
- Provide a way for studio owners to claim/edit/remove their listing
- Include data source attribution in the app

---

## 13. Quick Start Checklist

```
Today:
[ ] Run Overpass scraper for Paris → verify against existing real-studios.ts data
[ ] Compare results: how many of our 45 studios does OSM find?
[ ] Save raw JSON output to data/raw/osm/paris/

This week:
[ ] Set up Google Cloud project + enable Places API (New)
[ ] Get API key, set up billing with $200 free credit
[ ] Run Google Places enrichment for Paris
[ ] Merge OSM + Google results, measure dedup accuracy

Next week:
[ ] Create studios table migration (Drizzle schema)
[ ] Implement DB upsert in scraper
[ ] Expand to 5 French cities
[ ] Set up weekly cron (GitHub Actions or Railway cron)

Month 2:
[ ] Add Yelp Fusion integration
[ ] Build admin review queue for new studios
[ ] Implement change detection (new/updated/closed)
[ ] Expand to 20 French cities
```

---

## Appendix A: Overpass Turbo Testing

Before running the script, test queries interactively at https://overpass-turbo.eu/

Paste this query and hit "Run":

```
[out:json][timeout:30];
(
  node["sport"="pilates"]({{bbox}});
  way["sport"="pilates"]({{bbox}});
  node["leisure"="fitness_centre"]["name"~"pilates|reformer|barre",i]({{bbox}});
  way["leisure"="fitness_centre"]["name"~"pilates|reformer|barre",i]({{bbox}});
  node["amenity"="gym"]["name"~"pilates|reformer",i]({{bbox}});
  way["amenity"="gym"]["name"~"pilates|reformer",i]({{bbox}});
);
out center;
```

Navigate the map to Paris and run. You should see markers for every Pilates studio OSM knows about.

## Appendix B: Environment Variables

```bash
# .env.local (do NOT commit)
GOOGLE_PLACES_API_KEY=AIzaSy...
YELP_FUSION_API_KEY=...
REDIS_URL=redis://localhost:6379  # For BullMQ queue in Phase 4
```

## Appendix C: Useful OSM Tags for Pilates

| Tag | Meaning | Example |
|-----|---------|---------|
| `sport=pilates` | Explicit Pilates tag | Most specific |
| `leisure=fitness_centre` | Generic fitness studio | Filter by name |
| `leisure=sports_centre` | Larger sports facility | May have Pilates classes |
| `amenity=gym` | Older tagging convention | Less common for boutiques |
| `sport=yoga` | Yoga studio | Many also offer Pilates |
| `sport=gymnastics` | Gymnastics | Occasionally overlaps |
| `healthcare=physiotherapist` | Physio clinic | Some offer clinical Pilates |

## Appendix D: References

- [Google Places API (New) Usage & Billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)
- [Google Maps Platform Pricing](https://developers.google.com/maps/billing-and-pricing/pricing)
- [Overpass API Wiki](https://wiki.openstreetmap.org/wiki/Overpass_API)
- [Overpass API by Example](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_API_by_Example)
- [Overpass QL Language Guide](https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide)
- [Overpass Turbo (interactive testing)](https://overpass-turbo.eu/)
- [Yelp Fusion API Docs](https://docs.developer.yelp.com/docs/fusion-intro)
