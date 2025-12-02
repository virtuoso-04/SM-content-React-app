#!/bin/bash

# Smart Content Studio AI Backend Startup Script

echo "🚀 Starting Smart Content Studio AI Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.template .env
    echo "📝 Please edit .env file and add your Gemini API key before running the server."
    echo "   Get your API key from: https://aistudio.google.com/app/apikey"
    exit 1
fi

# Check if Gemini API key is set
if grep -q "your-gemini-api-key-here" .env; then
    echo "⚠️  Please set your Gemini API key in the .env file"
    echo "   Get your API key from: https://aistudio.google.com/app/apikey"
    exit 1
fi

echo "✅ Backend setup complete!"
echo "🌐 Starting server on http://localhost:8000"
echo "📚 API docs will be available at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Change to backend directory
cd "$(dirname "$0")/../backend"

# Start the server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
