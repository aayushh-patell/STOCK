import React, { useState, useCallback } from 'react';
import { Search, Calendar, Filter, User, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filters } from '@/services/api';

interface FiltersState {
  search: string;
  dateRange: { start: string; end: string };
  riskLevel: string;
  senator: string;
  ticker: string;
}

interface FilterSectionProps {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
  availableFilters?: Filters;
  isLoading?: boolean;
}

export const FilterSection: React.FC<FilterSectionProps> = ({ 
  filters, 
  onFiltersChange, 
  availableFilters,
  isLoading = false
}) => {
  const [searchValue, setSearchValue] = useState(filters.search);
  const [tickerValue, setTickerValue] = useState(filters.ticker);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (term: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handleFilterChange('search', term);
        }, 500); // 500ms delay
      };
    })(),
    []
  );

  // Debounced ticker search function
  const debouncedTickerSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (term: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handleFilterChange('ticker', term);
        }, 500); // 500ms delay
      };
    })(),
    []
  );

  const handleFilterChange = (key: keyof FiltersState, value: string | { start: string; end: string }) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleTickerChange = (value: string) => {
    setTickerValue(value);
    debouncedTickerSearch(value);
  };

  const clearFilters = () => {
    setSearchValue('');
    setTickerValue('');
    onFiltersChange({
      search: '',
      dateRange: { start: '', end: '' },
      riskLevel: '',
      senator: '',
      ticker: ''
    });
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-white">Search & Filter</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-800 rounded"></div>
            ))}
          </div>
          <div className="flex gap-4">
            <div className="flex-1 h-10 bg-gray-800 rounded"></div>
            <div className="w-32 h-10 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-semibold text-white">Search & Filter</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Global Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search senators, tickers..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        {/* Date Range Start */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="date"
            placeholder="Start Date"
            value={filters.dateRange.start}
            onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        {/* Date Range End */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="date"
            placeholder="End Date"
            value={filters.dateRange.end}
            onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        {/* Risk Level Filter */}
        <Select value={filters.riskLevel} onValueChange={(value) => handleFilterChange('riskLevel', value)}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Suspicious Level" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="High" className="text-red-400">Highly Suspicious</SelectItem>
            <SelectItem value="Medium" className="text-yellow-400">Medium Suspicious</SelectItem>
            <SelectItem value="Low" className="text-green-400">Low Suspicious</SelectItem>
          </SelectContent>
        </Select>

        {/* Senator Filter */}
        <Select value={filters.senator} onValueChange={(value) => handleFilterChange('senator', value)}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Select Senator" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 max-h-48">
            {availableFilters?.senators?.map((senator) => (
              <SelectItem key={senator} value={senator} className="text-white">
                {senator}
              </SelectItem>
            )) || []}
          </SelectContent>
        </Select>
      </div>

      {/* Ticker Search */}
      <div className="mt-4 flex gap-4">
        <div className="relative flex-1">
          <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by ticker (e.g., AAPL, MSFT)..."
            value={tickerValue}
            onChange={(e) => handleTickerChange(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
        
        <Button 
          onClick={clearFilters}
          variant="outline"
          className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors font-medium"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};
