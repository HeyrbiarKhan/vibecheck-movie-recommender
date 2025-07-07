# agent/server.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from agent import VibeCheckAgent
import uvicorn

# Request/Response models
class AgentRequest(BaseModel):
    input: str
    page: Optional[int] = 1

class AgentResponse(BaseModel):
    output: str
    tool_response: dict
    success: bool
    error: Optional[str] = None

# Initialize FastAPI app
app = FastAPI(title="VibeCheck AI Agent", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174", 
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the AI agent
try:
    agent = VibeCheckAgent()
    print("✅ VibeCheck AI Agent initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize agent: {e}")
    agent = None

@app.get("/")
async def root():
    return {"message": "VibeCheck AI Agent API", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy" if agent else "unhealthy",
        "agent_ready": agent is not None,
        "service": "VibeCheck AI Agent"
    }

@app.post("/agent", response_model=AgentResponse)
async def chat_with_agent(request: AgentRequest):
    if not agent:
        raise HTTPException(status_code=503, detail="AI Agent not available")
    
    if not request.input or not request.input.strip():
        raise HTTPException(status_code=400, detail="Input cannot be empty")
    
    try:
        result = agent.chat(request.input.strip(), page=request.page)
        
        return AgentResponse(
            output=result["output"],
            tool_response=result["tool_response"],
            success=result["success"],
            error=result.get("error")  # This will be None if not present
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting VibeCheck AI Agent Server...")
    uvicorn.run(app, host="0.0.0.0", port=4001)
