import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import NodeCache from "node-cache";
import {
  searchMoviesByVibe,
  searchMoviesByParams,
} from "./services/movieService.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

// Load environment variables
dotenv.config();

// Debug environment variables
console.log("🔍 Environment Debug:");
console.log(
  "TMDB_API_KEY:",
  process.env.TMDB_API_KEY ? "configured" : "MISSING!"
);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize cache (TTL: 1 hour)
const cache = new NodeCache({ stdTTL: 3600 });

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:4000", // Allow AI Agent to call this backend
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(rateLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Movie search tool endpoint
app.post("/api/movies/search", async (req, res) => {
  try {
    const { vibe, page = 1 } = req.body;

    if (!vibe || typeof vibe !== "string" || vibe.trim().length === 0) {
      return res.status(400).json({
        error: "Invalid vibe parameter. Please provide a non-empty string.",
      });
    }

    const trimmedVibe = vibe.trim();

    // Check cache first (only for page 1)
    const cacheKey = `movies:${trimmedVibe.toLowerCase()}:page${page}`;
    if (page === 1) {
      const cachedResult = cache.get(cacheKey);

      if (cachedResult) {
        return res.json({
          movies: cachedResult.movies,
          explanation: cachedResult.explanation,
          cached: true,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Search for movies with pagination
    const result = await searchMoviesByVibe(trimmedVibe, page);

    // Cache the result (only page 1)
    if (page === 1) {
      cache.set(cacheKey, result);
    }

    res.json({
      movies: result.movies,
      explanation: result.explanation,
      cached: false,
      page: page,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error searching movies:", error);

    // Don't expose internal errors to client
    const statusCode = error.statusCode || 500;
    const message = error.statusCode
      ? error.message
      : "Internal server error occurred while searching for movies.";

    res.status(statusCode).json({
      error: message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Flexible search endpoint that accepts direct genre/keyword parameters
app.post("/api/movies/search-flexible", async (req, res) => {
  try {
    const { genres, keywords, year_range, vibe } = req.body;

    // If a vibe is provided, use the existing vibe-based search
    if (vibe) {
      const trimmedVibe = vibe.trim();
      const cacheKey = `movies:${trimmedVibe.toLowerCase()}`;
      const cachedResult = cache.get(cacheKey);

      if (cachedResult) {
        return res.json({
          movies: cachedResult.movies,
          explanation: cachedResult.explanation,
          cached: true,
          timestamp: new Date().toISOString(),
        });
      }

      const result = await searchMoviesByVibe(trimmedVibe);
      cache.set(cacheKey, result);

      return res.json({
        movies: result.movies,
        explanation: result.explanation,
        cached: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Use direct parameters for search
    const searchParams = {
      genres: genres || [],
      keywords: keywords || [],
      year_range: year_range || null,
    };

    const result = await searchMoviesByParams(searchParams);

    res.json({
      movies: result.movies,
      explanation:
        result.explanation ||
        `Found ${result.movies.length} movies matching your criteria`,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in flexible search:", error);
    res.status(500).json({
      error: "Internal server error occurred while searching for movies.",
      timestamp: new Date().toISOString(),
    });
  }
});

// Movie details endpoint (for future use)
app.get("/api/movies/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid movie ID" });
    }

    // Check cache first
    const cacheKey = `movie:${id}`;
    const cachedMovie = cache.get(cacheKey);

    if (cachedMovie) {
      return res.json({ movie: cachedMovie, cached: true });
    }

    // For now, return a placeholder - you can implement movie details later
    res
      .status(501)
      .json({ error: "Movie details endpoint not implemented yet" });
  } catch (error) {
    console.error("Error fetching movie details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Cache stats endpoint (for debugging)
app.get("/api/cache/stats", (req, res) => {
  if (process.env.NODE_ENV === "development") {
    res.json({
      keys: cache.keys(),
      stats: cache.getStats(),
    });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎬 VibeCheck Backend running on port ${PORT}`);
  console.log(
    `🌍 Frontend allowed from: ${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }`
  );
  console.log(
    `🔑 TMDb API key: ${process.env.TMDB_API_KEY ? "configured" : "MISSING!"}`
  );
});
