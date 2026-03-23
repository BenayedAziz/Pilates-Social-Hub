# PilatesHub Design Vision

**A premium Pilates lifestyle app that feels like walking into a beautifully appointed studio: calm, intentional, and quietly confident.**

*Design brief prepared March 2026*

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Navigation Architecture](#2-navigation-architecture)
3. [Page-by-Page Redesign](#3-page-by-page-redesign)
4. [Component Design System](#4-component-design-system)
5. [Color & Theme Refinement](#5-color--theme-refinement)
6. [Key Screen Wireframes](#6-key-screen-wireframes)
7. [Micro-interactions & Delight](#7-micro-interactions--delight)
8. [Onboarding Flow](#8-onboarding-flow)
9. [Priority Recommendations](#9-priority-recommendations)

---

## 1. Design Philosophy

### The Feeling

PilatesHub should feel like Aesop's retail experience translated into a fitness app. When you open it, you exhale. The visual language communicates: *this is a place for people who take their practice seriously, but don't take themselves too seriously.*

We are not a loud gym app with aggressive gradients and bold exclamation marks. We are not a sterile medical tracker. We are the intersection of **wellness culture, community belonging, and quiet achievement** -- closer to a members' club than a scoreboard.

**Three design pillars:**

1. **Serene Confidence** -- generous whitespace, restrained color, typography that breathes. Every element earns its place on screen. If it doesn't serve the user's immediate intent, it's hidden or deferred.

2. **Warm Community** -- real faces, human language, tactile interactions. The app should feel like a studio where everyone knows your name. Avatars are prominent. Achievements are celebrated without being garish.

3. **Intentional Craft** -- subtle animations, considered transitions, precise alignment. The details signal quality even if users can't articulate why the app "feels good." Think: the weight of a Rapha zipper, the texture of an Aesop bottle.

### Typography Direction

**Current state:** Inter (sans-serif) with Georgia (serif) -- functional but generic.

**Recommendation:**

- **Primary sans-serif:** Keep Inter but use it with more intentional weight variation. Headlines at 600 (semi-bold), body at 400, captions at 300 (light). The lighter weights give Inter an elegance it lacks at 400/700 alone.
- **Display/accent serif:** Introduce a serif for section headers and hero moments only. Candidates: **Fraunces** (variable, organic curves that evoke movement), **Lora** (refined, readable), or **Playfair Display** (editorial authority). Use sparingly -- page titles, empty-state messages, onboarding headlines. Never for UI chrome.
- **Monospace:** Retain for data displays (calorie counts, session durations) where the tabular alignment matters.

**Type scale:** Adopt a modular scale (1.25 ratio) to create clear hierarchy without resorting to bold/color to distinguish levels.

```
Display:    32px / 40px line-height (serif, section heroes)
H1:         24px / 32px (semi-bold, page titles)
H2:         20px / 28px (semi-bold, section headers)
H3:         16px / 24px (medium, card titles)
Body:       15px / 22px (regular, primary content)
Caption:    13px / 18px (regular, secondary info)
Overline:   11px / 16px (medium, uppercase tracking +0.05em, labels)
```

### Spacing & Breathing Room

The current app is dense. Cards press against each other, sections blur together, and the eye has nowhere to rest.

**Principles:**

- **Section spacing:** 32px minimum between distinct content sections. 48px between major zones (e.g., between the progress ring and the calendar).
- **Card internal padding:** 20px minimum. The current 12-16px padding makes content feel cramped.
- **Card external gaps:** 16px between cards in a list, 12px in a grid.
- **Screen edge margins:** 20px on mobile (not 16px). This single change instantly makes every screen feel more premium.
- **Vertical rhythm:** Establish an 8px grid. Every spacing value is a multiple of 8: 8, 16, 24, 32, 40, 48. No odd values.
- **Content max-width:** Cap readable text at 600px on desktop. The feed currently allows text to stretch too wide at xl breakpoints.

---

## 2. Navigation Architecture

### The Problem

Six mobile tabs is two too many. Users suffer from choice paralysis, and the conceptual overlap between Feed, Community, and Circles creates confusion. On desktop, seven sidebar items plus controls is visually overwhelming. The navigation is structured around features, not user intent.

### The Principle

Navigation should be organized around **user modes**, not feature categories:

1. **I want to find a studio and book** (Explore)
2. **I want to see what my people are doing** (Feed)
3. **I want to track my progress** (Me)
4. **I want to buy something** (Shop)

That's four tabs. Four is the magic number for mobile bottom navigation -- it leaves enough room for large tap targets (minimum 48px), clear labels, and visual breathing room.

### Proposed Navigation Tree

```
Tab 1: Explore (Compass icon)
  ├── Map view (default)
  │   ├── Filter chips overlay
  │   ├── Studio markers
  │   ├── Selected studio preview card
  │   └── Recenter button
  ├── List view (toggle from map)
  │   └── Studio cards (sortable: distance, rating, price)
  └── Studio Detail (sheet/modal from either view)
      ├── Hero image + info
      ├── Available time slots
      ├── Book button
      ├── Check-in button
      ├── Reviews
      └── Studio Regulars

Tab 2: Feed (Activity icon)
  ├── Activity feed (default, scrollable)
  │   ├── Log session prompt (top)
  │   ├── Post cards with kudos/comments
  │   └── Inline "This Week's Leaders" card (after ~5 posts)
  ├── Community tab (swipe or tap sub-header)
  │   ├── Forum posts with votes
  │   ├── Category filter chips
  │   └── New Discussion FAB
  └── Circles tab (swipe or tap sub-header)
      ├── My Circles
      ├── Discover Circles
      └── Create Circle

Tab 3: Me (User icon)
  ├── Profile header (avatar, name, level, stats)
  ├── Weekly Recap ring + streak
  ├── Quick stats (sessions, calories, streak)
  ├── Weekly calendar
  ├── Upcoming Sessions (next 1-2 only, "See all" link)
  ├── Challenges card (active challenge preview, "See all" link)
  │   └── Challenges detail page (push navigation)
  │       ├── Active challenges
  │       └── Pilates Bingo
  ├── Badges (horizontal scroll, "See all" link)
  │   └── Badges detail page (push navigation)
  ├── Apparatus Journey (collapsed, expandable)
  ├── Calorie chart (collapsed by default, "Show chart" toggle)
  └── Settings (gear icon in header)
      ├── Edit Profile
      ├── Dark mode toggle
      ├── Notifications (placeholder)
      └── Log Out

Tab 4: Shop (ShoppingBag icon)
  ├── Featured/hero product (rotating banner or editorial pick)
  ├── Category filter chips
  ├── Product grid
  └── Product detail (sheet from grid)
      ├── Image gallery
      ├── Product info
      ├── Add to cart
      └── Wishlist toggle
```

### Key Decisions Explained

**Feed absorbs Community and Circles.** These three features all answer the same user question: "What's happening with my people?" The Feed tab now has three horizontal sub-tabs (Activity | Forum | Circles) accessible via a segmented control at the top. Swiping between them feels natural on mobile. On desktop, these become three columns or a tabbed view within the same page.

**Dashboard is dead; long live "Me."** The word "Dashboard" is clinical. "Stats" is reductive. The third tab is the user's home -- their profile, their progress, their upcoming schedule. It's *their* space. The profile header grounds the page, and all the stat/progress/challenge content lives below it in a curated scroll.

**Challenges live inside "Me."** Challenges are personal progress. They don't need their own top-level tab. A preview card on the Me page links to the full Challenges detail view via push navigation.

**Search remains in the header.** Universal search is a utility, not a destination. It stays as a header icon that opens a full-screen overlay (not a dialog -- overlays feel more native on mobile).

**Cart remains in the header.** The cart sheet is contextually tied to shopping but needs to be accessible from any page (users might browse the store, leave, come back). The header cart icon with badge count is the right pattern.

### Desktop Adaptation

On desktop (md+), the bottom nav becomes a left sidebar with the same four items plus:
- Logo at top
- Search in the sidebar header
- Dark mode toggle at bottom
- Profile quick-access card at bottom (avatar + name, links to Me tab)

The sidebar is narrow (72px collapsed, 240px expanded) and uses icon-only mode by default with labels on hover/expand.

---

## 3. Page-by-Page Redesign

### 3.1 Explore (Map + Studios)

**Current problems:** The map page is visually cluttered. The filter bar floats over the map competing for attention. The map/list toggle is easy to miss. The selected studio preview card is small and cramped. When you switch to list view, the transition is jarring.

#### Layout

1. **Map area** -- full screen height minus bottom nav (not 56vh). The map should be immersive. Use the entire viewport as the canvas.
2. **Filter chips** -- pinned to the top, below the header. Semi-transparent frosted glass background (backdrop-blur) so the map shows through. Horizontal scroll. Remove the non-functional "Filters" label badge -- it wastes space.
3. **Selected studio card** -- slides up from the bottom as a larger card (not the current tiny preview). Height: ~200px. Shows: hero image (left 1/3), name, neighborhood, rating, price, distance, and a prominent "View Studio" button. This card is the gateway to booking -- it needs to be generous, not cramped.
4. **List view** -- triggered by pulling up the studio card area (bottom sheet pattern) or tapping a toggle. The list replaces the bottom portion of the map with a half-sheet that can be dragged to full height. This is the Apple Maps / Google Maps pattern users already understand.

#### Key Interactions

1. User sees the map with price markers
2. User taps a marker -> studio preview slides up from bottom
3. User taps "View Studio" -> full studio detail sheet slides up
4. User selects a time slot and books -> confirmation animation
5. User can also drag the bottom area up to see the full list without selecting a specific studio

#### Visual Treatment

- **Map style:** Keep CartoDB Positron (excellent choice -- light, clean, doesn't compete with markers). Consider a custom Mapbox style with even more muted colors if budget allows.
- **Markers:** Increase to 40px minimum. The price labels inside markers are smart -- keep them. Selected marker should scale up with a spring animation, not just get bigger.
- **Filter chips:** White background at 80% opacity with backdrop-blur-md. Border: 1px solid rgba(0,0,0,0.06). Active chips: primary green with white text. Pill-shaped (fully rounded).
- **Studio preview card:** White card, 16px border-radius, subtle shadow (0 4px 24px rgba(0,0,0,0.08)). Image uses 3:2 aspect ratio with 12px border-radius.

#### What to Remove

- The "Filters" badge label (it's not interactive and wastes horizontal space)
- The map/list toggle button as a separate floating button (replace with the bottom sheet pull-up pattern)
- Zoom controls already removed -- good

#### What to Add

- Bottom sheet behavior for the studio list (draggable, three snap points: peek, half, full)
- "Open now" filter chip
- "Class type" filter (Reformer, Mat, Tower, Cadillac, Chair)
- A subtle pulsing ring on the user's location dot
- Distance labels on markers when zoomed out far enough

#### Mobile vs Desktop

- **Mobile:** Full-screen map with bottom sheet
- **Desktop:** 60/40 split -- map on left (60%), studio list on right (40%). Clicking a studio in the list highlights the marker on the map and opens the detail panel inline on the right. No dialog/modal needed.

---

### 3.2 Feed (Activity + Community + Circles)

**Current problems:** Feed is a single-purpose page with a leaderboard bolted on at the bottom. Community and Circles are separate pages that feel disconnected from the social experience. The share bar is functional but uninspired.

#### Layout

1. **Segmented control** -- three options at the top, below the header: Activity | Forum | Circles. This is a horizontal tab bar, not bottom tabs. Each segment leads to a scrollable content area.
2. **Activity view (default):**
   - Log session prompt (redesigned as a floating action button, not a bar -- see below)
   - Post cards in a single-column stream
   - Leaderboard card inserted naturally after every 5-6 posts (not at the bottom)
3. **Forum view:**
   - Category chips (horizontal scroll)
   - Forum post cards with vote column
   - New discussion FAB
4. **Circles view:**
   - My Circles section (horizontal scroll of circle cards)
   - Discover section (vertical list)
   - Create circle button in section header

#### Key Interactions (Activity)

1. User scrolls through friends' activity
2. User taps the kudos button on a post -> animation plays
3. User taps the FAB to log a session -> bottom sheet form appears
4. User fills in session details and shares -> post appears at top of feed with a celebration animation

#### Visual Treatment

- **Post cards:** No outer border. Use whitespace (24px gap between posts) and a thin 1px separator line (muted, 50% opacity) to delineate. This is the Instagram/Twitter approach -- less boxy, more editorial.
- **User avatars:** 40px diameter on posts, with a 2px colored ring matching the user's assigned color. The ring replaces the solid-fill circle as the primary avatar treatment -- it's lighter and more distinctive.
- **Session stats pills:** Reduce from the current three colored pills to inline text. "55 min -- 320 cal" in caption size, primary color. The colored pill blocks are visually heavy and distract from the social content.
- **Photo posts:** Full-width images with 12px border-radius. Aspect ratio: 4:3 or 16:9 (not square -- Pilates imagery benefits from landscape). Apply a very subtle warm tone overlay (2% opacity) to unify diverse photo sources.
- **Leaderboard card:** Style it as a premium "card within the feed" -- slightly different background (cream/warm), serif title ("This Week's Leaders"), gold accent on the #1 position. It should feel like a magazine insert, not a data table.

#### What to Remove

- The fixed share bar at the top of feed. It takes up vertical space on the most scrollable page. Replace with a FAB.
- Comment count on posts (it's non-functional -- don't show UI for features that don't work yet)
- Share button on posts (non-functional)

#### What to Add

- Segmented control for Activity / Forum / Circles
- Photo carousel support on posts (swipeable, dot indicators)
- "Today" timestamp grouping (posts grouped by day with a date header)
- "New posts" indicator when pulling down (like Twitter's "X new posts" banner)
- Comment preview (show the first 1-2 comments inline under a post, collapsed by default)

#### Mobile vs Desktop

- **Mobile:** Single-column feed, full width. Segmented control at top.
- **Desktop:** Two-column layout. Feed in the left column (max-width 560px). Right column shows: leaderboard widget (sticky), trending forum topics, and active circles. This gives the desktop version density without cluttering the feed itself.

---

### 3.3 Me (Profile + Stats + Challenges)

**Current problems:** The Dashboard page is a wall of nine distinct sections with no hierarchy. The user's eye bounces between stats, calendars, charts, badges, challenges, and sessions with no clear narrative. The Profile page duplicates some of this content (badges, bookings). There's no sense of "this is MY space."

#### Layout

The Me page is a single scrollable page with clear visual sections separated by generous spacing (48px). The information architecture follows a narrative: *who you are -> how you're doing this week -> your progress over time -> what's next.*

1. **Profile header** (top, no scroll -- sticky on desktop)
   - Large avatar (80px, with gradient ring matching level color)
   - Name (H1, semi-bold)
   - Level badge (subtle, secondary background)
   - Bio (one line, caption style)
   - Stats row: Sessions | Followers | Following (tappable)
   - Settings gear icon (top right)

2. **Weekly Recap** (first scrollable section)
   - Progress ring (larger than current -- 120px diameter)
   - Inline text: "4 of 5 sessions this week"
   - Streak counter with flame icon
   - Streak celebration banner (only when streak >= 7)

3. **This Week calendar strip**
   - Single horizontal row of day circles
   - Completed days have a satisfying check
   - Today pulses gently

4. **Upcoming Sessions** (max 2 shown)
   - Compact cards: date | session type | studio | time
   - "See all bookings" text link
   - If no upcoming: "Book your next session" CTA linking to Explore

5. **Active Challenge** (single featured card)
   - The challenge closest to completion
   - Progress bar, participant count
   - "View all challenges" text link -> pushes to Challenges page

6. **Badges** (horizontal scroll)
   - Earned badges: full color with subtle shimmer
   - Locked badges: monochrome, 40% opacity
   - "X of Y earned" counter
   - Tapping a badge shows a tooltip with the description

7. **Apparatus Journey** (collapsed by default)
   - "Your Journey" header with expand/collapse chevron
   - When expanded: vertical timeline as current, but with improved visual treatment

8. **Calorie Trend** (collapsed by default)
   - "8-Week Trend" header with expand/collapse chevron
   - When expanded: bar chart

9. **Friends Leaderboard** (bottom of page)
   - Compact list, top 3 only
   - "Your rank: #6" highlighted row
   - "See full leaderboard" link

#### Key Interactions

1. User opens Me tab -> sees their identity, this week's progress at a glance
2. User checks weekly calendar for today's status
3. User sees upcoming session and taps to view details
4. User scrolls to challenges to check progress
5. User expands collapsed sections (journey, chart) when curious

#### Visual Treatment

- **Profile header:** Clean, generous spacing. Avatar has a 3px gradient border (sage green to a warmer tone). Name is the largest text on any page.
- **Progress ring:** Sage green stroke on a very light green background track. Animated on load (sweeps to current progress over 700ms).
- **Stats cards:** No more colored backgrounds (the current primary/orange/blue cards are visually noisy). Use white cards with the metric number in the accent color and the label in muted text below.
- **Calendar strip:** Completed days use a filled circle with a white checkmark. The primary green at 15% opacity for the background, full primary for the icon. Today has a ring border that pulses.
- **Collapsed sections:** Show header + a preview hint (e.g., the first apparatus name for Journey, the last week's bar for the chart). Expand with a smooth height animation.

#### What to Remove

- The stats grid of three colored cards (replaced by the weekly recap which communicates the same info more elegantly)
- The "Friends Leaderboard" taking up a full section (compress to top 3 + your rank)
- Duplicate badge display (remove from profile tab system -- badges are now inline on the Me page)
- The three-tab system on the current Profile page (Activity | Badges | Bookings is replaced by the unified Me page with Bookings accessible from "Upcoming Sessions > See all")

#### What to Add

- Collapsible sections for secondary content (Journey, Calorie Chart)
- A "Book your next session" CTA when no upcoming sessions exist
- Settings access from the profile header (gear icon)
- A subtle daily greeting: "Good morning, Sarah" with the current day's focus

#### Mobile vs Desktop

- **Mobile:** Single column, scrollable. Profile header scrolls with content.
- **Desktop:** Two-column layout. Left column (40%): profile header (sticky), settings, and personal info. Right column (60%): all the stats, challenges, and progress content in a scrollable area.

---

### 3.4 Shop

**Current problems:** The store feels like a generic e-commerce grid with no editorial voice. Products are displayed in a flat grid with no hierarchy -- a EUR 12 pair of socks gets the same visual weight as a EUR 299 massage gun. The category filter works but there's no sense of curation.

#### Layout

1. **Hero section** -- a single featured product or editorial pick. Full-width image (16:9 aspect), product name in serif font, "Shop now" CTA. This rotates weekly or features seasonal picks. It immediately signals: this is a curated boutique, not Amazon.

2. **Category chips** -- horizontal scroll, same treatment as Explore filters. Below the hero.

3. **Product grid** -- but with varied card sizes:
   - Default: 2-column grid on mobile, 3 on tablet, 4 on desktop
   - Every 5th product: span 2 columns (landscape image, larger text) -- this breaks the monotony
   - Price anchoring: show "From EUR XX" on category headers

4. **Product detail** -- opens as a bottom sheet on mobile (not a new page). On desktop, opens as a side panel (the grid shifts left).

#### Key Interactions

1. User sees the hero product and is intrigued
2. User browses the grid, filtering by category
3. User taps a product -> detail sheet slides up with image, description, "Add to Cart"
4. User adds to cart -> cart icon in header bounces with +1 animation
5. User opens cart sheet to review and checkout

#### Visual Treatment

- **Product images:** 4:5 aspect ratio (portrait orientation -- products photograph better tall). 12px border-radius. No border. Subtle shadow on hover.
- **Wishlist heart:** Move from inside the image to below the price, next to the "Add" button. The current overlay-on-image treatment looks cheap.
- **Brand name:** Overline style (11px, uppercase, tracking +0.05em, muted foreground). This is the Aesop / Net-a-Porter treatment for brand names.
- **Price:** H3 weight, primary color. No "EUR" prefix -- use the euro sign (sign before the number, no space).
- **Add button:** Ghost/outline style with a subtle fill animation on tap. Not a solid primary button -- that's too aggressive for browsing.
- **Hero card:** Dark gradient overlay on image (bottom 40%), white text. Serif font for the product name. This creates a magazine-cover moment.

#### What to Remove

- Star ratings on the grid view (move to detail view only -- the grid is too dense with stars)
- "Add" button text (replace with a cart icon button to save space)

#### What to Add

- Hero/featured product section
- "New" badge on recently added products
- "Bestseller" badge on top-rated products
- Product detail bottom sheet with: image gallery (swipeable), full description, rating with review count, related products
- Subtle add-to-cart animation (product image flies toward the cart icon)
- "You might also like" section at the bottom of the grid or in the detail sheet

#### Mobile vs Desktop

- **Mobile:** Hero + 2-column grid + bottom sheet detail
- **Desktop:** Hero + 4-column grid + side panel detail (grid reflows to 3 columns when panel is open)

---

### 3.5 Challenges

Challenges no longer have their own top-level tab. They're accessed from the Me page via a preview card that links to a dedicated Challenges page (push navigation).

#### Layout

1. **Header** -- "Challenges" with a back arrow (returns to Me page)
2. **Segmented control** -- Active | Bingo (keep the existing tab pattern)
3. **Active challenges** -- card stack, each card slightly larger than current
4. **Bingo grid** -- keep the 4x4 grid but improve visual treatment

#### Visual Treatment

- **Challenge cards:** Full-width, generous padding (24px). Emoji icon at 48px in a soft-colored circle. Progress bar: 8px height (not 4px), rounded ends, primary green fill with a subtle gradient (lighter at the leading edge). Participant count as a ghost element (muted, small).
- **Bingo cells:** Larger (square, filling available width / 4). Completed cells: primary green background at 10% opacity with a centered checkmark animation (draws itself). Incomplete: white with a dashed border. The "FREE" center cell: gold background.
- **Near-completion banner:** Elevate this to a celebration moment. Confetti-style scattered dots in primary/gold colors behind the trophy icon.

#### What to Remove

- The "Reward" badge on challenge cards (it's noise -- rewards can be shown on completion)

#### What to Add

- A countdown timer on time-limited challenges ("3 days left")
- A "Share progress" button that creates a feed post
- Completion celebration (full-screen confetti + badge earned animation when a challenge is finished)

---

### 3.6 Onboarding & Auth

Covered in detail in [Section 8](#8-onboarding-flow). The auth page needs a visual overhaul: the current card-with-tabs treatment is functional but forgettable. See the wireframe in Section 6.

---

## 4. Component Design System

### 4.1 Card Styles

Three card variants, used consistently:

| Variant | Use Case | Treatment |
|---------|----------|-----------|
| **Surface** | Default content card (posts, products, sessions) | White background, no border, no shadow. Separated by spacing alone or a 1px divider line. Clean, editorial. |
| **Elevated** | Interactive cards (studio preview, challenge card, featured product) | White background, subtle shadow (`0 2px 16px rgba(0,0,0,0.06)`), 16px border-radius. These cards "float" above the background. |
| **Accent** | Highlight cards (weekly recap, streak celebration, CTA cards) | Tinted background (primary at 5%), 1px border in primary at 10%, 16px border-radius. Draws attention without being garish. |

**Rules:**
- Never stack Elevated cards directly on top of each other (creates shadow soup)
- Surface cards are the workhorse -- use them for 80% of content
- Accent cards are rare -- max one per scroll viewport
- Card padding: 20px on mobile, 24px on desktop
- Card border-radius: 16px universally (the current 8px is too tight for a premium feel)

### 4.2 Button Hierarchy

| Level | Name | Treatment | Use Case |
|-------|------|-----------|----------|
| **1** | Primary | Solid primary green, white text, 12px border-radius, 48px height, 16px horizontal padding | One per screen. The main action: "Book", "Share Session", "Checkout" |
| **2** | Secondary | White/transparent background, 1px primary border, primary text | Supporting actions: "View Studio", "See All", "Follow" |
| **3** | Ghost | No background, no border, primary text, subtle hover background (elevate-1) | Tertiary actions: "Cancel", "Skip", nav-like links |
| **4** | Destructive | Solid destructive red, white text | Dangerous actions only: "Delete Account", "Cancel Booking" (confirm first) |
| **5** | Icon | 40px circle, muted background, foreground icon | Utility: close, share, settings, filter toggles |

**Rules:**
- Only one Primary button visible per screen at a time
- Buttons have a minimum tap target of 48px height
- Button text is always sentence case ("Book now"), never ALL CAPS
- Loading state: button text fades to 50% opacity, a subtle spinner replaces the icon (if present)
- Disabled state: 40% opacity, no hover/active effects

### 4.3 Badge & Chip Styles

Two categories:

**Filter Chips** (interactive):
- Pill shape (fully rounded, height 36px)
- Inactive: white background, 1px muted border, foreground text
- Active: primary background, white text, no border
- Tap target: the entire pill

**Info Badges** (non-interactive):
- Small pill (height 24px, 8px horizontal padding)
- Variants by color:
  - **Level badges:** Green (Beginner), Blue (Intermediate), Purple (Advanced), Gold (Master)
  - **Status badges:** Primary (category labels), Muted (time ago, counts)
  - **Special:** Gold with dark text (rewards, featured)
- Text: overline style (11px, medium weight)

### 4.4 Avatar Treatment

**Primary avatar (profile, post author):**
- Circular, with a 2px ring in the user's assigned color
- Inside: user initials on a soft gradient matching the ring color (current approach is fine, but soften the gradient)
- Sizes: 32px (inline mentions), 40px (post author), 64px (profile lists), 80px (own profile)

**Avatar group (circle members, studio regulars):**
- Overlapping stack, -8px margin between each
- Max 4 visible + "+N" overflow circle
- Ring color: white (to separate overlapping avatars)

**Rules:**
- Avatar initials: max 2 characters, 50% of avatar diameter as font size
- When a real photo is available (future): circular crop, same ring treatment
- Never use generic placeholder icons -- always initials

### 4.5 Image Aspect Ratios & Treatments

| Context | Ratio | Border Radius | Overlay |
|---------|-------|---------------|---------|
| Studio hero (detail) | 16:9 | 0 (full-width) | Gradient bottom 40% (black 60% -> transparent) |
| Studio card (list) | 3:2 | 12px | None |
| Product (grid) | 4:5 | 12px | None |
| Product (hero) | 16:9 | 16px | Gradient bottom 40% |
| Feed post photo | 4:3 | 12px | Warm tone 2% opacity |
| Profile avatar | 1:1 | Full circle | None |

**Rules:**
- All images use `object-cover` (never stretch or letterbox)
- Loading state: skeleton with a subtle pulse animation (not a gray box)
- Error state: muted background with a small icon (camera or image) -- never a broken image icon

### 4.6 Empty States

Empty states are moments of opportunity, not dead ends. Every empty state has three elements:

1. **Illustration or icon** -- a large (64px) icon in muted foreground at 30% opacity. Eventually replaced with custom illustrations.
2. **Message** -- a friendly, human headline (serif font). "No sessions yet" becomes "Your practice begins here."
3. **Action** -- a primary or secondary button that resolves the empty state. "Book your first class" / "Create a discussion" / "Explore the shop."

**Treatment:** Centered vertically in the available space. 48px padding on all sides. The message and action are tightly grouped (8px gap), with 24px between the icon and the message.

### 4.7 Loading States

**Skeleton screens** (preferred for known content shapes):
- Use rounded rectangles matching the final content layout
- Subtle pulse animation: opacity oscillates between 0.4 and 0.7 over 1.5s
- Skeleton color: muted background (not gray -- use the warm muted tone)
- Show skeletons for 300ms minimum (avoid flash of skeleton for fast loads)

**Spinner** (for actions like booking, checkout):
- A small (20px) circular spinner in the button or action area
- Primary color stroke, 1.5px width, 75% arc
- Rotates at 0.8s per revolution

**Pull-to-refresh:**
- Custom animation (see micro-interactions section)
- Do not use the browser default

**Rules:**
- Never show a full-page spinner. Always use skeletons that match the page structure.
- Optimistic updates for social actions (kudos, follow, vote) -- show the result immediately, roll back on error.

### 4.8 Animation Guidelines

**What should animate:**
- Page transitions (cross-fade, 200ms)
- Sheet/modal entry and exit (slide up 300ms with spring easing)
- Progress bars and rings (fill on load, 500-700ms)
- Kudos/like reactions (bounce/pop, 300ms)
- Card hover states (shadow and scale, 150ms)
- Filter chip active state (background color, 150ms)
- Cart badge count change (scale bounce, 200ms)
- Skeleton pulse (continuous, 1.5s loop)
- Collapse/expand sections (height + opacity, 250ms)

**What should NOT animate:**
- Text content appearing (just render it)
- Navigation tab switching (instant highlight change)
- Scroll position (native momentum only)
- Form validation errors (appear instantly, red border)
- Data updates in charts (re-render without transition, unless it's the initial load)

**Easing:**
- Entrances: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out with overshoot -- "spring")
- Exits: `cubic-bezier(0.55, 0, 1, 0.45)` (ease-in, quick departure)
- Interactions: `cubic-bezier(0.4, 0, 0.2, 1)` (Material ease-in-out)

**Duration rules:**
- Micro (hover, toggle): 100-150ms
- Small (chip activate, badge): 200ms
- Medium (sheet entry, page transition): 250-350ms
- Large (progress ring, celebration): 500-800ms
- Never exceed 800ms for any single animation

---

## 5. Color & Theme Refinement

### Current Palette Assessment

The sage green primary `hsl(110, 18%, 38%)` is a solid foundation. Sage green communicates wellness, calm, and nature without the cliches of "gym blue" or "yoga purple." However:

- **It's too muted.** At 18% saturation, the green verges on olive/gray in certain lighting conditions and on lower-quality screens. CTAs lack punch.
- **There's no accent color.** Every interactive element is sage green. When everything is the same color, nothing stands out. The "Book" button, filter chips, progress bars, and badges all compete visually.
- **The warm cream background is good** but the warm/cool contrast between cream backgrounds and slate foregrounds could be tightened.
- **Orange is overused as a secondary.** Calories, streaks, and various highlights use orange, which clashes with the serene palette.

### Proposed Refined Palette

#### Light Mode

```
Primary (Sage):
  --primary: 152 24% 36%        /* Shifted toward teal-sage. More sophisticated
                                    than yellow-green. Better contrast. */
  --primary-foreground: 0 0% 100%
  --primary-light: 152 20% 95%   /* For tinted backgrounds (accent cards, chips) */
  --primary-hover: 152 24% 32%   /* Darkened for hover states */

Accent (Warm Terracotta):
  --accent: 18 60% 58%           /* A warm, earthy terracotta. Complements sage
                                    beautifully. Used ONLY for primary CTAs and
                                    key moments: Book button, Log Session button,
                                    Checkout button. */
  --accent-foreground: 0 0% 100%

Background:
  --background: 40 40% 97%       /* Warm cream, slightly more saturated */
  --foreground: 220 20% 16%      /* Near-black with a cool undertone */

Surface:
  --card: 0 0% 100%              /* Pure white cards */
  --card-foreground: 220 20% 16%

Borders:
  --border: 40 10% 90%           /* Warm-toned border, not cool gray */

Text hierarchy:
  --text-primary: 220 20% 16%    /* Headings, primary content */
  --text-secondary: 220 10% 46%  /* Body text, descriptions */
  --text-muted: 220 8% 62%       /* Captions, timestamps, secondary info */

Semantic:
  --success: 152 50% 42%         /* Aligned with primary for consistency */
  --warning: 38 92% 58%          /* Warm amber */
  --destructive: 0 72% 56%       /* Softer red than the current 84% saturation */

Data visualization:
  --chart-1: 152 24% 36%         /* Primary (sage) */
  --chart-2: 18 60% 58%          /* Accent (terracotta) */
  --chart-3: 220 50% 56%         /* Cool blue */
  --chart-4: 280 40% 58%         /* Soft purple */
  --chart-5: 38 80% 56%          /* Warm amber */
```

#### Dark Mode

```
--background: 220 20% 10%        /* Deep cool charcoal, not pure black */
--foreground: 40 20% 92%         /* Warm off-white */
--card: 220 18% 14%              /* Slightly lighter than background */
--primary: 152 22% 56%           /* Lightened sage for dark backgrounds */
--accent: 18 55% 62%             /* Lightened terracotta */
--border: 220 15% 20%            /* Subtle dark border */
```

### Color Usage Rules

1. **Primary sage green** is used for: progress indicators, active states, filter chips, badges, secondary buttons, links, and data that represents the user's activity. It's the "identity" color.

2. **Accent terracotta** is used for: primary CTA buttons ONLY. This is the "do something" color. Booking, sharing, checking out, creating. Max one terracotta button per screen. This scarcity makes it powerful.

3. **Neutrals** are used for: 80% of the UI. Backgrounds, cards, text, borders, dividers. The app should feel mostly neutral with green and terracotta as considered punctuation.

4. **Semantic colors** (success, warning, destructive) are used only for their intended purpose. Never use destructive red for non-destructive UI (like the current rose wishlist hearts -- use primary instead).

5. **Orange is removed as a data color.** Calories use the primary sage (or muted text). The previous orange for calories, streaks, and leaderboards created visual noise. In charts, orange is replaced by terracotta. In UI, it's replaced by primary or muted.

### Why Teal-Sage Over Yellow-Sage

The current `hsl(110, 18%, 38%)` leans yellow-green (hue 110). Shifting to hue 152 (teal-sage) achieves:
- Better perceived contrast against warm cream backgrounds
- A more "spa" / "wellness" feel (teal is associated with healing, calm, water)
- Better accessibility: teal-sage at 36% lightness passes WCAG AA at 4.7:1 against white
- A more distinctive brand color (yellow-green sage is common in wellness apps; teal-sage is rarer)

---

## 6. Key Screen Wireframes

### 6.1 Explore (Mobile)

```
┌─────────────────────────────┐
│ PilatesHub    [🔍] [🛒] [👤]│  <- Header
├─────────────────────────────┤
│┌───────────────────────────┐│
││ ○ Reformer  ○ Mat  ○ Near ││  <- Filter chips (frosted glass bg)
│├───────────────────────────┤│
││                           ││
││      ┌──┐    ┌──┐         ││
││      │45│    │38│         ││  <- Map with price markers
││      └──┘    └──┘         ││
││  ┌──┐          ┌──┐       ││
││  │55│    ●     │50│       ││  <- ● = user location
││  └──┘          └──┘       ││
││                     [◎]   ││  <- Recenter button
││                           ││
│├───────────────────────────┤│
││ ┌─────────────────────┐   ││
││ │ ┌─────┐             │   ││  <- Selected studio card
││ │ │     │ Studio Name  │   ││     (slides up from bottom)
││ │ │ img │ ★ 4.9 (234)  │   ││
││ │ │     │ Marais · 0.3km│   ││
││ │ └─────┘ [View Studio]│   ││
││ └─────────────────────┘   ││
│└───────────────────────────┘│
├─────────────────────────────┤
│  ◈ Explore   ◈ Feed   ◈ Me   ◈ Shop │  <- Bottom nav (4 tabs)
└─────────────────────────────┘
```

### 6.2 Feed - Activity (Mobile)

```
┌─────────────────────────────┐
│ PilatesHub    [🔍] [🛒] [👤]│  <- Header
├─────────────────────────────┤
│ [ Activity | Forum | Circles ]│  <- Segmented control
├─────────────────────────────┤
│                              │
│  ┌──────────────────────┐    │
│  │ (EM) Emma D.    2h ago│    │  <- Post card
│  │      [Following]      │    │
│  │                       │    │
│  │ completed Reformer    │    │
│  │ Advanced at Studio    │    │
│  │ Harmonie              │    │
│  │                       │    │
│  │ ┌───────────────────┐ │    │
│  │ │                   │ │    │  <- Post image (4:3)
│  │ │   session photo   │ │    │
│  │ │                   │ │    │
│  │ └───────────────────┘ │    │
│  │                       │    │
│  │ 55 min · 320 cal      │    │  <- Inline stats (not pills)
│  │                       │    │
│  │ 🤸 12 kudos           │    │
│  │ ────────────────────  │    │
│  │ 🤸 Kudos    💬 3      │    │  <- Action row
│  └──────────────────────┘    │
│                              │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │  <- Thin separator
│                              │
│  ┌──────────────────────┐    │
│  │ (LM) Lucas M.   5h ago│    │  <- Next post
│  │ ...                   │    │
│  └──────────────────────┘    │
│                              │
│                        [＋]  │  <- FAB (log session)
├─────────────────────────────┤
│  ◈ Explore   ◈ Feed   ◈ Me   ◈ Shop │
└─────────────────────────────┘
```

### 6.3 Me (Mobile)

```
┌─────────────────────────────┐
│ My Practice           [⚙️]  │  <- Header with settings
├─────────────────────────────┤
│                              │
│         ┌────────┐           │
│         │  (SJ)  │           │  <- Large avatar (80px)
│         └────────┘           │
│      Sarah Johnson           │  <- Name (H1)
│    [ Advanced Level ]        │  <- Level badge
│                              │
│   47 Sessions  23 Followers  │  <- Stats row
│                31 Following  │
│                              │
│  ┌──────────────────────┐    │
│  │    ╭───╮              │    │
│  │   ╱     ╲  4 of 5     │    │  <- Weekly recap ring
│  │  │  4/5  │  sessions   │    │
│  │   ╲     ╱  this week   │    │
│  │    ╰───╯              │    │
│  │                       │    │
│  │  🔥 12-day streak     │    │
│  └──────────────────────┘    │
│                              │
│  ┌──────────────────────┐    │
│  │  M  T  W  T  F  S  S │    │  <- Weekly calendar
│  │  ✓  ✓  ✓  ✓  ◯  ✓  · │    │
│  └──────────────────────┘    │
│                              │
│  Upcoming                    │
│  ┌──────────────────────┐    │
│  │ Oct 24 │ Adv Cadillac │    │  <- Upcoming session
│  │  Tue   │ Core & Flow  │    │
│  │        │ 09:00        │    │
│  └──────────────────────┘    │
│  See all bookings →          │
│                              │
│  Challenges                  │
│  ┌──────────────────────┐    │
│  │ 🏃 March Madness      │    │  <- Featured challenge
│  │ ████████░░░ 14/20     │    │
│  │ 342 participants      │    │
│  └──────────────────────┘    │
│  View all challenges →       │
│                              │
│  Badges  (3/6 earned)        │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐  │  <- Horizontal scroll
│  │✓ │ │✓ │ │✓ │ │🔒│ │🔒│  │
│  └──┘ └──┘ └──┘ └──┘ └──┘  │
│                              │
│  ▸ Your Apparatus Journey    │  <- Collapsed section
│  ▸ 8-Week Calorie Trend     │  <- Collapsed section
│                              │
│  Friends Leaderboard         │
│  1. Emma D.    2,450 cal    │
│  2. Lucas M.   2,100 cal    │
│  3. Sophie B.  1,890 cal    │
│  You: #6                    │
│  See full leaderboard →      │
│                              │
├─────────────────────────────┤
│  ◈ Explore   ◈ Feed   ◈ Me   ◈ Shop │
└─────────────────────────────┘
```

### 6.4 Shop (Mobile)

```
┌─────────────────────────────┐
│ PilatesHub    [🔍] [🛒] [👤]│  <- Header (cart badge: 2)
├─────────────────────────────┤
│                              │
│  ┌──────────────────────┐    │
│  │                       │    │
│  │   Featured product    │    │  <- Hero banner (16:9)
│  │   hero image with     │    │
│  │   gradient overlay    │    │
│  │                       │    │
│  │   Theragun Mini       │    │
│  │   Recovery essential  │    │
│  │       [Shop Now]      │    │
│  └──────────────────────┘    │
│                              │
│  ○ All ○ Apparel ○ Mats ○ ..│  <- Category chips
│                              │
│  ┌──────────┐ ┌──────────┐   │
│  │          │ │          │   │  <- Product grid (2 col)
│  │  product │ │  product │   │
│  │   image  │ │   image  │   │
│  │          │ │          │   │
│  │ TOESOX   │ │ BALANCED │   │  <- Brand (overline)
│  │ Premium  │ │ Reformer │   │  <- Product name
│  │ Grip... │ │ Straps   │   │
│  │ €24     │ │ €45      │   │  <- Price
│  │    [🛒] │ │    [🛒]  │   │  <- Add to cart icon btn
│  └──────────┘ └──────────┘   │
│                              │
│  ┌──────────┐ ┌──────────┐   │
│  │          │ │          │   │
│  │  ...     │ │  ...     │   │
│  └──────────┘ └──────────┘   │
│                              │
├─────────────────────────────┤
│  ◈ Explore   ◈ Feed   ◈ Me   ◈ Shop │
└─────────────────────────────┘
```

### 6.5 Onboarding (Mobile) - Screen 2 of 4

```
┌─────────────────────────────┐
│                     [Skip]   │  <- Skip link (top right)
│                              │
│                              │
│         ┌─────────┐          │
│         │         │          │
│         │  Warm   │          │  <- Illustration (centered)
│         │  yoga   │          │
│         │  scene  │          │
│         │         │          │
│         └─────────┘          │
│                              │
│                              │
│    What's your experience    │  <- Question (serif, display)
│    with Pilates?             │
│                              │
│                              │
│  ┌──────────────────────┐    │
│  │   Just starting out   │    │  <- Selection card
│  │   Brand new to Pilates│    │
│  └──────────────────────┘    │
│                              │
│  ┌──────────────────────┐    │
│  │ ✓ I know the basics   │    │  <- Selected state
│  │   Some mat experience │    │     (primary border + check)
│  └──────────────────────┘    │
│                              │
│  ┌──────────────────────┐    │
│  │   Advanced practitioner│    │
│  │   Years of practice   │    │
│  └──────────────────────┘    │
│                              │
│                              │
│     ○  ●  ○  ○               │  <- Progress dots (screen 2/4)
│                              │
│     [      Continue     ]    │  <- Primary CTA
│                              │
└─────────────────────────────┘
```

---

## 7. Micro-interactions & Delight

Ten micro-interactions that make PilatesHub feel handcrafted:

### 7.1 Kudos Burst

When a user taps the kudos button on a post, the emoji (gymnast) scales up to 1.3x with a spring animation, then three smaller emojis burst outward in a radial pattern (like confetti) and fade out over 400ms. The kudos count increments with a vertical slide-up of the new number (old number slides down and out).

### 7.2 Booking Confirmation Celebration

When the "Book" button is pressed and confirmed, the button itself morphs: it expands to full-width, the background transitions from terracotta to sage green, the text changes to "Booked!" with a checkmark that draws itself (SVG stroke animation, 300ms). A subtle ring of golden particles expands from the button center and fades. The time slot badges dim gracefully.

### 7.3 Pull-to-Refresh (The Breath)

Instead of a generic spinner, the pull-to-refresh animation shows a small circle that expands and contracts like a breathing exercise. Pull down: the circle expands (inhale). Release: the circle contracts (exhale) and a refresh spinner takes over. This is on-brand for a Pilates app -- it turns a utility gesture into a branded moment.

### 7.4 Progress Ring Fill

On the Me page, the weekly progress ring animates from 0 to the current value when it enters the viewport. The stroke uses an ease-out curve (fast start, gentle finish) over 700ms. When a session is logged that completes the weekly goal, the ring fills completely and emits a subtle golden glow pulse (two cycles, then fades).

### 7.5 Map Marker Selection

When a map marker is tapped, it doesn't just scale up -- it lifts. The shadow deepens, the marker scales to 1.2x with a spring overshoot, and the studio preview card slides in from below with a coordinated timing (card starts 100ms after marker, creating a cascading effect). Deselecting: the marker settles back down (reverse spring), and the card slides down.

### 7.6 Add-to-Cart Flight

When the user taps the cart icon on a product, a translucent copy of the product image (40px square) detaches from the card and "flies" along a curved bezier path toward the cart icon in the header. As it arrives, the cart icon bounces (scale 1.2x then back) and the badge count increments with a pop animation. Duration: 500ms total.

### 7.7 Feed Post Appearance

When a new post is added to the feed (after logging a session), it doesn't just appear at the top. The existing posts slide down smoothly (200ms), and the new post fades in from 0 opacity while sliding down from -20px (200ms, starting after the push-down). A subtle "Your post" label flashes and fades after 2 seconds.

### 7.8 Bingo Cell Completion

When a bingo cell is tapped to complete it, the cell background fills from the center outward (radial reveal, 200ms), the checkmark draws itself (SVG stroke animation, 150ms), and a single soft haptic pulse fires (on devices that support it). If this cell completes a row, column, or diagonal, the completed line briefly highlights with a golden flash that travels along the line.

### 7.9 Tab Switch Indicator

The bottom nav active indicator is a small pill-shaped bar (24px wide, 3px tall) below the active icon. When switching tabs, this pill doesn't teleport -- it slides horizontally to the new position with a spring easing (250ms). The icon above the destination tab scales up slightly (1.05x) and the departing icon scales back to 1.0x.

### 7.10 Streak Counter Increment

When the streak counter increases (after logging a session), the flame icon beside it flickers: it scales to 1.3x, the fill color shifts from sage to a warm amber for 200ms, then returns. The number itself uses a slot-machine-style vertical scroll, with the old number rolling up and the new number rolling in from below. If the streak hits a milestone (7, 14, 30), a small firework burst appears above the counter.

---

## 8. Onboarding Flow

### Why Onboarding Matters

Currently, after signup, the user is dropped directly into the Map page with no context. They don't know what PilatesHub does, why they should care about each section, or how to get started. Onboarding converts a confused new user into an engaged one.

### Flow Design (4 screens)

#### Screen 1: Welcome

- **Visual:** Full-screen warm image of a bright Pilates studio (blurred slightly), with the PilatesHub wordmark overlaid in white.
- **Headline (serif):** "Welcome to your practice."
- **Subtext:** "PilatesHub connects you with the best studios, tracks your progress, and surrounds you with a community that moves together."
- **Action:** "Get Started" (primary button)
- **Secondary:** "I already have an account" (ghost link -> Login)

#### Screen 2: Experience Level

- **Question (serif):** "What's your experience with Pilates?"
- **Options (selection cards, single-select):**
  - "Just starting out" -- Brand new to Pilates
  - "I know the basics" -- Some mat or group class experience
  - "Advanced practitioner" -- Years of practice, multiple apparatus
- **Why we ask:** Sets the user's level (Beginner/Intermediate/Advanced), which filters studio recommendations, challenge difficulty, and forum flair.

#### Screen 3: Favorite Apparatus

- **Question (serif):** "What do you love to practice?"
- **Options (multi-select chips, minimum 1):**
  - Mat, Reformer, Tower, Cadillac, Wunda Chair, Spine Corrector
- **Visual:** Each chip has a small illustration or emoji of the apparatus
- **Why we ask:** Personalizes the Explore page filters (pre-selecting their preferred types), seeds the Apparatus Journey on the Me page, and tailors challenge recommendations.

#### Screen 4: Goals

- **Question (serif):** "What are you working toward?"
- **Options (multi-select cards, minimum 1):**
  - "Build strength" -- Core power and muscle tone
  - "Improve flexibility" -- Range of motion and stretch
  - "Find community" -- Connect with fellow practitioners
  - "Stay consistent" -- Build a regular practice habit
- **Why we ask:** Determines which dashboard widgets get priority placement (e.g., "Stay consistent" users see the streak and calendar prominently; "Find community" users see the leaderboard and circles).

#### After Onboarding

- **Transition:** The last screen dissolves into the Explore page with a welcome toast: "You're all set, {name}! Start by finding a studio near you."
- **Data stored:** Level, preferred apparatus, goals -- all saved to user profile and used to personalize the experience.
- **Skippable:** Every screen has a "Skip" link in the top-right. Skipping sets sensible defaults (Intermediate, Reformer + Mat, Build strength).

### Personalization Impact

| User chose... | App personalizes... |
|---|---|
| Beginner level | Shows "Beginner" filter active by default on Explore, suggests intro challenges |
| Advanced level | Shows advanced classes first, unlocks more apparatus in Journey Map |
| Loves Reformer | Pre-selects "Reformer" filter on Explore, prioritizes Reformer Master challenge |
| Goal: Stay consistent | Weekly Recap and streak are the first thing on the Me page |
| Goal: Find community | Circles and Leaderboard are promoted higher on the Me page |

---

## 9. Priority Recommendations

Ranked by impact, from "implement immediately" to "nice to have." Each item includes the estimated effort and the user-facing benefit.

### Tier 1: Implement First (Highest Impact)

**1. Reduce navigation to 4 tabs and merge Feed/Community/Circles**
- *Effort:* Medium (routing changes, component reorganization)
- *Impact:* Eliminates the #1 UX problem. Every user interaction becomes clearer. Reduces cognitive load immediately.
- *Why first:* This is structural. Every other improvement builds on a cleaner information architecture.

**2. Unify Dashboard and Profile into the "Me" page**
- *Effort:* Medium (merge two pages, reorganize sections)
- *Impact:* Eliminates the confusing split between "my stats" and "my profile." Users get one home base. Reduces redundancy (badges, bookings shown in two places currently).
- *Why second:* Directly tied to the nav restructure. These go together.

**3. Introduce the accent color (terracotta) for primary CTAs**
- *Effort:* Low (CSS variable changes, update ~10-15 button instances)
- *Impact:* Immediate visual clarity. The "Book" and "Share Session" buttons finally stand out from the sea of sage green. Conversion-driving actions become unmissable.
- *Why third:* Quick win with outsized visual impact.

**4. Increase spacing, padding, and border-radius globally**
- *Effort:* Low (CSS/Tailwind class updates)
- *Impact:* The single fastest way to make the app feel premium. Bigger card padding (20px), wider screen margins (20px), 16px border-radius on cards. The app immediately breathes.
- *Why fourth:* Another quick win. Can be done in a single CSS pass.

### Tier 2: Implement Next (High Impact)

**5. Redesign the Explore page with bottom-sheet studio list**
- *Effort:* High (new interaction pattern, gesture handling)
- *Impact:* The Explore page is the app's front door. A full-screen map with a draggable bottom sheet is the modern standard (Uber, Google Maps, Airbnb). It feels native and premium.
- *Why tier 2:* Requires more engineering effort but transforms the core experience.

**6. Redesign Feed with borderless post cards and inline stats**
- *Effort:* Medium (component refactoring)
- *Impact:* The feed goes from "app prototype" to "social platform." Removing borders, using whitespace as dividers, and inlining stats instead of colored pills creates an editorial quality.

**7. Build the onboarding flow**
- *Effort:* Medium (4 new screens, profile data integration)
- *Impact:* Every new user gets a guided introduction instead of being dropped into the map. Personalization data improves the experience from day one. Critical for retention.

### Tier 3: Implement After (Medium Impact)

**8. Add the Shop hero section and varied grid**
- *Effort:* Medium (new hero component, grid layout adjustments)
- *Impact:* The Store transforms from a generic product grid into a curated boutique. The hero section signals editorial intent and makes the shopping experience feel premium.

**9. Implement micro-interactions (kudos burst, booking celebration, progress ring animation)**
- *Effort:* Medium-High (custom animations, potentially Framer Motion)
- *Impact:* These are the moments users remember and talk about. "Did you see the animation when you book a class?" Emotional delight drives retention.

**10. Introduce collapsible sections on the Me page**
- *Effort:* Low (accordion component, already available in shadcn)
- *Impact:* The Me page goes from a wall of content to a curated experience. Users see what matters (this week's progress, upcoming sessions) and expand deeper content on demand.

### Implementation Sequence

```
Week 1-2:  Items 1, 2, 3, 4 (navigation + color + spacing)
           These are structural and CSS-level changes that transform
           the entire app.

Week 3-4:  Items 5, 6 (Explore + Feed redesign)
           The two most-used pages get their premium treatment.

Week 5-6:  Items 7, 8 (Onboarding + Shop)
           New user experience and commerce upgrade.

Week 7-8:  Items 9, 10 (Micro-interactions + collapsible sections)
           Polish and delight layer on top of the new foundation.
```

---

## Appendix: What We're NOT Doing (and Why)

- **No dark gradient backgrounds or glassmorphism as a primary style.** These trends age quickly. Our warm cream + white cards are timeless.
- **No gamification overload.** We have badges and challenges, and that's enough. No XP bars, no level-up animations, no competitive pressure. Pilates is about the practice, not the score.
- **No social media patterns that create anxiety.** No follower counts on other people's profiles, no "X people are watching" indicators, no algorithmic feed. The feed is chronological. The community is supportive, not competitive.
- **No feature removal.** Every feature in the inventory stays. We're reorganizing and re-skinning, not cutting. Bingo stays. Circles stay. The apparatus journey stays. They just live in better homes now.

---

*This document is a living brief. As implementation progresses, each section should be updated with final decisions, component names, and Figma frame links.*
