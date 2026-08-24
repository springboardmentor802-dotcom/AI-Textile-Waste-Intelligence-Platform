import { useEffect, useState } from 'react';
import { BrainCircuit, Gauge, Recycle } from 'lucide-react';
import Topbar from '../components/Topbar';
import BackToDashboard from '../components/BackToDashboard';
import TrendChart from '../components/TrendChart';
import { getPlatformAnalytics } from '../services/api';
import '../pages/Dashboard.css';
import './AIActivity.css';

/* ---------------------------------------------------------
   Single coherent visual identity for this page: gold/yellow.
   Same hue family as PALETTE.golden in constants/palette.js,
   shifted to a stronger/bolder accent (the default golden.accent
   is a pale yellow that reads as washed-out for a chart line/
   card accents at this size). Kept local to this file, same as
   Platform Analytics' local pink variant.
---------------------------------------------------------- */
const STRONG_GOLD = {
  soft: '#FBF3D9',
  border: '#D8B93A',
  icon: '#8A6D0E',
  accent: '#C9A227',
  text: '#5C4A0E',
  button: '#B7930F',
};

const goldVars = () => ({
  '--p-soft': STRONG_GOLD.soft,
  '--p-border': STRONG_GOLD.border,
  '--p-icon': STRONG_GOLD.icon,
  '--p-accent': STRONG_GOLD.accent,
  '--p-text': STRONG_GOLD.text,
  '--p-button': STRONG_GOLD.button,
});

/* ---------------------------------------------------------
   AI Activity vs. Platform Analytics
   -----------------------------------
   Both pages currently read from the same GET /admin/analytics
   response, because that is the only platform-wide data source
   that exists today -- there is no separate "AI activity log"
   endpoint, and this task's instructions explicitly say not to
   create new backend APIs.

   To avoid literally repeating the Platform Analytics page,
   this page:
     - Does NOT show Users by Role or Fabric Distribution
       (those describe accounts/inventory, not AI activity).
     - Does NOT show the full Waste Category / Recyclability
       breakdown lists (those already live on Platform Analytics).
     - Instead shows only the two prediction-specific KPIs
       (volume, average circularity score) plus a single "top"
       highlight for waste category and recyclability -- a
       different, more compact presentation of the same
       underlying numbers, focused specifically on classification
       activity rather than full platform breakdowns.
     - Leads with the daily classification trend chart as the
       primary content, since that's the closest real proxy this
       backend has for "AI activity over time".

   If per-prediction, per-user activity logging is wanted later
   (e.g. "who classified what, and when"), that requires a new
   backend endpoint querying the Prediction table without the
   user_id filter used by /history -- flagged here rather than
   built, since new backend work is out of scope for this task.
---------------------------------------------------------- */

function topEntry(items, labelKey) {
  if (!items || items.length === 0) return null;
  // Distribution arrays already come sorted by count from the
  // backend (Counter.most_common()), so the first entry is the top one.
  return items[0];
}

function formatWasteLabel(value) {
  return String(value || '').replace(/_/g, ' ');
}

function AIActivity() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const result = await getPlatformAnalytics();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load AI activity data.');
    } finally {
      setLoading(false);
    }
  }

  const topWasteCategory = data ? topEntry(data.waste_category_distribution) : null;

  return (
    <div className="dash-shell">
      <Topbar title="AI Activity" />

      <main className="dash-page">
        <BackToDashboard />

        <section className="dashboard-section ai-activity-page">
          <div className="section-heading">
            <div>
              <p>
                Classification activity and prediction performance for the AI model,
                aggregated across every user on the platform.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="admin-analytics-state">Loading AI activity…</div>
          ) : error ? (
            <div className="dash-errors">
              <span>{error}</span>
              <button type="button" className="users-retry-btn" onClick={load} style={{ marginTop: 8 }}>
                Try Again
              </button>
            </div>
          ) : data ? (
            <>
              <div className="kpi-grid aa-kpi-grid">
                <article className="kpi-card" style={goldVars()}>
                  <div className="kpi-top">
                    <span className="kpi-icon"><BrainCircuit size={22} /></span>
                    <span className="kpi-label">Total Classifications</span>
                  </div>
                  <strong>{data.total_predictions}</strong>
                  <small>AI predictions run across all users</small>
                </article>

                <article className="kpi-card" style={goldVars()}>
                  <div className="kpi-top">
                    <span className="kpi-icon"><Gauge size={22} /></span>
                    <span className="kpi-label">Avg. Circularity Score</span>
                  </div>
                  <strong>
                    {data.average_circularity_score !== null ? data.average_circularity_score : '—'}
                    {data.average_circularity_score !== null && <em>/100</em>}
                  </strong>
                  <small>Average quality of classified material</small>
                </article>

                <article className="kpi-card" style={goldVars()}>
                  <div className="kpi-top">
                    <span className="kpi-icon"><Recycle size={22} /></span>
                    <span className="kpi-label">Top Waste Category</span>
                  </div>
                  <strong className="ai-activity-text-value">
                    {topWasteCategory ? formatWasteLabel(topWasteCategory.waste_category) : '—'}
                  </strong>
                  <small>
                    {topWasteCategory
                      ? `${topWasteCategory.count} classification${topWasteCategory.count === 1 ? '' : 's'}`
                      : 'No AI predictions yet'}
                  </small>
                </article>
              </div>

              <div className="mfr-graph-grid" style={{ marginTop: 14 }}>
                <div className="mfr-graph-card aa-graph-card mfr-graph-card-wide" style={goldVars()}>
                  <h3>AI Classification Volume — Daily</h3>
                  {data.prediction_trend.length > 0 ? (
                    <TrendChart
                      data={data.prediction_trend.map((point) => ({
                        label: point.day,
                        value: point.count,
                      }))}
                      color={STRONG_GOLD.accent}
                      unit=" classifications"
                      xAxisTitle="Date"
                    />
                  ) : (
                    <p className="admin-analytics-empty">No predictions yet.</p>
                  )}
                </div>
              </div>

              <p className="ai-activity-note">
                Detailed per-record classification history (per user, per prediction) isn't
                available in this view yet — see Platform Analytics for the full waste
                category and recyclability breakdowns.
              </p>
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default AIActivity;
