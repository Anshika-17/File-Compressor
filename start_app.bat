@echo off
echo Starting File Compressor App...

echo.
echo Starting FastAPI Backend server on port 3001...
start cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 3001"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting React Frontend on port 3000...
start cmd /k "cd frontend && npm start"

echo.
echo Application started!
echo FastAPI Backend: http://localhost:3001
echo React Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul 