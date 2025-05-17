#!/usr/bin/env python3
"""
Launcher for the ML Insider Trading Detection Dashboard
"""

import os
import sys
import subprocess
import time

def check_dependencies():
    """Check if required packages are installed."""
    try:
        import sklearn
        import numpy
        import pandas
        import flask
        print("✅ All ML dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip3 install -r requirements.txt")
        return False

def check_data_file():
    """Check if senator data exists."""
    data_file = 'notebooks/senators.pickle'
    if os.path.exists(data_file):
        print("✅ Senator data file found")
        return True
    else:
        print("⚠️  No senator data found!")
        print(f"   Expected file: {data_file}")
        print("   Please run the scraping script first:")
        print("   python3 main.py")
        print()
        print("   The ML dashboard will still start, but will show 'No Data Available'")
        print()
        return False

def main():
    """Main function to launch the ML dashboard."""
    print("🚨 ML Insider Trading Detection Dashboard")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        return
    
    # Check data
    check_data_file()
    
    print("🌐 Starting ML Dashboard...")
    print("   URL: http://localhost:8081")
    print("   Features:")
    print("   - Suspicious trade detection using ML")
    print("   - Senator risk profiles")
    print("   - Interactive visualizations")
    print("   - Real-time analysis")
    print()
    print("🛑 Press Ctrl+C to stop the server")
    print()
    
    try:
        # Import and run the ML dashboard
        from ml_dashboard import app
        app.run(host='0.0.0.0', port=8081, debug=True)
    except KeyboardInterrupt:
        print("\n👋 ML Dashboard stopped")
    except Exception as e:
        print(f"❌ Error starting ML dashboard: {e}")
        print("Make sure all dependencies are installed and the data file exists.")

if __name__ == "__main__":
    main() 