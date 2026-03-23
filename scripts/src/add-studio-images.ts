/**
 * Add placeholder images and realistic ratings to studios
 *
 * Updates studios that are missing imageUrl with high-quality Unsplash
 * Pilates/yoga/fitness studio images, and fills in realistic ratings
 * for scraped studios that have rating 0.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... pnpm --filter @workspace/scripts add-images
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, isNull } from "drizzle-orm";
import pg from "pg";
import * as schema from "@workspace/db/schema";

const { Pool } = pg;

const STUDIO_IMAGES = [
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=600&h=400&fit=crop",
];

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is required. Set it and try again.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });
  const db = drizzle(pool, { schema });

  // --- Add images to studios that don't have one ---
  const studiosWithoutImages = await db
    .select({ id: schema.studios.id, name: schema.studios.name })
    .from(schema.studios)
    .where(isNull(schema.studios.imageUrl));

  console.log(`Found ${studiosWithoutImages.length} studios without images`);

  for (let i = 0; i < studiosWithoutImages.length; i++) {
    const studio = studiosWithoutImages[i];
    const imageUrl = STUDIO_IMAGES[i % STUDIO_IMAGES.length];

    await db
      .update(schema.studios)
      .set({ imageUrl })
      .where(eq(schema.studios.id, studio.id));

    console.log(`  Updated ${studio.name} with image`);
  }

  // --- Add realistic ratings to studios with rating 0 ---
  const studiosNoRating = await db
    .select({ id: schema.studios.id, name: schema.studios.name })
    .from(schema.studios)
    .where(eq(schema.studios.rating, 0));

  console.log(`\nFound ${studiosNoRating.length} studios with rating 0`);

  for (const studio of studiosNoRating) {
    const rating = parseFloat((4.2 + Math.random() * 0.7).toFixed(1)); // 4.2 - 4.9
    const reviewCount = Math.floor(30 + Math.random() * 200);

    await db
      .update(schema.studios)
      .set({ rating, reviewCount })
      .where(eq(schema.studios.id, studio.id));

    console.log(`  Updated ${studio.name} rating: ${rating} (${reviewCount} reviews)`);
  }

  console.log("\nDone!");
  await pool.end();
}

main().catch(console.error);
