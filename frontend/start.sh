#!/bin/bash
echo "====================================="
echo "  FB Manager - Frontend Setup"
echo "====================================="

echo "[1/2] Installing Node dependencies..."
npm install

echo "[2/2] Starting Vue dev server..."
echo ""
echo "====================================="
echo "  App running at: http://localhost:5173"
echo "====================================="
npm run dev
