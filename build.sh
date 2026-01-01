#!/bin/bash
set -e

echo "🐍 Installation des dépendances Python..."
pip install -r requirements.txt

echo "📦 Build de l'application Node.js..."
npm run build

echo "✅ Build terminé avec succès !"
