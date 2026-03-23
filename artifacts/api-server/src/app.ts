import express, { type Express } from "express";
import path from "node:path";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// In production, serve the frontend SPA from the co-located public/ directory.
// This allows a single container to serve both API and static assets.
if (process.env["NODE_ENV"] === "production") {
  const publicPath = path.join(process.cwd(), "public");
  app.use(express.static(publicPath));
  // SPA fallback: serve index.html for any non-API route so client-side
  // routing works on page refresh / direct navigation.
  app.use((req, res, next) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(publicPath, "index.html"));
    } else {
      next();
    }
  });
}

export default app;
