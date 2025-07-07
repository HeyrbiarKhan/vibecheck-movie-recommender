// Vibe to search parameters mapping
const vibeMapping = {
  // Moods
  cozy: { genres: [18, 10751], keywords: ["home", "family", "warm"] }, // Fixed: 1074 -> 10751 (Family)
  rainy: { genres: [18, 9648], keywords: ["mystery", "drama", "atmospheric"] },
  raining: {
    genres: [18, 9648],
    keywords: ["mystery", "drama", "atmospheric"],
  },
  "rainy day": {
    genres: [18, 9648],
    keywords: ["mystery", "drama", "atmospheric"],
  },
  cloudy: { genres: [18, 9648], keywords: ["mystery", "drama", "atmospheric"] },
  stormy: { genres: [18, 53], keywords: ["intense", "drama", "thriller"] },
  gloomy: { genres: [18], keywords: ["melancholy", "drama", "contemplative"] },
  sunday: { genres: [18, 10402, 10749], keywords: ["family", "feel-good"] },
  sad: { genres: [18], keywords: ["emotional", "drama", "heartbreak"] },
  breakup: { genres: [18, 10749], keywords: ["love", "heartbreak", "romance"] },
  hopeful: {
    genres: [18, 10749],
    keywords: ["inspiring", "uplifting", "hope"],
  },
  crying: { genres: [18], keywords: ["emotional", "drama", "tear-jerker"] },

  // Genres & Styles
  mystery: { genres: [9648, 53], keywords: ["detective", "crime", "thriller"] },
  mysterious: {
    genres: [9648, 53],
    keywords: ["detective", "crime", "thriller"],
  },
  thriller: { genres: [53], keywords: ["suspense", "tension", "intense"] },
  suspense: { genres: [53], keywords: ["thriller", "tension", "mystery"] },
  action: { genres: [28], keywords: ["adventure", "fight", "hero"] },
  epic: { genres: [12, 28], keywords: ["adventure", "grand", "hero"] },
  adventure: { genres: [12], keywords: ["journey", "exploration"] },
  space: { genres: [878], keywords: ["space", "sci-fi", "future"] },
  "sci-fi": { genres: [878], keywords: ["future", "technology", "space"] },
  "science fiction": {
    genres: [878],
    keywords: ["future", "technology", "space"],
  },
  horror: { genres: [27], keywords: ["scary", "fear", "supernatural"] },
  scary: { genres: [27], keywords: ["horror", "fear", "supernatural"] },
  drama: { genres: [18], keywords: ["emotional", "character", "story"] },
  comedy: { genres: [35], keywords: ["funny", "humor", "laugh"] },
  funny: { genres: [35], keywords: ["comedy", "humor", "laugh"] },
  laugh: { genres: [35], keywords: ["comedy", "humor", "funny"] },
  romantic: { genres: [10749], keywords: ["love", "romance", "relationship"] },
  romance: { genres: [10749], keywords: ["love", "romantic", "relationship"] },
  love: { genres: [10749], keywords: ["romance", "romantic", "relationship"] },
  fantasy: { genres: [14], keywords: ["magic", "supernatural", "mythical"] },
  magic: { genres: [14], keywords: ["fantasy", "supernatural", "wizard"] },
  superhero: { genres: [28, 878], keywords: ["hero", "powers", "comic"] },
  documentary: { genres: [99], keywords: ["real", "factual", "educational"] },

  // Time periods
  "90s": { year_range: [1990, 1999] },
  "80s": { year_range: [1980, 1989] },
  "70s": { year_range: [1970, 1979] },
  retro: { year_range: [1970, 1989] },
  classic: { year_range: [1940, 1979] },
  old: { year_range: [1940, 1979] },
  recent: { year_range: [2020, new Date().getFullYear()] },
  new: { year_range: [2020, new Date().getFullYear()] },

  // Vibes
  "mind-bending": {
    genres: [878, 9648],
    keywords: ["psychological", "twist", "reality"],
  },
  reality: {
    genres: [878, 9648],
    keywords: ["mind-bending", "psychological", "simulation"],
  },
  dumb: { genres: [35, 28], keywords: ["silly", "mindless", "fun"] },
  mindless: { genres: [35, 28], keywords: ["dumb", "silly", "fun"] },
  friends: { genres: [35, 12], keywords: ["group", "friendship", "together"] },
  party: { genres: [35], keywords: ["fun", "celebration", "group"] },
  chill: { genres: [18, 10402], keywords: ["relaxing", "calm", "peaceful"] },
  intense: { genres: [53, 18], keywords: ["thriller", "suspense", "drama"] },
  "feel-good": {
    genres: [35, 10749, 10751],
    keywords: ["uplifting", "happy", "positive"],
  },
  inspiring: {
    genres: [18],
    keywords: ["motivational", "uplifting", "biographical"],
  },
  uplifting: {
    genres: [35, 10749, 10751],
    keywords: ["feel-good", "happy", "positive", "inspiring"],
  },
  fun: {
    genres: [35, 12, 10751],
    keywords: ["entertaining", "enjoyable", "light-hearted", "comedy"],
  },
};

// Genre ID mapping (from TMDb)
const genreMap = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Debug logging
console.log("🔧 MovieService Debug:");
console.log("API_KEY loaded:", API_KEY ? "YES" : "NO");
console.log(
  "API_KEY value:",
  API_KEY ? `${API_KEY.substring(0, 8)}...` : "undefined"
);

// Rate limiting for TMDb API
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 250; // 4 requests per second max

async function rateLimitedFetch(url) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();

  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error(`TMDb API error: ${response.statusText}`);
    error.statusCode = response.status;
    throw error;
  }

  return response;
}

function analyzeVibe(vibe) {
  const lowerVibe = vibe.toLowerCase();
  let searchParams = {
    genres: [],
    keywords: [],
    year_range: null,
  };

  // Check for matches in our vibe mapping
  for (const [key, params] of Object.entries(vibeMapping)) {
    if (lowerVibe.includes(key)) {
      if (params.genres) searchParams.genres.push(...params.genres);
      if (params.keywords) searchParams.keywords.push(...params.keywords);
      if (params.year_range) searchParams.year_range = params.year_range;
    }
  }

  // Remove duplicates and limit to max 2 genres for better results
  searchParams.genres = [...new Set(searchParams.genres)].slice(0, 2);
  searchParams.keywords = [...new Set(searchParams.keywords)];

  return searchParams;
}

// AI-powered flexible movie search using keywords
async function searchWithAIKeywords(keywords, page = 1) {
  console.log(`🎯 AI-powered search with keywords: "${keywords}"`);
  
  const keywordList = keywords.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  let allMovies = [];
  
  // Map common keywords to genres for better results
  const keywordToGenre = {
    'comedy': 35, 'funny': 35, 'humor': 35, 'laugh': 35,
    'drama': 18, 'emotional': 18, 'sad': 18, 'heartfelt': 18,
    'action': 28, 'adventure': 12, 'epic': 28,
    'horror': 27, 'scary': 27, 'fear': 27,
    'romance': 10749, 'romantic': 10749, 'love': 10749,
    'thriller': 53, 'suspense': 53, 'mystery': 9648,
    'fantasy': 14, 'magic': 14, 'supernatural': 14,
    'scifi': 878, 'sci-fi': 878, 'science': 878, 'space': 878, 'future': 878,
    'family': 10751, 'kids': 10751, 'children': 10751,
    'crime': 80, 'detective': 80,
    'documentary': 99, 'real': 99, 'factual': 99,
    'animation': 16, 'animated': 16, 'cartoon': 16,
    'war': 10752, 'western': 37, 'history': 36, 'historical': 36,
    'music': 10402, 'musical': 10402,
    'cozy': 18, 'warm': 18, 'comfort': 18, 'feel-good': 35,
    'dark': 53, 'intense': 53, 'atmospheric': 9648,
    'uplifting': 35, 'inspiring': 18, 'motivational': 18,
    'fun': 35, 'entertaining': 35, 'light': 35
  };
  
  // Extract potential genre IDs from keywords
  const genreIds = [];
  keywordList.forEach(keyword => {
    if (keywordToGenre[keyword]) {
      genreIds.push(keywordToGenre[keyword]);
    }
  });
  
  try {
    // Strategy 1: If we found genre matches, search by genres
    if (genreIds.length > 0) {
      const uniqueGenres = [...new Set(genreIds)];
      const genreQuery = uniqueGenres.slice(0, 3).join(','); // Use up to 3 genres
      
      console.log(`📚 Searching by genres: ${genreQuery}`);
      const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreQuery}&sort_by=popularity.desc&page=${page}&vote_count.gte=20`;
      
      const response = await rateLimitedFetch(url);
      const data = await response.json();
      allMovies = data.results || [];
    }
    
    // Strategy 2: If no genre matches or few results, try keyword searches
    if (allMovies.length < 10) {
      console.log(`🔍 Searching by keywords: ${keywordList.join(', ')}`);
      
      // Try searching with each significant keyword
      for (const keyword of keywordList.slice(0, 3)) { // Limit to 3 keywords to avoid too many API calls
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(keyword)}&page=${page}`;
        
        const response = await rateLimitedFetch(url);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          // Add movies, avoiding duplicates
          const newMovies = data.results.filter(movie => 
            !allMovies.some(existing => existing.id === movie.id)
          );
          allMovies.push(...newMovies);
        }
      }
    }
    
    // Strategy 3: If still no good results, try the full keyword string as a search term
    if (allMovies.length < 5) {
      console.log(`🎲 Fallback search with full string: "${keywords}"`);
      const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(keywords)}&page=${page}`;
      
      const response = await rateLimitedFetch(url);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const newMovies = data.results.filter(movie => 
          !allMovies.some(existing => existing.id === movie.id)
        );
        allMovies.push(...newMovies);
      }
    }
    
    // Sort by popularity and rating
    allMovies.sort((a, b) => {
      const aScore = (a.popularity || 0) * 0.7 + (a.vote_average || 0) * 0.3;
      const bScore = (b.popularity || 0) * 0.7 + (b.vote_average || 0) * 0.3;
      return bScore - aScore;
    });
    
    console.log(`✅ AI search found ${allMovies.length} movies`);
    return allMovies.slice(0, 20); // Return top 20 for pagination
    
  } catch (error) {
    console.error(`❌ Error in AI search:`, error);
    return [];
  }
}

export async function searchMoviesByVibe(vibe, page = 1) {
  if (!API_KEY) {
    const error = new Error("TMDb API key not configured");
    error.statusCode = 500;
    throw error;
  }

  console.log(`🔍 Searching for movies with vibe: "${vibe}", page: ${page}`);

  // Try to use our predefined vibe mapping first
  const searchParams = analyzeVibe(vibe);
  let movies = [];

  try {
    // If we found predefined mappings, use them
    if (searchParams.genres.length > 0) {
      console.log(`📋 Using predefined genres: ${searchParams.genres}`);
      const genreIds = searchParams.genres.join(",");
      
      // First try with lower vote requirement for more results
      let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreIds}&sort_by=popularity.desc&page=${page}&vote_count.gte=50`;
      
      let response = await rateLimitedFetch(url);
      let data = await response.json();
      movies = data.results || [];
      
      // If we get very few results, try with even lower vote requirement
      if (movies.length < 10) {
        console.log(`⚡ Low results (${movies.length}), trying with lower vote threshold`);
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreIds}&sort_by=popularity.desc&page=${page}&vote_count.gte=10`;
        
        response = await rateLimitedFetch(url);
        data = await response.json();
        movies = data.results || [];
      }
      
      // If still few results, try with just the first genre
      if (movies.length < 10 && searchParams.genres.length > 1) {
        console.log(`⚡ Still low results (${movies.length}), trying with single genre`);
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${searchParams.genres[0]}&sort_by=popularity.desc&page=${page}&vote_count.gte=10`;
        
        response = await rateLimitedFetch(url);
        data = await response.json();
        movies = data.results || [];
      }
    } else {
      // If no predefined mapping, use flexible AI-powered search
      console.log(`🤖 Using AI-generated keywords for flexible search`);
      movies = await searchWithAIKeywords(vibe, page);
    }

    // Filter by year range if specified in predefined mapping
    if (searchParams.year_range) {
      const [startYear, endYear] = searchParams.year_range;
      movies = movies.filter((movie) => {
        if (!movie.release_date) return false;
        const movieYear = new Date(movie.release_date).getFullYear();
        return movieYear >= startYear && movieYear <= endYear;
      });
    }

    // Apply pagination logic - return 8 movies per page with offset
    const moviesPerPage = 8;
    const startIndex = (page - 1) * moviesPerPage;
    const paginatedMovies = movies.slice(
      startIndex,
      startIndex + moviesPerPage
    );

    // Format the results
    const formattedMovies = paginatedMovies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview || "No description available.",
      releaseDate: movie.release_date,
      rating: movie.vote_average,
      posterPath: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      backdropPath: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null,
      genres: movie.genre_ids?.map((id) => genreMap[id]).filter(Boolean) || [],
    }));

    // Generate explanation
    const explanation = generateExplanation(
      vibe,
      formattedMovies,
      searchParams,
      page
    );

    return {
      movies: formattedMovies,
      explanation,
    };
  } catch (error) {
    console.error("Error in searchMoviesByVibe:", error);
    if (error.statusCode) {
      throw error;
    }

    const serverError = new Error("Failed to search for movies");
    serverError.statusCode = 500;
    throw serverError;
  }
}

function generateExplanation(vibe, movies, searchParams, page = 1) {
  let explanation = `Based on your vibe "${vibe}", `;

  if (page > 1) {
    explanation = `Here are more recommendations for your "${vibe}" vibe! `;
  }

  if (searchParams.genres.length > 0) {
    const genreNames = searchParams.genres
      .map((id) => genreMap[id])
      .filter(Boolean);
    explanation += `I found ${genreNames.join(
      " and "
    )} movies that should match your mood. `;
  }

  if (searchParams.year_range) {
    const [start, end] = searchParams.year_range;
    explanation += `I focused on movies from ${start}-${end} as requested. `;
  }

  explanation += `Here are ${movies.length} recommendations perfect for your current vibe!`;

  return explanation;
}

export async function searchMoviesByParams(searchParams) {
  if (!API_KEY) {
    const error = new Error("TMDb API key not configured");
    error.statusCode = 500;
    throw error;
  }

  try {
    let movies = [];

    // Search by genres if provided
    if (searchParams.genres && searchParams.genres.length > 0) {
      const genreIds = searchParams.genres.join(",");
      const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreIds}&sort_by=popularity.desc&page=1`;

      const response = await rateLimitedFetch(url);
      const data = await response.json();
      movies = data.results?.slice(0, 8) || [];
    }

    // If no movies found by genre, try keyword search
    if (
      movies.length === 0 &&
      searchParams.keywords &&
      searchParams.keywords.length > 0
    ) {
      for (const keyword of searchParams.keywords.slice(0, 3)) {
        // Limit keyword searches
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          keyword
        )}&page=1`;

        const response = await rateLimitedFetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          movies = data.results.slice(0, 8);
          break;
        }
      }
    }

    // Filter by year range if specified
    if (searchParams.year_range && movies.length > 0) {
      const [startYear, endYear] = searchParams.year_range;
      movies = movies.filter((movie) => {
        if (!movie.release_date) return false;
        const movieYear = new Date(movie.release_date).getFullYear();
        return movieYear >= startYear && movieYear <= endYear;
      });
    }

    // Format the results
    const formattedMovies = movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview || "No description available.",
      releaseDate: movie.release_date,
      rating: movie.vote_average,
      posterPath: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      backdropPath: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null,
      genres: movie.genre_ids?.map((id) => genreMap[id]).filter(Boolean) || [],
    }));

    return {
      movies: formattedMovies,
      explanation: generateParamsExplanation(searchParams, formattedMovies),
    };
  } catch (error) {
    console.error("Error in searchMoviesByParams:", error);
    if (error.statusCode) {
      throw error;
    }

    const serverError = new Error("Failed to search for movies");
    serverError.statusCode = 500;
    throw serverError;
  }
}

function generateParamsExplanation(searchParams, movies) {
  let explanation = "Based on your preferences, ";

  if (searchParams.genres && searchParams.genres.length > 0) {
    const genreNames = searchParams.genres
      .map((id) => genreMap[id])
      .filter(Boolean);
    explanation += `I found ${genreNames.join(" and ")} movies `;
  }

  if (searchParams.keywords && searchParams.keywords.length > 0) {
    explanation += `matching themes like ${searchParams.keywords
      .slice(0, 3)
      .join(", ")} `;
  }

  if (searchParams.year_range) {
    const [start, end] = searchParams.year_range;
    explanation += `from ${start}-${end} `;
  }

  explanation += `that should match your mood. Here are ${movies.length} recommendations!`;

  return explanation;
}
