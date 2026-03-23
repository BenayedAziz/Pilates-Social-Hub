import { Router, type IRouter } from "express";
import { getDatabase } from "../lib/database";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CoachProfile {
  id: number;
  name: string;
  slug: string;
  bio: string;
  specialties: string[];
  studioIds: number[];
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  certifications: string[];
  avatarColor: string;
  initials: string;
  imageUrl: string;
  sessionsCount: number;
  quote: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function mkInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const AVATAR_COLORS = [
  "bg-rose-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-yellow-200",
  "bg-purple-200",
  "bg-orange-200",
  "bg-teal-200",
  "bg-indigo-200",
  "bg-pink-200",
  "bg-cyan-200",
  "bg-amber-200",
  "bg-lime-200",
  "bg-emerald-200",
  "bg-sky-200",
  "bg-violet-200",
  "bg-fuchsia-200",
];

// ---------------------------------------------------------------------------
// Mock data — 16 coaches
// ---------------------------------------------------------------------------
const mockCoaches: CoachProfile[] = [
  {
    id: 1,
    name: "Sophie Leclerc",
    slug: "sophie-leclerc",
    bio: "Classical Pilates instructor with deep knowledge of the original Joseph Pilates method. Trained at the Pilates Center in Boulder, Colorado.",
    specialties: ["Classical Reformer", "Mat Pilates", "Pre/Post-natal"],
    studioIds: [1],
    rating: 4.9,
    reviewCount: 187,
    yearsExperience: 12,
    certifications: ["PMA-CPT", "BASI Pilates", "Pre/Post-natal Specialist"],
    avatarColor: "bg-rose-200",
    initials: "SL",
    imageUrl: "",
    sessionsCount: 4230,
    quote: "Pilates is the complete coordination of body, mind, and spirit.",
  },
  {
    id: 2,
    name: "Julien Moreau",
    slug: "julien-moreau",
    bio: "Former professional dancer turned Pilates instructor. Specialises in athletic conditioning and injury rehabilitation.",
    specialties: ["Athletic Reformer", "Injury Rehab", "Dance Conditioning"],
    studioIds: [1],
    rating: 4.8,
    reviewCount: 156,
    yearsExperience: 8,
    certifications: ["STOTT Pilates", "Sports Rehab Specialist"],
    avatarColor: "bg-blue-200",
    initials: "JM",
    imageUrl: "",
    sessionsCount: 3180,
    quote: "Movement is medicine. Every session is a step towards a stronger you.",
  },
  {
    id: 3,
    name: "Marie Dubois",
    slug: "marie-dubois",
    bio: "Cadillac and tower specialist with a background in physical therapy. Known for her gentle yet effective approach.",
    specialties: ["Cadillac", "Tower", "Therapeutic Pilates"],
    studioIds: [2],
    rating: 4.9,
    reviewCount: 201,
    yearsExperience: 15,
    certifications: ["PMA-CPT", "DPT", "Polestar Pilates"],
    avatarColor: "bg-green-200",
    initials: "MD",
    imageUrl: "",
    sessionsCount: 5120,
    quote: "The body achieves what the mind believes.",
  },
  {
    id: 4,
    name: "Antoine Petit",
    slug: "antoine-petit",
    bio: "High-energy instructor who blends classical Pilates with modern fitness trends. Popular with young professionals.",
    specialties: ["Reformer Cardio", "HIIT Pilates", "Group Classes"],
    studioIds: [2],
    rating: 4.7,
    reviewCount: 134,
    yearsExperience: 6,
    certifications: ["BASI Pilates", "ACE Group Fitness"],
    avatarColor: "bg-yellow-200",
    initials: "AP",
    imageUrl: "",
    sessionsCount: 2450,
    quote: "Push your limits. Your body is capable of incredible things.",
  },
  {
    id: 5,
    name: "Camille Bernard",
    slug: "camille-bernard",
    bio: "Community-focused instructor who creates welcoming spaces for all body types and experience levels.",
    specialties: ["Beginner Pilates", "Mat Flow", "Inclusive Fitness"],
    studioIds: [3],
    rating: 4.8,
    reviewCount: 178,
    yearsExperience: 9,
    certifications: ["STOTT Pilates", "Balanced Body"],
    avatarColor: "bg-purple-200",
    initials: "CB",
    imageUrl: "",
    sessionsCount: 3560,
    quote: "Every body is a Pilates body.",
  },
  {
    id: 6,
    name: "Lucas Fontaine",
    slug: "lucas-fontaine",
    bio: "Precision-focused instructor with an engineering background. Brings analytical thinking to movement patterns.",
    specialties: ["Reformer Technique", "Alignment", "Core Strength"],
    studioIds: [3],
    rating: 4.6,
    reviewCount: 112,
    yearsExperience: 5,
    certifications: ["Balanced Body", "FRC Mobility Specialist"],
    avatarColor: "bg-orange-200",
    initials: "LF",
    imageUrl: "",
    sessionsCount: 1890,
    quote: "Precision in movement creates freedom in life.",
  },
  {
    id: 7,
    name: "Isabelle Dupont",
    slug: "isabelle-dupont",
    bio: "Strength-focused instructor specialising in Balanced Body equipment. Transforms bodies through progressive overload Pilates.",
    specialties: ["Strength Reformer", "Balanced Body", "Progressive Training"],
    studioIds: [4],
    rating: 4.7,
    reviewCount: 145,
    yearsExperience: 10,
    certifications: ["Balanced Body Master Instructor", "NSCA-CPT"],
    avatarColor: "bg-teal-200",
    initials: "ID",
    imageUrl: "",
    sessionsCount: 3890,
    quote: "Strength doesn't come from what you can do. It comes from overcoming what you thought you couldn't.",
  },
  {
    id: 8,
    name: "Marc Rousseau",
    slug: "marc-rousseau",
    bio: "Technical master known for detailed cueing and hands-on corrections. Background in sports science.",
    specialties: ["Advanced Reformer", "Wunda Chair", "Sports Performance"],
    studioIds: [4],
    rating: 4.8,
    reviewCount: 167,
    yearsExperience: 11,
    certifications: ["PMA-CPT", "CSCS", "Peak Pilates"],
    avatarColor: "bg-indigo-200",
    initials: "MR",
    imageUrl: "",
    sessionsCount: 4100,
    quote: "The details make the difference. Every rep counts.",
  },
  {
    id: 9,
    name: "Elise Martin",
    slug: "elise-martin",
    bio: "Intimate studio specialist who excels at private sessions and small group work. Deep expertise in chair and mat.",
    specialties: ["Chair Pilates", "Private Sessions", "Small Group"],
    studioIds: [5],
    rating: 4.9,
    reviewCount: 98,
    yearsExperience: 14,
    certifications: ["PMA-CPT", "Romana's Pilates"],
    avatarColor: "bg-pink-200",
    initials: "EM",
    imageUrl: "",
    sessionsCount: 4780,
    quote: "In a small group, magic happens. I see every student.",
  },
  {
    id: 10,
    name: "Pierre Garnier",
    slug: "pierre-garnier",
    bio: "Mindful movement practitioner who integrates yoga and Pilates philosophies. Creates deeply restorative sessions.",
    specialties: ["Mat Pilates", "Restorative", "Mindful Movement"],
    studioIds: [5],
    rating: 4.7,
    reviewCount: 89,
    yearsExperience: 7,
    certifications: ["BASI Pilates", "RYT-200 Yoga"],
    avatarColor: "bg-cyan-200",
    initials: "PG",
    imageUrl: "",
    sessionsCount: 2210,
    quote: "Breathe. Move. Transform.",
  },
  {
    id: 11,
    name: "Nathalie Simon",
    slug: "nathalie-simon",
    bio: "Affordable Pilates advocate who proves that quality instruction doesn't have to break the bank. Energetic and motivating.",
    specialties: ["Reformer Flow", "Budget-Friendly Pilates", "Group Energy"],
    studioIds: [6],
    rating: 4.6,
    reviewCount: 156,
    yearsExperience: 8,
    certifications: ["STOTT Pilates", "Balanced Body"],
    avatarColor: "bg-amber-200",
    initials: "NS",
    imageUrl: "",
    sessionsCount: 3340,
    quote: "Great Pilates should be accessible to everyone.",
  },
  {
    id: 12,
    name: "Florent Legrand",
    slug: "florent-legrand",
    bio: "No-nonsense instructor focused on results. Popular with clients who want efficient, challenging workouts.",
    specialties: ["Power Reformer", "Functional Fitness", "Time-Efficient"],
    studioIds: [6],
    rating: 4.5,
    reviewCount: 123,
    yearsExperience: 6,
    certifications: ["Balanced Body", "NASM-CPT"],
    avatarColor: "bg-lime-200",
    initials: "FL",
    imageUrl: "",
    sessionsCount: 2670,
    quote: "45 minutes of focused work beats 90 minutes of going through the motions.",
  },
  {
    id: 13,
    name: "Audrey Girard",
    slug: "audrey-girard",
    bio: "Breath-work and mindfulness specialist who brings a unique Zen approach to Pilates. Creates transformative experiences.",
    specialties: ["Breath-Work Pilates", "Mindfulness", "Zen Flow"],
    studioIds: [7],
    rating: 4.9,
    reviewCount: 112,
    yearsExperience: 13,
    certifications: ["PMA-CPT", "Mindfulness Meditation Teacher", "Polestar Pilates"],
    avatarColor: "bg-emerald-200",
    initials: "AG",
    imageUrl: "",
    sessionsCount: 4560,
    quote: "When the breath is steady, the mind is calm and the body follows.",
  },
  {
    id: 14,
    name: "Thomas Chevalier",
    slug: "thomas-chevalier",
    bio: "Holistic wellness coach combining Pilates with recovery science. Helps clients optimise their overall wellbeing.",
    specialties: ["Recovery Pilates", "Holistic Wellness", "Sleep Optimisation"],
    studioIds: [7],
    rating: 4.7,
    reviewCount: 95,
    yearsExperience: 9,
    certifications: ["STOTT Pilates", "Precision Nutrition", "Sleep Science Certificate"],
    avatarColor: "bg-sky-200",
    initials: "TC",
    imageUrl: "",
    sessionsCount: 2890,
    quote: "Recovery is where the transformation happens.",
  },
  {
    id: 15,
    name: "Celine Blanc",
    slug: "celine-blanc",
    bio: "Elite instructor trusted by professional dancers and athletes. The gold standard of Pilates instruction in Paris.",
    specialties: ["Professional Dance", "Elite Athletic", "Tower & Reformer"],
    studioIds: [8],
    rating: 5.0,
    reviewCount: 289,
    yearsExperience: 18,
    certifications: ["PMA-CPT", "Romana's Pilates", "Dance Medicine Specialist"],
    avatarColor: "bg-violet-200",
    initials: "CB",
    imageUrl: "",
    sessionsCount: 7230,
    quote: "Excellence is not an act, but a habit cultivated in every session.",
  },
  {
    id: 16,
    name: "Raphael Dumas",
    slug: "raphael-dumas",
    bio: "Dynamic instructor known for creative sequencing and upbeat energy. Makes even the toughest sessions enjoyable.",
    specialties: ["Creative Reformer", "Circuit Pilates", "Fun Fitness"],
    studioIds: [8],
    rating: 4.8,
    reviewCount: 198,
    yearsExperience: 10,
    certifications: ["BASI Pilates", "Balanced Body", "TRX Certified"],
    avatarColor: "bg-fuchsia-200",
    initials: "RD",
    imageUrl: "",
    sessionsCount: 3890,
    quote: "If you're not having fun, we're not doing it right!",
  },
];

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/coaches
 * Returns list of all coaches.
 */
router.get("/coaches", async (_req, res) => {
  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;

      if (schema.coaches) {
        const rows = await db.select().from(schema.coaches);

        const results: CoachProfile[] = rows.map((row: any, idx: number) => ({
          id: row.id,
          name: row.name,
          slug: slugify(row.name),
          bio: row.bio ?? "",
          specialties: row.specialties ?? [],
          studioIds: [row.studioId],
          rating: 4.7,
          reviewCount: 100 + idx * 10,
          yearsExperience: 5 + (idx % 10),
          certifications: ["PMA-CPT"],
          avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
          initials: mkInitials(row.name),
          imageUrl: row.avatarUrl ?? "",
          sessionsCount: 2000 + idx * 200,
          quote: "Movement is life.",
        }));

        res.json(results);
        return;
      }
    }

    // Fallback to mock data
    res.json(mockCoaches);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch coaches" });
  }
});

/**
 * GET /api/coaches/:slug
 * Returns a single coach by slug.
 */
router.get("/coaches/:slug", async (req, res) => {
  const slug = req.params["slug"];

  // Try mock data first (works regardless of DB)
  const coach = mockCoaches.find((c) => c.slug === slug);

  if (coach) {
    res.json(coach);
    return;
  }

  res.status(404).json({ error: "Coach not found" });
});

export default router;
