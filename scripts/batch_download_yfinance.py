import pandas as pd
import yfinance as yf
from datetime import datetime

# 1. Load senator trading data
# Update the path below if your data is in a different location
TRADING_DATA_PATH = '../data/senator_risk_profiles.csv'  # Change to your actual transaction data file if needed
OUTPUT_PATH = '../data/all_ticker_history.h5'

# Try to use the main transaction data if available
try:
    df = pd.read_csv('../data/senator_trades.csv')
except FileNotFoundError:
    try:
        df = pd.read_csv('../data/suspicious_trades.csv')
    except FileNotFoundError:
        print("Could not find senator_trades.csv or suspicious_trades.csv. Please update the script with the correct file path.")
        exit(1)

# 2. Clean and filter the data
if 'tx_date' not in df.columns or 'ticker' not in df.columns:
    print("Input data must have 'tx_date' and 'ticker' columns.")
    exit(1)

df['tx_date'] = pd.to_datetime(df['tx_date'], errors='coerce')
df = df.dropna(subset=['tx_date', 'ticker'])

# 3. Find the first purchase date for each ticker
# (If you want only purchases, filter by order_type if available)
if 'order_type' in df.columns:
    purchase_df = df[df['order_type'].str.lower().str.contains('purchase')]
else:
    purchase_df = df

ticker_min_dates = purchase_df.groupby('ticker')['tx_date'].min().to_dict()

# 4. Find the earliest date overall (for batch download)
overall_min_date = min(ticker_min_dates.values()).strftime('%Y-%m-%d')
today = datetime.today().strftime('%Y-%m-%d')

# 5. Get the list of unique tickers
tickers = list(ticker_min_dates.keys())

print(f"Downloading data for {len(tickers)} tickers from {overall_min_date} to {today}...")

# 6. Batch download all data from the earliest date to today
data = yf.download(tickers, start=overall_min_date, end=today, group_by='ticker', auto_adjust=True, threads=True)

# 7. Save to disk for future use
data.to_hdf(OUTPUT_PATH, key='data', mode='w')
print(f"Done! Data saved to {OUTPUT_PATH}") 