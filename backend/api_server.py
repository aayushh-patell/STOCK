"""
FastAPI server to serve senator trading data to the React frontend
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import pickle
import os
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import numpy as np

# Update paths for new directory structure
DATA_DIR = "../data"
SENATOR_RISK_FILE = os.path.join(DATA_DIR, "senator_risk_profiles.csv")
SUSPICIOUS_TRADES_FILE = os.path.join(DATA_DIR, "suspicious_trades.csv")

app = FastAPI(title="Senator Trading API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global data storage
transactions_df = None
senator_risk_df = None
timeline_cache = {}  # Cache for timeline data

def load_data():
    """Load the senator trading data from CSV files."""
    global transactions_df, senator_risk_df
    
    try:
        # Load ML analysis results (suspicious trades)
        if os.path.exists(SUSPICIOUS_TRADES_FILE):
            transactions_df = pd.read_csv(SUSPICIOUS_TRADES_FILE)
            print(f"✅ Loaded {len(transactions_df)} suspicious trades")
        else:
            print(f"❌ Could not find suspicious trades file: {SUSPICIOUS_TRADES_FILE}")
            return False
        
        # Load senator risk profiles
        if os.path.exists(SENATOR_RISK_FILE):
            senator_risk_df = pd.read_csv(SENATOR_RISK_FILE)
            print(f"✅ Loaded {len(senator_risk_df)} senator risk profiles")
        else:
            print(f"❌ Could not find senator risk file: {SENATOR_RISK_FILE}")
            return False
        
        # Clean dataframes to ensure JSON serialization
        if transactions_df is not None:
            transactions_df = clean_dataframe(transactions_df)
            print("✅ Cleaned transaction data")
        
        if senator_risk_df is not None:
            senator_risk_df = clean_dataframe(senator_risk_df)
            print("✅ Cleaned senator risk data")
            
        return True
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return False

def pre_cache_common_ranges():
    """Pre-cache common time ranges for better performance."""
    global transactions_df, timeline_cache
    
    if transactions_df is None:
        return
    
    print("🔄 Pre-caching common timeline ranges...")
    
    # Get the full date range
    timeline_df = transactions_df.copy()
    if 'tx_date' not in timeline_df.columns:
        return
    
    timeline_df['tx_date'] = pd.to_datetime(timeline_df['tx_date'])
    max_date = timeline_df['tx_date'].max()
    
    # Pre-cache common ranges
    common_ranges = [
        (None, None),  # All time
        ((max_date - pd.Timedelta(days=30)).strftime('%Y-%m-%d'), max_date.strftime('%Y-%m-%d')),  # 30D
        ((max_date - pd.Timedelta(days=90)).strftime('%Y-%m-%d'), max_date.strftime('%Y-%m-%d')),  # 90D
        ((max_date - pd.Timedelta(days=365)).strftime('%Y-%m-%d'), max_date.strftime('%Y-%m-%d')),  # 1Y
    ]
    
    for start_date, end_date in common_ranges:
        generate_timeline_data(start_date, end_date)
    
    print(f"✅ Pre-cached {len(timeline_cache)} timeline ranges")

@app.on_event("startup")
async def startup_event():
    """Load data when server starts."""
    print("🚀 Starting Senator Trading API Server...")
    success = load_data()
    if not success:
        print("⚠️  No data loaded - API will return empty results")
    else:
        pre_cache_common_ranges()

@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "message": "Senator Trading Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "/api/transactions": "Get all transactions",
            "/api/senator-risk": "Get senator risk profiles", 
            "/api/statistics": "Get summary statistics",
            "/api/chart-data": "Get data for charts"
        }
    }

@app.get("/api/transactions")
async def get_transactions(
    page: int = 1,
    limit: int = 50,
    search: Optional[str] = None,
    risk_level: Optional[str] = None,
    senator: Optional[str] = None,
    ticker: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    sort_field: Optional[str] = None,
    sort_direction: Optional[str] = None
):
    """Get paginated transactions with filtering."""
    if transactions_df is None:
        return {"data": [], "total": 0, "page": page, "total_pages": 0}
    
    # Apply filters
    filtered_df = transactions_df.copy()
    
    if search:
        search_lower = search.lower()
        filtered_df = filtered_df[
            filtered_df['full_name'].str.lower().str.contains(search_lower) |
            filtered_df['ticker'].str.lower().str.contains(search_lower)
        ]
    
    if risk_level:
        filtered_df = filtered_df[filtered_df['risk_level'] == risk_level]
    
    if senator:
        filtered_df = filtered_df[filtered_df['full_name'] == senator]
    
    if ticker:
        filtered_df = filtered_df[filtered_df['ticker'].str.lower().str.contains(ticker.lower())]
    
    if start_date:
        filtered_df = filtered_df[filtered_df['tx_date'] >= start_date]
    
    if end_date:
        filtered_df = filtered_df[filtered_df['tx_date'] <= end_date]
    
    # Apply sorting
    if sort_field and sort_direction:
        # Map frontend field names to dataframe column names
        field_mapping = {
            'tx_date': 'tx_date',
            'full_name': 'full_name', 
            'ticker': 'ticker',
            'order_type': 'order_type',
            'suspicious_score': 'suspicious_score'
        }
        
        if sort_field in field_mapping:
            column = field_mapping[sort_field]
            if column in filtered_df.columns:
                # Handle date sorting
                if column == 'tx_date':
                    filtered_df['tx_date'] = pd.to_datetime(filtered_df['tx_date'])
                
                # Sort the dataframe
                ascending = sort_direction.lower() == 'asc'
                filtered_df = filtered_df.sort_values(by=column, ascending=ascending)
    
    # Pagination
    total = len(filtered_df)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    page_data = filtered_df.iloc[start_idx:end_idx]
    
    # Convert to list of dictionaries
    transactions = []
    for _, row in page_data.iterrows():
        try:
            transaction = {
                "tx_date": str(row['tx_date']) if pd.notna(row['tx_date']) else '',
                "full_name": str(row['full_name']) if pd.notna(row['full_name']) else '',
                "ticker": str(row['ticker']) if pd.notna(row['ticker']) else '',
                "order_type": str(row['order_type']) if pd.notna(row['order_type']) else '',
                "tx_amount": str(row['tx_amount']) if pd.notna(row['tx_amount']) else '',
                "suspicious_score": clean_numeric_value(row['suspicious_score']) if 'suspicious_score' in row else 0.0,
                "risk_level": str(row['risk_level']) if 'risk_level' in row and pd.notna(row['risk_level']) else 'Low'
            }
            transactions.append(transaction)
        except Exception as e:
            print(f"Warning: Skipping problematic row due to error: {e}")
            # Add a safe default transaction
            transaction = {
                "tx_date": "",
                "full_name": "Data Error",
                "ticker": "",
                "order_type": "",
                "tx_amount": "",
                "suspicious_score": 0.0,
                "risk_level": "Low"
            }
            transactions.append(transaction)
    
    return {
        "data": transactions,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

@app.get("/api/senator-risk")
async def get_senator_risk():
    """Get senator risk profiles."""
    if senator_risk_df is None:
        return []
    
    senators = []
    for _, row in senator_risk_df.iterrows():
        senator = {
            "full_name": row['full_name'],
            "total_trades": int(clean_numeric_value(row['total_trades'])),
            "high_risk_trades": int(clean_numeric_value(row['high_risk_trades'])),
            "risk_percentage": clean_numeric_value(row['risk_percentage']),
            "avg_suspicious_score": clean_numeric_value(row['avg_suspicious_score']),
            "max_score": clean_numeric_value(row['max_suspicious_score'])
        }
        senators.append(senator)
    
    return senators

@app.get("/api/statistics")
async def get_statistics():
    """Get summary statistics for the dashboard."""
    if transactions_df is None:
        return {
            "total_transactions": 0,
            "high_risk_trades": 0,
            "avg_suspicious_score": 0,
            "total_senators": 0
        }
    
    total_transactions = len(transactions_df)
    high_risk_trades = len(transactions_df[transactions_df['risk_level'] == 'High']) if 'risk_level' in transactions_df.columns else 0
    avg_suspicious_score = float(transactions_df['suspicious_score'].mean()) if 'suspicious_score' in transactions_df.columns else 0.0
    total_senators = transactions_df['full_name'].nunique()
    
    return {
        "total_transactions": total_transactions,
        "high_risk_trades": high_risk_trades,
        "avg_suspicious_score": round(avg_suspicious_score, 3),
        "total_senators": total_senators
    }

@app.get("/api/chart-data")
async def get_chart_data(start_date: Optional[str] = None, end_date: Optional[str] = None):
    """Get data for charts, with an optional date range for the timeline."""
    if transactions_df is None:
        return {
            "risk_distribution": {},
            "top_senators": [],
            "top_tickers": [],
            "trading_timeline": []
        }
    
    # Risk level distribution (not date-dependent)
    risk_distribution = {}
    if 'risk_level' in transactions_df.columns:
        risk_counts = transactions_df['risk_level'].value_counts()
        risk_distribution = {
            "Low": int(risk_counts.get('Low', 0)),
            "Medium": int(risk_counts.get('Medium', 0)),
            "High": int(risk_counts.get('High', 0))
        }
    
    # Top senators by risk (not date-dependent)
    top_senators = []
    if senator_risk_df is not None:
        top_senators_data = senator_risk_df.head(10)
        for _, row in top_senators_data.iterrows():
            top_senators.append({
                "name": row['full_name'],
                "avg_score": float(row['avg_suspicious_score']),
                "risk_percentage": float(row['risk_percentage'])
            })
    
    # Top tickers (not date-dependent)
    top_tickers = []
    ticker_counts = transactions_df['ticker'].value_counts().head(10)
    for ticker, count in ticker_counts.items():
        top_tickers.append({
            "ticker": ticker,
            "count": int(count)
        })
    
    # --- Trading timeline (now date-dependent) ---
    trading_timeline = generate_timeline_data(start_date, end_date)
    
    return {
        "risk_distribution": risk_distribution,
        "top_senators": top_senators,
        "top_tickers": top_tickers,
        "trading_timeline": trading_timeline
    }

@app.get("/api/filters")
async def get_filters():
    """Get available filter options."""
    if transactions_df is None:
        return {
            "senators": [],
            "tickers": [],
            "risk_levels": ["Low", "Medium", "High"]
        }
    
    senators = sorted(transactions_df['full_name'].unique().tolist())
    
    # Fix ticker sorting by converting to strings and handling NaN values
    tickers = transactions_df['ticker'].dropna().astype(str).unique().tolist()
    tickers = sorted([ticker for ticker in tickers if ticker != 'nan' and ticker.strip()])
    
    risk_levels = ["Low", "Medium", "High"]
    
    return {
        "senators": senators,
        "tickers": tickers,
        "risk_levels": risk_levels
    }

def clean_numeric_value(value):
    """Clean numeric values to ensure they are JSON serializable."""
    if pd.isna(value) or value is None:
        return 0.0
    if isinstance(value, (int, float)):
        if np.isinf(value) or pd.isna(value):
            return 0.0
        # Handle extremely large values
        if abs(value) > 1e308:
            return 0.0
        return float(value)
    try:
        cleaned = float(value)
        if np.isinf(cleaned) or pd.isna(cleaned) or abs(cleaned) > 1e308:
            return 0.0
        return cleaned
    except (ValueError, TypeError, OverflowError):
        return 0.0

def clean_dataframe(df):
    """Clean dataframe to ensure all values are JSON serializable."""
    if df is None:
        return df
    
    # Clean numeric columns
    numeric_columns = df.select_dtypes(include=[np.number]).columns
    for col in numeric_columns:
        df[col] = df[col].apply(clean_numeric_value)
    
    # Clean suspicious_score specifically
    if 'suspicious_score' in df.columns:
        df['suspicious_score'] = df['suspicious_score'].apply(clean_numeric_value)
    
    # Clean any other potentially problematic columns
    for col in df.columns:
        if df[col].dtype == 'object':
            # Replace any NaN strings or problematic values
            df[col] = df[col].fillna('')
            df[col] = df[col].astype(str).replace(['nan', 'None', 'null'], '')
    
    return df

def generate_timeline_data(start_date=None, end_date=None):
    """Generate timeline data for a given date range and cache it."""
    global timeline_cache, transactions_df
    
    if transactions_df is None:
        return []
    
    # Create cache key
    cache_key = f"{start_date}_{end_date}"
    
    # Check if data is already cached
    if cache_key in timeline_cache:
        return timeline_cache[cache_key]
    
    timeline_df = transactions_df.copy()
    if 'tx_date' not in timeline_df.columns:
        return []
    
    timeline_df['tx_date'] = pd.to_datetime(timeline_df['tx_date'])
    
    # Determine date range for timeline
    if start_date and end_date:
        range_start = pd.to_datetime(start_date)
        range_end = pd.to_datetime(end_date)
    else:
        # Show the full date range of the data when no specific dates are provided
        range_start = timeline_df['tx_date'].min()
        range_end = timeline_df['tx_date'].max()
    
    # Create a continuous date range
    date_range = pd.date_range(start=range_start, end=range_end, freq='D')
    
    trading_timeline = []
    for date in date_range:
        date_str = date.strftime('%Y-%m-%d')
        
        day_transactions = timeline_df[timeline_df['tx_date'].dt.date == date.date()]
        
        suspicious_count = len(day_transactions[
            (day_transactions['risk_level'] == 'High') | 
            (day_transactions['suspicious_score'] > 0.7)
        ]) if 'risk_level' in day_transactions.columns else 0
        
        trading_timeline.append({
            "date": date_str,
            "transactions": int(len(day_transactions)),
            "suspicious": int(suspicious_count)
        })
    
    # Cache the result
    timeline_cache[cache_key] = trading_timeline
    return trading_timeline

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Senator Trading API Server...")
    print("📊 API will be available at: http://localhost:8000")
    print("📖 API docs at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000) 