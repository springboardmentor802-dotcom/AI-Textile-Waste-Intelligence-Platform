import { useEffect, useState } from 'react';
import {
  getCurrentUser,
  getInventoryList,
  getPredictionDashboardStats,
  getPlatformAnalytics,
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Recycle,
  BrainCircuit,
  Gauge,
  Leaf,
  Globe2,
  FileBarChart,
  ArrowRight,
  BarChart3,
  ImagePlus,
  Users as UsersIcon,
} from 'lucide-react';
import Topbar from '../components/Topbar';
import './Dashboard.css';

/* ---------------------------------------------------------
   Single color source of truth. Both the KPI cards and the
   "Continue Your Work" action cards read from this palette
   so the two sections always stay visually in sync.
---------------------------------------------------------- */
const PALETTE = {
  teal: {
    soft: '#E8F2F0',
    border: '#B9D6D0',
    icon: '#4A8C93',
    accent: '#63B0A5',
    text: '#1F4B4E',
    button: '#3E7A80',
  },
  magenta: {
    soft: '#F4E8EF',
    border: '#DDB8CA',
    icon: '#C874A2',
    accent: '#E287B8',
    text: '#7A2E52',
    button: '#B85F8F',
  },
  golden: {
    soft: '#FAF4D9',
    border: '#E7D67C',
    icon: '#B79A25',
    accent: '#EED45D',
    text: '#6B551A',
    button: '#B79A25',
  },
  lavender: {
    soft: '#EEEAF5',
    border: '#CFC4E3',
    icon: '#8D7EB4',
    accent: '#A696CD',
    text: '#4A3B6B',
    button: '#75649D',
  },
};

const paletteVars = (colorKey) => {
  const p = PALETTE[colorKey] || PALETTE.teal;
  return {
    '--p-soft': p.soft,
    '--p-border': p.border,
    '--p-icon': p.icon,
    '--p-accent': p.accent,
    '--p-text': p.text,
    '--p-button': p.button,
  };
};

/* ---------------------------------------------------------
   The "Four Principles" strip inside the hero is the same
   for every role -- it communicates the platform's purpose,
   not operational data.
---------------------------------------------------------- */
const HERO_PRINCIPLES = [
  {
    icon: Leaf,
    title: 'Every Fiber Matters',
    body: 'Recover textile waste, reduce pollution, and save natural resources.',
  },
  {
    icon: BrainCircuit,
    title: 'Smart Recovery',
    body: 'AI-powered insights maximize recovery and reduce landfill waste.',
  },
  {
    icon: Recycle,
    title: 'Sustainable Impact',
    body: 'Reusing textiles conserves energy and supports a greener planet.',
  },
  {
    icon: Globe2,
    title: 'Circular Future',
    body: 'Build a circular economy for a cleaner, healthier future.',
  },
];

/* ---------------------------------------------------------
   Role-specific hero copy. Every role except Textile
   Manufacturer keeps the original shared headline/subtext
   (unchanged, same defaults as before this change). The
   "Why it matters" strip below the hero (HERO_PRINCIPLES)
   stays shared across all roles as before -- only the
   headline/subtext differ per role.
---------------------------------------------------------- */
const HERO_COPY = {
  default: {
    heading: (
      <>
        Every fiber recovered
        <br />
        creates a <span>better future.</span>
      </>
    ),
    subtext:
      'Monitor, analyze and recover textile waste efficiently to build a sustainable and circular tomorrow.',
  },

  sustainability_manager: {
    heading: (
      <>
        Measure impact.
        <br />
        <span>Drive a more circular future.</span>
      </>
    ),
    subtext:
      'Monitor sustainability performance, environmental impact, and resource recovery to improve textile circularity.',
  },

  textile_manufacturer: {
    heading: (
      <>
        Turn production waste into
        <br />
        <span>material supply.</span>
      </>
    ),
    subtext:
      'Track offcuts, scrap, and production loss — and see how much comes back as recovered material for your next run.',
  },

  administrator: {
    heading: (
      <>
        Platform oversight.
        <br />
        <span>Smarter decisions. Better recovery.</span>
      </>
    ),
    subtext:
      'Monitor users, AI activity, and platform-wide sustainability performance from one place.',
  },
};

/* ---------------------------------------------------------
   Role-based dashboard configuration.

   IMPORTANT DATA NOTE:
   The backend currently only exposes two data sources —
   getInventoryList() and getPredictionDashboardStats() —
   which is what the original operator dashboard was built
   on. There are no separate endpoints yet for waste-diverted,
   carbon-reduction, production-waste, user counts, active
   facilities, etc.

   Rather than invent numbers for those, every role's KPIs are
   mapped onto the same four real metrics (inventory count,
   summed quantity, prediction count, average circularity
   score) with role-appropriate labels. Quick actions only
   point at routes that already exist in the app
   (/predictions, /inventory, /reports). See the summary
   for a full list of what would need new backend support.
---------------------------------------------------------- */
const DASHBOARD_CONFIG = {
  recycling_facility_operator: {
    kpis: [
      { key: 'inventory', label: 'Total Inventory', unit: '', sublabel: 'Total number of textile items', icon: Package, color: 'teal' },
      { key: 'waste', label: 'Waste Collected', unit: ' kg', sublabel: 'Total quantity of textile waste', icon: Recycle, color: 'magenta' },
      { key: 'predictions', label: 'AI Predictions', unit: '', sublabel: 'Total fabric classifications', icon: BrainCircuit, color: 'golden' },
      { key: 'recovery', label: 'Recovery Score', unit: '/100', sublabel: 'Average circularity score', icon: Gauge, color: 'lavender' },
    ],
    actions: [
      { title: 'Analyze New Material', desc: 'Upload a textile image and get AI-based material recognition and waste classification.', icon: ImagePlus, cta: 'Analyze Now', route: '/predictions', color: 'teal' },
      { title: 'Inventory Overview', desc: 'View, manage and update your recyclable materials and stock.', icon: Package, cta: 'Go to Inventory', route: '/inventory', color: 'lavender' },
      { title: 'Processing Insights', desc: 'Explore AI predictions, recovery trends and performance insights.', icon: BarChart3, cta: 'View Processing Insights', route: '/processing-insights', color: 'golden' },
      { title: 'Generate Reports', desc: 'Create, export and download sustainability reports and summaries.', icon: FileBarChart, cta: 'Generate Report', route: '/reports', color: 'magenta' },
    ],
  },

  sustainability_manager: {
    // NOTE: These four KPIs (carbon reduction, waste diversion %,
    // circularity score, resource recovery %) have no backing
    // endpoint yet, unlike the other roles which derive their
    // KPIs from live inventory/prediction data via `metrics`.
    // Using fixed `value`/`unit` here instead of a `key` lookup.
    // Swap in real data once a backend field exists -- see the
    // `kpi.value !== undefined` branch in the KPI render below.
    kpis: [
      { key: 'recovery', label: 'Circularity Score', unit: '/100', sublabel: 'Overall circularity performance', icon: Gauge, color: 'teal' },
      { key: 'waste', label: 'Waste Processed', unit: ' kg', sublabel: 'Total textile waste recorded', icon: Recycle, color: 'magenta' },
      { key: 'predictions', label: 'AI Analyses', unit: '', sublabel: 'Total textile classifications', icon: BrainCircuit, color: 'golden' },
      { key: 'inventory', label: 'Materials Tracked', unit: '', sublabel: 'Textile materials in the platform', icon: Package, color: 'lavender' },
    ],
    actions: [
      { title: 'Sustainability Overview', desc: 'Monitor sustainability performance and environmental metrics.', icon: BarChart3, cta: 'View Overview', route: '/sustainability-overview', color: 'teal' },
      { title: 'Carbon Reduction', desc: 'Track carbon savings and environmental impact.', icon: Leaf, cta: 'View Carbon Data', route: '/carbon-reduction', color: 'lavender' },
      { title: 'Waste Diversion', desc: 'Analyze waste diversion and landfill reduction.', icon: Recycle, cta: 'Analyze Diversion', route: '/waste-diversion', color: 'golden' },
      { title: 'ESG Reports', desc: 'Create and review sustainability and ESG reports.', icon: FileBarChart, cta: 'Generate Report', route: '/reports', color: 'magenta' },
    ],
  },

  textile_manufacturer: {
    // Amber/golden-led identity: golden leads for "raw production
    // input", lavender marks the recovery outcome KPI. Same
    // PALETTE keys as other roles -- differentiation is via
    // ordering/emphasis and copy, not new colors, per the
    // approved "keep existing green sidebar/topbar, don't
    // redesign the card system per role" direction.
    kpis: [
      { key: 'waste', label: 'Production Waste', unit: ' kg', sublabel: 'Total quantity of production waste logged', icon: Recycle, color: 'golden' },
      { key: 'inventory', label: 'Recovered Material', unit: '', sublabel: 'Items currently in the recovery pipeline', icon: Package, color: 'golden' },
      { key: 'predictions', label: 'AI Predictions', unit: '', sublabel: 'Waste batches classified by AI', icon: BrainCircuit, color: 'magenta' },
      { key: 'recovery', label: 'Material Recovery Score', unit: '/100', sublabel: 'Average circularity score', icon: Gauge, color: 'lavender' },
    ],
    
    actions: [
      { title: 'Log Production Waste', desc: 'Record new scrap or offcut from a production run so it enters the recovery pipeline.', icon: Package, cta: 'Go to Inventory', route: '/inventory', color: 'golden' },
      { title: 'Classify Waste Batch', desc: 'Upload a textile image and get AI-based material recognition and waste classification.', icon: ImagePlus, cta: 'Analyze Now', route: '/predictions', color: 'lavender' },
      { title: 'View Recovery Insights', desc: 'Review classification and circularity results to see what\u2019s recoverable.', icon: BarChart3, cta: 'Explore Insights', route: '/manufacturer/recovery-insights', color: 'magenta' },
      { title: 'Generate Sustainability Report', desc: 'Create, export and download sustainability reports and summaries.', icon: FileBarChart, cta: 'Generate Report', route: '/reports', color: 'teal' },
    ],
  },

  administrator: {
    // These four KPIs are rendered by the admin-specific branch of
    // "Today at a Glance" further down, which reads them from
    // `adminMetrics` (built from the real GET /admin/analytics
    // response) rather than from the generic per-user `metrics`
    // object every other role uses. Kept here anyway so the shape
    // stays consistent with the other role configs above.
    kpis: [
      { key: 'totalUsers', label: 'Total Users', unit: '', sublabel: 'Registered accounts across all roles', icon: UsersIcon, color: 'teal' },
      { key: 'totalInventory', label: 'Total Inventory', unit: '', sublabel: 'Items tracked platform-wide', icon: Package, color: 'magenta' },
      { key: 'aiPredictions', label: 'AI Predictions', unit: '', sublabel: 'Classifications across all users', icon: BrainCircuit, color: 'golden' },
      { key: 'avgCircularity', label: 'Avg. Circularity Score', unit: '/100', sublabel: 'Platform-wide average', icon: Gauge, color: 'lavender' },
    ],
    // "Platform Analytics" and "Review AI Activity" navigate to their
    // own dedicated Administrator-only pages (both reuse the existing
    // GET /admin/analytics data -- no new backend endpoint). See
    // pages/PlatformAnalytics.jsx and pages/AIActivity.jsx.
    actions: [
      { title: 'Manage Users', desc: 'View users, roles and account activity.', icon: UsersIcon, cta: 'Manage Users', route: '/users', color: 'teal' },
      { title: 'Platform Analytics', desc: 'Monitor platform-wide inventory, predictions and recovery performance.', icon: BarChart3, cta: 'View Analytics', color: 'magenta', route: '/platform-analytics' },
      { title: 'Review AI Activity', desc: 'Monitor classification activity and prediction performance across the platform.', icon: BrainCircuit, cta: 'Review Activity', color: 'golden', route: '/ai-activity' },
      { title: 'Generate Reports', desc: 'Create and export platform-wide sustainability and operational reports.', icon: FileBarChart, cta: 'Generate Reports', route: '/reports', color: 'lavender' },
    ],
  },
};

function Dashboard() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const [inventoryItems, setInventoryItems] = useState([]);
  const [predictionStats, setPredictionStats] = useState(null);
  const [inventoryError, setInventoryError] = useState('');
  const [predictionError, setPredictionError] = useState('');

  // Platform Analytics (Administrator only). Kept separate from the
  // per-role `metrics`/KPI state above -- this is the new platform-wide
  // data source, fetched only for the administrator role so non-admins
  // never even attempt a call that would 403.
  const [platformAnalytics, setPlatformAnalytics] = useState(null);
  const [platformAnalyticsLoading, setPlatformAnalyticsLoading] = useState(false);
  const [platformAnalyticsError, setPlatformAnalyticsError] = useState('');

  useEffect(() => {
    async function loadInventory() {
      try {
        const items = await getInventoryList();
        setInventoryItems(items);
      } catch (err) {
        setInventoryError(err.message);
      }
    }

    async function loadPredictionStats() {
      try {
        const data = await getPredictionDashboardStats();
        setPredictionStats(data);
      } catch (err) {
        setPredictionError(err.message);
      }
    }

    async function loadPlatformAnalytics() {
      setPlatformAnalyticsLoading(true);
      setPlatformAnalyticsError('');
      try {
        const data = await getPlatformAnalytics();
        setPlatformAnalytics(data);
      } catch (err) {
        setPlatformAnalyticsError(err.message || 'Failed to load platform analytics.');
      } finally {
        setPlatformAnalyticsLoading(false);
      }
    }

    loadInventory();
    loadPredictionStats();

    // Only administrators can call GET /admin/analytics (backend returns
    // 403 for everyone else) -- gate the call on the frontend too so
    // other roles don't see an avoidable error state.
    if (getCurrentUser()?.role === 'administrator') {
      loadPlatformAnalytics();
    }
  }, []);

  const totalInventory = inventoryItems.length;

  const wasteCollected = inventoryItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );

  const totalPredictions = predictionStats?.total_predictions ?? 0;

  const averageCircularity = predictionStats?.average_circularity_score ?? null;
  const recoveryScore = averageCircularity !== null ? Number(averageCircularity) : null;

  // The single set of real values every role's KPI cards draw from.
  const metrics = {
    inventory: totalInventory,
    waste: wasteCollected.toFixed(1),
    predictions: totalPredictions,
    recovery: recoveryScore !== null ? recoveryScore : '—',
  };

  const role = user?.role || 'recycling_facility_operator';
  const config = DASHBOARD_CONFIG[role] || DASHBOARD_CONFIG.recycling_facility_operator;
  const hero = HERO_COPY[role] || HERO_COPY.default;
  const isAdministrator = role === 'administrator';

  // Values for the Administrator's "Today at a Glance" KPI cards --
  // sourced entirely from platformAnalytics (GET /admin/analytics),
  // never from the per-user inventory/prediction `metrics` above.
  // '—' is used instead of 0 while the real value hasn't loaded yet,
  // consistent with how `recovery` already handles "no data" above.
  const adminMetrics = {
    totalUsers: platformAnalytics ? platformAnalytics.total_users : '—',
    totalInventory: platformAnalytics ? platformAnalytics.total_inventory_items : '—',
    aiPredictions: platformAnalytics ? platformAnalytics.total_predictions : '—',
    avgCircularity:
      platformAnalytics && platformAnalytics.average_circularity_score !== null
        ? platformAnalytics.average_circularity_score
        : '—',
  };


  return (
    <div className="dash-shell">
      <Topbar />

      <main className="dash-page">
        {!isAdministrator && (inventoryError || predictionError) && (
          <div className="dash-errors">
            {inventoryError && <span>{inventoryError}</span>}
            {predictionError && <span>{predictionError}</span>}
          </div>
        )}

        <section className={`dashboard-hero${isAdministrator ? ' dashboard-hero--compact' : ''}`}>
          <div className="hero-leaves" aria-hidden="true">
            <Leaf className="hero-leaf leaf-one" size={20} />
            <Leaf className="hero-leaf leaf-two" size={26} />
            <Leaf className="hero-leaf leaf-three" size={16} />
            <Leaf className="hero-leaf leaf-four" size={22} />
            <Leaf className="hero-leaf leaf-five" size={14} />
          </div>

          <div className="hero-copy">
            <h1>{hero.heading}</h1>

            <p>{hero.subtext}</p>
          </div>

          {/* Administrator is a management/oversight view -- it doesn't
              need the inspirational "Why it matters" strip that every
              other role's hero shows. */}
          {!isAdministrator && (
            <>
              <div className="hero-divider">
                <span></span>
                <strong>Why it matters</strong>
                <span></span>
              </div>

              <div className="hero-principles">
                {HERO_PRINCIPLES.map((item) => (
                  <article key={item.title}>
                    <span><item.icon size={28} /></span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Today at a Glance</h2>
              <p>
                {isAdministrator
                  ? 'Platform-wide totals across every user, all inventory, and all AI predictions.'
                  : 'Key metrics from your textile waste operations'}
              </p>
            </div>
          </div>

          {isAdministrator ? (
            platformAnalyticsLoading ? (
              <div className="admin-analytics-state">Loading platform metrics…</div>
            ) : platformAnalyticsError ? (
              <div className="dash-errors">
                <span>{platformAnalyticsError}</span>
              </div>
            ) : (
              <div className="kpi-grid">
                {config.kpis.map((kpi) => {
                  const displayValue = adminMetrics[kpi.key];
                  return (
                    <article key={kpi.key} className="kpi-card" style={paletteVars(kpi.color)}>
                      <div className="kpi-top">
                        <span className="kpi-icon"><kpi.icon size={22} /></span>
                        <span className="kpi-label">{kpi.label}</span>
                      </div>
                      <strong>
                        {displayValue}
                        {displayValue !== '—' && <em>{kpi.unit}</em>}
                      </strong>
                      <small>{kpi.sublabel}</small>
                    </article>
                  );
                })}
              </div>
            )
          ) : (
            <div className={`kpi-grid ${role === 'textile_manufacturer' ? 'mfr-kpi-grid' : ''}`}>
              {config.kpis.map((kpi) => {
                // Some roles (e.g. sustainability_manager) don't yet have
                // a live backend field for their KPIs, so they specify a
                // fixed `value` directly on the config entry instead of a
                // `key` into `metrics`. Everything else keeps using the
                // existing live-data lookup unchanged.
                const displayValue = kpi.value !== undefined ? kpi.value : metrics[kpi.key];

                return (
                  <article key={kpi.key} className="kpi-card" style={paletteVars(kpi.color)}>
                    <div className="kpi-top">
                      <span className="kpi-icon"><kpi.icon size={22} /></span>
                      <span className="kpi-label">{kpi.label}</span>
                    </div>
                    <strong>
                      {displayValue}
                      {displayValue !== '—' && <em>{kpi.unit}</em>}
                    </strong>
                    <small>{kpi.sublabel}</small>
                  </article>
                );
              })}
            </div>
          )}
        </section>


        <section className={`dashboard-section continue-section`}>
          <div className="section-heading">
            <div>
              <h2>{isAdministrator ? 'Admin Actions' : 'Continue Your Work'}</h2>
              <p>
                {isAdministrator
                  ? 'Jump to the tools you use to manage the platform.'
                  : 'Access the tools and tasks you use most.'}
              </p>
            </div>
          </div>

          <div className="work-grid">
            {config.actions.map((action) => (
              <button
                key={action.title}
                type="button"
                className="work-card"
                style={paletteVars(action.color)}
                onClick={() => {
                  if (action.scrollTo) {
                    document
                      .getElementById(action.scrollTo)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    navigate(action.route);
                  }
                }}
              >
                <span className="work-icon"><action.icon size={26} /></span>
                <span className="work-content">
                  <strong>{action.title}</strong>
                  <small>{action.desc}</small>
                  <span className="work-button">{action.cta} <ArrowRight size={17} /></span>
                </span>
                <action.icon className="work-watermark" size={92} />
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;