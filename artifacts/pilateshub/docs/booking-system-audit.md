# PilatesHub Booking System Audit

**Date:** 2026-03-24
**Scope:** Full audit of current booking implementation vs. ClassPass model

---

## 1. Our Current State

### What Exists

**Frontend — BookingPage.tsx (`/booking/:studioId`)**

A 4-step wizard UI: Select Class > Select Time > Confirm & Pay > Done.

- **Step 1 — Class selection:** Renders from `MOCK_CLASSES`, a hardcoded array of 6 classes defined inline in the component. Class names, coaches, durations, levels, and prices are all fake. Prices are derived from the studio's base `price` field with a cosmetic formula (`studio.price + (mockPrice - 45) * 0.8`). Coach names are randomly picked from the studio's coach list using modulo indexing.
- **Step 2 — Time slot selection:** `generateSlots()` creates a grid of 10 fixed time strings across 7 days. "Full" slots are determined by a deterministic hash (`(d * 17 + idx * 7) % 10 < 2`), not real capacity data. No API call.
- **Step 3 — Confirm & Pay:** Shows a price breakdown with a hardcoded `SERVICE_FEE = 2.5 EUR`. Payment method is a static "Visa ending in 4242" card — no Stripe, no payment integration whatsoever. The "Confirm" button runs a `setTimeout(1800ms)` to simulate processing, then advances to step 4. **No API call is made. No booking is persisted.**
- **Step 4 — Confirmation:** Displays a fake booking reference generated from `Date.now().toString(36)`. "Add to Calendar" button shows a toast placeholder.

**Frontend — StudioDetailDialog.tsx**

- Shows 5 hardcoded time slots ("09:00", "11:30", "14:00", "17:00", "19:30") under "Available Today". These are static, not fetched from any schedule.
- "Book a Session" navigates to `/booking/:studioId`. The selected time slot from this dialog is NOT passed to BookingPage.

**Frontend — MePage.tsx (Booking History)**

- "Upcoming Sessions" and "Booking History" sections are both hardcoded arrays rendered inline. No API calls to `/api/bookings`.
- "Reschedule" button shows `toast.info("Reschedule request sent.")`. "Cancel" button shows `toast.warning("Booking cancelled.")`. Neither calls the API.

**API — bookings.ts**

- `GET /api/bookings` — Returns bookings for hardcoded `MOCK_USER_ID = 1`. Works with DB when available, falls back to 3 mock bookings. Filters out cancelled bookings.
- `POST /api/bookings` — Accepts `{ classId, studioId, timeSlot }`. Checks for duplicate active bookings. Inserts into DB or mock array. Returns the new booking with joined class/studio names.
- `DELETE /api/bookings/:id` — Soft-cancels by setting `status = "cancelled"` and `cancelledAt = now()`.

**API — classes.ts**

- `GET /api/classes` — Returns classes with optional `?studioId` and `?type` filters. Joins studio and coach names. Falls back to 10 mock classes.
- `GET /api/classes/:id` — Returns a single class by ID.

**API hooks (use-api.ts)**

- `useBookings()` — Query hook for `GET /api/bookings`. Exists but is NOT used by MePage or BookingPage.
- `useCreateBooking()` — Mutation hook for `POST /api/bookings`. Exists but is NOT called from BookingPage.

**Database Schema (schema/index.ts)**

- `classes` table: `id, studioId, coachId, title, type, level, description, duration, maxCapacity, price, scheduledAt, createdAt`. Has `maxCapacity` but no `currentBookings` or enrollment count.
- `bookings` table: `id, userId, classId, studioId, status, timeSlot, bookedAt, cancelledAt`. Status enum: confirmed/cancelled/completed.

### Summary of What's Real vs. Fake

| Component | Status |
|---|---|
| Booking API (CRUD) | **Real** — works with DB, has mock fallback |
| Classes API | **Real** — works with DB, has mock fallback |
| DB schema for bookings + classes | **Real** — tables exist with proper relations |
| API hooks (useBookings, useCreateBooking) | **Real** — defined but unused |
| BookingPage class list | **Fake** — hardcoded `MOCK_CLASSES` array, ignores API |
| BookingPage time slots | **Fake** — generated client-side with a hash function |
| BookingPage payment | **Fake** — no Stripe, no real payment, setTimeout simulation |
| BookingPage booking creation | **Fake** — never calls POST /api/bookings |
| MePage upcoming sessions | **Fake** — hardcoded array, never calls GET /api/bookings |
| MePage cancel/reschedule | **Fake** — toast messages only, no API calls |
| Spot availability / capacity | **Fake** — `spotsLeft` is hardcoded per mock class |
| Cancellation policy enforcement | **Non-existent** — text says "12 hours" but nothing enforces it |

### What's Broken / Disconnected

1. **The frontend and backend are completely disconnected for bookings.** The API exists, the hooks exist, but BookingPage never calls them. You can complete the entire booking flow and nothing is saved.
2. **MePage shows stale hardcoded data** instead of fetching real bookings from the API.
3. **Classes API is never called by BookingPage.** The page generates its own fake classes instead of fetching real ones for the studio.
4. **No capacity tracking.** The `classes` table has `maxCapacity` but there's no way to count current bookings against it, no spots-remaining calculation, no sold-out logic.
5. **No payment infrastructure.** No Stripe integration, no payment intent creation, no webhook handling.
6. **No user authentication tied to bookings.** Everything uses `MOCK_USER_ID = 1`.

---

## 2. ClassPass Model

### How ClassPass Booking Works

ClassPass is a marketplace/aggregator connecting users to fitness studios, spas, and wellness services through a unified **credit-based** subscription system.

**Credit System:**
- Members pay a monthly subscription ($19–$249/month) and receive a fixed number of credits (8–125 credits/cycle).
- Credits are the universal currency for booking any class, appointment, or experience across all partner studios.
- Unused credits roll over monthly (up to next month's plan amount) as long as the subscription remains active.
- Members can purchase additional credit packs if they run out mid-cycle.

**Dynamic Pricing (Credit Costs):**
- Each class costs a variable number of credits, determined algorithmically based on:
  - Studio's base pricing and market positioning
  - Time of day (peak evening/weekend slots cost more credits)
  - Overall demand and popularity of the class
  - How close to start time the booking is made
  - Seasonal trends
- Credit costs are NOT personalized per user — they reflect aggregate demand, not individual loyalty or visit frequency.
- Studios can influence pricing through ClassPass's "SmartRate" tool.

**Booking Flow:**
1. Browse/search by location, time, class type, or studio
2. See class cards with credit cost prominently displayed
3. Tap to view details (description, instructor, reviews, cancellation policy)
4. One-tap "Reserve" — credits are deducted instantly
5. Confirmation with calendar add, directions, check-in instructions

**Cancellation Policy:**
- Free cancellation up to 12 hours before class start — credits refunded in full.
- Late cancellation (within 12 hours) — credits are forfeited AND an additional monetary fee may apply (varies by studio/location).
- No-show — same penalty as late cancel, potentially stricter.
- Fee amounts are displayed during the booking flow before you confirm.

**Waitlist:**
- ClassPass does NOT currently offer a waitlist feature (as of 2025). They advise users to check back periodically for opened spots.

**Studio Frequency:**
- No hard cap on visits to the same studio (removed in 2018 with the credit system). The credit pricing mechanism naturally manages demand — popular studios cost more credits.

**Studio Partner Model:**
- Studios negotiate per-visit payout rates with ClassPass (typically 30-50% of their retail rate).
- Studios connect their existing scheduling platform (Mindbody, Xplor, etc.) for real-time schedule sync.
- ClassPass fills empty spots that studios would otherwise lose revenue on.
- Studios get access to SmartRate (dynamic pricing), analytics dashboards, and new customer acquisition.
- Payments are bi-weekly or monthly via direct deposit.

### Key Characteristics of the ClassPass Model

1. **ClassPass is an aggregator, not a single-studio platform.** Its value proposition is variety across many studios.
2. **Credits abstract away money.** Users think in credits, not euros. This increases willingness to book.
3. **Dynamic pricing optimizes yield.** Off-peak classes are cheaper (more bookings), peak classes are premium (more revenue per spot).
4. **No payment per booking.** The subscription is the only monetary transaction. Booking is friction-free (just credits).
5. **Real-time capacity.** ClassPass syncs with studio scheduling software to show actual availability and prevent overbooking.

---

## 3. Gap Analysis

### Critical Gaps (Booking Doesn't Work)

| Gap | Current State | Required |
|---|---|---|
| Frontend-API connection | BookingPage never calls API | Must call POST /api/bookings on confirm |
| Real class data | Hardcoded MOCK_CLASSES array | Fetch from GET /api/classes?studioId=X |
| Real time slots | Generated with hash function | Derive from classes.scheduledAt in DB |
| Booking persistence | Nothing saved on "confirm" | DB insert with proper status tracking |
| MePage booking display | Hardcoded arrays | Fetch from GET /api/bookings |
| Cancel functionality | Toast only | Call DELETE /api/bookings/:id |

### Major Gaps (Core Booking Features)

| Gap | Current State | Required |
|---|---|---|
| Payment processing | Fake Visa 4242 | Stripe integration (payment intents, webhooks) |
| User authentication | MOCK_USER_ID = 1 | Real auth tied to booking ownership |
| Capacity management | No tracking | Count bookings per class, enforce maxCapacity |
| Cancellation enforcement | Text-only policy | Time-based logic, refund rules, penalty charges |
| Booking date/time | timeSlot is just a string "09:00" | Full datetime from classes.scheduledAt |

### Feature Gaps (ClassPass Parity)

| Gap | ClassPass Has | We Have |
|---|---|---|
| Credit system | Monthly credit allocation, dynamic costs | Per-class EUR pricing only |
| Subscription plans | Tiered monthly plans ($19-$249) | No subscription model |
| Dynamic pricing | Algorithm-based credit costs | Static price per studio |
| Real-time availability | Schedule sync with studio software | No real availability data |
| Cancellation fees | Monetary penalties for late cancel | No enforcement |
| Booking modifications | Reschedule support | Toast placeholder only |
| Multi-studio discovery | Core feature, browse by credits | We have studio discovery but no unified booking currency |
| Booking confirmation email | Email + push + calendar | Toast notification only |
| Check-in verification | QR or location-based | Toast placeholder |

### What We Should NOT Copy from ClassPass

1. **Aggregator model complexity** — ClassPass negotiates with thousands of studios, manages payout splits, handles scheduling platform integrations. We don't need this if we're a direct booking platform.
2. **SmartRate / per-studio negotiation** — Overkill for our current scale.
3. **No waitlist** — ClassPass doesn't even have this. We can skip it for now without being behind.

---

## 4. Recommendations: Our Booking Model

### Recommended Model: Hybrid (Per-Class + Optional Credit Packs)

PilatesHub is not an aggregator like ClassPass. We are a Pilates-focused community platform with studio discovery and booking. Our model should be simpler but still modern.

**Phase 1 — Per-Class Booking (Direct Pay)**
- Users pay per class in EUR via Stripe.
- Price is set by the studio (stored in `classes.price`).
- PilatesHub charges a service fee (flat or percentage).
- This is the simplest model that actually works and generates revenue.

**Phase 2 — Credit Packs (Optional Add-On)**
- Offer prepaid credit packs (e.g., 10 credits for 35 EUR, 25 credits for 80 EUR).
- 1 credit = 1 class booking (no dynamic pricing initially).
- Credits expire after 3 months.
- Discount vs. per-class pricing incentivizes bulk purchase and commitment.
- This adds retention without the complexity of subscriptions.

**Phase 3 — Subscription (Future)**
- Monthly plans with credit allocations (similar to ClassPass tiers).
- Only pursue this once there are enough studios and classes to justify a subscription.
- Dynamic credit pricing based on class popularity / time slot.

**Why Not Jump Straight to Credits/Subscriptions:**
- We need real bookings working first (Phase 1 is a prerequisite).
- Subscription models require enough class inventory to justify recurring cost.
- Per-class is easier to reason about for both users and studios.
- We can layer credits on top without disrupting per-class flow.

---

## 5. Technical Requirements

### Database Schema Changes

**New tables needed:**

```sql
-- Payment records
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  booking_id INTEGER REFERENCES bookings(id),
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL,          -- in cents
  service_fee INTEGER NOT NULL,     -- in cents
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(20) NOT NULL,      -- pending, succeeded, failed, refunded
  created_at TIMESTAMP DEFAULT NOW()
);

-- Credit packs (Phase 2)
CREATE TABLE credit_packs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,       -- "10 Class Pack"
  credits INTEGER NOT NULL,         -- number of credits
  price INTEGER NOT NULL,           -- price in cents
  expires_in_days INTEGER DEFAULT 90,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User credit balances (Phase 2)
CREATE TABLE user_credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  credit_pack_id INTEGER REFERENCES credit_packs(id),
  total_credits INTEGER NOT NULL,
  remaining_credits INTEGER NOT NULL,
  purchased_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Cancellation log
CREATE TABLE cancellations (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) NOT NULL,
  reason TEXT,
  penalty_amount INTEGER DEFAULT 0, -- in cents
  refund_amount INTEGER DEFAULT 0,  -- in cents
  is_late BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP DEFAULT NOW()
);
```

**Modify existing tables:**

```sql
-- bookings: add payment tracking and richer status
ALTER TABLE bookings ADD COLUMN payment_id INTEGER REFERENCES payments(id);
ALTER TABLE bookings ADD COLUMN credit_id INTEGER REFERENCES user_credits(id); -- Phase 2
ALTER TABLE bookings ADD COLUMN completed_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN no_show BOOLEAN DEFAULT FALSE;

-- classes: add recurrence and enrollment tracking
ALTER TABLE classes ADD COLUMN current_enrollment INTEGER DEFAULT 0;
ALTER TABLE classes ADD COLUMN recurring_rule TEXT;  -- iCal RRULE or simple pattern
ALTER TABLE classes ADD COLUMN booking_opens_at TIMESTAMP;
ALTER TABLE classes ADD COLUMN booking_closes_at TIMESTAMP;
```

### API Changes

**New endpoints needed:**

| Endpoint | Purpose |
|---|---|
| `POST /api/payments/create-intent` | Create Stripe PaymentIntent before confirming booking |
| `POST /api/payments/webhook` | Handle Stripe webhook (payment_intent.succeeded, etc.) |
| `GET /api/classes/:id/availability` | Return spots remaining (maxCapacity - currentEnrollment) |
| `POST /api/bookings/:id/cancel` | Cancel with time-based policy enforcement (replace DELETE) |
| `POST /api/bookings/:id/reschedule` | Move booking to different time slot |
| `GET /api/bookings/upcoming` | User's upcoming bookings with class/studio details |
| `GET /api/bookings/past` | User's completed booking history |

**Modify existing endpoints:**

| Endpoint | Changes Needed |
|---|---|
| `POST /api/bookings` | Require valid payment_id or credit deduction. Check capacity before insert. Increment class enrollment. |
| `GET /api/bookings` | Add filters for status, date range. Return richer data (class details, cancellation deadline). |
| `DELETE /api/bookings/:id` | Replace with POST cancel endpoint that enforces time-based policy. |

### Frontend Changes

**BookingPage.tsx — Must be rewritten:**

1. Step 1: Fetch real classes via `GET /api/classes?studioId=X`. Display actual schedule from `scheduledAt`.
2. Step 2: Show real availability per time slot (spots remaining from API).
3. Step 3: Create Stripe PaymentIntent, show real payment form (Stripe Elements), display actual cancellation deadline.
4. Step 4: Only show confirmation after API confirms booking (POST /api/bookings succeeds AND payment succeeds).
5. Remove all `MOCK_CLASSES`, `generateSlots()`, `setTimeout` payment simulation.

**MePage.tsx — Must connect to API:**

1. Fetch upcoming bookings from `GET /api/bookings/upcoming`.
2. Fetch past bookings from `GET /api/bookings/past`.
3. Wire cancel button to `POST /api/bookings/:id/cancel`.
4. Wire reschedule button to open reschedule flow.

**StudioDetailDialog.tsx:**

1. Fetch today's available classes from `GET /api/classes?studioId=X`.
2. Show real availability instead of hardcoded time badges.
3. Pass selected class/time to BookingPage when navigating.

### External Integrations

| Integration | Purpose | Priority |
|---|---|---|
| **Stripe** | Payment processing, refunds, webhook handling | P0 — required for real bookings |
| **SendGrid / Resend** | Booking confirmation emails | P1 — expected by users |
| **Calendar (ICS)** | Generate downloadable .ics file for "Add to Calendar" | P1 — simple to implement |
| **Push notifications** | Booking reminders, cancellation alerts | P2 — already have notification infrastructure |

---

## 6. Priority Roadmap

### Phase 0: Wire Up What Exists (1-2 days)
**Goal:** Make the booking flow actually persist data, even without payment.

- [ ] BookingPage Step 1: Replace `MOCK_CLASSES` with `GET /api/classes?studioId=X`
- [ ] BookingPage Step 2: Derive time slots from `classes.scheduledAt` instead of `generateSlots()`
- [ ] BookingPage Step 3: Call `POST /api/bookings` on confirm (skip payment for now)
- [ ] BookingPage Step 4: Show real booking reference from API response
- [ ] MePage: Fetch and display real bookings from `GET /api/bookings`
- [ ] MePage: Wire cancel button to `DELETE /api/bookings/:id`
- [ ] StudioDetailDialog: Fetch real classes for "Available Today"

### Phase 1: Real Payments (3-5 days)
**Goal:** Users can pay for classes with a real credit card.

- [ ] Add Stripe dependency, configure keys
- [ ] Create `payments` table
- [ ] Build `POST /api/payments/create-intent` endpoint
- [ ] Add Stripe Elements payment form to BookingPage Step 3
- [ ] Build `POST /api/payments/webhook` to confirm payment
- [ ] Only create booking after payment succeeds (webhook-driven)
- [ ] Add `payment_id` to bookings table
- [ ] Handle payment failures gracefully in UI

### Phase 2: Capacity & Cancellation (2-3 days)
**Goal:** Prevent overbooking and enforce cancellation rules.

- [ ] Add `current_enrollment` to classes table
- [ ] Increment on booking, decrement on cancel
- [ ] Build `GET /api/classes/:id/availability` endpoint
- [ ] Show real "X spots left" in BookingPage
- [ ] Block booking when class is full
- [ ] Build `POST /api/bookings/:id/cancel` with 12-hour policy
- [ ] Create `cancellations` table for audit trail
- [ ] Handle refunds through Stripe for valid cancellations
- [ ] Apply late-cancel fees

### Phase 3: Booking Experience Polish (2-3 days)
**Goal:** Match user expectations for a modern booking platform.

- [ ] Booking confirmation emails (SendGrid/Resend)
- [ ] ICS calendar file generation for "Add to Calendar"
- [ ] Push notification reminders (24h and 2h before class)
- [ ] Reschedule flow (cancel + rebook with credit)
- [ ] Booking history with status badges on MePage
- [ ] Studio-side view: see who's booked for their classes

### Phase 4: Credit Packs (5-7 days)
**Goal:** Add optional credit-based purchasing for retention.

- [ ] Create `credit_packs` and `user_credits` tables
- [ ] Build credit pack purchase flow (Stripe one-time payment)
- [ ] Allow booking with credits OR direct payment
- [ ] Credit balance display on MePage
- [ ] Credit expiration tracking and notifications
- [ ] Credit refund on valid cancellation

### Phase 5: Subscriptions & Dynamic Pricing (Future)
**Goal:** Recurring revenue model with demand-based pricing.

- [ ] Monthly subscription plans with Stripe Billing
- [ ] Credit allocation per billing cycle
- [ ] Dynamic credit pricing based on class popularity and time
- [ ] Credit rollover logic
- [ ] Plan upgrade/downgrade flows

---

## Sources

- [How ClassPass Credits Work](https://classpass.com/blog/how-classpass-credits-work/)
- [ClassPass Plans & Pricing](https://classpass.com/plans)
- [How are credit rates determined? (ClassPass Help)](https://help.classpass.com/hc/en-us/articles/360002360052-How-are-credit-rates-determined)
- [What is the reservation cancellation policy? (ClassPass Help)](https://help.classpass.com/hc/en-us/articles/207942743-What-is-the-reservation-cancellation-policy)
- [Is there a waitlist available? (ClassPass Help)](https://help.classpass.com/hc/en-us/articles/205095215-A-reservation-I-want-is-booked-Is-there-a-waitlist-available)
- [How ClassPass Works For Businesses](https://classpass.com/partners/how-it-works)
- [ClassPass Payouts, Pricing, and Policies](https://classpass.com/partners/blog/classpass-payouts-pricing-policies-rates)
- [ClassPass Pricing 2026 (Exercise.com)](https://www.exercise.com/grow/how-much-does-classpass-cost/)
- [Why do class credits vary from week to week? (ClassPass Help)](https://help.classpass.com/hc/en-us/articles/40825253236877-Why-do-class-credits-vary-from-week-to-week)
- [ClassPass Myth Busters: Credits, Pricing, and Availability](https://classpass.com/blog/classpass-myth-busters-credits-and-pricing/)
