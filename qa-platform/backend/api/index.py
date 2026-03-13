import sys
import os

# Ensure src is importable from /var/task (Vercel working directory)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.main import app
