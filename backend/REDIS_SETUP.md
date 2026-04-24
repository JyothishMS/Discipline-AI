# 🚀 Redis Setup Guide (Layer 2 - Caching)

## What is Redis?
**Redis** = In-memory caching layer that stores API responses for 1 hour. When you log the same meals again, you get results **instantly** instead of calling Gemini API ⚡

---

## Installation

### **Option 1: Windows (Easiest)**

#### Download Redis Stack Desktop
1. Go to: https://redis.io/downloads/
2. Download **Redis Stack for Windows**
3. Run installer → Next → Next → Finish
4. Redis starts automatically on `localhost:6379`

#### Verify Installation
```powershell
redis-cli ping
# Should respond: PONG
```

---

### **Option 2: Windows (Using Docker)**

#### Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

#### Start Redis Container
```powershell
docker run -d -p 6379:6379 --name discipline-redis redis:latest
```

#### Verify
```powershell
docker exec discipline-redis redis-cli ping
# Should respond: PONG
```

---

### **Option 3: Linux/Mac**

#### Using Homebrew (Mac)
```bash
brew install redis
brew services start redis
redis-cli ping
```

#### Using apt (Linux)
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
redis-cli ping
```

---

## Restart Backend with Redis

1. **Stop current server** (Ctrl+C)
2. **Start with Redis caching:**
   ```powershell
   cd backend
   npm start
   ```

3. **Check logs:**
   ```
   ✅ Server running on port 5000
   ✅ Redis connected
   🌐 API available at http://localhost:5000
   ```

---

## Testing Cache

### Test 1: First Request (Cache Miss)
```bash
# Go to Diet tab → Add "2 eggs" → Go to Dashboard
# Backend logs: 🔄 Cache MISS - calling Gemini API
# Response time: ~2-3 seconds
```

### Test 2: Same Meal Again (Cache Hit)
```bash
# Go to Diet tab → Add "2 eggs" again
# Backend logs: 📦 Cache HIT - returning cached result
# Response time: <100ms ⚡⚡⚡
```

---

## Configuration

### Update `.env` to customize:
```env
REDIS_HOST=localhost          # Redis server address
REDIS_PORT=6379             # Redis port
REDIS_PASSWORD=your_password # If password protected
```

---

## Fallback Mode (If Redis Unavailable)

**The backend gracefully handles Redis unavailability:**

- ✅ If Redis is down → App still works (direct API calls)
- ✅ No errors or crashes
- ⚠️  Just slower (no caching benefits)

```
⚠️  Redis unavailable, using direct API mode
```

---

## Performance Gains

| Scenario | Without Redis | With Redis |
|----------|---------------|-----------|
| 1st request | ~2-3s | ~2-3s |
| 2nd request (same meal) | ~2-3s | <100ms |
| 10 same requests | ~20-30s | <1s |

**10x speed improvement for cached requests! 🚀**

---

## Troubleshooting

### Redis not connecting?
```powershell
# Check if Redis is running
netstat -ano | findstr :6379

# Manually test connection
redis-cli ping
```

### Still getting "API ERROR" ?
- Verify `GEMINI_API_KEY` in `.env`
- Check internet connection
- Check Gemini API quota

---

## Next: Layer 3 (Bull Queue - Background Jobs)

Want to add background job processing? Say **"Layer 3"** and I'll implement Bull Queue! 🎯

---

**Status: ✅ Redis Caching Layer Active**
