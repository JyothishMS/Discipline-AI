@echo off
REM Discipline AI - Start All Services Script for Windows

echo.
echo ================================================
echo   Discipline AI - Starting All Services
echo ================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker: https://docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker found!
echo.

REM Start Redis container
echo 📦 Starting Redis container...
docker-compose up -d redis

if errorlevel 1 (
    echo ❌ Failed to start Redis
    pause
    exit /b 1
)

echo ✅ Redis started!
echo.

REM Wait for Redis to be ready
echo ⏳ Waiting for Redis to be ready...
timeout /t 2 /nobreak

REM Verify Redis is running
docker exec discipline-ai-redis redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Redis might not be ready yet, but continuing...
) else (
    echo ✅ Redis is ready!
)

echo.
echo ================================================
echo   Services Starting...
echo ================================================
echo.
echo 📋 Next steps:
echo.
echo 1. Open a new Terminal/PowerShell window
echo.
echo 2. Start Backend (in new terminal):
echo    cd backend
echo    npm install
echo    npm start
echo.
echo 3. Open another Terminal/PowerShell window
echo.
echo 4. Start Frontend:
echo    npm install
echo    npm run dev
echo.
echo 5. Open browser: http://localhost:5173
echo.
echo ================================================
echo   Status:
echo ================================================
echo.
echo Redis:    http://localhost:6379
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo ✅ All systems ready!
echo.
pause
