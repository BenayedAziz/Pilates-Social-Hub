/**
 * Batch script: Fetch Google Place IDs and reviews for all studios.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." GOOGLE_PLACES_API_KEY="AIza..." node fetch-google-reviews.cjs
 *
 * Strategy:
 *   1. For studios without a google_place_id, use the Text Search (New) API
 *      to find the place by name + address.
 *   2. For studios with a google_place_id, fetch reviews via Place Details (New).
 *   3. Upsert reviews into the google_reviews table.
 *
 * Rate limiting:
 *   - We throttle to ~5 requests/sec with a 200ms delay between calls.
 *   - The script processes studios in configurable batches (default 500).
 *
 * NOTE: Google's Terms of Service require that cached Place data (including
 * reviews) be refreshed or deleted within 30 days. See TODO.md.
 */

const DATABASE_URL = process.env.DATABASE_URL;
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "500", 10);

if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
if (!API_KEY) {
  console.error("GOOGLE_PLACES_API_KEY is required");
  process.exit(1);
}

// We use dynamic import for pg since it lives in a different node_modules
let pool;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findPlaceId(name, address) {
  const query = `${name} ${address}`;
  const url = "https://places.googleapis.com/v1/places:searchText";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 1,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.warn(`  Text Search API error (${res.status}): ${errorBody}`);
      return null;
    }

    const data = await res.json();
    const places = data.places;
    if (places && places.length > 0) {
      return places[0].id;
    }
    return null;
  } catch (err) {
    console.warn(`  Text Search fetch error: ${err}`);
    return null;
  }
}

async function fetchReviews(placeId) {
  const resourceName = placeId.startsWith("places/") ? placeId : `places/${placeId}`;
  const url = `https://places.googleapis.com/v1/${resourceName}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "reviews",
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.warn(`  Place Details API error (${res.status}): ${errorBody}`);
      return [];
    }

    const data = await res.json();
    const reviews = data.reviews || [];

    return reviews.map((r) => ({
      authorName: (r.authorAttribution && r.authorAttribution.displayName) || "Anonymous",
      authorPhotoUrl: (r.authorAttribution && r.authorAttribution.photoUri) || null,
      rating: r.rating || 0,
      text: (r.text && r.text.text) || null,
      relativeTimeDescription: r.relativePublishTimeDescription || null,
      time: r.publishTime ? Math.floor(new Date(r.publishTime).getTime() / 1000) : null,
      language: (r.text && r.text.languageCode) || null,
    }));
  } catch (err) {
    console.warn(`  Place Details fetch error: ${err}`);
    return [];
  }
}

async function main() {
  // Dynamically require pg from the known location
  const pgPath = require.resolve("pg", {
    paths: [
      __dirname + "/../../../../lib/db/node_modules",
      __dirname + "/../../../node_modules",
      process.cwd() + "/node_modules",
    ],
  });
  const pg = require(pgPath);
  pool = new pg.Pool({ connectionString: DATABASE_URL });

  console.log("=== Google Reviews Fetch Script ===\n");
  console.log(`Batch size: ${BATCH_SIZE}\n`);

  // Step 1: Find studios without a google_place_id
  const { rows: studiosWithoutPlaceId } = await pool.query(
    "SELECT id, name, address FROM studios WHERE google_place_id IS NULL AND address IS NOT NULL ORDER BY id LIMIT $1",
    [BATCH_SIZE]
  );

  console.log(`Studios needing Place ID lookup: ${studiosWithoutPlaceId.length}`);

  let placeIdFound = 0;
  let placeIdFailed = 0;

  for (const studio of studiosWithoutPlaceId) {
    process.stdout.write(
      `  [${placeIdFound + placeIdFailed + 1}/${studiosWithoutPlaceId.length}] ${studio.name} (id=${studio.id}) ... `
    );
    const placeId = await findPlaceId(studio.name, studio.address);

    if (placeId) {
      await pool.query("UPDATE studios SET google_place_id = $1 WHERE id = $2", [placeId, studio.id]);
      placeIdFound++;
      console.log(`Found: ${placeId}`);
    } else {
      placeIdFailed++;
      console.log(`Not found`);
    }

    await sleep(200);
  }

  console.log(`\nPlace ID lookup complete: ${placeIdFound} found, ${placeIdFailed} not found\n`);

  // Step 2: Fetch reviews for studios that have a google_place_id but no reviews yet
  const { rows: studiosWithPlaceId } = await pool.query(
    `SELECT s.id, s.name, s.google_place_id FROM studios s
     WHERE s.google_place_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM google_reviews gr WHERE gr.studio_id = s.id)
     ORDER BY s.id
     LIMIT $1`,
    [BATCH_SIZE]
  );

  console.log(`Studios with Place ID needing reviews: ${studiosWithPlaceId.length}`);

  let totalReviewsFetched = 0;
  let totalReviewsInserted = 0;

  for (let i = 0; i < studiosWithPlaceId.length; i++) {
    const studio = studiosWithPlaceId[i];
    process.stdout.write(
      `  [${i + 1}/${studiosWithPlaceId.length}] ${studio.name} (id=${studio.id}) ... `
    );
    const reviews = await fetchReviews(studio.google_place_id);

    if (reviews.length > 0) {
      console.log(`${reviews.length} reviews`);
      totalReviewsFetched += reviews.length;

      for (const review of reviews) {
        try {
          await pool.query(
            `INSERT INTO google_reviews
             (studio_id, author_name, author_photo_url, rating, text, relative_time_description, time, language, fetched_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
             ON CONFLICT (studio_id, author_name, time) DO UPDATE SET
               rating = EXCLUDED.rating,
               text = EXCLUDED.text,
               relative_time_description = EXCLUDED.relative_time_description,
               author_photo_url = EXCLUDED.author_photo_url,
               fetched_at = NOW()`,
            [
              studio.id,
              review.authorName,
              review.authorPhotoUrl,
              review.rating,
              review.text,
              review.relativeTimeDescription,
              review.time,
              review.language,
            ]
          );
          totalReviewsInserted++;
        } catch (err) {
          // Duplicate or null constraint issue; skip
        }
      }
    } else {
      console.log(`no reviews`);
    }

    await sleep(200);
  }

  console.log(`\nReview fetch complete: ${totalReviewsFetched} fetched, ${totalReviewsInserted} upserted`);

  // Summary
  const {
    rows: [{ count: totalStudios }],
  } = await pool.query("SELECT COUNT(*) FROM studios");
  const {
    rows: [{ count: studiosWithGoogleId }],
  } = await pool.query("SELECT COUNT(*) FROM studios WHERE google_place_id IS NOT NULL");
  const {
    rows: [{ count: totalGoogleReviews }],
  } = await pool.query("SELECT COUNT(*) FROM google_reviews");

  console.log(`\n=== Summary ===`);
  console.log(`Total studios: ${totalStudios}`);
  console.log(`Studios with Google Place ID: ${studiosWithGoogleId}`);
  console.log(`Total Google reviews stored: ${totalGoogleReviews}`);

  await pool.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
