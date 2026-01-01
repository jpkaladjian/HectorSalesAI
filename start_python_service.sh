#!/bin/bash

# Script de démarrage du service Python Hector Ready
echo "🚀 Démarrage du service Python Hector Ready..."

# Configuration
export PYTHON_SERVICE_PORT=5001
export PYTHONPATH=/home/runner/$REPL_SLUG/src:$PYTHONPATH

# Démarrer uvicorn
cd /home/runner/$REPL_SLUG
python3 src/api/main.py
