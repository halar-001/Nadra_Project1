import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ config, isDark }) => {
  const data = {
    labels: config.labels || [],
    datasets: (config.datasets || []).map((ds, index) => ({
      ...ds,
      backgroundColor: index === 0 ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)') : (isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.1)'),
      borderColor: index === 0 ? (isDark ? 'rgba(96, 165, 250, 1)' : 'rgba(37, 99, 235, 1)') : (isDark ? 'rgba(52, 211, 153, 1)' : 'rgba(5, 150, 105, 1)'),
      borderWidth: 2,
      pointBackgroundColor: index === 0 ? (isDark ? 'rgba(96, 165, 250, 1)' : 'rgba(37, 99, 235, 1)') : (isDark ? 'rgba(52, 211, 153, 1)' : 'rgba(5, 150, 105, 1)'),
      pointBorderColor: isDark ? '#0f172a' : '#ffffff',
      pointBorderWidth: 1.5,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.3 // Smooth curves
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#94a3b8' : '#475569',
          font: { family: "'Plus Jakarta Sans', sans-serif", weight: 'bold' }
        }
      },
      title: {
        display: !!config.title,
        text: config.title || '',
        color: isDark ? '#f8fafc' : '#0f172a',
        font: { family: "'Plus Jakarta Sans', sans-serif", size: 16, weight: 'bold' }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(51, 65, 85, 0.2)' : 'rgba(226, 232, 240, 0.5)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: "'JetBrains Mono', monospace", size: 11 } }
      },
      y: {
        grid: { color: isDark ? 'rgba(51, 65, 85, 0.2)' : 'rgba(226, 232, 240, 0.5)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: "'JetBrains Mono', monospace", size: 11 } }
      }
    }
  };

  return <Line data={data} options={options} />;
};

export default LineChart;
