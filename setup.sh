#!/bin/bash
echo "🚀 Setting up AI Data Analytics..."
echo ""

# Check node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install from https://nodejs.org"
  exit 1
fi

echo "✅ Node.js $(node -v) found"

# Install deps
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env if missing
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  Created .env file. Please add your Anthropic API key:"
  echo "   Open .env and replace 'your_api_key_here' with your key from:"
  echo "   https://console.anthropic.com"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the app:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
