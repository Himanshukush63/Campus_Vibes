import React, { useEffect, useState } from "react";
import LineChart from "../../charts/LineChart01";
import Icon from "../../images/icon-01.svg";
import axios from "axios";
import { hexToRGB, tailwindConfig } from "../../utils/Utils";

function DashboardCard01() {
  const [trafficData, setTrafficData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        fill: true,
        backgroundColor: `rgba(${hexToRGB(tailwindConfig().theme.colors.blue[500])}, 0.08)`,
        borderColor: tailwindConfig().theme.colors.indigo[500],
        borderWidth: 2,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: tailwindConfig().theme.colors.indigo[500],
        pointHoverBackgroundColor: tailwindConfig().theme.colors.indigo[500],
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
      },
    ],
  });

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/traffic/traffic-data`
        );

        const labels = response.data.map((entry) =>
          new Date(entry.date).toLocaleDateString()
        );
        const data = response.data.map((entry) => entry.visits);

        setTrafficData((prev) => ({
          ...prev,
          labels,
          datasets: [
            {
              ...prev.datasets[0],
              data,
            },
          ],
        }));
      } catch (error) {
        console.error("Error fetching traffic data:", error);
      }
    };

    fetchTrafficData();
  }, []);

  return (
    <div className="flex flex-col justify-between col-span-full sm:col-span-6 xl:col-span-6 bg-white shadow-lg rounded-sm border border-slate-200">
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <img src={Icon} width="32" height="32" alt="Icon 01" />
        </header>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">
          College Buzz
        </h2>
        <div className="text-xs font-semibold text-slate-400 uppercase mb-1">
          Traffic
        </div>
        <div className="flex items-start">
          <div className="text-3xl font-bold text-slate-800 mr-2">
            {trafficData.datasets[0].data.reduce((a, b) => a + b, 0)}
          </div>
          <div className="text-sm font-semibold text-white px-1.5 bg-emerald-500 rounded-full">
            +49%
          </div>
        </div>
      </div>
      <div className="grow max-sm:max-h-[128px] xl:max-h-[128px]">
        <LineChart data={trafficData} width={389} height={128} />
      </div>
    </div>
  );
}

export default DashboardCard01;