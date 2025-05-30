
import React from 'react';
import { Brain, Play, CheckCircle, AlertCircle, BarChart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface MLAnalysisSectionProps {
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
}

export const MLAnalysisSection: React.FC<MLAnalysisSectionProps> = ({ isAnalyzing, onRunAnalysis }) => {
  const modelMetrics = [
    { label: 'Accuracy', value: '94.2%', color: 'text-green-400' },
    { label: 'Precision', value: '91.8%', color: 'text-blue-400' },
    { label: 'Recall', value: '89.6%', color: 'text-purple-400' },
    { label: 'F1-Score', value: '90.7%', color: 'text-yellow-400' }
  ];

  const features = [
    'Transaction Timing Anomalies',
    'Volume Pattern Analysis',
    'Price Movement Correlation',
    'Frequency Pattern Detection',
    'Market Event Alignment',
    'Portfolio Concentration Risk',
    'Insider Information Indicators',
    'Regulatory Filing Delays'
  ];

  const riskLevels = [
    {
      level: 'Low Risk',
      range: '0.0 - 0.3',
      description: 'Standard trading patterns with minimal suspicious indicators',
      color: 'border-green-500 bg-green-500/10 text-green-400'
    },
    {
      level: 'Medium Risk',
      range: '0.3 - 0.7',
      description: 'Some anomalous patterns requiring closer monitoring',
      color: 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
    },
    {
      level: 'High Risk',
      range: '0.7 - 1.0',
      description: 'Multiple suspicious indicators suggesting potential insider trading',
      color: 'border-red-500 bg-red-500/10 text-red-400'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-purple-500" />
          Machine Learning Analysis
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Advanced AI models analyze trading patterns using multiple anomaly detection algorithms 
          to identify potentially suspicious insider trading activities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analysis Controls */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-500" />
            Analysis Controls
          </h3>
          
          <div className="space-y-4">
            <Button
              onClick={onRunAnalysis}
              disabled={isAnalyzing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Analysis...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Run ML Analysis
                </>
              )}
            </Button>

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Processing transactions...</span>
                  <span className="text-blue-400">67%</span>
                </div>
                <Progress value={67} className="w-full h-2" />
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-gray-400">
                {isAnalyzing ? 'Analysis in progress' : 'Model ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Model Performance */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-green-500" />
            Model Performance
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {modelMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                <div className="text-sm text-gray-400">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Model Status: Active</span>
            </div>
            <p className="text-xs text-gray-400">
              Last trained: 2 hours ago • Next update: 6 hours
            </p>
          </div>
        </div>

        {/* Feature Breakdown */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Analysis Features
          </h3>
          
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Level Legend */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Risk Level Classification
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {riskLevels.map((risk, index) => (
            <div key={index} className={`p-4 rounded-lg border-2 ${risk.color}`}>
              <div className="font-semibold text-lg mb-2">{risk.level}</div>
              <div className="text-sm font-mono mb-3 opacity-80">Score: {risk.range}</div>
              <p className="text-sm opacity-90">{risk.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <h4 className="font-medium text-white mb-2">How Risk Scores Are Calculated:</h4>
          <p className="text-sm text-gray-400">
            Our ensemble ML model combines eight different anomaly detection algorithms, 
            each analyzing specific aspects of trading behavior. The final suspicious score 
            represents the weighted average of all individual scores, calibrated against 
            historical patterns and regulatory guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};
