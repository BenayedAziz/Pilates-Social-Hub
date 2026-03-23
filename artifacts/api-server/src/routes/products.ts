import { Router, type IRouter } from "express";

// ---------------------------------------------------------------------------
// Types (mirrors DB schema – swap to Drizzle select types when DB is wired)
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
  inStock: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Mock data (aligned with frontend mock-data.tsx)
// ---------------------------------------------------------------------------
const products: Product[] = [
  { id: 1, name: "Premium Grip Socks", brand: "ToeSox", description: "Non-slip Pilates socks with full-toe design for maximum grip on reformer and mat.", price: 18, rating: 4.8, category: "Accessories", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 2, name: "Reformer Straps", brand: "Balanced Body", description: "Padded reformer loop straps for comfortable and secure hand/foot placement.", price: 45, rating: 4.9, category: "Equipment", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 3, name: "Pilates Ring", brand: "STOTT", description: "14-inch magic circle with padded handles for inner/outer thigh and arm toning.", price: 28, rating: 4.6, category: "Equipment", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 4, name: "Cork Yoga Mat", brand: "Manduka", description: "Eco-friendly cork surface with natural rubber base. 5mm thick for joint cushioning.", price: 89, rating: 4.7, category: "Mats", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 5, name: "Resistance Band Set", brand: "TheraBand", description: "Set of 5 colour-coded bands from light to extra-heavy resistance.", price: 32, rating: 4.5, category: "Equipment", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 6, name: "Foam Roller", brand: "TriggerPoint", description: "GRID pattern foam roller for deep-tissue myofascial release and recovery.", price: 35, rating: 4.8, category: "Recovery", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 7, name: 'Pilates Ball 9"', brand: "OPTP", description: "Soft, inflatable mini stability ball for core engagement and alignment work.", price: 12, rating: 4.4, category: "Equipment", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 8, name: "Grip Gloves", brand: "Gaiam", description: "Fingerless grip gloves with silicone dots for improved equipment handling.", price: 22, rating: 4.3, category: "Accessories", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 9, name: "Spine Corrector", brand: "Peak Pilates", description: "Professional-grade spine corrector for back extension and abdominal work.", price: 195, rating: 4.9, category: "Equipment", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 10, name: "Workout Leggings", brand: "Lululemon", description: "High-waist Align leggings with four-way stretch and moisture-wicking fabric.", price: 98, rating: 4.7, category: "Apparel", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 11, name: "Sports Bra", brand: "Alo Yoga", description: "Medium-support sports bra with breathable mesh panels and removable cups.", price: 68, rating: 4.6, category: "Apparel", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 12, name: "Water Bottle", brand: "Hydro Flask", description: "24oz insulated stainless steel bottle keeps water cold for 24 hours.", price: 42, rating: 4.8, category: "Accessories", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 13, name: "Massage Gun", brand: "Theragun", description: "Percussive therapy device with 5 speed settings and 4 attachment heads.", price: 299, rating: 4.9, category: "Recovery", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 14, name: "Jump Board", brand: "Balanced Body", description: "Reformer jump board attachment for low-impact cardio and plyometric training.", price: 245, rating: 4.7, category: "Equipment", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 15, name: "Towel Set", brand: "Manduka", description: "Microfiber towel set (small + large) with quick-dry and anti-bacterial properties.", price: 36, rating: 4.5, category: "Accessories", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 16, name: "Ankle Weights", brand: "Bala", description: "Stylish 1lb wrist/ankle weights with adjustable strap closure.", price: 55, rating: 4.6, category: "Equipment", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 17, name: "Pilates Box", brand: "STOTT", description: "Foam sitting box for reformer – used for seated, prone, and side-lying exercises.", price: 85, rating: 4.4, category: "Equipment", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 18, name: "Tank Top", brand: "Beyond Yoga", description: "Lightweight tank with open back design for breathability during class.", price: 58, rating: 4.5, category: "Apparel", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 19, name: "Stretching Strap", brand: "ProsourceFit", description: "10-loop stretching strap for flexibility training and assisted stretches.", price: 14, rating: 4.3, category: "Equipment", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
  { id: 20, name: "Gym Bag", brand: "Lululemon", description: "Spacious duffle bag with separate shoe compartment and yoga mat straps.", price: 128, rating: 4.7, category: "Accessories", imageUrl: null, inStock: true, createdAt: "2024-01-10T10:00:00Z" },
];

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/products
 * Query params: ?category=Equipment
 */
router.get("/products", (req, res) => {
  let results = [...products];

  const category = req.query["category"] as string | undefined;
  if (category) {
    results = results.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase(),
    );
  }

  res.json(results);
});

/**
 * GET /api/products/:id
 */
router.get("/products/:id", (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const product = products.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(product);
});

export default router;
