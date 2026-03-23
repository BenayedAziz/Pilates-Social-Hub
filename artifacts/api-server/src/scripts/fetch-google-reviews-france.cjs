/**
 * Fetch Google Place IDs and reviews for all FRENCH studios only.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." GOOGLE_PLACES_API_KEY="AIza..." node fetch-google-reviews-france.cjs
 *
 * Cost tracking (Google Places API New):
 *   - Text Search: $0.032 per request (Basic SKU, only requesting id/displayName/formattedAddress)
 *   - Place Details (reviews field mask): $0.017 per request (Basic SKU)
 */

const DATABASE_URL = process.env.DATABASE_URL;
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
if (!API_KEY) {
  console.error("GOOGLE_PLACES_API_KEY is required");
  process.exit(1);
}

// Cost per API call (USD) — Google Places API (New) Basic SKUs
const TEXT_SEARCH_COST = 0.032;
const PLACE_DETAILS_COST = 0.017;

// French neighborhood filter
const FRENCH_NEIGHBORHOODS_BARE = [
  "Paris",
  "Lyon",
  "Marseille",
  "Bordeaux",
  "Toulouse",
  "Montpellier",
  "Nantes",
  "Rennes",
  "Lille",
  "Strasbourg",
  "Nice",
  "Cannes",
  "Biarritz",
  "Annecy",
  "Bastille",
  "Chatelet",
  "Marais",
  "Montmartre",
  "Pigalle",
  "Oberkampf",
  "Nation",
  "Saint-Germain",
  "Saint-Germain-en-Laye",
  "Boulogne-Billancourt",
  "Levallois-Perret",
  "Neuilly-sur-Seine",
  "Versailles",
  "Monaco, Monaco",
];

let pool;
let textSearchCalls = 0;
let placeDetailsCalls = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function currentCost() {
  return (textSearchCalls * TEXT_SEARCH_COST + placeDetailsCalls * PLACE_DETAILS_COST).toFixed(2);
}

/**
 * Build the WHERE clause for French studios.
 * Returns { text: string, params: any[] }
 */
function frenchWhereClause(tableAlias = "") {
  const prefix = tableAlias ? `${tableAlias}.` : "";
  const params = [...FRENCH_NEIGHBORHOODS_BARE];
  const placeholders = params.map((_, i) => `$${i + 1}`).join(", ");
  return {
    text: `(${prefix}neighborhood LIKE '%, France' OR ${prefix}neighborhood IN (${placeholders}))`,
    params,
  };
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

    textSearchCalls++;

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

    placeDetailsCalls++;

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
  const pgPath = require.resolve("pg", {
    paths: [
      __dirname + "/../../../../lib/db/node_modules",
      __dirname + "/../../../node_modules",
      process.cwd() + "/node_modules",
    ],
  });
  const pg = require(pgPath);
  pool = new pg.Pool({ connectionString: DATABASE_URL });

  console.log("=== Google Reviews Fetch Script (FRANCE ONLY) ===\n");

  const fw = frenchWhereClause();

  // ── Step 1: Find French studios needing a Place ID ────────────────────────
  const needPlaceIdQuery = `
    SELECT id, name, address, neighborhood FROM studios
    WHERE google_place_id IS NULL
      AND address IS NOT NULL
      AND ${fw.text}
    ORDER BY id
  `;
  const { rows: studiosNeedingPlaceId } = await pool.query(needPlaceIdQuery, fw.params);

  console.log(`French studios needing Place ID lookup: ${studiosNeedingPlaceId.length}`);
  console.log(`  Estimated Text Search cost: $${(studiosNeedingPlaceId.length * TEXT_SEARCH_COST).toFixed(2)}\n`);

  let placeIdFound = 0;
  let placeIdFailed = 0;

  for (const studio of studiosNeedingPlaceId) {
    const idx = placeIdFound + placeIdFailed + 1;
    process.stdout.write(
      `  [${idx}/${studiosNeedingPlaceId.length}] ${studio.name} (${studio.neighborhood}, id=${studio.id}) ... `
    );
    const placeId = await findPlaceId(studio.name, studio.address);

    if (placeId) {
      await pool.query("UPDATE studios SET google_place_id = $1 WHERE id = $2", [placeId, studio.id]);
      placeIdFound++;
      console.log(`Found: ${placeId}`);
    } else {
      placeIdFailed++;
      console.log("Not found");
    }

    await sleep(200);

    // Cost guard
    if (parseFloat(currentCost()) >= 25.0) {
      console.warn(`\n  *** BUDGET LIMIT ($25) reached at ${currentCost()}. Stopping. ***`);
      break;
    }
  }

  console.log(`\nPlace ID lookup: ${placeIdFound} found, ${placeIdFailed} not found`);
  console.log(`  Running cost so far: $${currentCost()}\n`);

  // ── Step 2: Fetch reviews for French studios with a Place ID ──────────────
  const fw2 = frenchWhereClause("s");
  const reviewQuery = `
    SELECT s.id, s.name, s.google_place_id, s.neighborhood FROM studios s
    WHERE s.google_place_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM google_reviews gr WHERE gr.studio_id = s.id)
      AND ${fw2.text}
    ORDER BY s.id
  `;
  const { rows: studiosForReviews } = await pool.query(reviewQuery, fw2.params);

  console.log(`French studios needing reviews: ${studiosForReviews.length}`);
  console.log(`  Estimated Place Details cost: $${(studiosForReviews.length * PLACE_DETAILS_COST).toFixed(2)}\n`);

  let totalReviewsFetched = 0;
  let totalReviewsInserted = 0;

  for (let i = 0; i < studiosForReviews.length; i++) {
    const studio = studiosForReviews[i];
    process.stdout.write(
      `  [${i + 1}/${studiosForReviews.length}] ${studio.name} (${studio.neighborhood}, id=${studio.id}) ... `
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
          // Duplicate or null constraint issue; skip silently
        }
      }
    } else {
      console.log("no reviews");
    }

    await sleep(200);

    // Cost guard
    if (parseFloat(currentCost()) >= 25.0) {
      console.warn(`\n  *** BUDGET LIMIT ($25) reached at $${currentCost()}. Stopping reviews fetch. ***`);
      break;
    }
  }

  console.log(`\nReviews: ${totalReviewsFetched} fetched, ${totalReviewsInserted} upserted`);

  // ── Summary ───────────────────────────────────────────────────────────────
  const { rows: [{ count: totalFrenchStudios }] } = await pool.query(
    `SELECT COUNT(*) FROM studios WHERE ${fw.text}`,
    fw.params
  );
  const { rows: [{ count: frenchWithPlaceId }] } = await pool.query(
    `SELECT COUNT(*) FROM studios WHERE google_place_id IS NOT NULL AND ${fw.text}`,
    fw.params
  );
  const { rows: [{ count: totalFrenchReviews }] } = await pool.query(
    `SELECT COUNT(*) FROM google_reviews gr JOIN studios s ON s.id = gr.studio_id WHERE ${fw2.text}`,
    fw2.params
  );

  console.log(`\n=== FINAL SUMMARY ===`);
  console.log(`Total French studios:               ${totalFrenchStudios}`);
  console.log(`French studios with Google Place ID: ${frenchWithPlaceId}`);
  console.log(`Total French Google reviews stored:  ${totalFrenchReviews}`);
  console.log(`---`);
  console.log(`API calls — Text Search:    ${textSearchCalls} ($${(textSearchCalls * TEXT_SEARCH_COST).toFixed(2)})`);
  console.log(`API calls — Place Details:  ${placeDetailsCalls} ($${(placeDetailsCalls * PLACE_DETAILS_COST).toFixed(2)})`);
  console.log(`TOTAL ESTIMATED COST:       $${currentCost()}`);

  await pool.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
