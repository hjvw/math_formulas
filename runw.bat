echo Uruchamiam npm run server...
start "" cmd /c "npm run server"

timeout /t 2 >nul

echo Uruchamiam npm run dev...
start "" cmd /c "npm run dev"

timeout /t 2 >nul

echo Otwieram localhost Vite...
start http://localhost:5173
