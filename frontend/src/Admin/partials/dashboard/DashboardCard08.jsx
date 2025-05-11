import React, { useEffect, useState } from 'react';
import LineChart from '../../charts/LineChart02';
import axios from 'axios';
import { tailwindConfig } from '../../utils/Utils';

function DashboardCard08() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Active Users',
        data: [],
        borderColor: tailwindConfig().theme.colors.indigo[500],
        fill: false,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: tailwindConfig().theme.colors.indigo[500],
        clip: 20,
      },
    ],
  });

  const [stats, setStats] = useState({
    current: 0,
    previous: 0,
    change: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/analytics/user-activity`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );

        // Group activeUsers by month
        const monthlyData = response.data.activityData.reduce((acc, entry) => {
          const date = new Date(entry.date);
          const month = date.toLocaleString('default', { month: 'short', year: '2-digit' }); // e.g., "Feb 25"

          if (!acc[month]) {
            acc[month] = 0;
          }
          acc[month] += entry.activeUsers;
          return acc;
        }, {});

        // Convert grouped data to arrays for labels and data
        const labels = Object.keys(monthlyData);
        const activeUsers = Object.values(monthlyData);

        setChartData((prev) => ({
          ...prev,
          labels,
          datasets: [
            {
              ...prev.datasets[0],
              data: activeUsers,
            },
          ],
        }));

        // Calculate stats
        const current = activeUsers[activeUsers.length - 1] || 0;
        const previous = activeUsers[activeUsers.length - 2] || 0;
        const change = ((current - previous) / previous) * 100 || 0;

        setStats({
          current,
          previous,
          change: Math.round(change),
        });
      } catch (error) {
        console.error('Error fetching user activity:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white shadow-lg rounded-sm border border-slate-200">
      <header className="px-5 py-4 border-b border-slate-100 flex items-center">
        <h2 className="font-semibold text-slate-800">Monthly Active Users</h2>
      </header>
      <LineChart data={chartData} width={595} height={248} stats={stats} />
    </div>
  );
}

export default DashboardCard08;