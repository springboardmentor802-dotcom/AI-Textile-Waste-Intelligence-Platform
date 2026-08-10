import React from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function RadarChart({ labels, datasets, height = 280 }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 25, font: { size: 10 }, color: "#9ca3af" },
        grid: { color: "#f3f4f6" },
        pointLabels: { font: { size: 11 }, color: "#374151" },
        angleLines: { color: "#e5e7eb" },
      },
    },
    plugins: {
      legend: { display: true, position: "top", labels: { font: { size: 11 } } },
    },
  };

  return (
    <div style={{ height, position: "relative" }}>
      <Radar data={{ labels, datasets }} options={options} />
    </div>
  );
}