import { Router, type IRouter } from "express";
import { getDatabase } from "../lib/database";
import { eq, ilike } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Types (mirrors DB schema -- used for mock fallback)
// ---------------------------------------------------------------------------
interface Product {
  id: number;
  name: string;
  brand: string;
  description: string | null;
  price: number;
  rating: number | null;
  category: string;
  imageUrl: string | null;
  externalUrl: string | null;
  badge: string | null;
  inStock: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Real products data (fallback when DATABASE_URL is not set)
// All products link to real brand pages — no cart needed.
// ---------------------------------------------------------------------------
const mockProducts: Product[] = [
  // --- Accessories (grip socks, towels, bags) ---
  { id: 1, name: "Half Toe Elle Grip Socks", brand: "ToeSox", description: "Ballet-inspired grip socks with secure crisscross elastics and five-toe design for natural movement on reformer and mat.", price: 22, rating: 4.8, category: "Accessoires", imageUrl: null, externalUrl: "https://www.toesox.com/collections/pilates/products/half-toe-elle-grip-socks", badge: "Best Seller", inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 2, name: "Maddie Grip Socks", brand: "Tavi", description: "Achilles coverage and arch support with delicate mesh detailing and patented grip technology for studio stability.", price: 20, rating: 4.7, category: "Accessoires", imageUrl: null, externalUrl: "https://www.tavinoir.com/maddie-grip-socks.html", badge: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 3, name: "Full Toe Low Rise Grip Socks", brand: "ToeSox", description: "Low-profile full-toe grip socks with non-slip sole for Pilates, barre, and yoga.", price: 18, rating: 4.6, category: "Accessoires", imageUrl: null, externalUrl: "https://www.toesox.com/products/full-toe-low-rise-grip-socks", badge: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 4, name: "eQua Yoga Mat Towel", brand: "Manduka", description: "Microfiber hot yoga towel with moisture-activated grip. Ultra-soft, quick-dry, and machine washable.", price: 42, rating: 4.7, category: "Accessoires", imageUrl: null, externalUrl: "https://www.manduka.com/products/equa-yoga-mat-towel", badge: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 5, name: "Everywhere Belt Bag 1L", brand: "Lululemon", description: "Sleek belt bag for phone, keys, and wallet. Water-repellent fabric with adjustable strap.", price: 48, rating: 4.8, category: "Accessoires", imageUrl: null, externalUrl: "https://shop.lululemon.com/p/bags/Everywhere-Belt-Bag/_/prod8900747", badge: "New", inStock: true, createdAt: "2024-01-10T10:00:00Z" },

  // --- Equipment (rings, bands, weights, reformer accessories) ---
  { id: 6, name: "Ultra-Fit Circle", brand: "Balanced Body", description: "Flexible plastic Pilates ring with soft rubberized shell for inner/outer thigh and arm toning.", price: 35, rating: 4.8, category: "Machines", imageUrl: null, externalUrl: "https://www.pilates.com/products/pilates-rings-ultra-fit-circle/", badge: "Best Seller", inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 7, name: "Fitness Circle Pro 14\"", brand: "Merrithew", description: "Professional 14-inch Pilates ring to improve muscle tone for thighs, upper arms, and chest.", price: 40, rating: 4.7, category: "Machines", imageUrl: null, externalUrl: "https://www.merrithew.com/shop/ProductDetail/ST06000_Fitness-Circle-Pro--14-Inch-black", badge: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 8, name: "Flex-Band Two-Pack", brand: "Merrithew", description: "Regular and extra-strength resistance bands for adding upper and lower body resistance to matwork.", price: 24, rating: 4.6, category: "Machines", imageUrl: null, externalUrl: "https://www.merrithew.com/shop/ProductDetail/ST02033_Flexband-Twopack", badge: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 9, name: "Fabric Resistance Bands", brand: "Balanced Body", description: "Super-soft tensioned fabric bands with non-slip lining. Available in light, medium, and heavy resistance.", price: 30, rating: 4.5, category: "Machines", imageUrl: null, externalUrl: "https://www.pilates.com/products/resistance-bands/", badge: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 10, name: "Bala Bangles", brand: "Bala", description: "Stylish 1 lb wrist and ankle weights made of steel wrapped in baby-soft silicone.", price: 55, rating: 4.6, category: "Machines", imageUrl: null, externalUrl: "https://shopbala.com/products/bala-bangles", badge: "New", inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 11, name: "Padded Jumpboard", brand: "Balanced Body", description: "Reformer jump board for low-impact cardio and plyometric training with superior comfort.", price: 245, rating: 4.9, category: "Machines", imageUrl: null, externalUrl: "https://www.pilates.com/products/pilates-jump-board/", badge: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 12, name: "Reformer Box Extra Tall", brand: "Merrithew", description: "Extra-tall reformer sitting box for greater range of motion in seated and lying exercises.", price: 195, rating: 4.4, category: "Machines", imageUrl: null, externalUrl: "https://www.merrithew.com/shop/ProductDetail/ST02001_Reformer-Box--Extra-Tall", badge: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },

  // --- Mats ---
  { id: 13, name: "PRO Yoga Mat 6mm", brand: "Manduka", description: "Best-selling 6 mm mat with high-density stability, unmatched durability, and lifetime guarantee. Made in Germany.", price: 120, rating: 4.9, category: "Habitat", imageUrl: null, externalUrl: "https://www.manduka.com/products/manduka-pro-yoga-mat", badge: "Best Seller", inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 14, name: "PRO Travel Yoga Mat 2mm", brand: "Manduka", description: "Foldable 2 mm travel mat with high-density support and lifetime guarantee.", price: 72, rating: 4.6, category: "Habitat", imageUrl: null, externalUrl: "https://www.manduka.com/products/pro-travel-yoga-mat", badge: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },

  // --- Apparel ---
  { id: 15, name: "Align High-Rise Pant 25\"", brand: "Lululemon", description: "Buttery-soft Nulu fabric leggings with weightless, four-way stretch feel for Pilates and yoga.", price: 98, rating: 4.8, category: "Apparel", imageUrl: null, externalUrl: "https://shop.lululemon.com/p/womens-leggings/Align-Pant-2/_/prod2020012", badge: "Best Seller", inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 16, name: "Align High-Rise Pant 28\"", brand: "Lululemon", description: "Full-length Align leggings in weightlessly soft Nulu fabric with no front seam.", price: 98, rating: 4.7, category: "Apparel", imageUrl: null, externalUrl: "https://shop.lululemon.com/p/womens-leggings/Align-Pant-Full-Length-28/_/prod8780551", badge: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 17, name: "Energy Bra Medium Support", brand: "Lululemon", description: "All-sport bra voted most likely to be worn multiple times a week. B-D cups, medium support.", price: 52, rating: 4.7, category: "Apparel", imageUrl: null, externalUrl: "https://shop.lululemon.com/p/women-sports-bras/Energy-Bra-32925/_/prod9360058", badge: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 18, name: "Energy Longline Bra", brand: "Lululemon", description: "Medium-support longline sports bra in sweat-wicking fabric for comfort and versatility.", price: 58, rating: 4.6, category: "Apparel", imageUrl: null, externalUrl: "https://shop.lululemon.com/p/women-sports-bras/Energy-Bra-Long-Line/_/prod9030660", badge: "New", inStock: true, createdAt: "2024-01-10T10:00:00Z" },

  // --- Recovery ---
  { id: 19, name: "Foam Roller Deluxe 36\"", brand: "Merrithew", description: "Closed-cell foam roller with non-skid surface to activate deep core muscles and improve balance.", price: 45, rating: 4.8, category: "Goodies", imageUrl: null, externalUrl: "https://www.merrithew.com/shop/ProductDetail/ST06091_Foam-Roller-Deluxe--36-Inch-black", badge: "Best Seller", inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 20, name: "Foam Roller Soft Density 18\"", brand: "Merrithew", description: "Rounded-edge soft-density roller with textured non-slip surface for gentle recovery.", price: 22, rating: 4.5, category: "Goodies", imageUrl: null, externalUrl: "https://www.merrithew.com/shop/ProductDetail/ST06203_Foam-Roller-Soft-Density--18-Inch", badge: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
];

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/products
 * Query params: ?category=Equipment
 */
router.get("/products", async (req, res) => {
  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;
      const category = req.query["category"] as string | undefined;

      let query = db.select().from(schema.products);

      if (category) {
        query = query.where(ilike(schema.products.category, category));
      }

      const results = await query;
      res.json(results);
      return;
    }

    // Fallback to mock data
    let results = [...mockProducts];

    const category = req.query["category"] as string | undefined;
    if (category) {
      results = results.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase(),
      );
    }

    res.json(results);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/**
 * GET /api/products/:id
 */
router.get("/products/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;
      const [product] = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, id))
        .limit(1);

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.json(product);
      return;
    }

    // Fallback to mock data
    const product = mockProducts.find((p) => p.id === id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(product);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

export default router;
