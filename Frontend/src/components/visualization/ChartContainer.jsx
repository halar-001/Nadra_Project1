import React, { useState, useRef, useEffect } from 'react';
import { BarChart2, ChevronDown, ChevronUp } from 'lucide-react';
import ChartToolbar from './ChartToolbar';
import BarChart from './BarChart';
import LineChart from './LineChart';
import PieChart from './PieChart';
import { exportChartAsImage } from './ChartExporter';

const ChartContainer = ({ visualization }) => {
  const [activeChart, setActiveChart] = useState(visualization?.recommendedChart || 'BAR');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const chartWrapperRef = useRef(null);
  
  // To get current dark mode status from Tailwind document class
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (visualization?.recommendedChart) {
      setActiveChart(visualization.recommendedChart);
    }
  }, [visualization]);

  if (!visualization || !visualization.config) return null;

  const handleExport = () => {
    // chart.js canvas instances are rendered inside the wrapper
    const canvas = chartWrapperRef.current?.querySelector('canvas');
    if (canvas) {
      // Create a temporary reference object that matches ChartExporter expectations
      const mockRef = { current: { toBase64Image: (type, quality) => canvas.toDataURL(type, quality) } };
      exportChartAsImage(mockRef, `${visualization.config.title || 'export'}.png`);
    }
  };

  const renderActiveChart = () => {
    const props = { config: visualization.config, isDark };
    switch (activeChart) {
      case 'BAR': return <BarChart {...props} />;
      case 'LINE': return <LineChart {...props} />;
      case 'PIE': return <PieChart {...props} />;
      default: return <BarChart {...props} />;
    }
  };

  const containerClasses = isFullscreen
    ? "fixed inset-4 z-[100] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
    : "w-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-2xl flex flex-col overflow-hidden mt-2";

  return (
    <div className="mt-4 w-full">
      <button
        onClick={() => setIsChartVisible(!isChartVisible)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 text-xs font-extrabold transition-all hover:bg-blue-100 dark:hover:bg-blue-900/60 shadow-2xs w-fit"
      >
        <BarChart2 size={14} />
        <span>{isChartVisible ? "Hide Chart Visualization" : "View Chart Visualization"}</span>
        {isChartVisible ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isChartVisible && (
        <>
          {isFullscreen && (
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] animate-in fade-in duration-200" 
              onClick={() => setIsFullscreen(false)} 
            />
          )}
          
          <div className={containerClasses}>
            <ChartToolbar
              availableCharts={visualization.availableCharts || [visualization.recommendedChart]}
              activeChart={activeChart}
              onChartChange={setActiveChart}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              onExport={handleExport}
            />
            
            <div 
              ref={chartWrapperRef} 
              className={`relative p-4 ${isFullscreen ? 'flex-1 min-h-[400px]' : 'h-80 w-full'} bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-center`}
            >
              {renderActiveChart()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChartContainer;
