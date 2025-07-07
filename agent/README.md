# VibeCheck AI Agent

This directory contains the Google Agent Development Kit (ADK) implementation that powers the intelligent movie recommendations in VibeCheck.

## Overview

The AI agent uses Google's Gemini Pro model to understand user vibes and moods in natural language, then intelligently calls our movie search backend to find the perfect recommendations.

## Architecture

```
User Input (vibe) → AI Agent (Gemini Pro) → Search Tool → Express Backend → TMDb API
                      ↓
                  Intelligent Analysis & Explanation
```

## Setup

### Prerequisites

- Python 3.8 or higher
- Google AI API key (from Google AI Studio)

### Installation

1. **Navigate to the agent directory:**

   ```bash
   cd agent
   ```

2. **Create and activate virtual environment:**

   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Mac/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**

   ```bash
   # Windows
   set GOOGLE_AI_API_KEY=your_api_key_here

   # Mac/Linux
   export GOOGLE_AI_API_KEY=your_api_key_here
   ```

## Running the Agent

1. **Make sure the Express backend is running** (port 3001)

2. **Start the agent server:**

   ```bash
   python server.py
   ```

3. **The agent will be available at:** `http://localhost:4000`

## Usage

### Direct API Call

```bash
curl -X POST http://localhost:4000/agent \
  -H "Content-Type: application/json" \
  -d '{"input": "I want something cozy for a rainy day"}'
```

### Response Format

```json
{
  "output": "Based on your cozy rainy day vibe, I found some perfect films...",
  "tool_response": {
    "movies": [...],
    "explanation": "...",
    "cached": false,
    "timestamp": "2025-07-06T22:30:00.000Z"
  }
}
```

## Features

- **Natural Language Understanding**: Understands complex mood descriptions
- **Contextual Recommendations**: Considers emotional state, time, weather, etc.
- **Intelligent Explanations**: Provides personalized reasoning for each recommendation
- **Seamless Integration**: Works with existing Express backend and TMDb integration

## Files

- `search_tool.py` - Defines the movie search tool for the agent
- `agent.py` - Main agent configuration with Gemini Pro
- `server.py` - FastAPI server exposing the agent via HTTP
- `requirements.txt` - Python dependencies
- `setup.sh` - Automated setup script

## Environment Variables

- `GOOGLE_AI_API_KEY` - Your Google AI API key (required)
- `TMDB_API_KEY` - TMDb API key (used by backend)

## Development

To test the agent interactively:

```bash
python agent.py
```

This opens a CLI where you can test different vibes and see how the agent responds.

## Troubleshooting

### Common Issues

1. **"Import adk could not be resolved"**

   - Make sure you've activated the virtual environment
   - Install dependencies: `pip install -r requirements.txt`

2. **"Agent server not responding"**

   - Check that the Express backend is running on port 3001
   - Verify your Google AI API key is set correctly

3. **"No movies found"**
   - Ensure TMDb API key is configured in the backend
   - Check backend logs for API call errors

### Logs

The agent server logs all requests and responses. Check the console output for debugging information.
