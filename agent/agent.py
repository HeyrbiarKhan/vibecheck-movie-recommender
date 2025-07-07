# agent/agent.py
import google.generativeai as genai
import os
from dotenv import load_dotenv
from search_tool import SearchMoviesTool
import json

# Load environment variables
load_dotenv()

class VibeCheckAgent:
    def __init__(self):
        # Configure Google AI
        api_key = os.getenv('GOOGLE_AI_API_KEY')
        if not api_key:
            raise ValueError("GOOGLE_AI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        
        # Initialize the model
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Initialize movie search tool
        self.movie_tool = SearchMoviesTool()
        
        # System prompt for the agent
        self.system_prompt = """
You are a sophisticated movie concierge and recommendation expert with deep emotional intelligence. 
Your job is to understand ANY kind of user input - whether it's a direct mood, a situation, 
weather, life events, or even random thoughts - and recommend perfect movies.

When a user says ANYTHING, you should:
1. Analyze their emotional context and what they might be feeling
2. Use the search_movies function to find appropriate films
3. Provide a warm, personalized explanation of why these movies match their underlying vibe
4. Consider factors like genre, mood, time period, complexity, and emotional tone

You can interpret ANY input:
- Weather: "It's raining" → cozy, atmospheric movies
- Emotions: "I'm sad" → comforting or cathartic films  
- Situations: "Date night" → romantic comedies
- Random thoughts: "Feeling like pizza" → fun, comfort movies
- Life events: "Just broke up" → healing or empowering films
- Abstract: "Feeling blue" → uplifting or melancholic options

Be conversational, empathetic, and insightful. Explain not just what movies you found, 
but WHY they're perfect for the user's underlying emotional state or situation.

The search_movies function is intelligent and will analyze any input to find relevant movies.
"""

    def chat(self, user_input: str, page: int = 1) -> dict:
        """
        Process user input and return AI-powered movie recommendations
        
        Args:
            user_input: User's description of their mood/vibe
            page: Page number for pagination (default: 1)
            
        Returns:
            Dictionary with AI response and movie data
        """
        try:
            # First, get movie recommendations using our tool
            movie_results = self.movie_tool.search_movies(user_input, page)
            
            # Adjust the AI response based on page number
            if page > 1:
                context = f"""
User's vibe/mood: "{user_input}" (Page {page} - Additional recommendations)

Movie search results:
{json.dumps(movie_results, indent=2)}

The user is looking for more movie recommendations for the same vibe. Provide a brief, 
enthusiastic introduction acknowledging they want more options, then present these 
additional movies with personalized explanations for each one.
"""
            else:
                context = f"""
User's vibe/mood: "{user_input}"

Movie search results:
{json.dumps(movie_results, indent=2)}

Please analyze the user's mood and provide a personalized, warm explanation of why these 
movie recommendations are perfect for their current vibe. If no movies were found or there 
was an error, provide helpful suggestions or alternatives.
"""
            
            # Generate AI response
            full_prompt = f"{self.system_prompt}\n\n{context}"
            response = self.model.generate_content(full_prompt)
            
            return {
                "output": response.text,
                "tool_response": movie_results,
                "user_input": user_input,
                "success": True
            }
            
        except Exception as e:
            return {
                "output": f"I apologize, but I'm having trouble processing your request right now. Please try again later.",
                "tool_response": {"movies": [], "explanation": "Service temporarily unavailable"},
                "user_input": user_input,
                "success": False,
                "error": str(e)
            }

    def cli(self):
        """Interactive command line interface for testing"""
        print("🎬 VibeCheck Movie Agent - Interactive Mode")
        print("Type 'quit' to exit")
        print("-" * 50)
        
        while True:
            try:
                user_input = input("\n💭 What's your vibe? ")
                
                if user_input.lower() in ['quit', 'exit', 'q']:
                    print("👋 Thanks for using VibeCheck!")
                    break
                
                if not user_input.strip():
                    continue
                
                print("\n🤖 Thinking...")
                result = self.chat(user_input)
                
                print(f"\n{result['output']}")
                
                if result['tool_response']['movies']:
                    print(f"\n🎥 Found {len(result['tool_response']['movies'])} movies:")
                    for movie in result['tool_response']['movies'][:3]:  # Show top 3
                        print(f"  • {movie['title']} ({movie.get('releaseDate', 'N/A')[:4]})")
                
            except KeyboardInterrupt:
                print("\n👋 Thanks for using VibeCheck!")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    agent = VibeCheckAgent()
    agent.cli()
