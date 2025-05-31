import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Users, 
  TrendingUp, 
  Settings, 
  Info, 
  FileText,
  Activity,
  Calendar
} from 'lucide-react';

const navigationItems = [
  { icon: BarChart, label: 'Dashboard', path: '/' },
  { icon: Calendar, label: 'Timeline', path: '/timeline' },
  { icon: Activity, label: 'Transaction Data', path: '/raw-data' },
  { icon: TrendingUp, label: 'Analysis', path: '/analysis' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if (path.startsWith('/#')) {
      // Handle anchor links for same page sections
      const section = path.substring(2);
      const element = document.querySelector(`[data-section="${section}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to different page
      navigate(path);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <BarChart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">STOCK</h1>
          <p className="text-sm text-gray-400">Analytics</p>
        </div>
      </div>
      
      <nav className="space-y-2">
        {navigationItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
