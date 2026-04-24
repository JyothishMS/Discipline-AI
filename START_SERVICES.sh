#!/bin/bash

# Discipline AI - Start All Services Script for Mac/Linux

echo ""
echo "================================================"
echo "   Discipline AI - Starting All Services"
echo "================================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "Please install Docker: https://docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker found!"
echo ""

# Start Redis container
echo "📦 Starting Redis container..."
docker-compose up -d redis

if [ $? -ne 0 ]; then
    echo "❌ Failed to start Redis"
    exit 1
fi

echo "✅ Redis started!"
echo ""

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
sleep 2

# Verify Redis is running
docker exec discipline-ai-redis redis-cli ping > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Redis is ready!"
else
    echo "⚠️  Redis might not be ready yet, but continuing..."
fi

echo ""
echo "================================================"
echo "   Services Starting..."
echo "================================================"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Open a new Terminal window"
echo ""
echo "2. Start Backend (in new terminal):"
echo "   cd backend"
echo "   npm install"
echo "   npm start"
echo ""
echo "3. Open another Terminal window"
echo ""
echo "4. Start Frontend:"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "5. Open browser: http://localhost:5173"
echo ""
echo "================================================"
echo "   Status:"
echo "================================================"
echo ""
echo "Redis:    http://localhost:6379"
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""
echo "✅ All systems ready!"
echo ""
