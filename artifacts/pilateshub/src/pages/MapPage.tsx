import L from "leaflet";
import { ChevronRight, Clock, ExternalLink, Filter, Globe, MapPin, Navigation, Star, X } from "lucide-react";
import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { StudioDetailDialog } from "@/components/StudioDetailDialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Studio } from "@/data/types";
import { REAL_STUDIOS, type RealStudio } from "@/data/real-studios";
import { useStudios } from "@/hooks/use-api";
import { MapPageSkeleton } from "@/components/PageSkeleton";

// Fix Leaflet default icon paths for bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: undefined,
  iconUrl: undefined,
  shadowUrl: undefined,
});

const FILTERS = ["Reformer", "Mat", "Beginner", "Advanced", "Near Me"];

// Paris center
const PARIS_CENTER: [number, number] = [48.862, 2.352];

// Fallback image for studios without imageUrl
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop";

// Custom pin icon factory for featured studios (green)
function createPinIcon(price: number, selected: boolean) {
  const size = selected ? 44 : 36;
  const color = selected ? "hsl(28, 22%, 34%)" : "hsl(28, 22%, 42%)";
  const shadow = selected ? "0 3px 12px rgba(0,0,0,0.3)" : "0 2px 6px rgba(0,0,0,0.2)";

  return L.divIcon({
    className: "",
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${color};color:white;
          display:flex;align-items:center;justify-content:center;
          font-weight:900;font-size:${selected ? 13 : 11}px;font-family:system-ui;
          border:2.5px solid white;box-shadow:${shadow};
          transition:transform 0.2s;
        ">\u20AC${price}</div>
        <div style="
          width:0;height:0;
          border-left:5px solid transparent;border-right:5px solid transparent;
          border-top:6px solid white;margin-top:-1px;
        "></div>
      </div>
    `,
  });
}

// Pin icon for real/OSM studios (smaller, slate/blue)
function createRealStudioIcon(selected: boolean, sportType: string) {
  const size = selected ? 34 : 26;
  const isPilates = sportType === "pilates";
  const color = selected ? (isPilates ? "#3b82f6" : "#64748b") : isPilates ? "#6993f5" : "#94a3b8";
  const shadow = selected ? "0 3px 10px rgba(0,0,0,0.25)" : "0 1px 4px rgba(0,0,0,0.15)";
  const label = isPilates ? "P" : sportType === "yoga" ? "Y" : "F";

  return L.divIcon({
    className: "",
    iconSize: [size, size + 6],
    iconAnchor: [size / 2, size + 6],
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${color};color:white;
          display:flex;align-items:center;justify-content:center;
          font-weight:800;font-size:${selected ? 12 : 10}px;font-family:system-ui;
          border:2px solid white;box-shadow:${shadow};
          transition:transform 0.2s;
        ">${label}</div>
        <div style="
          width:0;height:0;
          border-left:4px solid transparent;border-right:4px solid transparent;
          border-top:5px solid white;margin-top:-1px;
        "></div>
      </div>
    `,
  });
}

// Current location blue dot
const locationIcon = L.divIcon({
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: `
    <div style="position:relative;width:20px;height:20px;">
      <div style="width:14px;height:14px;background:#3b82f6;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.4);position:absolute;top:3px;left:3px;"></div>
      <div style="width:20px;height:20px;background:rgba(59,130,246,0.15);border-radius:50%;position:absolute;top:0;left:0;"></div>
    </div>
  `,
});

// Component to recenter map
function RecenterButton() {
  const map = useMap();
  return (
    <button
      type="button"
      aria-label="Center on my location"
      onClick={() => map.flyTo(PARIS_CENTER, 14, { duration: 0.8 })}
      className="absolute bottom-3 right-3 w-10 h-10 bg-card rounded-full shadow-lg flex items-center justify-center text-foreground/80 hover:text-primary transition-colors z-[1000] border border-border/40"
    >
      <Navigation className="w-4 h-4" />
    </button>
  );
}

// Real studio preview card (simpler than featured)
function RealStudioPreviewCard({ studio, onClose }: { studio: RealStudio; onClose: () => void }) {
  return (
    <div className="absolute bottom-16 left-3 right-3 z-[1000] animate-in slide-in-from-bottom-4 fade-in duration-200">
      <Card className="bg-card/95 backdrop-blur-md border-none shadow-xl overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-foreground truncate">{studio.name}</h3>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    studio.sportType === "pilates"
                      ? "bg-blue-100 text-blue-600"
                      : studio.sportType === "yoga"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-muted text-foreground/80"
                  }`}
                >
                  {studio.sportType === "pilates" ? "Pilates" : studio.sportType === "yoga" ? "Yoga" : "Fitness"}
                </span>
                <span className="text-[9px] font-medium text-muted-foreground/60 px-1.5 py-0.5 rounded-full bg-muted/50 border border-border/40">
                  {studio.source === "osm" ? "OSM" : "Web"}
                </span>
              </div>
              {studio.neighborhood && (
                <p className="text-xs text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {studio.neighborhood}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label="Close preview"
              className="self-start p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors flex-shrink-0"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {studio.address && <p className="text-xs text-muted-foreground mt-2">{studio.address}</p>}

          <div className="flex flex-wrap gap-2 mt-2.5">
            {studio.openingHours && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 bg-muted/50 rounded px-2 py-1">
                <Clock className="w-3 h-3" />
                {studio.openingHours.length > 40 ? `${studio.openingHours.slice(0, 40)}...` : studio.openingHours}
              </span>
            )}
            {studio.phone && (
              <a
                href={`tel:${studio.phone}`}
                className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-1 bg-blue-50 rounded px-2 py-1"
                onClick={(e) => e.stopPropagation()}
              >
                {studio.phone}
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            {studio.website && (
              <a
                href={studio.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1.5 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe className="w-3 h-3" />
                Website
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {studio.instagram && (
              <a
                href={`https://instagram.com/${studio.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-pink-500 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-full px-3 py-1.5 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                @{studio.instagram}
              </a>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground/60 italic">Claim this studio</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function MapPage() {
  const { data: studios = [], isLoading } = useStudios();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  const [selectedRealStudio, setSelectedRealStudio] = useState<RealStudio | null>(null);
  const [showRealStudios, setShowRealStudios] = useState(true);

  if (isLoading) return <MapPageSkeleton />;

  const filteredStudios = activeFilter
    ? studios.filter((s) => {
        if (activeFilter === "Near Me") return s.distance <= 1.5;
        return s.description.toLowerCase().includes(activeFilter.toLowerCase());
      })
    : studios;

  // Filter real studios by type when a filter is active
  const filteredRealStudios =
    activeFilter === "Near Me"
      ? [] // We don't have distance data for real studios
      : REAL_STUDIOS;

  const handleFeaturedClick = (studio: Studio) => {
    setSelectedRealStudio(null);
    setSelectedStudio(selectedStudio?.id === studio.id ? null : studio);
  };

  const handleRealClick = (studio: RealStudio) => {
    setSelectedStudio(null);
    setSelectedRealStudio(selectedRealStudio?.id === studio.id ? null : studio);
  };

  // Derived lists for discovery sections
  const topRated = [...studios].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
  const nearYou = [...studios].sort((a, b) => (a.distance || 0) - (b.distance || 0)).slice(0, 4);
  const newStudios = [...studios].reverse().slice(0, 4);
  const pilatesRealStudios = REAL_STUDIOS.filter((s) => s.sportType === "pilates");

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* === LEAFLET MAP === */}
      <div className="relative h-[40vh] md:h-[55vh] flex-shrink-0">
        <MapContainer
          center={PARIS_CENTER}
          zoom={13}
          zoomControl={false}
          attributionControl={false}
          className="h-full w-full z-0"
          style={{ background: "#f0ede6" }}
        >
          {/* CartoDB Positron - minimal elegant tile style */}
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

          {/* Current location */}
          <Marker position={PARIS_CENTER} icon={locationIcon} />

          {/* Featured studio markers (green pins with price) */}
          {filteredStudios.map((studio) => (
            <Marker
              key={`featured-${studio.id}`}
              position={[studio.lat, studio.lng]}
              icon={createPinIcon(studio.price, selectedStudio?.id === studio.id)}
              eventHandlers={{
                click: () => handleFeaturedClick(studio),
              }}
            />
          ))}

          {/* Real studio markers (smaller blue/gray pins) */}
          {showRealStudios &&
            filteredRealStudios.map((studio) => (
              <Marker
                key={`real-${studio.id}`}
                position={[studio.lat, studio.lng]}
                icon={createRealStudioIcon(selectedRealStudio?.id === studio.id, studio.sportType)}
                eventHandlers={{
                  click: () => handleRealClick(studio),
                }}
              />
            ))}

          <RecenterButton />
        </MapContainer>

        {/* Filter bar - overlays on top of map */}
        <div
          className="absolute top-3 left-3 right-3 flex gap-2 overflow-x-auto pb-1 z-[1000]"
          style={{ scrollbarWidth: "none" }}
        >
          <Badge className="px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer shadow-sm font-semibold text-xs border flex-shrink-0 flex items-center gap-1 bg-card text-foreground border-border">
            <Filter className="w-3 h-3" />
            Filters
          </Badge>
          {FILTERS.map((tag) => (
            <Badge
              key={tag}
              onClick={() => setActiveFilter(activeFilter === tag ? null : tag)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer shadow-sm font-semibold text-xs border flex-shrink-0 transition-colors ${
                activeFilter === tag
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-foreground border-border hover:bg-primary hover:text-white hover:border-primary"
              }`}
            >
              {tag}
            </Badge>
          ))}

          {/* Toggle real studios visibility */}
          <Badge
            onClick={() => setShowRealStudios(!showRealStudios)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer shadow-sm font-semibold text-xs border flex-shrink-0 transition-colors ${
              showRealStudios
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-card text-muted-foreground/60 border-border hover:text-blue-500 hover:border-blue-300"
            }`}
          >
            More Studios
          </Badge>
        </div>

        {/* Map legend */}
        {showRealStudios && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm rounded-full shadow-md px-3 py-1.5 flex items-center gap-3 z-[1000] border border-border/40">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-[hsl(28,22%,42%)] inline-block" />
              Featured
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              Pilates
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/50 inline-block" />
              Yoga
            </span>
          </div>
        )}

        {/* Selected featured studio preview card */}
        {selectedStudio && (
          <div className="absolute bottom-16 left-3 right-3 z-[1000] animate-in slide-in-from-bottom-4 fade-in duration-200">
            <StudioDetailDialog studio={selectedStudio}>
              <Card className="bg-card/95 backdrop-blur-md border-none shadow-xl cursor-pointer hover:shadow-2xl transition-shadow overflow-hidden">
                <div className="flex p-3 gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={selectedStudio.imageUrl || FALLBACK_IMAGE}
                      alt={selectedStudio.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm text-foreground truncate">{selectedStudio.name}</h3>
                      <span className="font-black text-primary text-sm ml-2">
                        {"\u20AC"}
                        {selectedStudio.price}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      {selectedStudio.neighborhood} {"\u00B7"} {selectedStudio.distance}km
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center text-xs font-semibold text-foreground/80 gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        {selectedStudio.rating}
                        <span className="text-muted-foreground/60 font-normal">({selectedStudio.reviews})</span>
                      </div>
                      <span className="text-primary text-[10px] font-bold flex items-center gap-0.5">
                        View <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Close preview"
                    className="self-start p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudio(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            </StudioDetailDialog>
          </div>
        )}

        {/* Selected real studio preview card */}
        {selectedRealStudio && (
          <RealStudioPreviewCard studio={selectedRealStudio} onClose={() => setSelectedRealStudio(null)} />
        )}
      </div>

      {/* === DISCOVERY SECTIONS (always visible below map) === */}
      <div className="p-5 flex flex-col gap-8 bg-background">

        {/* Featured Studios -- horizontal scroll */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Featured Studios</h2>
            <button className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">See All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {filteredStudios.slice(0, 5).map((studio) => (
              <StudioDetailDialog key={studio.id} studio={studio}>
                <div className="w-56 flex-shrink-0 cursor-pointer group">
                  <div className="h-32 rounded-2xl overflow-hidden mb-2 shadow-sm">
                    <img
                      src={studio.imageUrl || FALLBACK_IMAGE}
                      alt={studio.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-bold text-sm text-foreground truncate">{studio.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Star className="w-3 h-3 text-accent-cta fill-accent-cta" />
                    {studio.rating} · {studio.neighborhood}
                  </div>
                  <span className="text-xs font-bold text-primary">{"\u20AC"}{studio.price}/class</span>
                </div>
              </StudioDetailDialog>
            ))}
          </div>
        </section>

        {/* Near You -- horizontal scroll, sorted by distance */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Near You</h2>
            <span className="text-xs text-muted-foreground">Based on your location</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {nearYou.map((studio) => (
              <StudioDetailDialog key={studio.id} studio={studio}>
                <div className="w-44 flex-shrink-0 cursor-pointer group">
                  <div className="relative h-28 rounded-2xl overflow-hidden mb-2 shadow-sm">
                    <img
                      src={studio.imageUrl || FALLBACK_IMAGE}
                      alt={studio.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 bg-card/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-bold text-foreground shadow-sm">
                      <MapPin className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />
                      {studio.distance}km
                    </div>
                  </div>
                  <h3 className="font-bold text-xs text-foreground truncate">{studio.name}</h3>
                  <p className="text-[11px] text-muted-foreground truncate">{studio.neighborhood}</p>
                </div>
              </StudioDetailDialog>
            ))}
          </div>
        </section>

        {/* Top Rated -- sorted by rating, ranked list */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Top Rated</h2>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 text-accent-cta fill-accent-cta" />
              Highest reviewed
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {topRated.map((studio, idx) => (
              <StudioDetailDialog key={studio.id} studio={studio}>
                <Card className="cursor-pointer group hover:shadow-md transition-shadow rounded-2xl overflow-hidden border-none shadow-sm">
                  <div className="flex h-20">
                    <div className="w-20 flex-shrink-0 overflow-hidden">
                      <img
                        src={studio.imageUrl || FALLBACK_IMAGE}
                        alt={studio.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 flex-1 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-accent-cta">#{idx + 1}</span>
                          <h3 className="font-bold text-sm text-foreground">{studio.name}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">{studio.neighborhood}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-accent-cta fill-accent-cta" />
                          <span className="font-bold text-sm">{studio.rating}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{studio.reviews} reviews</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </StudioDetailDialog>
            ))}
          </div>
        </section>

        {/* New Studios -- grid of fresh additions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">New Studios</h2>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1">Recently added</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {newStudios.map((studio) => (
              <StudioDetailDialog key={studio.id} studio={studio}>
                <div className="cursor-pointer group">
                  <div className="h-28 rounded-2xl overflow-hidden mb-2 shadow-sm relative">
                    <img
                      src={studio.imageUrl || FALLBACK_IMAGE}
                      alt={studio.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 text-[9px] font-bold shadow-sm">
                      NEW
                    </div>
                  </div>
                  <h3 className="font-bold text-xs text-foreground truncate">{studio.name}</h3>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[11px] text-muted-foreground truncate">{studio.neighborhood}</span>
                    <span className="text-[11px] font-bold text-primary flex-shrink-0">{"\u20AC"}{studio.price}</span>
                  </div>
                </div>
              </StudioDetailDialog>
            ))}
          </div>
        </section>

        {/* All Studios -- compact list with grid on desktop */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">All Studios</h2>
            <span className="text-xs text-muted-foreground">{filteredStudios.length} studios</span>
          </div>
          <div className="flex flex-col md:grid md:grid-cols-2 gap-3">
            {filteredStudios.map((studio) => (
              <StudioDetailDialog key={studio.id} studio={studio}>
                <Card className="border border-border/40 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer overflow-hidden group rounded-2xl">
                  <div className="flex h-24">
                    <div className="w-24 flex-shrink-0 overflow-hidden">
                      <img
                        src={studio.imageUrl || FALLBACK_IMAGE}
                        alt={studio.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-sm leading-tight text-foreground">{studio.name}</h3>
                          <span className="font-bold text-primary text-sm flex-shrink-0 ml-2">
                            {"\u20AC"}
                            {studio.price}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                          {studio.neighborhood} {"\u00B7"} {studio.distance}km
                        </p>
                      </div>
                      <div className="flex items-center text-xs font-semibold text-foreground/80 gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        {studio.rating}
                        <span className="text-muted-foreground/60 font-normal">({studio.reviews})</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </StudioDetailDialog>
            ))}
          </div>
        </section>

        {/* More Studios Nearby -- real studios compact list */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">More Studios Nearby</h2>
            <span className="text-xs text-muted-foreground">{pilatesRealStudios.length} Pilates studios</span>
          </div>
          <p className="text-xs text-muted-foreground/60 mb-3 -mt-1">
            Community-sourced studios from OpenStreetMap and web research
          </p>
          <div className="flex flex-col gap-1.5">
            {pilatesRealStudios.map((studio) => (
              <div
                key={`nearby-${studio.id}`}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer"
                onClick={() => {
                  setSelectedStudio(null);
                  setSelectedRealStudio(studio);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-black text-blue-600">P</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {studio.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground/60 truncate">
                      {studio.neighborhood}{studio.address ? ` · ${studio.address}` : ""}
                    </p>
                  </div>
                </div>
                {studio.website ? (
                  <a
                    href={studio.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-600 flex-shrink-0 ml-2 p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0 ml-2" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom spacer for safe area / tab bar */}
        <div className="h-4" />
      </div>
    </div>
  );
}
