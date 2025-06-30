import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, subYears, startOfYear } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DashboardLayout } from '@/components/DashboardLayout';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Filter, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface TimelineData {
  date: string;
  transactions: number;
  suspicious: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-white shadow-lg">
        <p className="text-sm font-medium text-blue-400">{format(new Date(label), 'PPP')}</p>
        <p className="text-sm text-green-400">{`Transactions: ${payload[0].value}`}</p>
        <p className="text-sm text-red-400">{`Suspicious: ${payload[1].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function TimelinePage() {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'30D' | '90D' | '1Y' | 'YTD' | 'ALL' | 'custom'>('30D');
  const [isPresetButtonClick, setIsPresetButtonClick] = useState(false);
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const fetchTimelineData = useCallback(async (startDate?: Date, endDate?: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      // For "All Time", we pass undefined dates to the API
      const start = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
      const end = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;
      
      const chartData = await apiService.getChartData(start, end);
      setTimelineData(chartData.trading_timeline);
    } catch (err) {
      console.error('Error fetching timeline data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // This effect triggers the initial data fetch and subsequent fetches when the date range changes.
    // The "All" button will set `date` to undefined, but `fetchTimelineData` handles that case.
    fetchTimelineData(date?.from, date?.to);
    
    // Only mark as custom if it's not from a preset button click
    if (date && !isPresetButtonClick && activeFilter !== 'ALL') {
      setActiveFilter('custom');
    }
    
    // Reset the flag after processing
    setIsPresetButtonClick(false);
  }, [date, fetchTimelineData]);

  const handleTimeRangeClick = (period: '30D' | '90D' | '1Y' | 'YTD' | 'ALL') => {
    const today = new Date();
    setActiveFilter(period);
    setIsPresetButtonClick(true);
    
    if (period === 'ALL') {
      setDate(undefined); // This will trigger the useEffect to fetch all data
      return;
    }

    let fromDate: Date;
    switch (period) {
      case '90D':
        fromDate = subDays(today, 89);
        break;
      case '1Y':
        fromDate = subYears(today, 1);
        break;
      case 'YTD':
        fromDate = startOfYear(today);
        break;
      default: // 30D
        fromDate = subDays(today, 29);
        break;
    }
    setDate({ from: fromDate, to: today });
  };

  const handleCardClick = (type: 'transactions' | 'suspicious') => {
    // Build URL parameters for the transaction data page
    const params = new URLSearchParams();
    
    if (date?.from) {
      params.set('start_date', format(date.from, 'yyyy-MM-dd'));
    }
    if (date?.to) {
      params.set('end_date', format(date.to, 'yyyy-MM-dd'));
    }
    
    // Add filter for suspicious trades if clicking on suspicious card
    if (type === 'suspicious') {
      params.set('risk_level', 'High');
    }
    
    // Navigate to transaction data page with filters
    navigate(`/raw-data?${params.toString()}`);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center py-8 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-2xl border border-gray-800">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-3">
            Trading Timeline
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Explore the chronological patterns of senator trading activity with interactive date filtering, trend analysis, and suspicious activity detection across different time periods.
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Time Range Filters</h2>
          </div>
          
          <div className="flex items-center flex-wrap gap-3">
            <Button 
              variant={activeFilter === '30D' ? 'default' : 'outline'} 
              className={activeFilter === '30D' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              } 
              onClick={() => handleTimeRangeClick('30D')}
            >
              30D
            </Button>
            <Button 
              variant={activeFilter === '90D' ? 'default' : 'outline'} 
              className={activeFilter === '90D' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              } 
              onClick={() => handleTimeRangeClick('90D')}
            >
              90D
            </Button>
            <Button 
              variant={activeFilter === '1Y' ? 'default' : 'outline'} 
              className={activeFilter === '1Y' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              } 
              onClick={() => handleTimeRangeClick('1Y')}
            >
              1Y
            </Button>
            <Button 
              variant={activeFilter === 'YTD' ? 'default' : 'outline'} 
              className={activeFilter === 'YTD' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              } 
              onClick={() => handleTimeRangeClick('YTD')}
            >
              YTD
            </Button>
            <Button 
              variant={activeFilter === 'ALL' ? 'default' : 'outline'} 
              className={activeFilter === 'ALL' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              } 
              onClick={() => handleTimeRangeClick('ALL')}
            >
              All Time
            </Button>
            
            <div className="flex-1"></div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant={activeFilter === 'custom' ? 'default' : 'outline'} 
                  className={`w-[280px] justify-start text-left font-normal ${
                    activeFilter === 'custom' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700" align="end">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  className="bg-gray-900 border-gray-700"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 h-[500px] flex items-center justify-center">
          {isLoading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-400 font-semibold">🚨 Error</p>
              <p className="text-gray-400 mt-2">{error}</p>
            </div>
          ) : timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(tick) => format(new Date(tick), 'MMM dd')}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="transactions" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="suspicious" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No data available for the selected period.</p>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="bg-gray-900 border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors duration-200" 
              onClick={() => handleCardClick('transactions')}
            >
              <CardContent className="p-6 text-center">
                  <p className="text-2xl font-bold text-white">
                   {timelineData.reduce((sum, item) => sum + item.transactions, 0).toLocaleString()}
                  </p>
                  <p className="text-gray-400">Total Transactions</p>
                  <p className="text-xs text-blue-400 mt-2">Click to view details</p>
              </CardContent>
            </Card>
            <Card 
              className="bg-gray-900 border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors duration-200" 
              onClick={() => handleCardClick('suspicious')}
            >
              <CardContent className="p-6 text-center">
                  <p className="text-2xl font-bold text-red-400">
                   {timelineData.reduce((sum, item) => sum + item.suspicious, 0).toLocaleString()}
                  </p>
                  <p className="text-gray-400">Suspicious Trades</p>
                  <p className="text-xs text-blue-400 mt-2">Click to view details</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                  <p className="text-2xl font-bold text-yellow-400">
                   {timelineData.length > 0 
                     ? (timelineData.reduce((sum, item) => sum + item.transactions, 0) / timelineData.length).toFixed(1)
                      : '0'
                    }
                  </p>
                  <p className="text-gray-400">Avg. Daily Volume</p>
              </CardContent>
            </Card>
        </div>

      </div>
    </DashboardLayout>
  );
} 