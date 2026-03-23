import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock leaflet and react-leaflet before importing MapPage
vi.mock("leaflet", () => {
  const divIcon = vi.fn(() => ({}));
  const icon = vi.fn(() => ({}));
  const latLngBounds = vi.fn(() => ({
    getSouthWest: () => ({ lat: 48.8, lng: 2.3 }),
    getNorthEast: () => ({ lat: 48.9, lng: 2.4 }),
    pad: vi.fn().mockReturnThis(),
  }));
  return {
    default: {
      divIcon,
      icon,
      latLngBounds,
      Icon: { Default: { prototype: { _getIconUrl: "" }, mergeOptions: vi.fn() } },
    },
    divIcon,
    icon,
    latLngBounds,
    Icon: { Default: { prototype: { _getIconUrl: "" }, mergeOptions: vi.fn() } },
  };
});

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: any) => <div>{children}</div>,
  useMap: () => ({
    getBounds: vi.fn(() => ({
      getSouthWest: () => ({ lat: 48.8, lng: 2.3 }),
      getNorthEast: () => ({ lat: 48.9, lng: 2.4 }),
      pad: vi.fn().mockReturnValue({
        getSouthWest: () => ({ lat: 48.8, lng: 2.3 }),
        getNorthEast: () => ({ lat: 48.9, lng: 2.4 }),
      }),
    })),
    on: vi.fn(),
    off: vi.fn(),
    flyTo: vi.fn(),
    setView: vi.fn(),
    getZoom: vi.fn(() => 13),
  }),
}));

vi.mock("react-leaflet-cluster", () => ({
  default: ({ children }: any) => <div data-testid="marker-cluster">{children}</div>,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      // Filter out motion-specific props to avoid React warnings
      const { variants, initial, animate, exit, layout, custom, ...domProps } = props;
      return <div {...domProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock API hooks
vi.mock("@/hooks/use-api", () => ({
  useStudios: vi.fn(() => ({
    data: [
      {
        id: 1,
        name: "Test Studio",
        neighborhood: "Marais",
        rating: 4.5,
        reviews: 20,
        price: 40,
        distance: 1.5,
        lat: 48.86,
        lng: 2.36,
        coords: { x: 50, y: 50 },
        description: "A great studio",
        coaches: ["Sophie"],
        imageUrl: "",
      },
    ],
    isLoading: false,
  })),
}));

// Mock geolocation
vi.mock("@/hooks/use-geolocation", () => ({
  useGeolocation: () => ({
    position: { lat: 48.856, lng: 2.352 },
    loading: false,
    error: null,
    isDefault: false,
    requestPermission: vi.fn(),
  }),
}));

// Mock StudioDetailDialog
vi.mock("@/components/StudioDetailDialog", () => ({
  StudioDetailDialog: ({ children }: any) => <div data-testid="studio-detail">{children}</div>,
}));

import MapPage from "../MapPage";

describe("MapPage", () => {
  it("renders without crashing", () => {
    render(<MapPage />);
    expect(document.body.innerHTML.length).toBeGreaterThan(0);
  });

  it("renders the map container", () => {
    render(<MapPage />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  it("renders studio names in the UI", () => {
    render(<MapPage />);
    expect(screen.getAllByText("Test Studio").length).toBeGreaterThan(0);
  });
});
