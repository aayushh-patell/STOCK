#!/usr/bin/env python3
"""
Launcher script for the integrated Senator Trading Analysis dashboard
Starts both the Python API server and React frontend
"""

import subprocess
import sys
import os
import time
import signal
import threading
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed."""
    print("🔍 Checking dependencies...")
    
    # Check Python dependencies
    try:
        import fastapi
        import uvicorn
        print("✅ FastAPI and uvicorn available")
    except ImportError:
        print("❌ FastAPI not found. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn"], check=True)
    
    # Check if Node.js is available
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js available: {result.stdout.strip()}")
        else:
            raise Exception("Node.js not found")
    except Exception:
        print("❌ Node.js not found. Please install Node.js to run the React frontend.")
        return False
    
    # Check if npm is available
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ npm available: {result.stdout.strip()}")
        else:
            raise Exception("npm not found")
    except Exception:
        print("❌ npm not found. Please install npm to run the React frontend.")
        return False
    
    return True

def install_react_dependencies():
    """Install React dependencies if needed."""
    frontend_dir = Path("../frontend")
    if not frontend_dir.exists():
        print("❌ frontend directory not found!")
        return False
    
    node_modules = frontend_dir / "node_modules"
    if not node_modules.exists():
        print("📦 Installing React dependencies...")
        try:
            subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)
            print("✅ React dependencies installed")
        except subprocess.CalledProcessError:
            print("❌ Failed to install React dependencies")
            return False
    else:
        print("✅ React dependencies already installed")
    
    return True

def start_api_server():
    """Start the FastAPI server."""
    print("🚀 Starting API server...")
    backend_dir = Path("../backend")
    try:
        subprocess.run([sys.executable, "api_server.py"], cwd=backend_dir, check=True)
    except KeyboardInterrupt:
        print("\n🛑 API server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ API server failed to start: {e}")

def start_react_frontend():
    """Start the React development server."""
    print("🚀 Starting React frontend...")
    frontend_dir = Path("../frontend")
    
    try:
        subprocess.run(["npm", "run", "dev"], cwd=frontend_dir, check=True)
    except KeyboardInterrupt:
        print("\n🛑 React frontend stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ React frontend failed to start: {e}")

def main():
    """Main launcher function."""
    print("🎯 Senator Trading Analysis - Integrated Dashboard Launcher")
    print("=" * 60)
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Dependency check failed. Please install missing dependencies.")
        return
    
    # Install React dependencies
    if not install_react_dependencies():
        print("\n❌ Failed to install React dependencies.")
        return
    
    print("\n🎉 All dependencies ready!")
    print("\n📋 Starting services...")
    print("   • API Server: http://localhost:8000")
    print("   • React Frontend: http://localhost:5173")
    print("   • API Documentation: http://localhost:8000/docs")
    print("\n💡 Press Ctrl+C to stop all services")
    print("-" * 60)
    
    # Start API server in a separate thread
    api_thread = threading.Thread(target=start_api_server, daemon=True)
    api_thread.start()
    
    # Wait a moment for API server to start
    time.sleep(3)
    
    # Start React frontend
    try:
        start_react_frontend()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")
    
    print("\n👋 Dashboard stopped")

if __name__ == "__main__":
    main() 