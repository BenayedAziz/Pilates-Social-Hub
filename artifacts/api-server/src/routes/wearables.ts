import { Router, type IRouter } from "express";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface WearableData {
  connected: boolean;
  provider: "whoop" | "apple_watch" | "garmin" | "oura" | "none";
  lastSync: string;
  recovery: number;
  strain: number;
  hrv: number;
  restingHr: number;
  sleepScore: number;
  sleepDuration: number;
  caloriesBurned: number;
  activeCalories: number;
}

interface ConnectedDevice {
  provider: string;
  connectedAt: string;
  lastSync: string;
  status: "active" | "disconnected" | "error";
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockWearableData: WearableData = {
  connected: true,
  provider: "whoop",
  lastSync: "2 min ago",
  recovery: 85,
  strain: 8.4,
  hrv: 68,
  restingHr: 54,
  sleepScore: 82,
  sleepDuration: 7.5,
  caloriesBurned: 1847,
  activeCalories: 423,
};

const mockConnectedDevices: ConnectedDevice[] = [
  {
    provider: "whoop",
    connectedAt: "2026-01-15T10:30:00Z",
    lastSync: "2026-03-23T14:28:00Z",
    status: "active",
  },
];

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/wearables/status
 * Returns list of connected wearable devices for the current user.
 */
router.get("/wearables/status", (_req, res) => {
  res.json({
    devices: mockConnectedDevices,
    activeProvider: mockWearableData.provider,
  });
});

/**
 * POST /api/wearables/connect
 * Initiates OAuth flow for a wearable provider.
 * Body: { provider: "whoop" | "apple_watch" | "garmin" | "oura" }
 * Returns a redirect URL for the OAuth consent screen.
 */
router.post("/wearables/connect", (req, res) => {
  const { provider } = req.body as { provider?: string };

  if (!provider) {
    res.status(400).json({ error: "provider is required" });
    return;
  }

  const supportedProviders = ["whoop", "apple_watch", "garmin", "oura"];
  if (!supportedProviders.includes(provider)) {
    res.status(400).json({ error: `Unsupported provider: ${provider}` });
    return;
  }

  // In production, this would build a real OAuth authorization URL
  const mockRedirectUrl = `https://api.${provider}.com/oauth/authorize?client_id=pilateshub_mock&redirect_uri=https://pilateshub.com/api/wearables/callback&scope=read:recovery,read:sleep,read:workout&state=mock_state_token`;

  res.json({
    redirectUrl: mockRedirectUrl,
    provider,
    message: "Redirect the user to this URL to authorize the connection.",
  });
});

/**
 * GET /api/wearables/callback
 * Handles OAuth callback after user authorizes on the provider's site.
 * Query: { code, state }
 */
router.get("/wearables/callback", (req, res) => {
  const { code, state } = req.query as { code?: string; state?: string };

  if (!code || !state) {
    res.status(400).json({ error: "Missing code or state parameter" });
    return;
  }

  // In production: exchange code for access/refresh tokens, store them
  const newDevice: ConnectedDevice = {
    provider: "whoop",
    connectedAt: new Date().toISOString(),
    lastSync: new Date().toISOString(),
    status: "active",
  };

  mockConnectedDevices.push(newDevice);

  res.json({
    success: true,
    device: newDevice,
    message: "Wearable connected successfully.",
  });
});

/**
 * GET /api/wearables/data
 * Returns the latest health metrics from the connected wearable.
 * Query: { provider? } — defaults to the active provider.
 */
router.get("/wearables/data", (req, res) => {
  const { provider } = req.query as { provider?: string };

  // In production: fetch from Whoop API using stored tokens
  if (provider && provider !== mockWearableData.provider) {
    res.status(404).json({
      error: `No data available for provider: ${provider}`,
    });
    return;
  }

  res.json({
    ...mockWearableData,
    fetchedAt: new Date().toISOString(),
  });
});

/**
 * POST /api/wearables/disconnect
 * Disconnects a wearable device.
 * Body: { provider: string }
 */
router.post("/wearables/disconnect", (req, res) => {
  const { provider } = req.body as { provider?: string };

  if (!provider) {
    res.status(400).json({ error: "provider is required" });
    return;
  }

  const deviceIndex = mockConnectedDevices.findIndex(
    (d) => d.provider === provider,
  );

  if (deviceIndex === -1) {
    res.status(404).json({ error: `No connected device for provider: ${provider}` });
    return;
  }

  // In production: revoke OAuth tokens, clean up stored data
  mockConnectedDevices[deviceIndex].status = "disconnected";

  res.json({
    success: true,
    message: `${provider} disconnected successfully.`,
  });
});

export default router;
