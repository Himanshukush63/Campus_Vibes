import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { chartColors } from './ChartjsConfig';
import {CategoryScale} from 'chart.js'; 
import {
  Chart, LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip,
} from 'chart.js';
import 'chartjs-adapter-moment';
import { tailwindConfig } from '../utils/Utils';

// Register Chart.js components
Chart.register(LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip);
Chart.register(CategoryScale);

function LineChart02({ data, width, height, stats }) {
  const [chart, setChart] = useState(null);
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { textColor, gridColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  // Format value for tooltips and ticks
  const formatValue = (value) => {
    return value.toLocaleString(); // Formats numbers with commas
  };

  // Initialize chart
  useEffect(() => {
    const ctx = canvas.current;

    // Destroy existing chart if it exists
    if (chart) chart.destroy();

    const newChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        layout: {
          padding: 20,
        },
        scales: {
          y: {
            border: {
              display: false,
            },
            beginAtZero: true,
            ticks: {
              maxTicksLimit: 5,
              callback: (value) => formatValue(value),
              color: darkMode ? textColor.dark : textColor.light,
            },
            grid: {
              color: darkMode ? gridColor.dark : gridColor.light,
            },
          },
          x: {
            type: 'category', // Use category scale for months
            border: {
              display: false,
            },
            grid: {
              display: false,
            },
            ticks: {
              autoSkipPadding: 48,
              maxRotation: 0,
              color: darkMode ? textColor.dark : textColor.light,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                // Display the month in the tooltip title
                return context[0].label;
              },
              label: (context) => `Active Users: ${formatValue(context.parsed.y)}`,
            },
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
    });

    setChart(newChart);

    // Cleanup function to destroy chart on unmount
    return () => newChart.destroy();
  }, [data, darkMode]); // Re-render chart when data or theme changes

  // Update chart when theme changes
  useEffect(() => {
    if (!chart) return;

    // Update chart colors for dark/light mode
    chart.options.scales.x.ticks.color = darkMode ? textColor.dark : textColor.light;
    chart.options.scales.y.ticks.color = darkMode ? textColor.dark : textColor.light;
    chart.options.scales.y.grid.color = darkMode ? gridColor.dark : gridColor.light;
    chart.options.plugins.tooltip.bodyColor = darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light;
    chart.options.plugins.tooltip.backgroundColor = darkMode ? tooltipBgColor.dark : tooltipBgColor.light;
    chart.options.plugins.tooltip.borderColor = darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light;

    chart.update(); // Update the chart
  }, [currentTheme]);

  return (
    <React.Fragment>
      <div className="px-5 py-3">
        <div className="flex flex-wrap justify-between items-end">
          <div className="flex items-start">
            <div className="text-3xl font-bold text-slate-800 mr-2">
              {stats.current}
            </div>
            <div className={`text-sm font-semibold text-white px-1.5 rounded-full ${
              stats.change >= 0 ? 'bg-emerald-500' : 'bg-amber-500'
            }`}>
              {stats.change}%
            </div>
          </div>
        </div>
      </div>
      <div className="grow">
        <canvas ref={canvas} width={width} height={height}></canvas>
      </div>
    </React.Fragment>
  );
}

export default LineChart02;