# 🎯 Senator Trading Analysis - Integrated Dashboard

A modern, interactive dashboard for analyzing U.S. Senator stock trading data with machine learning-powered insider trading detection.

## 🚀 Quick Start

### Option 1: One-Command Launch (Recommended)
```bash
python3 run_dashboard.py
```

This will:
- ✅ Check and install dependencies
- 🚀 Start the Python API server
- 🎨 Launch the React frontend
- 📊 Open the dashboard in your browser

### Option 2: Manual Launch
```bash
# Terminal 1: Start API server
python3 api_server.py

# Terminal 2: Start React frontend
cd frontend
npm install
npm run dev
```

## 📊 Dashboard Features

### 🎨 Modern UI/UX
- **Dark Theme**: Professional dark interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Auto-refreshes data every 30 seconds
- **Interactive Charts**: Powered by Recharts
- **Advanced Filtering**: Search, date ranges, risk levels

### 📈 Data Visualization
- **Risk Distribution**: Pie chart showing Low/Medium/High risk trades
- **Top Senators**: Bar chart of highest-risk senators
- **Trading Timeline**: Line chart of trading activity over time
- **Top Tickers**: Most traded stocks
- **Suspicious Score Bars**: Visual risk indicators

### 🔍 Advanced Analytics
- **Real-time Statistics**: Total transactions, high-risk trades, average scores
- **Senator Risk Profiles**: Individual senator analysis
- **Suspicious Trade Detection**: ML-powered risk scoring
- **Pagination**: Handle large datasets efficiently
- **Sorting**: Sort by any column

### 🛡️ Data Tables
- **Suspicious Trades**: High-risk transactions highlighted
- **Senator Risk Profiles**: Individual senator statistics
- **All Transactions**: Complete dataset with filtering
- **Export Ready**: Data formatted for analysis

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Frontend │    │  FastAPI Server │    │  Python Backend │
│   (Port 8080)   │◄──►│   (Port 8000)   │◄──►│  Data Analysis  │
│                 │    │                 │    │                 │
│ • Modern UI     │    │ • REST API      │    │ • Data Loading  │
│ • Real-time     │    │ • CORS Enabled  │    │ • Parsing Model │
│ • Interactive   │    │ • Pagination    │    │ • CSV Export    │
│ • Responsive    │    │ • Filtering     │    │ • Pickle Files  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 API Endpoints

The FastAPI server provides these endpoints:

- `GET /api/transactions` - Get paginated transactions with filtering
- `GET /api/senator-risk` - Get senator risk profiles
- `GET /api/statistics` - Get summary statistics
- `GET /api/chart-data` - Get data for charts
- `GET /api/filters` - Get available filter options

## 🎯 Key Features

### 1. **Real-time Data Integration**
- Auto-loads from `suspicious_trades.csv` and `senator_risk_profiles.csv`
- Live updates every 30 seconds

### 2. **Advanced Filtering**
- **Search**: By senator name or ticker symbol
- **Date Range**: Filter by transaction dates
- **Risk Level**: Low/Medium/High risk trades
- **Senator**: Filter by specific senator
- **Ticker**: Filter by stock symbol

### 3. **Interactive Visualizations**
- **Risk Distribution Chart**: Shows proportion of risk levels
- **Top Senators Chart**: Senators with highest risk scores
- **Trading Timeline**: Activity over the last 30 days
- **Top Tickers Chart**: Most frequently traded stocks

### 4. **Comprehensive Data Tables**
- **Suspicious Trades**: High-risk transactions with visual indicators
- **Senator Risk Profiles**: Individual senator statistics and risk percentages
- **All Transactions**: Complete dataset with server-side pagination

### 5. **Professional UI Components**
- **Metrics Cards**: Key statistics with trend indicators
- **Filter Section**: Advanced filtering controls
- **Pagination**: Handle large datasets efficiently
- **Loading States**: Professional loading animations
- **Error Handling**: Graceful error states

## 🛠️ Development

### Prerequisites
- **Python 3.8+** with pip
- **Node.js 18+** with npm or yarn
- **Modern web browser**

### Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install React dependencies
cd frontend
npm install
```

### Development Mode
```bash
# Start API server (Terminal 1)
python3 api_server.py

# Start React dev server (Terminal 2)
cd frontend
npm run dev
```

### Build
```bash
# Build React app
cd frontend
npm run build
```

## 🔍 Data Sources

The dashboard integrates with your existing data:

1. **Raw Data**: `notebooks/senators.pickle`
2. **Data Results**: `suspicious_trades.csv`
3. **Risk Profiles**: `senator_risk_profiles.csv`

The API server automatically loads and serves this data to the React frontend.

## 🎨 Customization

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern component library
- **Dark Theme**: Professional dark interface
- **Responsive**: Mobile-first design

### Components
- **Reusable UI**: Modular component architecture
- **TypeScript**: Full type safety
- **React Query**: Efficient data fetching
- **React Router**: Client-side routing

## 🚀 Deployment

### Local Development
```bash
python3 run_dashboard.py
```

### Production Deployment
1. Build the React app: `cd frontend && npm run build`
2. Serve the API with a production server (Gunicorn, etc.)
3. Serve the React build with a static file server

## 📊 Performance

- **Server-side Pagination**: Handle large datasets efficiently
- **Caching**: React Query provides intelligent caching
- **Lazy Loading**: Components load on demand
- **Optimized Builds**: Vite provides fast development and builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is part of the Senator Trading Analysis toolset.

## 🆘 Troubleshooting

### Common Issues

**API Server Not Starting**
```bash
# Check if port 8000 is available
lsof -i :8000
# Kill process if needed
kill -9 <PID>
```

**React Dependencies Missing**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Data Not Loading**
```bash
# Check if data files exist
ls -la suspicious_trades.csv senator_risk_profiles.csv
# Run ML analysis if needed
python3 ml_insider_detection.py
```

**Browser Issues**
- Clear browser cache
- Try incognito/private mode
- Check browser console for errors