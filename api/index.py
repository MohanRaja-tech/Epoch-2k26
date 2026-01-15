"""
EPOCH 2026 - Flask Backend for Vercel
"""
import sys
import os

# Add parent directory to path to import app
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

# Import the Flask app
from app import app

# Export the app for Vercel
app = app

