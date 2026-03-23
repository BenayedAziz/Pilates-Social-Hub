/**
 * Deep Pilates Studio Scraper — Google Places Text Search (New) API
 *
 * Massive worldwide scrape with fine-grained sub-zones for mega cities
 * and comprehensive coverage of medium/small cities globally.
 *
 * Budget: $96.58 remaining ($100 total - $3.42 already spent)
 * Each Text Search request costs ~$0.032 (Essentials tier).
 * That gives us ~3,000 requests before hitting budget.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... tsx src/scrape-deep.ts
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@workspace/db/schema";

const { Pool } = pg;

const API_KEY = "AIzaSyDIpbw6XKNXlwYnbsCFEXvZP34KFQs5kC8";

interface Zone {
  city: string;
  country: string;
  lat: number;
  lng: number;
  radius: number;
}

// --------------- Cost tracking ---------------
const COST_PER_REQUEST = 0.032;
const MAX_BUDGET = 96; // $96.58 remaining, use $96 with buffer
let totalCost = 0;
let totalRequests = 0;

// =====================================================================
// ZONE DEFINITIONS — ~600 zones covering the globe
// =====================================================================

const DEEP_ZONES: Zone[] = [
  // =============================================================
  // MEGA CITY DEEP DIVES (15-20 sub-zones each)
  // =============================================================

  // --- NEW YORK CITY (17 zones) ---
  { city: "NYC FiDi", country: "USA", lat: 40.7075, lng: -74.0089, radius: 3000 },
  { city: "NYC Tribeca", country: "USA", lat: 40.7163, lng: -74.0086, radius: 3000 },
  { city: "NYC SoHo", country: "USA", lat: 40.7233, lng: -73.9985, radius: 3000 },
  { city: "NYC West Village", country: "USA", lat: 40.7336, lng: -74.0027, radius: 3000 },
  { city: "NYC Chelsea", country: "USA", lat: 40.7465, lng: -74.0014, radius: 3000 },
  { city: "NYC Midtown East", country: "USA", lat: 40.7549, lng: -73.9725, radius: 3000 },
  { city: "NYC Midtown West", country: "USA", lat: 40.7590, lng: -73.9937, radius: 3000 },
  { city: "NYC Upper West Side", country: "USA", lat: 40.7870, lng: -73.9754, radius: 3000 },
  { city: "NYC Upper East Side", country: "USA", lat: 40.7736, lng: -73.9566, radius: 3000 },
  { city: "NYC Harlem", country: "USA", lat: 40.8116, lng: -73.9465, radius: 4000 },
  { city: "NYC Williamsburg", country: "USA", lat: 40.7081, lng: -73.9571, radius: 3000 },
  { city: "NYC Park Slope", country: "USA", lat: 40.6710, lng: -73.9812, radius: 3000 },
  { city: "NYC DUMBO", country: "USA", lat: 40.7033, lng: -73.9881, radius: 3000 },
  { city: "NYC Brooklyn Heights", country: "USA", lat: 40.6960, lng: -73.9936, radius: 3000 },
  { city: "NYC Bushwick", country: "USA", lat: 40.6944, lng: -73.9213, radius: 4000 },
  { city: "NYC Astoria", country: "USA", lat: 40.7720, lng: -73.9301, radius: 4000 },
  { city: "NYC Long Island City", country: "USA", lat: 40.7447, lng: -73.9485, radius: 3000 },

  // --- LOS ANGELES (15 zones) ---
  { city: "LA Santa Monica", country: "USA", lat: 34.0195, lng: -118.4912, radius: 4000 },
  { city: "LA Venice", country: "USA", lat: 33.9850, lng: -118.4695, radius: 3000 },
  { city: "LA Brentwood", country: "USA", lat: 34.0594, lng: -118.4755, radius: 4000 },
  { city: "LA Beverly Hills", country: "USA", lat: 34.0736, lng: -118.4004, radius: 4000 },
  { city: "LA West Hollywood", country: "USA", lat: 34.0900, lng: -118.3617, radius: 3000 },
  { city: "LA Silver Lake", country: "USA", lat: 34.0869, lng: -118.2702, radius: 3000 },
  { city: "LA Echo Park", country: "USA", lat: 34.0782, lng: -118.2606, radius: 3000 },
  { city: "LA Pasadena", country: "USA", lat: 34.1478, lng: -118.1445, radius: 5000 },
  { city: "LA Manhattan Beach", country: "USA", lat: 33.8847, lng: -118.4109, radius: 4000 },
  { city: "LA Hermosa Beach", country: "USA", lat: 33.8622, lng: -118.3995, radius: 3000 },
  { city: "LA Culver City", country: "USA", lat: 34.0211, lng: -118.3965, radius: 4000 },
  { city: "LA Studio City", country: "USA", lat: 34.1386, lng: -118.3966, radius: 4000 },
  { city: "LA Encino", country: "USA", lat: 34.1592, lng: -118.5017, radius: 4000 },
  { city: "LA Glendale", country: "USA", lat: 34.1425, lng: -118.2551, radius: 5000 },
  { city: "LA Burbank", country: "USA", lat: 34.1808, lng: -118.3090, radius: 4000 },

  // --- LONDON (15 zones) ---
  { city: "London Chelsea", country: "UK", lat: 51.4875, lng: -0.1687, radius: 3000 },
  { city: "London Kensington", country: "UK", lat: 51.4990, lng: -0.1889, radius: 3000 },
  { city: "London Notting Hill", country: "UK", lat: 51.5170, lng: -0.1996, radius: 3000 },
  { city: "London Mayfair", country: "UK", lat: 51.5099, lng: -0.1470, radius: 3000 },
  { city: "London Soho", country: "UK", lat: 51.5137, lng: -0.1337, radius: 3000 },
  { city: "London Shoreditch", country: "UK", lat: 51.5264, lng: -0.0799, radius: 3000 },
  { city: "London Islington", country: "UK", lat: 51.5362, lng: -0.1033, radius: 3000 },
  { city: "London Fulham", country: "UK", lat: 51.4730, lng: -0.2020, radius: 3000 },
  { city: "London Battersea", country: "UK", lat: 51.4750, lng: -0.1503, radius: 3000 },
  { city: "London Wimbledon", country: "UK", lat: 51.4214, lng: -0.2064, radius: 4000 },
  { city: "London Richmond", country: "UK", lat: 51.4613, lng: -0.3037, radius: 4000 },
  { city: "London Hampstead", country: "UK", lat: 51.5564, lng: -0.1780, radius: 3000 },
  { city: "London Clapham", country: "UK", lat: 51.4620, lng: -0.1380, radius: 3000 },
  { city: "London Putney", country: "UK", lat: 51.4611, lng: -0.2164, radius: 3000 },
  { city: "London Canary Wharf", country: "UK", lat: 51.5054, lng: -0.0235, radius: 4000 },

  // --- PARIS (15 zones) ---
  { city: "Paris 1er-4e", country: "France", lat: 48.8602, lng: 2.3477, radius: 3000 },
  { city: "Paris 5e-6e", country: "France", lat: 48.8495, lng: 2.3400, radius: 3000 },
  { city: "Paris 7e", country: "France", lat: 48.8566, lng: 2.3150, radius: 3000 },
  { city: "Paris 8e", country: "France", lat: 48.8744, lng: 2.3106, radius: 3000 },
  { city: "Paris 9e-10e", country: "France", lat: 48.8761, lng: 2.3499, radius: 3000 },
  { city: "Paris 11e", country: "France", lat: 48.8596, lng: 2.3784, radius: 3000 },
  { city: "Paris 12e", country: "France", lat: 48.8413, lng: 2.3876, radius: 3000 },
  { city: "Paris 13e-14e", country: "France", lat: 48.8311, lng: 2.3558, radius: 3000 },
  { city: "Paris 15e", country: "France", lat: 48.8421, lng: 2.2989, radius: 3000 },
  { city: "Paris 16e", country: "France", lat: 48.8637, lng: 2.2769, radius: 3000 },
  { city: "Paris 17e", country: "France", lat: 48.8836, lng: 2.3130, radius: 3000 },
  { city: "Paris 18e", country: "France", lat: 48.8925, lng: 2.3444, radius: 3000 },
  { city: "Paris 19e-20e", country: "France", lat: 48.8742, lng: 2.3922, radius: 3000 },
  { city: "Paris La Défense", country: "France", lat: 48.8920, lng: 2.2360, radius: 4000 },
  { city: "Paris Boulogne", country: "France", lat: 48.8397, lng: 2.2400, radius: 4000 },

  // --- SYDNEY (10 zones) ---
  { city: "Sydney Bondi", country: "Australia", lat: -33.8915, lng: 151.2767, radius: 3000 },
  { city: "Sydney Surry Hills", country: "Australia", lat: -33.8835, lng: 151.2108, radius: 3000 },
  { city: "Sydney Paddington", country: "Australia", lat: -33.8843, lng: 151.2264, radius: 3000 },
  { city: "Sydney Manly", country: "Australia", lat: -33.7969, lng: 151.2876, radius: 4000 },
  { city: "Sydney Mosman", country: "Australia", lat: -33.8282, lng: 151.2436, radius: 3000 },
  { city: "Sydney Neutral Bay", country: "Australia", lat: -33.8324, lng: 151.2185, radius: 3000 },
  { city: "Sydney Coogee", country: "Australia", lat: -33.9196, lng: 151.2544, radius: 3000 },
  { city: "Sydney Cronulla", country: "Australia", lat: -34.0587, lng: 151.1515, radius: 4000 },
  { city: "Sydney North Sydney", country: "Australia", lat: -33.8388, lng: 151.2070, radius: 3000 },
  { city: "Sydney Parramatta", country: "Australia", lat: -33.8151, lng: 151.0011, radius: 5000 },

  // --- TOKYO (8 zones) ---
  { city: "Tokyo Roppongi", country: "Japan", lat: 35.6627, lng: 139.7307, radius: 3000 },
  { city: "Tokyo Ginza", country: "Japan", lat: 35.6717, lng: 139.7649, radius: 3000 },
  { city: "Tokyo Shinjuku", country: "Japan", lat: 35.6938, lng: 139.7034, radius: 4000 },
  { city: "Tokyo Ebisu", country: "Japan", lat: 35.6468, lng: 139.7100, radius: 3000 },
  { city: "Tokyo Daikanyama", country: "Japan", lat: 35.6487, lng: 139.7019, radius: 3000 },
  { city: "Tokyo Azabu", country: "Japan", lat: 35.6539, lng: 139.7370, radius: 3000 },
  { city: "Tokyo Omotesando", country: "Japan", lat: 35.6651, lng: 139.7122, radius: 3000 },
  { city: "Tokyo Meguro", country: "Japan", lat: 35.6339, lng: 139.7157, radius: 4000 },

  // --- BERLIN (8 zones) ---
  { city: "Berlin Charlottenburg", country: "Germany", lat: 52.5070, lng: 13.3040, radius: 4000 },
  { city: "Berlin Kreuzberg", country: "Germany", lat: 52.4894, lng: 13.4028, radius: 4000 },
  { city: "Berlin Schöneberg", country: "Germany", lat: 52.4830, lng: 13.3530, radius: 4000 },
  { city: "Berlin Friedrichshain", country: "Germany", lat: 52.5150, lng: 13.4540, radius: 4000 },
  { city: "Berlin Neukölln", country: "Germany", lat: 52.4810, lng: 13.4350, radius: 4000 },
  { city: "Berlin Steglitz", country: "Germany", lat: 52.4570, lng: 13.3280, radius: 4000 },
  { city: "Berlin Wilmersdorf", country: "Germany", lat: 52.4870, lng: 13.3190, radius: 4000 },
  { city: "Berlin Tempelhof", country: "Germany", lat: 52.4680, lng: 13.3880, radius: 4000 },

  // --- MADRID (8 zones) ---
  { city: "Madrid Salamanca", country: "Spain", lat: 40.4300, lng: -3.6780, radius: 3000 },
  { city: "Madrid Chamberí", country: "Spain", lat: 40.4350, lng: -3.7020, radius: 3000 },
  { city: "Madrid Retiro", country: "Spain", lat: 40.4153, lng: -3.6844, radius: 3000 },
  { city: "Madrid Chamartín", country: "Spain", lat: 40.4620, lng: -3.6770, radius: 4000 },
  { city: "Madrid Moncloa", country: "Spain", lat: 40.4380, lng: -3.7200, radius: 4000 },
  { city: "Madrid Arganzuela", country: "Spain", lat: 40.3980, lng: -3.6970, radius: 3000 },
  { city: "Madrid Latina", country: "Spain", lat: 40.4030, lng: -3.7360, radius: 4000 },
  { city: "Madrid Tetuán", country: "Spain", lat: 40.4600, lng: -3.6970, radius: 3000 },

  // --- BARCELONA (8 zones) ---
  { city: "Barcelona Gràcia", country: "Spain", lat: 41.4035, lng: 2.1565, radius: 3000 },
  { city: "Barcelona Sant Gervasi", country: "Spain", lat: 41.4050, lng: 2.1350, radius: 3000 },
  { city: "Barcelona Sarrià", country: "Spain", lat: 41.3975, lng: 2.1175, radius: 3000 },
  { city: "Barcelona Poblenou", country: "Spain", lat: 41.3950, lng: 2.2000, radius: 3000 },
  { city: "Barcelona Born", country: "Spain", lat: 41.3850, lng: 2.1825, radius: 3000 },
  { city: "Barcelona Les Corts", country: "Spain", lat: 41.3875, lng: 2.1310, radius: 3000 },
  { city: "Barcelona Pedralbes", country: "Spain", lat: 41.3890, lng: 2.1100, radius: 3000 },
  { city: "Barcelona Diagonal", country: "Spain", lat: 41.3944, lng: 2.1600, radius: 3000 },

  // --- MILANO (6 zones) ---
  { city: "Milano Brera", country: "Italy", lat: 45.4725, lng: 9.1856, radius: 3000 },
  { city: "Milano Porta Venezia", country: "Italy", lat: 45.4754, lng: 9.2050, radius: 3000 },
  { city: "Milano Navigli", country: "Italy", lat: 45.4500, lng: 9.1750, radius: 3000 },
  { city: "Milano Isola", country: "Italy", lat: 45.4870, lng: 9.1870, radius: 3000 },
  { city: "Milano Porta Romana", country: "Italy", lat: 45.4510, lng: 9.1990, radius: 3000 },
  { city: "Milano City Life", country: "Italy", lat: 45.4760, lng: 9.1570, radius: 3000 },

  // =============================================================
  // NEW USA CITIES (1-2 zones each)
  // =============================================================
  { city: "Atlanta", country: "USA", lat: 33.7490, lng: -84.3880, radius: 10000 },
  { city: "Dallas", country: "USA", lat: 32.7767, lng: -96.7970, radius: 10000 },
  { city: "Houston", country: "USA", lat: 29.7604, lng: -95.3698, radius: 10000 },
  { city: "Phoenix", country: "USA", lat: 33.4484, lng: -112.0740, radius: 10000 },
  { city: "Philadelphia", country: "USA", lat: 39.9526, lng: -75.1652, radius: 8000 },
  { city: "Minneapolis", country: "USA", lat: 44.9778, lng: -93.2650, radius: 8000 },
  { city: "Charlotte", country: "USA", lat: 35.2271, lng: -80.8431, radius: 10000 },
  { city: "Tampa", country: "USA", lat: 27.9506, lng: -82.4572, radius: 10000 },
  { city: "Orlando", country: "USA", lat: 28.5383, lng: -81.3792, radius: 10000 },
  { city: "Jacksonville", country: "USA", lat: 30.3322, lng: -81.6557, radius: 12000 },
  { city: "Raleigh", country: "USA", lat: 35.7796, lng: -78.6382, radius: 10000 },
  { city: "Salt Lake City", country: "USA", lat: 40.7608, lng: -111.8910, radius: 10000 },
  { city: "Indianapolis", country: "USA", lat: 39.7684, lng: -86.1581, radius: 10000 },
  { city: "Columbus OH", country: "USA", lat: 39.9612, lng: -82.9988, radius: 10000 },
  { city: "Kansas City", country: "USA", lat: 39.0997, lng: -94.5786, radius: 10000 },
  { city: "St Louis", country: "USA", lat: 38.6270, lng: -90.1994, radius: 10000 },
  { city: "Pittsburgh", country: "USA", lat: 40.4406, lng: -79.9959, radius: 8000 },
  { city: "Baltimore", country: "USA", lat: 39.2904, lng: -76.6122, radius: 8000 },
  { city: "Sacramento", country: "USA", lat: 38.5816, lng: -121.4944, radius: 10000 },
  { city: "Las Vegas", country: "USA", lat: 36.1699, lng: -115.1398, radius: 12000 },
  { city: "Honolulu", country: "USA", lat: 21.3069, lng: -157.8583, radius: 8000 },
  { city: "Aspen", country: "USA", lat: 39.1911, lng: -106.8175, radius: 5000 },
  { city: "Palm Beach", country: "USA", lat: 26.7056, lng: -80.0364, radius: 8000 },
  { city: "Hamptons", country: "USA", lat: 40.9632, lng: -72.1845, radius: 10000 },
  { city: "Napa Valley", country: "USA", lat: 38.2975, lng: -122.2869, radius: 10000 },
  { city: "Santa Barbara", country: "USA", lat: 34.4208, lng: -119.6982, radius: 8000 },
  { city: "Sarasota", country: "USA", lat: 27.3364, lng: -82.5307, radius: 8000 },
  { city: "Charleston", country: "USA", lat: 32.7765, lng: -79.9311, radius: 8000 },
  { city: "Savannah", country: "USA", lat: 32.0809, lng: -81.0912, radius: 8000 },
  { city: "Asheville", country: "USA", lat: 35.5951, lng: -82.5515, radius: 8000 },
  { city: "Park City", country: "USA", lat: 40.6461, lng: -111.4980, radius: 5000 },
  { city: "Telluride", country: "USA", lat: 37.9375, lng: -107.8123, radius: 5000 },
  { city: "Montauk", country: "USA", lat: 41.0359, lng: -71.9545, radius: 5000 },
  { city: "Martha's Vineyard", country: "USA", lat: 41.3805, lng: -70.6455, radius: 8000 },
  { city: "Key West", country: "USA", lat: 24.5551, lng: -81.7800, radius: 5000 },
  { city: "Naples FL", country: "USA", lat: 26.1420, lng: -81.7948, radius: 8000 },
  { city: "Sedona", country: "USA", lat: 34.8697, lng: -111.7610, radius: 5000 },
  { city: "Carmel", country: "USA", lat: 36.5552, lng: -121.9233, radius: 5000 },

  // =============================================================
  // NEW EUROPE CITIES
  // =============================================================

  // --- UK ---
  { city: "Leeds", country: "UK", lat: 53.8008, lng: -1.5491, radius: 8000 },
  { city: "Glasgow", country: "UK", lat: 55.8642, lng: -4.2518, radius: 8000 },
  { city: "Bath", country: "UK", lat: 51.3811, lng: -2.3590, radius: 5000 },
  { city: "Oxford", country: "UK", lat: 51.7520, lng: -1.2577, radius: 5000 },
  { city: "Cambridge", country: "UK", lat: 52.2053, lng: 0.1218, radius: 5000 },
  { city: "Liverpool", country: "UK", lat: 53.4084, lng: -2.9916, radius: 8000 },
  { city: "Nottingham", country: "UK", lat: 52.9548, lng: -1.1581, radius: 8000 },
  { city: "Cardiff", country: "UK", lat: 51.4816, lng: -3.1791, radius: 8000 },
  { city: "Belfast", country: "UK", lat: 54.5973, lng: -5.9301, radius: 8000 },

  // --- Spain ---
  { city: "Bilbao", country: "Spain", lat: 43.2630, lng: -2.9350, radius: 8000 },
  { city: "San Sebastián", country: "Spain", lat: 43.3183, lng: -1.9812, radius: 5000 },
  { city: "Granada", country: "Spain", lat: 37.1773, lng: -3.5986, radius: 8000 },
  { city: "Alicante", country: "Spain", lat: 38.3452, lng: -0.4810, radius: 8000 },
  { city: "Ibiza", country: "Spain", lat: 38.9067, lng: 1.4206, radius: 8000 },
  { city: "Tenerife", country: "Spain", lat: 28.4636, lng: -16.2518, radius: 12000 },
  { city: "Las Palmas", country: "Spain", lat: 28.1235, lng: -15.4363, radius: 10000 },

  // --- Italy ---
  { city: "Venezia", country: "Italy", lat: 45.4408, lng: 12.3155, radius: 5000 },
  { city: "Verona", country: "Italy", lat: 45.4384, lng: 10.9917, radius: 8000 },
  { city: "Palermo", country: "Italy", lat: 38.1157, lng: 13.3615, radius: 8000 },
  { city: "Catania", country: "Italy", lat: 37.5079, lng: 15.0830, radius: 8000 },
  { city: "Bari", country: "Italy", lat: 41.1171, lng: 16.8719, radius: 8000 },
  { city: "Padova", country: "Italy", lat: 45.4064, lng: 11.8768, radius: 8000 },
  { city: "Perugia", country: "Italy", lat: 43.1107, lng: 12.3908, radius: 8000 },
  { city: "Como", country: "Italy", lat: 45.8081, lng: 9.0852, radius: 5000 },
  { city: "Bergamo", country: "Italy", lat: 45.6983, lng: 9.6773, radius: 8000 },

  // --- Germany ---
  { city: "Stuttgart", country: "Germany", lat: 48.7758, lng: 9.1829, radius: 8000 },
  { city: "Leipzig", country: "Germany", lat: 51.3397, lng: 12.3731, radius: 8000 },
  { city: "Dresden", country: "Germany", lat: 51.0504, lng: 13.7373, radius: 8000 },
  { city: "Hannover", country: "Germany", lat: 52.3759, lng: 9.7320, radius: 8000 },
  { city: "Nürnberg", country: "Germany", lat: 49.4521, lng: 11.0767, radius: 8000 },
  { city: "Bremen", country: "Germany", lat: 53.0793, lng: 8.8017, radius: 8000 },
  { city: "Freiburg", country: "Germany", lat: 47.9990, lng: 7.8421, radius: 5000 },

  // --- France ---
  { city: "Grenoble", country: "France", lat: 45.1885, lng: 5.7245, radius: 8000 },
  { city: "Tours", country: "France", lat: 47.3941, lng: 0.6848, radius: 8000 },
  { city: "Dijon", country: "France", lat: 47.3220, lng: 5.0415, radius: 8000 },
  { city: "Metz", country: "France", lat: 49.1193, lng: 6.1757, radius: 8000 },
  { city: "Nancy", country: "France", lat: 48.6921, lng: 6.1844, radius: 8000 },
  { city: "Pau", country: "France", lat: 43.2951, lng: -0.3708, radius: 8000 },
  { city: "Bayonne", country: "France", lat: 43.4933, lng: -1.4753, radius: 5000 },
  { city: "La Rochelle", country: "France", lat: 46.1603, lng: -1.1511, radius: 8000 },
  { city: "Clermont-Ferrand", country: "France", lat: 45.7772, lng: 3.0870, radius: 8000 },
  { city: "Rouen", country: "France", lat: 49.4432, lng: 1.0993, radius: 8000 },
  { city: "Caen", country: "France", lat: 49.1829, lng: -0.3707, radius: 8000 },
  { city: "Le Havre", country: "France", lat: 49.4944, lng: 0.1079, radius: 8000 },
  { city: "Perpignan", country: "France", lat: 42.6988, lng: 2.8948, radius: 8000 },
  { city: "Ajaccio", country: "France", lat: 41.9192, lng: 8.7386, radius: 8000 },

  // --- Portugal ---
  { city: "Braga", country: "Portugal", lat: 41.5518, lng: -8.4229, radius: 8000 },
  { city: "Coimbra", country: "Portugal", lat: 40.2033, lng: -8.4103, radius: 8000 },
  { city: "Funchal", country: "Portugal", lat: 32.6669, lng: -16.9241, radius: 8000 },
  { city: "Sintra", country: "Portugal", lat: 38.8029, lng: -9.3817, radius: 5000 },

  // --- Switzerland ---
  { city: "Bern", country: "Switzerland", lat: 46.9480, lng: 7.4474, radius: 8000 },
  { city: "Lugano", country: "Switzerland", lat: 46.0037, lng: 8.9511, radius: 5000 },
  { city: "St. Gallen", country: "Switzerland", lat: 47.4245, lng: 9.3767, radius: 5000 },
  { city: "Montreux", country: "Switzerland", lat: 46.4312, lng: 6.9107, radius: 5000 },
  { city: "Zug", country: "Switzerland", lat: 47.1724, lng: 8.5175, radius: 5000 },

  // --- Netherlands ---
  { city: "Utrecht", country: "Netherlands", lat: 52.0907, lng: 5.1214, radius: 8000 },
  { city: "Eindhoven", country: "Netherlands", lat: 51.4416, lng: 5.4697, radius: 8000 },
  { city: "Haarlem", country: "Netherlands", lat: 52.3874, lng: 4.6462, radius: 5000 },
  { city: "Leiden", country: "Netherlands", lat: 52.1601, lng: 4.4970, radius: 5000 },
  { city: "Groningen", country: "Netherlands", lat: 53.2194, lng: 6.5665, radius: 8000 },

  // --- Belgium ---
  { city: "Gent", country: "Belgium", lat: 51.0543, lng: 3.7174, radius: 8000 },
  { city: "Leuven", country: "Belgium", lat: 50.8798, lng: 4.7005, radius: 5000 },
  { city: "Liège", country: "Belgium", lat: 50.6326, lng: 5.5797, radius: 8000 },
  { city: "Bruges", country: "Belgium", lat: 51.2093, lng: 3.2247, radius: 5000 },

  // --- Scandinavia ---
  { city: "Göteborg", country: "Sweden", lat: 57.7089, lng: 11.9746, radius: 8000 },
  { city: "Malmö", country: "Sweden", lat: 55.6050, lng: 13.0038, radius: 8000 },
  { city: "Aarhus", country: "Denmark", lat: 56.1629, lng: 10.2039, radius: 8000 },
  { city: "Bergen", country: "Norway", lat: 60.3913, lng: 5.3221, radius: 8000 },
  { city: "Stavanger", country: "Norway", lat: 58.9700, lng: 5.7331, radius: 8000 },
  { city: "Tampere", country: "Finland", lat: 61.4978, lng: 23.7610, radius: 8000 },
  { city: "Turku", country: "Finland", lat: 60.4518, lng: 22.2666, radius: 8000 },

  // --- Eastern/Other Europe ---
  { city: "Krakow", country: "Poland", lat: 50.0647, lng: 19.9450, radius: 8000 },
  { city: "Wroclaw", country: "Poland", lat: 51.1079, lng: 17.0385, radius: 8000 },
  { city: "Gdansk", country: "Poland", lat: 54.3520, lng: 18.6466, radius: 8000 },
  { city: "Bratislava", country: "Slovakia", lat: 48.1486, lng: 17.1077, radius: 8000 },
  { city: "Ljubljana", country: "Slovenia", lat: 46.0569, lng: 14.5058, radius: 8000 },
  { city: "Zagreb", country: "Croatia", lat: 45.8150, lng: 15.9819, radius: 8000 },
  { city: "Bucharest", country: "Romania", lat: 44.4268, lng: 26.1025, radius: 10000 },
  { city: "Sofia", country: "Bulgaria", lat: 42.6977, lng: 23.3219, radius: 10000 },
  { city: "Riga", country: "Latvia", lat: 56.9496, lng: 24.1052, radius: 8000 },
  { city: "Tallinn", country: "Estonia", lat: 59.4370, lng: 24.7536, radius: 8000 },
  { city: "Vilnius", country: "Lithuania", lat: 54.6872, lng: 25.2797, radius: 8000 },
  { city: "Luxembourg City", country: "Luxembourg", lat: 49.6116, lng: 6.1319, radius: 8000 },
  { city: "Monaco", country: "Monaco", lat: 43.7384, lng: 7.4246, radius: 3000 },
  { city: "Valletta", country: "Malta", lat: 35.8989, lng: 14.5146, radius: 8000 },
  { city: "Limassol", country: "Cyprus", lat: 34.7071, lng: 33.0226, radius: 8000 },
  { city: "Nicosia", country: "Cyprus", lat: 35.1856, lng: 33.3823, radius: 8000 },
  { city: "Istanbul European", country: "Turkey", lat: 41.0082, lng: 28.9784, radius: 8000 },
  { city: "Istanbul Asian", country: "Turkey", lat: 40.9830, lng: 29.0290, radius: 8000 },
  { city: "Ankara", country: "Turkey", lat: 39.9334, lng: 32.8597, radius: 10000 },

  // =============================================================
  // ASIA / PACIFIC
  // =============================================================

  // --- Japan ---
  { city: "Osaka", country: "Japan", lat: 34.6937, lng: 135.5023, radius: 8000 },
  { city: "Kyoto", country: "Japan", lat: 35.0116, lng: 135.7681, radius: 8000 },
  { city: "Yokohama", country: "Japan", lat: 35.4437, lng: 139.6380, radius: 8000 },
  { city: "Kobe", country: "Japan", lat: 34.6901, lng: 135.1956, radius: 8000 },
  { city: "Fukuoka", country: "Japan", lat: 33.5904, lng: 130.4017, radius: 8000 },

  // --- South Korea ---
  { city: "Busan", country: "South Korea", lat: 35.1796, lng: 129.0756, radius: 10000 },
  { city: "Incheon", country: "South Korea", lat: 37.4563, lng: 126.7052, radius: 10000 },
  { city: "Daegu", country: "South Korea", lat: 35.8714, lng: 128.6014, radius: 10000 },

  // --- China ---
  { city: "Beijing", country: "China", lat: 39.9042, lng: 116.4074, radius: 10000 },
  { city: "Shenzhen", country: "China", lat: 22.5431, lng: 114.0579, radius: 10000 },
  { city: "Guangzhou", country: "China", lat: 23.1291, lng: 113.2644, radius: 10000 },
  { city: "Chengdu", country: "China", lat: 30.5728, lng: 104.0668, radius: 10000 },
  { city: "Hangzhou", country: "China", lat: 30.2741, lng: 120.1551, radius: 10000 },

  // --- Southeast Asia ---
  { city: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lng: 106.6297, radius: 10000 },
  { city: "Hanoi", country: "Vietnam", lat: 21.0285, lng: 105.8542, radius: 10000 },
  { city: "Phnom Penh", country: "Cambodia", lat: 11.5564, lng: 104.9282, radius: 10000 },
  { city: "Manila", country: "Philippines", lat: 14.5995, lng: 120.9842, radius: 10000 },
  { city: "Cebu", country: "Philippines", lat: 10.3157, lng: 123.8854, radius: 10000 },
  { city: "Jakarta South", country: "Indonesia", lat: -6.2615, lng: 106.8106, radius: 10000 },
  { city: "Kuala Lumpur", country: "Malaysia", lat: 3.1390, lng: 101.6869, radius: 10000 },

  // --- India ---
  { city: "Mumbai", country: "India", lat: 19.0760, lng: 72.8777, radius: 10000 },
  { city: "Delhi", country: "India", lat: 28.6139, lng: 77.2090, radius: 10000 },
  { city: "Bangalore", country: "India", lat: 12.9716, lng: 77.5946, radius: 10000 },
  { city: "Pune", country: "India", lat: 18.5204, lng: 73.8567, radius: 10000 },
  { city: "Hyderabad", country: "India", lat: 17.3850, lng: 78.4867, radius: 10000 },
  { city: "Chennai", country: "India", lat: 13.0827, lng: 80.2707, radius: 10000 },
  { city: "Goa", country: "India", lat: 15.2993, lng: 74.1240, radius: 15000 },

  // --- Australia ---
  { city: "Adelaide", country: "Australia", lat: -34.9285, lng: 138.6007, radius: 10000 },
  { city: "Canberra", country: "Australia", lat: -35.2809, lng: 149.1300, radius: 10000 },
  { city: "Hobart", country: "Australia", lat: -42.8821, lng: 147.3272, radius: 8000 },
  { city: "Darwin", country: "Australia", lat: -12.4634, lng: 130.8456, radius: 10000 },
  { city: "Sunshine Coast", country: "Australia", lat: -26.6500, lng: 153.0667, radius: 12000 },
  { city: "Byron Bay", country: "Australia", lat: -28.6474, lng: 153.6020, radius: 5000 },
  { city: "Noosa", country: "Australia", lat: -26.3955, lng: 153.0834, radius: 5000 },

  // --- New Zealand ---
  { city: "Wellington", country: "New Zealand", lat: -41.2865, lng: 174.7762, radius: 8000 },
  { city: "Christchurch", country: "New Zealand", lat: -43.5321, lng: 172.6362, radius: 10000 },
  { city: "Queenstown", country: "New Zealand", lat: -45.0312, lng: 168.6626, radius: 5000 },

  // =============================================================
  // AMERICAS (non-USA)
  // =============================================================

  // --- Canada ---
  { city: "Calgary", country: "Canada", lat: 51.0447, lng: -114.0719, radius: 10000 },
  { city: "Ottawa", country: "Canada", lat: 45.4215, lng: -75.6972, radius: 10000 },
  { city: "Victoria", country: "Canada", lat: 48.4284, lng: -123.3656, radius: 8000 },
  { city: "Whistler", country: "Canada", lat: 50.1163, lng: -122.9574, radius: 5000 },
  { city: "Halifax", country: "Canada", lat: 44.6488, lng: -63.5752, radius: 8000 },

  // --- Brazil ---
  { city: "Curitiba", country: "Brazil", lat: -25.4284, lng: -49.2733, radius: 10000 },
  { city: "Salvador", country: "Brazil", lat: -12.9714, lng: -38.5124, radius: 10000 },
  { city: "Brasília", country: "Brazil", lat: -15.7975, lng: -47.8919, radius: 10000 },
  { city: "Belo Horizonte", country: "Brazil", lat: -19.9191, lng: -43.9386, radius: 10000 },
  { city: "Florianópolis", country: "Brazil", lat: -27.5954, lng: -48.5480, radius: 10000 },

  // --- Mexico ---
  { city: "Cancún", country: "Mexico", lat: 21.1619, lng: -86.8515, radius: 10000 },
  { city: "Playa del Carmen", country: "Mexico", lat: 20.6296, lng: -87.0739, radius: 5000 },
  { city: "Guadalajara", country: "Mexico", lat: 20.6597, lng: -103.3496, radius: 10000 },
  { city: "Monterrey", country: "Mexico", lat: 25.6866, lng: -100.3161, radius: 10000 },
  { city: "San Miguel de Allende", country: "Mexico", lat: 20.9144, lng: -100.7452, radius: 5000 },
  { city: "Tulum", country: "Mexico", lat: 20.2115, lng: -87.4654, radius: 5000 },

  // --- Argentina ---
  { city: "Mendoza", country: "Argentina", lat: -32.8895, lng: -68.8458, radius: 10000 },
  { city: "Córdoba", country: "Argentina", lat: -31.4201, lng: -64.1888, radius: 10000 },
  { city: "Bariloche", country: "Argentina", lat: -41.1335, lng: -71.3103, radius: 8000 },

  // --- Colombia ---
  { city: "Medellín", country: "Colombia", lat: 6.2442, lng: -75.5812, radius: 10000 },
  { city: "Cartagena", country: "Colombia", lat: 10.3910, lng: -75.5144, radius: 8000 },
  { city: "Cali", country: "Colombia", lat: 3.4516, lng: -76.5320, radius: 10000 },

  // --- Chile ---
  { city: "Santiago", country: "Chile", lat: -33.4489, lng: -70.6693, radius: 10000 },
  { city: "Valparaíso", country: "Chile", lat: -33.0472, lng: -71.6127, radius: 8000 },
  { city: "Viña del Mar", country: "Chile", lat: -33.0153, lng: -71.5500, radius: 5000 },

  // --- Peru ---
  { city: "Lima", country: "Peru", lat: -12.0464, lng: -77.0428, radius: 10000 },
  { city: "Cusco", country: "Peru", lat: -13.5319, lng: -71.9675, radius: 8000 },

  // --- Costa Rica ---
  { city: "San José CR", country: "Costa Rica", lat: 9.9281, lng: -84.0907, radius: 10000 },
  { city: "Tamarindo", country: "Costa Rica", lat: 10.2996, lng: -85.8372, radius: 5000 },

  // --- Uruguay ---
  { city: "Montevideo", country: "Uruguay", lat: -34.9011, lng: -56.1645, radius: 10000 },
  { city: "Punta del Este", country: "Uruguay", lat: -34.9667, lng: -54.9500, radius: 5000 },

  // =============================================================
  // MIDDLE EAST / AFRICA
  // =============================================================

  // --- UAE ---
  { city: "Sharjah", country: "UAE", lat: 25.3463, lng: 55.4209, radius: 10000 },
  { city: "Al Ain", country: "UAE", lat: 24.2075, lng: 55.7447, radius: 10000 },

  // --- Saudi Arabia ---
  { city: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lng: 46.6753, radius: 15000 },
  { city: "Jeddah", country: "Saudi Arabia", lat: 21.4858, lng: 39.1925, radius: 12000 },

  // --- Gulf States ---
  { city: "Doha", country: "Qatar", lat: 25.2854, lng: 51.5310, radius: 10000 },
  { city: "Kuwait City", country: "Kuwait", lat: 29.3759, lng: 47.9774, radius: 10000 },
  { city: "Manama", country: "Bahrain", lat: 26.2285, lng: 50.5860, radius: 8000 },
  { city: "Muscat", country: "Oman", lat: 23.5880, lng: 58.3829, radius: 10000 },

  // --- Egypt ---
  { city: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357, radius: 12000 },
  { city: "Alexandria", country: "Egypt", lat: 31.2001, lng: 29.9187, radius: 10000 },
  { city: "Hurghada", country: "Egypt", lat: 27.2579, lng: 33.8116, radius: 10000 },

  // --- Morocco ---
  { city: "Casablanca", country: "Morocco", lat: 33.5731, lng: -7.5898, radius: 10000 },
  { city: "Marrakech", country: "Morocco", lat: 31.6295, lng: -7.9811, radius: 10000 },
  { city: "Rabat", country: "Morocco", lat: 34.0209, lng: -6.8416, radius: 8000 },
  { city: "Tanger", country: "Morocco", lat: 35.7595, lng: -5.8340, radius: 8000 },

  // --- Tunisia ---
  { city: "Tunis", country: "Tunisia", lat: 36.8065, lng: 10.1815, radius: 10000 },

  // --- Sub-Saharan Africa ---
  { city: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219, radius: 10000 },
  { city: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792, radius: 12000 },
  { city: "Abuja", country: "Nigeria", lat: 9.0579, lng: 7.4951, radius: 10000 },
  { city: "Dar es Salaam", country: "Tanzania", lat: -6.7924, lng: 39.2083, radius: 10000 },
  { city: "Port Louis", country: "Mauritius", lat: -20.1609, lng: 57.5012, radius: 8000 },
];

// --------------- Google Places helpers ---------------

async function searchZone(zone: Zone): Promise<any[]> {
  const url = "https://places.googleapis.com/v1/places:searchText";

  const body = {
    textQuery: "pilates studio",
    locationBias: {
      circle: {
        center: { latitude: zone.lat, longitude: zone.lng },
        radius: zone.radius,
      },
    },
    maxResultCount: 20,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.internationalPhoneNumber,places.regularOpeningHours,places.photos,places.googleMapsUri",
    },
    body: JSON.stringify(body),
  });

  totalRequests++;
  totalCost += COST_PER_REQUEST;

  if (!res.ok) {
    const error = await res.text();
    console.error(`  API error for ${zone.city}, ${zone.country}:`, error);
    return [];
  }

  const data = await res.json();
  return data.places || [];
}

function placeToStudio(place: any, zone: Zone) {
  const neighborhood = `${zone.city}, ${zone.country}`;
  return {
    name: place.displayName?.text || "Unknown",
    neighborhood,
    description: `Pilates studio in ${zone.city}, ${zone.country}`,
    address: place.formattedAddress || null,
    latitude: place.location?.latitude || null,
    longitude: place.location?.longitude || null,
    coordX: null,
    coordY: null,
    price: 0,
    rating: place.rating || 0,
    reviewCount: place.userRatingCount || 0,
    imageUrl: null,
    amenities: [],
  };
}

// Haversine distance in meters
function distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --------------- Main ---------------

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL required");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });
  const db = drizzle(pool, { schema });

  // Get existing studios for deduplication
  const existing = await db
    .select({
      name: schema.studios.name,
      latitude: schema.studios.latitude,
      longitude: schema.studios.longitude,
    })
    .from(schema.studios);
  console.log(`Existing studios in DB: ${existing.length}`);

  let totalNew = 0;
  let totalSkipped = 0;
  const countryStats: Record<string, number> = {};

  console.log(`\nStarting DEEP scrape of ${DEEP_ZONES.length} zones...`);
  console.log(`Budget: $${MAX_BUDGET} | Cost per request: $${COST_PER_REQUEST}`);
  console.log(`Max requests before budget hit: ${Math.floor(MAX_BUDGET / COST_PER_REQUEST)}\n`);

  for (let i = 0; i < DEEP_ZONES.length; i++) {
    const zone = DEEP_ZONES[i];

    // Budget check
    if (totalCost >= MAX_BUDGET) {
      console.log(`\n*** BUDGET LIMIT REACHED: $${totalCost.toFixed(2)} >= $${MAX_BUDGET} ***`);
      console.log(`Stopping at zone ${i + 1}/${DEEP_ZONES.length}`);
      break;
    }

    console.log(`[${i + 1}/${DEEP_ZONES.length}] ${zone.city}, ${zone.country} (r=${zone.radius}m) | $${totalCost.toFixed(2)}/$${MAX_BUDGET}`);

    try {
      const places = await searchZone(zone);
      console.log(`  Found ${places.length} places from Google`);

      let zoneNew = 0;
      for (const place of places) {
        const studio = placeToStudio(place, zone);

        if (!studio.latitude || !studio.longitude) {
          totalSkipped++;
          continue;
        }

        // Deduplicate: same location (<100m) or close + similar name
        const isDuplicate = existing.some((ex) => {
          if (!ex.latitude || !ex.longitude) return false;
          const dist = distance(
            studio.latitude!,
            studio.longitude!,
            ex.latitude,
            ex.longitude,
          );
          const nameMatch =
            ex.name.toLowerCase().includes(studio.name.toLowerCase().slice(0, 8)) ||
            studio.name.toLowerCase().includes(ex.name.toLowerCase().slice(0, 8));
          return dist < 100 || (dist < 500 && nameMatch);
        });

        if (isDuplicate) {
          totalSkipped++;
          continue;
        }

        try {
          await db.insert(schema.studios).values(studio);
          existing.push({
            name: studio.name,
            latitude: studio.latitude,
            longitude: studio.longitude,
          });
          totalNew++;
          zoneNew++;
          countryStats[zone.country] = (countryStats[zone.country] || 0) + 1;
        } catch (err: any) {
          console.error(`  Failed to insert ${studio.name}:`, err.message);
        }
      }

      console.log(`  +${zoneNew} new (${totalNew} total new, ${totalSkipped} skipped)`);

      // Rate limiting: 250ms between requests
      await new Promise((r) => setTimeout(r, 250));
    } catch (err: any) {
      console.error(`  Error for ${zone.city}, ${zone.country}:`, err.message);
    }
  }

  // --------------- Summary ---------------
  console.log(`\n${"=".repeat(60)}`);
  console.log(`DEEP SCRAPE COMPLETE`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Total API requests: ${totalRequests}`);
  console.log(`Total API cost: $${totalCost.toFixed(2)}`);
  console.log(`New studios added: ${totalNew}`);
  console.log(`Duplicates skipped: ${totalSkipped}`);
  console.log(`Total studios in DB now: ${existing.length}`);
  console.log(`\nStudios added per country (top 20):`);

  const sorted = Object.entries(countryStats).sort((a, b) => b[1] - a[1]);
  for (const [country, count] of sorted.slice(0, 20)) {
    console.log(`  ${country}: ${count}`);
  }

  if (sorted.length > 20) {
    console.log(`  ... and ${sorted.length - 20} more countries`);
  }

  console.log(`\nAll countries:`);
  for (const [country, count] of sorted) {
    console.log(`  ${country}: ${count}`);
  }

  await pool.end();
}

main().catch(console.error);
