import { useEffect, useState } from "react";
import {
  getSustainabilitySummary,
  getSustainabilityTrends,
  getCategoryBreakdown,
  getMaterialRecovery,
} from "../services/sustainabilityService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import "./SustainabilityDashboard.css";

const PIE_COLORS = ["#2e7d32", "#c69a3e", "#a85c42", "#506a4d", "#8884d8", "#82ca9d"];

function SustainabilityDashboard() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [recoveryData, setRecoveryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, trendsData, categoryRes, recoveryRes] = await Promise.all([
          getSustainabilitySummary(),
          getSustainabilityTrends(),
          getCategoryBreakdown(),
          getMaterialRecovery(),
        ]);
        setSummary(summaryData);
        setTrends(trendsData);
        setCategoryData(categoryRes.category_breakdown);
        setRecoveryData(recoveryRes.material_recovery);
      } catch (err) {
        setError("Failed to load sustainability data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading sustainability data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="sustainability-dashboard">
      <h2>Sustainability Dashboard</h2>

      <div className="metric-cards">
        <div className="card">
          <h3>Total CO₂ Saved</h3>
          <p>{summary.total_co2_saved_kg} kg</p>
        </div>

        <div className="card">
          <h3>Total Water Saved</h3>
          <p>{summary.total_water_saved_liters.toLocaleString()} L</p>
        </div>

        <div className="card">
          <h3>Avg. Circularity Score</h3>
          <p>{summary.average_circularity_score}%</p>
        </div>

        <div className="card">
          <h3>Waste Diversion Rate</h3>
          <p>{summary.waste_diversion_rate_percent}%</p>
        </div>

        <div className="card">
          <h3>Total Batches</h3>
          <p>{summary.total_batches}</p>
        </div>

        <div className="card">
          <h3>Processed Batches</h3>
          <p>{summary.processed_batches}</p>
        </div>
      </div>

      {trends && (
        <>
          <div className="chart-section">
            <h3>CO₂ &amp; Water Saved by Material</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={trends.material_breakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="material" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_co2_saved_kg" fill="#2e7d32" name="CO₂ Saved (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-section">
            <h3>CO₂ Saved Over Time</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trends.monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_co2_saved_kg"
                  stroke="#2e7d32"
                  name="CO₂ Saved (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {categoryData && categoryData.length > 0 && (
        <div className="chart-section">
          <h3>Waste Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="total_quantity_kg"
                nameKey="waste_category"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label={(entry) => `${entry.waste_category} (${entry.total_quantity_kg} kg)`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {recoveryData && recoveryData.length > 0 && (
        <div className="chart-section">
          <h3>Material Recovery Rate</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={recoveryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="material" />
              <YAxis unit="%" />
              <Tooltip />
              <Legend />
              <Bar dataKey="recovery_rate_percent" fill="#506a4d" name="Recovery Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default SustainabilityDashboard;