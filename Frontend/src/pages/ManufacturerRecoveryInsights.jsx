import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Recycle, Brain, Layers3, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { getInventoryList, getPredictionDashboardStats } from '../services/api';
import './ManufacturerRecoveryInsights.css';

const GOLD = '#B79A25';
const GOLD_MID = '#C7A94A';
const GOLD_LIGHT = '#E4C892';
const MAGENTA = '#7A3B6E';

export default function ManufacturerRecoveryInsights() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getInventoryList(), getPredictionDashboardStats()])
      .then(([items, dashboardStats]) => {
        if (!active) return;
        setInventory(Array.isArray(items) ? items : []);
        setStats(dashboardStats || {});
      })
      .catch((err) => active && setError(err?.message || 'Unable to load recovery insights.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const materialBreakdown = useMemo(() => {
    const totals = {};
    inventory.forEach((item) => {
      const material = item?.fabric_type || 'Unknown';
      totals[material] = (totals[material] || 0) + (Number(item?.quantity) || 0);
    });
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    return Object.entries(totals)
      .map(([name, quantity]) => ({ name, quantity, percent: total ? Math.round(quantity / total * 100) : 0 }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [inventory]);

  const totalQuantity = inventory.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
  const score = Number(stats?.average_circularity_score);
  const predictions = Number(stats?.total_predictions) || 0;
  const scoreValue = Number.isFinite(score) ? score : null;
  const scoreWidth = Math.max(0, Math.min(scoreValue ?? 0, 100));

  return (
    <div className="mri-page">
      <Topbar title="Recovery Insights" />
      <main className="mri-content">
        <div className="mri-header-row">
          <button className="mri-back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>

        {error && <div className="mri-error">{error}</div>}

        {loading ? <div className="mri-loading">Loading recovery insights...</div> : (
          <>
            <section className="mri-section">
              <div className="mri-section-heading">
                <div>
                  
                  <p className="mri-section-description">
                    Review material recovery and AI classification results from your textile operations.
                  </p>
                </div>
                
              </div>
              <div className="mri-performance-grid">
                <article className="mri-performance-card mri-magenta-card">
                  <div className="mri-card-icon"><Recycle size={20} /></div>
                  <div className="mri-card-copy">
                    <span>Material Recovery Score</span>
                    <strong>{scoreValue === null ? '—' : scoreValue.toFixed(1)}</strong>
                    <small>Average circularity score / 100</small>
                  </div>
                  <div className="mri-score-track"><span style={{ width: `${scoreWidth}%` }} /></div>
                </article>
                <article className="mri-performance-card mri-pink-card">
                  <div className="mri-card-icon"><Brain size={20} /></div>
                  <div className="mri-card-copy">
                    <span>AI Classifications</span>
                    <strong>{predictions}</strong>
                    <small>Total textile predictions recorded</small>
                  </div>
                </article>
              </div>
            </section>

            <section className="mri-section">
              <div className="mri-section-heading">
                <div>
                  
                  <h2>Material Composition</h2>
                </div>
                
              </div>
              <div className="mri-composition-card">
                {materialBreakdown.length === 0 ? <p className="mri-empty">No inventory material data is available yet.</p> : (
                  <div className="mri-material-list">
                    {materialBreakdown.map((material, index) => {
                      const bar = [GOLD, GOLD_MID, GOLD_LIGHT][index % 3];
                      return (
                        <div className="mri-material-row" key={material.name}>
                          <div className="mri-material-top">
                            <div className="mri-material-name">
                              <span className="mri-material-dot" style={{ background: bar }} />
                              {material.name}
                            </div>
                            <span>{material.quantity} · {material.percent}%</span>
                          </div>
                          <div className="mri-material-track">
                            <span style={{ width: `${material.percent}%`, background: bar }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className="mri-section">
              <div className="mri-section-heading">
                <div>
                  
                  <h2>Recovery Summary</h2>
                </div>
              </div>
              <div className="mri-overview-grid">
                <article className="mri-overview-card mri-magenta-card">
                  <div className="mri-card-icon"><Layers3 size={19} /></div>
                  <div>
                    <h3>Material Mix</h3>
                    <p>The composition above is calculated directly from manufacturer inventory records and their recorded quantities.</p>
                  </div>
                </article>
                <article className="mri-overview-card mri-magenta-card">
                  <div className="mri-card-icon"><TrendingUp size={19} /></div>
                  <div>
                    <h3>Circularity Signal</h3>
                    <p>The recovery score reflects the average circularity score currently returned by the platform.</p>
                  </div>
                </article>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}