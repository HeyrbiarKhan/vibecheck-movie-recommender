import { useState } from 'react';
import iconSvg from './assets/icon.svg';

function App() {
  const [vibe, setVibe] = useState("");
  const [results, setResults] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call your agent/search function here later
    console.log("User vibe:", vibe);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-green-100 to-indigo-300">
      {/* Header with logo and title */}
      <div className="w-full flex items-center justify-center py-6 bg-white/50 backdrop-blur-md border-b border-gray-200 shadow-lg">
        <img src={iconSvg} alt="VibeCheck Logo" className="h-12 w-12 mr-4" />
        <span className="text-4xl font-bold tracking-tight text-gray-800">
          VibeCheck Movies
        </span>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <p className="text-xl text-gray-700 max-w-lg mx-auto leading-relaxed">
              Describe your mood, and we'll find the perfect movie to match your vibe
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  placeholder="What's the vibe? (e.g., 'cozy rainy day mystery' or 'epic space adventure')"
                  className="w-full px-5 py-3 text-lg bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-indigo-300 focus:bg-white transition-all duration-300 shadow-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!vibe.trim()}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-xl text-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                ✨ Find My Movies ✨
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 font-medium">Your movie recommendations will appear here...</p>
                <p className="text-gray-500 mt-2">Share your vibe and discover your next favorite film!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {results.map((movie, index) => (
                  <div key={index} className="bg-white/70 backdrop-blur-lg rounded-xl p-6 shadow-md border border-gray-200 hover:bg-white/80 transition-all duration-300">
                    <h2 className="text-2xl font-bold mb-3 text-gray-800">
                      {movie.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">{movie.overview}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        ⭐ Recommended for you
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
