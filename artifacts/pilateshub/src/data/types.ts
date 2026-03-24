export interface Studio {
  id: number;
  name: string;
  neighborhood: string;
  rating: number;
  reviews: number;
  price: number;
  distance: number;
  coords: { x: number; y: number };
  lat: number;
  lng: number;
  description: string;
  coaches: string[];
  imageUrl: string;
  address?: string;
  website?: string;
  phone?: string;
}

export interface AppUser {
  id: number;
  name: string;
  initials: string;
  color: string;
}

export interface Post {
  id: number;
  user: AppUser;
  type: string;
  studio: string;
  duration: number;
  calories: number;
  likes: number;
  comments: number;
  timeAgo: string;
  hasPhoto: boolean;
}

export interface CalorieDataPoint {
  week: string;
  calories: number;
}

export interface BadgeItem {
  id: number;
  name: string;
  icon: React.ReactNode;
  earned: boolean;
  description: string;
}

export interface ForumPost {
  id: number;
  title: string;
  category: string;
  author: AppUser;
  flair: string;
  upvotes: number;
  comments: number;
  timeAgo: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
  category: string;
  subcategory?: string;
  image: string;
  imageUrl: string;
  externalUrl?: string;
  badge?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: AppUser;
  sessions: number;
  calories: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  logoEmoji: string;
  coverImageUrl: string;
  category: string;
  rating: number;
  productCount: number;
  founded: string;
  origin: string;
  highlight: string;
  verified: boolean;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  type: "monthly" | "weekly" | "bingo";
  startDate: string;
  endDate: string;
  target: number;
  progress: number;
  participants: number;
  reward: string;
  icon: string; // emoji
}

export interface BingoCell {
  id: number;
  text: string;
  completed: boolean;
}

export interface PilatesCircle {
  id: number;
  name: string;
  description: string;
  emoji: string;
  members: AppUser[];
  totalSessions: number;
  totalCalories: number;
  isJoined: boolean;
}

export interface StudioCheckin {
  studioId: number;
  userId: number;
  userName: string;
  userInitials: string;
  userColor: string;
  checkins: number;
  lastVisit: string;
}

export interface StudioReview {
  id: number;
  studioId: number;
  userId: number;
  userName: string;
  userInitials: string;
  userColor: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
}

export interface CoachProfile {
  id: number;
  name: string;
  slug: string;
  bio: string;
  specialties: string[];
  studioIds: number[];
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  certifications: string[];
  avatarColor: string;
  initials: string;
  imageUrl: string;
  sessionsCount: number;
  quote: string;
}

export interface WearableData {
  connected: boolean;
  provider: "whoop" | "apple_watch" | "garmin" | "oura" | "none";
  lastSync: string;
  recovery: number; // 0-100
  strain: number; // 0-21
  hrv: number; // ms
  restingHr: number; // bpm
  sleepScore: number; // 0-100
  sleepDuration: number; // hours
  caloriesBurned: number;
  activeCalories: number;
}

export interface WorkoutMetrics {
  avgHeartRate: number;
  maxHeartRate: number;
  strain: number;
  calories: number;
  duration: number;
  zones: { zone: string; minutes: number; color: string }[];
}
