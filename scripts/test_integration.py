#!/usr/bin/env python3
"""
Test script to verify the integrated dashboard is working
"""

import requests
import time
import sys

def test_api_server():
    """Test the API server endpoints."""
    print("🔍 Testing API Server...")
    
    base_url = "http://localhost:8000"
    
    try:
        # Test root endpoint
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Server: {data.get('message', 'Unknown')} v{data.get('version', 'Unknown')}")
        else:
            print(f"❌ API Server: HTTP {response.status_code}")
            return False
            
        # Test statistics endpoint
        response = requests.get(f"{base_url}/api/statistics", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Statistics: {data.get('total_transactions', 0)} transactions, {data.get('total_senators', 0)} senators")
        else:
            print(f"❌ Statistics: HTTP {response.status_code}")
            return False
            
        # Test transactions endpoint
        response = requests.get(f"{base_url}/api/transactions?page=1&limit=1", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Transactions: {data.get('total', 0)} total, {len(data.get('data', []))} in response")
        else:
            print(f"❌ Transactions: HTTP {response.status_code}")
            return False
            
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ API Server: Connection refused - server not running")
        return False
    except requests.exceptions.Timeout:
        print("❌ API Server: Request timeout")
        return False
    except Exception as e:
        print(f"❌ API Server: {e}")
        return False

def test_react_frontend():
    """Test the React frontend."""
    print("\n🔍 Testing React Frontend...")
    
    try:
        # Test React dev server
        response = requests.get("http://localhost:8080", timeout=5)
        if response.status_code == 200:
            if "React" in response.text or "vite" in response.text:
                print("✅ React Frontend: Running on port 8080")
                return True
            else:
                print("❌ React Frontend: Not a React app")
                return False
        else:
            print(f"❌ React Frontend: HTTP {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ React Frontend: Connection refused - server not running")
        return False
    except requests.exceptions.Timeout:
        print("❌ React Frontend: Request timeout")
        return False
    except Exception as e:
        print(f"❌ React Frontend: {e}")
        return False

def test_cors():
    """Test CORS configuration."""
    print("\n🔍 Testing CORS...")
    
    try:
        headers = {"Origin": "http://localhost:8080"}
        response = requests.get("http://localhost:8000/api/statistics", headers=headers, timeout=5)
        
        if response.status_code == 200:
            cors_header = response.headers.get('Access-Control-Allow-Origin')
            if cors_header:
                print(f"✅ CORS: Allowed origin {cors_header}")
                return True
            else:
                print("❌ CORS: No CORS headers found")
                return False
        else:
            print(f"❌ CORS: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ CORS: {e}")
        return False

def main():
    """Main test function."""
    print("🎯 Senator Trading Dashboard - Integration Test")
    print("=" * 50)
    
    # Test API server
    api_ok = test_api_server()
    
    # Test React frontend
    react_ok = test_react_frontend()
    
    # Test CORS
    cors_ok = test_cors()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   API Server: {'✅ PASS' if api_ok else '❌ FAIL'}")
    print(f"   React Frontend: {'✅ PASS' if react_ok else '❌ FAIL'}")
    print(f"   CORS: {'✅ PASS' if cors_ok else '❌ FAIL'}")
    
    if api_ok and react_ok and cors_ok:
        print("\n🎉 All tests passed! Dashboard is ready.")
        print("\n🌐 Access Points:")
        print("   • React Dashboard: http://localhost:8080")
        print("   • API Server: http://localhost:8000")
        print("   • API Docs: http://localhost:8000/docs")
        return True
    else:
        print("\n❌ Some tests failed. Check the services.")
        if not api_ok:
            print("   💡 Start API server: python3 api_server.py")
        if not react_ok:
            print("   💡 Start React: cd frontend && npm run dev")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 