import { Activity, Award, CheckCircle2, Clock, Flame, Users } from "lucide-react";

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
  badge?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: AppUser;
  sessions: number;
  calories: number;
}

export const STUDIOS: Studio[] = [
  {
    id: 1,
    name: "Studio Harmonie",
    neighborhood: "Marais",
    rating: 4.9,
    reviews: 234,
    price: 45,
    distance: 0.3,
    coords: { x: 30, y: 40 },
    lat: 48.8566,
    lng: 2.3622,
    description:
      "A serene reformer studio nestled in the heart of Le Marais, offering both beginner and advanced classes with world-class equipment.",
    coaches: ["Sophie Leclerc", "Julien Moreau"],
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=250&fit=crop",
  },
  {
    id: 2,
    name: "Pilates Lumière",
    neighborhood: "Saint-Germain",
    rating: 4.8,
    reviews: 189,
    price: 55,
    distance: 0.7,
    coords: { x: 45, y: 60 },
    lat: 48.853,
    lng: 2.334,
    description:
      "Premium boutique studio with panoramic views of Saint-Germain-des-Prés. Specialising in Cadillac and Reformer work.",
    coaches: ["Marie Dubois", "Antoine Petit"],
    imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=250&fit=crop",
  },
  {
    id: 3,
    name: "Core & Flow",
    neighborhood: "Montmartre",
    rating: 4.7,
    reviews: 312,
    price: 38,
    distance: 1.2,
    coords: { x: 60, y: 20 },
    lat: 48.8867,
    lng: 2.3431,
    description:
      "Community-driven studio at the base of Montmartre. Affordable classes for all levels, with a welcoming and diverse atmosphere.",
    coaches: ["Camille Bernard", "Lucas Fontaine"],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=250&fit=crop",
  },
  {
    id: 4,
    name: "Reform Studio Paris",
    neighborhood: "Bastille",
    rating: 4.6,
    reviews: 156,
    price: 50,
    distance: 1.8,
    coords: { x: 75, y: 50 },
    lat: 48.853,
    lng: 2.369,
    description:
      "Modern industrial-chic studio with the latest Balanced Body equipment. Strong focus on strength and technique.",
    coaches: ["Isabelle Dupont", "Marc Rousseau"],
    imageUrl: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=250&fit=crop",
  },
  {
    id: 5,
    name: "Équilibre Pilates",
    neighborhood: "Pigalle",
    rating: 4.5,
    reviews: 98,
    price: 42,
    distance: 2.1,
    coords: { x: 50, y: 30 },
    lat: 48.8822,
    lng: 2.3375,
    description:
      "A hidden gem in Pigalle offering intimate group classes and private sessions. Specialises in mat and chair work.",
    coaches: ["Élise Martin", "Pierre Garnier"],
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=250&fit=crop",
  },
  {
    id: 6,
    name: "Le Studio Reformer",
    neighborhood: "Oberkampf",
    rating: 4.4,
    reviews: 203,
    price: 35,
    distance: 2.5,
    coords: { x: 80, y: 70 },
    lat: 48.865,
    lng: 2.38,
    description:
      "The most affordable reformer studio in Paris without sacrificing quality. Popular with young professionals in the 11th.",
    coaches: ["Nathalie Simon", "Florent Legrand"],
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=250&fit=crop",
  },
  {
    id: 7,
    name: "Pilates Zen",
    neighborhood: "Nation",
    rating: 4.8,
    reviews: 127,
    price: 48,
    distance: 3.0,
    coords: { x: 90, y: 80 },
    lat: 48.8485,
    lng: 2.396,
    description:
      "Zen-inspired studio combining traditional Pilates with mindfulness practices. Unique breath-work integration.",
    coaches: ["Audrey Girard", "Thomas Chevalier"],
    imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=250&fit=crop",
  },
  {
    id: 8,
    name: "BodyWork Pilates",
    neighborhood: "Châtelet",
    rating: 4.9,
    reviews: 445,
    price: 60,
    distance: 3.4,
    coords: { x: 40, y: 50 },
    lat: 48.859,
    lng: 2.347,
    description:
      "The most acclaimed studio in Paris, trusted by professional dancers and athletes. Extensive class schedule all week.",
    coaches: ["Céline Blanc", "Raphaël Dumas"],
    imageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&h=250&fit=crop",
  },
];

export const USERS: AppUser[] = [
  { id: 1, name: "Emma D", initials: "ED", color: "bg-rose-200" },
  { id: 2, name: "Lucas M", initials: "LM", color: "bg-blue-200" },
  { id: 3, name: "Sophie B", initials: "SB", color: "bg-green-200" },
  { id: 4, name: "Alex R", initials: "AR", color: "bg-yellow-200" },
  { id: 5, name: "Marie C", initials: "MC", color: "bg-purple-200" },
  { id: 6, name: "Pierre T", initials: "PT", color: "bg-orange-200" },
  { id: 7, name: "Isabelle F", initials: "IF", color: "bg-teal-200" },
  { id: 8, name: "Thomas G", initials: "TG", color: "bg-indigo-200" },
  { id: 9, name: "Léa N", initials: "LN", color: "bg-pink-200" },
  { id: 10, name: "Hugo P", initials: "HP", color: "bg-cyan-200" },
];

export const POSTS: Post[] = [
  {
    id: 1,
    user: USERS[0],
    type: "Reformer Advanced",
    studio: "Studio Harmonie",
    duration: 55,
    calories: 320,
    likes: 24,
    comments: 3,
    timeAgo: "2h ago",
    hasPhoto: true,
  },
  {
    id: 2,
    user: USERS[1],
    type: "Mat Pilates Core",
    studio: "Core & Flow",
    duration: 45,
    calories: 250,
    likes: 12,
    comments: 1,
    timeAgo: "4h ago",
    hasPhoto: false,
  },
  {
    id: 3,
    user: USERS[2],
    type: "Cadillac Intro",
    studio: "Pilates Lumière",
    duration: 60,
    calories: 290,
    likes: 45,
    comments: 8,
    timeAgo: "5h ago",
    hasPhoto: true,
  },
  {
    id: 4,
    user: USERS[3],
    type: "Wunda Chair Blast",
    studio: "Reform Studio Paris",
    duration: 45,
    calories: 310,
    likes: 18,
    comments: 2,
    timeAgo: "8h ago",
    hasPhoto: false,
  },
  {
    id: 5,
    user: USERS[4],
    type: "Reformer Flow",
    studio: "Équilibre Pilates",
    duration: 50,
    calories: 275,
    likes: 32,
    comments: 5,
    timeAgo: "1d ago",
    hasPhoto: true,
  },
  {
    id: 6,
    user: USERS[5],
    type: "Spine Corrector",
    studio: "Studio Harmonie",
    duration: 40,
    calories: 200,
    likes: 9,
    comments: 0,
    timeAgo: "1d ago",
    hasPhoto: false,
  },
  {
    id: 7,
    user: USERS[6],
    type: "Tower & Reformer",
    studio: "BodyWork Pilates",
    duration: 75,
    calories: 410,
    likes: 67,
    comments: 14,
    timeAgo: "2d ago",
    hasPhoto: true,
  },
  {
    id: 8,
    user: USERS[7],
    type: "Mat Beginner",
    studio: "Core & Flow",
    duration: 50,
    calories: 220,
    likes: 5,
    comments: 1,
    timeAgo: "2d ago",
    hasPhoto: false,
  },
  {
    id: 9,
    user: USERS[8],
    type: "Reformer Cardio",
    studio: "Pilates Zen",
    duration: 45,
    calories: 350,
    likes: 28,
    comments: 4,
    timeAgo: "3d ago",
    hasPhoto: true,
  },
  {
    id: 10,
    user: USERS[9],
    type: "Classical Mat",
    studio: "Équilibre Pilates",
    duration: 60,
    calories: 240,
    likes: 14,
    comments: 3,
    timeAgo: "3d ago",
    hasPhoto: false,
  },
];

export const CALORIE_DATA: CalorieDataPoint[] = [
  { week: "W1", calories: 1200 },
  { week: "W2", calories: 1450 },
  { week: "W3", calories: 1100 },
  { week: "W4", calories: 1680 },
  { week: "W5", calories: 1520 },
  { week: "W6", calories: 1890 },
  { week: "W7", calories: 1750 },
  { week: "W8", calories: 2100 },
];

export const BADGES: BadgeItem[] = [
  {
    id: 1,
    name: "First Class",
    icon: <CheckCircle2 className="w-6 h-6" />,
    earned: true,
    description: "Complete your first Pilates class",
  },
  {
    id: 2,
    name: "On Fire",
    icon: <Flame className="w-6 h-6" />,
    earned: true,
    description: "Complete 7 classes in a row",
  },
  {
    id: 3,
    name: "Century Club",
    icon: <Award className="w-6 h-6" />,
    earned: true,
    description: "Burn 10,000 total calories",
  },
  {
    id: 4,
    name: "Early Bird",
    icon: <Clock className="w-6 h-6" />,
    earned: false,
    description: "Attend 5 classes before 8am",
  },
  {
    id: 5,
    name: "Social Butterfly",
    icon: <Users className="w-6 h-6" />,
    earned: false,
    description: "Follow 20 other members",
  },
  {
    id: 6,
    name: "Elite",
    icon: <Activity className="w-6 h-6" />,
    earned: false,
    description: "Reach the top 10 on the leaderboard",
  },
];

export const FORUM_POSTS: ForumPost[] = [
  {
    id: 1,
    title: "Best reformer studio for beginners in Paris?",
    category: "Recommendations",
    author: USERS[0],
    flair: "Question",
    upvotes: 34,
    comments: 12,
    timeAgo: "3h ago",
  },
  {
    id: 2,
    title: "My 6-month Pilates transformation - before & after",
    category: "Progress",
    author: USERS[1],
    flair: "Inspiration",
    upvotes: 156,
    comments: 45,
    timeAgo: "5h ago",
  },
  {
    id: 3,
    title: "Reformer vs Mat: Which gives better results?",
    category: "Discussion",
    author: USERS[2],
    flair: "Debate",
    upvotes: 89,
    comments: 67,
    timeAgo: "8h ago",
  },
  {
    id: 4,
    title: "Studio Harmonie just added new Balanced Body reformers!",
    category: "News",
    author: USERS[3],
    flair: "Update",
    upvotes: 45,
    comments: 8,
    timeAgo: "12h ago",
  },
  {
    id: 5,
    title: "Tips for managing lower back pain during roll-ups",
    category: "Technique",
    author: USERS[4],
    flair: "Help",
    upvotes: 72,
    comments: 23,
    timeAgo: "1d ago",
  },
  {
    id: 6,
    title: "Weekly challenge: 5 classes in 7 days - who's in?",
    category: "Challenges",
    author: USERS[5],
    flair: "Challenge",
    upvotes: 28,
    comments: 34,
    timeAgo: "1d ago",
  },
  {
    id: 7,
    title: "The science behind Pilates and core stability",
    category: "Education",
    author: USERS[6],
    flair: "Article",
    upvotes: 112,
    comments: 19,
    timeAgo: "2d ago",
  },
  {
    id: 8,
    title: "Found an amazing grip sock brand - half the price!",
    category: "Gear",
    author: USERS[7],
    flair: "Review",
    upvotes: 67,
    comments: 31,
    timeAgo: "2d ago",
  },
  {
    id: 9,
    title: "Pilates Zen instructor spotlight: Audrey Girard",
    category: "Community",
    author: USERS[8],
    flair: "Feature",
    upvotes: 91,
    comments: 15,
    timeAgo: "3d ago",
  },
  {
    id: 10,
    title: "How often should you do Pilates per week?",
    category: "Discussion",
    author: USERS[9],
    flair: "Question",
    upvotes: 54,
    comments: 42,
    timeAgo: "3d ago",
  },
];

export const PRODUCTS: Product[] = [
  // ─── Habitat (6) ───
  {
    id: 1,
    name: "Tapis mural décoratif Pilates",
    brand: "Studio Déco",
    price: 69,
    rating: 4.6,
    category: "Habitat",
    subcategory: "Décoration",
    image: "🏠",
    imageUrl: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=300&h=300&fit=crop",
    badge: "New",
  },
  {
    id: 2,
    name: "Rangement mural pour tapis",
    brand: "WallFit",
    price: 45,
    rating: 4.5,
    category: "Habitat",
    subcategory: "Rangement",
    image: "🏠",
    imageUrl: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=300&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Miroir fitness mural 160x60cm",
    brand: "Reflex Studio",
    price: 189,
    rating: 4.8,
    category: "Habitat",
    subcategory: "Aménagement",
    image: "🪞",
    imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=300&h=300&fit=crop",
    badge: "Best Seller",
  },
  {
    id: 4,
    name: "Diffuseur huiles essentielles bambou",
    brand: "Zen Home",
    price: 39,
    rating: 4.7,
    category: "Habitat",
    subcategory: "Bien-être",
    image: "🌿",
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Bougies relaxation soja (lot de 3)",
    brand: "Lumière Douce",
    price: 28,
    rating: 4.4,
    category: "Habitat",
    subcategory: "Bien-être",
    image: "🕯️",
    imageUrl: "https://images.unsplash.com/photo-1602607663610-a6e6dbb1cc82?w=300&h=300&fit=crop",
    badge: "Promo -20%",
  },
  {
    id: 6,
    name: "Porte-serviettes studio double barre",
    brand: "WallFit",
    price: 34,
    rating: 4.3,
    category: "Habitat",
    subcategory: "Rangement",
    image: "🏠",
    imageUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=300&h=300&fit=crop",
  },

  // ─── Alimentation (8) ───
  {
    id: 7,
    name: "Protéine végétale bio vanille 500g",
    brand: "Nüti",
    price: 34,
    rating: 4.7,
    category: "Alimentation",
    subcategory: "Compléments",
    image: "🥗",
    imageUrl: "https://images.unsplash.com/photo-1622485831930-34623fedb10d?w=300&h=300&fit=crop",
    badge: "Best Seller",
  },
  {
    id: 8,
    name: "Barres énergétiques Pilates x6",
    brand: "PilatesHub x Baouw",
    price: 18,
    rating: 4.5,
    category: "Alimentation",
    subcategory: "Snacking",
    image: "🍫",
    imageUrl: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=300&h=300&fit=crop",
    badge: "Exclusif",
  },
  {
    id: 9,
    name: "Bouteille isotherme sport 750ml",
    brand: "Hydro Flask",
    price: 42,
    rating: 4.8,
    category: "Alimentation",
    subcategory: "Hydratation",
    image: "🍶",
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop",
  },
  {
    id: 10,
    name: "Electrolytes naturels citron x20",
    brand: "Nuun",
    price: 14,
    rating: 4.6,
    category: "Alimentation",
    subcategory: "Hydratation",
    image: "⚡",
    imageUrl: "https://images.unsplash.com/photo-1625865802865-0ac3a229e19a?w=300&h=300&fit=crop",
    badge: "New",
  },
  {
    id: 11,
    name: "Snack balls protéinées cacao x12",
    brand: "Foodspring",
    price: 22,
    rating: 4.4,
    category: "Alimentation",
    subcategory: "Snacking",
    image: "🟤",
    imageUrl: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300&h=300&fit=crop",
  },
  {
    id: 12,
    name: "Thé matcha premium cérémoniel 80g",
    brand: "Kumiko Matcha",
    price: 29,
    rating: 4.9,
    category: "Alimentation",
    subcategory: "Boissons",
    image: "🍵",
    imageUrl: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=300&h=300&fit=crop",
    badge: "Best Seller",
  },
  {
    id: 13,
    name: "Collagène en poudre marin 300g",
    brand: "Vital Proteins",
    price: 38,
    rating: 4.7,
    category: "Alimentation",
    subcategory: "Compléments",
    image: "✨",
    imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300&h=300&fit=crop",
  },
  {
    id: 14,
    name: "Gourde infuseur fruits 700ml",
    brand: "Hydrate",
    price: 24,
    rating: 4.3,
    category: "Alimentation",
    subcategory: "Hydratation",
    image: "🍋",
    imageUrl: "https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=300&h=300&fit=crop",
  },

  // ─── Machines & Équipement (6) ───
  {
    id: 15,
    name: "Reformer pliable maison Allegro 2",
    brand: "Balanced Body",
    price: 2890,
    rating: 4.9,
    category: "Machines",
    subcategory: "Reformers",
    image: "🏋️",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=300&fit=crop",
    badge: "Best Seller",
  },
  {
    id: 16,
    name: "Mini reformer portable Pilates",
    brand: "AeroPilates",
    price: 449,
    rating: 4.5,
    category: "Machines",
    subcategory: "Reformers",
    image: "🏋️",
    imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=300&h=300&fit=crop",
    badge: "New",
  },
  {
    id: 17,
    name: "Pilates Chair (Wunda Chair)",
    brand: "Peak Pilates",
    price: 795,
    rating: 4.7,
    category: "Machines",
    subcategory: "Chaises",
    image: "🪑",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop",
  },
  {
    id: 18,
    name: "Barrel arc correcteur de posture",
    brand: "STOTT Pilates",
    price: 385,
    rating: 4.6,
    category: "Machines",
    subcategory: "Barrels",
    image: "🌊",
    imageUrl: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=300&h=300&fit=crop",
  },
  {
    id: 19,
    name: "Tour Pilates murale complète",
    brand: "Balanced Body",
    price: 1290,
    rating: 4.8,
    category: "Machines",
    subcategory: "Tours",
    image: "🗼",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300&h=300&fit=crop",
    badge: "Exclusif",
  },
  {
    id: 20,
    name: "Spring board mural Pilates",
    brand: "Gratz",
    price: 650,
    rating: 4.5,
    category: "Machines",
    subcategory: "Boards",
    image: "📐",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=300&fit=crop",
  },

  // ─── Goodies & Lifestyle (8) ───
  {
    id: 21,
    name: "Grip socks pack coloré (3 paires)",
    brand: "ToeSox",
    price: 36,
    rating: 4.8,
    category: "Goodies",
    subcategory: "Chaussettes",
    image: "🧦",
    imageUrl: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=300&h=300&fit=crop",
    badge: "Best Seller",
  },
  {
    id: 22,
    name: "Sac de transport studio XL",
    brand: "Lululemon",
    price: 128,
    rating: 4.7,
    category: "Goodies",
    subcategory: "Sacs",
    image: "👜",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
  },
  {
    id: 23,
    name: "Serviette microfibre Pilates",
    brand: "Manduka",
    price: 26,
    rating: 4.5,
    category: "Goodies",
    subcategory: "Accessoires",
    image: "🏖️",
    imageUrl: "https://images.unsplash.com/photo-1600369672770-985fd30004eb?w=300&h=300&fit=crop",
  },
  {
    id: 24,
    name: "Gourde PilatesHub édition limitée",
    brand: "PilatesHub",
    price: 32,
    rating: 4.9,
    category: "Goodies",
    subcategory: "Hydratation",
    image: "🍶",
    imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100fc988a6?w=300&h=300&fit=crop",
    badge: "Exclusif",
  },
  {
    id: 25,
    name: "Carnet de suivi sessions Pilates",
    brand: "PilatesHub",
    price: 16,
    rating: 4.3,
    category: "Goodies",
    subcategory: "Papeterie",
    image: "📓",
    imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&h=300&fit=crop",
    badge: "New",
  },
  {
    id: 26,
    name: "Stickers Pilates pack (12 pcs)",
    brand: "PilatesHub",
    price: 8,
    rating: 4.2,
    category: "Goodies",
    subcategory: "Fun",
    image: "🩷",
    imageUrl: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=300&h=300&fit=crop",
  },
  {
    id: 27,
    name: "Porte-clés reformer miniature",
    brand: "PilatesHub",
    price: 12,
    rating: 4.4,
    category: "Goodies",
    subcategory: "Fun",
    image: "🔑",
    imageUrl: "https://images.unsplash.com/photo-1614704553704-4fa1e6cc9dd6?w=300&h=300&fit=crop",
  },
  {
    id: 28,
    name: 'T-shirt "Reformer Addict" unisex',
    brand: "PilatesHub",
    price: 35,
    rating: 4.6,
    category: "Goodies",
    subcategory: "Vêtements",
    image: "👕",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
    badge: "New",
  },

  // ─── Apparel (7) ───
  {
    id: 29,
    name: "Leggings haute compression sculpt",
    brand: "Lululemon",
    price: 98,
    rating: 4.8,
    category: "Apparel",
    subcategory: "Bas",
    image: "👖",
    imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=300&h=300&fit=crop",
    badge: "Best Seller",
  },
  {
    id: 30,
    name: "Brassière sport maintien medium",
    brand: "Alo Yoga",
    price: 68,
    rating: 4.7,
    category: "Apparel",
    subcategory: "Hauts",
    image: "👚",
    imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=300&h=300&fit=crop",
  },
  {
    id: 31,
    name: "Tank top breathable mesh",
    brand: "Beyond Yoga",
    price: 52,
    rating: 4.5,
    category: "Apparel",
    subcategory: "Hauts",
    image: "👕",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop",
  },
  {
    id: 32,
    name: "Short taille haute Flex",
    brand: "Girlfriend Collective",
    price: 48,
    rating: 4.6,
    category: "Apparel",
    subcategory: "Bas",
    image: "🩳",
    imageUrl: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=300&h=300&fit=crop",
    badge: "New",
  },
  {
    id: 33,
    name: "Sweat à capuche cozy oversize",
    brand: "Vuori",
    price: 89,
    rating: 4.7,
    category: "Apparel",
    subcategory: "Hauts",
    image: "🧥",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop",
  },
  {
    id: 34,
    name: "Bandeau sport cheveux (lot de 4)",
    brand: "Nike",
    price: 18,
    rating: 4.4,
    category: "Apparel",
    subcategory: "Accessoires",
    image: "🎀",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
  },
  {
    id: 35,
    name: "Leg warmers tricot laine mérinos",
    brand: "Free People",
    price: 42,
    rating: 4.5,
    category: "Apparel",
    subcategory: "Accessoires",
    image: "🦵",
    imageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=300&h=300&fit=crop",
    badge: "Promo -20%",
  },

  // ─── Accessoires (10) ───
  {
    id: 36,
    name: "Tapis premium antidérapant 5mm",
    brand: "Manduka PRO",
    price: 95,
    rating: 4.9,
    category: "Accessoires",
    subcategory: "Tapis",
    image: "🧘",
    imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=300&fit=crop",
    badge: "Best Seller",
  },
  {
    id: 37,
    name: "Tapis voyage ultra-léger 1.5mm",
    brand: "Manduka eKO",
    price: 52,
    rating: 4.5,
    category: "Accessoires",
    subcategory: "Tapis",
    image: "🧘",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop",
  },
  {
    id: 38,
    name: "Tapis liège écologique naturel",
    brand: "Yoloha",
    price: 78,
    rating: 4.7,
    category: "Accessoires",
    subcategory: "Tapis",
    image: "🌿",
    imageUrl: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=300&h=300&fit=crop",
    badge: "New",
  },
  {
    id: 39,
    name: "Set bandes résistance (3 forces)",
    brand: "TheraBand",
    price: 28,
    rating: 4.6,
    category: "Accessoires",
    subcategory: "Bandes",
    image: "🏋️",
    imageUrl: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=300&h=300&fit=crop",
  },
  {
    id: 40,
    name: "Anneau Pilates (magic circle) 35cm",
    brand: "STOTT",
    price: 32,
    rating: 4.6,
    category: "Accessoires",
    subcategory: "Anneaux",
    image: "⭕",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=300&fit=crop",
  },
  {
    id: 41,
    name: 'Ballon core Pilates 9" anti-burst',
    brand: "OPTP",
    price: 14,
    rating: 4.4,
    category: "Accessoires",
    subcategory: "Ballons",
    image: "⚽",
    imageUrl: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=300&h=300&fit=crop",
  },
  {
    id: 42,
    name: "Rouleau mousse massage 45cm",
    brand: "TriggerPoint",
    price: 35,
    rating: 4.8,
    category: "Accessoires",
    subcategory: "Récupération",
    image: "🔵",
    imageUrl: "https://images.unsplash.com/photo-1570655652364-2e0a67455ac6?w=300&h=300&fit=crop",
  },
  {
    id: 43,
    name: "Brique yoga liège 2-pack",
    brand: "Gaiam",
    price: 22,
    rating: 4.5,
    category: "Accessoires",
    subcategory: "Supports",
    image: "🧱",
    imageUrl: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=300&h=300&fit=crop",
  },
  {
    id: 44,
    name: "Sangle étirement multi-boucles",
    brand: "ProsourceFit",
    price: 15,
    rating: 4.3,
    category: "Accessoires",
    subcategory: "Sangles",
    image: "➰",
    imageUrl: "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=300&h=300&fit=crop",
  },
  {
    id: 45,
    name: "Coussin d'équilibre gonflable 33cm",
    brand: "Sissel",
    price: 26,
    rating: 4.4,
    category: "Accessoires",
    subcategory: "Équilibre",
    image: "🎯",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300&h=300&fit=crop",
    badge: "Promo -20%",
  },
];

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

export const BRANDS: Brand[] = [
  {
    id: 1,
    name: "Balanced Body",
    slug: "balanced-body",
    description:
      "The world's leading Pilates equipment manufacturer. Over 40 years of crafting reformers, chairs, and accessories trusted by studios worldwide.",
    logoEmoji: "\u2696\uFE0F",
    coverImageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=200&fit=crop",
    category: "equipment",
    rating: 4.9,
    productCount: 8,
    founded: "1976",
    origin: "Sacramento, USA",
    highlight: "40+ years of Pilates innovation",
    verified: true,
  },
  {
    id: 2,
    name: "Lululemon",
    slug: "lululemon",
    description:
      "Premium athletic apparel designed for yoga, Pilates, and running. Known for the iconic Align legging and buttery-soft Nulu fabric.",
    logoEmoji: "\u{1F9D8}",
    coverImageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&h=200&fit=crop",
    category: "apparel",
    rating: 4.8,
    productCount: 6,
    founded: "1998",
    origin: "Vancouver, Canada",
    highlight: "Iconic Align leggings",
    verified: true,
  },
  {
    id: 3,
    name: "Manduka",
    slug: "manduka",
    description:
      "Premium yoga and Pilates mats with lifetime guarantee. The PRO mat is the industry standard for durability and performance.",
    logoEmoji: "\u{1F33F}",
    coverImageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=200&fit=crop",
    category: "accessories",
    rating: 4.9,
    productCount: 4,
    founded: "1997",
    origin: "Los Angeles, USA",
    highlight: "Lifetime guarantee on PRO mats",
    verified: true,
  },
  {
    id: 4,
    name: "BASI Pilates",
    slug: "basi",
    description:
      "Founded by Rael Isacowitz, BASI combines equipment manufacturing with world-class instructor education and certification.",
    logoEmoji: "\u{1F393}",
    coverImageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=200&fit=crop",
    category: "equipment",
    rating: 4.7,
    productCount: 5,
    founded: "1989",
    origin: "California, USA",
    highlight: "Education + equipment ecosystem",
    verified: true,
  },
  {
    id: 5,
    name: "Merrithew",
    slug: "merrithew",
    description:
      "STOTT PILATES equipment and education. Known for reformers used in rehabilitation and professional studios worldwide.",
    logoEmoji: "\u{1F48E}",
    coverImageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=200&fit=crop",
    category: "equipment",
    rating: 4.8,
    productCount: 5,
    founded: "1988",
    origin: "Toronto, Canada",
    highlight: "Studio-grade rehabilitation equipment",
    verified: true,
  },
  {
    id: 6,
    name: "NutriFlow",
    slug: "nutriflow",
    description:
      "Plant-based nutrition designed for Pilates practitioners. Organic proteins, superfoods, and supplements for recovery and performance.",
    logoEmoji: "\u{1F957}",
    coverImageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=200&fit=crop",
    category: "nutrition",
    rating: 4.6,
    productCount: 5,
    founded: "2022",
    origin: "Paris, France",
    highlight: "Plant-based Pilates nutrition",
    verified: false,
  },
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user: USERS[6], sessions: 24, calories: 8400 },
  { rank: 2, user: USERS[0], sessions: 22, calories: 7920 },
  { rank: 3, user: USERS[2], sessions: 20, calories: 7200 },
  { rank: 4, user: USERS[1], sessions: 18, calories: 6480 },
  { rank: 5, user: USERS[4], sessions: 16, calories: 5760 },
];

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

export const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: "March Madness",
    description: "Complete 20 sessions this month",
    type: "monthly",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    target: 20,
    progress: 14,
    participants: 342,
    reward: "Gold Badge",
    icon: "\u{1F3C6}",
  },
  {
    id: 2,
    title: "Early Bird Week",
    description: "5 sessions before 9am this week",
    type: "weekly",
    startDate: "2026-03-16",
    endDate: "2026-03-22",
    target: 5,
    progress: 3,
    participants: 128,
    reward: "Early Bird Badge",
    icon: "\u{1F305}",
  },
  {
    id: 3,
    title: "Studio Explorer",
    description: "Visit 5 different studios this month",
    type: "monthly",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    target: 5,
    progress: 3,
    participants: 89,
    reward: "Explorer Badge",
    icon: "\u{1F5FA}\uFE0F",
  },
  {
    id: 4,
    title: "Reformer Master",
    description: "Complete 15 reformer classes",
    type: "monthly",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    target: 15,
    progress: 9,
    participants: 215,
    reward: "Reformer Badge",
    icon: "\u{1F4AA}",
  },
  {
    id: 5,
    title: "Calorie Torch",
    description: "Burn 5,000 calories this month",
    type: "monthly",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    target: 5000,
    progress: 3200,
    participants: 178,
    reward: "Fire Badge",
    icon: "\u{1F525}",
  },
];

export const BINGO_CARD: BingoCell[] = [
  { id: 1, text: "Morning class", completed: true },
  { id: 2, text: "Try a new studio", completed: true },
  { id: 3, text: "60min+ session", completed: false },
  { id: 4, text: "Invite a friend", completed: true },
  { id: 5, text: "Reformer class", completed: true },
  { id: 6, text: "Mat class", completed: false },
  { id: 7, text: "Weekend session", completed: true },
  { id: 8, text: "Log 3 days in a row", completed: true },
  { id: 9, text: "Burn 500+ cal", completed: false },
  { id: 10, text: "Try Cadillac", completed: false },
  { id: 11, text: "Post to feed", completed: true },
  { id: 12, text: "FREE", completed: true },
  { id: 13, text: "Evening class", completed: false },
  { id: 14, text: "5 sessions/week", completed: false },
  { id: 15, text: "New instructor", completed: true },
  { id: 16, text: "Join a Circle", completed: false },
];

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

export const STUDIO_CHECKINS: StudioCheckin[] = [
  {
    studioId: 1,
    userId: 1,
    userName: "Emma D",
    userInitials: "ED",
    userColor: "bg-rose-200",
    checkins: 24,
    lastVisit: "2d ago",
  },
  {
    studioId: 1,
    userId: 3,
    userName: "Sophie B",
    userInitials: "SB",
    userColor: "bg-green-200",
    checkins: 18,
    lastVisit: "1d ago",
  },
  {
    studioId: 1,
    userId: 5,
    userName: "Marie C",
    userInitials: "MC",
    userColor: "bg-purple-200",
    checkins: 12,
    lastVisit: "3d ago",
  },
  {
    studioId: 1,
    userId: 7,
    userName: "Isabelle F",
    userInitials: "IF",
    userColor: "bg-teal-200",
    checkins: 8,
    lastVisit: "1w ago",
  },
  {
    studioId: 2,
    userId: 2,
    userName: "Lucas M",
    userInitials: "LM",
    userColor: "bg-blue-200",
    checkins: 31,
    lastVisit: "1d ago",
  },
  {
    studioId: 2,
    userId: 4,
    userName: "Alex R",
    userInitials: "AR",
    userColor: "bg-yellow-200",
    checkins: 15,
    lastVisit: "4d ago",
  },
  {
    studioId: 2,
    userId: 6,
    userName: "Pierre T",
    userInitials: "PT",
    userColor: "bg-orange-200",
    checkins: 9,
    lastVisit: "2d ago",
  },
  {
    studioId: 3,
    userId: 8,
    userName: "Thomas G",
    userInitials: "TG",
    userColor: "bg-indigo-200",
    checkins: 22,
    lastVisit: "1d ago",
  },
  {
    studioId: 3,
    userId: 9,
    userName: "Léa N",
    userInitials: "LN",
    userColor: "bg-pink-200",
    checkins: 14,
    lastVisit: "3d ago",
  },
  {
    studioId: 3,
    userId: 10,
    userName: "Hugo P",
    userInitials: "HP",
    userColor: "bg-cyan-200",
    checkins: 7,
    lastVisit: "5d ago",
  },
];

export const CIRCLES: PilatesCircle[] = [
  {
    id: 1,
    name: "Morning Flow Crew",
    description: "Early birds who love 7am reformer sessions",
    emoji: "\u{1F305}",
    members: [USERS[0], USERS[2], USERS[4], USERS[6]],
    totalSessions: 124,
    totalCalories: 34200,
    isJoined: true,
  },
  {
    id: 2,
    name: "Marais Pilates Gang",
    description: "Studio Harmonie regulars and friends",
    emoji: "\u{1F5FC}",
    members: [USERS[1], USERS[3], USERS[5], USERS[7], USERS[9]],
    totalSessions: 89,
    totalCalories: 24500,
    isJoined: true,
  },
  {
    id: 3,
    name: "30-Day Challengers",
    description: "Committed to daily Pilates for 30 days straight",
    emoji: "\u{1F525}",
    members: [USERS[0], USERS[1], USERS[2], USERS[3], USERS[4], USERS[5]],
    totalSessions: 210,
    totalCalories: 58100,
    isJoined: false,
  },
  {
    id: 4,
    name: "Reformer Addicts",
    description: "We only do reformer. Period.",
    emoji: "\u{1F4AA}",
    members: [USERS[2], USERS[6], USERS[8]],
    totalSessions: 67,
    totalCalories: 18900,
    isJoined: false,
  },
  {
    id: 5,
    name: "Paris Pilates Moms",
    description: "Moms who Pilates together stay together",
    emoji: "\u{1F476}",
    members: [USERS[4], USERS[7], USERS[9]],
    totalSessions: 45,
    totalCalories: 12300,
    isJoined: false,
  },
];
