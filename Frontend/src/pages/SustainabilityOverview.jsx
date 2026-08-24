import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import TrendChart from '../components/TrendChart';
import { PALETTE, paletteVars } from '../constants/palette';
import { getPredictionDashboardStats } from '../services/api';
import BackToDashboard from '../components/BackToDashboard';
import '../pages/Dashboard.css';
import './SustainabilityOverview.css';

function SustainabilityOverview() {

  const [stats, setStats] = useState(null);

  useEffect(() => {
    getPredictionDashboardStats()
      .then(setStats)
      .catch((error) => {
        console.error('Failed to load sustainability data:', error);
      });
  }, []);

  const trend = (stats?.sustainability_trend || []).map((item) => ({
    label: item.day,
    value: item.circularity_score,
  }));

  const totalPredictions = stats?.total_predictions || 0;

const recoverableCount = (stats?.waste_category_distribution || [])
  .filter((item) =>
    [
      'Recyclable Textile Waste',
      'Upcyclable Textile Waste',
      'Reusable Textile Waste',
    ].includes(item.waste_category)
  )
  .reduce((total, item) => total + item.count, 0);

const resourceRecovery =
  totalPredictions > 0
    ? ((recoverableCount / totalPredictions) * 100).toFixed(2)
    : '0.00';

const kpis = [
  {
    key: 'recovery',
    label: 'Circularity Score',
    value: stats?.average_circularity_score ?? '—',
    unit: '/100',
    sublabel: 'Average circularity performance',
    color: 'teal',
  },
  {
    key: 'diversion',
    label: 'Waste Diversion',
    value: stats?.sustainability_environmental_summary?.total_landfill_diversion_kg ?? '—',
    unit: ' kg',
    sublabel: 'Total landfill diversion',
    color: 'magenta',
  },
  {
    key: 'carbon',
    label: 'Carbon Reduction',
    value: stats?.sustainability_environmental_summary?.total_co2_saved_kg ?? '—',
    unit: ' kg',
    sublabel: 'CO₂ emissions avoided',
    color: 'golden',
  },
  {
    key: 'recovery-rate',
    label: 'Resource Recovery',
    value: resourceRecovery,
    unit: '%',
    sublabel: 'Materials suitable for recovery',
    color: 'lavender',
  },
];

  return (
    <div className="dash-shell">
      <Topbar title="Sustainability Overview" />

      <main className="dash-page">
        <BackToDashboard />

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p>
                Monitor sustainability performance and environmental impact
                across your textile waste operations.
              </p>
            </div>
          </div>

          <div className="kpi-grid">
            {kpis.map((kpi) => (
              <article
                key={kpi.key}
                className="kpi-card"
                style={paletteVars(kpi.color)}
              >
                <div className="kpi-top">
                  <span className="kpi-label">{kpi.label}</span>
                </div>
                <strong>
                  {kpi.value}
                  <em>{kpi.unit}</em>
                </strong>
                <small>{kpi.sublabel}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Sustainability Performance</h2>
              <p>Track sustainability performance and environmental impact over time.</p>
            </div>
          </div>

          <div
            className="sustainability-chart-card"
            style={paletteVars('teal')}
          >
            <TrendChart
              data={trend}
              color={PALETTE.teal.accent}
              unit="%"
              xAxisTitle="Circularity Score (%)"
            />
          </div>

          <p className="sustainability-data-note">
            Data is calculated from textile prediction records stored in the platform.
          </p>
        </section>
      </main>
    </div>
  );
}

export default SustainabilityOverview;