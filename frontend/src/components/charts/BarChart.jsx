import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({
  labels,
  datasets,
  title,
  height = 260,
  horizontal = false,
  showLegend = true,
}) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? "y" : "x",
    plugins: {
      legend: { display: showLegend, position: "top" },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label || ""}: ${ctx.parsed[horizontal ? "x" : "y"]}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "#f3f4f6" },
        ticks: { font: { size: 11 }, color: "#6b7280" },
      },
      y: {
        grid: { color: "#f3f4f6" },
        ticks: { font: { size: 11 }, color: "#6b7280" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height, position: "relative" }}>
      <Bar data={{ labels, datasets }} options={options} />
    </div>
  );
}