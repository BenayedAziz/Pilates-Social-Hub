# ClassPass Business Model Research for PilatesHub

**Research date:** March 2026
**Purpose:** Understand ClassPass end-to-end so we can design PilatesHub's booking and marketplace model.

---

## Table of Contents

1. [How ClassPass Works for Users](#1-how-classpass-works-for-users)
2. [How ClassPass Works for Studios](#2-how-classpass-works-for-studios)
3. [The Business Model](#3-the-business-model)
4. [How We Should Do It for PilatesHub](#4-how-we-should-do-it-for-pilateshub)
5. [Documents We Need](#5-documents-we-need)

---

## 1. How ClassPass Works for Users

### The Credit System

ClassPass operates on a **credit-based subscription model**. Users pay a monthly fee and receive a set number of credits they can spend on fitness classes, wellness appointments, salon services, and more.

**Current pricing tiers (2026, varies by city):**

| Plan       | Credits/Month | Price (USD) | Best For                     |
|------------|---------------|-------------|------------------------------|
| Starter    | 8 credits     | ~$19/mo     | 1-2 classes/month            |
| Basic      | 16 credits    | ~$39/mo     | ~3-4 classes/month           |
| Standard   | 28 credits    | ~$59/mo     | ~5-7 classes/month           |
| Premium    | 45 credits    | ~$79-$99/mo | ~8-12 classes/month          |
| Elite      | 80 credits    | ~$159/mo    | ~15-20 classes/month         |
| Max        | 125 credits   | ~$249/mo    | Unlimited-style heavy usage  |

- Prices vary significantly by market (urban areas are more expensive).
- In France, ClassPass operates via classpass.fr with euro pricing.
- Users can purchase additional credit packs mid-cycle if they run out.
- Unused credits roll over (up to a cap) or expire depending on the plan.

### How Dynamic Pricing Works

ClassPass uses a **dynamic, interest-based credit pricing** system similar to airline tickets or ride-hailing surge pricing. The credit cost for a single class varies based on:

1. **Popularity of the class** -- Classes with waitlists, star instructors, or consistently full rosters cost more credits.
2. **Time of day / day of week** -- Peak evening slots and weekend mornings cost more credits; early-morning and mid-day off-peak cost fewer.
3. **Location** -- Studios in premium neighborhoods or high-demand areas cost more.
4. **How far in advance you book** -- Booking further ahead may cost fewer credits; last-minute popular slots cost more.
5. **Studio pricing tier** -- Premium boutique studios (e.g., SLT, Barry's) cost more credits than community gyms.
6. **Supply/demand at that moment** -- Real-time adjustments based on remaining spots and booking velocity.

**Important:** ClassPass states they do NOT use individual user data to adjust pricing. The dynamic pricing is based on aggregate demand, not personal history.

**Typical credit costs per class:**
- Budget gym class: 2-4 credits
- Standard yoga/pilates: 5-10 credits
- Popular boutique studio (peak time): 12-20+ credits
- Premium studio (SLT, Barry's, etc.): 15-25+ credits

### Booking Flow Step by Step

1. **Open the app/website** -- User sees a personalized feed of classes nearby, filtered by activity type, time, location.
2. **Browse/search** -- Filter by activity (Pilates, yoga, boxing, etc.), date/time, location, studio name, or instructor.
3. **View class details** -- See studio info, instructor bio, class description, credit cost, available spots, studio photos, and reviews.
4. **Book with credits** -- Tap "Reserve" and credits are deducted from balance immediately.
5. **Confirmation** -- User gets an email confirmation and the class appears in "Upcoming" tab.
6. **Attend** -- Show up to the studio, check in (either via app or at front desk).
7. **Rate** -- After class, user can rate the experience (1-5 stars) and leave a review.

### Cancellation Policy

- **12+ hours before class:** Free cancellation; credits returned in full.
- **Less than 12 hours before class (late cancel):** Credits returned BUT a **late cancellation fee** is charged (typically $15).
- **No-show (miss without canceling):** Credits returned BUT a **no-show fee** of ~$20 is charged.
- **Frequent cancellations:** Repeated late cancels can trigger restrictions -- slower booking processing, reduced inventory access, or temporary booking limits.
- Studios still get paid for late cancellations (unless another ClassPass user fills the spot).

### Waitlist

As of late 2025, **ClassPass does not officially offer a waitlist feature** in the consumer app. Their help center states: "ClassPass does not have a reservation waitlist feature at this time." If a class is fully booked, ClassPass encourages users to keep checking back before the class start time in case spots open up via cancellations.

Some integrated studio software platforms (Mindbody, etc.) may support their own native waitlists, but this is separate from the ClassPass booking flow.

### What Users See in the App

- **Home feed:** Personalized class recommendations based on past behavior, location, and preferences.
- **Search/filters:** Activity type, date/time, distance, credit range, amenities, rating.
- **Studio profiles:** Photos, description, amenities, class schedule, average rating, reviews.
- **Class listings:** Instructor name, class description, credit cost (dynamically priced), available spots remaining.
- **Upcoming tab:** All booked classes with countdown timers and cancel buttons.
- **History tab:** Past classes with ratings.
- **Credits balance:** Always visible; shows remaining credits and cycle renewal date.
- **Explore/deals:** Special promotions, new studio highlights, curated lists.

---

## 2. How ClassPass Works for Studios

### How a Studio Joins ClassPass

1. **Visit classpass.com/partners** and fill out a form expressing interest.
2. Provide business details: location, business type (gym, studio, spa, salon), current scheduling platform, class types offered, and capacity information.
3. **ClassPass evaluates fit** based on geographic demand, existing inventory in the area, and studio quality. Not every studio is accepted -- ClassPass curates to maintain quality.
4. If accepted, ClassPass assigns a **partner onboarding specialist** who guides setup.
5. **No upfront cost** -- there is no fee to list on ClassPass and no ongoing fixed fees.

### Onboarding Process

1. **Integration setup** -- Connect your booking software (Mindbody, Glofox, Pike13, etc.) to ClassPass via API. This syncs your class schedule automatically.
2. **Profile creation** -- Set up your ClassPass studio page: upload photos, write descriptions, list amenities, describe class types.
3. **Rate negotiation** -- Agree on payout terms with ClassPass. This includes a base rate (floor) per booking, which varies by market, studio tier, and class type.
4. **Inventory settings** -- Choose which classes to list on ClassPass and how many spots per class to make available (you don't have to give ClassPass all your spots).
5. **Go live** -- Your classes appear on the ClassPass marketplace. The whole process takes a few weeks.
6. **Partner Dashboard access** -- Get access to ClassPass Partner Dashboard for monitoring bookings, revenue, and performance analytics.

### Revenue Share Model (How Much Studios Get Paid)

This is the most critical and controversial aspect of ClassPass:

**How it works:**
- ClassPass negotiates a **per-booking payout rate** with each studio individually.
- Studios have a **rate floor** -- a minimum guaranteed payout per ClassPass booking.
- The actual payout can be higher than the floor when ClassPass's SmartRate tool optimizes pricing upward during high-demand periods.

**Typical payout ranges per ClassPass booking:**

| Scenario                          | Payout per Visit |
|-----------------------------------|------------------|
| Low end (off-peak, oversupplied)  | $5 - $12         |
| Mid range (typical boutique class)| $12 - $22        |
| High end (premium, peak, negotiated)| $22 - $40+     |

**Revenue split:**
- ClassPass historically takes between **30% and 50%** of the credit value, paying the studio the remainder.
- However, critics (including VICE investigations) have reported ClassPass taking as much as **50-80%** of what a class would cost at retail.
- Example: If a studio charges $30 for a drop-in class, ClassPass might pay the studio only $8-$15 for a ClassPass booking of that same class.

**How studios get paid:**
- Bi-weekly or monthly direct deposit payments, depending on the partnership agreement.
- ClassPass uses Modern Treasury for global payout infrastructure.

**SmartRate optimization:**
- Partners using SmartRate averaged ~20% higher ClassPass payouts.
- Classes that are over 80% full with direct members earn a **45% higher ClassPass payout** on average than classes less than 50% full.
- The logic: if a class is almost full anyway, the remaining spots are more valuable, so ClassPass charges more credits and pays the studio more.

### How Studios Set Availability

- Studios choose **which classes** to list on ClassPass (not required to list all).
- Studios set **how many spots per class** are available to ClassPass users (e.g., 3 out of 20 spots).
- **SmartSpot** (ClassPass tool): Uses machine learning to analyze a studio's historical fill patterns and only lists spots that are predicted to go unfilled by direct clients. This protects the studio's direct business.
- Studios can adjust availability at any time through the Partner Dashboard.
- Studios can blackout dates, remove specific classes, or change spot allocations.

### Can Studios Control Pricing/Credits?

- Studios **do NOT directly set** the credit price users pay. ClassPass's algorithm determines that dynamically.
- Studios negotiate their **payout floor** (minimum they'll accept per booking).
- Studios can opt into **SmartRate** to let ClassPass dynamically adjust the credit price (and therefore the payout) upward when demand is high.
- Studios can influence pricing indirectly by limiting supply (fewer spots = higher demand = more credits charged = higher payout).

### Studio Software Integrations

ClassPass integrates with **100+ booking platforms**, including:

**Major integrations:**
- **Mindbody** (most common; ClassPass is owned by Mindbody/Playlist)
- **Booker** (also owned by Mindbody/Playlist; popular for spas/salons)
- **Glofox** (popular for boutique fitness)
- **Mariana Tek** (premium boutique studios)
- **ClubReady** (gyms and large fitness facilities)
- **Pike13** (small business scheduling)
- **WellnessLiving** (all-in-one studio management)
- **Zingfit** (cycling/boutique)
- **MakeSweat** (boutique studios)
- **Momence** (yoga/pilates studios)
- **SimplyBook.me** (general appointment scheduling)
- **Zenoti** (enterprise wellness)
- **Arketa** (yoga/wellness)
- **Vibefam** (fitness studios)

**Integration mechanics:**
- Schedule syncs automatically between the studio's booking software and ClassPass.
- Reservations update in real-time to prevent double-booking.
- ClassPass bookings appear in the studio's native software dashboard.
- For Mindbody specifically: API integration costs $10/studio + $1/transaction.

**Momoyoga note:** Momoyoga (popular with yoga/Pilates studios in Europe) does **NOT** have a direct ClassPass integration as of 2026. Momoyoga integrates with Stripe, Mailchimp, Google Calendar, Zoom, and offers a generic API + Zapier. This is a gap worth noting for PilatesHub's France/Europe strategy.

### How ClassPass Integrates with Studio Software

The integration works via API:

1. **Schedule sync** -- ClassPass reads the studio's class schedule from the booking software API.
2. **Availability check** -- Before showing a class to users, ClassPass checks real-time availability via API.
3. **Booking creation** -- When a user books, ClassPass creates a reservation via the studio software's API.
4. **Cancellation handling** -- Cancellations flow both ways (ClassPass cancels propagate to studio software and vice versa).
5. **Attendance tracking** -- Check-in data flows back to ClassPass for payout verification.

Studios without any booking software can use a **manual integration** where ClassPass sends booking notifications via email and the studio manages them manually, but this is rare and discouraged.

---

## 3. The Business Model

### How ClassPass Makes Money

ClassPass operates on **arbitrage between subscription revenue and studio payouts:**

1. **Subscription revenue** -- Users pay monthly subscription fees ($19-$249/month).
2. **Studio payouts** -- ClassPass pays studios a negotiated rate per booking (typically well below the studio's retail price).
3. **The spread** -- ClassPass keeps the difference between what users pay in subscription fees and what studios receive in payouts.
4. **Additional revenue streams:**
   - **Late cancellation fees** ($15 per late cancel)
   - **No-show fees** ($20 per no-show)
   - **Credit pack purchases** (users buying extra credits mid-cycle)
   - **Enterprise/corporate wellness** (B2B program for companies like Google, Morgan Stanley, Under Armour)
   - **Unused credits** (credits that expire unused are pure profit)

### What Percentage They Take

- ClassPass's take rate varies but is estimated at **30-50% of the effective class value** in the best cases.
- In worse cases (per VICE reporting and studio complaints), ClassPass has taken **50-80%** of what the class would cost at retail.
- Example math:
  - User pays $59/month for 28 credits.
  - User books 5 classes at ~5.6 credits each.
  - Cost per class to user: ~$11.80
  - Studio gets paid: ~$8-$15 per booking
  - ClassPass keeps: the remainder (sometimes very little, sometimes significant)
- ClassPass's internal docs (leaked to VICE in 2016) showed average studio payout of ~$12 per reservation, with 300,000 reservations/week, totaling ~$187M/year to studios -- while the company was projecting ~$122M in revenue, meaning they were actually **losing $65M/year** at that point.

### The Unit Economics Problem

ClassPass historically operated at a loss because heavy users would book more classes than their subscription fee could cover at the negotiated studio rates. This is why ClassPass:
- Moved from unlimited plans to credit-based plans (2018)
- Implemented dynamic pricing to make popular classes cost more credits
- Reduced studio payout rates over time (the source of major studio backlash)
- Introduced SmartRate to optimize the spread

### Subscription Tiers Strategy

- **Entry tier** ($19, 8 credits): Acquisition tool. Gets users in at low cost. Most users upgrade.
- **Mid tiers** ($39-$79): The bulk of subscribers. Sweet spot for ClassPass margins.
- **High tiers** ($159-$249): Power users. These can be unprofitable per-user but drive engagement and data.
- **Corporate wellness**: Employers subsidize employee access. Pay-per-use model means ClassPass only charges when employees actually book. Major enterprise clients include Google, Morgan Stanley, Under Armour.

### Geographic Expansion Strategy

ClassPass followed a **city-by-city expansion** playbook:

1. **Start in your home city (NYC, 2013-2014):**
   - Payal Kadakia started by personally recruiting studios in NYC.
   - Offered generous per-class rates and even sign-up bonuses (thousands of dollars) to get premium studios onboard.
   - Started with ~8,000 NYC gym partnerships.

2. **Expand to major US cities (2014-2015):**
   - San Francisco, Los Angeles, and other major metros.
   - Aggressive studio courting: offering above-market rates to lock in the best studios before competitors.

3. **Grow through acquisitions:**
   - Acquired FitMob (2015) for SF market
   - Acquired Guavapass (2019) for Asian markets
   - Acquired Fitness Collection (2019) for Swedish market
   - Acquired MuvPass (Chile) and ClickyPass (Argentina) in 2020

4. **International expansion with major funding:**
   - $84M funding round led by Temasek enabled expansion to 39 cities worldwide.
   - Now operates in 30+ countries.

5. **The Mindbody acquisition (2021):**
   - Mindbody acquired ClassPass in an all-stock deal with $500M investment from Vista Equity.
   - Combined: Mindbody (B2B studio software) + ClassPass (B2C consumer marketplace).
   - By 2025: Rebranded parent company as **Playlist**, unifying Mindbody, ClassPass, and Booker.
   - This gave ClassPass direct access to Mindbody's 56,000+ business clients.

### Studio Acquisition Strategy (Early Days)

How ClassPass got their first studios -- critical learning for PilatesHub:

1. **Founder-led sales:** Payal Kadakia personally visited studios and pitched them.
2. **Generous initial terms:** Offered high per-class rates ($15-$25/booking) to early studios -- much higher than current rates.
3. **Sign-up bonuses:** Some studios received bonuses worth thousands of dollars for exclusivity.
4. **"Fill empty spots" pitch:** Positioned ClassPass as incremental revenue for otherwise-empty spots, not a replacement for direct clients.
5. **Social proof:** Once a few premium studios joined, others followed to avoid missing out.
6. **Unlimited plan as growth hack:** The $99/month unlimited plan created massive consumer demand, which studios couldn't ignore.
7. **City-by-city density:** Focused on density in one city before expanding -- a city needs enough studios to make the subscription feel valuable.

### The Criticism / Controversy

Studios have been vocal about problems:

- **Declining payouts:** ClassPass progressively lowered per-booking rates over time, with studios reporting rates dropping from $15-$20 to $5-$8 per class.
- **Opacity:** Studios complained about "a total lack of transparency" in how payouts were calculated.
- **Cannibalization:** Studios reported that ClassPass members replaced direct-paying clients, eroding their core revenue.
- **Power imbalance:** One NYC studio owner compared it to "Uber vs. a single taxi medallion owner."
- **Jivamukti example:** ClassPass paid $8/class while the studio charged $25 for drop-ins.
- **VICE investigation (2020):** Reported ClassPass was "squeezing studios to the point of death," with 35+ studios corroborating complaints.
- **Class action lawsuit:** ClassPass faced a suit over phony business listings.
- Some studios (like Bodhi in SF) dropped ClassPass entirely and reported a 15% revenue increase.

---

## 4. How We Should Do It for PilatesHub

### Recommended Model for PilatesHub

**Do NOT copy ClassPass's credit/arbitrage model.** Here's why and what to do instead:

#### Why Not Copy ClassPass:
1. ClassPass was unprofitable for years and needed $500M+ in VC funding to survive.
2. The credit arbitrage model creates adversarial relationships with studios.
3. Studios hate it -- this is an opportunity for differentiation.
4. We don't have VC money to subsidize user acquisition at a loss.
5. ClassPass already exists -- we can't out-ClassPass ClassPass.

#### Proposed PilatesHub Model: **Studio-Friendly Marketplace + Lead Generation**

**Option A: Commission-Based Marketplace (Recommended for MVP)**
- Studios list their classes on PilatesHub for free.
- Users browse and book directly.
- PilatesHub charges a **flat commission of 10-15% per booking** (vs. ClassPass's 30-80%).
- Studios set their own prices.
- Position: "The Pilates-specific booking platform that treats studios as partners, not inventory."

**Option B: SaaS + Marketplace Hybrid (Phase 2)**
- Charge studios a small monthly SaaS fee ($29-$79/month) for the listing, analytics dashboard, review management, and marketing tools.
- Offer a booking widget studios can embed on their own website.
- Marketplace commission reduced to 5-8% for paying SaaS subscribers.
- This creates recurring revenue not dependent on booking volume.

**Option C: Lead Generation / Affiliate Model (Simplest MVP)**
- Studios list for free.
- PilatesHub redirects users to the studio's own booking system.
- Charge studios per lead/referral ($2-$5 per click-through) or per confirmed first-time booking ($10-$20).
- Lowest friction for studios to join.
- Risk: harder to track conversions and monetize.

**Recommended path: Start with Option C (lead gen) to get studios onboard with zero friction, then upgrade to Option A (commission marketplace) once you have enough density and user trust, then layer on Option B (SaaS) for power users.**

### How We Should Approach Studios

**Phase 1: First 10 Studios (Month 1-2) -- Personal Outreach**
1. **Start with Paris** -- Densest pilates market in France, most studios, highest demand.
2. **Identify the 30 best-reviewed Pilates studios** from our existing scraped data (Google reviews, social media).
3. **Warm outreach via email/Instagram DM:**
   - "We're building PilatesHub, the first platform dedicated exclusively to Pilates in France."
   - "We already have your studio listed with your Google reviews and ratings."
   - "We want to make sure your listing is perfect -- claim your studio page for free."
   - Lead with value: free marketing, free profile page, free review aggregation.
4. **In-person visits** to 10-15 top studios in Paris. Bring a one-pager showing the platform and their existing listing.
5. **Offer founding partner status:** First 10 studios get "Founding Partner" badge, priority placement, and favorable terms locked in permanently.
6. **No contracts required initially** -- make it zero-risk to try.

**Phase 2: 50 Studios (Month 3-6) -- Systematized Outreach**
1. Expand to Lyon, Marseille, Bordeaux, Toulouse.
2. Use email templates + personalized studio data (their reviews, their photos from Google).
3. Offer free profile enhancement: professional photos, optimized descriptions.
4. Create case studies from Phase 1 studios showing traffic/bookings generated.
5. Partner with Pilates instructor associations/communities in France.

**Phase 3: 200 Studios (Month 6-12) -- Platform Effects**
1. Studios start coming to you (inbound) as users grow.
2. Introduce self-service onboarding: studios can claim and manage their own listing.
3. Expand to all of France + Belgium, Switzerland (French-speaking).
4. Add booking integration with popular studio software (Momoyoga, Mindbody).

### Minimum Viable Booking System

**MVP (Phase 1) -- No booking needed:**
- Studio listing with photos, reviews, class schedule, pricing.
- "Book Now" button that links to the studio's own booking page (external redirect).
- User accounts for saving favorites, getting recommendations.
- This is how PilatesHub already partially works.

**Phase 2 -- Simple booking integration:**
- Embed or iframe the studio's booking widget on PilatesHub.
- Or: API integration with Momoyoga/Mindbody to show real-time availability.
- User can see available slots and click through to complete booking.

**Phase 3 -- Native booking:**
- Full in-app booking: user selects class, confirms, pays via PilatesHub.
- PilatesHub handles payment and remits to studio minus commission.
- Requires: payment processing (Stripe Connect), booking API integrations, cancellation handling.

**Phase 4 -- Subscription/credits (only if validated):**
- Optional credit packs or subscription for users who want multi-studio access.
- Only introduce this if user demand is validated and studios agree to terms.
- Keep it simple: 1-2 plans, not 6 tiers.

### Step-by-Step Launch Plan

**Weeks 1-4: Foundation**
- [ ] Finalize business model decision (lead gen vs. commission vs. hybrid).
- [ ] Design studio partnership one-pager and pitch deck.
- [ ] Build "Claim Your Studio" flow on PilatesHub.
- [ ] Create studio partnership agreement (see Section 5).
- [ ] Identify top 30 Pilates studios in Paris from existing data.

**Weeks 5-8: First 10 Studios**
- [ ] Personal outreach to 30 studios, aim for 10 sign-ups.
- [ ] Help founding partners set up their profiles.
- [ ] Launch marketing: "PilatesHub is live in Paris with X studios."
- [ ] Track user engagement (clicks to booking pages, saves, searches).

**Weeks 9-16: Scale to 50 Studios**
- [ ] Systematize outreach with email templates and CRM.
- [ ] Expand to 2-3 more French cities.
- [ ] Build studio self-service dashboard.
- [ ] Implement basic analytics for studios (views, clicks, bookings referred).

**Weeks 17-26: Scale to 200 Studios**
- [ ] Launch booking integration with at least one platform (Momoyoga or Mindbody).
- [ ] Introduce commission model or SaaS tier.
- [ ] Build user review system native to PilatesHub.
- [ ] Begin monetization: either commission per booking or studio SaaS fee.

**Weeks 27-52: Growth**
- [ ] Full France coverage.
- [ ] Native in-app booking.
- [ ] Introduce subscription/credit model if validated.
- [ ] Corporate wellness partnerships (companies buying Pilates access for employees).
- [ ] Expand to Belgium, Switzerland, Netherlands.

### Legal/Contractual Requirements

Key legal items (detailed in Section 5):
1. Studio partnership agreement (terms, commission, termination).
2. User terms of service.
3. Privacy policy (GDPR-compliant -- critical for France/EU).
4. Payment processing terms (if handling payments via Stripe Connect).
5. Liability waiver template (for studios to use).
6. Data processing agreement (GDPR requirement for handling studio/user data).

### Technical Integrations That Matter

**Priority 1 (Most French Pilates studios use these):**
- **Momoyoga** -- Very popular with yoga/Pilates studios in France. Has API + Zapier. No direct ClassPass integration = opportunity for PilatesHub to be first.
- **Bsport** -- Growing fast in France for boutique fitness studios.

**Priority 2 (Larger/international studios):**
- **Mindbody** -- Industry standard globally. API available ($10/studio + $1/transaction). ClassPass owns Mindbody now, so they may restrict competitor access.
- **Momence** -- Growing alternative to Mindbody, popular with boutique studios.

**Priority 3 (Nice to have):**
- **Glofox** -- Popular with boutique fitness.
- **SimplyBook.me** -- General purpose, some studios use it.
- **WellnessLiving** -- Alternative to Mindbody.
- **Google Calendar** -- Many small studios just use Google Calendar.

**Build our own if needed:**
- Simple booking widget that studios without software can embed.
- A manual booking flow (studio receives email notification for each booking).

---

## 5. Documents We Need

### A. Studio-Facing Documents

#### 1. Studio Partnership Agreement
**Purpose:** Core contract between PilatesHub and each partner studio.
**Must include:**
- Parties and definitions
- Services provided by PilatesHub (listing, marketing, booking referrals)
- Studio obligations (accurate information, honoring bookings, response time)
- Commission/revenue share terms (rate, payment schedule, payment method)
- Intellectual property rights (use of studio name, photos, logos on platform)
- Data sharing terms (what data PilatesHub collects and shares with studio)
- Term and termination (how either party can end the relationship)
- Exclusivity clauses (non-exclusive -- studios can be on other platforms)
- Liability and indemnification
- Dispute resolution (mediation, applicable law -- French law)
- Confidentiality
- Force majeure

#### 2. Studio Onboarding Guide
**Purpose:** Step-by-step guide for new partner studios.
**Must include:**
- How to claim/set up their listing
- How to upload photos and descriptions
- How to connect their booking software
- How the booking/referral flow works
- How and when they get paid
- FAQ for common studio questions
- Support contact information

#### 3. Revenue Share / Commission Schedule
**Purpose:** Clear documentation of payment terms.
**Must include:**
- Commission rate per booking type
- Payment frequency (weekly, bi-weekly, monthly)
- Payment method (bank transfer, Stripe)
- Minimum payout threshold
- How cancellations/no-shows are handled
- Rate change notice period

### B. User-Facing Documents

#### 4. User Terms of Service
**Purpose:** Legal agreement governing user access to PilatesHub.
**Must include:**
- Eligibility (age, geographic requirements)
- Account creation and responsibilities
- How bookings work and user obligations
- Cancellation and no-show policies
- Payment terms (if applicable)
- Intellectual property (PilatesHub owns the platform; user-generated content license)
- Prohibited conduct
- Disclaimers (PilatesHub is a marketplace, not a fitness provider)
- Limitation of liability
- Governing law (French law + EU regulations)
- Dispute resolution
- Modification of terms
- Termination of accounts

#### 5. Privacy Policy (GDPR-Compliant)
**Purpose:** Required by GDPR. Governs how we collect, use, and protect personal data.
**Must include:**
- Identity of data controller (PilatesHub entity)
- Types of data collected (name, email, location, booking history, payment data)
- Legal basis for processing (consent, legitimate interest, contract performance)
- How data is used (account management, booking facilitation, analytics, marketing)
- Data sharing (with studios, payment processors, analytics providers)
- Data retention periods
- User rights (access, rectification, erasure, portability, objection)
- Cookie policy
- International data transfers (if any)
- Data security measures
- Data breach notification procedures
- DPO (Data Protection Officer) contact information
- How to file a complaint with CNIL (French data authority)

#### 6. Cookie Policy
**Purpose:** Required by EU ePrivacy Directive.
**Must include:**
- Types of cookies used (essential, analytics, marketing)
- Purpose of each cookie
- How to manage/disable cookies
- Third-party cookies (Google Analytics, Stripe, etc.)

### C. Operational Documents

#### 7. Data Processing Agreement (DPA)
**Purpose:** Required by GDPR when sharing personal data with studios.
**Must include:**
- Scope of data processing
- Studio obligations as data processor
- Security measures required
- Sub-processor management
- Data breach notification obligations
- Audit rights

#### 8. Content Policy / Community Guidelines
**Purpose:** Rules for user-generated content (reviews, photos, comments).
**Must include:**
- What constitutes acceptable reviews
- Prohibited content (hate speech, spam, fake reviews)
- How disputes over reviews are handled
- Studio's right to respond to reviews
- Content moderation process

#### 9. Intellectual Property Policy
**Purpose:** Protect PilatesHub's IP and respect studio IP.
**Must include:**
- PilatesHub trademark usage guidelines
- Studio logo/photo usage rights
- DMCA/takedown procedures
- User content licensing

#### 10. Liability Waiver / Disclaimer
**Purpose:** Clarify that PilatesHub is a marketplace, not a fitness provider.
**Must include:**
- PilatesHub does not provide fitness instruction
- Users assume risk of physical activity
- Studios are independent businesses, not PilatesHub employees/agents
- PilatesHub is not liable for injuries, quality of instruction, or studio conditions

### D. Future Documents (When We Handle Payments)

#### 11. Payment Terms for Users
- How payment processing works (via Stripe)
- Refund policy
- Failed payment handling
- Currency and pricing transparency

#### 12. Stripe Connected Account Agreement
- Terms for studios receiving payments via Stripe Connect
- Payout schedules and holds
- Chargeback/dispute handling

#### 13. Subscription Terms (If We Launch Credits/Plans)
- Plan details, pricing, renewal
- Credit expiration policy
- Upgrade/downgrade terms
- Cancellation and refund policy

### E. Business Formation Documents

#### 14. Company Formation
- Register a French entity (SAS or SARL recommended for a startup)
- Statuts (articles of association)
- K-bis (company registration certificate)
- VAT registration

#### 15. Insurance
- Professional liability insurance (RC Pro)
- Cyber liability insurance (for data breaches)
- General commercial insurance

---

## Key Takeaways

1. **ClassPass proved the model works** -- fitness/wellness marketplace subscriptions are viable, but the credit arbitrage creates studio resentment.
2. **The Mindbody acquisition changed everything** -- ClassPass now has both the B2B software AND the B2C marketplace, making them very hard to compete with head-on.
3. **Our advantage is specialization** -- PilatesHub is Pilates-only in France. ClassPass is everything, everywhere. We can be more curated, more community-focused, and more studio-friendly.
4. **Studio relationships are everything** -- Studios that feel exploited will leave or resist. If we offer better terms and more transparency, studios will prefer us.
5. **Momoyoga is an untapped opportunity** -- No ClassPass integration means French Pilates studios on Momoyoga are underserved. Building a Momoyoga integration first gives us a competitive moat.
6. **Start without payments** -- Lead generation model first, commission marketplace later. Don't build what you don't need yet.
7. **GDPR compliance is non-negotiable** -- Operating in France/EU means privacy policy, cookie consent, DPA, and CNIL compliance from day one.

---

## Sources

- [ClassPass Partners - How It Works](https://classpass.com/partners/how-it-works)
- [ClassPass Partners - FAQ](https://classpass.com/partners/faqs)
- [ClassPass Plans & Pricing](https://classpass.com/plans)
- [ClassPass Credit Rates - How They're Determined](https://help.classpass.com/hc/en-us/articles/360002360052-How-are-credit-rates-determined)
- [ClassPass How Credits Work](https://classpass.com/blog/how-classpass-credits-work/)
- [ClassPass Cancellation Policy](https://help.classpass.com/hc/en-us/articles/207942743-What-is-the-reservation-cancellation-policy)
- [ClassPass Booking Integrations](https://classpass.com/partners/classpass-booking-integrations)
- [ClassPass SmartRate Explained](https://classpass.com/afterclass/what-is-smartrate/)
- [ClassPass SmartTools](https://classpass.com/afterclass/classpass-smart-tools-helps-grow-revenue/)
- [ClassPass Revenue Calculator](https://classpass.com/partners/revenue-calculator)
- [ClassPass Corporate Wellness](https://classpass.com/corporate-wellness)
- [ClassPass Tops $3B in Partner Revenue - Athletech News](https://athletechnews.com/classpass-tops-3-billion-in-partner-revenue/)
- [VICE: ClassPass Is Squeezing Studios to the Point of Death](https://www.vice.com/en/article/classpass-is-squeezing-studios-to-the-point-of-death/)
- [VICE: ClassPass Said Angry Studios Are a Vocal Minority](https://www.vice.com/en/article/classpass-said-angry-studios-are-a-vocal-minorityhere-are-35-more-of-them/)
- [Mindbody Acquires ClassPass - TechCrunch](https://techcrunch.com/2021/10/13/mindbody-acquires-classpass-in-all-stock-deal-and-secures-500-million-investment/)
- [ClassPass/Mindbody/EGYM Merger - Athletech News](https://athletechnews.com/classpass-mindbody-playlist-egym-merger-7-5-billion-deal/)
- [ClassPass Business Model - ProductMint](https://productmint.com/the-classpass-business-model-how-does-classpass-work-make-money/)
- [ClassPass Business Model - FourWeekMBA](https://fourweekmba.com/classpass-business-model/)
- [ClassPass Business Model - SEOAves](https://seoaves.com/classpass-business-model-how-does-classpass-make-money/)
- [ClassPass Pricing 2026 - Exercise.com](https://www.exercise.com/grow/how-much-does-classpass-cost/)
- [How ClassPass Supports Partners](https://classpass.com/blog/how-classpass-supports-partners/)
- [Mindbody x ClassPass Integration](https://integrations.mindbodyonline.com/partners/classpass)
- [ClassPass API Integration - Mindbody Support](https://support.mindbodyonline.com/s/article/206881857-Class-Pass-activation-API-integration?language=en_US)
- [Momoyoga Integration Options](https://support.momoyoga.com/en/support/solutions/articles/201000109941-what-are-the-momoyoga-schedule-integration-options-)
- [ClassPass First 1000 Customers - Indie Hackers](https://www.indiehackers.com/post/classpass-first-1000-customers-18ad0eb94c)
- [ClassPass In-Depth Startup Analysis - Medium](https://medium.com/@othmaner/an-in-depth-startup-analysis-is-classpass-the-next-unicorn-or-the-next-bust-9c6f286b4f7b)
- [How to Build a Website Like ClassPass - Sharetribe](https://www.sharetribe.com/create/how-to-build-website-like-classpass/)
- [Top ClassPass Competitors - Latterly](https://www.latterly.org/classpass-competitors/)
- [How I Dropped ClassPass and Increased Revenue 15% - Medium](https://medium.com/@leila_33411/how-i-dropped-classpass-reclaimed-my-community-and-increased-monthly-revenues-by-15-c9df4dc1dc92)
- [ClassPass for Fitness Businesses - Vibefam](https://vibefam.com/how-classpass-drives-growth-for-fitness-businesses/)
- [5 Legal Agreements Every Boutique Studio Needs - fitDEGREE](https://www.fitdegree.com/post/top-5-legal-agreements-every-successful-boutique-fitness-studio-needs)
- [Modern Treasury x ClassPass Case Study](https://www.moderntreasury.com/customers/classpass)
- [ClassPass Payouts, Pricing, and Policies](https://classpass.com/partners/blog/classpass-payouts-pricing-policies-rates)
