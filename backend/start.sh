#!/bin/bash

# Smart Content Studio AI Backend - Startup Script
# Clean, robust backend with multi-model AI routing

echo "🚀 Starting Smart Content Studio AI Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet

# Check for .env file
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  WARNING: .env file not found!"
    echo "📝 Please create .env file with your API keys:"
    echo ""
    echo "GEMINI_API_KEY=your_key_here"
    echo "GROQ_API_KEY=your_key_here"
    echo "MISTRAL_API_KEY=your_key_here"
    echo ""
    read -p "Press Enter to continue anyway..."
fi

echo ""
echo "✅ Setup complete!"
echo "🌐 Starting server at http://localhost:8000"
echo "📚 API Docs at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start the FastAPI server
python main.py
