import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { chartColors } from './ChartjsConfig';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-moment';

// Import utilities
import { tailwindConfig } from '../utils/Utils';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

function DoughnutChart({ data, width, height }) {
  const [chart, setChart] = useState(null);
  const canvas = useRef(null);
  const legend = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { tooltipTitleColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  // Initialize chart
  useEffect(() => {
    const ctx = canvas.current;
    
    // Destroy existing chart if it exists
    if (chart) chart.destroy();

    const newChart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        cutout: '80%',
        layout: {
          padding: 24,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            titleColor: darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light,
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
        animation: {
          duration: 500,
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
    });

    setChart(newChart);
    return () => newChart.destroy();
  }, [data, darkMode]); // Add data and darkMode as dependencies

  // Update chart when theme changes
  useEffect(() => {
    if (!chart || !chart.ctx) return;

    chart.options.plugins.tooltip = {
      titleColor: darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light,
      bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
      backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
      borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
    };

    chart.update();
  }, [currentTheme, chart]);

  return (
    <div className="grow flex flex-col justify-center">
      <div>
        <canvas ref={canvas} width={width} height={height}></canvas>
      </div>
      <div className="px-5 pt-2 pb-6">
        <ul ref={legend} className="flex flex-wrap justify-center -m-1"></ul>
      </div>
    </div>
  );
}

export default DoughnutChart;