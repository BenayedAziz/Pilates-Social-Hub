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
// Haversine distance (km) between two lat/lng points
// ---------------------------------------------------------------------------
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/studios
 *
 * Bounding-box mode (preferred for map views):
 *   ?sw_lat=48.8&sw_lng=2.2&ne_lat=48.9&ne_lng=2.5
 *   Returns ALL studios inside the rectangle. No limit applied.
 *
 * Legacy center+radius mode (used by non-map screens):
 *   ?lat=48.856&lng=2.352&radius=20&limit=100
 *
 * Common filters: ?q=search&neighborhood=Marais
 */
router.get("/studios", async (_req, res) => {
  try {
    // ---- Parse bounding-box params ----
    const swLat = parseFloat(_req.query["sw_lat"] as string);
    const swLng = parseFloat(_req.query["sw_lng"] as string);
    const neLat = parseFloat(_req.query["ne_lat"] as string);
    const neLng = parseFloat(_req.query["ne_lng"] as string);
    const hasBBox = !isNaN(swLat) && !isNaN(swLng) && !isNaN(neLat) && !isNaN(neLng);

    // ---- Parse legacy center+radius params ----
    const latParam = parseFloat(_req.query["lat"] as string);
    const lngParam = parseFloat(_req.query["lng"] as string);
    const hasGeo = !isNaN(latParam) && !isNaN(lngParam);
    // Default to Paris center when no geo provided
    const lat = hasGeo ? latParam : 48.856;
    const lng = hasGeo ? lngParam : 2.352;
    const radius = parseFloat(_req.query["radius"] as string) || 20; // km
    const rawLimit = parseInt(_req.query["limit"] as string);
    const limit = Math.min(isNaN(rawLimit) ? (hasGeo ? 200 : 50) : rawLimit, 2000);

    // Helper: check whether a point falls inside the bounding box
    function insideBBox(sLat: number, sLng: number): boolean {
      if (!hasBBox) return true;
      // Handle bounding boxes that wrap around the antimeridian
      const lngOk = swLng <= neLng
        ? sLng >= swLng && sLng <= neLng
        : sLng >= swLng || sLng <= neLng;
      return sLat >= swLat && sLat <= neLat && lngOk;
    }

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

      const allResults = await query;

      if (hasBBox) {
        // Bounding-box mode: return ALL studios inside the rectangle
        const bboxCenter = { lat: (swLat + neLat) / 2, lng: (swLng + neLng) / 2 };
        const filtered = allResults
          .map((s: any) => {
            const sLat = s.latitude ?? s.lat ?? 0;
            const sLng = s.longitude ?? s.lng ?? 0;
            const distance = (sLat && sLng) ? Math.round(haversine(bboxCenter.lat, bboxCenter.lng, sLat, sLng) * 10) / 10 : 0;
            return { ...s, distance };
          })
          .filter((s: any) => {
            const sLat = s.latitude ?? s.lat;
            const sLng = s.longitude ?? s.lng;
            if (!sLat || !sLng) return true;
            return insideBBox(sLat, sLng);
          })
          .sort((a: any, b: any) => a.distance - b.distance);

        res.json(filtered);
        return;
      }

      // Legacy center+radius mode
      const filtered = allResults
        .map((s: any) => {
          const sLat = s.latitude ?? s.lat ?? 0;
          const sLng = s.longitude ?? s.lng ?? 0;
          const distance = (sLat && sLng) ? Math.round(haversine(lat, lng, sLat, sLng) * 10) / 10 : 0;
          return { ...s, distance };
        })
        .filter((s: any) => {
          const sLat = s.latitude ?? s.lat;
          const sLng = s.longitude ?? s.lng;
          if (!sLat || !sLng) return true;
          return s.distance <= radius;
        })
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, limit);

      res.json(filtered);
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

    if (hasBBox) {
      // Bounding-box mode for mock data
      const bboxCenter = { lat: (swLat + neLat) / 2, lng: (swLng + neLng) / 2 };
      const filtered = results
        .map((s) => ({
          ...s,
          distance: (s.latitude && s.longitude) ? Math.round(haversine(bboxCenter.lat, bboxCenter.lng, s.latitude, s.longitude) * 10) / 10 : 0,
        }))
        .filter((s) => {
          if (!s.latitude || !s.longitude) return true;
          return insideBBox(s.latitude, s.longitude);
        })
        .sort((a, b) => a.distance - b.distance);

      res.json(filtered);
      return;
    }

    // Legacy center+radius mode for mock data
    const filtered = results
      .map((s) => ({
        ...s,
        distance: (s.latitude && s.longitude) ? Math.round(haversine(lat, lng, s.latitude, s.longitude) * 10) / 10 : 0,
      }))
      .filter((s) => {
        if (!s.latitude || !s.longitude) return true;
        return s.distance <= radius;
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    res.json(filtered);
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
 * GET /api/studios/:id/google-reviews
 * Returns Google reviews for a specific studio.
 */
router.get("/studios/:id/google-reviews", async (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid studio id" });
    return;
  }

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;

      if (schema.googleReviews) {
        const rows = await db
          .select()
          .from(schema.googleReviews)
          .where(eq(schema.googleReviews.studioId, id))
          .orderBy(desc(schema.googleReviews.time));

        res.json(rows);
        return;
      }
    }

    // No google reviews available (no DB or no table)
    res.json([]);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch Google reviews" });
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
