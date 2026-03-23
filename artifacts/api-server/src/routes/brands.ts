import { Router, type IRouter } from "express";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  logoEmoji: string;
  coverImageUrl: string;
  category: string;
  rating: number;
  productCount: number;
  founded: string;
  origin: string;
  highlight: string;
  verified: boolean;
}

// ---------------------------------------------------------------------------
// Mock data — 6 brands
// ---------------------------------------------------------------------------
const mockBrands: Brand[] = [
  {
    id: 1,
    name: "Balanced Body",
    slug: "balanced-body",
    description: "The world's leading Pilates equipment manufacturer. From reformers to chairs, Balanced Body sets the industry standard for quality and innovation.",
    logoEmoji: "\u2696\uFE0F",
    coverImageUrl: "",
    category: "Equipment",
    rating: 4.9,
    productCount: 48,
    founded: "1976",
    origin: "Sacramento, USA",
    highlight: "Used by 80% of professional Pilates studios worldwide",
    verified: true,
  },
  {
    id: 2,
    name: "Lululemon",
    slug: "lululemon",
    description: "Premium athletic apparel designed for yoga, Pilates, and everyday movement. Known for buttery-soft fabrics and flattering fits.",
    logoEmoji: "\uD83E\uDE78",
    coverImageUrl: "",
    category: "Apparel",
    rating: 4.7,
    productCount: 85,
    founded: "1998",
    origin: "Vancouver, Canada",
    highlight: "Align leggings are the #1 choice for Pilates practitioners",
    verified: true,
  },
  {
    id: 3,
    name: "Manduka",
    slug: "manduka",
    description: "Eco-friendly mats and accessories built to last a lifetime. The PRO mat is legendary in the Pilates and yoga communities.",
    logoEmoji: "\uD83E\uDDD8",
    coverImageUrl: "",
    category: "Mats & Accessories",
    rating: 4.8,
    productCount: 32,
    founded: "1997",
    origin: "Los Angeles, USA",
    highlight: "PRO mat comes with a lifetime guarantee",
    verified: true,
  },
  {
    id: 4,
    name: "BASI Pilates",
    slug: "basi-pilates",
    description: "Body Arts and Science International — a world-renowned Pilates education and equipment brand founded by Rael Isacowitz.",
    logoEmoji: "\uD83C\uDF93",
    coverImageUrl: "",
    category: "Education & Equipment",
    rating: 4.8,
    productCount: 24,
    founded: "1989",
    origin: "Newport Beach, USA",
    highlight: "Gold standard in Pilates teacher training worldwide",
    verified: true,
  },
  {
    id: 5,
    name: "Merrithew",
    slug: "merrithew",
    description: "Home of STOTT PILATES — premium mindful movement equipment and education. Trusted by rehab professionals and fitness enthusiasts alike.",
    logoEmoji: "\u2B50",
    coverImageUrl: "",
    category: "Equipment & Education",
    rating: 4.7,
    productCount: 56,
    founded: "1988",
    origin: "Toronto, Canada",
    highlight: "STOTT PILATES is the most globally recognised Pilates brand",
    verified: true,
  },
  {
    id: 6,
    name: "NutriFlow",
    slug: "nutriflow",
    description: "Nutrition and wellness brand designed specifically for Pilates practitioners. Supplements, protein blends, and recovery drinks.",
    logoEmoji: "\uD83E\uDD64",
    coverImageUrl: "",
    category: "Nutrition",
    rating: 4.5,
    productCount: 18,
    founded: "2020",
    origin: "Paris, France",
    highlight: "Created by Pilates instructors for Pilates practitioners",
    verified: false,
  },
];

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/brands
 * Returns list of all brands.
 */
router.get("/brands", (_req, res) => {
  res.json(mockBrands);
});

/**
 * GET /api/brands/:slug
 * Returns a single brand by slug.
 */
router.get("/brands/:slug", (req, res) => {
  const slug = req.params["slug"];
  const brand = mockBrands.find((b) => b.slug === slug);

  if (!brand) {
    res.status(404).json({ error: "Brand not found" });
    return;
  }

  res.json(brand);
});

export default router;
