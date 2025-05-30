import React from 'react';
import { Activity, AlertTriangle, Target, Users } from 'lucide-react';
import { Statistics } from '@/services/api';

interface MetricsCardsProps {
  statistics?: Statistics;
  isLoading?: boolean;
  onCardClick?: (metricType: string) => void;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ statistics, isLoading, onCardClick }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-6 border border-gray-800 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
              <div className="w-12 h-6 bg-gray-700 rounded"></div>
            </div>
            <div className="h-8 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-center text-gray-400">
              <p>No data available</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Transactions',
      value: statistics.total_transactions.toLocaleString(),
      icon: Activity,
      color: 'blue',
      change: '+12%',
      changeColor: 'green',
      type: 'transactions'
    },
    {
      title: 'Highly Suspicious Trades',
      value: statistics.high_risk_trades.toLocaleString(),
      icon: AlertTriangle,
      color: 'red',
      change: '-5%',
      changeColor: 'green',
      type: 'high-risk'
    },
    {
      title: 'Average Suspicion Score',
      value: statistics.avg_suspicious_score.toFixed(2),
      icon: Target,
      color: 'yellow',
      change: '+2%',
      changeColor: 'red',
      type: 'scores'
    },
    {
      title: 'Senators Analyzed',
      value: statistics.total_senators.toString(),
      icon: Users,
      color: 'purple',
      change: '0%',
      changeColor: 'gray',
      type: 'senators'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div 
          key={index} 
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-200 cursor-pointer hover:bg-gray-800/50"
          onClick={() => onCardClick?.(metric.type)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-${metric.color}-600/20 rounded-lg flex items-center justify-center`}>
              <metric.icon className={`w-6 h-6 text-${metric.color}-500`} />
            </div>
            <div className={`text-sm font-medium ${
              metric.changeColor === 'green' ? 'text-green-500' : 
              metric.changeColor === 'red' ? 'text-red-500' : 'text-gray-400'
            }`}>
              {metric.change}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
            <p className="text-gray-400 text-sm">{metric.title}</p>
            <p className="text-xs text-blue-400 mt-2">Click to view details</p>
          </div>
        </div>
      ))}
    </div>
  );
};
