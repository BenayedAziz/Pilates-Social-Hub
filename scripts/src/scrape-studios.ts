/**
 * Overpass API Studio Scraper
 *
 * Fetches real Pilates / yoga / fitness studios from OpenStreetMap via the
 * Overpass API, deduplicates by name similarity + geo-proximity, and upserts
 * them into the PilatesHub `studios` table.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... pnpm --filter @workspace/scripts scrape
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@workspace/db/schema";

const { Pool } = pg;

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

interface City {
  name: string;
  bbox: [number, number, number, number]; // south, west, north, east
}

const FRENCH_CITIES: City[] = [
  { name: "Paris", bbox: [48.81, 2.22, 48.91, 2.42] },
  { name: "Lyon", bbox: [45.71, 4.77, 45.81, 4.9] },
  { name: "Marseille", bbox: [43.25, 5.33, 43.35, 5.43] },
  { name: "Bordeaux", bbox: [44.8, -0.65, 44.88, -0.52] },
  { name: "Toulouse", bbox: [43.55, 1.38, 43.65, 1.5] },
  { name: "Nice", bbox: [43.68, 7.2, 43.75, 7.3] },
  { name: "Nantes", bbox: [47.19, -1.6, 47.26, -1.5] },
  { name: "Strasbourg", bbox: [48.55, 7.7, 48.62, 7.8] },
  { name: "Montpellier", bbox: [43.58, 3.83, 43.65, 3.93] },
  { name: "Lille", bbox: [50.6, 3.0, 50.66, 3.1] },
];

// ---------------------------------------------------------------------------
// Overpass query
// ---------------------------------------------------------------------------
async function queryOverpass(city: City): Promise<any[]> {
  const [south, west, north, east] = city.bbox;

  // Search for nodes *and* ways tagged with Pilates-related attributes.
  // We look at:
  //   - leisure=fitness_centre whose name matches pilates / reformer / barre
  //   - sport=pilates (dedicated tag)
  //   - sport=yoga whose name also contains "pilates"
  const query = `[out:json][timeout:30];
(
  node["leisure"="fitness_centre"]["name"~"pilates|reformer|barre",i](${south},${west},${north},${east});
  way["leisure"="fitness_centre"]["name"~"pilates|reformer|barre",i](${south},${west},${north},${east});
  node["sport"="pilates"](${south},${west},${north},${east});
  way["sport"="pilates"](${south},${west},${north},${east});
  node["sport"="yoga"]["name"~"pilates",i](${south},${west},${north},${east});
);
out center;`;

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(query),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Overpass API error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.elements || [];
}

// ---------------------------------------------------------------------------
// Element -> studio row
// ---------------------------------------------------------------------------
function parseElement(el: any, cityName: string) {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!lat || !lng) return null;

  const name = el.tags?.name;
  if (!name) return null;

  const addressParts = [
    el.tags?.["addr:housenumber"],
    el.tags?.["addr:street"],
    el.tags?.["addr:postcode"],
    el.tags?.["addr:city"],
  ].filter(Boolean);

  return {
    name,
    neighborhood: cityName,
    description: el.tags?.description || null,
    address: addressParts.length > 0 ? addressParts.join(", ") : null,
    latitude: lat as number,
    longitude: lng as number,
    coordX: null,
    coordY: null,
    price: 0,
    rating: 0,
    reviewCount: 0,
    imageUrl: null,
    amenities: [] as string[],
  };
}

// ---------------------------------------------------------------------------
// Haversine distance in metres
// ---------------------------------------------------------------------------
function distanceMetres(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------------------------------------------------------------------
// Deduplicate: same-ish name within 100 m
// ---------------------------------------------------------------------------
function deduplicate(studios: ReturnType<typeof parseElement>[]): NonNullable<ReturnType<typeof parseElement>>[] {
  const unique: NonNullable<ReturnType<typeof parseElement>>[] = [];

  for (const studio of studios) {
    if (!studio) continue;
    const isDup = unique.some(
      (existing) =>
        distanceMetres(
          studio.latitude,
          studio.longitude,
          existing.latitude,
          existing.longitude,
        ) < 100 &&
        existing.name
          .toLowerCase()
          .includes(studio.name.toLowerCase().slice(0, 5)),
    );
    if (!isDup) unique.push(studio);
  }

  return unique;
}

// ---------------------------------------------------------------------------
// Retry-aware Overpass fetch (waits & retries on 429 / 504)
// ---------------------------------------------------------------------------
async function queryWithRetry(city: City, maxRetries = 3): Promise<any[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryOverpass(city);
    } catch (err: any) {
      const is429or504 =
        err.message?.includes("429") || err.message?.includes("504");
      if (is429or504 && attempt < maxRetries) {
        const wait = attempt * 5_000; // 5s, 10s, 15s
        console.log(`  Overpass rate-limited, retrying in ${wait / 1000}s (attempt ${attempt}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
  return []; // unreachable
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is required. Set it and try again.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });
  const db = drizzle(pool, { schema });

  let totalInserted = 0;
  let totalRaw = 0;

  for (const city of FRENCH_CITIES) {
    console.log(`\nScraping ${city.name}...`);
    try {
      const elements = await queryWithRetry(city);
      totalRaw += elements.length;
      console.log(`  Found ${elements.length} raw elements`);

      const parsed = elements
        .map((el) => parseElement(el, city.name))
        .filter(Boolean);
      const deduped = deduplicate(parsed);
      console.log(`  After parse+dedup: ${deduped.length} studios`);

      for (const studio of deduped) {
        try {
          await db.insert(schema.studios).values(studio).onConflictDoNothing();
          totalInserted++;
        } catch (err: any) {
          console.error(`  Failed to insert "${studio.name}":`, err.message);
        }
      }

      // Respect Overpass rate limit: wait 5s between cities
      console.log(`  Waiting 5s before next city...`);
      await new Promise((r) => setTimeout(r, 5000));
    } catch (err: any) {
      console.error(`  Error scraping ${city.name}:`, err.message);
    }
  }

  console.log(
    `\n=== Done! Inserted ${totalInserted} studios (from ${totalRaw} raw elements across ${FRENCH_CITIES.length} cities) ===`,
  );

  await pool.end();
}

main().catch((err) => {
  console.error("Scraper failed:", err);
  process.exit(1);
});
