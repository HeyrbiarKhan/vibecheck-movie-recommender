const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const AGENT_BASE_URL =
  import.meta.env.VITE_AGENT_URL || "http://localhost:4001";

// Flag to switch between direct backend and AI agent
const USE_AI_AGENT = import.meta.env.VITE_USE_AI_AGENT === "true" || true;

export async function searchMovies(vibe, page = 1) {
  if (!vibe || typeof vibe !== "string" || vibe.trim().length === 0) {
    throw new Error("Please provide a valid vibe description.");
  }

  try {
    if (USE_AI_AGENT) {
      // Use the AI Agent for intelligent recommendations
      const response = await fetch(`${AGENT_BASE_URL}/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: vibe.trim(),
          page: page,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Agent error: ${response.status} ${response.statusText}`
        );
      }

      const agentResult = await response.json();

      // Extract movies and explanation from agent response
      return {
        movies: agentResult.tool_response?.movies || [],
        explanation:
          agentResult.output ||
          agentResult.tool_response?.explanation ||
          "The AI found some great movies for you!",
        cached: agentResult.tool_response?.cached || false,
        timestamp:
          agentResult.tool_response?.timestamp || new Date().toISOString(),
        aiGenerated: true,
      };
    } else {
      // Fallback to direct backend call
      const response = await fetch(`${API_BASE_URL}/movies/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vibe: vibe.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      return {
        movies: data.movies || [],
        explanation:
          data.explanation ||
          `Found ${data.movies?.length || 0} movies for your vibe "${vibe}"!`,
        cached: data.cached || false,
        timestamp: data.timestamp || new Date().toISOString(),
        aiGenerated: false,
      };
    }
  } catch (error) {
    console.error("Error searching movies:", error);

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Unable to connect to the movie service. Please check if the backend is running."
      );
    }

    throw error;
  }
}

// Keep this function for backward compatibility, but it's now redundant
export async function generateExplanation(vibe, movies) {
  return `Found ${movies.length} movies for your vibe "${vibe}"!`;
}
