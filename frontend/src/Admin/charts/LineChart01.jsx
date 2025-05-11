import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { chartColors } from './ChartjsConfig';
import {
  Chart, LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip,
} from 'chart.js';
import 'chartjs-adapter-moment';

// Import utilities
import { formatValue } from '../utils/Utils';

Chart.register(LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip);

function LineChart01({ data, width, height }) {
  const [chart, setChart] = useState(null);
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { tooltipBodyColor, tooltipBgColor, tooltipBorderColor, chartAreaBg } = chartColors;

  // Initialize chart
  useEffect(() => {
    const ctx = canvas.current;

    // Destroy existing chart if it exists
    if (chart) chart.destroy();

    const newChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        chartArea: {
          backgroundColor: darkMode ? chartAreaBg.dark : chartAreaBg.light,
        },
        layout: {
          padding: 20,
        },
        scales: {
          y: {
            display: false,
            beginAtZero: true,
          },
          x: {
            type: 'time',
            time: {
              parser: 'MM-DD-YYYY',
              unit: 'month',
            },
            display: false,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: () => false, // Disable tooltip title
              label: (context) => formatValue(context.parsed.y),
            },
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
          },
          legend: {
            display: false,
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
    return () => newChart.destroy();
  }, [data, darkMode]); // Add data and darkMode as dependencies

  // Update chart when theme changes
  useEffect(() => {
    if (!chart || !chart.ctx) return;

    chart.options.chartArea.backgroundColor = darkMode ? chartAreaBg.dark : chartAreaBg.light;
    chart.options.plugins.tooltip = {
      bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
      backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
      borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
    };

    chart.update();
  }, [currentTheme, chart]);

  return (
    <canvas ref={canvas} width={width} height={height}></canvas>
  );
}

export default LineChart01;