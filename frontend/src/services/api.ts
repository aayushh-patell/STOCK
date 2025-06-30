const API_BASE_URL = 'http://localhost:8000/api';

export interface Transaction {
  tx_date: string;
  full_name: string;
  ticker: string;
  order_type: string;
  tx_amount: string;
  suspicious_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
}

export interface SenatorRisk {
  full_name: string;
  total_trades: number;
  high_risk_trades: number;
  risk_percentage: number;
  avg_suspicious_score: number;
  max_score: number;
}

export interface Statistics {
  total_transactions: number;
  high_risk_trades: number;
  avg_suspicious_score: number;
  total_senators: number;
}

export interface ChartData {
  risk_distribution: {
    Low: number;
    Medium: number;
    High: number;
  };
  top_senators: Array<{
    name: string;
    avg_score: number;
    risk_percentage: number;
  }>;
  top_tickers: Array<{
    ticker: string;
    count: number;
  }>;
  trading_timeline: Array<{
    date: string;
    transactions: number;
    suspicious: number;
  }>;
}

export interface Filters {
  senators: string[];
  tickers: string[];
  risk_levels: string[];
}

export interface TransactionsResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

class ApiService {
  private async fetchWithErrorHandling<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getTransactions(
    page: number = 1,
    limit: number = 50,
    search?: string,
    risk_level?: string,
    senator?: string,
    ticker?: string,
    start_date?: string,
    end_date?: string
  ): Promise<TransactionsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);
    if (risk_level) params.append('risk_level', risk_level);
    if (senator) params.append('senator', senator);
    if (ticker) params.append('ticker', ticker);
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);

    return this.fetchWithErrorHandling<TransactionsResponse>(
      `${API_BASE_URL}/transactions?${params.toString()}`
    );
  }

  async getSenatorRisk(): Promise<SenatorRisk[]> {
    return this.fetchWithErrorHandling<SenatorRisk[]>(`${API_BASE_URL}/senator-risk`);
  }

  async getStatistics(): Promise<Statistics> {
    return this.fetchWithErrorHandling<Statistics>(`${API_BASE_URL}/statistics`);
  }

  async getChartData(startDate?: string, endDate?: string): Promise<ChartData> {
    let url = `${API_BASE_URL}/chart-data`;
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch chart data');
    return response.json();
  }

  async getFilters(): Promise<Filters> {
    return this.fetchWithErrorHandling<Filters>(`${API_BASE_URL}/filters`);
  }

  // Health check with better error handling
  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('http://localhost:8000/', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return data.message === 'Senator Trading Analysis API';
      }
      return false;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService(); 