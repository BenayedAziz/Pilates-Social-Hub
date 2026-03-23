# PilatesHub Code Audit -- March 2026

**Auditor:** Claude Opus 4.6 (automated)
**Date:** 2026-03-24
**Scope:** Full frontend codebase (`artifacts/pilateshub/src/`), shared libraries (`lib/`), build configuration, and frontend-backend contract.

---

## Executive Summary

PilatesHub is a React SPA (Vite + TailwindCSS + wouter router) with lazy-loaded pages, React Query data fetching, i18n (FR/EN), a Leaflet map, and a rich mock/API-backed feature set. The codebase is well-structured with code splitting, error boundaries, and skeleton loaders. However, the audit uncovered **78 Biome diagnostics** (lint + format), several dead-code issues, accessibility gaps, security concerns, performance risks, and frontend/backend inconsistencies.

### Tooling Results

| Check | Result |
|-------|--------|
| `tsc --noEmit` | **PASS** -- zero type errors |
| `biome check` | **70 errors, 7 warnings, 1 info** (format issues, unused imports/variables, a11y, import ordering) |

---

## 1. TypeScript Errors

**None.** The project compiles cleanly with `tsc --noEmit -p tsconfig.json`.

---

## 2. Dead Code / Unused Imports

### 2.1 Unused Imports (Biome warnings -- auto-fixable)

| File | Unused Symbol |
|------|---------------|
| `components/ScheduleManager.tsx` | `Users` from lucide-react |
| `components/StudioDetailDialog.tsx` | `CheckCircle2` from lucide-react |
| `pages/CoachPage.tsx` | Unused import (per Biome) |

### 2.2 Unused Variables

| File | Variable | Notes |
|------|----------|-------|
| `components/StudioDetailDialog.tsx:22` | `bookingSuccess` | Destructured from `useApp()` but never read |
| `components/StudioDetailDialog.tsx:48` | `handleBook` | Function defined but never called -- the booking flow was likely moved to the dedicated `BookingPage` |
| `components/StudioAnalytics.tsx:27` | `DAILY_VIEWS` | Data array declared but never rendered |
| `components/layout/Header.tsx:14` | `clearCart` | Destructured from `useApp()` but not used in this component |

### 2.3 Dead / Unreachable Pages

| Page | Issue |
|------|-------|
| `DashboardPage.tsx` | Imported via lazy but **no route** exists in `App.tsx`. The file is completely unreachable. |
| `ProfilePage.tsx` | Same situation -- imported nowhere, has no route. Duplicate of `MePage.tsx` with hardcoded "Sarah Johnson" data. |
| `StudioAnalyticsPage.tsx` | Defined but **no route** in `App.tsx`. Unreachable. |

---

## 3. Broken Pages / Components

### 3.1 StudioDetailDialog -- Dead Booking Button

`handleBook` is defined but never wired to any button in the dialog. The "Book a Session" button navigates to `/booking/:studioId` instead, which is correct, but the dead code (`handleBook`, `bookingSuccess`, `selectedTime`) should be removed to avoid confusion.

### 3.2 BookingPage -- Payment is Simulated

`BookingPage` uses `setTimeout` to simulate payment (line 393-398). It displays a hardcoded Visa ending in 4242. No real payment integration exists despite the `useBookingPayment` and `useOrderPayment` hooks being defined in `use-payments.ts`.

### 3.3 CheckoutPage -- Same Payment Simulation

The checkout flow simulates a 2-second delay (line 729) and then marks the order as confirmed. The API call to `/api/orders` is fire-and-forget with `.catch(() => {})`. If the API is down, the user sees "Order Confirmed" but no order is persisted.

### 3.4 MapPage -- FlyToPosition Missing `map` Dependency

In `FlyToPosition` (line 141), the `useEffect` dependency array is `[position[0], position[1]]` but does not include `map` (from `useMap()`). While `map` is stable in practice (Leaflet instance), this violates the exhaustive-deps rule and could cause subtle bugs if the map instance ever changed.

---

## 4. API / Backend Issues

### 4.1 Duplicate `apiFetch` Implementation

Both `hooks/use-api.ts` and `hooks/use-payments.ts` define their own `apiFetch` function with identical logic. This is a DRY violation and a maintenance hazard -- a fix in one may not be applied to the other.

### 4.2 Pervasive `any` Types in API Layer

Every hook in `use-api.ts` returns `any` or `any[]`:
```ts
useQuery<any[]>("/studios?...")
useQuery<any>("/auth/me")
```
The DB schema (`lib/db/src/schema/index.ts`) defines proper types (`Studio`, `User`, `Post`, etc.), but none are used on the frontend. The frontend `data/types.ts` defines its own parallel type system that may drift from the backend.

### 4.3 Frontend/Backend Type Mismatches

| Field | Frontend (`data/types.ts`) | Backend (`lib/db/src/schema`) | Issue |
|-------|---------------------------|-------------------------------|-------|
| Studio `coords` | `{ x: number; y: number }` | `coordX` / `coordY` (separate columns) | Manually mapped in `useStudios` via `s.coords ?? { x: s.coordX ?? 50, y: s.coordY ?? 50 }` |
| Studio `reviews` | `number` (review count) | `reviewCount` column | Mapped: `s.reviews ?? s.reviewCount ?? 0` |
| User `name` | `name` | `displayName` | Mapped in `toAuthUser()` with fallback chain |
| Product `image` vs `imageUrl` | Both fields on type | Single `imageUrl` in DB | Frontend maps: `p.image ?? p.imageUrl ?? ""` |
| Coach | Rich `CoachProfile` type with `slug`, `quote`, `sessionsCount`, `imageUrl` | Simple schema with `name`, `bio`, `specialties`, `avatarUrl` | Frontend type is much richer than DB schema; API must synthesize extra fields |

### 4.4 Missing API Endpoints (Frontend Calls Without Known Backend Routes)

The frontend calls these endpoints, but there is no evidence of their implementation in the repo:

- `GET /api/messages/conversations`
- `GET /api/messages/conversations/:id`
- `POST /api/messages/conversations/:id`
- `GET /api/messages/unread-count`
- `POST /api/payments/booking`
- `POST /api/payments/order`
- `POST /api/orders`
- `GET /api/wearable`
- `GET /api/bingo`
- `GET /api/calorie-data`
- `GET /api/circles`

These may be served by a mock server not present in this repo, or may 404 in production. The frontend gracefully degrades with fallback data in `MessagesPage.tsx` but other pages would show empty states or errors.

### 4.5 WebSocket Token Leak

In `use-websocket.ts` line 17, the JWT is passed as a URL query parameter:
```ts
const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;
```
Tokens in URLs are logged in server access logs, browser history, and intermediate proxies. Best practice is to send the token after connection via a message or in the WebSocket subprotocol.

---

## 5. Security Issues

### 5.1 JWT in WebSocket URL (HIGH)

See section 4.5 above. The token is exposed in server logs and potentially cached by reverse proxies.

### 5.2 Auto-Login with Mock User (MEDIUM)

In `AuthContext.tsx` lines 63-68, when no token exists, the app auto-logs in as "Emma D" (`MOCK_USER`) and sets `pilateshub-onboarded` to `true`. This is convenient for demos but must be removed before production. Any visitor without a token gets full access as a mock user.

### 5.3 No CSRF Protection on State-Changing Endpoints

All `POST`/`PUT` requests use `fetch` with `Content-Type: application/json`. Since browsers do not send JSON bodies in CSRF attacks (forms can only send `application/x-www-form-urlencoded` or `multipart/form-data`), the JSON content type provides implicit protection. However, if the server ever accepts form-encoded data, CSRF becomes exploitable.

### 5.4 No Input Sanitization for XSS

User-generated content (forum posts, reviews, messages) is rendered via `{post.title}`, `{msg.content}`, etc. React's JSX escaping prevents XSS by default. However, `MapPage.tsx` uses `L.divIcon({ html: ... })` with template literals (lines 83-99, 273-291) which could be exploitable if any studio data contains unsanitized HTML. Currently, only `price` (a number) is interpolated, so the risk is low but the pattern is fragile.

### 5.5 localStorage Token Storage

The JWT is stored in `localStorage` (`pilateshub-token`). This is vulnerable to XSS exfiltration (if XSS is ever achieved). HttpOnly cookies are generally preferred for token storage.

---

## 6. Performance Issues

### 6.1 Leaflet Marker Re-creation on Every Render

`createPinIcon()` in `MapPage.tsx` (line 74) creates a new `L.divIcon` on every call. Since it is called inside the render for each marker, and markers re-render on selection changes, this creates garbage for the GC. The icons should be memoized by `(price, selected)` key.

### 6.2 `generateSlots()` Called on Every Render

In `BookingPage.tsx` line 112, `generateSlots()` is called unconditionally outside of `useMemo`. It creates 70 slot objects on every render. Should be wrapped in `useMemo`.

### 6.3 AppContext `useMemo` Dependency Array Omits Functions

In `AppContext.tsx` lines 129-144, the `useMemo` for the context value lists state values but omits function references (`addToCart`, `removeFromCart`, `clearCart`, `toggleLike`, `toggleFollow`, `toggleVote`, `toggleWishlist`, `setBookingSuccess`, `logSession`). Since these are defined inline (not wrapped in `useCallback`), they change identity on every render, making the `useMemo` ineffective -- every consumer re-renders on every state change. Either wrap functions in `useCallback` or include them in the dependency array.

### 6.4 Large Bundle: All Radix UI Packages in devDependencies

The `package.json` lists 26 Radix UI packages, many of which are likely unused (e.g., `react-accordion`, `react-collapsible`, `react-context-menu`, `react-hover-card`, `react-menubar`, `react-navigation-menu`, `react-popover`, `react-radio-group`, `react-scroll-area`, `react-slider`, `react-switch`, `react-toggle`, `react-toggle-group`, `react-tooltip`). Tree-shaking should eliminate unused packages, but having them inflates install time and lockfile size.

### 6.5 External Image Loading Without `loading="lazy"`

All `<img>` tags throughout the app (studio cards, product images, feed photos) lack `loading="lazy"`. On pages like `MapPage` with many studio cards, all images load eagerly, increasing initial load time.

---

## 7. Accessibility Issues

### 7.1 Missing `type="button"` on Interactive Buttons (Biome a11y/useButtonType)

**8 instances** across:
- `OnboardingPage.tsx` (4 buttons in step screens)
- `MapPage.tsx` (1 button -- "See All")
- `BookingPage.tsx` (3 buttons -- day selector, time slots, back button)

Without `type="button"`, these default to `type="submit"` in forms, which can cause unexpected form submissions.

### 7.2 Labels Without Associated Controls (Biome a11y/noLabelWithoutControl)

**12 instances** across:
- `StudioAdminPage.tsx` (5 labels in settings form)
- `CheckoutPage.tsx` (7 labels in shipping form)
- `EditProfilePage.tsx` (1 label for level selector)

Labels use plain `<label>` elements without `htmlFor` attributes matching input `id`s.

### 7.3 SVGs Without Titles (Biome a11y/noSvgWithoutTitle)

2 instances in `StudioDetailDialog.tsx` -- decorative SVGs should have `aria-hidden="true"` or a `<title>` element.

### 7.4 Map Content Not Keyboard Accessible

The Leaflet map markers are only clickable via mouse. There is no keyboard navigation between markers or focus management when the preview card appears.

### 7.5 Color Contrast on Small Text

Multiple instances of `text-[9px]`, `text-[10px]`, and `text-[11px]` text with `text-muted-foreground/60` or similar low-opacity classes. These likely fail WCAG 2.1 AA contrast requirements at small sizes.

### 7.6 Missing `aria-label` on Navigation Links

The `BottomNav.tsx` and `SideNav.tsx` use `<Link>` wrapping `<div>` elements for navigation. These lack individual `aria-label` or `role="link"` attributes on the interactive elements.

---

## 8. Missing Error Handling

### 8.1 MessagesPage -- Silent API Failures

`MessagesPage.tsx` (lines 314-321) catches fetch errors silently and falls back to hardcoded data. The user has no indication that real-time messaging is unavailable.

### 8.2 No Global Error Handler for Unhandled Promise Rejections

The app has `ErrorBoundary` components for render errors but no handler for unhandled promise rejections (e.g., `window.addEventListener('unhandledrejection', ...)`).

### 8.3 Service Worker Registration Error Swallowed

In `main.tsx` line 11, the service worker registration error is caught with `.catch(() => {})`. If registration fails, there is no diagnostic information.

### 8.4 Geolocation IP Fallback Services

`use-geolocation.ts` tries 3 external IP geolocation services sequentially. If all 3 fail, the error is silently swallowed and the default Paris coordinates are used. This is acceptable behavior, but there is no user feedback that location detection failed.

---

## 9. Frontend / Backend Inconsistencies

### 9.1 Parallel Type Systems

The frontend defines its own types in `data/types.ts` that do not match the DB schema in `lib/db/src/schema/index.ts`. The generated API client (`lib/api-client-react/`) exists but is **not used** by the PilatesHub app -- it uses a hand-rolled `apiFetch` function instead. This means:

1. The Orval-generated typed client is wasted.
2. Schema changes in the backend will not produce TypeScript errors on the frontend.
3. The manual `any`-typed mapping layer in `useStudios()`, `useProducts()`, etc. is fragile.

### 9.2 `@workspace/api-client-react` is a Dependency But Unused

The `package.json` lists `"@workspace/api-client-react": "workspace:*"` as a dependency, and `tsconfig.json` has a project reference to it, but no source file imports from it.

### 9.3 Price Representation Mismatch

The DB schema comment says `price: integer("price") // in cents for precision, or whole euros`. The frontend treats prices as whole euros everywhere (e.g., `product.price` displayed directly as `{product.price}`). If the API ever returns cents, all price displays will be 100x too large.

---

## 10. Code Quality / Style Issues

### 10.1 Import Ordering (30+ files)

Biome reports unsorted imports in many files. Running `biome check --fix` would resolve these automatically.

### 10.2 Formatting Inconsistencies

Biome reports formatting diffs in several files (`App.tsx`, `NotificationSettings.tsx`, etc.). Running the formatter would resolve these.

### 10.3 Hardcoded Strings

Despite having i18n support (FR/EN), several pages still use hardcoded English strings:
- `DashboardPage.tsx` -- all text is hardcoded English
- `ProfilePage.tsx` -- all text is hardcoded English
- `BookingPage.tsx` -- all text is hardcoded English
- `ChallengesPage.tsx` -- all text is hardcoded English
- `CirclesPage.tsx` -- all text is hardcoded English
- `MessagesPage.tsx` -- all text is hardcoded English
- `StudioAdminPage.tsx` -- all text is hardcoded English
- `CheckoutPage.tsx` -- all text is hardcoded English

Only `MapPage`, `FeedPage`, `MePage`, `StorePage`, and `AuthPage` use `useTranslation()`.

### 10.4 Inconsistent Fallback Handling

Some pages handle loading with `<GenericPageSkeleton />` or specific skeleton components; others render nothing during load. The pattern is mostly consistent but `DashboardPage` uses `<DashboardPageSkeleton />` while being unreachable.

---

## 11. Recommendations (Priority Order)

### Critical (fix before production)

1. **Remove auto-login with mock user** -- `AuthContext.tsx` lines 63-68. Require real authentication.
2. **Move JWT from WebSocket URL to post-connection message** -- `use-websocket.ts` line 17.
3. **Remove dead pages** -- `DashboardPage.tsx`, `ProfilePage.tsx`, `StudioAnalyticsPage.tsx` (or add routes).
4. **Remove dead code** -- `handleBook`, `bookingSuccess` in `StudioDetailDialog.tsx`; `DAILY_VIEWS` in `StudioAnalytics.tsx`.

### High Priority

5. **Use the generated API client** (`@workspace/api-client-react`) instead of hand-rolled `apiFetch` to get type safety.
6. **Fix accessibility issues** -- add `type="button"`, associate labels with controls, add `aria-hidden` to decorative SVGs.
7. **Add `loading="lazy"` to images** throughout the app.
8. **Memoize expensive computations** -- `createPinIcon()`, `generateSlots()`.

### Medium Priority

9. **Consolidate duplicate `apiFetch`** -- single module imported by both `use-api.ts` and `use-payments.ts`.
10. **Fix `AppContext` useMemo** -- either wrap functions in `useCallback` or restructure to avoid stale closures.
11. **Complete i18n coverage** -- translate all hardcoded strings in remaining pages.
12. **Clarify price representation** (cents vs euros) between frontend and backend.

### Low Priority

13. **Clean up unused Radix UI dependencies** from `package.json`.
14. **Run `biome check --fix`** to resolve all auto-fixable format and import ordering issues.
15. **Add `loading="lazy"` to off-screen images** and consider using an image component with placeholder.
16. **Add global unhandled rejection handler** for better error tracking.

---

## Appendix: File Inventory

### Pages (18 files, 3 unreachable)

| File | Routed | Notes |
|------|--------|-------|
| `AuthPage.tsx` | Yes (pre-auth) | |
| `OnboardingPage.tsx` | Yes (pre-onboard) | |
| `MapPage.tsx` | `/` | |
| `FeedPage.tsx` | `/feed` | |
| `MePage.tsx` | `/me` | |
| `EditProfilePage.tsx` | `/me/edit` | |
| `CommunityPage.tsx` | `/community` | Also embedded in FeedPage tab |
| `StorePage.tsx` | `/store` | |
| `BrandsPage.tsx` | `/brands` | |
| `BrandPage.tsx` | `/brand/:slug` | |
| `CoachPage.tsx` | `/coach/:slug` | |
| `ChallengesPage.tsx` | `/challenges` | |
| `MessagesPage.tsx` | `/messages` | |
| `CirclesPage.tsx` | `/circles` | Also embedded in FeedPage tab |
| `BookingPage.tsx` | `/booking/:studioId` | |
| `StudioAdminPage.tsx` | `/admin/studio` | |
| `WearableSettingsPage.tsx` | `/settings/wearables` | |
| `CheckoutPage.tsx` | `/checkout` | |
| `DashboardPage.tsx` | **No route** | Dead code |
| `ProfilePage.tsx` | **No route** | Dead code |
| `StudioAnalyticsPage.tsx` | **No route** | Dead code |
| `not-found.tsx` | Catch-all | |

### Hooks (6 files)

`use-api.ts`, `use-payments.ts`, `use-geolocation.ts`, `use-mobile.tsx`, `use-theme.ts`, `use-websocket.ts`

### Contexts (2 files)

`AppContext.tsx`, `AuthContext.tsx`

### Total Biome Diagnostics Breakdown

| Category | Count |
|----------|-------|
| Format issues | ~40 |
| Import ordering (`organizeImports`) | ~15 |
| `a11y/noLabelWithoutControl` | 12 |
| `a11y/useButtonType` | 8 |
| `correctness/noUnusedImports` | 3 |
| `correctness/noUnusedVariables` | 4 |
| `a11y/noSvgWithoutTitle` | 2 |
| `suspicious/useIterableCallbackReturn` | 1 |

---

*End of audit.*
