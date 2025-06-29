import React, { useState, useEffect } from 'react';
import { Download, ChevronUp, ChevronDown, Activity, Database, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/services/api';
import { DashboardLayout } from '@/components/DashboardLayout';
import { FilterSection } from '@/components/FilterSection';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

export interface FiltersState {
  search: string;
  dateRange: { start: string; end: string };
  riskLevel: string;
  senator: string;
  ticker: string;
}

export default function RawData() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState('tx_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [error, setError] = useState<string | null>(null);
  const [availableFilters, setAvailableFilters] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    dateRange: { start: '', end: '' },
    riskLevel: '',
    senator: '',
    ticker: ''
  });

  const itemsPerPage = 50;

  // Handle URL parameters on page load
  useEffect(() => {
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const riskLevel = searchParams.get('risk_level');
    const senator = searchParams.get('senator');
    
    if (startDate || endDate || riskLevel || senator) {
      setFilters(prev => ({
        ...prev,
        dateRange: {
          start: startDate || '',
          end: endDate || ''
        },
        riskLevel: riskLevel || '',
        senator: senator || ''
      }));
    }
  }, [searchParams]);

  // Load available filters
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/filters');
        const data = await response.json();
        setAvailableFilters(data);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filters, sortColumn, sortDirection]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let url = `http://localhost:8000/api/transactions?page=${currentPage}&limit=${itemsPerPage}`;
      
      if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
      if (filters.riskLevel) url += `&risk_level=${encodeURIComponent(filters.riskLevel)}`;
      if (filters.senator) url += `&senator=${encodeURIComponent(filters.senator)}`;
      if (filters.ticker) url += `&ticker=${encodeURIComponent(filters.ticker)}`;
      if (filters.dateRange.start) url += `&start_date=${encodeURIComponent(filters.dateRange.start)}`;
      if (filters.dateRange.end) url += `&end_date=${encodeURIComponent(filters.dateRange.end)}`;
      if (sortColumn) url += `&sort_field=${encodeURIComponent(sortColumn)}`;
      if (sortDirection) url += `&sort_direction=${encodeURIComponent(sortDirection)}`;

      const response = await fetch(url);
      const data = await response.json();
      
      setTransactions(data.data || []);
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const sortData = (column: string) => {
    const newSortDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newSortDirection);
    // The useEffect will trigger a new API call with the updated sort parameters
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Senator', 'Ticker', 'Order Type', 'Amount', 'Suspicious Score', 'Risk Level'].join(','),
      ...transactions.map(t => [
        t.tx_date,
        t.full_name,
        t.ticker,
        t.order_type,
        t.tx_amount,
        t.suspicious_score,
        t.risk_level
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'senator_transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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

  const SortButton: React.FC<{ field: string; children: React.ReactNode }> = ({ field, children }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-2 font-semibold text-gray-300 hover:text-white hover:bg-gray-800/80 transition-colors rounded"
      onClick={() => sortData(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortColumn === field && (
          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </span>
    </Button>
  );

  if (isLoading && currentPage === 1) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading transaction data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="mb-8">
          <div className="text-center py-8 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-2xl border border-gray-800">
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Filter className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-3">
              Transaction Database
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Comprehensive search and filter through all senator trading transactions with advanced analytics and risk scoring.
            </p>
          </div>
        </div>

        {/* Advanced Filters */}
        {availableFilters && (
          <FilterSection 
            filters={filters}
            onFiltersChange={setFilters}
            availableFilters={availableFilters}
            isLoading={false}
          />
        )}

        {/* Data Table */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-500" />
                  Transaction Details
                </h2>
                <p className="text-gray-400 mt-2">Page {currentPage} of {totalPages} • {transactions.length} transactions</p>
              </div>
              <Button onClick={exportData} className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

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
                    <SortButton field="suspicious_score">Suspicion Rating</SortButton>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-300">Tag</th>
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
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-mono">
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
                    <td className="p-4 text-gray-300">${formatAmount(transaction.tx_amount)}</td>
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
          <div className="p-6 border-t border-gray-800">
            <div className="flex justify-between items-center">
              <div className="text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, transactions.length)} of {totalPages * itemsPerPage} results
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 