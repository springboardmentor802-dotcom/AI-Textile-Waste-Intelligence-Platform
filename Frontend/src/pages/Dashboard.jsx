import { useState, useEffect } from 'react';
import { getCurrentUser, getDashboardStats } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Package, Recycle, BrainCircuit, Leaf, Plus, Upload, FileBarChart, ClipboardList, CircleDot, TrendingUp } from 'lucide-react';
import Topbar from '../components/Topbar';
import './Dashboard.css';

const COLORS = ['#2e7d32', '#4285f4', '#8e24aa', '#f9a825', '#9e9e9e'];
const ICON_COLOR = '#3a4a3d';

function Dashboard() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  const trendData = stats?.recentItems
    ? [...stats.recentItems].reverse().map((item) => ({ name: item.batch_id, value: item.quantity }))
    : [];

  return (
    <div className="dash-shell">
      <Topbar title="Dashboard" />

      <div className="dash-page">
        <div className="dash-banner">
          <h2>Welcome back, {firstName} </h2>
          <p>Here&apos;s today&apos;s overview</p>
        </div>

        {error && <p className="dash-error">{error}</p>}

        <div className="dash-cards">
          <div className="dash-card dash-card-row">
            <div className="dash-icon-circle"><Package size={17} color={ICON_COLOR} /></div>
            <div>
              <div className="dash-card-label">Total Inventory</div>
              <div className="dash-card-value">{stats ? stats.totalItems : '—'} <span>items</span></div>
              <div className="dash-trend dash-trend-neutral">● No change</div>
            </div>
          </div>

          <div className="dash-card dash-card-row">
            <div className="dash-icon-circle"><Recycle size={17} color={ICON_COLOR} /></div>
            <div>
              <div className="dash-card-label">Waste Collected</div>
              <div className="dash-card-value">{stats ? stats.totalQuantity.toFixed(1) : '—'} <span>kg</span></div>
              <div className="dash-trend dash-trend-neutral">● No change</div>
            </div>
          </div>

          <div className="dash-card dash-card-row">
            <div className="dash-icon-circle"><BrainCircuit size={17} color={ICON_COLOR} /></div>
            <div>
              <div className="dash-card-label">Predictions</div>
              <div className="dash-card-value dash-card-value-muted">No predictions yet</div>
            </div>
          </div>

          <div className="dash-card dash-card-row">
            <div className="dash-icon-circle"><Leaf size={17} color={ICON_COLOR} /></div>
            <div>
              <div className="dash-card-label">Recycling Rate</div>
              <div className="dash-card-value dash-card-value-muted">Not available yet</div>
            </div>
          </div>
        </div>

        <div className="dash-lower">
          <div className="dash-panel dash-panel-wide">
            <h3>Waste Collected Overview</h3>
            {trendData.length > 1 ? (
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={trendData}>
                  <CartesianGrid stroke="#eef3ec" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#2e7d32" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="dash-empty">
                <TrendingUp size={30} color="#c9d6c6" />
                <p>No data available</p>
                <span>Add a few more batches to see a trend here</span>
              </div>
            )}
          </div>

          <div className="dash-panel">
            <h3>Material Distribution</h3>
            {stats && stats.materialBreakdown.length > 0 ? (
              <div className="dash-chart-row">
                <ResponsiveContainer width={122} height={122}>
                  <PieChart>
                    <Pie data={stats.materialBreakdown} dataKey="count" nameKey="name" innerRadius={35} outerRadius={58}>
                      {stats.materialBreakdown.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="dash-legend">
                  {stats.materialBreakdown.map((entry, index) => (
                    <li key={entry.name}>
                      <span className="dash-dot" style={{ background: COLORS[index % COLORS.length] }} />
                      {entry.name} <span>{entry.percent}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="dash-empty">
                <FileBarChart size={28} color="#c9d6c6" />
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="dash-lower">
          <div className="dash-panel">
            <h3>Quick Actions</h3>
            <div className="dash-actions">
              <button onClick={() => navigate('/inventory')} className="dash-action-row">
                <div className="dash-action-icon"><Plus size={17} color={ICON_COLOR} /></div>
                <span>Add Inventory</span>
              </button>
              <button onClick={() => navigate('/predictions')} className="dash-action-row">
                <div className="dash-action-icon"><Upload size={17} color={ICON_COLOR} /></div>
                <span>Predict Fabric</span>
              </button>
              <button onClick={() => navigate('/reports')} className="dash-action-row">
                <div className="dash-action-icon"><FileBarChart size={17} color={ICON_COLOR} /></div>
                <span>Reports</span>
              </button>
              <button onClick={() => navigate('/inventory')} className="dash-action-row">
                <div className="dash-action-icon"><ClipboardList size={17} color={ICON_COLOR} /></div>
                <span>Inventory</span>
              </button>
            </div>
          </div>

          <div className="dash-panel dash-panel-wide">
            <h3>Recent Activity</h3>
            {stats && stats.recentItems && stats.recentItems.length > 0 ? (
              <table className="dash-table">
                <thead>
                  <tr><th>Activity</th><th>Details</th><th>Collected On</th></tr>
                </thead>
                <tbody>
                  {stats.recentItems.map((item) => (
                    <tr key={item.id}>
                      <td className="dash-activity-cell">
                        <CircleDot size={11} color="#2e7d32" /> Inventory Added
                      </td>
                      <td>{item.quantity} kg {item.fabric_type} ({item.batch_id})</td>
                      <td>{item.collection_date || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="dash-empty">
                <FileBarChart size={28} color="#c9d6c6" />
                <p>No recent activity</p>
                <span>Activities will appear here</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;