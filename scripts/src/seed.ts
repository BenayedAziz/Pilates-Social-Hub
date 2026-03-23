/**
 * Database Seed Script
 *
 * Populates the PostgreSQL database with the same mock data used by the
 * in-memory fallback in each API route. Idempotent: uses onConflictDoNothing()
 * so running it multiple times is safe.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... pnpm --filter @workspace/scripts seed
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@workspace/db/schema";

const { Pool } = pg;

async function seed() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is required. Set it and try again.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });
  const db = drizzle(pool, { schema });

  console.log("Seeding database...\n");

  // ---- Users ----
  console.log("  Seeding users...");
  await db
    .insert(schema.users)
    .values([
      {
        email: "emma@example.com",
        username: "emma_d",
        displayName: "Emma D",
        bio: "Reformer enthusiast based in Le Marais. 3x per week.",
        level: "advanced",
      },
      {
        email: "lucas@example.com",
        username: "lucas_m",
        displayName: "Lucas M",
        bio: "Mat Pilates lover and aspiring instructor.",
        level: "intermediate",
      },
      {
        email: "sophie@example.com",
        username: "sophie_b",
        displayName: "Sophie B",
        bio: "Just started my Pilates journey!",
        level: "beginner",
      },
      {
        email: "alex@example.com",
        username: "alex_r",
        displayName: "Alex R",
        bio: null,
        level: "intermediate",
      },
      {
        email: "marie@example.com",
        username: "marie_c",
        displayName: "Marie C",
        bio: null,
        level: "advanced",
      },
      {
        email: "pierre@example.com",
        username: "pierre_t",
        displayName: "Pierre T",
        bio: null,
        level: "beginner",
      },
      {
        email: "isabelle@example.com",
        username: "isabelle_f",
        displayName: "Isabelle F",
        bio: null,
        level: "advanced",
      },
      {
        email: "thomas@example.com",
        username: "thomas_g",
        displayName: "Thomas G",
        bio: null,
        level: "beginner",
      },
      {
        email: "lea@example.com",
        username: "lea_n",
        displayName: "Lea N",
        bio: null,
        level: "intermediate",
      },
      {
        email: "hugo@example.com",
        username: "hugo_p",
        displayName: "Hugo P",
        bio: null,
        level: "intermediate",
      },
    ])
    .onConflictDoNothing();

  // ---- Studios ----
  console.log("  Seeding studios...");
  await db
    .insert(schema.studios)
    .values([
      {
        name: "Studio Harmonie",
        neighborhood: "Marais",
        description:
          "A serene reformer studio nestled in the heart of Le Marais, offering both beginner and advanced classes with world-class equipment.",
        address: "12 Rue de Rivoli, 75004 Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        coordX: 30,
        coordY: 40,
        price: 45,
        rating: 4.9,
        reviewCount: 234,
        amenities: ["Showers", "Lockers", "Towels"],
      },
      {
        name: "Pilates Lumiere",
        neighborhood: "Saint-Germain",
        description:
          "Premium boutique studio with panoramic views of Saint-Germain-des-Pres. Specialising in Cadillac and Reformer work.",
        address: "45 Boulevard Saint-Germain, 75005 Paris",
        latitude: 48.8531,
        longitude: 2.3469,
        coordX: 45,
        coordY: 60,
        price: 55,
        rating: 4.8,
        reviewCount: 189,
        amenities: ["Showers", "Towels", "Cafe"],
      },
      {
        name: "Core & Flow",
        neighborhood: "Montmartre",
        description:
          "Community-driven studio at the base of Montmartre. Affordable classes for all levels, with a welcoming and diverse atmosphere.",
        address: "78 Rue des Abbesses, 75018 Paris",
        latitude: 48.8844,
        longitude: 2.3384,
        coordX: 60,
        coordY: 20,
        price: 38,
        rating: 4.7,
        reviewCount: 312,
        amenities: ["Lockers", "Water Station"],
      },
      {
        name: "Reform Studio Paris",
        neighborhood: "Bastille",
        description:
          "Modern industrial-chic studio with the latest Balanced Body equipment. Strong focus on strength and technique.",
        address: "23 Rue de la Roquette, 75011 Paris",
        latitude: 48.8534,
        longitude: 2.3711,
        coordX: 75,
        coordY: 50,
        price: 50,
        rating: 4.6,
        reviewCount: 156,
        amenities: ["Showers", "Lockers", "Parking"],
      },
      {
        name: "Equilibre Pilates",
        neighborhood: "Pigalle",
        description:
          "A hidden gem in Pigalle offering intimate group classes and private sessions. Specialises in mat and chair work.",
        address: "9 Rue Frochot, 75009 Paris",
        latitude: 48.8808,
        longitude: 2.3375,
        coordX: 50,
        coordY: 30,
        price: 42,
        rating: 4.5,
        reviewCount: 98,
        amenities: ["Towels", "Tea Bar"],
      },
      {
        name: "Le Studio Reformer",
        neighborhood: "Oberkampf",
        description:
          "The most affordable reformer studio in Paris without sacrificing quality. Popular with young professionals in the 11th.",
        address: "55 Rue Oberkampf, 75011 Paris",
        latitude: 48.8656,
        longitude: 2.3794,
        coordX: 80,
        coordY: 70,
        price: 35,
        rating: 4.4,
        reviewCount: 203,
        amenities: ["Lockers", "Water Station"],
      },
      {
        name: "Pilates Zen",
        neighborhood: "Nation",
        description:
          "Zen-inspired studio combining traditional Pilates with mindfulness practices. Unique breath-work integration.",
        address: "18 Avenue du Trone, 75012 Paris",
        latitude: 48.8486,
        longitude: 2.3963,
        coordX: 90,
        coordY: 80,
        price: 48,
        rating: 4.8,
        reviewCount: 127,
        amenities: ["Showers", "Meditation Room", "Towels"],
      },
      {
        name: "BodyWork Pilates",
        neighborhood: "Chatelet",
        description:
          "The most acclaimed studio in Paris, trusted by professional dancers and athletes. Extensive class schedule all week.",
        address: "3 Rue des Halles, 75001 Paris",
        latitude: 48.8606,
        longitude: 2.3476,
        coordX: 40,
        coordY: 50,
        price: 60,
        rating: 4.9,
        reviewCount: 445,
        amenities: ["Showers", "Lockers", "Towels", "Cafe", "Sauna"],
      },
    ])
    .onConflictDoNothing();

  // ---- Coaches ----
  console.log("  Seeding coaches...");
  await db
    .insert(schema.coaches)
    .values([
      { studioId: 1, name: "Sophie Leclerc", specialties: ["Reformer", "Advanced"], bio: "10 years of teaching experience." },
      { studioId: 1, name: "Julien Moreau", specialties: ["Spine Corrector", "Intermediate"], bio: "Former dancer turned Pilates instructor." },
      { studioId: 2, name: "Marie Dubois", specialties: ["Cadillac", "Beginner"], bio: "Certified BASI Pilates instructor." },
      { studioId: 2, name: "Antoine Petit", specialties: ["Reformer", "Intermediate"], bio: null },
      { studioId: 3, name: "Camille Bernard", specialties: ["Mat", "Core"], bio: "Community fitness leader." },
      { studioId: 3, name: "Lucas Fontaine", specialties: ["Mat", "Beginner"], bio: null },
      { studioId: 4, name: "Isabelle Dupont", specialties: ["Chair", "Advanced"], bio: "Strength and conditioning specialist." },
      { studioId: 4, name: "Marc Rousseau", specialties: ["Reformer", "Technique"], bio: null },
      { studioId: 5, name: "Elise Martin", specialties: ["Reformer", "Flow"], bio: "Mind-body connection advocate." },
      { studioId: 5, name: "Pierre Garnier", specialties: ["Mat", "Classical"], bio: null },
      { studioId: 6, name: "Nathalie Simon", specialties: ["Reformer"], bio: null },
      { studioId: 6, name: "Florent Legrand", specialties: ["Mat"], bio: null },
      { studioId: 7, name: "Audrey Girard", specialties: ["Reformer", "Breath-work"], bio: "Unique breath-work integration specialist." },
      { studioId: 7, name: "Thomas Chevalier", specialties: ["Reformer", "Cardio"], bio: null },
      { studioId: 8, name: "Celine Blanc", specialties: ["Tower", "Reformer", "Advanced"], bio: "Works with professional dancers and athletes." },
      { studioId: 8, name: "Raphael Dumas", specialties: ["Reformer"], bio: null },
    ])
    .onConflictDoNothing();

  // ---- Classes ----
  console.log("  Seeding classes...");
  await db
    .insert(schema.classes)
    .values([
      { studioId: 1, coachId: 1, title: "Reformer Advanced", type: "reformer", level: "advanced", description: "Challenging reformer class focusing on dynamic movements and spring resistance.", duration: 55, maxCapacity: 10, price: 45, scheduledAt: new Date("2026-03-23T09:00:00Z") },
      { studioId: 3, coachId: 5, title: "Mat Pilates Core", type: "mat", level: "intermediate", description: "Core-focused mat class with props including resistance bands and Pilates balls.", duration: 45, maxCapacity: 15, price: 38, scheduledAt: new Date("2026-03-23T10:30:00Z") },
      { studioId: 2, coachId: 3, title: "Cadillac Intro", type: "cadillac", level: "beginner", description: "Introduction to the Cadillac apparatus. Perfect for newcomers and those working with injuries.", duration: 60, maxCapacity: 6, price: 55, scheduledAt: new Date("2026-03-23T11:00:00Z") },
      { studioId: 4, coachId: 7, title: "Wunda Chair Blast", type: "chair", level: "advanced", description: "High-intensity chair class designed to build strength and balance.", duration: 45, maxCapacity: 8, price: 50, scheduledAt: new Date("2026-03-23T14:00:00Z") },
      { studioId: 5, coachId: 9, title: "Reformer Flow", type: "reformer", level: "intermediate", description: "Flowing reformer sequences linking breath with movement for a mind-body workout.", duration: 50, maxCapacity: 12, price: 42, scheduledAt: new Date("2026-03-23T16:00:00Z") },
      { studioId: 1, coachId: 2, title: "Spine Corrector", type: "spine-corrector", level: "intermediate", description: "Work with the Spine Corrector to improve spinal articulation and flexibility.", duration: 40, maxCapacity: 8, price: 45, scheduledAt: new Date("2026-03-24T09:00:00Z") },
      { studioId: 8, coachId: 15, title: "Tower & Reformer", type: "reformer", level: "advanced", description: "Dual apparatus class alternating between Tower and Reformer for a full-body challenge.", duration: 75, maxCapacity: 8, price: 60, scheduledAt: new Date("2026-03-24T10:00:00Z") },
      { studioId: 3, coachId: 6, title: "Mat Beginner", type: "mat", level: "beginner", description: "Gentle introduction to classical Pilates mat work. No equipment needed.", duration: 50, maxCapacity: 20, price: 38, scheduledAt: new Date("2026-03-24T11:30:00Z") },
      { studioId: 7, coachId: 13, title: "Reformer Cardio", type: "reformer", level: "intermediate", description: "High-energy reformer class with cardio intervals. Expect to sweat!", duration: 45, maxCapacity: 10, price: 48, scheduledAt: new Date("2026-03-24T14:00:00Z") },
      { studioId: 5, coachId: 10, title: "Classical Mat", type: "mat", level: "intermediate", description: "Traditional Joseph Pilates mat sequence performed in its original order.", duration: 60, maxCapacity: 15, price: 42, scheduledAt: new Date("2026-03-24T17:00:00Z") },
    ])
    .onConflictDoNothing();

  // ---- Products ----
  console.log("  Seeding products...");
  await db
    .insert(schema.products)
    .values([
      { name: "Premium Grip Socks", brand: "ToeSox", description: "Non-slip Pilates socks with full-toe design for maximum grip on reformer and mat.", price: 18, rating: 4.8, category: "Accessories" },
      { name: "Reformer Straps", brand: "Balanced Body", description: "Padded reformer loop straps for comfortable and secure hand/foot placement.", price: 45, rating: 4.9, category: "Equipment" },
      { name: "Pilates Ring", brand: "STOTT", description: "14-inch magic circle with padded handles for inner/outer thigh and arm toning.", price: 28, rating: 4.6, category: "Equipment" },
      { name: "Cork Yoga Mat", brand: "Manduka", description: "Eco-friendly cork surface with natural rubber base. 5mm thick for joint cushioning.", price: 89, rating: 4.7, category: "Mats" },
      { name: "Resistance Band Set", brand: "TheraBand", description: "Set of 5 colour-coded bands from light to extra-heavy resistance.", price: 32, rating: 4.5, category: "Equipment" },
      { name: "Foam Roller", brand: "TriggerPoint", description: "GRID pattern foam roller for deep-tissue myofascial release and recovery.", price: 35, rating: 4.8, category: "Recovery" },
      { name: "Pilates Ball 9\"", brand: "OPTP", description: "Soft, inflatable mini stability ball for core engagement and alignment work.", price: 12, rating: 4.4, category: "Equipment" },
      { name: "Grip Gloves", brand: "Gaiam", description: "Fingerless grip gloves with silicone dots for improved equipment handling.", price: 22, rating: 4.3, category: "Accessories" },
      { name: "Spine Corrector", brand: "Peak Pilates", description: "Professional-grade spine corrector for back extension and abdominal work.", price: 195, rating: 4.9, category: "Equipment" },
      { name: "Workout Leggings", brand: "Lululemon", description: "High-waist Align leggings with four-way stretch and moisture-wicking fabric.", price: 98, rating: 4.7, category: "Apparel" },
      { name: "Sports Bra", brand: "Alo Yoga", description: "Medium-support sports bra with breathable mesh panels and removable cups.", price: 68, rating: 4.6, category: "Apparel" },
      { name: "Water Bottle", brand: "Hydro Flask", description: "24oz insulated stainless steel bottle keeps water cold for 24 hours.", price: 42, rating: 4.8, category: "Accessories" },
      { name: "Massage Gun", brand: "Theragun", description: "Percussive therapy device with 5 speed settings and 4 attachment heads.", price: 299, rating: 4.9, category: "Recovery" },
      { name: "Jump Board", brand: "Balanced Body", description: "Reformer jump board attachment for low-impact cardio and plyometric training.", price: 245, rating: 4.7, category: "Equipment" },
      { name: "Towel Set", brand: "Manduka", description: "Microfiber towel set (small + large) with quick-dry and anti-bacterial properties.", price: 36, rating: 4.5, category: "Accessories" },
      { name: "Ankle Weights", brand: "Bala", description: "Stylish 1lb wrist/ankle weights with adjustable strap closure.", price: 55, rating: 4.6, category: "Equipment" },
      { name: "Pilates Box", brand: "STOTT", description: "Foam sitting box for reformer - used for seated, prone, and side-lying exercises.", price: 85, rating: 4.4, category: "Equipment" },
      { name: "Tank Top", brand: "Beyond Yoga", description: "Lightweight tank with open back design for breathability during class.", price: 58, rating: 4.5, category: "Apparel" },
      { name: "Stretching Strap", brand: "ProsourceFit", description: "10-loop stretching strap for flexibility training and assisted stretches.", price: 14, rating: 4.3, category: "Equipment" },
      { name: "Gym Bag", brand: "Lululemon", description: "Spacious duffle bag with separate shoe compartment and yoga mat straps.", price: 128, rating: 4.7, category: "Accessories" },
    ])
    .onConflictDoNothing();

  // ---- Social Feed Posts ----
  console.log("  Seeding feed posts...");
  await db
    .insert(schema.posts)
    .values([
      { userId: 1, type: "Reformer Advanced", studio: "Studio Harmonie", duration: 55, calories: 320 },
      { userId: 2, type: "Mat Pilates Core", studio: "Core & Flow", duration: 45, calories: 250 },
      { userId: 3, type: "Cadillac Intro", studio: "Pilates Lumiere", duration: 60, calories: 290 },
      { userId: 4, type: "Wunda Chair Blast", studio: "Reform Studio Paris", duration: 45, calories: 310 },
      { userId: 5, type: "Reformer Flow", studio: "Equilibre Pilates", duration: 50, calories: 275 },
      { userId: 6, type: "Spine Corrector", studio: "Studio Harmonie", duration: 40, calories: 200 },
      { userId: 7, type: "Tower & Reformer", studio: "BodyWork Pilates", duration: 75, calories: 410 },
      { userId: 8, type: "Mat Beginner", studio: "Core & Flow", duration: 50, calories: 220 },
      { userId: 9, type: "Reformer Cardio", studio: "Pilates Zen", duration: 45, calories: 350 },
      { userId: 10, type: "Classical Mat", studio: "Equilibre Pilates", duration: 60, calories: 240 },
    ])
    .onConflictDoNothing();

  // ---- Forum Posts ----
  console.log("  Seeding forum posts...");
  await db
    .insert(schema.forumPosts)
    .values([
      { userId: 1, title: "Best reformer studio for beginners in Paris?", body: "I just moved to Paris and I'm looking for a studio that's beginner-friendly. Budget is around 40-50 EUR per class. Any recommendations in the central arrondissements?", category: "Recommendations", flair: "Question" },
      { userId: 2, title: "My 6-month Pilates transformation - before & after", body: "When I started last September I could barely do a roll-up. Now I'm doing advanced reformer 3x a week. Here's what changed for me...", category: "Progress", flair: "Inspiration" },
      { userId: 3, title: "Reformer vs Mat: Which gives better results?", body: "I've been doing mat Pilates for two years and I'm curious about trying the reformer. For those who've done both, which gave you better results and why?", category: "Discussion", flair: "Debate" },
      { userId: 4, title: "Studio Harmonie just added new Balanced Body reformers!", body: "Heads up for Studio Harmonie regulars - they just replaced all their reformers with the new Balanced Body Allegro 2 series. They feel amazing!", category: "News", flair: "Update" },
      { userId: 5, title: "Tips for managing lower back pain during roll-ups", body: "I keep getting lower back pain during roll-ups. My instructor says my core isn't engaged enough but I'm struggling to feel the right muscles. Any tips or cues that helped you?", category: "Technique", flair: "Help" },
      { userId: 6, title: "Weekly challenge: 5 classes in 7 days - who's in?", body: "Starting Monday I'm going to try 5 classes in 7 days. Mix of reformer and mat. Who wants to join me for accountability?", category: "Challenges", flair: "Challenge" },
      { userId: 7, title: "The science behind Pilates and core stability", body: "I found a really interesting research paper from the Journal of Bodywork and Movement Therapies about how Pilates improves core stability. Sharing the key takeaways...", category: "Education", flair: "Article" },
      { userId: 8, title: "Found an amazing grip sock brand - half the price!", body: "I've been buying ToeSox for years but just discovered a French brand called GripParis that's half the price with similar quality. Link in comments.", category: "Gear", flair: "Review" },
      { userId: 9, title: "Pilates Zen instructor spotlight: Audrey Girard", body: "I've been taking classes with Audrey at Pilates Zen for six months and she's genuinely one of the best instructors in Paris. Her breath-work integration is unlike anything else.", category: "Community", flair: "Feature" },
      { userId: 10, title: "How often should you do Pilates per week?", body: "I've read conflicting advice - some say 2-3x per week is optimal, others say daily is fine. What's your experience and what do your instructors recommend?", category: "Discussion", flair: "Question" },
    ])
    .onConflictDoNothing();

  // ---- Bookings (for user 1) ----
  console.log("  Seeding bookings...");
  await db
    .insert(schema.bookings)
    .values([
      { userId: 1, classId: 1, studioId: 1, status: "confirmed", timeSlot: "09:00" },
      { userId: 1, classId: 5, studioId: 5, status: "confirmed", timeSlot: "16:00" },
      { userId: 1, classId: 3, studioId: 2, status: "completed", timeSlot: "11:00" },
    ])
    .onConflictDoNothing();

  // ---- Some sample post likes for realism ----
  console.log("  Seeding post likes...");
  await db
    .insert(schema.postLikes)
    .values([
      { postId: 1, userId: 2 },
      { postId: 1, userId: 3 },
      { postId: 3, userId: 1 },
      { postId: 3, userId: 2 },
      { postId: 5, userId: 1 },
      { postId: 7, userId: 1 },
      { postId: 7, userId: 2 },
      { postId: 7, userId: 3 },
    ])
    .onConflictDoNothing();

  // ---- Some sample forum votes ----
  console.log("  Seeding forum votes...");
  await db
    .insert(schema.forumVotes)
    .values([
      { forumPostId: 1, userId: 2, direction: "up" },
      { forumPostId: 1, userId: 3, direction: "up" },
      { forumPostId: 2, userId: 1, direction: "up" },
      { forumPostId: 2, userId: 3, direction: "up" },
      { forumPostId: 3, userId: 1, direction: "up" },
      { forumPostId: 5, userId: 1, direction: "up" },
      { forumPostId: 7, userId: 1, direction: "up" },
      { forumPostId: 7, userId: 2, direction: "up" },
    ])
    .onConflictDoNothing();

  // ---- Badges ----
  console.log("  Seeding badges...");
  await db
    .insert(schema.badges)
    .values([
      { name: "First Class", description: "Complete your first Pilates class", iconName: "trophy", criteria: { sessions: 1 } },
      { name: "Dedicated", description: "Complete 10 classes", iconName: "flame", criteria: { sessions: 10 } },
      { name: "Century Club", description: "Complete 100 classes", iconName: "medal", criteria: { sessions: 100 } },
      { name: "Reviewer", description: "Leave your first studio review", iconName: "star", criteria: { reviews: 1 } },
      { name: "Social Butterfly", description: "Make 5 forum posts", iconName: "message-circle", criteria: { forumPosts: 5 } },
    ])
    .onConflictDoNothing();

  console.log("\nSeed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
