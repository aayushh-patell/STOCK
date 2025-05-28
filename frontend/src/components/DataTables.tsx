import React, { useState } from 'react';
import { ChevronUp, ChevronDown, AlertTriangle, User, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Transaction, SenatorRisk, TransactionsResponse } from '@/services/api';

interface DataTablesProps {
  transactionsResponse?: TransactionsResponse;
  senatorRisk?: SenatorRisk[];
  isLoading?: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}

type SortField = keyof Transaction | keyof SenatorRisk;
type SortDirection = 'asc' | 'desc';

export const DataTables: React.FC<DataTablesProps> = ({ 
  transactionsResponse, 
  senatorRisk = [], 
  isLoading = false,
  currentPage,
  onPageChange
}) => {
  const [sortField, setSortField] = useState<SortField>('suspicious_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const transactions = transactionsResponse?.data || [];
  const totalPages = transactionsResponse?.total_pages || 0;
  const totalItems = transactionsResponse?.total || 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    onPageChange(1);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatAmount = (amount: string) => {
    return amount.replace('$', '').replace(' - ', '-');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  // Filter suspicious trades
  const suspiciousTransactions = transactions.filter(t => t.risk_level === 'High' || t.suspicious_score > 0.5);

  const SortButton: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-semibold text-gray-300 hover:text-white"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </span>
    </Button>
  );

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-500" />
            Trading Data Analysis
          </h2>
          <p className="text-gray-400 mt-2">Loading data...</p>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-500" />
          Trading Data Analysis
        </h2>
        <p className="text-gray-400 mt-2">Comprehensive view of all trading activities with advanced filtering</p>
      </div>

      <Tabs defaultValue="suspicious" className="w-full">
        <TabsList className="w-full bg-transparent border-b border-gray-800 rounded-none p-0">
          <TabsTrigger 
            value="suspicious" 
            className="flex-1 bg-transparent border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent rounded-none py-4"
          >
            <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
            Suspicious Trades ({suspiciousTransactions.length})
          </TabsTrigger>
          <TabsTrigger 
            value="senators" 
            className="flex-1 bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none py-4"
          >
            <User className="w-4 h-4 mr-2 text-blue-500" />
            Senator Risk Profiles ({senatorRisk.length})
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className="flex-1 bg-transparent border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent rounded-none py-4"
          >
            <Activity className="w-4 h-4 mr-2 text-green-500" />
            All Transactions ({totalItems})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suspicious" className="mt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="tx_date">Date</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="full_name">Senator</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="ticker">Ticker</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="order_type">Type</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">Amount</th>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="suspicious_score">Score</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">Risk</th>
                </tr>
              </thead>
              <tbody>
                {suspiciousTransactions.map((transaction, index) => (
                  <tr 
                    key={index} 
                    className={`border-t border-gray-800 hover:bg-gray-800/30 transition-colors ${
                      transaction.risk_level === 'High' ? 'bg-red-500/5' : 
                      transaction.risk_level === 'Medium' ? 'bg-yellow-500/5' : ''
                    }`}
                  >
                    <td className="p-4 text-gray-300">{formatDate(transaction.tx_date)}</td>
                    <td className="p-4 text-white font-medium">{transaction.full_name}</td>
                    <td className="p-4">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-mono">
                        {transaction.ticker}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.order_type === 'Purchase' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {transaction.order_type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300 font-mono">${formatAmount(transaction.tx_amount)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                            style={{ width: `${transaction.suspicious_score * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-medium text-sm">
                          {transaction.suspicious_score.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getRiskLevelColor(transaction.risk_level)}`}>
                        {transaction.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-800 flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, totalItems)} of {totalItems} results
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Previous
              </Button>
              <span className="px-3 py-2 text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="senators" className="mt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="full_name">Senator</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="total_trades">Total Trades</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="high_risk_trades">High Risk</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="risk_percentage">Risk %</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="avg_suspicious_score">Avg Score</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="max_score">Max Score</SortButton>
                  </th>
                </tr>
              </thead>
              <tbody>
                {senatorRisk.map((senator, index) => (
                  <tr key={index} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 text-white font-medium">{senator.full_name}</td>
                    <td className="p-4 text-gray-300">{senator.total_trades}</td>
                    <td className="p-4 text-red-400 font-medium">{senator.high_risk_trades}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                            style={{ width: `${senator.risk_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-medium text-sm">
                          {senator.risk_percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium">
                        {senator.avg_suspicious_score.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-red-400 font-medium">
                        {senator.max_score.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="tx_date">Date</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="full_name">Senator</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="ticker">Ticker</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="order_type">Type</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">Amount</th>
                  <th className="text-left p-4 font-semibold text-gray-300">
                    <SortButton field="suspicious_score">Score</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">Risk</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr 
                    key={index} 
                    className={`border-t border-gray-800 hover:bg-gray-800/30 transition-colors ${
                      transaction.risk_level === 'High' ? 'bg-red-500/5' : 
                      transaction.risk_level === 'Medium' ? 'bg-yellow-500/5' : ''
                    }`}
                  >
                    <td className="p-4 text-gray-300">{formatDate(transaction.tx_date)}</td>
                    <td className="p-4 text-white font-medium">{transaction.full_name}</td>
                    <td className="p-4">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-mono">
                        {transaction.ticker}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.order_type === 'Purchase' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {transaction.order_type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300 font-mono">${formatAmount(transaction.tx_amount)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                            style={{ width: `${transaction.suspicious_score * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-medium text-sm">
                          {transaction.suspicious_score.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getRiskLevelColor(transaction.risk_level)}`}>
                        {transaction.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-800 flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, totalItems)} of {totalItems} results
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Previous
              </Button>
              <span className="px-3 py-2 text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
