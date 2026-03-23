import { Router, type IRouter } from "express";
import { getDatabase } from "../lib/database";
import { eq, ilike, or, desc } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Types (mirrors DB schema – used for mock fallback)
// ---------------------------------------------------------------------------
interface Studio {
  id: number;
  name: string;
  neighborhood: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  coordX: number | null;
  coordY: number | null;
  price: number;
  rating: number | null;
  reviewCount: number | null;
  imageUrl: string | null;
  amenities: string[];
  coaches: string[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Mock data (fallback when DATABASE_URL is not set)
// ---------------------------------------------------------------------------
const mockStudios: Studio[] = [
  {
    id: 1,
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
    imageUrl: null,
    amenities: ["Showers", "Lockers", "Towels"],
    coaches: ["Sophie Leclerc", "Julien Moreau"],
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
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
    imageUrl: null,
    amenities: ["Showers", "Towels", "Cafe"],
    coaches: ["Marie Dubois", "Antoine Petit"],
    createdAt: "2024-02-01T10:00:00Z",
  },
  {
    id: 3,
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
    imageUrl: null,
    amenities: ["Lockers", "Water Station"],
    coaches: ["Camille Bernard", "Lucas Fontaine"],
    createdAt: "2024-02-15T10:00:00Z",
  },
  {
    id: 4,
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
    imageUrl: null,
    amenities: ["Showers", "Lockers", "Parking"],
    coaches: ["Isabelle Dupont", "Marc Rousseau"],
    createdAt: "2024-03-01T10:00:00Z",
  },
  {
    id: 5,
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
    imageUrl: null,
    amenities: ["Towels", "Tea Bar"],
    coaches: ["Elise Martin", "Pierre Garnier"],
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: 6,
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
    imageUrl: null,
    amenities: ["Lockers", "Water Station"],
    coaches: ["Nathalie Simon", "Florent Legrand"],
    createdAt: "2024-04-01T10:00:00Z",
  },
  {
    id: 7,
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
    imageUrl: null,
    amenities: ["Showers", "Meditation Room", "Towels"],
    coaches: ["Audrey Girard", "Thomas Chevalier"],
    createdAt: "2024-04-15T10:00:00Z",
  },
  {
    id: 8,
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
    imageUrl: null,
    amenities: ["Showers", "Lockers", "Towels", "Cafe", "Sauna"],
    coaches: ["Celine Blanc", "Raphael Dumas"],
    createdAt: "2024-05-01T10:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/studios
 * Query params: ?q=search&neighborhood=Marais
 */
router.get("/studios", async (_req, res) => {
  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;
      const q = (_req.query["q"] as string | undefined)?.toLowerCase();
      const neighborhood = _req.query["neighborhood"] as string | undefined;

      const conditions: any[] = [];

      if (neighborhood) {
        conditions.push(ilike(schema.studios.neighborhood, neighborhood));
      }

      if (q) {
        conditions.push(
          or(
            ilike(schema.studios.name, `%${q}%`),
            ilike(schema.studios.neighborhood, `%${q}%`),
            ilike(schema.studios.description, `%${q}%`),
          ),
        );
      }

      let query = db.select().from(schema.studios);
      for (const cond of conditions) {
        query = query.where(cond);
      }

      const results = await query;
      res.json(results);
      return;
    }

    // Fallback to mock data
    let results = [...mockStudios];

    const q = (_req.query["q"] as string | undefined)?.toLowerCase();
    if (q) {
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.neighborhood.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q)),
      );
    }

    const neighborhood = _req.query["neighborhood"] as string | undefined;
    if (neighborhood) {
      results = results.filter(
        (s) => s.neighborhood.toLowerCase() === neighborhood.toLowerCase(),
      );
    }

    res.json(results);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch studios" });
  }
});

/**
 * GET /api/studios/:id
 */
router.get("/studios/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid studio id" });
    return;
  }

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;
      const [studio] = await db
        .select()
        .from(schema.studios)
        .where(eq(schema.studios.id, id))
        .limit(1);

      if (!studio) {
        res.status(404).json({ error: "Studio not found" });
        return;
      }

      res.json(studio);
      return;
    }

    // Fallback to mock data
    const studio = mockStudios.find((s) => s.id === id);
    if (!studio) {
      res.status(404).json({ error: "Studio not found" });
      return;
    }

    res.json(studio);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch studio" });
  }
});

// ---------------------------------------------------------------------------
// Studio Reviews mock data
// ---------------------------------------------------------------------------
interface StudioReview {
  id: number;
  studioId: number;
  userId: number;
  userName: string;
  userInitials: string;
  userColor: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
}

const USER_COLORS = [
  "bg-rose-200", "bg-blue-200", "bg-green-200", "bg-yellow-200", "bg-purple-200",
  "bg-orange-200", "bg-teal-200", "bg-indigo-200", "bg-pink-200", "bg-cyan-200",
];

const mockStudioReviews: StudioReview[] = [
  { id: 1, studioId: 1, userId: 1, userName: "Emma D", userInitials: "ED", userColor: "bg-rose-200", rating: 5, text: "Absolutely love Studio Harmonie! The reformers are top-quality and Sophie is an incredible instructor.", date: "2 days ago", helpful: 12 },
  { id: 2, studioId: 1, userId: 2, userName: "Lucas M", userInitials: "LM", userColor: "bg-blue-200", rating: 4, text: "Great equipment and atmosphere. A bit pricey but worth it for the quality.", date: "1 week ago", helpful: 8 },
  { id: 3, studioId: 2, userId: 3, userName: "Sophie B", userInitials: "SB", userColor: "bg-green-200", rating: 5, text: "The view from Pilates Lumiere is breathtaking! The Cadillac classes are exceptional.", date: "3 days ago", helpful: 15 },
  { id: 4, studioId: 3, userId: 4, userName: "Alex R", userInitials: "AR", userColor: "bg-yellow-200", rating: 5, text: "Core & Flow is the most welcoming studio. Great community vibe and very affordable.", date: "5 days ago", helpful: 6 },
  { id: 5, studioId: 3, userId: 5, userName: "Marie C", userInitials: "MC", userColor: "bg-purple-200", rating: 4, text: "Lovely studio at the base of Montmartre. Classes are well-structured.", date: "1 week ago", helpful: 4 },
  { id: 6, studioId: 4, userId: 6, userName: "Pierre T", userInitials: "PT", userColor: "bg-orange-200", rating: 4, text: "Reform Studio has the best Balanced Body equipment in Paris.", date: "4 days ago", helpful: 9 },
  { id: 7, studioId: 5, userId: 7, userName: "Isabelle F", userInitials: "IF", userColor: "bg-teal-200", rating: 5, text: "Hidden gem in Pigalle! Small classes mean personal attention.", date: "2 weeks ago", helpful: 7 },
  { id: 8, studioId: 6, userId: 8, userName: "Thomas G", userInitials: "TG", userColor: "bg-indigo-200", rating: 4, text: "Best value for reformer in Paris. No frills but great instruction.", date: "1 week ago", helpful: 11 },
  { id: 9, studioId: 7, userId: 9, userName: "Lea N", userInitials: "LN", userColor: "bg-pink-200", rating: 5, text: "The breath-work integration at Pilates Zen changed my practice.", date: "3 days ago", helpful: 13 },
  { id: 10, studioId: 8, userId: 10, userName: "Hugo P", userInitials: "HP", userColor: "bg-cyan-200", rating: 5, text: "BodyWork is worth every euro. The instructors are world-class.", date: "6 days ago", helpful: 18 },
  { id: 11, studioId: 1, userId: 9, userName: "Lea N", userInitials: "LN", userColor: "bg-pink-200", rating: 5, text: "Sophie's reformer advanced class is life-changing.", date: "2 weeks ago", helpful: 10 },
  { id: 12, studioId: 2, userId: 6, userName: "Pierre T", userInitials: "PT", userColor: "bg-orange-200", rating: 4, text: "Beautiful space, excellent Cadillac work.", date: "1 week ago", helpful: 5 },
];

// ---------------------------------------------------------------------------
// Studio Checkins mock data
// ---------------------------------------------------------------------------
interface StudioCheckin {
  studioId: number;
  userId: number;
  userName: string;
  userInitials: string;
  userColor: string;
  checkins: number;
  lastVisit: string;
}

const mockStudioCheckins: StudioCheckin[] = [
  { studioId: 1, userId: 1, userName: "Emma D", userInitials: "ED", userColor: "bg-rose-200", checkins: 45, lastVisit: "Today" },
  { studioId: 1, userId: 9, userName: "Lea N", userInitials: "LN", userColor: "bg-pink-200", checkins: 38, lastVisit: "Yesterday" },
  { studioId: 1, userId: 2, userName: "Lucas M", userInitials: "LM", userColor: "bg-blue-200", checkins: 22, lastVisit: "3 days ago" },
  { studioId: 2, userId: 3, userName: "Sophie B", userInitials: "SB", userColor: "bg-green-200", checkins: 52, lastVisit: "Today" },
  { studioId: 2, userId: 6, userName: "Pierre T", userInitials: "PT", userColor: "bg-orange-200", checkins: 31, lastVisit: "2 days ago" },
  { studioId: 2, userId: 8, userName: "Thomas G", userInitials: "TG", userColor: "bg-indigo-200", checkins: 19, lastVisit: "1 week ago" },
  { studioId: 3, userId: 4, userName: "Alex R", userInitials: "AR", userColor: "bg-yellow-200", checkins: 67, lastVisit: "Today" },
  { studioId: 3, userId: 5, userName: "Marie C", userInitials: "MC", userColor: "bg-purple-200", checkins: 41, lastVisit: "Yesterday" },
  { studioId: 3, userId: 7, userName: "Isabelle F", userInitials: "IF", userColor: "bg-teal-200", checkins: 28, lastVisit: "4 days ago" },
  { studioId: 4, userId: 6, userName: "Pierre T", userInitials: "PT", userColor: "bg-orange-200", checkins: 35, lastVisit: "Today" },
  { studioId: 4, userId: 1, userName: "Emma D", userInitials: "ED", userColor: "bg-rose-200", checkins: 18, lastVisit: "3 days ago" },
  { studioId: 5, userId: 7, userName: "Isabelle F", userInitials: "IF", userColor: "bg-teal-200", checkins: 56, lastVisit: "Yesterday" },
  { studioId: 5, userId: 10, userName: "Hugo P", userInitials: "HP", userColor: "bg-cyan-200", checkins: 23, lastVisit: "5 days ago" },
  { studioId: 6, userId: 8, userName: "Thomas G", userInitials: "TG", userColor: "bg-indigo-200", checkins: 44, lastVisit: "Today" },
  { studioId: 6, userId: 4, userName: "Alex R", userInitials: "AR", userColor: "bg-yellow-200", checkins: 29, lastVisit: "2 days ago" },
  { studioId: 7, userId: 9, userName: "Lea N", userInitials: "LN", userColor: "bg-pink-200", checkins: 38, lastVisit: "Today" },
  { studioId: 7, userId: 2, userName: "Lucas M", userInitials: "LM", userColor: "bg-blue-200", checkins: 15, lastVisit: "1 week ago" },
  { studioId: 8, userId: 10, userName: "Hugo P", userInitials: "HP", userColor: "bg-cyan-200", checkins: 61, lastVisit: "Today" },
  { studioId: 8, userId: 3, userName: "Sophie B", userInitials: "SB", userColor: "bg-green-200", checkins: 47, lastVisit: "Yesterday" },
  { studioId: 8, userId: 5, userName: "Marie C", userInitials: "MC", userColor: "bg-purple-200", checkins: 33, lastVisit: "3 days ago" },
];

/**
 * GET /api/studios/:id/reviews
 * Returns reviews for a specific studio.
 */
router.get("/studios/:id/reviews", async (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid studio id" });
    return;
  }

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;

      if (schema.reviews && schema.users) {
        const rows = await db
          .select({
            id: schema.reviews.id,
            studioId: schema.reviews.studioId,
            userId: schema.reviews.userId,
            rating: schema.reviews.rating,
            text: schema.reviews.text,
            createdAt: schema.reviews.createdAt,
            userName: schema.users.displayName,
          })
          .from(schema.reviews)
          .leftJoin(schema.users, eq(schema.reviews.userId, schema.users.id))
          .where(eq(schema.reviews.studioId, id))
          .orderBy(desc(schema.reviews.createdAt));

        const results = rows.map((row: any) => {
          const name = row.userName ?? "Unknown";
          const initials = name
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          return {
            id: row.id,
            studioId: row.studioId,
            userId: row.userId,
            userName: name,
            userInitials: initials,
            userColor: USER_COLORS[(row.userId - 1) % USER_COLORS.length],
            rating: row.rating,
            text: row.text ?? "",
            date: "recently",
            helpful: 0,
          };
        });

        res.json(results);
        return;
      }
    }

    // Fallback to mock data
    const results = mockStudioReviews.filter((r) => r.studioId === id);
    res.json(results);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch studio reviews" });
  }
});

/**
 * GET /api/studios/:id/checkins
 * Returns checkins leaderboard for a specific studio.
 */
router.get("/studios/:id/checkins", (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid studio id" });
    return;
  }

  const results = mockStudioCheckins
    .filter((c) => c.studioId === id)
    .sort((a, b) => b.checkins - a.checkins);

  res.json(results);
});

export default router;
