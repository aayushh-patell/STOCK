import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Transaction, SenatorRisk } from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface ChartsSectionProps {
  transactions: Transaction[];
  senatorRisk: SenatorRisk[];
  timelineData?: Array<{
    date: string;
    transactions: number;
    suspicious: number;
  }>;
  chartData?: {
    risk_distribution: {
      Low: number;
      Medium: number;
      High: number;
    };
    top_tickers: Array<{
      ticker: string;
      count: number;
    }>;
    top_senators: Array<{
      name: string;
      avg_score: number;
      risk_percentage: number;
    }>;
  };
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ 
  transactions, 
  senatorRisk, 
  timelineData = [],
  chartData
}) => {
  // Debug logging
  console.log('ChartsSection Data:', {
    transactionsCount: transactions.length,
    senatorRiskCount: senatorRisk.length,
    chartData: chartData,
    timelineDataCount: timelineData.length
  });

  // Risk Distribution Data - use API data if available, fallback to transactions
  const riskDistribution = chartData?.risk_distribution ? [
    { name: 'Low Suspicion', value: chartData.risk_distribution.Low, color: '#10B981' },
    { name: 'Medium Suspicion', value: chartData.risk_distribution.Medium, color: '#F59E0B' },
    { name: 'High Suspicion', value: chartData.risk_distribution.High, color: '#EF4444' }
  ] : [
    { name: 'Low Suspicion', value: transactions.filter(t => t.risk_level === 'Low').length, color: '#10B981' },
    { name: 'Medium Suspicion', value: transactions.filter(t => t.risk_level === 'Medium').length, color: '#F59E0B' },
    { name: 'High Suspicion', value: transactions.filter(t => t.risk_level === 'High').length, color: '#EF4444' }
  ];

  // Top Suspicious Senators - use pre-calculated data for consistency
  const topSuspiciousSenators = React.useMemo(() => {
    if (!senatorRisk || senatorRisk.length === 0) {
      return [];
    }
    
    return senatorRisk
      .map(senator => ({
        name: senator.full_name.split(' ').pop() || senator.full_name,
        score: senator.avg_suspicious_score,
        fullName: senator.full_name,
        count: senator.total_trades
      }))
      .filter(senator => senator.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [senatorRisk]);

  // Debug logging for top senators
  console.log('Top Suspicious Senators (Pre-calculated):', {
    senatorRiskCount: senatorRisk?.length || 0,
    senatorCount: topSuspiciousSenators.length,
    sampleSenator: topSuspiciousSenators[0],
    allSenators: topSuspiciousSenators
  });

  // If we still don't have data, try to get some sample data for testing
  const fallbackSenators = topSuspiciousSenators.length === 0 ? [
    { name: 'Sample', score: 0.5, fullName: 'Sample Senator', count: 1 },
    { name: 'Test', score: 0.3, fullName: 'Test Senator', count: 1 }
  ] : topSuspiciousSenators;

  // Use fallback if no real data
  const displaySenators = topSuspiciousSenators.length > 0 ? topSuspiciousSenators : fallbackSenators;

  // Debug logging for top senators
  console.log('Top Senators Data:', {
    senatorRiskCount: senatorRisk?.length || 0,
    senatorCount: topSuspiciousSenators.length,
    processedTopSenators: topSuspiciousSenators.length,
    displaySenators: displaySenators.length,
    sampleSenator: displaySenators[0],
    allDisplaySenators: displaySenators
  });

  // Debug: Check if we have any senators with scores > 0
  const senatorsWithScores = displaySenators.filter(s => s.score > 0);
  console.log('Senators with scores > 0:', senatorsWithScores.length, senatorsWithScores);

  const mostTradedStocks = React.useMemo(() => {
    // This function now filters out blank or invalid tickers.
    let calculatedStocks: { ticker: string; count: number }[] = [];

    if (chartData?.top_tickers) {
      // Use API data if available
      calculatedStocks = chartData.top_tickers;
    } else if (transactions?.length > 0) {
      // Fallback to calculating from transactions
      const tickerCounts = transactions.reduce((acc, transaction) => {
        const ticker = transaction.ticker;
        // Ensure ticker is a non-empty string before counting
        if (ticker && typeof ticker === 'string' && ticker.trim()) {
          const trimmedTicker = ticker.trim();
          acc[trimmedTicker] = (acc[trimmedTicker] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      calculatedStocks = Object.entries(tickerCounts).map(([ticker, count]) => ({ ticker, count }));
    }

    // Filter out any remaining blank tickers, sort, and take the top 10
    return calculatedStocks
      .filter(stock => stock.ticker && stock.ticker.trim() !== '')
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [chartData?.top_tickers, transactions]);

  // The API now provides the correct 30-day window, so we just use the data directly.
  const chartTimelineData = timelineData || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-white shadow-lg">
          {data.payload?.name && data.payload?.value !== undefined ? (
            // Pie chart tooltip
            <div>
              <p className="text-sm font-medium text-blue-400">{data.payload.name}</p>
              <p className="text-sm text-white">{`${data.value.toLocaleString()} transactions`}</p>
            </div>
          ) : data.payload?.ticker ? (
            // Bar chart tooltip for stocks
            <div>
              <p className="text-sm font-medium text-blue-400">{data.payload.ticker}</p>
              <p className="text-sm text-white">{`${data.value} trades`}</p>
            </div>
          ) : data.payload?.fullName ? (
            // Bar chart tooltip for senators
            <div>
              <p className="text-sm font-medium text-blue-400">{data.payload.fullName}</p>
              <p className="text-sm text-white">{`Score: ${data.value.toFixed(3)}`}</p>
              <p className="text-sm text-gray-300">{`Trades: ${data.payload.count || 0}`}</p>
            </div>
          ) : (
            // Default tooltip
            <div>
              <p className="text-sm font-medium text-blue-400">{label}</p>
              <p className="text-sm text-white">{data.value}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Interactive Analytics</h2>
        <p className="text-gray-400">Comprehensive visualization of senator trading patterns and risk analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Distribution Chart */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-6">Trade Suspicion Distribution</h3>
          {riskDistribution.some(item => item.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {riskDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-300">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p>No risk distribution data available</p>
                <p className="text-sm">Check API connection and data loading</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Suspicious Senators - NEW AND WORKING (VERTICAL) */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-6">Top Suspicious Senators</h3>
          {topSuspiciousSenators.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topSuspiciousSenators}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <p>No suspicious senator data to display.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Traded Stocks */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-6">Most Traded Stocks</h3>
          {mostTradedStocks.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mostTradedStocks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="ticker" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p>No stock trading data available</p>
                <p className="text-sm">Check API connection and data loading</p>
              </div>
            </div>
          )}
        </div>

        {/* Trading Timeline */}
        <div 
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors duration-200"
          onClick={() => navigate('/timeline')}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Trading Timeline (30 Days)</h3>
            <span className="text-xs text-blue-400">Click to view full timeline</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartTimelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString().slice(0, -5)}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="transactions" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="suspicious" 
                stroke="#EF4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
