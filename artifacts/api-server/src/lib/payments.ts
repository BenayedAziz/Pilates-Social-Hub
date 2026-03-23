import Stripe from "stripe";
import { logger } from "./logger";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!STRIPE_SECRET_KEY) {
    logger.info("No STRIPE_SECRET_KEY — payments disabled, using mock mode");
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" });
  }
  return stripeClient;
}

export function isPaymentsEnabled(): boolean {
  return !!STRIPE_SECRET_KEY;
}

// Create a payment intent for a class booking
export async function createBookingPayment(amount: number, studioName: string, className: string, metadata: Record<string, string>): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  const stripe = getStripe();
  if (!stripe) {
    // Mock mode — return fake data
    return {
      clientSecret: `mock_secret_${Date.now()}`,
      paymentIntentId: `mock_pi_${Date.now()}`,
    };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // cents
    currency: "eur",
    description: `${className} at ${studioName}`,
    metadata,
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

// Create a payment intent for a product purchase
export async function createOrderPayment(amount: number, items: Array<{ name: string; quantity: number }>, metadata: Record<string, string>): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  const stripe = getStripe();
  if (!stripe) {
    return {
      clientSecret: `mock_secret_${Date.now()}`,
      paymentIntentId: `mock_pi_${Date.now()}`,
    };
  }

  const description = items.map(i => `${i.name} x${i.quantity}`).join(", ");
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "eur",
    description,
    metadata,
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}
