
import { Transaction, SenatorRisk } from '@/pages/Index';

// Generate realistic mock data for senator trading analysis
export const mockTransactions: Transaction[] = [
  {
    tx_date: "2024-01-15",
    full_name: "Elizabeth Warren",
    ticker: "AAPL",
    order_type: "Purchase",
    tx_amount: "$15,001 - $50,000",
    suspicious_score: 0.85,
    risk_level: "High"
  },
  {
    tx_date: "2024-01-12",
    full_name: "Ted Cruz",
    ticker: "TSLA",
    order_type: "Sale",
    tx_amount: "$50,001 - $100,000",
    suspicious_score: 0.72,
    risk_level: "High"
  },
  {
    tx_date: "2024-01-10",
    full_name: "Nancy Pelosi",
    ticker: "NVDA",
    order_type: "Purchase",
    tx_amount: "$100,001 - $250,000",
    suspicious_score: 0.91,
    risk_level: "High"
  },
  {
    tx_date: "2024-01-08",
    full_name: "Josh Hawley",
    ticker: "META",
    order_type: "Sale",
    tx_amount: "$15,001 - $50,000",
    suspicious_score: 0.68,
    risk_level: "Medium"
  },
  {
    tx_date: "2024-01-05",
    full_name: "Marco Rubio",
    ticker: "GOOGL",
    order_type: "Purchase",
    tx_amount: "$50,001 - $100,000",
    suspicious_score: 0.43,
    risk_level: "Medium"
  },
  {
    tx_date: "2024-01-03",
    full_name: "Bernie Sanders",
    ticker: "AMZN",
    order_type: "Sale",
    tx_amount: "$15,001 - $50,000",
    suspicious_score: 0.29,
    risk_level: "Low"
  },
  {
    tx_date: "2023-12-28",
    full_name: "Mitt Romney",
    ticker: "MSFT",
    order_type: "Purchase",
    tx_amount: "$50,001 - $100,000",
    suspicious_score: 0.35,
    risk_level: "Medium"
  },
  {
    tx_date: "2023-12-26",
    full_name: "Alexandria Ocasio-Cortez",
    ticker: "AMD",
    order_type: "Purchase",
    tx_amount: "$1,001 - $15,000",
    suspicious_score: 0.22,
    risk_level: "Low"
  },
  {
    tx_date: "2023-12-22",
    full_name: "Mitch McConnell",
    ticker: "JPM",
    order_type: "Sale",
    tx_amount: "$100,001 - $250,000",
    suspicious_score: 0.78,
    risk_level: "High"
  },
  {
    tx_date: "2023-12-20",
    full_name: "Chuck Schumer",
    ticker: "BAC",
    order_type: "Purchase",
    tx_amount: "$50,001 - $100,000",
    suspicious_score: 0.56,
    risk_level: "Medium"
  },
  {
    tx_date: "2023-12-18",
    full_name: "Lindsey Graham",
    ticker: "XOM",
    order_type: "Purchase",
    tx_amount: "$15,001 - $50,000",
    suspicious_score: 0.64,
    risk_level: "Medium"
  },
  {
    tx_date: "2023-12-15",
    full_name: "Amy Klobuchar",
    ticker: "INTC",
    order_type: "Sale",
    tx_amount: "$15,001 - $50,000",
    suspicious_score: 0.41,
    risk_level: "Medium"
  },
  {
    tx_date: "2023-12-12",
    full_name: "John Cornyn",
    ticker: "CVX",
    order_type: "Purchase",
    tx_amount: "$50,001 - $100,000",
    suspicious_score: 0.73,
    risk_level: "High"
  },
  {
    tx_date: "2023-12-10",
    full_name: "Dianne Feinstein",
    ticker: "WMT",
    order_type: "Sale",
    tx_amount: "$100,001 - $250,000",
    suspicious_score: 0.87,
    risk_level: "High"
  },
  {
    tx_date: "2023-12-08",
    full_name: "Rick Scott",
    ticker: "UNH",
    order_type: "Purchase",
    tx_amount: "$250,001 - $500,000",
    suspicious_score: 0.94,
    risk_level: "High"
  },
  {
    tx_date: "2023-12-05",
    full_name: "Kirsten Gillibrand",
    ticker: "PFE",
    order_type: "Sale",
    tx_amount: "$15,001 - $50,000",
    suspicious_score: 0.38,
    risk_level: "Medium"
  },
  {
    tx_date: "2023-12-03",
    full_name: "Rob Portman",
    ticker: "JNJ",
    order_type: "Purchase",
    tx_amount: "$50,001 - $100,000",
    suspicious_score: 0.45,
    risk_level: "Medium"
  },
  {
    tx_date: "2023-12-01",
    full_name: "Cory Booker",
    ticker: "V",
    order_type: "Purchase",
    tx_amount: "$15,001 - $50,000",
    suspicious_score: 0.31,
    risk_level: "Low"
  },
  {
    tx_date: "2023-11-28",
    full_name: "Susan Collins",
    ticker: "MA",
    order_type: "Sale",
    tx_amount: "$50,001 - $100,000",
    suspicious_score: 0.52,
    risk_level: "Medium"
  },
  {
    tx_date: "2023-11-25",
    full_name: "Tom Cotton",
    ticker: "HD",
    order_type: "Purchase",
    tx_amount: "$15,001 - $50,000",
    suspicious_score: 0.47,
    risk_level: "Medium"
  },
  // Additional transactions for better data visualization
  {
    tx_date: "2023-11-22",
    full_name: "Elizabeth Warren",
    ticker: "CRM",
    order_type: "Sale",
    tx_amount: "$50,001 - $100,000",
    suspicious_score: 0.79,
    risk_level: "High"
  },
  {
    tx_date: "2023-11-20",
    full_name: "Ted Cruz",
    ticker: "ORCL",
    order_type: "Purchase",
    tx_amount: "$100,001 - $250,000",
    suspicious_score: 0.83,
    risk_level: "High"
  },
  {
    tx_date: "2023-11-18",
    full_name: "Nancy Pelosi",
    ticker: "NFLX",
    order_type: "Purchase",
    tx_amount: "$15,001 - $50,000",
    suspicious_score: 0.76,
    risk_level: "High"
  },
  {
    tx_date: "2023-11-15",
    full_name: "Josh Hawley",
    ticker: "DIS",
    order_type: "Sale",
    tx_amount: "$50,001 - $100,000",
    suspicious_score: 0.61,
    risk_level: "Medium"
  },
  {
    tx_date: "2023-11-12",
    full_name: "Marco Rubio",
    ticker: "IBM",
    order_type: "Purchase",
    tx_amount: "$15,001 - $50,000",
    suspicious_score: 0.34,
    risk_level: "Low"
  }
];

export const mockSenatorRisk: SenatorRisk[] = [
  {
    full_name: "Nancy Pelosi",
    total_trades: 23,
    high_risk_trades: 8,
    risk_percentage: 34.8,
    avg_suspicious_score: 0.72,
    max_score: 0.91
  },
  {
    full_name: "Elizabeth Warren",
    total_trades: 18,
    high_risk_trades: 7,
    risk_percentage: 38.9,
    avg_suspicious_score: 0.69,
    max_score: 0.85
  },
  {
    full_name: "Ted Cruz",
    total_trades: 15,
    high_risk_trades: 6,
    risk_percentage: 40.0,
    avg_suspicious_score: 0.71,
    max_score: 0.83
  },
  {
    full_name: "Rick Scott",
    total_trades: 12,
    high_risk_trades: 5,
    risk_percentage: 41.7,
    avg_suspicious_score: 0.73,
    max_score: 0.94
  },
  {
    full_name: "Dianne Feinstein",
    total_trades: 14,
    high_risk_trades: 4,
    risk_percentage: 28.6,
    avg_suspicious_score: 0.58,
    max_score: 0.87
  },
  {
    full_name: "Mitch McConnell",
    total_trades: 11,
    high_risk_trades: 3,
    risk_percentage: 27.3,
    avg_suspicious_score: 0.56,
    max_score: 0.78
  },
  {
    full_name: "John Cornyn",
    total_trades: 9,
    high_risk_trades: 2,
    risk_percentage: 22.2,
    avg_suspicious_score: 0.52,
    max_score: 0.73
  },
  {
    full_name: "Josh Hawley",
    total_trades: 13,
    high_risk_trades: 2,
    risk_percentage: 15.4,
    avg_suspicious_score: 0.48,
    max_score: 0.68
  },
  {
    full_name: "Chuck Schumer",
    total_trades: 8,
    high_risk_trades: 1,
    risk_percentage: 12.5,
    avg_suspicious_score: 0.44,
    max_score: 0.56
  },
  {
    full_name: "Marco Rubio",
    total_trades: 10,
    high_risk_trades: 1,
    risk_percentage: 10.0,
    avg_suspicious_score: 0.39,
    max_score: 0.43
  },
  {
    full_name: "Lindsey Graham",
    total_trades: 7,
    high_risk_trades: 1,
    risk_percentage: 14.3,
    avg_suspicious_score: 0.46,
    max_score: 0.64
  },
  {
    full_name: "Amy Klobuchar",
    total_trades: 6,
    high_risk_trades: 0,
    risk_percentage: 0.0,
    avg_suspicious_score: 0.35,
    max_score: 0.41
  },
  {
    full_name: "Bernie Sanders",
    total_trades: 5,
    high_risk_trades: 0,
    risk_percentage: 0.0,
    avg_suspicious_score: 0.28,
    max_score: 0.29
  },
  {
    full_name: "Mitt Romney",
    total_trades: 4,
    high_risk_trades: 0,
    risk_percentage: 0.0,
    avg_suspicious_score: 0.31,
    max_score: 0.35
  },
  {
    full_name: "Alexandria Ocasio-Cortez",
    total_trades: 3,
    high_risk_trades: 0,
    risk_percentage: 0.0,
    avg_suspicious_score: 0.24,
    max_score: 0.22
  }
];
