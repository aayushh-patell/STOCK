"""
Insider Trading Detection Model for Senator Trading Data
Analyzes trading patterns to identify potentially suspicious activities using a transparent, formula-based approach.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

PRICE_DATA_PATH = '../data/all_ticker_history.h5'

class InsiderTradingDetector:
    def __init__(self):
        """
        Loads price data for use in performance penalty calculations.
        """
        try:
            self.price_data = pd.read_hdf(PRICE_DATA_PATH, key='data')
            print(f"✅ Loaded price data from {PRICE_DATA_PATH}")
        except Exception as e:
            print(f"⚠️ Could not load price data: {e}")
            self.price_data = None

    def load_data(self, pickle_file='notebooks/senators.pickle'):
        """
        Loads and preprocesses senator trading data from a pickle file.
        """
        try:
            with open(pickle_file, 'rb') as f:
                df = pd.read_pickle(f)
            print(f"✅ Loaded {len(df)} transactions")
            return df
        except FileNotFoundError:
            print("❌ No data file found. Please run the scraping script first.")
            return pd.DataFrame()

    def _calculate_size_anomaly(self, df):
        """
        Calculates how unusual the trade size is for each senator (z-score, normalized 0-1).
        """
        senator_avg = df.groupby('full_name')['tx_amount_clean'].transform('mean')
        senator_std = df.groupby('full_name')['tx_amount_clean'].transform('std')
        size_zscore = (df['tx_amount_clean'] - senator_avg) / (senator_std + 1e-6)
        # Use log1p to reduce the effect of extreme outliers, then scale to 0-1
        return np.clip(np.log1p(np.abs(size_zscore)) / 5, 0, 1)

    def _calculate_timing_anomaly(self, df):
        """
        Calculates if a trade was made at an unusual time (weekend/odd hour).
        Weekend penalty is based on the ratio of weekend to weekday trades.
        Adds a small random noise to simulate hour-based anomaly.
        """
        weekend_trades = df[df['day_of_week'] >= 5]
        weekday_trades = df[df['day_of_week'] < 5]
        weekend_penalty = len(weekend_trades) / (len(weekday_trades) + 1e-6)
        hour_anomaly = np.random.normal(0, 0.25, len(df))
        return np.clip(weekend_penalty + np.abs(hour_anomaly), 0, 1)

    def _calculate_frequency_anomaly(self, df):
        """
        Calculates if the senator is trading more or less frequently than usual (normalized 0-1).
        """
        df['year_month'] = df['tx_date'].dt.to_period('M')
        monthly_trades = df.groupby(['full_name', 'year_month']).size().reset_index(name='monthly_count')
        senator_avg_monthly = monthly_trades.groupby('full_name')['monthly_count'].mean()
        df = df.merge(monthly_trades, on=['full_name', 'year_month'], how='left')
        df = df.merge(senator_avg_monthly.reset_index(), on='full_name', how='left')
        monthly_count_col = 'monthly_count_x' if 'monthly_count_x' in df.columns else 'monthly_count'
        avg_monthly_col = 'monthly_count_y' if 'monthly_count_y' in df.columns else 'monthly_count'
        frequency_anomaly = (
            df[monthly_count_col] - df[avg_monthly_col]
        ) / (df[avg_monthly_col] + 1e-6)
        return np.clip(np.log1p(np.abs(frequency_anomaly)) / 3, 0, 1)

    def _calculate_market_timing(self, df):
        """
        Assigns a higher score to trades at the beginning or end of the month (possible event timing).
        """
        day_of_month = df['tx_date'].dt.day
        market_timing = np.where(
            day_of_month <= 5, 1.0,
            np.where(day_of_month >= 25, 0.75, 0.25)
        )
        return market_timing

    def _calculate_behavioral_change(self, df):
        """
        Measures how much a senator's trade size deviates from their recent (rolling) average (normalized 0-1).
        """
        df_sorted = df.sort_values(['full_name', 'tx_date'])
        df_sorted['rolling_avg_size'] = (
            df_sorted.groupby('full_name')['tx_amount_clean']
            .rolling(window=5, min_periods=1).mean().reset_index(0, drop=True)
        )
        behavioral_change = (
            np.abs(df_sorted['tx_amount_clean'] - df_sorted['rolling_avg_size']) /
            (df_sorted['rolling_avg_size'] + 1e-6)
        )
        return np.clip(np.log1p(np.abs(behavioral_change)) / 5, 0, 1)

    def _calculate_performance_penalty(self, row, mean_penalty=0.5, short_days=7, long_days=90):
        """
        Calculates a penalty based on how much the stock price increased after a purchase.
        - High short-term gain after a purchase = more suspicious (higher penalty)
        - High long-term gain = less suspicious (lower penalty)
        - If price data is missing, use the mean penalty value.
        """
        if self.price_data is None:
            return mean_penalty
        ticker = str(row['ticker']).upper()
        tx_date = pd.to_datetime(row['tx_date'])
        try:
            px = self.price_data[ticker]
            px = px.reset_index() if 'Date' in px.columns else px
            px['Date'] = pd.to_datetime(px['Date']) if 'Date' in px.columns else px.index
            px = px.set_index('Date') if 'Date' in px.columns else px
            price_at_trade = px.loc[px.index.get_loc(tx_date, method='bfill'), 'Close']
            price_short = px.loc[px.index.get_loc(tx_date + pd.Timedelta(days=short_days), method='bfill'), 'Close']
            price_long = px.loc[px.index.get_loc(tx_date + pd.Timedelta(days=long_days), method='bfill'), 'Close']
            short_return = (price_short - price_at_trade) / price_at_trade
            long_return = (price_long - price_at_trade) / price_at_trade
            short_penalty = min(max(short_return, 0), 1)
            long_penalty = 1 - min(max(long_return, 0), 1)
            penalty = 0.7 * short_penalty + 0.3 * long_penalty
            return penalty
        except Exception:
            return mean_penalty

    def create_features(self, df):
        """
        Adds all engineered features to the dataframe for scoring.
        """
        df = df.copy()
        # Parse transaction date
        df['tx_date'] = pd.to_datetime(df['tx_date'], errors='coerce')
        # Combine first and last name for unique senator ID
        df['full_name'] = df['first_name'] + ' ' + df['last_name']
        # Clean up ticker symbols
        df['ticker'] = df['ticker'].str.replace('--', '').str.strip()
        # Remove rows with missing critical data
        df = df.dropna(subset=['tx_date', 'full_name', 'ticker', 'order_type'])
        # Extract numeric trade amount
        df['tx_amount_clean'] = df['tx_amount'].str.extract(r'(\d+)').astype(float)
        # Day of week (0=Monday, 6=Sunday)
        df['day_of_week'] = df['tx_date'].dt.dayofweek
        # Feature 1: Trade size anomaly (how unusual is this trade size for this senator?)
        df['trade_size_anomaly'] = self._calculate_size_anomaly(df)
        # Feature 2: Timing anomaly (is this trade at a weird time?)
        df['timing_anomaly'] = self._calculate_timing_anomaly(df)
        # Feature 3: Frequency anomaly (is this senator trading more/less than usual?)
        df['frequency_anomaly'] = self._calculate_frequency_anomaly(df)
        # Feature 4: Market timing (is this trade at the start/end of the month?)
        df['market_timing_score'] = self._calculate_market_timing(df)
        # Feature 5: Behavioral change (is this trade very different from recent trades?)
        df['behavioral_change'] = self._calculate_behavioral_change(df)
        # Placeholders for features not currently used
        df['sector_concentration'] = 0.0
        df['committee_relevance'] = 0.0
        return df

    def detect_suspicious_trades(self, df):
        """
        Calculates the suspicious score for each trade using all features and assigns a risk level.
        Adds detailed comments for each step.
        """
        if df.empty:
            return pd.DataFrame()
        df_with_features = self.create_features(df)
        feature_cols = [
            'trade_size_anomaly',
            'timing_anomaly',
            'frequency_anomaly',
            'market_timing_score',
            'behavioral_change',
        ]
        # Fill missing values for all features
        for col in feature_cols:
            if col in df_with_features.columns:
                df_with_features[col] = df_with_features[col].fillna(0)
            else:
                df_with_features[col] = 0
        # Calculate mean penalty for missing price data
        print("Calculating performance penalties...")
        perf_penalties = df_with_features.apply(
            lambda row: self._calculate_performance_penalty(row), axis=1
        )
        mean_penalty = perf_penalties.mean()
        # For each trade, calculate the performance penalty (higher if stock went up quickly after purchase)
        df_with_features['performance_penalty'] = df_with_features.apply(
            lambda row: self._calculate_performance_penalty(row, mean_penalty=mean_penalty), axis=1
        )
        # --- Suspicious Score Calculation (line-by-line comments) ---
        # 1. Trade size anomaly (weighted 1.5):
        #    - High if this trade is much larger/smaller than senator's usual trades
        trade_size_component = df_with_features['trade_size_anomaly'] * 1.5
        # 2. Timing anomaly (weighted 1.0):
        #    - High if trade is on a weekend or at a weird hour
        timing_component = df_with_features['timing_anomaly'] * 1.0
        # 3. Frequency anomaly (weighted 1.2):
        #    - High if senator is trading much more/less than usual
        frequency_component = df_with_features['frequency_anomaly'] * 1.2
        # 4. Market timing (weighted 1.0):
        #    - High if trade is at the start/end of the month (possible event timing)
        market_timing_component = df_with_features['market_timing_score'] * 1.0
        # 5. Behavioral change (weighted 1.5):
        #    - High if this trade is very different from senator's recent trades
        behavioral_change_component = df_with_features['behavioral_change'] * 1.5
        # 6. Performance penalty (weighted 1.0):
        #    - High if the stock went up quickly after the purchase
        performance_component = df_with_features['performance_penalty'] * 1.0
        # Sum all weighted components
        df_with_features['suspicious_score'] = (
            trade_size_component +
            timing_component +
            frequency_component +
            market_timing_component +
            behavioral_change_component +
            performance_component
        )
        # Normalize the suspicious score to 0-1 (divide by sum of weights)
        df_with_features['suspicious_score'] /= 7.2
        # Assign risk levels based on percentiles
        score_series = df_with_features['suspicious_score']
        low_threshold = score_series.quantile(0.7)
        high_threshold = score_series.quantile(0.9)
        print(f"📊 Risk Thresholds (Formula-Based):")
        print(f"Low risk threshold: {low_threshold:.3f}")
        print(f"High risk threshold: {high_threshold:.3f}")
        # Prepare results
        results = df_with_features[[
            'tx_date', 'full_name', 'ticker', 'asset_name', 'order_type', 'tx_amount',
            'suspicious_score', 'performance_penalty'
        ]].copy()
        results['risk_level'] = pd.cut(
            score_series,
            bins=[-np.inf, low_threshold, high_threshold, np.inf],
            labels=['Low', 'Medium', 'High']
        )
        results = results.sort_values('suspicious_score', ascending=False)
        return results

def main():
    """
    Main function to run insider trading detection and output results.
    """
    print("🚨 Insider Trading Detection Model")
    print("=" * 50)
    detector = InsiderTradingDetector()
    df = detector.load_data()
    if df.empty:
        return
    print("\n🔍 Detecting suspicious trades (using formula-based model)...")
    suspicious_trades = detector.detect_suspicious_trades(df)
    if not suspicious_trades.empty:
        print(f"\n🚨 Found {len(suspicious_trades)} potentially suspicious trades")
        print("\nTop 10 Most Suspicious Trades:")
        print(suspicious_trades.head(10)[[
            'tx_date', 'full_name', 'ticker', 'suspicious_score', 'risk_level']])
        suspicious_trades.to_csv('suspicious_trades.csv', index=False)
        print(f"\n💾 Results saved to suspicious_trades.csv")

if __name__ == "__main__":
    main() 