import React, { useState } from 'react';
import {
  MapPin, Home, Activity, LayoutDashboard, Users, ShoppingBag, User,
  Star, Clock, Navigation, Search, Filter, Heart, MessageCircle,
  Share2, Trophy, Flame, Calendar as CalendarIcon, Award, Medal, CheckCircle2,
  ThumbsUp, ThumbsDown, Plus, ShoppingCart, ChevronRight, X, Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// --- MOCK DATA ---
const STUDIOS = [
  { id: 1, name: "Studio Harmonie", neighborhood: "Marais", rating: 4.9, reviews: 234, price: 45, distance: 0.3, coords: { x: 30, y: 40 }, description: "A serene reformer studio nestled in the heart of Le Marais, offering both beginner and advanced classes with world-class equipment.", coaches: ["Sophie Leclerc", "Julien Moreau"] },
  { id: 2, name: "Pilates Lumière", neighborhood: "Saint-Germain", rating: 4.8, reviews: 189, price: 55, distance: 0.7, coords: { x: 45, y: 60 }, description: "Premium boutique studio with panoramic views of Saint-Germain-des-Prés. Specialising in Cadillac and Reformer work.", coaches: ["Marie Dubois", "Antoine Petit"] },
  { id: 3, name: "Core & Flow", neighborhood: "Montmartre", rating: 4.7, reviews: 312, price: 38, distance: 1.2, coords: { x: 60, y: 20 }, description: "Community-driven studio at the base of Montmartre. Affordable classes for all levels, with a welcoming and diverse atmosphere.", coaches: ["Camille Bernard", "Lucas Fontaine"] },
  { id: 4, name: "Reform Studio Paris", neighborhood: "Bastille", rating: 4.6, reviews: 156, price: 50, distance: 1.8, coords: { x: 75, y: 50 }, description: "Modern industrial-chic studio with the latest Balanced Body equipment. Strong focus on strength and technique.", coaches: ["Isabelle Dupont", "Marc Rousseau"] },
  { id: 5, name: "Équilibre Pilates", neighborhood: "Pigalle", rating: 4.5, reviews: 98, price: 42, distance: 2.1, coords: { x: 50, y: 30 }, description: "A hidden gem in Pigalle offering intimate group classes and private sessions. Specialises in mat and chair work.", coaches: ["Élise Martin", "Pierre Garnier"] },
  { id: 6, name: "Le Studio Reformer", neighborhood: "Oberkampf", rating: 4.4, reviews: 203, price: 35, distance: 2.5, coords: { x: 80, y: 70 }, description: "The most affordable reformer studio in Paris without sacrificing quality. Popular with young professionals in the 11th.", coaches: ["Nathalie Simon", "Florent Legrand"] },
  { id: 7, name: "Pilates Zen", neighborhood: "Nation", rating: 4.8, reviews: 127, price: 48, distance: 3.0, coords: { x: 90, y: 80 }, description: "Zen-inspired studio combining traditional Pilates with mindfulness practices. Unique breath-work integration.", coaches: ["Audrey Girard", "Thomas Chevalier"] },
  { id: 8, name: "BodyWork Pilates", neighborhood: "Châtelet", rating: 4.9, reviews: 445, price: 60, distance: 3.4, coords: { x: 40, y: 50 }, description: "The most acclaimed studio in Paris, trusted by professional dancers and athletes. Extensive class schedule all week.", coaches: ["Céline Blanc", "Raphaël Dumas"] },
];

const USERS = [
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

const POSTS = [
  { id: 1, user: USERS[0], type: "Reformer Advanced", studio: "Studio Harmonie", duration: 55, calories: 320, likes: 24, comments: 3, timeAgo: "2h ago", hasPhoto: true },
  { id: 2, user: USERS[1], type: "Mat Pilates Core", studio: "Core & Flow", duration: 45, calories: 250, likes: 12, comments: 1, timeAgo: "4h ago", hasPhoto: false },
  { id: 3, user: USERS[2], type: "Cadillac Intro", studio: "Pilates Lumière", duration: 60, calories: 290, likes: 45, comments: 8, timeAgo: "5h ago", hasPhoto: true },
  { id: 4, user: USERS[3], type: "Wunda Chair Blast", studio: "Reform Studio Paris", duration: 45, calories: 310, likes: 18, comments: 2, timeAgo: "8h ago", hasPhoto: false },
  { id: 5, user: USERS[4], type: "Reformer Flow", studio: "Équilibre Pilates", duration: 50, calories: 275, likes: 32, comments: 5, timeAgo: "1d ago", hasPhoto: true },
  { id: 6, user: USERS[5], type: "Spine Corrector", studio: "Studio Harmonie", duration: 40, calories: 200, likes: 9, comments: 0, timeAgo: "1d ago", hasPhoto: false },
  { id: 7, user: USERS[6], type: "Tower & Reformer", studio: "BodyWork Pilates", duration: 75, calories: 410, likes: 67, comments: 14, timeAgo: "2d ago", hasPhoto: true },
  { id: 8, user: USERS[7], type: "Mat Beginner", studio: "Core & Flow", duration: 50, calories: 220, likes: 5, comments: 1, timeAgo: "2d ago", hasPhoto: false },
  { id: 9, user: USERS[8], type: "Reformer Cardio", studio: "Pilates Zen", duration: 45, calories: 350, likes: 28, comments: 4, timeAgo: "3d ago", hasPhoto: true },
  { id: 10, user: USERS[9], type: "Classical Mat", studio: "Équilibre Pilates", duration: 60, calories: 240, likes: 14, comments: 3, timeAgo: "3d ago", hasPhoto: false },
];

const CALORIE_DATA = [
  { week: 'W1', calories: 1200 },
  { week: 'W2', calories: 1450 },
  { week: 'W3', calories: 1100 },
  { week: 'W4', calories: 1600 },
  { week: 'W5', calories: 1350 },
  { week: 'W6', calories: 1800 },
  { week: 'W7', calories: 1550 },
  { week: 'W8', calories: 1950 },
];

const BADGES = [
  { id: 1, name: "First Session", icon: <CheckCircle2 className="w-6 h-6" />, earned: true, description: "Completed your very first session!" },
  { id: 2, name: "7-Day Streak", icon: <Flame className="w-6 h-6" />, earned: true, description: "Practiced 7 days in a row." },
  { id: 3, name: "100 Sessions", icon: <Award className="w-6 h-6" />, earned: false, description: "Complete 100 total sessions." },
  { id: 4, name: "Calorie Crusher", icon: <Activity className="w-6 h-6" />, earned: true, description: "Burned over 10,000 calories total." },
  { id: 5, name: "Early Bird", icon: <Clock className="w-6 h-6" />, earned: true, description: "Attended 5 sessions before 8am." },
  { id: 6, name: "Social Butterfly", icon: <Users className="w-6 h-6" />, earned: false, description: "Reach 50 followers." },
];

const FORUM_POSTS = [
  { id: 1, title: "Best grip socks that actually last?", category: "Gear", author: USERS[0], flair: "Advanced", upvotes: 45, comments: 12, timeAgo: "3h ago" },
  { id: 2, title: "Lower back pain during hundred - form check?", category: "Technique", author: USERS[5], flair: "Beginner", upvotes: 32, comments: 28, timeAgo: "5h ago" },
  { id: 3, title: "Review: The new Align Pilates studio in Marais", category: "Studios", author: USERS[2], flair: "Intermediate", upvotes: 89, comments: 15, timeAgo: "1d ago" },
  { id: 4, title: "Pre-workout snack recommendations?", category: "Nutrition", author: USERS[7], flair: "Intermediate", upvotes: 24, comments: 19, timeAgo: "1d ago" },
  { id: 5, title: "Join my 30-day Mat Pilates Challenge!", category: "Challenges", author: USERS[4], flair: "Advanced", upvotes: 156, comments: 45, timeAgo: "2d ago" },
  { id: 6, title: "Reformer vs Mat: which burns more calories?", category: "Technique", author: USERS[1], flair: "Intermediate", upvotes: 67, comments: 33, timeAgo: "2d ago" },
  { id: 7, title: "Best studios in Paris for absolute beginners?", category: "Studios", author: USERS[9], flair: "Beginner", upvotes: 41, comments: 22, timeAgo: "3d ago" },
  { id: 8, title: "Protein intake for Pilates practitioners", category: "Nutrition", author: USERS[3], flair: "Advanced", upvotes: 29, comments: 11, timeAgo: "3d ago" },
  { id: 9, title: "Has anyone tried the Pilates ring for thighs?", category: "Gear", author: USERS[6], flair: "Beginner", upvotes: 18, comments: 7, timeAgo: "4d ago" },
  { id: 10, title: "Monthly challenge: 20 sessions in October!", category: "Challenges", author: USERS[8], flair: "Intermediate", upvotes: 92, comments: 58, timeAgo: "5d ago" },
];

const PRODUCTS = [
  { id: 1, name: "Pro Grip Socks", brand: "Align Pilates", price: 18, rating: 4.8, category: "Apparel", image: "bg-emerald-100" },
  { id: 2, name: "Premium Mat 5mm", brand: "Lululemon", price: 88, rating: 4.9, category: "Mats", image: "bg-stone-200" },
  { id: 3, name: "Resistance Band Set", brand: "Balanced Body", price: 25, rating: 4.7, category: "Bands", image: "bg-rose-100" },
  { id: 4, name: "Pilates Ring Pro", brand: "Merrithew", price: 35, rating: 4.6, category: "Accessories", image: "bg-blue-100" },
  { id: 5, name: "Align Leggings", brand: "Lululemon", price: 98, rating: 4.9, category: "Apparel", image: "bg-purple-100" },
  { id: 6, name: "Reformer Loops", brand: "Balanced Body", price: 42, rating: 4.8, category: "Accessories", image: "bg-orange-100" },
  { id: 7, name: "Travel Mat 1.5mm", brand: "BASI", price: 65, rating: 4.5, category: "Mats", image: "bg-teal-100" },
  { id: 8, name: "Core Ball 9\"", brand: "Merrithew", price: 15, rating: 4.7, category: "Accessories", image: "bg-yellow-100" },
  { id: 9, name: "Flow Bra", brand: "Lululemon", price: 68, rating: 4.8, category: "Apparel", image: "bg-pink-100" },
  { id: 10, name: "Spine Support Roller", brand: "BASI", price: 29, rating: 4.6, category: "Accessories", image: "bg-indigo-100" },
  { id: 11, name: "Heavy Resistance Bands", brand: "Balanced Body", price: 32, rating: 4.7, category: "Bands", image: "bg-red-100" },
  { id: 12, name: "Eco Cork Mat", brand: "Align Pilates", price: 75, rating: 4.9, category: "Mats", image: "bg-lime-100" },
  { id: 13, name: "Reformer Footbar Pad", brand: "Merrithew", price: 22, rating: 4.5, category: "Accessories", image: "bg-amber-100" },
  { id: 14, name: "Studio Tank Top", brand: "Lululemon", price: 48, rating: 4.8, category: "Apparel", image: "bg-cyan-100" },
  { id: 15, name: "Balance Pad", brand: "BASI", price: 38, rating: 4.6, category: "Accessories", image: "bg-violet-100" },
  { id: 16, name: "Mini Trampoline", brand: "Balanced Body", price: 120, rating: 4.7, category: "Accessories", image: "bg-fuchsia-100" },
  { id: 17, name: "Yoga Block 2-Pack", brand: "Align Pilates", price: 14, rating: 4.5, category: "Accessories", image: "bg-sky-100" },
  { id: 18, name: "Reformer Spring Set", brand: "Merrithew", price: 85, rating: 4.8, category: "Accessories", image: "bg-green-100" },
  { id: 19, name: "Moisture-Wick Shorts", brand: "Lululemon", price: 58, rating: 4.7, category: "Apparel", image: "bg-rose-200" },
  { id: 20, name: "Foam Roller Pro", brand: "BASI", price: 45, rating: 4.6, category: "Accessories", image: "bg-orange-200" },
];

const LEADERBOARD = [
  { rank: 1, user: USERS[2], sessions: 18, calories: 4800 },
  { rank: 2, user: USERS[4], sessions: 15, calories: 4100 },
  { rank: 3, user: USERS[0], sessions: 14, calories: 3900 },
  { rank: 4, user: USERS[7], sessions: 12, calories: 3400 },
  { rank: 5, user: USERS[6], sessions: 10, calories: 2900 },
];

// --- MAIN APP ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [cartItems, setCartItems] = useState<{ product: typeof PRODUCTS[0]; qty: number }[]>([]);

  const addToCart = (product: typeof PRODUCTS[0]) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.qty), 0);

  return (
    <div className="flex flex-col h-screen bg-[#FDFBF7] text-slate-800 font-sans mx-auto max-w-md shadow-2xl relative overflow-hidden sm:border-x sm:border-slate-200">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#7D9B76] flex items-center justify-center text-white">
            <Activity className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">PilatesHub</h1>
        </div>
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <button className="relative p-2 text-slate-500 hover:text-[#7D9B76] transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent className="bg-[#FDFBF7]">
              <SheetHeader>
                <SheetTitle className="text-lg font-bold">Your Cart</SheetTitle>
                <SheetDescription>{cartCount} item{cartCount !== 1 ? 's' : ''}</SheetDescription>
              </SheetHeader>
              <div className="py-6 flex flex-col gap-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center gap-3 text-slate-400">
                    <ShoppingCart className="w-10 h-10 opacity-40" />
                    <p className="text-sm font-medium">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    {cartItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <div className={`w-12 h-12 rounded-xl ${item.product.image} flex-shrink-0`} />
                        <div className="flex-1">
                          <p className="font-semibold text-sm leading-tight">{item.product.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.product.brand} · Qty: {item.qty}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <p className="font-bold text-[#7D9B76]">€{item.product.price * item.qty}</p>
                          <button onClick={() => removeFromCart(item.product.id)} className="text-slate-300 hover:text-rose-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total</span>
                      <span className="text-[#7D9B76]">€{cartTotal}</span>
                    </div>
                    <Button className="w-full mt-2 bg-[#7D9B76] hover:bg-[#6A8564] text-white font-bold shadow-lg">
                      Checkout
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <button
            onClick={() => setActiveTab('profile')}
            className="w-8 h-8 rounded-full bg-[#7D9B76] flex items-center justify-center text-white font-bold text-xs hover:ring-2 hover:ring-offset-2 hover:ring-[#7D9B76] transition-all"
          >
            SJ
          </button>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'home' && <MapPage />}
        {activeTab === 'feed' && <FeedPage />}
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'community' && <CommunityPage />}
        {activeTab === 'store' && <StorePage addToCart={addToCart} />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* BOTTOM NAV */}
      <nav className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-100 px-2 py-3 flex justify-around items-center z-40">
        {[
          { id: 'home', icon: MapPin, label: 'Map' },
          { id: 'feed', icon: Activity, label: 'Feed' },
          { id: 'dashboard', icon: LayoutDashboard, label: 'Stats' },
          { id: 'community', icon: Users, label: 'Forum' },
          { id: 'store', icon: ShoppingBag, label: 'Store' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${activeTab === tab.id ? 'text-[#7D9B76] bg-[#7D9B76]/8' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'stroke-[#7D9B76]' : ''}`} />
            <span className="text-[10px] font-semibold">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// --- MAP PAGE ---
function MapPage() {
  const [bookingSuccess, setBookingSuccess] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Mock Map */}
      <div className="relative h-64 bg-gradient-to-br from-slate-100 to-stone-100 overflow-hidden flex-shrink-0">
        <div
          className="absolute inset-0 opacity-25"
          style={{ backgroundImage: 'radial-gradient(#7D9B76 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }}
        />
        {/* Road lines */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-1/3 left-0 right-0 h-px bg-slate-500" />
          <div className="absolute top-2/3 left-0 right-0 h-px bg-slate-500" />
          <div className="absolute left-1/4 top-0 bottom-0 w-px bg-slate-500" />
          <div className="absolute left-3/4 top-0 bottom-0 w-px bg-slate-500" />
        </div>

        {/* Studio pins */}
        {STUDIOS.map(studio => (
          <Dialog key={studio.id}>
            <DialogTrigger asChild>
              <button
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10"
                style={{ left: `${studio.coords.x}%`, top: `${studio.coords.y}%` }}
                onClick={() => setBookingSuccess(null)}
              >
                <div className="bg-[#7D9B76] text-white p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform border-2 border-white">
                  <MapPin className="w-4 h-4 fill-white/30" />
                </div>
                <span className="mt-1 bg-white/95 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-slate-800">
                  €{studio.price}
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[360px] rounded-2xl p-0 overflow-hidden border-none shadow-xl">
              <div className="h-44 bg-gradient-to-br from-[#7D9B76]/20 to-stone-200 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#7D9B76 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                <div className="text-center z-10">
                  <div className="w-16 h-16 bg-[#7D9B76]/15 rounded-full flex items-center justify-center mx-auto mb-2 border border-[#7D9B76]/20">
                    <Home className="w-8 h-8 text-[#7D9B76]" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{studio.neighborhood}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-slate-800 leading-tight">{studio.name}</h2>
                  <Badge className="bg-[#F5F0E8] text-[#7D9B76] font-bold border-none ml-2 flex-shrink-0">€{studio.price}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  <span className="font-semibold text-slate-700">{studio.rating}</span>
                  <span>· {studio.reviews} reviews · {studio.distance}km</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{studio.description}</p>

                <div className="mb-4">
                  <h3 className="font-bold text-sm text-slate-700 mb-2">Coaches</h3>
                  <div className="flex gap-2">
                    {studio.coaches.map(coach => (
                      <span key={coach} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">{coach}</span>
                    ))}
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-700 mb-2">Available Today</h3>
                <div className="flex gap-2 mb-5 flex-wrap">
                  {['09:00', '11:30', '14:00', '17:00', '19:30'].map(time => (
                    <Badge key={time} variant="outline" className="px-3 py-1 cursor-pointer hover:bg-[#7D9B76] hover:text-white hover:border-[#7D9B76] transition-colors font-medium">
                      {time}
                    </Badge>
                  ))}
                </div>

                {bookingSuccess === studio.id ? (
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white gap-2 font-bold" disabled>
                    <CheckCircle2 className="w-5 h-5" /> Booked Successfully!
                  </Button>
                ) : (
                  <Button
                    onClick={() => setBookingSuccess(studio.id)}
                    className="w-full bg-[#7D9B76] hover:bg-[#6A8564] text-white font-bold shadow-sm"
                  >
                    Book a Session
                  </Button>
                )}

                <Separator className="my-4" />
                <h3 className="font-bold text-sm text-slate-700 mb-3">Reviews</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { user: "Emma D.", rating: 5, text: "Absolutely love this studio! The instructors are top-notch." },
                    { user: "Lucas M.", rating: 4, text: "Great equipment and atmosphere. A bit pricey but worth it." },
                  ].map((review, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-500">
                        {review.user[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-slate-700">{review.user}</span>
                          <div className="flex">
                            {Array.from({ length: review.rating }).map((_, j) => (
                              <Star key={j} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{review.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}

        {/* Filter bar */}
        <div className="absolute top-3 left-3 right-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {['Filters', 'Reformer', 'Mat', 'Beginner', 'Advanced', 'Near Me'].map((tag, i) => (
            <Badge
              key={tag}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer shadow-sm transition-colors font-semibold text-xs border flex-shrink-0 flex items-center gap-1 ${i === 0 ? 'bg-white text-slate-700 border-slate-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-[#7D9B76] hover:text-white hover:border-[#7D9B76]'}`}
            >
              {i === 0 && <Filter className="w-3 h-3" />}
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Studio List */}
      <div className="p-4 flex-1 bg-[#FDFBF7]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Nearby Studios</h2>
          <span className="text-xs text-slate-400 font-medium">{STUDIOS.length} found</span>
        </div>
        <div className="flex flex-col gap-3">
          {STUDIOS.map(studio => (
            <Dialog key={studio.id}>
              <DialogTrigger asChild>
                <Card className="border border-slate-100 shadow-sm hover:shadow-md hover:border-[#7D9B76]/30 transition-all cursor-pointer overflow-hidden group">
                  <div className="flex h-24">
                    <div className="w-24 bg-gradient-to-br from-[#F5F0E8] to-stone-100 flex items-center justify-center flex-shrink-0">
                      <Home className="w-7 h-7 text-[#7D9B76]/40 group-hover:text-[#7D9B76]/70 group-hover:scale-110 transition-all" />
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-sm leading-tight text-slate-800">{studio.name}</h3>
                          <span className="font-bold text-[#7D9B76] text-sm flex-shrink-0 ml-2">€{studio.price}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{studio.neighborhood} · {studio.distance}km</p>
                      </div>
                      <div className="flex items-center text-xs font-semibold text-slate-600 gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        {studio.rating}
                        <span className="text-slate-400 font-normal">({studio.reviews})</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-[360px] rounded-2xl p-0 overflow-hidden border-none shadow-xl">
                <div className="h-44 bg-gradient-to-br from-[#7D9B76]/20 to-stone-200 flex items-center justify-center relative">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#7D9B76]/15 rounded-full flex items-center justify-center mx-auto mb-2 border border-[#7D9B76]/20">
                      <Home className="w-8 h-8 text-[#7D9B76]" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{studio.neighborhood}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-slate-800">{studio.name}</h2>
                    <Badge className="bg-[#F5F0E8] text-[#7D9B76] font-bold border-none">€{studio.price}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-slate-700">{studio.rating}</span>
                    <span>· {studio.reviews} reviews · {studio.distance}km</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{studio.description}</p>
                  <h3 className="font-bold text-sm mb-2">Available Today</h3>
                  <div className="flex gap-2 mb-5 flex-wrap">
                    {['09:00', '11:30', '14:00', '17:00', '19:30'].map(time => (
                      <Badge key={time} variant="outline" className="px-3 py-1 cursor-pointer hover:bg-[#7D9B76] hover:text-white hover:border-[#7D9B76] transition-colors">
                        {time}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full bg-[#7D9B76] hover:bg-[#6A8564] text-white font-bold">
                    Book a Session
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- FEED PAGE ---
function FeedPage() {
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [following, setFollowing] = useState<Record<number, boolean>>({});

  const toggleLike = (id: number) => setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleFollow = (id: number) => setFollowing(prev => ({ ...prev, [id]: !prev[id] }));

  const photoColors = ['bg-gradient-to-br from-[#7D9B76]/30 to-stone-200', 'bg-gradient-to-br from-rose-100 to-pink-200', 'bg-gradient-to-br from-blue-100 to-indigo-200', 'bg-gradient-to-br from-amber-100 to-orange-200', 'bg-gradient-to-br from-purple-100 to-violet-200'];

  return (
    <div className="flex flex-col bg-slate-50 min-h-full animate-in fade-in duration-300">
      {/* Share bar */}
      <div className="px-4 py-3 bg-white sticky top-0 z-10 shadow-sm">
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-full flex items-center gap-3 bg-[#F5F0E8] rounded-2xl px-4 py-3 text-left hover:bg-[#eDe8e0] transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#7D9B76] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">SJ</div>
              <span className="text-sm text-slate-500 font-medium">Share your session today...</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-[340px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-bold">Log a Session</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-3">
              <Input placeholder="Session type (e.g. Reformer Flow)" className="bg-slate-50 border-slate-200" />
              <Input placeholder="Studio or Home" className="bg-slate-50 border-slate-200" />
              <div className="flex gap-2">
                <Input placeholder="Duration (min)" type="number" className="bg-slate-50 border-slate-200" />
                <Input placeholder="Calories" type="number" className="bg-slate-50 border-slate-200" />
              </div>
              <Button className="w-full bg-[#7D9B76] hover:bg-[#6A8564] text-white font-bold mt-1">
                Share Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-4 flex flex-col gap-5">
        {POSTS.map((post, idx) => (
          <Card key={post.id} className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-4 pb-3 flex flex-row items-start gap-3">
              <Avatar className={`w-10 h-10 flex-shrink-0 ${post.user.color} border-2 border-white shadow-sm`}>
                <AvatarFallback className="text-slate-700 font-bold text-sm">{post.user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-800 truncate">{post.user.name}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400">{post.timeAgo}</span>
                    <button
                      onClick={() => toggleFollow(post.user.id)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors border ${following[post.user.id] ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-[#7D9B76]/10 text-[#7D9B76] border-[#7D9B76]/20 hover:bg-[#7D9B76]/20'}`}
                    >
                      {following[post.user.id] ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">completed <span className="font-semibold text-slate-600">{post.type}</span> at {post.studio}</p>
              </div>
            </CardHeader>

            {post.hasPhoto && (
              <div className={`h-44 mx-4 rounded-xl mb-3 flex items-center justify-center ${photoColors[idx % photoColors.length]}`}>
                <div className="text-center opacity-60">
                  <Activity className="w-8 h-8 mx-auto text-[#7D9B76]" />
                  <p className="text-xs mt-1 text-slate-500 font-medium">Session Photo</p>
                </div>
              </div>
            )}

            <CardContent className="px-4 pb-3">
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5 bg-[#F5F0E8] px-3 py-2 rounded-xl text-sm text-[#7D9B76] font-semibold">
                  <Clock className="w-4 h-4 flex-shrink-0" /> {post.duration} min
                </div>
                <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-2 rounded-xl text-sm text-orange-600 font-semibold">
                  <Flame className="w-4 h-4 flex-shrink-0" /> {post.calories} cal
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-4 py-3 border-t border-slate-50 flex justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-all ${likedPosts[post.id] ? 'text-rose-500' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <Heart className={`w-5 h-5 transition-transform ${likedPosts[post.id] ? 'fill-rose-500 scale-110' : ''}`} />
                  {post.likes + (likedPosts[post.id] ? 1 : 0)}
                </button>
                <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-700">
                  <MessageCircle className="w-5 h-5" /> {post.comments}
                </button>
              </div>
              <button className="text-slate-300 hover:text-slate-500 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </CardFooter>
          </Card>
        ))}

        {/* Leaderboard widget */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> This Week's Leaders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 flex flex-col gap-3">
            {LEADERBOARD.map(entry => (
              <div key={entry.rank} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0
                  ${entry.rank === 1 ? 'bg-amber-400 text-white' : entry.rank === 2 ? 'bg-slate-300 text-slate-700' : entry.rank === 3 ? 'bg-orange-300 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {entry.rank}
                </span>
                <Avatar className={`w-8 h-8 ${entry.user.color} flex-shrink-0`}>
                  <AvatarFallback className="text-slate-700 font-bold text-xs">{entry.user.initials}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-semibold text-slate-700">{entry.user.name}</span>
                <div className="text-right">
                  <p className="text-xs font-bold text-orange-500">{entry.calories.toLocaleString()} cal</p>
                  <p className="text-[10px] text-slate-400">{entry.sessions} sessions</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- DASHBOARD PAGE ---
function DashboardPage() {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const completedDays = [true, true, true, true, false, true, false];

  return (
    <div className="p-4 flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-[#7D9B76] text-white border-none shadow-md">
          <CardContent className="p-4 flex flex-col items-center text-center gap-1">
            <Trophy className="w-5 h-5 opacity-80 mb-0.5" />
            <div className="text-2xl font-black">47</div>
            <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold">Sessions</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-500 text-white border-none shadow-md">
          <CardContent className="p-4 flex flex-col items-center text-center gap-1">
            <Flame className="w-5 h-5 opacity-80 mb-0.5" />
            <div className="text-2xl font-black">12.4k</div>
            <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold">Calories</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500 text-white border-none shadow-md">
          <CardContent className="p-4 flex flex-col items-center text-center gap-1">
            <Activity className="w-5 h-5 opacity-80 mb-0.5" />
            <div className="text-2xl font-black">12</div>
            <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly calendar */}
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
            <CalendarIcon className="w-4 h-4 text-[#7D9B76]" /> This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex justify-between">
            {weekDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400">{day}</span>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${completedDays[i]
                    ? 'bg-[#7D9B76] text-white shadow-sm'
                    : i === 4
                      ? 'border-2 border-[#7D9B76] text-[#7D9B76] bg-white'
                      : 'bg-slate-100 text-slate-400'}`}>
                  {completedDays[i] ? <CheckCircle2 className="w-4 h-4" /> : day}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calories chart */}
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 pb-1">
          <CardTitle className="text-sm font-bold text-slate-700">Calories Burned (8 Weeks)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-44 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CALORIE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(125,155,118,0.08)', radius: 6 }}
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
              />
              <Bar dataKey="calories" fill="#7D9B76" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-700">Badges</CardTitle>
          <span className="text-[#7D9B76] text-xs font-bold uppercase tracking-wider">
            {BADGES.filter(b => b.earned).length}/{BADGES.length} Earned
          </span>
        </CardHeader>
        <CardContent className="p-4 pt-2 grid grid-cols-3 gap-4">
          {BADGES.map(badge => (
            <div key={badge.id} className="flex flex-col items-center text-center gap-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all
                ${badge.earned
                  ? 'bg-gradient-to-br from-[#F5F0E8] to-[#eDe8e0] text-[#7D9B76] shadow-[#7D9B76]/10'
                  : 'bg-slate-100 text-slate-300 opacity-60'}`}>
                {badge.icon}
              </div>
              <span className={`text-[10px] font-bold leading-tight ${badge.earned ? 'text-slate-700' : 'text-slate-400'}`}>
                {badge.name}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming sessions */}
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold text-slate-700">Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex flex-col gap-3">
          {[
            { date: 'Oct 24', studio: 'Core & Flow', type: 'Advanced Cadillac', time: '09:00' },
            { date: 'Oct 26', studio: 'Studio Harmonie', type: 'Reformer Flow', time: '17:00' },
            { date: 'Oct 29', studio: 'Pilates Lumière', type: 'Mat Pilates', time: '11:30' },
          ].map((session, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="bg-[#7D9B76]/10 rounded-lg p-2 text-center min-w-[44px]">
                <p className="text-[9px] font-bold text-[#7D9B76] uppercase">{session.date.split(' ')[0]}</p>
                <p className="text-base font-black text-[#7D9B76]">{session.date.split(' ')[1]}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 leading-tight">{session.type}</p>
                <p className="text-xs text-slate-500 mt-0.5">{session.studio} · {session.time}</p>
              </div>
              <Clock className="w-4 h-4 text-slate-300" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Friends leaderboard */}
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Friends Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex flex-col gap-2">
          {LEADERBOARD.map(entry => (
            <div key={entry.rank} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black
                ${entry.rank === 1 ? 'bg-amber-400 text-white' : entry.rank === 2 ? 'bg-slate-300 text-slate-700' : entry.rank === 3 ? 'bg-orange-300 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {entry.rank}
              </span>
              <Avatar className={`w-8 h-8 ${entry.user.color}`}>
                <AvatarFallback className="text-slate-700 font-bold text-xs">{entry.user.initials}</AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm font-semibold text-slate-700">{entry.user.name}</span>
              <span className="text-xs font-bold text-slate-500">{entry.sessions} sessions</span>
            </div>
          ))}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#7D9B76]/8 border border-[#7D9B76]/20 mt-1">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black bg-[#7D9B76] text-white">6</span>
            <Avatar className="w-8 h-8 bg-[#7D9B76]/20">
              <AvatarFallback className="text-[#7D9B76] font-bold text-xs">SJ</AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm font-bold text-[#7D9B76]">You</span>
            <span className="text-xs font-bold text-[#7D9B76]">8 sessions</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- COMMUNITY PAGE ---
function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [votes, setVotes] = useState<Record<number, 'up' | 'down' | null>>({});

  const toggleVote = (id: number, dir: 'up' | 'down') => {
    setVotes(prev => ({ ...prev, [id]: prev[id] === dir ? null : dir }));
  };

  const filteredPosts = activeCategory === 'All' ? FORUM_POSTS : FORUM_POSTS.filter(p => p.category === activeCategory);

  const flairColors: Record<string, string> = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-blue-100 text-blue-700',
    Advanced: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="flex flex-col h-full bg-[#FDFBF7] animate-in fade-in duration-300 relative">
      {/* Category tabs */}
      <div className="px-4 py-3 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {['All', 'Technique', 'Nutrition', 'Studios', 'Gear', 'Challenges'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-bold transition-colors flex-shrink-0
                ${activeCategory === cat ? 'bg-[#7D9B76] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 pb-24">
        {filteredPosts.map(post => (
          <Card key={post.id} className="border border-slate-100 shadow-sm hover:border-[#7D9B76]/30 transition-colors cursor-pointer bg-white">
            <CardContent className="p-4 flex gap-3">
              {/* Vote column */}
              <div className="flex flex-col items-center gap-1 min-w-[36px]">
                <button
                  onClick={() => toggleVote(post.id, 'up')}
                  className={`p-1 rounded-lg transition-colors ${votes[post.id] === 'up' ? 'text-orange-500 bg-orange-50' : 'text-slate-300 hover:text-orange-400 hover:bg-orange-50'}`}
                >
                  <ChevronRight className="w-5 h-5 -rotate-90" />
                </button>
                <span className={`font-black text-sm ${votes[post.id] === 'up' ? 'text-orange-500' : votes[post.id] === 'down' ? 'text-indigo-500' : 'text-slate-600'}`}>
                  {post.upvotes + (votes[post.id] === 'up' ? 1 : votes[post.id] === 'down' ? -1 : 0)}
                </span>
                <button
                  onClick={() => toggleVote(post.id, 'down')}
                  className={`p-1 rounded-lg transition-colors ${votes[post.id] === 'down' ? 'text-indigo-500 bg-indigo-50' : 'text-slate-300 hover:text-indigo-400 hover:bg-indigo-50'}`}
                >
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </button>
              </div>
              {/* Post content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge className={`text-[10px] h-5 px-1.5 border border-[#7D9B76]/20 bg-[#7D9B76]/8 text-[#7D9B76] font-bold`}>
                    {post.category}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-medium">{post.timeAgo}</span>
                </div>
                <h3 className="font-bold text-slate-800 leading-snug mb-2 text-sm">{post.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Avatar className={`w-5 h-5 ${post.author.color}`}>
                      <AvatarFallback className="text-[8px] font-bold text-slate-700">{post.author.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold text-slate-600">{post.author.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${flairColors[post.flair] || 'bg-slate-100 text-slate-500'}`}>
                      {post.flair}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                    <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAB */}
      <Dialog>
        <DialogTrigger asChild>
          <button className="absolute bottom-20 right-4 w-14 h-14 bg-[#7D9B76] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#6A8564] hover:scale-105 transition-all z-20">
            <Plus className="w-6 h-6" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-[340px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold">New Discussion</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <Input placeholder="Post title..." className="font-semibold bg-slate-50 border-slate-200" />
            <select className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7D9B76]/30">
              <option value="" disabled>Select a category</option>
              <option>Technique</option>
              <option>Nutrition</option>
              <option>Studios</option>
              <option>Gear</option>
              <option>Challenges</option>
            </select>
            <textarea
              className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7D9B76]/30 resize-none"
              placeholder="What's on your mind?"
            />
            <Button className="w-full bg-[#7D9B76] hover:bg-[#6A8564] text-white font-bold">
              Post to Community
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- STORE PAGE ---
function StorePage({ addToCart }: { addToCart: (p: typeof PRODUCTS[0]) => void }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  const toggleWishlist = (id: number) => {
    setWishlist(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredProducts = activeCategory === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="bg-slate-50 min-h-full animate-in fade-in duration-300">
      {/* Category filter */}
      <div className="px-4 py-3 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {['All', 'Apparel', 'Mats', 'Accessories', 'Bands'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-bold transition-colors flex-shrink-0
                ${activeCategory === cat ? 'bg-[#7D9B76] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        {filteredProducts.map(product => (
          <Card key={product.id} className="border-none shadow-sm overflow-hidden flex flex-col bg-white group">
            <div className={`h-36 ${product.image} flex items-center justify-center relative`}>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${wishlist.has(product.id) ? 'bg-rose-50 text-rose-500' : 'bg-white/70 backdrop-blur text-slate-400 hover:text-rose-400'}`}
              >
                <Heart className={`w-4 h-4 ${wishlist.has(product.id) ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
            <CardContent className="p-3 flex-1 flex flex-col">
              <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">{product.brand}</p>
              <h3 className="font-bold text-sm text-slate-800 leading-tight mb-1 line-clamp-2">{product.name}</h3>
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-[11px] font-bold text-slate-500">{product.rating}</span>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-black text-base text-[#7D9B76]">€{product.price}</span>
                <Button
                  onClick={() => addToCart(product)}
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-700 text-white font-bold text-xs px-3 h-8 active:scale-95 transition-transform"
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// --- PROFILE PAGE ---
function ProfilePage() {
  return (
    <div className="bg-[#FDFBF7] min-h-full animate-in fade-in duration-300 pb-10">
      {/* Profile header */}
      <div className="bg-white px-6 py-8 flex flex-col items-center border-b border-slate-100 relative">
        <button className="absolute top-4 right-4 text-xs font-bold text-[#7D9B76] bg-[#7D9B76]/10 px-4 py-2 rounded-full hover:bg-[#7D9B76]/20 transition-colors">
          Edit Profile
        </button>
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7D9B76] to-[#A3BCA0] text-white flex items-center justify-center text-3xl font-black shadow-lg border-4 border-white mb-4">
          SJ
        </div>
        <h2 className="text-2xl font-black text-slate-800">Sarah Johnson</h2>
        <Badge className="mt-2 bg-[#F5F0E8] text-[#7D9B76] font-bold px-3 py-1 border-none">
          Advanced Level
        </Badge>
        <p className="text-center text-sm text-slate-500 mt-3 max-w-xs leading-relaxed">
          Pilates enthusiast since 2019 · Paris, France · Reformer addict
        </p>

        <div className="flex gap-8 mt-6 w-full justify-center border-t border-slate-100 pt-5">
          {[
            { value: '47', label: 'Sessions' },
            { value: '23', label: 'Followers' },
            { value: '31', label: 'Following' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-black text-slate-800">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <Tabs defaultValue="activity">
          <TabsList className="w-full grid grid-cols-3 bg-slate-100 p-1 rounded-xl h-10">
            <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#7D9B76] data-[state=active]:shadow-sm font-bold text-xs">Activity</TabsTrigger>
            <TabsTrigger value="badges" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#7D9B76] data-[state=active]:shadow-sm font-bold text-xs">Badges</TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#7D9B76] data-[state=active]:shadow-sm font-bold text-xs">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-4 flex flex-col gap-3">
            {[
              { type: 'Reformer Flow', studio: 'Studio Harmonie', date: 'Oct 12', cal: 320, min: 55 },
              { type: 'Cadillac Intro', studio: 'Pilates Lumière', date: 'Oct 10', cal: 290, min: 60 },
              { type: 'Mat Pilates Core', studio: 'Core & Flow', date: 'Oct 8', cal: 250, min: 45 },
              { type: 'Reformer Advanced', studio: 'Studio Harmonie', date: 'Oct 6', cal: 340, min: 55 },
              { type: 'Tower & Reformer', studio: 'BodyWork Pilates', date: 'Oct 3', cal: 410, min: 75 },
            ].map((session, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#7D9B76]/10 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-[#7D9B76]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-800 truncate">{session.type}</h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{session.date} · {session.studio}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-orange-500 text-sm">{session.cal} cal</div>
                  <div className="text-xs text-slate-400 font-medium">{session.min} min</div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="badges" className="mt-4 grid grid-cols-2 gap-3">
            {BADGES.map(badge => (
              <div key={badge.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-2">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center
                  ${badge.earned
                    ? 'bg-gradient-to-br from-[#F5F0E8] to-[#eDe8e0] text-[#7D9B76]'
                    : 'bg-slate-100 text-slate-300 opacity-60'}`}>
                  {badge.icon}
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${badge.earned ? 'text-slate-800' : 'text-slate-400'}`}>{badge.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {badge.earned ? 'Earned ✓' : badge.description}
                  </p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="bookings" className="mt-4 flex flex-col gap-3">
            {/* Upcoming */}
            {[
              { type: 'Advanced Cadillac', studio: 'Core & Flow', area: 'Montmartre', date: 'Oct 24', time: '09:00', status: 'upcoming' },
              { type: 'Reformer Flow', studio: 'Studio Harmonie', area: 'Marais', date: 'Oct 26', time: '17:00', status: 'upcoming' },
              { type: 'Mat Pilates', studio: 'Pilates Lumière', area: 'Saint-Germain', date: 'Oct 29', time: '11:30', status: 'upcoming' },
            ].map((booking, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-[#7D9B76] border-y border-r border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Badge className="mb-2 text-[#7D9B76] border-[#7D9B76]/30 bg-[#7D9B76]/5 font-bold text-xs border">Upcoming</Badge>
                    <h4 className="font-bold text-sm text-slate-800">{booking.type}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{booking.studio} · {booking.area}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center min-w-[52px]">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">{booking.date.split(' ')[0]}</p>
                    <p className="text-lg font-black text-slate-800">{booking.date.split(' ')[1]}</p>
                    <p className="text-[9px] text-slate-400">{booking.time}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 font-bold h-8 text-xs">Reschedule</Button>
                  <Button variant="outline" size="sm" className="flex-1 text-rose-500 hover:text-rose-600 font-bold h-8 text-xs border-slate-200">Cancel</Button>
                </div>
              </div>
            ))}

            {/* Past */}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2 px-1">Past Sessions</p>
            {[
              { type: 'Reformer Advanced', studio: 'Studio Harmonie', date: 'Oct 12', time: '17:00' },
              { type: 'Mat Pilates Core', studio: 'Core & Flow', date: 'Oct 8', time: '11:30' },
            ].map((booking, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 opacity-60">
                <CheckCircle2 className="w-5 h-5 text-[#7D9B76] flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-700">{booking.type}</p>
                  <p className="text-xs text-slate-400 font-medium">{booking.studio} · {booking.date} · {booking.time}</p>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
