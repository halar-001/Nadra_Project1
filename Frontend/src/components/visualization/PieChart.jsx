import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PieChart = ({ config, isDark }) => {
  
  // Tailwind-inspired beautiful color palette for Pie charts
  const colorPalette = [
    isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(37, 99, 235, 0.8)', // blue
    isDark ? 'rgba(16, 185, 129, 0.8)' : 'rgba(5, 150, 105, 0.8)', // emerald
    isDark ? 'rgba(139, 92, 246, 0.8)' : 'rgba(124, 58, 237, 0.8)', // violet
    isDark ? 'rgba(245, 158, 11, 0.8)' : 'rgba(217, 119, 6, 0.8)', // amber
    isDark ? 'rgba(236, 72, 153, 0.8)' : 'rgba(219, 39, 119, 0.8)', // pink
    isDark ? 'rgba(14, 165, 233, 0.8)' : 'rgba(2, 132, 199, 0.8)', // sky
  ];

  const borderPalette = [
    isDark ? 'rgba(96, 165, 250, 1)' : 'rgba(37, 99, 235, 1)',
    isDark ? 'rgba(52, 211, 153, 1)' : 'rgba(5, 150, 105, 1)',
    isDark ? 'rgba(167, 139, 250, 1)' : 'rgba(124, 58, 237, 1)',
    isDark ? 'rgba(251, 191, 36, 1)' : 'rgba(217, 119, 6, 1)',
    isDark ? 'rgba(244, 114, 182, 1)' : 'rgba(219, 39, 119, 1)',
    isDark ? 'rgba(56, 189, 248, 1)' : 'rgba(2, 132, 199, 1)',
  ];

  const data = {
    labels: config.labels || [],
    datasets: (config.datasets || []).map((ds) => ({
      ...ds,
      backgroundColor: ds.data.map((_, i) => colorPalette[i % colorPalette.length]),
      borderColor: ds.data.map((_, i) => borderPalette[i % borderPalette.length]),
      borderWidth: 1,
      hoverOffset: 4
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: isDark ? '#94a3b8' : '#475569',
          font: { family: "'Plus Jakarta Sans', sans-serif", weight: 'bold' },
          padding: 20
        }
      },
      title: {
        display: !!config.title,
        text: config.title || '',
        color: isDark ? '#f8fafc' : '#0f172a',
        font: { family: "'Plus Jakarta Sans', sans-serif", size: 16, weight: 'bold' },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4
      }
    },
    cutout: '40%', // Makes it a doughnut chart slightly
  };

  return <Pie data={data} options={options} />;
};

export default PieChart;
