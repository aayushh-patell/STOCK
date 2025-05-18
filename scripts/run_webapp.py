#!/usr/bin/env python3
"""
Simple script to run the Senator Trading Dashboard web application.
"""

import os
import sys
from app import app

def check_data_file():
    """Check if the senator data file exists."""
    data_file = 'notebooks/senators.pickle'
    if not os.path.exists(data_file):
        print("⚠️  Warning: No senator data found!")
        print(f"   Expected file: {data_file}")
        print("   Please run the scraping script first:")
        print("   python3 main.py")
        print()
        print("   The web app will still start, but will show 'No Data Available'")
        print()
    else:
        print("✅ Senator data file found!")
        print()

def main():
    """Main function to run the web application."""
    print("🚀 Starting Senator Trading Dashboard...")
    print()
    
    check_data_file()
    
    print("🌐 Web application will be available at:")
    print("   http://localhost:8080")
    print()
    print("📊 Features:")
    print("   - Interactive dashboard with charts")
    print("   - Senator trading statistics")
    print("   - Stock trading analysis")
    print("   - Recent transactions table")
    print()
    print("🛑 Press Ctrl+C to stop the server")
    print()
    
    try:
        app.run(debug=True, host='0.0.0.0', port=8080)
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Goodbye!")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main() 