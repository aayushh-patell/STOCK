import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { HeroSection } from '@/components/HeroSection';
import { MetricsCards } from '@/components/MetricsCards';
import { ChartsSection } from '@/components/ChartsSection';
import { apiService, SenatorRisk, Statistics, ChartData } from '@/services/api';

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Statistics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [senatorRisk, setSenatorRisk] = useState<SenatorRisk[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Test API connection
        const healthCheck = await apiService.healthCheck();
        if (!healthCheck) {
          throw new Error('API server not available');
        }
        
        // Load all data in parallel (including some transactions for charts)
        const [stats, charts, senators, transactionsData] = await Promise.all([
          apiService.getStatistics(),
          apiService.getChartData(
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
            new Date().toISOString().split('T')[0] // today
          ),
          apiService.getSenatorRisk(),
          apiService.getTransactions(1, 1000) // Get first 1000 transactions for charts
        ]);
        
        setData(stats);
        setChartData(charts);
        setSenatorRisk(senators);
        setTransactions(transactionsData.data || []);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleMetricCardClick = (metricType: string) => {
    switch (metricType) {
      case 'transactions':
        navigate('/raw-data');
        break;
      case 'high-risk':
        navigate('/raw-data?risk_level=High');
        break;
      case 'scores':
        navigate('/analysis');
        break;
      case 'senators':
        navigate('/analysis');
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading senator trading data...</p>
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
            <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <HeroSection />
        
        {data && (
          <MetricsCards 
            statistics={data}
            isLoading={false}
            onCardClick={handleMetricCardClick}
          />
        )}

        {chartData && (
          <ChartsSection 
            transactions={transactions}
            senatorRisk={senatorRisk}
            timelineData={chartData.trading_timeline}
            chartData={chartData}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
