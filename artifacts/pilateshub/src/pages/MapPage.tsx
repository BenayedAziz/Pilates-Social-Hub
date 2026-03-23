import { AnimatePresence, motion } from "framer-motion";
import L from "leaflet";
import { ChevronRight, Filter, MapPin, Navigation, Star, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { StudioDetailDialog } from "@/components/StudioDetailDialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Studio } from "@/data/types";
import { useStudios } from "@/hooks/use-api";
import type { StudioBounds } from "@/hooks/use-api";
import { useGeolocation } from "@/hooks/use-geolocation";

// Animation variants for staggered card entry
const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// Wraps a studio card with smooth enter/exit animation
function AnimatedCard({
  studio,
  index,
  children,
}: {
  studio: Studio;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      key={studio.id}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      {children}
    </motion.div>
  );
}


// Fix Leaflet default icon paths for bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: undefined,
  iconUrl: undefined,
  shadowUrl: undefined,
});

const FILTERS = ["Reformer", "Mat", "Beginner", "Advanced", "Near Me"];

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
function RecenterButton({ center }: { center: [number, number] }) {
  const map = useMap();
  return (
    <button
      type="button"
      aria-label="Center on my location"
      onClick={() => map.flyTo(center, 14, { duration: 0.8 })}
      className="absolute bottom-3 right-3 w-10 h-10 bg-card rounded-full shadow-lg flex items-center justify-center text-foreground/80 hover:text-primary transition-colors z-[1000] border border-border/40"
    >
      <Navigation className="w-4 h-4" />
    </button>
  );
}

// Fly to new position when geolocation resolves after map is already mounted
function FlyToPosition({ position }: { position: [number, number] }) {
  const map = useMap();
  const prevRef = useRef<[number, number] | null>(null);
  useEffect(() => {
    const prev = prevRef.current;
    if (prev && (prev[0] !== position[0] || prev[1] !== position[1])) {
      map.flyTo(position, 13, { duration: 1 });
    }
    prevRef.current = position;
  }, [position[0], position[1]]);
  return null;
}

// Listen to map pan/zoom and report the visible bounding box
function MapEventHandler({ onBoundsChange }: { onBoundsChange: (bounds: StudioBounds) => void }) {
  const map = useMap();

  useEffect(() => {
    const handler = () => {
      const b = map.getBounds();
      onBoundsChange({
        sw_lat: b.getSouthWest().lat,
        sw_lng: b.getSouthWest().lng,
        ne_lat: b.getNorthEast().lat,
        ne_lng: b.getNorthEast().lng,
      });
    };

    // Fire once immediately so we get initial bounds
    handler();

    map.on("moveend", handler);
    return () => { map.off("moveend", handler); };
  }, [map, onBoundsChange]);

  return null;
}

export default function MapPage() {
  const { position, loading: geoLoading, isDefault: geoIsDefault, requestPermission } = useGeolocation();
  const mapCenter: [number, number] = position ? [position.lat, position.lng] : [48.856, 2.352];

  // Track the visible bounding box of the map so we can refetch studios on pan/zoom
  const [viewBounds, setViewBounds] = useState<StudioBounds | null>(null);
  const moveEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use a transition so the viewport state updates (which trigger new API
  // fetches) are non-urgent — React keeps showing the current UI while the
  // new data loads in the background, eliminating any visible flash.
  const [, startTransition] = useTransition();

  // Debounce map move events (600ms) so we don't spam the API, and wrap the
  // state update in startTransition so React treats it as non-urgent.
  const handleBoundsChange = useCallback((bounds: StudioBounds) => {
    if (moveEndTimer.current) clearTimeout(moveEndTimer.current);
    moveEndTimer.current = setTimeout(() => {
      startTransition(() => {
        setViewBounds(bounds);
      });
    }, 600);
  }, []);

  // Pass the visible bounding box to the API — no limit, fetch ALL studios
  // inside the rectangle. keepPreviousData in useStudios ensures the old
  // markers stay visible while new data loads. The query key uses rounded
  // coords (3 decimals) so tiny pans reuse the cache.
  const { data: studios = [] } = useStudios(
    undefined, undefined, undefined, undefined, undefined, undefined,
    viewBounds ?? undefined,
  );
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);

  const filteredStudios = activeFilter
    ? studios.filter((s) => {
        if (activeFilter === "Near Me") return s.distance <= 1.5;
        return s.description.toLowerCase().includes(activeFilter.toLowerCase());
      })
    : studios;

  const handleStudioClick = (studio: Studio) => {
    setSelectedStudio(selectedStudio?.id === studio.id ? null : studio);
  };

  // Derived lists for discovery sections
  const topRated = [...studios].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
  const nearYou = [...studios].sort((a, b) => (a.distance || 0) - (b.distance || 0)).slice(0, 4);
  const newStudios = [...studios].reverse().slice(0, 4);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* === LEAFLET MAP === */}
      <div className="relative h-[40vh] md:h-[55vh] flex-shrink-0">
        <MapContainer
          center={mapCenter}
          zoom={13}
          zoomControl={false}
          attributionControl={false}
          className="h-full w-full z-0"
          style={{ background: "#f0ede6" }}
        >
          {/* CartoDB Positron - minimal elegant tile style */}
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

          {/* Fly to new position when geolocation resolves */}
          <FlyToPosition position={mapCenter} />

          {/* Re-fetch studios when user pans/zooms */}
          <MapEventHandler onBoundsChange={handleBoundsChange} />

          {/* Current location */}
          <Marker position={mapCenter} icon={locationIcon} />

          {/* Clustered studio markers */}
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom
            showCoverageOnHover={false}
            iconCreateFunction={(cluster: any) => {
              const count = cluster.getChildCount();
              return L.divIcon({
                html: `<div style="width:36px;height:36px;border-radius:50%;background:hsl(28,22%,42%);color:white;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.2);">${count}</div>`,
                className: "",
                iconSize: [36, 36] as [number, number],
              });
            }}
          >
            {filteredStudios.map((studio) => (
              <Marker
                key={`studio-${studio.id}`}
                position={[studio.lat, studio.lng]}
                icon={createPinIcon(studio.price, selectedStudio?.id === studio.id)}
                eventHandlers={{
                  click: () => handleStudioClick(studio),
                }}
              />
            ))}
          </MarkerClusterGroup>

          <RecenterButton center={mapCenter} />
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

        </div>

        {/* Geolocation permission banner — shown when using the hardcoded default */}
        {geoIsDefault && !geoLoading && (
          <div className="absolute top-14 left-3 right-3 z-[1000] bg-card/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-md border border-border/40 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Enable location for studios near you</span>
            <button type="button" onClick={requestPermission} className="text-xs font-bold text-primary">
              Enable
            </button>
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
            <AnimatePresence mode="popLayout">
              {filteredStudios.slice(0, 5).map((studio, i) => (
                <AnimatedCard key={studio.id} studio={studio} index={i}>
                  <StudioDetailDialog studio={studio}>
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
                </AnimatedCard>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Near You -- horizontal scroll, sorted by distance */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Near You</h2>
            <span className="text-xs text-muted-foreground">Based on your location</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <AnimatePresence mode="popLayout">
              {nearYou.map((studio, i) => (
                <AnimatedCard key={studio.id} studio={studio} index={i}>
                  <StudioDetailDialog studio={studio}>
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
                </AnimatedCard>
              ))}
            </AnimatePresence>
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
            <AnimatePresence mode="popLayout">
              {topRated.map((studio, idx) => (
                <AnimatedCard key={studio.id} studio={studio} index={idx}>
                  <StudioDetailDialog studio={studio}>
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
                </AnimatedCard>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* New Studios -- grid of fresh additions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">New Studios</h2>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1">Recently added</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {newStudios.map((studio, i) => (
                <AnimatedCard key={studio.id} studio={studio} index={i}>
                  <StudioDetailDialog studio={studio}>
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
                </AnimatedCard>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* All Studios -- compact list with grid on desktop */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">All Studios</h2>
            <span className="text-xs text-muted-foreground">{filteredStudios.length} studios</span>
          </div>
          <div className="flex flex-col md:grid md:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredStudios.map((studio, i) => (
                <AnimatedCard key={studio.id} studio={studio} index={i}>
                  <StudioDetailDialog studio={studio}>
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
                </AnimatedCard>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Bottom spacer for safe area / tab bar */}
        <div className="h-4" />
      </div>
    </div>
  );
}
