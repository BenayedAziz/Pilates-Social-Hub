import { Router, type IRouter } from "express";

// ---------------------------------------------------------------------------
// Types (mirrors DB schema – swap to Drizzle select types when DB is wired)
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
// Mock data (aligned with frontend mock-data.tsx)
// ---------------------------------------------------------------------------
const studios: Studio[] = [
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
    name: "Pilates Lumière",
    neighborhood: "Saint-Germain",
    description:
      "Premium boutique studio with panoramic views of Saint-Germain-des-Prés. Specialising in Cadillac and Reformer work.",
    address: "45 Boulevard Saint-Germain, 75005 Paris",
    latitude: 48.8531,
    longitude: 2.3469,
    coordX: 45,
    coordY: 60,
    price: 55,
    rating: 4.8,
    reviewCount: 189,
    imageUrl: null,
    amenities: ["Showers", "Towels", "Café"],
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
    name: "Équilibre Pilates",
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
    coaches: ["Élise Martin", "Pierre Garnier"],
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
    address: "18 Avenue du Trône, 75012 Paris",
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
    neighborhood: "Châtelet",
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
    amenities: ["Showers", "Lockers", "Towels", "Café", "Sauna"],
    coaches: ["Céline Blanc", "Raphaël Dumas"],
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
router.get("/studios", (_req, res) => {
  let results = [...studios];

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
});

/**
 * GET /api/studios/:id
 */
router.get("/studios/:id", (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid studio id" });
    return;
  }

  const studio = studios.find((s) => s.id === id);
  if (!studio) {
    res.status(404).json({ error: "Studio not found" });
    return;
  }

  res.json(studio);
});

export default router;
