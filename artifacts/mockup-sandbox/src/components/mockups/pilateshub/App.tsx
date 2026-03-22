import React, { useState } from 'react';
import { 
  MapPin, Home, Activity, LayoutDashboard, Users, ShoppingBag, User, 
  Star, Clock, Navigation, Search, Filter, Heart, MessageCircle, 
  Share2, Trophy, Flame, Calendar as CalendarIcon, Award, Medal, CheckCircle2, 
  ThumbsUp, ThumbsDown, Plus, ShoppingCart, ChevronRight, X, Info 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// UI Components
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
  { id: 1, name: "Studio Harmonie", neighborhood: "Marais", rating: 4.9, reviews: 234, price: 45, distance: 0.3, coords: { x: 30, y: 40 } },
  { id: 2, name: "Pilates Lumière", neighborhood: "Saint-Germain", rating: 4.8, reviews: 189, price: 55, distance: 0.7, coords: { x: 45, y: 60 } },
  { id: 3, name: "Core & Flow", neighborhood: "Montmartre", rating: 4.7, reviews: 312, price: 38, distance: 1.2, coords: { x: 60, y: 20 } },
  { id: 4, name: "Reform Studio Paris", neighborhood: "Bastille", rating: 4.6, reviews: 156, price: 50, distance: 1.8, coords: { x: 75, y: 50 } },
  { id: 5, name: "Équilibre Pilates", neighborhood: "Pigalle", rating: 4.5, reviews: 98, price: 42, distance: 2.1, coords: { x: 50, y: 30 } },
  { id: 6, name: "Le Studio Reformer", neighborhood: "Oberkampf", rating: 4.4, reviews: 203, price: 35, distance: 2.5, coords: { x: 80, y: 70 } },
  { id: 7, name: "Pilates Zen", neighborhood: "Nation", rating: 4.8, reviews: 127, price: 48, distance: 3.0, coords: { x: 90, y: 80 } },
  { id: 8, name: "BodyWork Pilates", neighborhood: "Châtelet", rating: 4.9, reviews: 445, price: 60, distance: 3.4, coords: { x: 40, y: 50 } },
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
  { id: 1, name: "First Session", icon: <CheckCircle2 className="w-6 h-6" />, earned: true },
  { id: 2, name: "7-Day Streak", icon: <Flame className="w-6 h-6" />, earned: true },
  { id: 3, name: "100 Sessions", icon: <Award className="w-6 h-6" />, earned: false },
  { id: 4, name: "Calorie Crusher", icon: <Activity className="w-6 h-6" />, earned: true },
  { id: 5, name: "Early Bird", icon: <Clock className="w-6 h-6" />, earned: true },
  { id: 6, name: "Social Butterfly", icon: <Users className="w-6 h-6" />, earned: false },
];

const FORUM_POSTS = [
  { id: 1, title: "Best grip socks that actually last?", category: "Gear", author: USERS[0], flair: "Advanced", upvotes: 45, comments: 12, timeAgo: "3h ago" },
  { id: 2, title: "Lower back pain during hundred - form check?", category: "Technique", author: USERS[5], flair: "Beginner", upvotes: 32, comments: 28, timeAgo: "5h ago" },
  { id: 3, title: "Review: The new Align Pilates studio in Marais", category: "Studios", author: USERS[2], flair: "Intermediate", upvotes: 89, comments: 15, timeAgo: "1d ago" },
  { id: 4, title: "Pre-workout snack recommendations?", category: "Nutrition", author: USERS[7], flair: "Intermediate", upvotes: 24, comments: 19, timeAgo: "1d ago" },
  { id: 5, title: "Join my 30-day Mat Pilates Challenge!", category: "Challenges", author: USERS[4], flair: "Advanced", upvotes: 156, comments: 45, timeAgo: "2d ago" },
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
];

// --- APP COMPONENT ---
export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [cartItems, setCartItems] = useState<{product: any, qty: number}[]>([]);

  const addToCart = (product: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

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
                  <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent className="bg-[#FDFBF7]">
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
              </SheetHeader>
              <div className="py-6 flex flex-col gap-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">Your cart is empty</div>
                ) : (
                  <>
                    {cartItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-md ${item.product.image}`} />
                          <div>
                            <p className="font-medium text-sm">{item.product.name}</p>
                            <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-[#7D9B76]">€{item.product.price * item.qty}</p>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total</span>
                      <span>€{cartItems.reduce((acc, item) => acc + (item.product.price * item.qty), 0)}</span>
                    </div>
                    <Button className="w-full mt-4 bg-[#7D9B76] hover:bg-[#6A8564]">Checkout</Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-full bg-[#7D9B76] flex items-center justify-center text-white font-medium text-sm overflow-hidden hover:ring-2 hover:ring-offset-2 hover:ring-[#7D9B76] transition-all">
            SJ
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'home' && <MapPage />}
        {activeTab === 'feed' && <FeedPage />}
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'community' && <CommunityPage />}
        {activeTab === 'store' && <StorePage addToCart={addToCart} />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center pb-safe z-40">
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
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-[#7D9B76]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'fill-[#7D9B76]/10' : ''}`} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// --- SUB-PAGES ---

function MapPage() {
  const [selectedStudio, setSelectedStudio] = useState<any>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Map Area */}
      <div className="relative h-64 bg-slate-100 overflow-hidden">
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#7D9B76 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        {STUDIOS.map(studio => (
          <Dialog key={studio.id}>
            <DialogTrigger asChild>
              <button 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
                style={{ left: `${studio.coords.x}%`, top: `${studio.coords.y}%` }}
              >
                <div className="bg-[#7D9B76] text-white p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 fill-white/20" />
                </div>
                <span className="mt-1 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  €{studio.price}
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[360px] rounded-2xl p-0 overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-500">
                Photo 1
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold">{studio.name}</h2>
                  <Badge variant="secondary" className="bg-[#F5F0E8] text-[#7D9B76] font-bold">€{studio.price}</Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                  <span className="flex items-center"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1"/> {studio.rating}</span>
                  <span>•</span>
                  <span>{studio.reviews} reviews</span>
                  <span>•</span>
                  <span>{studio.distance}km</span>
                </div>
                
                <h3 className="font-semibold text-sm mb-2">Available Slots</h3>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {['09:00', '12:30', '17:00', '18:30'].map(time => (
                    <Badge key={time} variant="outline" className="px-3 py-1 cursor-pointer hover:bg-[#7D9B76] hover:text-white transition-colors">
                      {time}
                    </Badge>
                  ))}
                </div>

                {bookingSuccess ? (
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white gap-2" disabled>
                    <CheckCircle2 className="w-5 h-5" /> Booked Successfully
                  </Button>
                ) : (
                  <Button onClick={() => setBookingSuccess(true)} className="w-full bg-[#7D9B76] hover:bg-[#6A8564] text-white">
                    Book Session
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}

        <div className="absolute top-4 left-4 right-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Badge className="bg-white text-slate-700 shadow-sm border border-slate-200 px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer">
            <Filter className="w-3 h-3" /> Filters
          </Badge>
          <Badge className="bg-white text-slate-700 shadow-sm border border-slate-200 px-3 py-1.5 rounded-full cursor-pointer">
            Reformer
          </Badge>
          <Badge className="bg-white text-slate-700 shadow-sm border border-slate-200 px-3 py-1.5 rounded-full cursor-pointer">
            Mat
          </Badge>
          <Badge className="bg-white text-slate-700 shadow-sm border border-slate-200 px-3 py-1.5 rounded-full cursor-pointer">
            Beginner
          </Badge>
        </div>
      </div>

      {/* List Area */}
      <div className="p-5 flex-1 bg-[#FDFBF7]">
        <h2 className="text-lg font-bold mb-4">Nearby Studios</h2>
        <div className="flex flex-col gap-4">
          {STUDIOS.slice(0, 4).map(studio => (
            <Card key={studio.id} className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group">
              <div className="flex h-28">
                <div className="w-28 bg-gradient-to-br from-slate-200 to-[#F5F0E8] flex items-center justify-center">
                  <Home className="w-8 h-8 text-slate-400 opacity-50 group-hover:scale-110 transition-transform" />
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm leading-tight">{studio.name}</h3>
                      <span className="font-semibold text-[#7D9B76] text-sm">€{studio.price}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{studio.neighborhood} • {studio.distance}km</p>
                  </div>
                  <div className="flex items-center text-xs font-medium text-slate-600">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 mr-1"/>
                    {studio.rating} ({studio.reviews})
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeedPage() {
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});

  const toggleLike = (id: number) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-full pb-6 animate-in fade-in duration-300">
      <div className="p-4 bg-white sticky top-0 z-10 shadow-sm">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full bg-[#F5F0E8] text-[#7D9B76] hover:bg-[#eDe8e0] border-none shadow-none justify-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#7D9B76] text-white flex items-center justify-center text-xs font-bold">SJ</div>
              Share your session today...
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[340px] rounded-xl">
            <DialogHeader>
              <DialogTitle>Log a Session</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input placeholder="Session Type (e.g. Reformer Flow)" />
              <Input placeholder="Studio or Home" />
              <div className="flex gap-2">
                <Input placeholder="Duration (min)" type="number" />
                <Input placeholder="Calories" type="number" />
              </div>
              <Button className="w-full bg-[#7D9B76] hover:bg-[#6A8564]">Post Session</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-4 flex flex-col gap-6">
        {POSTS.map(post => (
          <Card key={post.id} className="border-none shadow-sm overflow-hidden">
            <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
              <Avatar className={`w-10 h-10 ${post.user.color} text-slate-700 font-bold border-2 border-white shadow-sm`}>
                <AvatarFallback>{post.user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">{post.user.name}</h3>
                  <span className="text-xs text-slate-400">{post.timeAgo}</span>
                </div>
                <p className="text-xs text-slate-500">completed {post.type} at {post.studio}</p>
              </div>
            </CardHeader>
            
            {post.hasPhoto && (
              <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 mt-2 mx-4 rounded-xl flex items-center justify-center text-slate-400">
                Session Photo
              </div>
            )}
            
            <CardContent className="p-4 pt-4">
              <div className="flex gap-4 mb-2">
                <div className="flex items-center gap-1.5 bg-[#F5F0E8] px-3 py-1.5 rounded-lg text-sm text-[#7D9B76] font-medium">
                  <Clock className="w-4 h-4" /> {post.duration} min
                </div>
                <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-lg text-sm text-orange-600 font-medium">
                  <Flame className="w-4 h-4" /> {post.calories} cal
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0 flex justify-between border-t border-slate-50 mt-2">
              <div className="flex gap-4 mt-3">
                <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${likedPosts[post.id] ? 'text-rose-500' : 'text-slate-500 hover:text-slate-800'}`}>
                  <Heart className={`w-5 h-5 ${likedPosts[post.id] ? 'fill-rose-500' : ''}`} /> 
                  {post.likes + (likedPosts[post.id] ? 1 : 0)}
                </button>
                <button className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
                  <MessageCircle className="w-5 h-5" /> {post.comments}
                </button>
              </div>
              <button className="text-slate-400 hover:text-slate-600 mt-3">
                <Share2 className="w-5 h-5" />
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="p-5 flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-[#7D9B76] text-white border-none shadow-md">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full gap-1">
            <Trophy className="w-6 h-6 mb-1 opacity-80" />
            <div className="text-2xl font-black">47</div>
            <div className="text-[10px] uppercase tracking-wider opacity-80 font-medium">Sessions</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-500 text-white border-none shadow-md">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full gap-1">
            <Flame className="w-6 h-6 mb-1 opacity-80" />
            <div className="text-2xl font-black">12.4k</div>
            <div className="text-[10px] uppercase tracking-wider opacity-80 font-medium">Calories</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500 text-white border-none shadow-md">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full gap-1">
            <Activity className="w-6 h-6 mb-1 opacity-80" />
            <div className="text-2xl font-black">12</div>
            <div className="text-[10px] uppercase tracking-wider opacity-80 font-medium">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#7D9B76]" /> This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex justify-between items-center">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
              const completed = i < 4;
              const today = i === 4;
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${completed ? 'bg-[#7D9B76] text-white shadow-sm' : 
                      today ? 'bg-white border-2 border-[#7D9B76] text-[#7D9B76]' : 'bg-slate-100 text-slate-400'}`}>
                    {completed ? <CheckCircle2 className="w-4 h-4" /> : day}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-base font-bold">Calories Burned (8 Weeks)</CardTitle>
        </CardHeader>
        <CardContent className="p-5 h-48 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CALORIE_DATA}>
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="calories" fill="#7D9B76" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold">Badges</CardTitle>
          <button className="text-[#7D9B76] text-xs font-bold uppercase tracking-wider">View All</button>
        </CardHeader>
        <CardContent className="p-5 pt-2 grid grid-cols-3 gap-4">
          {BADGES.map(badge => (
            <div key={badge.id} className="flex flex-col items-center text-center gap-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm
                ${badge.earned ? 'bg-gradient-to-br from-[#F5F0E8] to-[#eDe8e0] text-[#7D9B76]' : 'bg-slate-100 text-slate-300 grayscale'}`}>
                {badge.icon}
              </div>
              <span className={`text-[10px] font-bold leading-tight ${badge.earned ? 'text-slate-700' : 'text-slate-400'}`}>
                {badge.name}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  
  return (
    <div className="flex flex-col h-full bg-[#FDFBF7] animate-in fade-in duration-300">
      <div className="p-4 bg-white sticky top-0 z-10 shadow-sm flex flex-col gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["All", "Technique", "Nutrition", "Studios", "Gear", "Challenges"].map(cat => (
            <Badge 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`cursor-pointer px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors border-none shadow-none
                ${activeCategory === cat ? 'bg-[#7D9B76] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {FORUM_POSTS.filter(p => activeCategory === "All" || p.category === activeCategory).map(post => (
          <Card key={post.id} className="border border-slate-100 shadow-sm hover:border-[#7D9B76]/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex gap-4">
              <div className="flex flex-col items-center gap-1 bg-slate-50 p-2 rounded-lg h-fit min-w-[48px]">
                <button className="text-slate-400 hover:text-orange-500"><ChevronRight className="w-5 h-5 -rotate-90" /></button>
                <span className="font-bold text-sm text-slate-700">{post.upvotes}</span>
                <button className="text-slate-400 hover:text-indigo-500"><ChevronRight className="w-5 h-5 rotate-90" /></button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-[#7D9B76]/20 text-[#7D9B76] font-semibold">{post.category}</Badge>
                  <span className="text-xs text-slate-400 font-medium">• {post.timeAgo}</span>
                </div>
                <h3 className="font-bold text-slate-800 leading-snug mb-2">{post.title}</h3>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Avatar className={`w-5 h-5 ${post.author.color} text-[8px] font-bold`}>
                      <AvatarFallback>{post.author.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold text-slate-600">{post.author.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{post.flair}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <MessageCircle className="w-4 h-4" /> {post.comments}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Dialog>
        <DialogTrigger asChild>
          <button className="absolute bottom-20 right-4 w-14 h-14 bg-[#7D9B76] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#6A8564] hover:scale-105 transition-all z-20">
            <Plus className="w-6 h-6" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-[340px] rounded-xl">
          <DialogHeader>
            <DialogTitle>New Discussion</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Title" className="font-bold" />
            <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option value="" disabled selected>Select Category</option>
              <option value="technique">Technique</option>
              <option value="nutrition">Nutrition</option>
              <option value="studios">Studios</option>
              <option value="gear">Gear</option>
            </select>
            <textarea 
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="What's on your mind?"
            />
            <Button className="w-full bg-[#7D9B76] hover:bg-[#6A8564]">Post to Community</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StorePage({ addToCart }: { addToCart: (p: any) => void }) {
  return (
    <div className="p-4 bg-slate-50 min-h-full animate-in fade-in duration-300">
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {["All", "Apparel", "Mats", "Accessories", "Bands"].map(cat => (
          <Badge key={cat} variant="outline" className="bg-white px-4 py-1.5 rounded-full whitespace-nowrap font-semibold cursor-pointer shadow-sm border-slate-200">
            {cat}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {PRODUCTS.map(product => (
          <Card key={product.id} className="border-none shadow-sm overflow-hidden flex flex-col group">
            <div className={`h-36 ${product.image} flex items-center justify-center p-4 relative`}>
              <button className="absolute top-2 right-2 p-1.5 bg-white/50 backdrop-blur rounded-full text-slate-500 hover:text-rose-500 transition-colors">
                <Heart className="w-4 h-4" />
              </button>
            </div>
            <CardContent className="p-3 pb-0 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">{product.brand}</p>
                <h3 className="font-bold text-sm leading-tight text-slate-800 mb-1 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mb-2">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {product.rating}
                </div>
              </div>
              <div className="font-black text-lg text-[#7D9B76] mt-auto">€{product.price}</div>
            </CardContent>
            <CardFooter className="p-3 pt-3">
              <Button 
                onClick={() => addToCart(product)}
                size="sm" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md active:scale-95 transition-transform"
              >
                Add
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <div className="bg-[#FDFBF7] min-h-full animate-in fade-in duration-300 pb-10">
      <div className="bg-white px-6 py-8 flex flex-col items-center border-b border-slate-100 relative">
        <button className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600">
          <Info className="w-5 h-5" />
        </button>
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7D9B76] to-[#A3BCA0] text-white flex items-center justify-center text-3xl font-bold shadow-lg border-4 border-white mb-4">
          SJ
        </div>
        <h2 className="text-2xl font-black text-slate-800">Sarah Johnson</h2>
        <Badge variant="secondary" className="mt-2 bg-[#F5F0E8] text-[#7D9B76] font-bold px-3 py-1">Advanced Level</Badge>
        <p className="text-center text-sm text-slate-500 mt-4 max-w-xs leading-relaxed">
          Pilates enthusiast since 2019 | Paris, France | Reformer addict
        </p>
        
        <div className="flex gap-8 mt-6 w-full justify-center border-t border-slate-100 pt-6">
          <div className="text-center">
            <div className="text-xl font-black text-slate-800">47</div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-slate-800">23</div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-slate-800">31</div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Following</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#7D9B76] data-[state=active]:shadow-sm font-bold">Activity</TabsTrigger>
            <TabsTrigger value="badges" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#7D9B76] data-[state=active]:shadow-sm font-bold">Badges</TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#7D9B76] data-[state=active]:shadow-sm font-bold">Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="mt-4 flex flex-col gap-3">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Reformer Flow</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Oct 12 • Studio Harmonie</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-orange-500 text-sm">320 cal</div>
                  <div className="text-xs text-slate-400 font-medium">55 min</div>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="badges" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
               {BADGES.map(badge => (
                <div key={badge.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center
                    ${badge.earned ? 'bg-gradient-to-br from-[#F5F0E8] to-[#eDe8e0] text-[#7D9B76]' : 'bg-slate-100 text-slate-300 grayscale'}`}>
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${badge.earned ? 'text-slate-800' : 'text-slate-400'}`}>{badge.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">{badge.earned ? 'Earned Oct 10' : 'Keep going!'}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="bookings" className="mt-4 flex flex-col gap-3">
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-[#7D9B76] border-y border-r border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2 text-[#7D9B76] border-[#7D9B76]/30 bg-[#7D9B76]/5 font-bold">Upcoming</Badge>
                  <h4 className="font-bold text-base text-slate-800">Advanced Cadillac</h4>
                  <p className="text-sm text-slate-500 font-medium mt-1">Core & Flow • Montmartre</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg text-center min-w-[60px]">
                  <div className="text-xs text-slate-500 font-bold uppercase">Oct</div>
                  <div className="text-xl font-black text-slate-800">24</div>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" className="flex-1 font-bold shadow-sm h-9">Reschedule</Button>
                <Button variant="outline" className="flex-1 text-rose-500 hover:text-rose-600 font-bold shadow-sm h-9 border-slate-200">Cancel</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
