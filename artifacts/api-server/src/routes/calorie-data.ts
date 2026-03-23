import { Router, type IRouter } from "express";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CalorieDataPoint {
  week: string;
  calories: number;
}

// ---------------------------------------------------------------------------
// Mock data — 8 weeks of calorie data
// ---------------------------------------------------------------------------
const mockCalorieData: CalorieDataPoint[] = [
  { week: "Jan 27", calories: 1850 },
  { week: "Feb 3", calories: 2200 },
  { week: "Feb 10", calories: 1950 },
  { week: "Feb 17", calories: 2400 },
  { week: "Feb 24", calories: 2100 },
  { week: "Mar 3", calories: 2650 },
  { week: "Mar 10", calories: 2800 },
  { week: "Mar 17", calories: 3050 },
];

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/calorie-data
 * Returns weekly calorie data for charts.
 */
router.get("/calorie-data", (_req, res) => {
  res.json(mockCalorieData);
});

export default router;
