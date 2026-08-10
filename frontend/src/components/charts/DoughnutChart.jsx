import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart({ labels, data, colors, height = 240, showLegend = true }) {
  const defaultColors = [
    "#1d4ed8", "#16a34a", "#d97706", "#dc2626",
    "#7c3aed", "#0891b2", "#db2777", "#65a30d",
    "#ea580c", "#0284c7",
  ];

  const chartColors = colors || defaultColors.slice(0, labels.length);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: chartColors.map((c) => `${c}cc`),
        borderColor: chartColors,
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        display: showLegend,
        position: "bottom",
        labels: { font: { size: 11 }, color: "#374151", padding: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
            return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height, position: "relative" }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}