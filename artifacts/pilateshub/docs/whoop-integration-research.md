# WHOOP Integration Research for PilatesHub

**Date:** March 23, 2026
**Status:** Research Complete
**Author:** PilatesHub Engineering

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [WHOOP API / Developer Platform](#whoop-api--developer-platform)
3. [Available Data Points for Pilates](#available-data-points-for-pilates)
4. [How Other Apps Integrate with WHOOP](#how-other-apps-integrate-with-whoop)
5. [Technical Integration Details](#technical-integration-details)
6. [Integration Architecture Proposal](#integration-architecture-proposal)
7. [Feature Roadmap for PilatesHub + WHOOP](#feature-roadmap-for-pilateshub--whoop)
8. [Other Wearables to Consider](#other-wearables-to-consider)
9. [Unified Wearable Strategy](#unified-wearable-strategy)
10. [Appendix: Code Examples](#appendix-code-examples)

---

## Executive Summary

WHOOP provides a well-documented, free-to-use REST API (v2) with OAuth 2.0 authentication, webhook support, and access to recovery, strain, sleep, and workout data. Pilates is a recognized activity type (sport_id: 43) in their system. The API is production-ready and suitable for building a deep integration into PilatesHub, enabling recovery-based class recommendations, auto-logged workouts, real-time strain monitoring, and coach dashboards.

**Key finding:** WHOOP's API does NOT provide raw continuous heart rate data -- only aggregated metrics (avg HR, max HR, HRV, resting HR, heart rate zones). Real-time heart rate streaming is available via Bluetooth Low Energy (BLE) Heart Rate Broadcast, not via the REST API. This distinction shapes our architecture.

---

## WHOOP API / Developer Platform

### Platform Overview

- **Developer Portal:** https://developer.whoop.com
- **API Documentation:** https://developer.whoop.com/api/
- **Developer Dashboard:** https://developer-dashboard.whoop.com
- **Current API Version:** v2 (v1 webhooks removed; v1 endpoint IDs deprecated past Sept 2025)
- **Base API URL:** `https://api.prod.whoop.com`
- **Cost:** Free to use (requires a WHOOP membership/device for testing)
- **App Limit:** Up to 5 applications per developer account

### Access Requirements

1. Create a WHOOP account (requires an active WHOOP membership)
2. Register at the Developer Dashboard (developer-dashboard.whoop.com)
3. Create a team (required before creating apps)
4. Create an application, selecting required scopes and redirect URIs
5. Receive Client ID and Client Secret

### API Authentication

- **Protocol:** OAuth 2.0 Authorization Code Flow
- **Authorization URL:** `https://api.prod.whoop.com/oauth/oauth2/auth`
- **Token URL:** `https://api.prod.whoop.com/oauth/oauth2/token`
- **Token Type:** Bearer tokens in Authorization header
- **Token Lifetime:** Short-lived (exact duration in `expires_in` response field)
- **Refresh Tokens:** Available when requesting the `offline` scope
- **Token Revocation:** Via `revokeUserOAuthAccess` endpoint

### Available Scopes

| Scope | Description |
|-------|-------------|
| `offline` | Enables refresh token issuance for persistent access |
| `read:profile` | Basic profile info (name, email) |
| `read:body_measurement` | Height, weight, max heart rate |
| `read:cycles` | Physiological cycle data with strain and heart rate metrics |
| `read:recovery` | Recovery scores, HRV, resting heart rate, SpO2, skin temp |
| `read:sleep` | Sleep stages, duration, respiratory rate, performance |
| `read:workout` | Workout data: strain, heart rate zones, calories, duration |

**Recommendation for PilatesHub:** Request all scopes to enable the full feature set:
```
offline read:profile read:body_measurement read:cycles read:recovery read:sleep read:workout
```

---

## Available Data Points for Pilates

### Recovery Data (via Cycle Endpoints)

| Field | Type | Relevance to Pilates |
|-------|------|---------------------|
| `recovery_score` | 0-100% | Class difficulty recommendations |
| `resting_heart_rate` | BPM | Baseline fitness tracking |
| `hrv_rmssd_milli` | Milliseconds | Readiness for intense sessions |
| `spo2_percentage` | Percentage | Overall health indicator (WHOOP 4.0+) |
| `skin_temp_celsius` | Celsius | Health monitoring (WHOOP 4.0+) |
| `user_calibrating` | Boolean | Flag for new users (data may be unreliable) |
| `score_state` | Enum | SCORED, PENDING_SCORE, UNSCORABLE |

### Workout Data

| Field | Type | Relevance to Pilates |
|-------|------|---------------------|
| `sport_name` | String | Filter for Pilates (sport_id: 43) |
| `strain` | 0-21 scale | Session intensity measurement |
| `average_heart_rate` | BPM | Effort during class |
| `max_heart_rate` | BPM | Peak effort moments |
| `kilojoule` | Energy | Calories burned estimation |
| `distance_meter` | Meters | Less relevant for Pilates |
| `zone_duration` (zones 0-5) | Milliseconds | Time in each HR zone |
| `start` / `end` | DateTime | Session timing |
| `score_state` | Enum | SCORED, PENDING_SCORE, UNSCORABLE |

**Heart Rate Zones (milliseconds in each):**
- Zone 0: Very Light
- Zone 1: Light
- Zone 2: Moderate
- Zone 3: Hard
- Zone 4: Very Hard
- Zone 5: Maximum

### Sleep Data

| Field | Type | Relevance to Pilates |
|-------|------|---------------------|
| `total_in_bed_time_milli` | ms | Sleep duration |
| `total_rem_sleep_time_milli` | ms | Sleep quality |
| `total_slow_wave_sleep_time_milli` | ms | Deep sleep / physical recovery |
| `total_light_sleep_time_milli` | ms | Light sleep duration |
| `total_awake_time_milli` | ms | Sleep disruption indicator |
| `sleep_cycle_count` | Integer | Sleep quality metric |
| `disturbance_count` | Integer | Restlessness indicator |
| `respiratory_rate` | Breaths/min | Breathing health |
| `sleep_performance_percentage` | Percentage | Overall sleep quality |
| `sleep_consistency_percentage` | Percentage | Schedule regularity |
| `sleep_efficiency_percentage` | Percentage | Time asleep vs in bed |
| `sleep_needed.baseline_milli` | ms | Baseline sleep need |
| `sleep_needed.need_from_sleep_debt_milli` | ms | Sleep debt factor |
| `sleep_needed.need_from_recent_strain_milli` | ms | Strain-driven need |
| `sleep_needed.need_from_recent_nap_milli` | ms | Nap adjustment |

### Body Measurements

| Field | Type | Relevance |
|-------|------|-----------|
| `height_meter` | Float | User profile |
| `weight_kilogram` | Float | Calorie calculations |
| `max_heart_rate` | BPM | Zone calculations |

### Important Limitations

- **No raw heart rate samples** -- Only aggregated metrics (avg, max, resting). Individual HR readings at 1-minute intervals are NOT available via the API.
- **No real-time streaming via API** -- Real-time HR is only available via BLE Heart Rate Broadcast (Bluetooth).
- **No sleep stage transition timestamps** -- Only total durations per stage, not when transitions occurred.
- **Recovery requires a sleep event** -- Recovery score is calculated upon waking; no mid-day recovery.

---

## How Other Apps Integrate with WHOOP

### Current WHOOP Integration Partners

| App | Integration Type | Data Used |
|-----|-----------------|-----------|
| **Strava** | API sync | Workout export (auto-sync activities) |
| **TrainingPeaks** | API sync | HRV, workout data for training load analysis |
| **Apple Health** | On-device sync | Bidirectional health data exchange |
| **Google Health Connect** | On-device sync | Android health data sharing |
| **Peloton** | BLE HR Broadcast | Real-time heart rate display during classes |
| **Cronometer** | API integration | Activity data for calorie/nutrition tracking |
| **pliability (ROMWOD)** | API integration | Strain/recovery for mobility recommendations |
| **Pivot** | API integration | Activity/health data for meal recommendations |
| **SensAI** | API integration | Recovery data for personalized workout plans |
| **Rewire Fitness** | API integration | Recovery/strain for training readiness |

### Integration Patterns Observed

1. **OAuth2 API Integration** (most common): Server-to-server data sync using WHOOP's REST API. This is the pattern for PilatesHub.
2. **BLE Heart Rate Broadcast**: Real-time HR streaming over Bluetooth to compatible devices/apps (e.g., Peloton bikes, Wahoo computers, Zwift).
3. **Apple Health / Health Connect Bridge**: WHOOP writes to Apple Health; other apps read from it. Indirect but requires no WHOOP API access.
4. **Strava as Middleware**: WHOOP syncs to Strava; other apps pull from Strava. Common workaround pattern.

---

## Technical Integration Details

### OAuth 2.0 Flow

```
┌─────────────┐     1. Auth Request      ┌──────────────────┐
│             │ ──────────────────────── │                  │
│  PilatesHub │     (redirect user)      │  WHOOP OAuth     │
│  Frontend   │                          │  Server          │
│             │ ◄────────────────────── │                  │
│             │     2. Auth Code          │                  │
└──────┬──────┘     (via redirect)       └──────────────────┘
       │
       │ 3. Send code to backend
       ▼
┌─────────────┐     4. Exchange Code     ┌──────────────────┐
│  PilatesHub │ ──────────────────────── │  WHOOP Token     │
│  Backend    │     for Tokens           │  Server          │
│             │ ◄────────────────────── │                  │
│             │     5. Access + Refresh  │                  │
└──────┬──────┘        Tokens            └──────────────────┘
       │
       │ 6. Store tokens securely
       ▼
┌─────────────┐     7. API Requests      ┌──────────────────┐
│  PilatesHub │ ──────────────────────── │  WHOOP API       │
│  Backend    │     (Bearer token)       │  v2 Endpoints    │
│             │ ◄────────────────────── │                  │
│             │     8. JSON Response     │                  │
└─────────────┘                          └──────────────────┘
```

### API Endpoints (v2)

| Endpoint | Method | Scope Required | Description |
|----------|--------|---------------|-------------|
| `/developer/v1/user/profile/basic` | GET | `read:profile` | User profile (name, email, user_id) |
| `/developer/v1/user/body_measurement` | GET | `read:body_measurement` | Height, weight, max HR |
| `/developer/v1/cycle` | GET | `read:cycles` | Physiological cycles with strain data |
| `/developer/v1/recovery` | GET | `read:recovery` | Recovery scores (via cycle) |
| `/developer/v1/activity/sleep` | GET | `read:sleep` | Sleep data with stages |
| `/developer/v1/activity/workout` | GET | `read:workout` | Workout data with strain and HR zones |

*Note: Endpoint paths use `/developer/v1/` in the URL despite being the "v2" API model. The "v2" refers to the data model (UUID-based IDs vs int64 IDs), not the URL path.*

### Rate Limits

| Limit | Value | Window |
|-------|-------|--------|
| Per-minute | 100 requests | 60 seconds |
| Per-day | 10,000 requests | 86,400 seconds (24 hours) |

**Response Headers:**
- `X-RateLimit-Limit`: Current limit values and windows
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Seconds until counter resets

**Exceeding Limits:** Returns `429 Too Many Requests`. Higher limits available upon request via [WHOOP's rate limit request form](https://whoopinc.typeform.com/to/XmzituEp).

### Webhooks

WHOOP supports server-to-server webhook notifications for data changes, eliminating the need for constant polling.

**Event Types:**

| Event | Trigger |
|-------|---------|
| `recovery.updated` | Recovery created or modified |
| `recovery.deleted` | Recovery removed |
| `workout.updated` | Workout created or modified |
| `workout.deleted` | Workout removed |
| `sleep.updated` | Sleep record created or modified |
| `sleep.deleted` | Sleep record removed |

**Webhook Payload Format:**
```json
{
  "user_id": 123456,
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "workout.updated",
  "trace_id": "f1e2d3c4-b5a6-7890-1234-567890abcdef"
}
```

**Signature Validation:**
- Header `X-WHOOP-Signature`: HMAC-SHA256 signature (base64-encoded)
- Header `X-WHOOP-Signature-Timestamp`: Milliseconds since epoch
- Validation: Prepend timestamp to raw body, compute HMAC-SHA256 with your secret key, base64-encode, compare

**Retry Policy:** 5 retries over approximately 1 hour for non-2XX responses or timeouts.

**Best Practices:**
- Return 2XX within 1 second
- Process asynchronously using a queue/worker pattern
- Implement reconciliation jobs to periodically sync full data via the API

---

## Integration Architecture Proposal

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PilatesHub Mobile App                  │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ WHOOP    │  │ Class        │  │ Recovery Dashboard    │ │
│  │ Connect  │  │ Booking      │  │ (scores, sleep,       │ │
│  │ Button   │  │ Engine       │  │  recommendations)     │ │
│  └────┬─────┘  └──────┬───────┘  └───────────┬───────────┘ │
│       │               │                      │             │
└───────┼───────────────┼──────────────────────┼─────────────┘
        │               │                      │
        ▼               ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    PilatesHub Backend API                    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ OAuth Service│  │ Webhook      │  │ Recommendation   │  │
│  │ (token mgmt, │  │ Handler      │  │ Engine           │  │
│  │  refresh)    │  │ (async queue)│  │ (recovery-based) │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│  ┌──────┴─────────────────┴────────────────────┴─────────┐  │
│  │              Wearable Integration Service              │  │
│  │  (WHOOP adapter | Apple Health | Garmin | Oura | ...)  │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │                               │
│  ┌──────────────────────────┴────────────────────────────┐  │
│  │                    Database                            │  │
│  │  users | tokens | workouts | recovery | sleep | scores │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
        │                 ▲
        │                 │
        ▼                 │
┌───────────────┐  ┌──────┴────────┐
│ WHOOP API     │  │ WHOOP Webhook │
│ (pull data)   │  │ (push events) │
└───────────────┘  └───────────────┘
```

### Key Architecture Decisions

1. **Adapter Pattern for Wearables:** Abstract the WHOOP integration behind a `WearableProvider` interface so we can add Apple Health, Garmin, Oura, etc. without changing business logic.

2. **Webhook-First, Poll as Backup:** Use WHOOP webhooks for near-real-time data updates. Run a daily reconciliation job that polls the API to catch any missed webhook events.

3. **Token Storage:** Encrypt access and refresh tokens at rest in the database. Use a background job to proactively refresh tokens before they expire.

4. **Async Processing:** Webhook payloads contain only IDs -- the actual data must be fetched via the API. Use a message queue (e.g., SQS, Redis, Bull) to process webhook events asynchronously.

5. **Rate Limit Awareness:** With 100 req/min and 10,000 req/day, implement request queuing and backoff. For 1,000 active WHOOP users syncing 3x daily, that is 3,000 requests/day -- well within limits. Scale request requires contacting WHOOP.

### Database Schema (Core Tables)

```sql
-- Wearable connections (supports multiple providers)
CREATE TABLE wearable_connections (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    provider VARCHAR(50) NOT NULL,        -- 'whoop', 'apple_health', 'garmin', etc.
    provider_user_id VARCHAR(255),
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP,
    scopes TEXT[],
    connected_at TIMESTAMP DEFAULT NOW(),
    last_synced_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Synced workout data (normalized across providers)
CREATE TABLE wearable_workouts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    provider VARCHAR(50) NOT NULL,
    provider_workout_id VARCHAR(255),
    sport_name VARCHAR(100),
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    strain_score DECIMAL(4,2),            -- WHOOP: 0-21
    avg_heart_rate INTEGER,
    max_heart_rate INTEGER,
    calories_burned DECIMAL(8,2),
    hr_zone_durations JSONB,              -- {zone_0: ms, zone_1: ms, ...}
    raw_payload JSONB,                    -- Full provider response for debugging
    pilateshub_class_id UUID REFERENCES classes(id),  -- Link to PilatesHub class
    created_at TIMESTAMP DEFAULT NOW()
);

-- Synced recovery data
CREATE TABLE wearable_recovery (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    provider VARCHAR(50) NOT NULL,
    recovery_score DECIMAL(5,2),          -- WHOOP: 0-100%
    resting_heart_rate DECIMAL(5,2),
    hrv_rmssd DECIMAL(8,4),
    spo2_percentage DECIMAL(5,2),
    skin_temp_celsius DECIMAL(5,2),
    recorded_at TIMESTAMP,
    raw_payload JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Synced sleep data
CREATE TABLE wearable_sleep (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    provider VARCHAR(50) NOT NULL,
    total_sleep_ms BIGINT,
    rem_sleep_ms BIGINT,
    deep_sleep_ms BIGINT,
    light_sleep_ms BIGINT,
    awake_ms BIGINT,
    sleep_performance DECIMAL(5,2),
    sleep_efficiency DECIMAL(5,2),
    respiratory_rate DECIMAL(5,2),
    disturbance_count INTEGER,
    recorded_at TIMESTAMP,
    raw_payload JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Feature Roadmap for PilatesHub + WHOOP

### Phase 1: Foundation (Weeks 1-4)

**1.1 WHOOP Account Linking**
- "Connect WHOOP" button in user settings
- OAuth 2.0 flow with all required scopes
- Token storage with automatic refresh
- Connection status indicator and disconnect option

**1.2 Basic Data Sync**
- Daily sync of recovery, sleep, and workout data
- Webhook handler for real-time updates
- Data displayed on user profile/dashboard

**1.3 Workout Auto-Detection**
- When WHOOP detects a Pilates workout (sport_id: 43), automatically match it to a PilatesHub class booking
- Matching logic: compare WHOOP workout start/end times with class schedule times
- If no class match, prompt user: "We detected a Pilates session -- was this at PilatesHub?"

### Phase 2: Smart Recommendations (Weeks 5-8)

**2.1 Recovery-Based Class Recommendations**
```
Recovery 0-33% (Red):
  "Your body needs rest. We recommend: Gentle Mat Flow, Restorative Pilates, or Guided Stretching."

Recovery 34-66% (Yellow):
  "Moderate recovery. Great for: Beginner Reformer, Mat Pilates Fundamentals, or Barre Basics."

Recovery 67-100% (Green):
  "You're fully recovered! Perfect for: Advanced Reformer, Power Pilates, HIIT Pilates, or Cardio Barre."
```

**2.2 Sleep-Informed Scheduling**
- Show sleep quality alongside class booking interface
- "You slept 5.2 hours (below your 7.5h baseline) -- consider a gentler class today"
- Push notification in the morning with personalized class suggestion based on sleep data

**2.3 HRV Trend Analysis**
- Weekly/monthly HRV trend charts
- Correlation view: "Your HRV improved 12% since you started attending 3+ classes/week"
- Goal setting based on HRV improvements

### Phase 3: During-Class Experience (Weeks 9-12)

**3.1 Post-Workout Strain Summary**
- After a class completes, show WHOOP-sourced strain summary
- Heart rate zone breakdown visualization
- Calories burned comparison vs class average
- "Your strain for today's Advanced Reformer: 12.4 (above class avg of 10.8)"

**3.2 Coach Dashboard**
- Class average strain score per session
- Heat map of strain distribution across class participants
- Identify students who may be overtraining or underperforming
- Aggregate recovery scores to inform class planning

**3.3 Personal Progress Tracking**
- Strain trend by class type over time
- "Your average strain in Reformer classes increased from 8.2 to 11.5 over 3 months"
- Recovery response tracking: how quickly users recover between classes

### Phase 4: Social and Gamification (Weeks 13-16)

**4.1 Community Leaderboard**
- Weekly strain leaderboard (opt-in)
- Leaderboard categories: Total Strain, Most Classes, Best Recovery Consistency
- Class-specific leaderboards

**4.2 Challenges**
- "Highest Total Strain This Week" challenge
- "Most Consistent Recovery" (stay in green zone all week)
- "Sleep Champion" (best sleep performance average)
- Studio-wide challenges with prizes

**4.3 Social Sharing**
- Shareable post-workout cards with WHOOP stats
- "I just crushed a 14.2 strain in Advanced Reformer at PilatesHub!"
- Integration with Instagram Stories / social feeds

### Phase 5: Advanced Analytics (Weeks 17+)

**5.1 Predictive Insights**
- ML model: predict optimal class type based on recovery/sleep/strain history
- Injury risk detection: flag users with declining HRV + high strain patterns
- Optimal scheduling: suggest best days/times for intense vs gentle classes

**5.2 Breathing and Respiratory Insights**
- Respiratory rate trends from sleep data
- Correlation between Pilates breathing exercises and respiratory rate improvements
- "Since you started Pilates, your average respiratory rate dropped from 16.5 to 14.8 breaths/min"

**5.3 Multi-Metric Wellness Score**
- PilatesHub proprietary score combining: WHOOP recovery, sleep quality, class attendance, strain consistency
- "Your PilatesHub Wellness Score: 87/100"

---

## Other Wearables to Consider

### Comparison Matrix

| Wearable | API Type | Auth | Key Data | Ease of Integration | Notes |
|----------|----------|------|----------|-------------------|-------|
| **Apple Watch / HealthKit** | On-device SDK | iOS permissions | HR, workouts, HRV, sleep, calories | High | Most users; iOS only; no server API |
| **WHOOP** | REST API + Webhooks | OAuth 2.0 | Recovery, strain, HRV, sleep, HR zones | High | Best recovery data; subscription required |
| **Oura Ring** | REST API (Cloud) | OAuth 2.0 | Sleep, readiness, HRV, activity, temperature | High | Best sleep data; membership required for API |
| **Garmin Connect** | REST API | OAuth 1.0a | HR, GPS, workouts, sleep, stress, body battery | Medium | Large user base; requires application approval |
| **Fitbit** | REST API | OAuth 2.0 | HR, sleep, activity, SpO2 | Medium | Huge user base; consumer-grade data |
| **Samsung Health** | On-device SDK (Android) | Android permissions | HR, workouts, sleep, SpO2 | Medium | Android only; SDK recently updated |
| **Google Fit / Health Connect** | On-device SDK (Android) | Android permissions | Aggregated data from multiple sources | Medium | Unified Android health layer |

### Integration Priority Recommendation

1. **Apple HealthKit (Phase 1)** -- Largest potential user base among Pilates demographics. On-device SDK means no server costs for basic integration. Covers Apple Watch, and indirectly any device that writes to Apple Health.

2. **WHOOP (Phase 1)** -- Premium users who are highly engaged with fitness data. Best recovery/strain data for our recommendation engine. Clear REST API with webhooks.

3. **Oura Ring (Phase 2)** -- Strong overlap with wellness-focused Pilates audience. Excellent sleep and readiness data. Similar OAuth 2.0 pattern to WHOOP.

4. **Garmin Connect (Phase 2)** -- Large user base but more endurance/outdoor focused. Requires formal application approval. OAuth 1.0a is slightly more complex.

5. **Fitbit (Phase 3)** -- Broad consumer base. Google acquisition may shift API strategy. Good basic data.

6. **Samsung Health / Health Connect (Phase 3)** -- Android equivalent of HealthKit strategy. Covers Samsung Galaxy Watch users.

### Unified Wearable APIs (Middleware Option)

Rather than building individual integrations, consider using a unified wearable API service:

| Service | Supported Devices | Pricing Model | Notes |
|---------|------------------|---------------|-------|
| **Terra API** | 500+ devices (WHOOP, Garmin, Fitbit, Oura, Apple Health, etc.) | Per-user monthly fee (~$5k-$20k/mo at scale) | Fastest time-to-market |
| **Thryve** | WHOOP, Garmin, Fitbit, Oura, Withings, Samsung | Per-user pricing | European-based, GDPR-focused |
| **Validic** | Wide device support | Enterprise pricing | Clinical-grade, higher cost |
| **ROOK** | Multiple wearables | Developer-friendly pricing | Newer entrant, mobile SDK focus |
| **Open Wearables** | Open source | Free (self-hosted) | Community-maintained, less support |

**Recommendation:** Start with direct WHOOP + Apple HealthKit integrations (best data quality, no middleware cost). Evaluate Terra API or similar when expanding to 4+ wearable providers, as the development time savings (weeks vs months) justify the per-user cost.

---

## Appendix: Code Examples

### A. OAuth 2.0 Flow -- Node.js with Passport.js

**Installation:**
```bash
npm install passport passport-oauth2
npm install @types/passport @types/passport-oauth2  # TypeScript
```

**Environment Variables (.env):**
```env
WHOOP_API_HOSTNAME=https://api.prod.whoop.com
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
CALLBACK_URL=https://app.pilateshub.com/auth/whoop/callback
```

**OAuth Strategy Configuration:**
```javascript
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');

const whoopOAuthConfig = {
    authorizationURL: `${process.env.WHOOP_API_HOSTNAME}/oauth/oauth2/auth`,
    tokenURL: `${process.env.WHOOP_API_HOSTNAME}/oauth/oauth2/token`,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    state: true,
    scope: [
        'offline',
        'read:profile',
        'read:body_measurement',
        'read:cycles',
        'read:recovery',
        'read:sleep',
        'read:workout',
    ],
};

// Handler executed after successful OAuth
const getUser = async (accessToken, refreshToken, { expires_in }, profile, done) => {
    const { first_name, last_name, user_id } = profile;

    const createUserParams = {
        accessToken,
        expiresAt: Date.now() + expires_in * 1000,
        firstName: first_name,
        lastName: last_name,
        refreshToken,
        userId: user_id,
    };

    // Upsert: create or update the wearable connection
    const user = await prisma.wearableConnection.upsert({
        where: { providerUserId: user_id },
        create: {
            ...createUserParams,
            provider: 'whoop',
        },
        update: createUserParams,
    });

    done(null, user);
};

// Fetch user profile from WHOOP API
const fetchProfile = async (accessToken, done) => {
    const profileResponse = await fetch(
        `${process.env.WHOOP_API_HOSTNAME}/developer/v1/user/profile/basic`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );
    const profile = await profileResponse.json();
    done(null, profile);
};

// Register the strategy
const whoopStrategy = new OAuth2Strategy(whoopOAuthConfig, getUser);
whoopStrategy.userProfile = fetchProfile;
passport.use('whoop', whoopStrategy);
```

**Express Routes:**
```javascript
const express = require('express');
const router = express.Router();

// Initiate WHOOP OAuth flow
router.get('/auth/whoop', passport.authenticate('whoop'));

// OAuth callback
router.get('/auth/whoop/callback',
    passport.authenticate('whoop', { failureRedirect: '/settings/wearables?error=auth_failed' }),
    (req, res) => {
        res.redirect('/settings/wearables?connected=whoop');
    }
);

// Disconnect WHOOP
router.post('/auth/whoop/disconnect', async (req, res) => {
    await prisma.wearableConnection.update({
        where: { userId_provider: { userId: req.user.id, provider: 'whoop' } },
        data: { isActive: false },
    });
    res.redirect('/settings/wearables');
});
```

### B. Token Refresh Logic

```javascript
async function refreshWhoopToken(connection) {
    const response = await fetch(
        `${process.env.WHOOP_API_HOSTNAME}/oauth/oauth2/token`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: connection.refreshToken,
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
    }

    const tokens = await response.json();

    // Update stored tokens
    await prisma.wearableConnection.update({
        where: { id: connection.id },
        data: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        },
    });

    return tokens.access_token;
}

// Middleware to ensure valid token before API calls
async function ensureValidToken(connection) {
    const bufferMs = 5 * 60 * 1000; // Refresh 5 minutes before expiry
    if (connection.tokenExpiresAt.getTime() - Date.now() < bufferMs) {
        return await refreshWhoopToken(connection);
    }
    return connection.accessToken;
}
```

### C. Fetching Recovery Data

```javascript
async function fetchRecovery(connection, startDate, endDate) {
    const token = await ensureValidToken(connection);

    const params = new URLSearchParams({
        start: startDate,  // ISO 8601 format
        end: endDate,
    });

    const response = await fetch(
        `${process.env.WHOOP_API_HOSTNAME}/developer/v1/recovery?${params}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status === 429) {
        const retryAfter = response.headers.get('X-RateLimit-Reset');
        throw new Error(`Rate limited. Retry after ${retryAfter} seconds.`);
    }

    const data = await response.json();

    return data.records.map(record => ({
        recoveryScore: record.score?.recovery_score,
        restingHeartRate: record.score?.resting_heart_rate,
        hrvRmssd: record.score?.hrv_rmssd_milli,
        spo2: record.score?.spo2_percentage,
        skinTemp: record.score?.skin_temp_celsius,
        scoreState: record.score_state,
        createdAt: record.created_at,
    }));
}
```

### D. Webhook Handler

```javascript
const crypto = require('crypto');

// Webhook signature validation
function validateWebhookSignature(rawBody, signature, timestamp, secret) {
    const payload = timestamp + rawBody;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('base64');
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

// Express webhook endpoint
router.post('/webhooks/whoop', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['x-whoop-signature'];
    const timestamp = req.headers['x-whoop-signature-timestamp'];
    const rawBody = req.body.toString();

    // Validate signature
    if (!validateWebhookSignature(rawBody, signature, timestamp, process.env.WHOOP_WEBHOOK_SECRET)) {
        return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(rawBody);

    // Respond immediately, process async
    res.status(200).send('OK');

    // Enqueue for async processing
    await messageQueue.add('whoop-webhook', {
        userId: event.user_id,
        resourceId: event.id,
        eventType: event.type,
        traceId: event.trace_id,
    });
});

// Async worker to process webhook events
async function processWhoopWebhook(job) {
    const { userId, resourceId, eventType } = job.data;
    const connection = await prisma.wearableConnection.findFirst({
        where: { providerUserId: String(userId), provider: 'whoop', isActive: true },
    });

    if (!connection) return;

    switch (eventType) {
        case 'workout.updated':
            await syncWorkout(connection, resourceId);
            break;
        case 'recovery.updated':
            await syncRecovery(connection, resourceId);
            break;
        case 'sleep.updated':
            await syncSleep(connection, resourceId);
            break;
        case 'workout.deleted':
        case 'recovery.deleted':
        case 'sleep.deleted':
            await handleDeletion(eventType, resourceId);
            break;
    }
}
```

### E. Recovery-Based Class Recommendation Engine

```javascript
function getClassRecommendation(recoveryScore, sleepPerformance, recentStrain) {
    const recommendations = {
        classTypes: [],
        message: '',
        recoveryZone: '',
    };

    // Determine recovery zone
    if (recoveryScore >= 67) {
        recommendations.recoveryZone = 'green';
        recommendations.classTypes = [
            'Advanced Reformer',
            'Power Pilates',
            'HIIT Pilates',
            'Cardio Barre',
            'Athletic Reformer',
        ];
        recommendations.message =
            `Recovery at ${recoveryScore}% -- you're primed for a challenge! ` +
            `Go all out in an advanced class today.`;
    } else if (recoveryScore >= 34) {
        recommendations.recoveryZone = 'yellow';
        recommendations.classTypes = [
            'Beginner Reformer',
            'Mat Pilates Fundamentals',
            'Barre Basics',
            'Core & Stretch',
            'Classical Pilates',
        ];
        recommendations.message =
            `Recovery at ${recoveryScore}% -- moderate effort recommended. ` +
            `Focus on form and control today.`;
    } else {
        recommendations.recoveryZone = 'red';
        recommendations.classTypes = [
            'Gentle Mat Flow',
            'Restorative Pilates',
            'Guided Stretching',
            'Meditation & Breathwork',
            'Foam Rolling & Recovery',
        ];
        recommendations.message =
            `Recovery at ${recoveryScore}% -- your body needs rest. ` +
            `A gentle session will aid recovery.`;
    }

    // Adjust for poor sleep
    if (sleepPerformance && sleepPerformance < 70) {
        recommendations.message +=
            ` (Note: Sleep quality was ${sleepPerformance}% -- ` +
            `consider downgrading intensity.)`;
    }

    // Adjust for high recent strain
    if (recentStrain && recentStrain > 15) {
        recommendations.message +=
            ` You've been pushing hard lately (strain: ${recentStrain.toFixed(1)}) -- ` +
            `balance is key.`;
    }

    return recommendations;
}
```

---

## Sources

### WHOOP Developer Documentation
- [WHOOP Developer Platform](https://developer.whoop.com/)
- [WHOOP API Docs](https://developer.whoop.com/api/)
- [OAuth 2.0 Documentation](https://developer.whoop.com/docs/developing/oauth/)
- [Webhooks Documentation](https://developer.whoop.com/docs/developing/webhooks/)
- [Rate Limiting](https://developer.whoop.com/docs/developing/rate-limiting/)
- [Getting Started Guide](https://developer.whoop.com/docs/developing/getting-started/)
- [Recovery Data Model](https://developer.whoop.com/docs/developing/user-data/recovery/)
- [Workout Data Model](https://developer.whoop.com/docs/developing/user-data/workout/)
- [Authenticating with Passport.js](https://developer.whoop.com/docs/tutorials/access-token-passport/)
- [Token Refresh Tutorial](https://developer.whoop.com/docs/tutorials/refresh-token-postman/)
- [API Changelog](https://developer.whoop.com/docs/api-changelog/)
- [v1 to v2 Migration Guide](https://developer.whoop.com/docs/developing/v1-v2-migration/)

### WHOOP Support & Integrations
- [WHOOP App Integrations](https://support.whoop.com/s/topic/0TO6Q000000gQbZWAU/app-integrations)
- [WHOOP Developer Platform Support](https://support.whoop.com/s/article/The-WHOOP-Developer-Platform)
- [Strava Integration](https://support.whoop.com/s/article/Strava-Integration)
- [Heart Rate Broadcast](https://support.whoop.com/s/article/Heart-Rate-Broadcast)
- [List of WHOOP Activities](https://support.whoop.com/s/article/List-of-WHOOP-Activities)

### Third-Party Integration Guides
- [Terra API - WHOOP Integration Series Part 2: Data Available](https://tryterra.co/blog/whoop-integration-series-part-2-data-available-from-the-api-ec4337a9455b)
- [Terra API - Unified Wearable API](https://tryterra.co/)
- [Thryve - WHOOP Integration](https://www.thryve.health/features/connections/whoop-integration)
- [Spike API - WHOOP Integration](https://www.spikeapi.com/blog/whoop-is-now-available-via-the-spike-api)
- [WHOOP MCP Server (GitHub)](https://github.com/nissand/whoop-mcp-server-claude)

### Other Wearable Platforms
- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [Apple Health & Fitness Apps](https://developer.apple.com/health-fitness/)
- [Oura API Documentation (v2)](https://cloud.ouraring.com/v2/docs)
- [Garmin Connect Developer Program](https://developer.garmin.com/gc-developer-program/)
- [Samsung Health SDK](https://developer.samsung.com/health)
- [Google Health Connect](https://developer.android.com/health-and-fitness/health-services/health-platform)

### Comparative Analysis
- [Which Wearables Are Developers Using in Health Apps](https://www.themomentum.ai/blog/which-wearables-are-developers-using-in-health-apps-and-why)
- [Best Wearable APIs for Developers - ROOK](https://www.tryrook.io/blog/best-wearable-apis-for-developers)
- [Wearable API Integration Guide - Thryve](https://www.thryve.health/blog/wearable-api-integration-guide-for-developers)
- [7 Best HRV Fitness Apps for Oura/WHOOP](https://www.sensai.fit/blog/7-best-hrv-fitness-apps-oura-whoop-2025)
- [Wearable-Integrated Fitness Apps: What Works in 2026](https://vocal.media/01/wearable-integrated-fitness-apps-what-works-in-2026)
