import { useEffect, useState } from 'react';
import { Leaf, Droplets, Zap } from 'lucide-react';
import Topbar from '../components/Topbar';
import TrendChart from '../components/TrendChart';
import BackToDashboard from '../components/BackToDashboard';
import { PALETTE, paletteVars } from '../constants/palette';
import { getPredictionDashboardStats } from '../services/api';
import '../pages/Dashboard.css';
import './CarbonReduction.css';

function CarbonReduction() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getPredictionDashboardStats()
      .then(setStats)
      .catch((error) => {
        console.error('Failed to load carbon reduction data:', error);
      });
  }, []);

  const summary = stats?.sustainability_environmental_summary;

  const carbonValue = summary?.total_co2_saved_kg ?? '—';

  const trend = (stats?.sustainability_trend || []).map((item) => ({
    label: item.day,
    value: item.co2_saved_kg,
  }));

  return (
    <div className="dash-shell">
      <Topbar title="Carbon Reduction" />

      <main className="dash-page">
        <BackToDashboard />

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p>
                Monitor carbon savings and environmental impact from textile
                waste recovery.
              </p>
            </div>
          </div>

          <div className="kpi-grid carbon-kpi-grid">
            <article className="kpi-card" style={paletteVars('lavender')}>
                <div className="kpi-top">
                <span className="kpi-icon">
                    <Leaf size={22} />
                </span>

                <span className="kpi-label">
                    Carbon Reduction
                </span>
                </div>

                <strong>
                {carbonValue}
                <em>kg</em>
                </strong>

                <small>
                CO₂ emissions avoided
                </small>
            </article>
            </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Daily Carbon Reduction</h2>
              <p>CO₂ emissions avoided per day.</p>
            </div>
          </div>

          <div className="sustainability-chart-card" style={paletteVars('lavender')}>
            <TrendChart data={trend} color={PALETTE.lavender.accent} unit=" kg"  xAxisTitle="CO₂ Saved (kg)"/>
          </div>
        </section>

        <section className="dashboard-section">
            <div className="section-heading">
                <div>
                <h2>Environmental Impact</h2>
                <p>
                    Environmental benefits calculated from your textile prediction records.
                </p>
                </div>
            </div>

            <div className="impact-grid">

                {/* CO₂ Saved */}
                <article
                    className="impact-card"
                    style={paletteVars('lavender')}
                >
                    <div className="impact-card-header">
                    <span className="impact-icon">
                        <Leaf size={20} />
                    </span>

                    <strong>CO₂ Saved</strong>
                    </div>

                    <div className="impact-value">
                    {summary?.total_co2_saved_kg ?? '—'}
                    <em>kg</em>
                    </div>

                    <small>
                    Carbon emissions avoided
                    </small>
                </article>


                {/* Water Saved */}
                <article
                    className="impact-card"
                    style={paletteVars('lavender')}
                >
                    <div className="impact-card-header">
                    <span className="impact-icon">
                        <Droplets size={20} />
                    </span>

                    <strong>Water Saved</strong>
                    </div>

                    <div className="impact-value">
                    {summary?.total_water_saved_liters ?? '—'}
                    <em>L</em>
                    </div>

                    <small>
                    Water saved through textile recovery
                    </small>
                </article>


                {/* Energy Saved */}
                <article
                    className="impact-card"
                    style={paletteVars('lavender')}
                >
                    <div className="impact-card-header">
                    <span className="impact-icon">
                        <Zap size={20} />
                    </span>

                    <strong>Energy Saved</strong>
                    </div>

                    <div className="impact-value">
                    {summary?.total_energy_saved_mj ?? '—'}
                    <em>MJ</em>
                    </div>

                    <small>
                    Energy saved through material recovery
                    </small>
                </article>

                </div>
            
            <p className="sustainability-data-note">
                Data is calculated from textile prediction records stored in the platform.
            </p>
            </section>
        
      </main>
    </div>
  );
}

export default CarbonReduction;