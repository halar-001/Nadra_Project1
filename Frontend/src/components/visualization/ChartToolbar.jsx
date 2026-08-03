import React from 'react';
import { Download, Maximize2, Minimize2, BarChart2, PieChart, TrendingUp } from 'lucide-react';

const ChartToolbar = ({ 
  availableCharts, 
  activeChart, 
  onChartChange, 
  isFullscreen, 
  onToggleFullscreen, 
  onExport 
}) => {
  
  const getIcon = (type) => {
    switch(type) {
      case 'BAR': return <BarChart2 size={14} />;
      case 'PIE': return <PieChart size={14} />;
      case 'LINE': return <TrendingUp size={14} />;
      default: return <BarChart2 size={14} />;
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-2.5 rounded-t-2xl">
      
      {/* Chart Switcher */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {availableCharts.map((chartType) => (
          <button
            key={chartType}
            onClick={() => onChartChange(chartType)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeChart === chartType 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shadow-2xs' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {getIcon(chartType)}
            <span className="capitalize">{chartType.toLowerCase()}</span>
          </button>
        ))}
      </div>

      {/* Actions (Export & Fullscreen) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-all text-xs font-bold shadow-2xs"
          title="Export as PNG"
        >
          <Download size={14} />
          <span>Export</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-2xs"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

    </div>
  );
};

export default ChartToolbar;
