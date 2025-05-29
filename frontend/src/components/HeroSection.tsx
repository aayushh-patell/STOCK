import React from 'react';
import { TrendingUp, Shield, BarChart } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="text-center py-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-gray-800">
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
            <BarChart className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      
      <h1 className="text-6xl font-bold text-white mb-4">
        STOCK
      </h1>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
        Uncovering the hidden patterns in U.S. Senator trading activity through advanced data processing techniques and analytics.
      </p>
    </div>
  );
};
