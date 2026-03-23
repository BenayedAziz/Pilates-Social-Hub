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
      { name: "First Session", description: "Complete your very first Pilates session", iconName: "trophy", criteria: { sessions: 1 } },
      { name: "7-Day Streak", description: "Attend a class every day for 7 days straight", iconName: "flame", criteria: { streak: 7 } },
      { name: "100 Sessions", description: "Complete 100 Pilates sessions", iconName: "medal", criteria: { sessions: 100 } },
      { name: "Calorie Crusher", description: "Burn over 500 calories in a single session", iconName: "zap", criteria: { caloriesInSession: 500 } },
      { name: "Early Bird", description: "Attend 10 classes before 8 AM", iconName: "sunrise", criteria: { earlyClasses: 10 } },
      { name: "Social Butterfly", description: "Make 5 forum posts and follow 10 people", iconName: "message-circle", criteria: { forumPosts: 5, follows: 10 } },
    ])
    .onConflictDoNothing();

  // ---- User Badges ----
  console.log("  Seeding user badges...");
  await db
    .insert(schema.userBadges)
    .values([
      // Emma (advanced) has earned First Session, 7-Day Streak, Calorie Crusher
      { userId: 1, badgeId: 1 },
      { userId: 1, badgeId: 2 },
      { userId: 1, badgeId: 4 },
      // Lucas (intermediate) has earned First Session
      { userId: 2, badgeId: 1 },
      // Sophie (beginner) has earned First Session
      { userId: 3, badgeId: 1 },
      // Marie (advanced) has earned First Session, 7-Day Streak, 100 Sessions, Early Bird
      { userId: 5, badgeId: 1 },
      { userId: 5, badgeId: 2 },
      { userId: 5, badgeId: 3 },
      { userId: 5, badgeId: 5 },
      // Isabelle (advanced) has earned First Session, Calorie Crusher
      { userId: 7, badgeId: 1 },
      { userId: 7, badgeId: 4 },
      // Lea (intermediate) has earned First Session, Social Butterfly
      { userId: 9, badgeId: 1 },
      { userId: 9, badgeId: 6 },
    ])
    .onConflictDoNothing();

  // ---- Reviews ----
  console.log("  Seeding reviews...");
  await db
    .insert(schema.reviews)
    .values([
      // Studio Harmonie (id 1)
      { userId: 1, studioId: 1, rating: 5, text: "Mon studio prefere a Paris! Les reformers Balanced Body sont impeccables et Sophie est une instructrice exceptionnelle. Chaque cours est un vrai moment de bien-etre." },
      { userId: 3, studioId: 1, rating: 5, text: "Perfect for beginners like me. The staff took the time to explain every movement and I never felt lost. The Marais location is so convenient." },
      { userId: 5, studioId: 1, rating: 4, text: "Great studio with top-notch equipment. Only giving 4 stars because peak-hour classes fill up very fast and the booking system could be improved." },
      // Pilates Lumiere (id 2)
      { userId: 2, studioId: 2, rating: 5, text: "The Cadillac classes here are unlike anything else in Paris. Marie Dubois is incredibly knowledgeable and the Saint-Germain views are a bonus." },
      { userId: 4, studioId: 2, rating: 4, text: "Premium experience at a premium price, but worth it. The cafe downstairs serves great matcha lattes after class." },
      { userId: 7, studioId: 2, rating: 5, text: "I've tried many studios across Paris and Pilates Lumiere is consistently the best for Cadillac work. The instructors really know their craft." },
      // Core & Flow (id 3)
      { userId: 6, studioId: 3, rating: 5, text: "L'ambiance communautaire est incroyable. Les prix sont accessibles et les cours sont tout aussi bons que dans les studios plus chers." },
      { userId: 8, studioId: 3, rating: 4, text: "Love the community vibe here. The mat classes are well-structured and Camille makes everyone feel welcome. Wish they had showers though." },
      { userId: 10, studioId: 3, rating: 5, text: "Best value Pilates in Paris, hands down. The Montmartre neighborhood is lovely for a post-class walk." },
      // Reform Studio Paris (id 4)
      { userId: 1, studioId: 4, rating: 4, text: "The industrial-chic space is gorgeous and the equipment is brand new. Isabelle's chair classes are seriously challenging in the best way." },
      { userId: 9, studioId: 4, rating: 5, text: "If you want a serious strength-focused Pilates workout, this is the place. Marc's reformer technique class completely changed my practice." },
      // Equilibre Pilates (id 5)
      { userId: 2, studioId: 5, rating: 4, text: "Hidden gem in Pigalle. Small class sizes mean lots of personal attention. The tea bar after class is such a nice touch." },
      { userId: 5, studioId: 5, rating: 5, text: "Elise's Reformer Flow class is pure magic. The way she sequences movements with breath is unlike any other instructor I've had." },
      // Le Studio Reformer (id 6)
      { userId: 3, studioId: 6, rating: 4, text: "Affordable reformer classes without sacrificing quality. Great for students and young professionals in the 11th." },
      { userId: 8, studioId: 6, rating: 4, text: "Good value for the price. The instructors are competent and the studio is clean. Could use better ventilation during busy classes." },
      // Pilates Zen (id 7)
      { userId: 4, studioId: 7, rating: 5, text: "The mindfulness integration sets Pilates Zen apart from every other studio. Audrey's breath-work classes have helped my anxiety enormously." },
      { userId: 6, studioId: 7, rating: 5, text: "This studio changed my relationship with exercise. It's not just a workout, it's a meditation. The zen atmosphere is genuine, not gimmicky." },
      { userId: 9, studioId: 7, rating: 4, text: "Beautiful space and unique approach. The meditation room is a wonderful addition. A bit far from central Paris but worth the trip." },
      // BodyWork Pilates (id 8)
      { userId: 7, studioId: 8, rating: 5, text: "The gold standard of Pilates in Paris. Celine works with professional dancers and it shows in every cue she gives. The sauna is a great recovery bonus." },
      { userId: 10, studioId: 8, rating: 5, text: "Expensive but you get what you pay for. The Tower & Reformer class is the best workout I've ever had. The instructors here are on another level." },
    ])
    .onConflictDoNothing();

  // ---- Follows ----
  console.log("  Seeding follows...");
  await db
    .insert(schema.follows)
    .values([
      // Emma follows Lucas, Sophie, Marie
      { followerId: 1, followingId: 2 },
      { followerId: 1, followingId: 3 },
      { followerId: 1, followingId: 5 },
      // Lucas follows Emma, Alex
      { followerId: 2, followingId: 1 },
      { followerId: 2, followingId: 4 },
      // Sophie follows Emma, Lucas, Isabelle
      { followerId: 3, followingId: 1 },
      { followerId: 3, followingId: 2 },
      { followerId: 3, followingId: 7 },
      // Alex follows Emma
      { followerId: 4, followingId: 1 },
      // Marie follows Emma, Isabelle, Lea
      { followerId: 5, followingId: 1 },
      { followerId: 5, followingId: 7 },
      { followerId: 5, followingId: 9 },
      // Pierre follows Sophie
      { followerId: 6, followingId: 3 },
      // Isabelle follows Marie, Emma
      { followerId: 7, followingId: 5 },
      { followerId: 7, followingId: 1 },
      // Lea follows Hugo, Emma
      { followerId: 9, followingId: 10 },
      { followerId: 9, followingId: 1 },
      // Hugo follows Lea
      { followerId: 10, followingId: 9 },
    ])
    .onConflictDoNothing();

  // ---- Forum Comments ----
  console.log("  Seeding forum comments...");
  await db
    .insert(schema.forumComments)
    .values([
      { forumPostId: 1, userId: 5, content: "I'd highly recommend Studio Harmonie in Le Marais! Sophie's beginner-friendly reformer classes are excellent and it's around 45 EUR per class." },
      { forumPostId: 1, userId: 7, content: "Core & Flow in Montmartre is the most affordable option at 38 EUR. Great community atmosphere too." },
      { forumPostId: 2, userId: 1, content: "This is so inspiring! I had a similar journey. Consistency really is the key. What's your favourite class type now?" },
      { forumPostId: 3, userId: 4, content: "I've done both for years. Reformer builds strength faster, but mat Pilates teaches you better body awareness. Ideally do both!" },
      { forumPostId: 5, userId: 2, content: "Try imagining you're pulling your belly button towards your spine as you exhale. Also, bend your knees slightly if needed - there's no shame in modifying." },
      { forumPostId: 5, userId: 9, content: "I had the same issue! What helped me was doing dead bugs and pelvic tilts as a warm-up before roll-ups. It pre-activates the deep core muscles." },
      { forumPostId: 7, userId: 3, content: "Would love to read the full paper! Can you share the link? I'm writing a blog post about the science behind Pilates." },
      { forumPostId: 8, userId: 6, content: "Just ordered a pair of GripParis socks based on this recommendation. Will report back after my next reformer class!" },
      { forumPostId: 10, userId: 1, content: "I do 3-4 times per week and that feels perfect. On rest days I do light stretching or a walk. Listen to your body!" },
      { forumPostId: 10, userId: 5, content: "My instructor at BodyWork Pilates says 3x per week is the sweet spot for most people. More than that and you risk overtraining without enough recovery." },
    ])
    .onConflictDoNothing();

  // ---- Post Comments (Social Feed) ----
  console.log("  Seeding post comments...");
  await db
    .insert(schema.postComments)
    .values([
      { postId: 1, userId: 2, content: "Amazing session! Studio Harmonie's reformer classes are the best. How did you find the spring tension?" },
      { postId: 1, userId: 5, content: "320 calories in 55 minutes is impressive! You must have been working hard." },
      { postId: 3, userId: 1, content: "Welcome to the Cadillac world! It's such a different experience from the reformer. You'll love it." },
      { postId: 5, userId: 4, content: "Reformer Flow at Equilibre is my favourite class too. Elise's cueing is next level." },
      { postId: 7, userId: 9, content: "75 minutes of Tower & Reformer?! That's intense. Celine really pushes you at BodyWork Pilates." },
      { postId: 7, userId: 1, content: "BodyWork Pilates is on my list to try. How would you rate it compared to Studio Harmonie?" },
      { postId: 9, userId: 2, content: "350 calories in a cardio reformer class is solid! Pilates Zen is such a unique studio." },
      { postId: 10, userId: 3, content: "I love Classical Mat at Equilibre. Pierre Garnier really honours the original Pilates method." },
    ])
    .onConflictDoNothing();

  // ---- Orders ----
  console.log("  Seeding orders...");
  await db
    .insert(schema.orders)
    .values([
      // Emma ordered grip socks + reformer straps
      { userId: 1, status: "delivered", totalAmount: 63 },
      // Lucas ordered a cork yoga mat + resistance bands
      { userId: 2, status: "shipped", totalAmount: 121 },
      // Marie ordered a massage gun
      { userId: 5, status: "confirmed", totalAmount: 299 },
    ])
    .onConflictDoNothing();

  // ---- Order Items ----
  console.log("  Seeding order items...");
  await db
    .insert(schema.orderItems)
    .values([
      // Order 1 (Emma): Premium Grip Socks (product 1, 18 EUR) + Reformer Straps (product 2, 45 EUR)
      { orderId: 1, productId: 1, quantity: 1, priceAtPurchase: 18 },
      { orderId: 1, productId: 2, quantity: 1, priceAtPurchase: 45 },
      // Order 2 (Lucas): Cork Yoga Mat (product 4, 89 EUR) + Resistance Band Set (product 5, 32 EUR)
      { orderId: 2, productId: 4, quantity: 1, priceAtPurchase: 89 },
      { orderId: 2, productId: 5, quantity: 1, priceAtPurchase: 32 },
      // Order 3 (Marie): Massage Gun (product 13, 299 EUR)
      { orderId: 3, productId: 13, quantity: 1, priceAtPurchase: 299 },
    ])
    .onConflictDoNothing();

  // ---- Wishlist Items ----
  console.log("  Seeding wishlist items...");
  await db
    .insert(schema.wishlistItems)
    .values([
      // Emma wishlisted Spine Corrector and Workout Leggings
      { userId: 1, productId: 9 },
      { userId: 1, productId: 10 },
      // Sophie wishlisted Premium Grip Socks and Foam Roller
      { userId: 3, productId: 1 },
      { userId: 3, productId: 6 },
      // Alex wishlisted Jump Board
      { userId: 4, productId: 14 },
      // Isabelle wishlisted Massage Gun and Gym Bag
      { userId: 7, productId: 13 },
      { userId: 7, productId: 20 },
      // Lea wishlisted Workout Leggings and Sports Bra
      { userId: 9, productId: 10 },
      { userId: 9, productId: 11 },
    ])
    .onConflictDoNothing();

  // ---- Conversations ----
  console.log("  Seeding conversations...");
  await db
    .insert(schema.conversations)
    .values([
      {}, // conversation 1: Emma & Lucas
      {}, // conversation 2: Sophie, Marie & Isabelle
      {}, // conversation 3: Lea & Hugo
    ])
    .onConflictDoNothing();

  // ---- Conversation Participants ----
  console.log("  Seeding conversation participants...");
  await db
    .insert(schema.conversationParticipants)
    .values([
      // Conversation 1: Emma & Lucas
      { conversationId: 1, userId: 1 },
      { conversationId: 1, userId: 2 },
      // Conversation 2: Sophie, Marie & Isabelle (group chat)
      { conversationId: 2, userId: 3 },
      { conversationId: 2, userId: 5 },
      { conversationId: 2, userId: 7 },
      // Conversation 3: Lea & Hugo
      { conversationId: 3, userId: 9 },
      { conversationId: 3, userId: 10 },
    ])
    .onConflictDoNothing();

  // ---- Messages ----
  console.log("  Seeding messages...");
  await db
    .insert(schema.messages)
    .values([
      // Conversation 1: Emma & Lucas discussing a class
      { conversationId: 1, senderId: 1, content: "Hey Lucas! Are you going to the Reformer Advanced class at Studio Harmonie tomorrow morning?" },
      { conversationId: 1, senderId: 2, content: "I was thinking about it! Is it the 9am one with Sophie?" },
      { conversationId: 1, senderId: 1, content: "Yes exactly! She's the best. I'll save you a reformer next to mine." },
      { conversationId: 1, senderId: 2, content: "Perfect, I'll book it now. Want to grab a coffee at the cafe nearby after?" },
      { conversationId: 1, senderId: 1, content: "Absolutely! See you at 8:45 then. Don't forget your grip socks!" },
      // Conversation 2: Sophie, Marie & Isabelle planning a group session
      { conversationId: 2, senderId: 3, content: "Hey ladies! Anyone up for trying the new Tower & Reformer class at BodyWork Pilates this weekend?" },
      { conversationId: 2, senderId: 5, content: "Oh I've been wanting to try that! Celine's classes are supposed to be incredible. Saturday morning works for me." },
      { conversationId: 2, senderId: 7, content: "Count me in! I heard it's 75 minutes though - that's going to be intense. Should we book the 10am slot?" },
      { conversationId: 2, senderId: 3, content: "10am is perfect. I just checked and there are still 3 spots available. Booking now!" },
      { conversationId: 2, senderId: 5, content: "Booked! This is going to be amazing. Let's do brunch afterwards to celebrate surviving it." },
      // Conversation 3: Lea & Hugo about a forum post
      { conversationId: 3, senderId: 9, content: "Hugo, did you see that forum post about how often to do Pilates per week? Really interesting discussion." },
      { conversationId: 3, senderId: 10, content: "Yes! I left a comment. I've been doing Classical Mat 3x a week and it feels like the right amount." },
      { conversationId: 3, senderId: 9, content: "Same for me. I tried doing 5 classes last week for the challenge and my body was not happy by Friday." },
      { conversationId: 3, senderId: 10, content: "Ha! Recovery is just as important as the workout. Want to try the Reformer Cardio at Pilates Zen next week?" },
      { conversationId: 3, senderId: 9, content: "Yes! I've been eyeing that one. Thomas Chevalier teaches it on Tuesdays. Let's do it!" },
    ])
    .onConflictDoNothing();

  console.log("\nSeed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
