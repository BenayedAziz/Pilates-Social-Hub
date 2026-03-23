import { ArrowDown, ArrowUp, Calendar, DollarSign, Eye, Star, TrendingUp, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock analytics data
const MONTHLY_BOOKINGS = [
  { month: "Oct", bookings: 67, revenue: 3015 },
  { month: "Nov", bookings: 82, revenue: 3690 },
  { month: "Dec", bookings: 58, revenue: 2610 },
  { month: "Jan", bookings: 91, revenue: 4095 },
  { month: "Feb", bookings: 105, revenue: 4725 },
  { month: "Mar", bookings: 89, revenue: 4005 },
];

const DAILY_VIEWS = [
  { day: "Mon", views: 45 },
  { day: "Tue", views: 62 },
  { day: "Wed", views: 38 },
  { day: "Thu", views: 71 },
  { day: "Fri", views: 55 },
  { day: "Sat", views: 89 },
  { day: "Sun", views: 42 },
];

const CLASS_POPULARITY = [
  { name: "Reformer Flow", value: 35, color: "hsl(var(--primary))" },
  { name: "Mat Pilates", value: 25, color: "hsl(var(--accent-cta))" },
  { name: "Cadillac Intro", value: 20, color: "hsl(28, 22%, 60%)" },
  { name: "Tower Session", value: 12, color: "hsl(28, 22%, 75%)" },
  { name: "Other", value: 8, color: "hsl(28, 15%, 85%)" },
];

const PEAK_HOURS = [
  { hour: "7am", clients: 8 },
  { hour: "8am", clients: 12 },
  { hour: "9am", clients: 15 },
  { hour: "10am", clients: 11 },
  { hour: "11am", clients: 9 },
  { hour: "12pm", clients: 6 },
  { hour: "1pm", clients: 4 },
  { hour: "2pm", clients: 7 },
  { hour: "3pm", clients: 5 },
  { hour: "4pm", clients: 8 },
  { hour: "5pm", clients: 14 },
  { hour: "6pm", clients: 16 },
  { hour: "7pm", clients: 13 },
  { hour: "8pm", clients: 9 },
];

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = change >= 0;
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">{icon}</div>
          <span
            className={`text-[10px] font-bold flex items-center gap-0.5 ${isPositive ? "text-green-600" : "text-red-500"}`}
          >
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        </div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{title}</div>
      </CardContent>
    </Card>
  );
}

export function StudioAnalytics() {
  return (
    <div className="flex flex-col gap-5">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Page Views" value="1,247" change={14.5} icon={<Eye className="w-4 h-4 text-primary" />} />
        <StatCard title="Bookings" value="89" change={23.6} icon={<Calendar className="w-4 h-4 text-primary" />} />
        <StatCard title="Check-ins" value="156" change={8.2} icon={<Users className="w-4 h-4 text-primary" />} />
        <StatCard
          title="Revenue"
          value="\u20AC4,005"
          change={-2.1}
          icon={<DollarSign className="w-4 h-4 text-primary" />}
        />
      </div>

      {/* Bookings & Revenue Chart */}
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Bookings & Revenue (6 months)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_BOOKINGS}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Two-column: Class Popularity Pie + Peak Hours */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Class Popularity */}
        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold">Popular Classes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CLASS_POPULARITY}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {CLASS_POPULARITY.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend below */}
            <div className="flex flex-wrap gap-2 mt-2">
              {CLASS_POPULARITY.map((c) => (
                <span key={c.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  {c.name} ({c.value}%)
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold">Peak Hours</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PEAK_HOURS}>
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="clients"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rating summary */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">4.9</div>
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 text-accent-cta fill-accent-cta" />
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">234 reviews</div>
          </div>
          {/* Rating breakdown bars */}
          <div className="flex-1 flex flex-col gap-1.5">
            {[
              { stars: 5, pct: 78 },
              { stars: 4, pct: 15 },
              { stars: 3, pct: 5 },
              { stars: 2, pct: 1 },
              { stars: 1, pct: 1 },
            ].map((r) => (
              <div key={r.stars} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-3">{r.stars}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent-cta rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground w-6 text-right">{r.pct}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
