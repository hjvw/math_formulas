#!/bin/bash

echo "Uruchamiam npm run server..."
npm run server &

sleep 2

echo "Uruchamiam npm run dev..."
npm run dev &

sleep 2


URL="http://localhost:5173"

if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$URL"
else
    xdg-open "$URL"
fi
