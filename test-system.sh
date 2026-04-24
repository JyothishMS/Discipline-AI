#!/bin/bash
# Test script to verify Discipline AI system is working

echo ""
echo "================================================"
echo "   Discipline AI - System Integration Test"
echo "================================================"
echo ""

# Test Redis connection
echo "🔍 Testing Redis connection..."
curl -s -o /dev/null -w "Redis: %{http_code}\n" http://localhost:6379 2>/dev/null || echo "⚠️  Redis not responding directly (expected - it's a database, not HTTP)"

# Test Backend Health
echo "🔍 Testing Backend health check..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ "$BACKEND_HEALTH" = "200" ]; then
    echo "✅ Backend: $BACKEND_HEALTH (OK)"
else
    echo "❌ Backend: $BACKEND_HEALTH (FAILED)"
fi

# Test Queue Status
echo "🔍 Testing Queue status endpoint..."
QUEUE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/queue/status)
if [ "$QUEUE_STATUS" = "200" ]; then
    echo "✅ Queue: $QUEUE_STATUS (OK)"
else
    echo "❌ Queue: $QUEUE_STATUS (FAILED)"
fi

# Test Frontend availability
echo "🔍 Testing Frontend..."
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [ "$FRONTEND" = "200" ]; then
    echo "✅ Frontend: $FRONTEND (OK)"
else
    echo "⚠️  Frontend: $FRONTEND (might still be starting)"
fi

echo ""
echo "================================================"
echo "   Test Summary"
echo "================================================"
echo ""
echo "If all tests show ✅, your system is ready!"
echo ""
echo "📍 URLs:"
echo "   - Frontend:  http://localhost:5173"
echo "   - Backend:   http://localhost:5000"
echo "   - Redis:     localhost:6379"
echo ""
