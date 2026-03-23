import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, CreditCard, Loader2, Lock, MapPin, Package, ShoppingBag, Tag, Truck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const shippingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().optional(),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING_COST = 5.99;
const STEPS = ["Shipping", "Payment", "Confirmation"] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function generateOrderNumber(): string {
  const prefix = "PH";
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

function getDeliveryEstimate(): string {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() + 3);
  const to = new Date(now);
  to.setDate(to.getDate() + 5);
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  return `${fmt(from)} - ${fmt(to)}`;
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------
function StepIndicator({ current }: { current: number }) {
  const icons = [MapPin, CreditCard, Package];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const Icon = icons[i];
        const isActive = i === current;
        const isComplete = i < current;
        return (
          <div key={label} className="flex items-center">
            {i > 0 && (
              <div
                className={`w-10 sm:w-16 h-0.5 transition-colors duration-500 ${
                  isComplete ? "bg-primary" : "bg-border"
                }`}
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isComplete
                    ? "bg-primary text-primary-foreground shadow-md"
                    : isActive
                      ? "bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? <Check className="w-4.5 h-4.5" /> : <Icon className="w-4.5 h-4.5" />}
              </div>
              <span
                className={`text-[11px] font-semibold tracking-wide ${
                  isActive ? "text-primary" : isComplete ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 : Shipping
// ---------------------------------------------------------------------------
function ShippingStep({
  onContinue,
  defaultValues,
}: {
  onContinue: (data: ShippingFormData) => void;
  defaultValues: Partial<ShippingFormData>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { country: "France", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onContinue)} className="animate-in fade-in slide-in-from-right-4 duration-300">
      <Card className="border-0 shadow-lg bg-card">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Shipping Information</h2>
          </div>

          {/* Name & Email */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="checkout-name"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Full Name
              </label>
              <Input
                id="checkout-name"
                {...register("name")}
                placeholder="Emma Dubois"
                className="h-11 rounded-xl bg-background"
              />
              {errors.name && <p className="text-xs text-destructive mt-0.5">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="checkout-email"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Email
              </label>
              <Input
                id="checkout-email"
                {...register("email")}
                type="email"
                placeholder="emma@example.com"
                className="h-11 rounded-xl bg-background"
              />
              {errors.email && <p className="text-xs text-destructive mt-0.5">{errors.email.message}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label
              htmlFor="checkout-address"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Street Address
            </label>
            <Input
              id="checkout-address"
              {...register("address")}
              placeholder="12 Rue de Rivoli"
              className="h-11 rounded-xl bg-background"
            />
            {errors.address && <p className="text-xs text-destructive mt-0.5">{errors.address.message}</p>}
          </div>

          {/* City, Postal, Country */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="checkout-city"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                City
              </label>
              <Input
                id="checkout-city"
                {...register("city")}
                placeholder="Paris"
                className="h-11 rounded-xl bg-background"
              />
              {errors.city && <p className="text-xs text-destructive mt-0.5">{errors.city.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="checkout-postalCode"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Postal Code
              </label>
              <Input
                id="checkout-postalCode"
                {...register("postalCode")}
                placeholder="75001"
                className="h-11 rounded-xl bg-background"
              />
              {errors.postalCode && <p className="text-xs text-destructive mt-0.5">{errors.postalCode.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="checkout-country"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Country
              </label>
              <Input
                id="checkout-country"
                {...register("country")}
                placeholder="France"
                className="h-11 rounded-xl bg-background"
              />
              {errors.country && <p className="text-xs text-destructive mt-0.5">{errors.country.message}</p>}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label
              htmlFor="checkout-phone"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Phone <span className="text-muted-foreground/60 normal-case tracking-normal font-normal">(optional)</span>
            </label>
            <Input
              id="checkout-phone"
              {...register("phone")}
              type="tel"
              placeholder="+33 6 12 34 56 78"
              className="h-11 rounded-xl bg-background"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 mt-2 bg-primary hover:bg-primary/85 text-white font-bold text-sm rounded-xl shadow-lg btn-premium"
          >
            Continue to Payment
            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Step 2 : Payment
// ---------------------------------------------------------------------------
function PaymentStep({
  cartItems,
  subtotal,
  shipping,
  total,
  onPlaceOrder,
  onBack,
  isProcessing,
}: {
  cartItems: { product: { id: number; name: string; brand: string; price: number; imageUrl: string }; qty: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  onPlaceOrder: () => void;
  onBack: () => void;
  isProcessing: boolean;
}) {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "PILATES10") {
      setPromoApplied(true);
      toast.success("Promo code applied! 10% off.");
    } else if (promoCode.trim()) {
      toast.error("Invalid promo code");
    }
  };

  const discount = promoApplied ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const finalTotal = Math.round((total - discount) * 100) / 100;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Order Summary */}
      <Card className="border-0 shadow-lg bg-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Order Summary</h2>
          </div>

          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 py-2">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.product.brand} &middot; Qty: {item.qty}
                  </p>
                </div>
                <p className="font-bold text-sm text-foreground whitespace-nowrap">
                  &euro;{(item.product.price * item.qty).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>&euro;{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                Shipping
              </span>
              <span>
                {shipping === 0 ? (
                  <span className="text-green-600 font-semibold">Free</span>
                ) : (
                  `\u20AC${shipping.toFixed(2)}`
                )}
              </span>
            </div>
            {promoApplied && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Promo (PILATES10)
                </span>
                <span>-&euro;{discount.toFixed(2)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">&euro;{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promo Code */}
      <Card className="border-0 shadow-lg bg-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Promo Code</span>
          </div>
          <div className="flex gap-2">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter code"
              className="h-10 rounded-xl bg-background flex-1"
              disabled={promoApplied}
            />
            <Button
              type="button"
              variant="outline"
              onClick={applyPromo}
              disabled={promoApplied || !promoCode.trim()}
              className="h-10 rounded-xl px-5 font-semibold"
            >
              {promoApplied ? "Applied" : "Apply"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method (mock) */}
      <Card className="border-0 shadow-lg bg-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Payment Method</h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white p-5 shadow-xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="relative">
              <div className="flex justify-between items-start mb-8">
                <div className="w-10 h-7 rounded bg-amber-400/90 flex items-center justify-center">
                  <div className="w-6 h-4 rounded-sm border border-amber-600/40 bg-amber-300/40" />
                </div>
                <span className="text-xs font-bold tracking-widest opacity-70">VISA</span>
              </div>
              <p className="font-mono text-lg tracking-[0.2em] mb-4 opacity-90">
                &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase tracking-wider opacity-50 mb-0.5">Card Holder</p>
                  <p className="text-sm font-semibold tracking-wide">EMMA DUBOIS</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider opacity-50 mb-0.5">Expires</p>
                  <p className="text-sm font-semibold">12/27</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Secured with 256-bit SSL encryption</span>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="h-12 rounded-xl px-5 font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back
        </Button>
        <Button
          type="button"
          onClick={onPlaceOrder}
          disabled={isProcessing}
          className="flex-1 h-12 rounded-xl bg-accent-cta hover:bg-accent-cta/85 text-white font-bold text-sm shadow-lg btn-premium"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Place Order &mdash; &euro;{finalTotal.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 : Confirmation
// ---------------------------------------------------------------------------
function ConfirmationStep({
  orderNumber,
  cartItems,
  subtotal,
  shipping,
  total,
}: {
  orderNumber: string;
  cartItems: { product: { id: number; name: string; brand: string; price: number; imageUrl: string }; qty: number }[];
  subtotal: number;
  shipping: number;
  total: number;
}) {
  const [, navigate] = useLocation();
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCheck(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Success hero */}
      <div className="text-center py-6">
        <div className="relative mx-auto w-20 h-20 mb-5">
          <div
            className={`absolute inset-0 rounded-full bg-green-500/15 transition-transform duration-700 ease-out ${
              showCheck ? "scale-100" : "scale-0"
            }`}
          />
          <div
            className={`absolute inset-2 rounded-full bg-green-500/25 transition-transform duration-500 delay-150 ease-out ${
              showCheck ? "scale-100" : "scale-0"
            }`}
          />
          <div
            className={`absolute inset-4 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30 transition-all duration-500 delay-300 ease-out ${
              showCheck ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            <Check className="w-6 h-6 text-white" strokeWidth={3} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Order Confirmed!</h2>
        <p className="text-muted-foreground text-sm">Thank you for your purchase</p>
      </div>

      {/* Order details */}
      <Card className="border-0 shadow-lg bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Order Number
              </p>
              <p className="font-bold text-foreground font-mono">{orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Estimated Delivery
              </p>
              <p className="font-bold text-foreground flex items-center gap-1.5 justify-end">
                <Truck className="w-4 h-4 text-primary" />
                {getDeliveryEstimate()}
              </p>
            </div>
          </div>

          <div className="bg-primary/5 rounded-xl p-3 text-center">
            <p className="text-sm text-primary font-semibold">3-5 business days delivery</p>
          </div>

          <Separator />

          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                </div>
                <p className="font-bold text-sm">&euro;{(item.product.price * item.qty).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>&euro;{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>
                {shipping === 0 ? (
                  <span className="text-green-600 font-semibold">Free</span>
                ) : (
                  `\u20AC${shipping.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Total</span>
              <span className="text-primary">&euro;{total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => toast.info("Order tracking coming soon!")}
          className="flex-1 h-12 rounded-xl font-semibold"
        >
          <Package className="w-4 h-4 mr-2" />
          Track Order
        </Button>
        <Button
          onClick={() => navigate("/store")}
          className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/85 text-white font-bold shadow-lg btn-premium"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main CheckoutPage
// ---------------------------------------------------------------------------
export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { cartItems, cartTotal, clearCart } = useApp();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Snapshot cart items before clearing so confirmation can display them
  const snapshotRef = useRef(cartItems);

  const subtotal = step < 2 ? cartTotal : snapshotRef.current.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = Math.round((subtotal + shipping) * 100) / 100;
  const displayItems = step < 2 ? cartItems : snapshotRef.current;

  // Redirect if cart is empty and not on confirmation
  useEffect(() => {
    if (cartItems.length === 0 && step < 2) {
      navigate("/store");
    }
  }, [cartItems.length, step, navigate]);

  const handleShippingContinue = useCallback((data: ShippingFormData) => {
    setShippingData(data);
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    setIsProcessing(true);

    // Take snapshot before clearing
    snapshotRef.current = [...cartItems];

    // Simulate payment processing (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Try API call (non-blocking — still works if API is down)
    try {
      const token = localStorage.getItem("pilateshub-token");
      await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          items: cartItems.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            quantity: i.qty,
            unitPrice: i.product.price,
          })),
          shippingInfo: shippingData,
          totalAmount: total,
        }),
      });
    } catch {
      // Non-critical — order confirmation still shown
    }

    const num = generateOrderNumber();
    setOrderNumber(num);
    clearCart();
    setIsProcessing(false);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [cartItems, shippingData, total, clearCart]);

  return (
    <div className="min-h-full bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          {step < 2 ? (
            <button
              type="button"
              onClick={() => (step === 0 ? navigate("/store") : setStep(0))}
              className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 0 ? "Store" : "Shipping"}
            </button>
          ) : (
            <div />
          )}
          <h1 className="text-sm font-bold text-foreground tracking-wide">Checkout</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        <StepIndicator current={step} />

        {/* Free shipping banner */}
        {step < 2 && subtotal < FREE_SHIPPING_THRESHOLD && (
          <div className="mb-5 rounded-xl bg-primary/5 border border-primary/10 px-4 py-3 text-center">
            <p className="text-xs font-semibold text-primary">
              <Truck className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Add &euro;{(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping
            </p>
          </div>
        )}

        {step === 0 && (
          <ShippingStep
            onContinue={handleShippingContinue}
            defaultValues={{
              name: user?.name || "",
              email: user?.email || "",
            }}
          />
        )}

        {step === 1 && (
          <PaymentStep
            cartItems={displayItems}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
            onPlaceOrder={handlePlaceOrder}
            onBack={() => {
              setStep(0);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            isProcessing={isProcessing}
          />
        )}

        {step === 2 && (
          <ConfirmationStep
            orderNumber={orderNumber}
            cartItems={displayItems}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
          />
        )}
      </div>
    </div>
  );
}
