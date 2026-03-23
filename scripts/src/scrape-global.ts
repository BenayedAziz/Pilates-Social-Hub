/**
 * Global Pilates Studio Scraper — Google Places Text Search (New) API
 *
 * Scrapes Pilates studios from 100+ cities worldwide, deduplicates against
 * the existing DB, and inserts new entries into the PilatesHub `studios` table.
 *
 * Budget: stay within $150 of API spend (keep $50 buffer from $200 free credit).
 * Each Text Search request costs ~$0.032 (Essentials tier).
 *
 * Usage:
 *   DATABASE_URL=postgresql://... pnpm --filter @workspace/scripts scrape-global
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@workspace/db/schema";

const { Pool } = pg;

const API_KEY = "AIzaSyDIpbw6XKNXlwYnbsCFEXvZP34KFQs5kC8";

interface Zone {
  city: string;
  country: string;
  lat: number;
  lng: number;
  radius: number;
}

// Tier 1: Mega cities — split into sub-zones (5 queries each)
// Tier 2: Large cities — 1-2 queries
// Tier 3: Medium cities — 1 query

const GLOBAL_ZONES: Zone[] = [
  // === UK ===
  { city: "London Central", country: "UK", lat: 51.5074, lng: -0.1278, radius: 5000 },
  { city: "London West", country: "UK", lat: 51.5074, lng: -0.2100, radius: 5000 },
  { city: "London East", country: "UK", lat: 51.5155, lng: -0.0300, radius: 5000 },
  { city: "London North", country: "UK", lat: 51.5500, lng: -0.1000, radius: 5000 },
  { city: "London South", country: "UK", lat: 51.4700, lng: -0.1100, radius: 5000 },
  { city: "Manchester", country: "UK", lat: 53.4808, lng: -2.2426, radius: 10000 },
  { city: "Birmingham", country: "UK", lat: 52.4862, lng: -1.8904, radius: 10000 },
  { city: "Edinburgh", country: "UK", lat: 55.9533, lng: -3.1883, radius: 8000 },
  { city: "Bristol", country: "UK", lat: 51.4545, lng: -2.5879, radius: 8000 },
  { city: "Brighton", country: "UK", lat: 50.8225, lng: -0.1372, radius: 8000 },

  // === SPAIN ===
  { city: "Madrid Centro", country: "Spain", lat: 40.4168, lng: -3.7038, radius: 5000 },
  { city: "Madrid Norte", country: "Spain", lat: 40.4600, lng: -3.6900, radius: 5000 },
  { city: "Madrid Sur", country: "Spain", lat: 40.3800, lng: -3.7100, radius: 5000 },
  { city: "Barcelona Centro", country: "Spain", lat: 41.3874, lng: 2.1686, radius: 5000 },
  { city: "Barcelona Eixample", country: "Spain", lat: 41.3950, lng: 2.1600, radius: 5000 },
  { city: "Valencia", country: "Spain", lat: 39.4699, lng: -0.3763, radius: 10000 },
  { city: "Sevilla", country: "Spain", lat: 37.3891, lng: -5.9845, radius: 10000 },
  { city: "Malaga", country: "Spain", lat: 36.7213, lng: -4.4214, radius: 10000 },
  { city: "Marbella", country: "Spain", lat: 36.5099, lng: -4.8862, radius: 8000 },
  { city: "Palma de Mallorca", country: "Spain", lat: 39.5696, lng: 2.6502, radius: 8000 },

  // === ITALY ===
  { city: "Milano Centro", country: "Italy", lat: 45.4642, lng: 9.1900, radius: 5000 },
  { city: "Milano Nord", country: "Italy", lat: 45.4900, lng: 9.1800, radius: 5000 },
  { city: "Roma Centro", country: "Italy", lat: 41.9028, lng: 12.4964, radius: 5000 },
  { city: "Roma Nord", country: "Italy", lat: 41.9300, lng: 12.4700, radius: 5000 },
  { city: "Firenze", country: "Italy", lat: 43.7696, lng: 11.2558, radius: 8000 },
  { city: "Torino", country: "Italy", lat: 45.0703, lng: 7.6869, radius: 8000 },
  { city: "Bologna", country: "Italy", lat: 44.4949, lng: 11.3426, radius: 8000 },
  { city: "Napoli", country: "Italy", lat: 40.8518, lng: 14.2681, radius: 8000 },

  // === GERMANY ===
  { city: "Berlin Mitte", country: "Germany", lat: 52.5200, lng: 13.4050, radius: 5000 },
  { city: "Berlin West", country: "Germany", lat: 52.5100, lng: 13.3200, radius: 5000 },
  { city: "Berlin Prenzlauer Berg", country: "Germany", lat: 52.5400, lng: 13.4200, radius: 5000 },
  { city: "München", country: "Germany", lat: 48.1351, lng: 11.5820, radius: 8000 },
  { city: "Hamburg", country: "Germany", lat: 53.5511, lng: 9.9937, radius: 8000 },
  { city: "Frankfurt", country: "Germany", lat: 50.1109, lng: 8.6821, radius: 8000 },
  { city: "Düsseldorf", country: "Germany", lat: 51.2277, lng: 6.7735, radius: 8000 },
  { city: "Köln", country: "Germany", lat: 50.9375, lng: 6.9603, radius: 8000 },

  // === PORTUGAL ===
  { city: "Lisboa Centro", country: "Portugal", lat: 38.7223, lng: -9.1393, radius: 5000 },
  { city: "Lisboa Oeste", country: "Portugal", lat: 38.7100, lng: -9.1800, radius: 5000 },
  { city: "Porto", country: "Portugal", lat: 41.1579, lng: -8.6291, radius: 8000 },
  { city: "Cascais", country: "Portugal", lat: 38.6979, lng: -9.4215, radius: 5000 },
  { city: "Algarve", country: "Portugal", lat: 37.0179, lng: -7.9308, radius: 15000 },

  // === SWITZERLAND ===
  { city: "Zürich", country: "Switzerland", lat: 47.3769, lng: 8.5417, radius: 8000 },
  { city: "Genève", country: "Switzerland", lat: 46.2044, lng: 6.1432, radius: 8000 },
  { city: "Basel", country: "Switzerland", lat: 47.5596, lng: 7.5886, radius: 8000 },
  { city: "Lausanne", country: "Switzerland", lat: 46.5197, lng: 6.6323, radius: 8000 },

  // === BELGIUM ===
  { city: "Bruxelles", country: "Belgium", lat: 50.8503, lng: 4.3517, radius: 8000 },
  { city: "Antwerpen", country: "Belgium", lat: 51.2194, lng: 4.4025, radius: 8000 },

  // === NETHERLANDS ===
  { city: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041, radius: 8000 },
  { city: "Rotterdam", country: "Netherlands", lat: 51.9244, lng: 4.4777, radius: 8000 },
  { city: "Den Haag", country: "Netherlands", lat: 52.0705, lng: 4.3007, radius: 8000 },

  // === SCANDINAVIA ===
  { city: "Stockholm", country: "Sweden", lat: 59.3293, lng: 18.0686, radius: 10000 },
  { city: "Copenhagen", country: "Denmark", lat: 55.6761, lng: 12.5683, radius: 8000 },
  { city: "Oslo", country: "Norway", lat: 59.9139, lng: 10.7522, radius: 8000 },
  { city: "Helsinki", country: "Finland", lat: 60.1699, lng: 24.9384, radius: 8000 },

  // === AUSTRIA / EASTERN EUROPE ===
  { city: "Wien", country: "Austria", lat: 48.2082, lng: 16.3738, radius: 8000 },
  { city: "Praha", country: "Czech Republic", lat: 50.0755, lng: 14.4378, radius: 8000 },
  { city: "Warszawa", country: "Poland", lat: 52.2297, lng: 21.0122, radius: 8000 },
  { city: "Budapest", country: "Hungary", lat: 47.4979, lng: 19.0402, radius: 8000 },
  { city: "Dublin", country: "Ireland", lat: 53.3498, lng: -6.2603, radius: 8000 },
  { city: "Athina", country: "Greece", lat: 37.9838, lng: 23.7275, radius: 8000 },

  // === USA (top cities) ===
  { city: "New York Manhattan", country: "USA", lat: 40.7580, lng: -73.9855, radius: 5000 },
  { city: "New York Brooklyn", country: "USA", lat: 40.6782, lng: -73.9442, radius: 5000 },
  { city: "New York UWS/UES", country: "USA", lat: 40.7831, lng: -73.9712, radius: 5000 },
  { city: "Los Angeles West", country: "USA", lat: 34.0259, lng: -118.4965, radius: 8000 },
  { city: "Los Angeles Hollywood", country: "USA", lat: 34.0928, lng: -118.3287, radius: 8000 },
  { city: "Los Angeles DTLA", country: "USA", lat: 34.0407, lng: -118.2468, radius: 8000 },
  { city: "San Francisco", country: "USA", lat: 37.7749, lng: -122.4194, radius: 8000 },
  { city: "Miami", country: "USA", lat: 25.7617, lng: -80.1918, radius: 8000 },
  { city: "Miami Beach", country: "USA", lat: 25.7907, lng: -80.1300, radius: 5000 },
  { city: "Chicago", country: "USA", lat: 41.8781, lng: -87.6298, radius: 8000 },
  { city: "Austin", country: "USA", lat: 30.2672, lng: -97.7431, radius: 10000 },
  { city: "Denver", country: "USA", lat: 39.7392, lng: -104.9903, radius: 10000 },
  { city: "Seattle", country: "USA", lat: 47.6062, lng: -122.3321, radius: 8000 },
  { city: "Boston", country: "USA", lat: 42.3601, lng: -71.0589, radius: 8000 },
  { city: "Washington DC", country: "USA", lat: 38.9072, lng: -77.0369, radius: 8000 },
  { city: "San Diego", country: "USA", lat: 32.7157, lng: -117.1611, radius: 10000 },
  { city: "Nashville", country: "USA", lat: 36.1627, lng: -86.7816, radius: 10000 },
  { city: "Portland", country: "USA", lat: 45.5152, lng: -122.6784, radius: 8000 },
  { city: "Scottsdale", country: "USA", lat: 33.4942, lng: -111.9261, radius: 8000 },

  // === CANADA ===
  { city: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832, radius: 8000 },
  { city: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207, radius: 8000 },
  { city: "Montreal", country: "Canada", lat: 45.5017, lng: -73.5673, radius: 8000 },

  // === AUSTRALIA ===
  { city: "Sydney CBD", country: "Australia", lat: -33.8688, lng: 151.2093, radius: 5000 },
  { city: "Sydney East", country: "Australia", lat: -33.8900, lng: 151.2600, radius: 5000 },
  { city: "Melbourne", country: "Australia", lat: -37.8136, lng: 144.9631, radius: 8000 },
  { city: "Brisbane", country: "Australia", lat: -27.4698, lng: 153.0251, radius: 8000 },
  { city: "Perth", country: "Australia", lat: -31.9505, lng: 115.8605, radius: 8000 },
  { city: "Gold Coast", country: "Australia", lat: -28.0167, lng: 153.4000, radius: 8000 },

  // === MIDDLE EAST ===
  { city: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, radius: 15000 },
  { city: "Abu Dhabi", country: "UAE", lat: 24.4539, lng: 54.3773, radius: 10000 },
  { city: "Tel Aviv", country: "Israel", lat: 32.0853, lng: 34.7818, radius: 8000 },

  // === ASIA ===
  { city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, radius: 10000 },
  { city: "Hong Kong Central", country: "Hong Kong", lat: 22.2783, lng: 114.1747, radius: 5000 },
  { city: "Tokyo Shibuya", country: "Japan", lat: 35.6580, lng: 139.7016, radius: 5000 },
  { city: "Tokyo Minato", country: "Japan", lat: 35.6581, lng: 139.7514, radius: 5000 },
  { city: "Seoul Gangnam", country: "South Korea", lat: 37.4979, lng: 127.0276, radius: 5000 },
  { city: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, radius: 10000 },
  { city: "Bali Seminyak", country: "Indonesia", lat: -8.6896, lng: 115.1681, radius: 8000 },
  { city: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737, radius: 8000 },

  // === SOUTH AMERICA ===
  { city: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333, radius: 10000 },
  { city: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lng: -43.1729, radius: 8000 },
  { city: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816, radius: 8000 },
  { city: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332, radius: 10000 },
  { city: "Bogota", country: "Colombia", lat: 4.7110, lng: -74.0721, radius: 8000 },

  // === SOUTH AFRICA ===
  { city: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241, radius: 10000 },
  { city: "Johannesburg", country: "South Africa", lat: -26.2041, lng: 28.0473, radius: 10000 },

  // === NEW ZEALAND ===
  { city: "Auckland", country: "New Zealand", lat: -36.8485, lng: 174.7633, radius: 10000 },
];

// --------------- Cost tracking ---------------
const COST_PER_REQUEST = 0.032;
const MAX_BUDGET = 150;
let totalCost = 0;
let totalRequests = 0;

// --------------- Google Places helpers ---------------

async function searchZone(zone: Zone): Promise<any[]> {
  const url = "https://places.googleapis.com/v1/places:searchText";

  const body = {
    textQuery: "pilates",
    locationBias: {
      circle: {
        center: { latitude: zone.lat, longitude: zone.lng },
        radius: zone.radius,
      },
    },
    maxResultCount: 20,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.internationalPhoneNumber,places.regularOpeningHours,places.photos,places.googleMapsUri",
    },
    body: JSON.stringify(body),
  });

  totalRequests++;
  totalCost += COST_PER_REQUEST;

  if (!res.ok) {
    const error = await res.text();
    console.error(`  API error for ${zone.city}, ${zone.country}:`, error);
    return [];
  }

  const data = await res.json();
  return data.places || [];
}

function placeToStudio(place: any, zone: Zone) {
  const neighborhood = `${zone.city}, ${zone.country}`;
  return {
    name: place.displayName?.text || "Unknown",
    neighborhood,
    description: `Pilates studio in ${zone.city}, ${zone.country}`,
    address: place.formattedAddress || null,
    latitude: place.location?.latitude || null,
    longitude: place.location?.longitude || null,
    coordX: null,
    coordY: null,
    price: 0,
    rating: place.rating || 0,
    reviewCount: place.userRatingCount || 0,
    imageUrl: null,
    amenities: [],
  };
}

// Haversine distance in meters
function distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --------------- Main ---------------

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL required");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });
  const db = drizzle(pool, { schema });

  // Get existing studios for deduplication
  const existing = await db
    .select({
      name: schema.studios.name,
      latitude: schema.studios.latitude,
      longitude: schema.studios.longitude,
    })
    .from(schema.studios);
  console.log(`Existing studios in DB: ${existing.length}`);

  let totalNew = 0;
  let totalSkipped = 0;
  const countryStats: Record<string, number> = {};

  console.log(`\nStarting global scrape of ${GLOBAL_ZONES.length} zones...`);
  console.log(`Budget: $${MAX_BUDGET} | Cost per request: $${COST_PER_REQUEST}`);
  console.log(`Max requests before budget hit: ${Math.floor(MAX_BUDGET / COST_PER_REQUEST)}\n`);

  for (let i = 0; i < GLOBAL_ZONES.length; i++) {
    const zone = GLOBAL_ZONES[i];

    // Budget check
    if (totalCost >= MAX_BUDGET) {
      console.log(`\n*** BUDGET LIMIT REACHED: $${totalCost.toFixed(2)} >= $${MAX_BUDGET} ***`);
      console.log(`Stopping at zone ${i + 1}/${GLOBAL_ZONES.length}`);
      break;
    }

    console.log(`[${i + 1}/${GLOBAL_ZONES.length}] ${zone.city}, ${zone.country} (r=${zone.radius}m)`);

    try {
      const places = await searchZone(zone);
      console.log(`  Found ${places.length} places from Google`);
      console.log(`  Cost so far: $${totalCost.toFixed(2)} / $${MAX_BUDGET}`);

      let zoneNew = 0;
      for (const place of places) {
        const studio = placeToStudio(place, zone);

        if (!studio.latitude || !studio.longitude) {
          totalSkipped++;
          continue;
        }

        // Deduplicate: same location (<100m) or close + similar name
        const isDuplicate = existing.some((ex) => {
          if (!ex.latitude || !ex.longitude) return false;
          const dist = distance(
            studio.latitude!,
            studio.longitude!,
            ex.latitude,
            ex.longitude,
          );
          const nameMatch =
            ex.name.toLowerCase().includes(studio.name.toLowerCase().slice(0, 8)) ||
            studio.name.toLowerCase().includes(ex.name.toLowerCase().slice(0, 8));
          return dist < 100 || (dist < 500 && nameMatch);
        });

        if (isDuplicate) {
          totalSkipped++;
          continue;
        }

        try {
          await db.insert(schema.studios).values(studio);
          existing.push({
            name: studio.name,
            latitude: studio.latitude,
            longitude: studio.longitude,
          });
          totalNew++;
          zoneNew++;
          countryStats[zone.country] = (countryStats[zone.country] || 0) + 1;
        } catch (err: any) {
          console.error(`  Failed to insert ${studio.name}:`, err.message);
        }
      }

      console.log(`  Added ${zoneNew} new studios (${totalNew} total new)`);

      // Rate limiting: 300ms between requests
      await new Promise((r) => setTimeout(r, 300));
    } catch (err: any) {
      console.error(`  Error for ${zone.city}, ${zone.country}:`, err.message);
    }
  }

  // --------------- Summary ---------------
  console.log(`\n${"=".repeat(60)}`);
  console.log(`GLOBAL SCRAPE COMPLETE`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Total API requests: ${totalRequests}`);
  console.log(`Total API cost: $${totalCost.toFixed(2)}`);
  console.log(`New studios added: ${totalNew}`);
  console.log(`Duplicates skipped: ${totalSkipped}`);
  console.log(`Total studios in DB now: ${existing.length}`);
  console.log(`\nStudios added per country:`);

  const sorted = Object.entries(countryStats).sort((a, b) => b[1] - a[1]);
  for (const [country, count] of sorted) {
    console.log(`  ${country}: ${count}`);
  }

  await pool.end();
}

main().catch(console.error);
