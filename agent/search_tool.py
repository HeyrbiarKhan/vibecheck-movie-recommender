# agent/search_tool.py
import requests
import json
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SearchMoviesTool:
    """Intelligent tool to search for movies based on any natural language input"""
    
    def __init__(self):
        self.backend_url = "http://localhost:3001/api/movies/search"
        
        # Initialize Gemini for vibe analysis
        api_key = os.getenv('GOOGLE_AI_API_KEY')
        if not api_key:
            raise ValueError("GOOGLE_AI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def _analyze_vibe_with_ai(self, user_input: str) -> str:
        """Use AI to analyze user input and extract movie preferences"""
        
        prompt = f"""
        Analyze this user input and extract the key movie preferences: "{user_input}"
        
        Based on the input, determine what kind of movies the user wants. Consider:
        - Mood/vibe (happy, sad, energetic, calm, mysterious, etc.)
        - Genres (comedy, drama, action, horror, romance, sci-fi, etc.) 
        - Themes (friendship, love, adventure, family, etc.)
        - Setting/context (rainy day, date night, with friends, etc.)
        
        Respond with 2-4 key descriptive words/phrases that capture the essence of what movies would match this vibe.
        Focus on emotions, genres, and themes rather than literal interpretations.
        
        Examples:
        - "It's raining here" → "cozy atmospheric drama mystery"
        - "I feel sad" → "emotional drama heartfelt"
        - "Need something fun with friends" → "comedy adventure fun group"
        - "Date night vibes" → "romantic comedy feel-good"
        - "Can't sleep, need distraction" → "thriller mystery engaging"
        
        Respond with only the key words/phrases, separated by spaces:
        """
        
        try:
            response = self.model.generate_content(prompt)
            analyzed_vibe = response.text.strip()
            print(f"🧠 AI analyzed '{user_input}' → '{analyzed_vibe}'")
            return analyzed_vibe
        except Exception as e:
            print(f"❌ Error analyzing vibe with AI: {e}")
            # Fallback to original input
            return user_input
    
    def search_movies(self, user_input: str, page: int = 1) -> dict:
        """
        Intelligently search for movies based on any natural language input
        
        Args:
            user_input: Any natural language description of mood/vibe/preferences
            page: Page number for pagination (default: 1)
            
        Returns:
            Dictionary with movies array and explanation
        """
        try:
            # Use AI to analyze the user input and extract movie preferences
            analyzed_vibe = self._analyze_vibe_with_ai(user_input)
            
            # Search using the AI-analyzed vibe with pagination
            response = requests.post(
                self.backend_url,
                json={
                    "vibe": analyzed_vibe,
                    "page": page
                },
                headers={"Content-Type": "application/json"},
                timeout=20
            )
            
            if response.status_code == 200:
                result = response.json()
                # Update the explanation to mention the original input
                if result.get("movies"):
                    result["explanation"] = f"Based on your input '{user_input}', {result.get('explanation', '')}"
                return result
            else:
                return {
                    "movies": [],
                    "explanation": f"Error searching for movies: {response.status_code}",
                    "error": True
                }
                
        except requests.exceptions.RequestException as e:
            return {
                "movies": [],
                "explanation": f"Failed to connect to movie service: {str(e)}",
                "error": True
            }
        except Exception as e:
            return {
                "movies": [],
                "explanation": f"Error analyzing your request: {str(e)}",
                "error": True
            }
