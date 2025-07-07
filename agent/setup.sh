#!/bin/bash
# agent/setup.sh

echo "Setting up VibeCheck AI Agent..."

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
pip install -r requirements.txt

echo "Setup complete! To run the agent:"
echo "1. Activate the virtual environment:"
echo "   Windows: venv\\Scripts\\activate"
echo "   Mac/Linux: source venv/bin/activate"
echo "2. Set your Google AI API key:"
echo "   export GOOGLE_AI_API_KEY=your_api_key_here"
echo "3. Start the agent server:"
echo "   python server.py"
