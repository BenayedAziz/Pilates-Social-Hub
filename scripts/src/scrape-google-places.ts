/**
 * Google Places API Studio Scraper
 *
 * Fetches real Pilates studios across France using the Google Places
 * Text Search (New) API, deduplicates against existing DB entries,
 * and inserts them into the PilatesHub `studios` table.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... pnpm --filter @workspace/scripts scrape-google
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@workspace/db/schema";

const { Pool } = pg;

const API_KEY = "AIzaSyDIpbw6XKNXlwYnbsCFEXvZP34KFQs5kC8";

interface City {
  name: string;
  lat: number;
  lng: number;
  radius: number; // meters
}

const FRENCH_CITIES: City[] = [
  { name: "Paris", lat: 48.8566, lng: 2.3522, radius: 15000 },
  { name: "Lyon", lat: 45.764, lng: 4.8357, radius: 10000 },
  { name: "Marseille", lat: 43.2965, lng: 5.3698, radius: 10000 },
  { name: "Bordeaux", lat: 44.8378, lng: -0.5792, radius: 10000 },
  { name: "Toulouse", lat: 43.6047, lng: 1.4442, radius: 10000 },
  { name: "Nice", lat: 43.7102, lng: 7.262, radius: 10000 },
  { name: "Nantes", lat: 47.2184, lng: -1.5536, radius: 10000 },
  { name: "Strasbourg", lat: 48.5734, lng: 7.7521, radius: 10000 },
  { name: "Montpellier", lat: 43.6108, lng: 3.8767, radius: 10000 },
  { name: "Lille", lat: 50.6292, lng: 3.0573, radius: 10000 },
  { name: "Rennes", lat: 48.1173, lng: -1.6778, radius: 8000 },
  { name: "Aix-en-Provence", lat: 43.5297, lng: 5.4474, radius: 8000 },
  { name: "Cannes", lat: 43.5528, lng: 7.0174, radius: 8000 },
  { name: "Annecy", lat: 45.8992, lng: 6.1294, radius: 8000 },
  { name: "Biarritz", lat: 43.4832, lng: -1.5586, radius: 8000 },
  { name: "Versailles", lat: 48.8014, lng: 2.1301, radius: 8000 },
  { name: "Neuilly-sur-Seine", lat: 48.8848, lng: 2.2691, radius: 5000 },
  { name: "Boulogne-Billancourt", lat: 48.8397, lng: 2.2399, radius: 5000 },
  { name: "Levallois-Perret", lat: 48.8935, lng: 2.2882, radius: 5000 },
  { name: "Saint-Germain-en-Laye", lat: 48.8986, lng: 2.0938, radius: 5000 },
];

// Use Google Places Text Search (New) API
async function searchCity(city: City): Promise<any[]> {
  const url = "https://places.googleapis.com/v1/places:searchText";

  const body = {
    textQuery: "pilates studio",
    locationBias: {
      circle: {
        center: { latitude: city.lat, longitude: city.lng },
        radius: city.radius,
      },
    },
    languageCode: "fr",
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

  if (!res.ok) {
    const error = await res.text();
    console.error(`  API error for ${city.name}:`, error);
    return [];
  }

  const data = await res.json();
  return data.places || [];
}

function placeToStudio(place: any, city: string) {
  return {
    name: place.displayName?.text || "Unknown",
    neighborhood: city,
    description: `Pilates studio in ${city}`,
    address: place.formattedAddress || null,
    latitude: place.location?.latitude || null,
    longitude: place.location?.longitude || null,
    coordX: null,
    coordY: null,
    price: 0, // Will be enriched later
    rating: place.rating || 0,
    reviewCount: place.userRatingCount || 0,
    imageUrl: null, // Will be added separately
    amenities: [],
  };
}

// Haversine distance for deduplication
function distance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
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

  for (const city of FRENCH_CITIES) {
    console.log(`\nSearching ${city.name}...`);

    try {
      const places = await searchCity(city);
      console.log(`  Found ${places.length} places from Google`);

      for (const place of places) {
        const studio = placeToStudio(place, city.name);

        if (!studio.latitude || !studio.longitude) {
          totalSkipped++;
          continue;
        }

        // Check for duplicate (same name or very close location)
        const isDuplicate = existing.some((ex) => {
          if (!ex.latitude || !ex.longitude) return false;
          const dist = distance(
            studio.latitude!,
            studio.longitude!,
            ex.latitude,
            ex.longitude,
          );
          const nameMatch =
            ex.name
              .toLowerCase()
              .includes(studio.name.toLowerCase().slice(0, 8)) ||
            studio.name
              .toLowerCase()
              .includes(ex.name.toLowerCase().slice(0, 8));
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
          console.log(
            `  + ${studio.name} (${studio.rating}★, ${studio.reviewCount} reviews)`,
          );
        } catch (err: any) {
          console.error(`  Failed to insert ${studio.name}:`, err.message);
        }
      }

      // Rate limit: wait 500ms between cities
      await new Promise((r) => setTimeout(r, 500));
    } catch (err: any) {
      console.error(`  Error for ${city.name}:`, err.message);
    }
  }

  console.log(`\n=== Done! ===`);
  console.log(`New studios added: ${totalNew}`);
  console.log(`Duplicates skipped: ${totalSkipped}`);
  console.log(`Total in DB now: ${existing.length}`);

  await pool.end();
}

main().catch(console.error);
