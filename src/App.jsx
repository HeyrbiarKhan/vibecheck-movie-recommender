import { useState } from 'react';
import iconSvg from './assets/icon.svg';
import { searchMovies } from './services/movieService';

function App() {
  const [vibe, setVibe] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vibe.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setExplanation("");
    setCurrentPage(1);
    setHasMoreResults(true);

    try {
      const result = await searchMovies(vibe, 1);
      setResults(result.movies);
      setExplanation(result.explanation);
      setHasMoreResults(result.movies.length >= 8); // Assume there might be more if we got 8 results
    } catch (err) {
      setError(err.message);
      console.error("Error searching movies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!vibe.trim() || loadingMore) return;

    setLoadingMore(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const result = await searchMovies(vibe, nextPage);

      if (result.movies.length > 0) {
        // Filter out duplicate movies by ID
        const newMovies = result.movies.filter(
          newMovie => !results.some(existingMovie => existingMovie.id === newMovie.id)
        );
        setResults(prevResults => [...prevResults, ...newMovies]);
        setCurrentPage(nextPage);
        setHasMoreResults(result.movies.length >= 8); // Check if there might be more
      } else {
        setHasMoreResults(false);
      }
    } catch (err) {
      setError(`Failed to load more movies: ${err.message}`);
      console.error("Error loading more movies:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header with logo and title */}
      <div className="w-full flex items-center justify-center py-8 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img src={iconSvg} alt="VibeCheck Logo" className="h-14 w-14 drop-shadow-lg" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              VibeCheck Movies
            </h1>
            <p className="text-sm text-slate-500 font-medium tracking-wide">AI-Powered Movie Discovery</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="max-w-3xl w-full space-y-10">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
              Discover Movies That Match Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Vibe</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Describe your mood, feelings, or situation, and our AI will curate the perfect movie recommendations just for you
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-white/50 ring-1 ring-slate-200/50">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all duration-500"></div>
                <input
                  type="text"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  placeholder="What's your vibe? (e.g., 'cozy rainy day', 'epic adventure', 'need a good cry')"
                  className="relative w-full px-6 py-4 text-lg bg-white/90 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-lg backdrop-blur-sm"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <button
                type="submit"
                disabled={!vibe.trim() || loading}
                className="group relative w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative flex items-center justify-center space-x-3">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      <span>🎬 Analyzing your vibe...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">✨</span>
                      <span>Find My Perfect Movies</span>
                      <span className="text-xl">✨</span>
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>

          {/* Results Section */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl">
              <p className="font-semibold">Oops! Something went wrong:</p>
              <p>{error}</p>
            </div>
          )}

          {explanation && (
            <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border border-purple-200/50 rounded-2xl p-6 shadow-lg backdrop-blur-sm ring-1 ring-white/50">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">🤖</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-700 tracking-wide uppercase">
                      AI Insight
                    </h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200/50">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      Powered by Google
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm lg:text-base font-medium">
                    {explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600 font-medium">Analyzing your vibe...</p>
              <p className="text-gray-500 mt-2">Finding the perfect movies for you!</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍿</div>
              <p className="text-xl text-gray-600 font-medium">Your movie recommendations will appear here...</p>
              <p className="text-gray-500 mt-2">Share your vibe and discover your next favorite film!</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Movie Results - Full Width Container */}
      {results.length > 0 && (
        <div className="w-full px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {results.map((movie) => (
                <div key={movie.id} className="bg-white/70 backdrop-blur-lg rounded-xl p-4 shadow-md border border-gray-200 hover:bg-white/80 transition-all duration-300">
                  {movie.posterPath && (
                    <img
                      src={movie.posterPath}
                      alt={`${movie.title} poster`}
                      className="w-full h-60 object-cover rounded-lg shadow-md mb-4"
                    />
                  )}
                  <div>
                    <h2 className="text-base font-bold mb-2 text-gray-800 line-clamp-2 leading-tight">
                      {movie.title}
                    </h2>
                    <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
                      {movie.releaseDate && (
                        <span>{new Date(movie.releaseDate).getFullYear()}</span>
                      )}
                      {movie.rating > 0 && (
                        <span>⭐ {movie.rating.toFixed(1)}</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-3">
                      {movie.overview}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {movie.genres.slice(0, 3).map((genre, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {genre}
                        </span>
                      ))}
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium block text-center">
                      ✨ Perfect match
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreResults && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Loading more movies...</span>
                    </>
                  ) : (
                    <>
                      <span>🍿</span>
                      <span>Load More Movies</span>
                      <span>({results.length} shown)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* No More Results Message */}
            {!hasMoreResults && results.length > 8 && (
              <div className="text-center mt-8">
                <p className="text-gray-600 text-lg">
                  🎬 That's all the movies we found for your vibe!
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Try searching with a different mood to discover more films.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
