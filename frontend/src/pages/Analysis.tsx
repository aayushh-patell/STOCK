import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { apiService, SenatorRisk, ChartData } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, Users, Activity, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnalysisData {
  senatorRisk: SenatorRisk[];
  chartData: ChartData | null;
  topStocks: Array<{ ticker: string; count: number; totalVolume?: string }>;
  riskTrends: Array<{ month: string; highRisk: number; total: number }>;
}

export default function AnalysisPage() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof SenatorRisk>('avg_suspicious_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedSenator, setSelectedSenator] = useState<string | null>(null);
  const [senatorTransactions, setSenatorTransactions] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAnalysisData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [senatorRisk, chartData] = await Promise.all([
          apiService.getSenatorRisk(),
          apiService.getChartData()
        ]);

        // Process top stocks data
        const topStocks = chartData?.top_tickers || [];

        // Create risk trends data (mock for now, could be enhanced with real time-series data)
        const riskTrends = [
          { month: 'Jan', highRisk: 45, total: 120 },
          { month: 'Feb', highRisk: 52, total: 135 },
          { month: 'Mar', highRisk: 38, total: 98 },
          { month: 'Apr', highRisk: 67, total: 156 },
          { month: 'May', highRisk: 41, total: 112 },
          { month: 'Jun', highRisk: 58, total: 143 }
        ];

        setData({
          senatorRisk,
          chartData,
          topStocks,
          riskTrends
        });

      } catch (err) {
        console.error('Error loading analysis data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analysis data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysisData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (data && data.fullName && data.score !== undefined) {
        return (
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-white shadow-lg">
            <p className="text-sm font-medium text-blue-400">{data.fullName}</p>
            <p className="text-sm text-white">Score: {data.score.toFixed(3)}</p>
            <p className="text-sm text-gray-300">Trades: {data.count || 0}</p>
          </div>
        );
      }
      // fallback for other charts
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-white shadow-lg">
          <p className="text-sm font-medium text-blue-400">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleSort = (field: keyof SenatorRisk) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSenatorClick = async (senatorName: string) => {
    if (selectedSenator === senatorName) {
      // If clicking the same senator, deselect
      setSelectedSenator(null);
      setSenatorTransactions([]);
    } else {
      // Select new senator and load their data
      setSelectedSenator(senatorName);
      try {
        // Fetch transactions for this specific senator
        const response = await fetch(`http://localhost:8000/api/transactions?senator=${encodeURIComponent(senatorName)}&limit=1000`);
        const transactionData = await response.json();
        setSenatorTransactions(transactionData.data || []);
      } catch (error) {
        console.error('Error fetching senator transactions:', error);
        setSenatorTransactions([]);
      }
    }
  };

  const handleMetricCardClick = (metricType: string) => {
    const params = new URLSearchParams();
    
    // Add senator filter if a senator is selected
    if (selectedSenator) {
      params.set('senator', selectedSenator);
    }
    
    // Add risk level filter for high risk metric
    if (metricType === 'high-risk') {
      params.set('risk_level', 'High');
    }
    
    navigate(`/raw-data?${params.toString()}`);
  };

  const getFilteredData = () => {
    if (!selectedSenator || !senatorTransactions.length) {
      return {
        riskDistribution: data?.chartData?.risk_distribution || { Low: 0, Medium: 0, High: 0 },
        topStocks: (data?.topStocks || []).filter(stock => stock.ticker && stock.ticker.trim() !== ''),
        riskTrends: data?.riskTrends || [],
        senatorRisk: data?.senatorRisk || []
      };
    }

    // Filter data for selected senator
    const senatorData = senatorTransactions;
    
    // Calculate risk distribution for this senator
    const riskCounts = senatorData.reduce((acc: any, tx: any) => {
      const risk = tx.risk_level || 'Low';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, { Low: 0, Medium: 0, High: 0 });

    // Calculate most traded stocks for this senator
    const stockCounts = senatorData.reduce((acc: any, tx: any) => {
      const ticker = tx.ticker;
      if (ticker && ticker.trim()) {
        acc[ticker] = (acc[ticker] || 0) + 1;
      }
      return acc;
    }, {});
    
    const topStocks = Object.entries(stockCounts)
      .map(([ticker, count]) => ({ ticker, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Create risk trends for this senator (mock data for now)
    const riskTrends = [
      { month: 'Jan', highRisk: Math.floor(Math.random() * 10), total: Math.floor(Math.random() * 30) },
      { month: 'Feb', highRisk: Math.floor(Math.random() * 10), total: Math.floor(Math.random() * 30) },
      { month: 'Mar', highRisk: Math.floor(Math.random() * 10), total: Math.floor(Math.random() * 30) },
      { month: 'Apr', highRisk: Math.floor(Math.random() * 10), total: Math.floor(Math.random() * 30) },
      { month: 'May', highRisk: Math.floor(Math.random() * 10), total: Math.floor(Math.random() * 30) },
      { month: 'Jun', highRisk: Math.floor(Math.random() * 10), total: Math.floor(Math.random() * 30) }
    ];

    return {
      riskDistribution: riskCounts,
      topStocks,
      riskTrends,
      senatorRisk: data?.senatorRisk.filter(s => s.full_name === selectedSenator) || []
    };
  };

  const getSortedSenators = () => {
    if (!data?.senatorRisk) return [];
    
    return [...data.senatorRisk].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  };

  const SortButton: React.FC<{ field: keyof SenatorRisk; children: React.ReactNode }> = ({ field, children }) => (
    <button
      className="flex items-center gap-1 font-semibold text-gray-300 hover:text-white transition-colors"
      onClick={() => handleSort(field)}
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analysis data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">🚨</div>
            <h2 className="text-2xl font-bold mb-2 text-red-400">Error Loading Data</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const filteredData = getFilteredData();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center py-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-gray-800">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-3">
            Deep Dive Analysis
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Comprehensive insights into senator trading patterns, risk assessment, and market impact analysis
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card 
            className="bg-gray-900 border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors duration-200"
            onClick={() => handleMetricCardClick('total-trades')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium text-gray-400">
                  {selectedSenator ? 'Total Trades' : 'Total Senators'}
                </span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {selectedSenator ? senatorTransactions.length : data.senatorRisk.length}
              </p>
              <p className="text-xs text-blue-400 mt-2">Click to view details</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gray-900 border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors duration-200"
            onClick={() => handleMetricCardClick('high-risk')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="text-sm font-medium text-gray-400">Highly Suspicious</span>
              </div>
              <p className="text-2xl font-bold text-red-400 mt-2">
                {selectedSenator 
                  ? senatorTransactions.filter(tx => tx.risk_level === 'High').length
                  : data.senatorRisk.reduce((sum, s) => sum + s.high_risk_trades, 0)
                }
              </p>
              <p className="text-xs text-blue-400 mt-2">Click to view details</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-sm font-medium text-gray-400">Avg Score</span>
              </div>
              <p className="text-2xl font-bold text-green-400 mt-2">
                {selectedSenator 
                  ? (senatorTransactions.reduce((sum, tx) => sum + (tx.suspicious_score || 0), 0) / senatorTransactions.length).toFixed(3)
                  : (data.senatorRisk.reduce((sum, s) => sum + s.avg_suspicious_score, 0) / data.senatorRisk.length).toFixed(2)
                }
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-medium text-gray-400">
                  {selectedSenator ? 'Unique Stocks' : 'Active Traders'}
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-400 mt-2">
                {selectedSenator 
                  ? new Set(senatorTransactions.map(tx => tx.ticker).filter(Boolean)).size
                  : data.senatorRisk.filter(s => s.total_trades > 10).length
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Suspicious Senators - Hidden when senator selected */}
          {!selectedSenator && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Most Suspicious Senators</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.senatorRisk.slice(0, 10).map(senator => ({
                    name: senator.full_name.split(' ').pop() || senator.full_name,
                    score: senator.avg_suspicious_score,
                    fullName: senator.full_name,
                    count: senator.total_trades
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#9CA3AF', fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Most Traded Stocks - Full width when senator selected */}
          <Card className={`bg-gray-900 border-gray-800 ${selectedSenator ? 'lg:col-span-2' : ''}`}>
            <CardHeader>
              <CardTitle className="text-white">Most Traded Stocks</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredData.topStocks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="ticker" 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Suspicion Distribution */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Trade Suspicion Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Low Suspicion', value: filteredData.riskDistribution.Low, color: '#10B981' },
                      { name: 'Medium Suspicion', value: filteredData.riskDistribution.Medium, color: '#F59E0B' },
                      { name: 'High Suspicion', value: filteredData.riskDistribution.High, color: '#EF4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Low Suspicion', value: filteredData.riskDistribution.Low, color: '#10B981' },
                      { name: 'Medium Suspicion', value: filteredData.riskDistribution.Medium, color: '#F59E0B' },
                      { name: 'High Suspicion', value: filteredData.riskDistribution.High, color: '#EF4444' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Suspicious Trends */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Suspicion Trends (6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredData.riskTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="highRisk" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Highly Suspicious Trades"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Total Trades"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Senator Table */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Senator Suspicion Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">
                      <SortButton field="full_name">Senator</SortButton>
                    </th>
                    <th className="text-left py-3 px-4">
                      <SortButton field="total_trades">Total Trades</SortButton>
                    </th>
                    <th className="text-left py-3 px-4">
                      <SortButton field="high_risk_trades">Highly Suspicious Trades</SortButton>
                    </th>
                    <th className="text-left py-3 px-4">
                      <SortButton field="risk_percentage">Suspicion %</SortButton>
                    </th>
                    <th className="text-left py-3 px-4">
                      <SortButton field="avg_suspicious_score">Avg Suspicion Score</SortButton>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedSenators().slice(0, 15).map((senator, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${
                        selectedSenator === senator.full_name ? 'bg-blue-900/20 border-blue-500/30' : ''
                      }`}
                      onClick={() => handleSenatorClick(senator.full_name)}
                    >
                      <td className="py-3 px-4 text-white font-medium">
                        {senator.full_name}
                        {selectedSenator === senator.full_name && (
                          <span className="ml-2 text-blue-400 text-xs">✓ Selected</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{senator.total_trades}</td>
                      <td className="py-3 px-4 text-gray-300">{senator.high_risk_trades}</td>
                      <td className="py-3 px-4 text-gray-300">{senator.risk_percentage.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-gray-300">{senator.avg_suspicious_score.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">
                  {selectedSenator 
                    ? `Showing analysis for ${selectedSenator}. Click again to deselect or click another senator.`
                    : 'Click on any senator to view their detailed analysis and trading patterns'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 