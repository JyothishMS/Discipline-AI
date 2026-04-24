@echo off
REM Test script to verify Discipline AI system is working

echo.
echo ================================================
echo    Discipline AI - System Integration Test
echo ================================================
echo.

REM Test Backend Health
echo [*] Testing Backend health check...
for /f %%A in ('powershell -Command "try { (Invoke-WebRequest -Uri 'http://localhost:5000/health' -TimeoutSec 2 -ErrorAction SilentlyContinue).StatusCode } catch { Write-Output '000' }"') do set BACKEND_HEALTH=%%A

if "%BACKEND_HEALTH%"=="200" (
    echo [✓] Backend: %BACKEND_HEALTH% (OK)
) else (
    echo [✗] Backend: %BACKEND_HEALTH% (FAILED)
)

REM Test Queue Status
echo [*] Testing Queue status endpoint...
for /f %%A in ('powershell -Command "try { (Invoke-WebRequest -Uri 'http://localhost:5000/queue/status' -TimeoutSec 2 -ErrorAction SilentlyContinue).StatusCode } catch { Write-Output '000' }"') do set QUEUE_STATUS=%%A

if "%QUEUE_STATUS%"=="200" (
    echo [✓] Queue: %QUEUE_STATUS% (OK)
) else (
    echo [✗] Queue: %QUEUE_STATUS% (FAILED)
)

REM Test Frontend availability
echo [*] Testing Frontend...
for /f %%A in ('powershell -Command "try { (Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 2 -ErrorAction SilentlyContinue).StatusCode } catch { Write-Output '000' }"') do set FRONTEND=%%A

if "%FRONTEND%"=="200" (
    echo [✓] Frontend: %FRONTEND% (OK)
) else (
    echo [!] Frontend: %FRONTEND% (might still be starting)
)

echo.
echo ================================================
echo    Test Summary
echo ================================================
echo.
echo If all tests show [✓], your system is ready!
echo.
echo URLs:
echo    - Frontend:  http://localhost:5173
echo    - Backend:   http://localhost:5000
echo    - Redis:     localhost:6379
echo.
pause
