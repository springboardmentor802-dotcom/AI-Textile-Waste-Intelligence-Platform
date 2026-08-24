import { useEffect, useState } from 'react';
import { Recycle, ArrowDown } from 'lucide-react';
import Topbar from '../components/Topbar';
import TrendChart from '../components/TrendChart';
import BackToDashboard from '../components/BackToDashboard';
import { PALETTE, paletteVars } from '../constants/palette';
import { getPredictionDashboardStats } from '../services/api';
import '../pages/Dashboard.css';
import './WasteDiversion.css';

function WasteDiversion() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getPredictionDashboardStats()
      .then(setStats)
      .catch((error) => {
        console.error('Failed to load waste diversion data:', error);
      });
  }, []);

  const summary = stats?.sustainability_environmental_summary;

  const wasteDiversion =
    summary?.total_landfill_diversion_kg ?? '—';

  const totalPredictions =
    stats?.total_predictions ?? '—';

  const wasteCategories =
    stats?.waste_category_distribution || [];

  const trend = (stats?.sustainability_trend || [])
    .filter((item) => item.landfill_diversion_kg != null)
    .map((item) => ({
      label: item.day,
      value: item.landfill_diversion_kg,
    }));

  return (
    <div className="dash-shell">
      <Topbar title="Waste Diversion" />

      <main className="dash-page">
        <BackToDashboard />

        {/* Introduction */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p>
                Analyze waste diversion and landfill reduction
                across your textile waste operations.
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="kpi-grid waste-kpi-grid">

            <article
              className="kpi-card"
              style={paletteVars('golden')}
            >
              <div className="kpi-top">
                <span className="kpi-icon">
                  <Recycle size={22} />
                </span>

                <span className="kpi-label">
                  Waste Diverted
                </span>
              </div>

              <strong>
                {wasteDiversion}
                <em>kg</em>
              </strong>

              <small>
                Textile waste diverted from landfill
              </small>
            </article>


            <article
              className="kpi-card"
              style={paletteVars('golden')}
            >
              <div className="kpi-top">
                <span className="kpi-icon">
                  <Recycle size={22} />
                </span>

                <span className="kpi-label">
                  Waste Records
                </span>
              </div>

              <strong>
                {totalPredictions}
              </strong>

              <small>
                Textile prediction records processed
              </small>
            </article>


            <article
              className="kpi-card"
              style={paletteVars('golden')}
            >
              <div className="kpi-top">
                <span className="kpi-icon">
                  <Recycle size={22} />
                </span>

                <span className="kpi-label">
                  Landfill Avoided
                </span>
              </div>

              <strong>
                {wasteDiversion}
                <em>kg</em>
              </strong>

              <small>
                Estimated textile waste kept from landfill
              </small>
            </article>

          </div>
        </section>


        {/* Daily Waste Diversion */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Daily Waste Diversion</h2>

              <p>
                Textile waste diverted from landfill based on
                prediction records.
              </p>
            </div>
          </div>

          <div
            className="sustainability-chart-card"
            style={paletteVars('golden')}
          >
            <TrendChart
              data={trend}
              color={PALETTE.golden.accent}
              unit=" kg"
              xAxisTitle="Waste Diverted (kg)"
            />
          </div>
        </section>


        {/* Waste Flow */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Waste Category Distribution</h2>

              <p>
                Distribution of textile waste categories
                identified by the AI prediction system.
              </p>
            </div>
          </div>

          <div
            className="waste-flow"
            style={paletteVars('golden')}
          >

            <div className="waste-flow-step-wrapper">
              <div className="waste-flow-step">
                <span className="waste-flow-icon">
                  <Recycle size={18} />
                </span>

                <span>
                  Predicted Textile Waste
                  <small>
                    {totalPredictions} records
                  </small>
                </span>
              </div>

              <span className="waste-flow-arrow">
                <ArrowDown size={18} />
              </span>
            </div>


            {wasteCategories.map((category, index) => (
              <div
                className="waste-flow-step-wrapper"
                key={category.waste_category}
              >
                <div className="waste-flow-step">
                  <span className="waste-flow-icon">
                    <Recycle size={18} />
                  </span>

                  <span>
                    {category.waste_category}

                    <small>
                      {category.count}{' '}
                      {category.count === 1
                        ? 'record'
                        : 'records'}
                    </small>
                  </span>
                </div>

                {index < wasteCategories.length - 1 && (
                  <span className="waste-flow-arrow">
                    <ArrowDown size={18} />
                  </span>
                )}
              </div>
            ))}

          </div>

          <p className="sustainability-data-note">
            Data is calculated from textile prediction records
            stored in the platform.
          </p>
        </section>

      </main>
    </div>
  );
}

export default WasteDiversion;