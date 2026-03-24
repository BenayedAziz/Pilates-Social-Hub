import { Router, type IRouter } from "express";
import { optionalAuth } from "../middleware/auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface ShippingInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface Order {
  id: string;
  userId: number;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------
const orders: Order[] = [];
let orderCounter = 1000;

function generateOrderId(): string {
  orderCounter += 1;
  const ts = Date.now().toString(36).toUpperCase();
  return `PH-${ts}-${orderCounter}`;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * POST /api/orders
 * Create a new order.
 * Body: { items, shippingInfo, totalAmount }
 */
router.post("/orders", optionalAuth, (req, res) => {
  const { items, shippingInfo, totalAmount, paymentIntentId } = req.body as {
    items?: OrderItem[];
    shippingInfo?: ShippingInfo;
    totalAmount?: number;
    paymentIntentId?: string;
  };

  if (!items || items.length === 0) {
    res.status(400).json({ error: "items are required" });
    return;
  }
  if (!shippingInfo) {
    res.status(400).json({ error: "shippingInfo is required" });
    return;
  }
  if (!totalAmount || totalAmount <= 0) {
    res.status(400).json({ error: "valid totalAmount is required" });
    return;
  }

  const order: Order & { paymentIntentId?: string } = {
    id: generateOrderId(),
    userId: req.user?.userId ?? 1, // fallback to mock user
    items,
    shippingInfo,
    totalAmount,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...(paymentIntentId ? { paymentIntentId } : {}),
  };

  orders.push(order);

  res.status(201).json(order);
});

/**
 * GET /api/orders
 * List orders for the current user.
 */
router.get("/orders", optionalAuth, (_req, res) => {
  const userId = _req.user?.userId ?? 1;
  const userOrders = orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(userOrders);
});

/**
 * GET /api/orders/:id
 * Get a single order by ID.
 */
router.get("/orders/:id", optionalAuth, (req, res) => {
  const userId = req.user?.userId ?? 1;
  const order = orders.find(
    (o) => o.id === req.params["id"] && o.userId === userId,
  );

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(order);
});

export default router;
