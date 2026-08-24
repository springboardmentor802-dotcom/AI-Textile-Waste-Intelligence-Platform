import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BrainCircuit,
  Package,
  Users as UsersIcon,
  Gauge,
  Recycle,
  Leaf,
  Droplets,
  Zap,
  ArrowDown,
  Layers3,
  CheckCircle2,
  Inbox,
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
} from 'lucide-react';

import Topbar from '../components/Topbar';
import TrendChart from '../components/TrendChart';
import HorizontalBarChart from '../components/HorizontalBarChart';
import GroupedBarChart from '../components/GroupedBarChart';
import StackedBarChart from '../components/StackedBarChart';
import WasteBarChart from '../components/WasteBarChart';
import ChartTooltip from '../components/chartTooltip/ChartTooltip';
import { computeTooltipPosition } from '../components/chartTooltip/tooltipPosition';

import { PALETTE, paletteVars } from '../constants/palette';

import {
  getCurrentUser,
  getPlatformAnalytics,
  getPredictionDashboardStats,
  getPredictionHistory,
} from '../services/api';

import {
  countByDay,
  highRecyclabilityRateByDay,
  crosstab,
  materialRecoveryComparison,
  normalizeRecyclability,
  RECYCLABILITY_LEVELS,
  RECYCLABILITY_COLORS,
  sumEnvFieldByGroup,
} from '../utils/reportHelpers';

import '../pages/Dashboard.css';
import './Reports.css';


/* =========================================================
   ROLE LABELS
   ========================================================= */

const ROLE_LABELS = {
  administrator: 'Administrator',
  recycling_facility_operator:
    'Recycling Facility Operator',
  sustainability_manager:
    'Sustainability Manager',
  textile_manufacturer:
    'Textile Manufacturer',
};


/* =========================================================
   REPORT COLORS
   ========================================================= */

/* Exact chart palette per the Reports design spec. Kept local to this
   page so the shared PALETTE in constants/palette.js -- used by
   Dashboard, Inventory, Analytics, etc. -- is left untouched. */
const CHART_TEAL = '#3F858B';
const CHART_GOLDEN = '#C4A020';
const CHART_MAGENTA = '#C65A91';
const CHART_LAVENDER = '#8066B5';

const REPORT_COLORS = [
  CHART_TEAL,
  CHART_GOLDEN,
  CHART_MAGENTA,
  CHART_LAVENDER,
];

/* Single-hue shade families for the two Sustainability Manager
   trend donuts (Waste Diversion Trend / Recycling Rate by Period),
   strongest shade first so the dominant segment always reads as
   the boldest color in the family. */
const MAGENTA_DONUT_SHADES = ['#A6285E', '#C65A91', '#DB8FB6', '#F0C7DC', '#F8E3EE'];
const LAVENDER_DONUT_SHADES = ['#5B4593', '#8066B5', '#A896D1', '#D3C6EC', '#EAE3F6'];

/* Builds a colors array aligned to `data`'s own order, but with
   shades assigned by each item's value RANK (largest value gets
   shades[0], the boldest shade) rather than by array position. */
function rankShadeColors(data, shades) {
  const ranked = data
    .map((item, index) => ({ index, value: Number(item.value) || 0 }))
    .sort((a, b) => b.value - a.value);

  const colorByIndex = {};
  ranked.forEach((entry, rank) => {
    colorByIndex[entry.index] = shades[Math.min(rank, shades.length - 1)];
  });

  return data.map((_, index) => colorByIndex[index]);
}

const RECYCLABILITY_REPORT_COLORS = {
  High: CHART_TEAL,
  Medium: CHART_GOLDEN,
  Low: CHART_LAVENDER,
};

/* Single-hue shade families for the Administrator report's two
   compact donut charts, so each donut reads as ONE color family
   (per the approved report design) instead of the multi-color
   REPORT_COLORS cycle used elsewhere. Local to the Administrator
   report only -- other reports keep using REPORT_COLORS unchanged. */
const ADMIN_TEAL_SHADES = ['#2F6E73', '#3F858B', '#8FC4C8'];
const ADMIN_GOLDEN_SHADES = [
  '#B79A25',
  '#C4A020',
  '#DEC15A',
  '#EBDA9A',
];
const CHART_BLUE = '#2F5FBF';


/* =========================================================
   DONUT CHART
   ========================================================= */

function DonutChart({
  data,
  totalLabel = 'TOTAL',
  colors = REPORT_COLORS,
  centerValue,
  centerUnit = '',
  showSeparators = false,
}) {
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const [active, setActive] = useState(null); // { index, left, top }

  const total = data.reduce(
    (sum, item) =>
      sum + (Number(item.value) || 0),
    0
  );

  const radius = 52;
  const circumference =
    2 * Math.PI * radius;

  let offset = 0;

  if (!data.length || total <= 0) {
    return (
      <div className="rpt-donut-empty">
        <div className="rpt-donut-empty-ring">
          <strong>0</strong>
          <span>{totalLabel}</span>
        </div>

        <p>No distribution data yet.</p>
      </div>
    );
  }

  // Pre-compute each segment's arc geometry once so both the
  // rendered circles and the hover/tap handlers agree on where
  // each segment starts, ends, and sits along the ring.
  const segments = data.map((item, index) => {
    const value = Math.max(0, Number(item.value) || 0);
    const length = (value / total) * circumference;
    const startOffset = offset;
    offset += length;

    const midOffset = startOffset + length / 2;
    // Segments are drawn with `transform="rotate(-90 70 70)"`, so
    // the visual angle (in the un-rotated coordinate space) is
    // offset by -90 degrees from the raw dash-offset angle.
    const midAngleDeg = (midOffset / circumference) * 360 - 90;
    const midAngleRad = (midAngleDeg * Math.PI) / 180;

    return {
      item,
      index,
      value,
      length,
      startOffset,
      midX: 70 + radius * Math.cos(midAngleRad),
      midY: 70 + radius * Math.sin(midAngleRad),
    };
  });

  const activateSegment = (segment) => {
    const svgEl = svgRef.current;
    const wrapEl = wrapRef.current;
    if (!svgEl || !wrapEl) return;

    const svgRect = svgEl.getBoundingClientRect();
    const containerRect = wrapEl.getBoundingClientRect();

    // viewBox is a square 140x140, and the rendered box is square
    // too, so a single uniform scale factor converts viewBox units
    // to on-screen pixels.
    const scale = svgRect.width / 140;

    const pointX = svgRect.left + segment.midX * scale;
    const pointY = svgRect.top + segment.midY * scale;

    const anchorRect = {
      left: pointX,
      right: pointX,
      top: pointY,
      bottom: pointY,
      width: 0,
      height: 0,
    };

    const pos = computeTooltipPosition({
      containerRect,
      anchorRect,
      axis: 'vertical',
      tooltipWidth: 128,
      tooltipHeight: 56,
    });

    setActive({ index: segment.index, ...pos });
  };

  const handleLeave = () => setActive(null);

  const handleTap = (segment) => {
    if (active && active.index === segment.index) {
      setActive(null);
      return;
    }
    activateSegment(segment);
  };

  const activeSegment =
    active !== null ? segments[active.index] : null;
  const activeColor =
    activeSegment != null
      ? colors[activeSegment.index % colors.length]
      : null;
  const activePct =
    activeSegment != null && total
      ? Math.round((activeSegment.value / total) * 100)
      : null;

  return (
    <div className="rpt-donut-wrap" ref={wrapRef}>
      <div className="rpt-donut">
        <svg
          viewBox="0 0 140 140"
          aria-label={`${totalLabel} distribution`}
          ref={svgRef}
        >
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#eef2ef"
            strokeWidth="22"
          />

          {segments.map((segment) => {
            const { item, index, length, startOffset } = segment;
            const dash = `${length} ${
              circumference - length
            }`;

            const isActive = active?.index === index;

            return (
              <circle
                key={`${item.label}-${index}`}
                className="rpt-donut-segment"
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={
                  colors[
                    index %
                      colors.length
                  ]
                }
                strokeWidth={isActive ? 26 : 22}
                strokeDasharray={dash}
                strokeDashoffset={
                  -startOffset
                }
                transform="rotate(-90 70 70)"
                onMouseEnter={() => activateSegment(segment)}
                onMouseLeave={handleLeave}
                onClick={() => handleTap(segment)}
              />
            );
          })}

          {showSeparators &&
            segments.length > 1 &&
            segments.map((segment) => {
              // A thin white stroke centered on the boundary between
              // this segment and the next, layered on top of the
              // colored ring so adjacent segments read as visually
              // separated instead of touching directly.
              const boundaryOffset =
                segment.startOffset + segment.length;
              const sepLength = Math.min(
                3,
                segment.length
              );

              return (
                <circle
                  key={`sep-${segment.item.label}-${segment.index}`}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="22"
                  strokeDasharray={`${sepLength} ${
                    circumference - sepLength
                  }`}
                  strokeDashoffset={
                    -(boundaryOffset - sepLength / 2)
                  }
                  transform="rotate(-90 70 70)"
                  pointerEvents="none"
                />
              );
            })}
        </svg>

        <div className="rpt-donut-center">
          <strong>
            {centerValue !== undefined && centerValue !== null
              ? `${centerValue}${centerUnit}`
              : total}
          </strong>
          <span>{totalLabel}</span>
        </div>
      </div>

      {active !== null && activeSegment && (
        <ChartTooltip
          left={active.left}
          top={active.top}
          color={activeColor}
          title={activeSegment.item.label}
          value={`${activeSegment.value}${
            activePct !== null ? ` (${activePct}%)` : ''
          }`}
        />
      )}

      <div className="rpt-donut-legend">
        {data
          .slice(0, 6)
          .map((item, index) => {
            const pct = total
              ? Math.round(
                  (Number(
                    item.value || 0
                  ) /
                    total) *
                    100
                )
              : 0;

            return (
              <div
                className="rpt-donut-legend-row"
                key={`${item.label}-legend`}
              >
                <span
                  className="rpt-donut-dot"
                  style={{
                    background:
                      colors[
                        index %
                          colors.length
                      ],
                  }}
                />

                <span className="rpt-donut-name">
                  {item.label}: {pct}%
                </span>

              </div>
            );
          })}
      </div>
    </div>
  );
}


/* =========================================================
   PIE CHART
   ========================================================= */

function PieChart({
  data,
  totalLabel = 'TOTAL',
  colors = REPORT_COLORS,
}) {
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const [active, setActive] = useState(null); // { index, left, top }

  const total = data.reduce(
    (sum, item) => sum + (Number(item.value) || 0),
    0
  );

  const radius = 62;
  const cx = 70;
  const cy = 70;

  if (!data.length || total <= 0) {
    return (
      <div className="rpt-donut-empty">
        <div className="rpt-donut-empty-ring">
          <strong>0</strong>
          <span>{totalLabel}</span>
        </div>

        <p>No distribution data yet.</p>
      </div>
    );
  }

  const toXY = (angleDeg, r = radius) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  // Pre-compute each wedge's start/end angle (starting at 12 o'clock,
  // same convention as the ring-based DonutChart) so the rendered
  // paths and the hover/tap handlers agree on where each wedge sits.
  let cursor = -90;
  const segments = data.map((item, index) => {
    const value = Math.max(0, Number(item.value) || 0);
    const angle = (value / total) * 360;
    const startAngle = cursor;
    const endAngle = cursor + angle;
    cursor = endAngle;

    const midAngle = startAngle + angle / 2;
    const mid = toXY(midAngle, radius * 0.62);

    return {
      item,
      index,
      value,
      startAngle,
      endAngle,
      largeArc: angle > 180 ? 1 : 0,
      midX: mid.x,
      midY: mid.y,
    };
  });

  const activateSegment = (segment) => {
    const svgEl = svgRef.current;
    const wrapEl = wrapRef.current;
    if (!svgEl || !wrapEl) return;

    const svgRect = svgEl.getBoundingClientRect();
    const containerRect = wrapEl.getBoundingClientRect();
    const scale = svgRect.width / 140;

    const pointX = svgRect.left + segment.midX * scale;
    const pointY = svgRect.top + segment.midY * scale;

    const anchorRect = {
      left: pointX,
      right: pointX,
      top: pointY,
      bottom: pointY,
      width: 0,
      height: 0,
    };

    const pos = computeTooltipPosition({
      containerRect,
      anchorRect,
      axis: 'vertical',
      tooltipWidth: 128,
      tooltipHeight: 56,
    });

    setActive({ index: segment.index, ...pos });
  };

  const handleLeave = () => setActive(null);

  const handleTap = (segment) => {
    if (active && active.index === segment.index) {
      setActive(null);
      return;
    }
    activateSegment(segment);
  };

  const activeSegment =
    active !== null ? segments[active.index] : null;
  const activeColor =
    activeSegment != null
      ? colors[activeSegment.index % colors.length]
      : null;
  const activePct =
    activeSegment != null && total
      ? Math.round((activeSegment.value / total) * 100)
      : null;

  return (
    <div className="rpt-donut-wrap" ref={wrapRef}>
      <div className="rpt-donut">
        <svg
          viewBox="0 0 140 140"
          aria-label={`${totalLabel} distribution`}
          ref={svgRef}
        >
          {segments.map((segment) => {
            const { item, index, startAngle, endAngle, largeArc } = segment;
            const isActive = active?.index === index;
            const r = isActive ? radius + 3 : radius;
            const startPt = toXY(startAngle, r);
            const endPt = toXY(endAngle, r);

            const d = `M ${cx} ${cy} L ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${largeArc} 1 ${endPt.x} ${endPt.y} Z`;

            return (
              <path
                key={`${item.label}-${index}`}
                className="rpt-pie-segment"
                d={d}
                fill={colors[index % colors.length]}
                stroke="#ffffff"
                strokeWidth="2"
                onMouseEnter={() => activateSegment(segment)}
                onMouseLeave={handleLeave}
                onClick={() => handleTap(segment)}
              />
            );
          })}
        </svg>
      </div>

      {active !== null && activeSegment && (
        <ChartTooltip
          left={active.left}
          top={active.top}
          color={activeColor}
          title={activeSegment.item.label}
          value={`${activeSegment.value}${
            activePct !== null ? ` (${activePct}%)` : ''
          }`}
        />
      )}

      <div className="rpt-donut-legend">
        {data
          .slice(0, 6)
          .map((item, index) => {
            const pct = total
              ? Math.round(
                  (Number(item.value || 0) / total) * 100
                )
              : 0;

            return (
              <div
                className="rpt-donut-legend-row"
                key={`${item.label}-legend`}
              >
                <span
                  className="rpt-donut-dot"
                  style={{
                    background: colors[index % colors.length],
                  }}
                />

                <span className="rpt-donut-name">
                  {item.label}: {pct}%
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}


/* =========================================================
   KPI CARD
   ========================================================= */

function KpiCard({
  icon,
  label,
  value,
  unit,
  sublabel,
  color,
}) {
  return (
    <article
      className="rpt-kpi-card"
      style={paletteVars(color)}
    >
      <span className="rpt-kpi-icon">
        {icon}
      </span>

      <div className="rpt-kpi-body">
        <span className="rpt-kpi-label">
          {label}
        </span>

        <strong className="rpt-kpi-value">
          {value === null ||
          value === undefined
            ? '—'
            : value}

          {value !== null &&
          value !== undefined &&
          unit ? (
            <em>{unit}</em>
          ) : null}
        </strong>

        {sublabel && (
          <small className="rpt-kpi-sublabel">
            {sublabel}
          </small>
        )}
      </div>
    </article>
  );
}


/* =========================================================
   CHART PANEL
   ========================================================= */

function ChartPanel({
  title,
  subtitle,
  color = 'teal',
  full,
  children,
  empty,
  emptyText,
  /* Optional visible section number badge (e.g. 1, 2, 3...). Opt-in --
     omitted everywhere except the Administrator report, so other
     reports keep their existing unnumbered headings. */
  number,
  /* Optional extra class appended to the panel wrapper, for
     report-specific sizing tweaks without touching the shared rule. */
  className,
}) {
  return (
    <div
      className={`rpt-panel${
        full
          ? ' rpt-panel-full'
          : ''
      }${
        empty
          ? ' rpt-panel-empty'
          : ''
      }${
        className ? ` ${className}` : ''
      }`}
      style={paletteVars(color)}
    >
      <div className="rpt-panel-head">
        <h3>
          {number != null && (
            <span className="rpt-section-number">
              {number}
            </span>
          )}
          {title}
        </h3>

        {subtitle && (
          <p>{subtitle}</p>
        )}
      </div>

      {empty ? (
        <div className="rpt-panel-empty-state">
          <Inbox size={20} />

          <span>
            {emptyText ||
              'No data available for this analysis yet.'}
          </span>
        </div>
      ) : (
        <div className="rpt-panel-body">
          {children}
        </div>
      )}
    </div>
  );
}


/* =========================================================
   CHART ROW
   ========================================================= */

function ChartRow({
  label,
  children,
}) {
  return (
    <div className="rpt-row-group">
      {label && (
        <div className="rpt-row-label">
          {label}
        </div>
      )}

      <div className="rpt-row">
        {children}
      </div>
    </div>
  );
}


/* =========================================================
   INSIGHTS
   ========================================================= */

const INSIGHT_COLORS = [
  'teal',
  'magenta',
  'golden',
  'lavender',
];

function InsightsPanel({
  title,
  insights,
}) {
  const available =
    insights.filter(
      (i) =>
        i.value !== null &&
        i.value !== undefined
    );

  if (available.length === 0) {
    return (
      <div className="rpt-row-group">
        <div className="rpt-insights-label">
          {title}
        </div>

        <p className="rpt-insights-empty">
          Not enough data yet to calculate
          insights.
        </p>
      </div>
    );
  }

  return (
    <div className="rpt-row-group">
      <div className="rpt-insights-label">
        {title}
      </div>

      <ul className="rpt-insight-grid rpt-insight-list">
        {available.map(
          (insight, index) => (
            <li
              key={insight.label}
              className="rpt-insight-card"
              style={paletteVars(
                insight.color ||
                  INSIGHT_COLORS[
                    index %
                      INSIGHT_COLORS.length
                  ]
              )}
            >
              <span className="rpt-insight-icon">
                {insight.icon || (
                  <CheckCircle2
                    size={16}
                  />
                )}
              </span>

              <div>
                <span>
                  {insight.label}
                </span>

                <strong>
                  {insight.value}
                </strong>

                {insight.detail && (
                  <em>
                    {insight.detail}
                  </em>
                )}
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}


/* =========================================================
   ADMINISTRATOR REPORT
   ========================================================= */

function AdministratorReport({
  data,
}) {
  const reportDate =
    new Date().toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );

  const materialDistribution =
    (
      data.fabric_distribution ||
      []
    ).map((m) => ({
      label: m.fabric_type,
      value: m.count,
    }));

  const wasteCategoryData =
    (
      data.waste_category_distribution ||
      []
    ).map((w) => ({
      label: w.waste_category,
      value: w.count,
    }));

  const roleData =
    (data.users_by_role || []).map(
      (r) => ({
        label:
          ROLE_LABELS[r.role] ||
          r.role,
        value: r.count,
      })
    );

  const trend =
    (data.prediction_trend || []).map(
      (p) => ({
        label: p.day,
        value: p.count,
      })
    );

  const recyclabilityCounts =
    new Map(
      (
        data.recyclability_distribution ||
        []
      ).map((r) => [
        String(
          r.recyclability || ''
        ).toLowerCase(),
        r.count,
      ])
    );

  const recyclabilityData =
    RECYCLABILITY_LEVELS.map(
      (level) => ({
        label: level,
        value:
          recyclabilityCounts.get(
            level.toLowerCase()
          ) || 0,
      })
    );

  const totalRecyclabilityScored =
    recyclabilityData.reduce(
      (sum, d) => sum + d.value,
      0
    );

  const highRecyclabilityCount =
    recyclabilityData.find(
      (d) => d.label === 'High'
    )?.value || 0;

  const highRecyclabilityPct =
    totalRecyclabilityScored > 0
      ? Math.round(
          (highRecyclabilityCount /
            totalRecyclabilityScored) *
            100
        )
      : null;

  const scoreComparison = [
    {
      label:
        'Avg. Prediction Confidence',
      value:
        data.average_confidence,
    },
    {
      label:
        'Avg. Circularity Score',
      value:
        data.average_circularity_score,
    },
  ].filter(
    (d) =>
      d.value !== null &&
      d.value !== undefined
  );

  const busiestDay = trend.length
    ? trend.reduce(
        (max, p) =>
          p.value > max.value
            ? p
            : max,
        trend[0]
      )
    : null;

  const insights = [
    {
      label:
        'Most frequently predicted material',
      value:
        materialDistribution[0]
          ?.label || null,
      detail:
        materialDistribution[0]
          ?.value
          ? `${materialDistribution[0].value} predictions, platform-wide`
          : null,
      icon: (
        <Layers3 size={16} />
      ),
      color: 'teal',
    },

    {
      label:
        'Highest waste category',
      value:
        wasteCategoryData[0]
          ?.label || null,
      detail:
        wasteCategoryData[0]
          ?.value !== undefined
          ? `${wasteCategoryData[0].value} predictions in this category`
          : null,
      icon: (
        <Recycle size={16} />
      ),
      color: 'magenta',
    },

    {
      label:
        'Average prediction confidence',
      value:
        data.average_confidence !==
          null &&
        data.average_confidence !==
          undefined
          ? `${data.average_confidence}%`
          : null,
      detail:
        'Across all AI classifications',
      icon: (
        <Gauge size={16} />
      ),
      color: 'golden',
    },

    {
      label: 'Most active period',
      value: busiestDay
        ? busiestDay.label
        : null,
      detail: busiestDay
        ? `${busiestDay.value} predictions recorded`
        : null,
      icon: (
        <BrainCircuit size={16} />
      ),
      color: 'lavender',
    },

    {
      label:
        'High recyclability share',
      value:
        highRecyclabilityPct !== null
          ? `${highRecyclabilityPct}%`
          : null,
      detail:
        highRecyclabilityPct !== null
          ? `${highRecyclabilityCount} of ${totalRecyclabilityScored} scored predictions`
          : null,
      icon: (
        <Recycle size={16} />
      ),
      color: 'teal',
    },
  ];

  return (
    <>
      

      <div className="rpt-row-group">
        <div className="rpt-row-label">
          Platform Summary
        </div>

        <div className="rpt-kpi-grid">
          <KpiCard
            icon={
              <BrainCircuit size={18} />
            }
            label="Total Predictions"
            value={
              data.total_predictions
            }
            sublabel="AI classifications, all users"
            color="teal"
          />

          <KpiCard
            icon={
              <Package size={18} />
            }
            label="Total Inventory Items"
            value={
              data.total_inventory_items
            }
            sublabel="Textile batches tracked"
            color="golden"
          />

          <KpiCard
            icon={
              <UsersIcon size={18} />
            }
            label="Total Users"
            value={data.total_users}
            sublabel="Registered accounts"
            color="magenta"
          />

          <KpiCard
            icon={<Gauge size={18} />}
            label="Avg. Confidence"
            value={
              data.average_confidence
            }
            unit="%"
            sublabel="Across all predictions"
            color="lavender"
          />
        </div>
      </div>

      <div className="rpt-row-group">
        <ChartPanel
          
          title="Processing / Classification Trend"
          subtitle="AI predictions recorded per day, platform-wide"
          color="teal"
          full
          empty={trend.length === 0}
          emptyText="No prediction activity recorded yet."
        >
          <TrendChart
            data={trend}
            color={CHART_TEAL}
            unit=" predictions"
            xAxisTitle="Date"
            height={260}
          />
        </ChartPanel>
      </div>

      <div className="rpt-row-group">
        <ChartPanel
          
          title="Material Distribution"
          subtitle="Most predicted materials on the platform"
          color="lavender"
          full
          className="rpt-panel-vbar"
          empty={
            materialDistribution.length ===
            0
          }
          emptyText="No predictions yet."
        >
          <WasteBarChart
            data={materialDistribution}
            color={CHART_LAVENDER}
            height={240}
          />
        </ChartPanel>
      </div>

      <div className="rpt-row-group">
        <ChartPanel
          
          title="Waste Category Ranking"
          subtitle="Breakdown of waste types by total items"
          color="magenta"
          full
          empty={
            wasteCategoryData.length ===
            0
          }
          emptyText="No predictions yet."
        >
          <HorizontalBarChart
            data={wasteCategoryData}
            color={CHART_MAGENTA}
          />
        </ChartPanel>
      </div>

      <ChartRow label="Recyclability & Roles">
        <ChartPanel
          
          title="Recyclability Distribution"
          subtitle="Share of high, medium and low recyclability materials"
          color="teal"
          empty={
            totalRecyclabilityScored ===
            0
          }
          emptyText="No scored predictions yet."
        >
          <DonutChart
            data={recyclabilityData}
            totalLabel="TOTAL ITEMS"
            colors={ADMIN_TEAL_SHADES}
          />
        </ChartPanel>

        <ChartPanel
          
          title="User Role Distribution"
          subtitle="Platform users by role"
          color="golden"
          empty={
            roleData.length === 0
          }
          emptyText="No users yet."
        >
          <DonutChart
            data={roleData}
            totalLabel="TOTAL USERS"
            colors={ADMIN_GOLDEN_SHADES}
          />
        </ChartPanel>
      </ChartRow>

      <div className="rpt-row-group">
        <ChartPanel
          
          title="AI Prediction Confidence Comparison"
          subtitle="Confidence vs. circularity, platform average"
          color="teal"
          full
          empty={
            scoreComparison.length ===
            0
          }
          emptyText="Not enough scored predictions yet."
        >
          <HorizontalBarChart
            data={scoreComparison}
            color={CHART_BLUE}
            unit="%"
            sort={false}
            maxValue={100}
            showAxis
            thick
          />
        </ChartPanel>
      </div>

      <div className="rpt-row-group">
        <div className="rpt-keyinsights-title">
          <Sparkles size={15} />
          Key Insights
        </div>

        <InsightsPanel
          title="Key Insights"
          insights={insights}
        />
      </div>

      <div className="rpt-admin-footer">
        <span>
          Thank you for supporting a more sustainable textile future.
        </span>

        <span>
          Report generated by Textile Waste Intelligence Platform
        </span>
      </div>
    </>
  );
}


/* =========================================================
   RECYCLING FACILITY OPERATOR REPORT
   ========================================================= */

function OperatorReport({
  stats,
  history,
}) {
  const [activeRecovery, setActiveRecovery] = useState(null);
  const recoveryChartRef = useRef(null);
  const wasteCategoryData =
    (
      stats.waste_category_distribution ||
      []
    ).map((w) => ({
      label: w.waste_category,
      value: w.count,
    }));

  const materialData =
    (stats.fabric_distribution || []).map(
      (f) => ({
        label: f.material,
        value: f.count,
      })
    );

  const processingTrend =
    countByDay(history);

  const {
    categories:
      recatCategories,
    series: recatSeries,
  } = crosstab(
    history,
    'material',
    'recyclability',
    {
      seriesLevels:
        RECYCLABILITY_LEVELS,
      seriesColors:
        RECYCLABILITY_COLORS,
      normalizeSeriesValue:
        normalizeRecyclability,
      maxCategories: 6,
    }
  );

  const recoverableMaterials =
  history
    ? history.filter((h) => {
        const recyclability = String(
          h.recyclability || ''
        ).toLowerCase().trim();

        return (
          recyclability === 'high' ||
          recyclability === 'mechanical'
        );
      })
    : [];

  const recoveryByMaterial =
    (() => {
      const counts = new Map();

      recoverableMaterials.forEach(
        (h) => {
          if (!h.material) return;

          counts.set(
            h.material,
            (counts.get(
              h.material
            ) || 0) + 1
          );
        }
      );

      return Array.from(
        counts.entries()
      )
        .map(
          ([label, value]) => ({
            label,
            value,
          })
        )
        .sort(
          (a, b) =>
            b.value - a.value
        );
    })();

  const {
    categories:
      recoveryCompareCategories,
    series:
      recoveryCompareSeries,
  } =
    materialRecoveryComparison(
      history,
      6
    );

  const totalItems =
    stats.total_predictions || 0;

  const highCount =
    history.filter(
      (h) =>
        normalizeRecyclability(
          h.recyclability
        ) === 'High'
    ).length;

  const highPct =
    totalItems > 0
      ? Math.round(
          (highCount /
            totalItems) *
            100
        )
      : null;

  const insights = [
    {
      label:
        'Most processed material',
      value:
        materialData[0]?.label ||
        null,
      detail:
        materialData[0]
          ?.value !== undefined
          ? `${materialData[0].value} items processed`
          : null,
      icon: (
        <Layers3 size={16} />
      ),
      color: 'teal',
    },

    {
      label:
        'Most common waste category',
      value:
        wasteCategoryData[0]
          ?.label || null,
      detail:
        wasteCategoryData[0]
          ?.value !== undefined
          ? `${wasteCategoryData[0].value} items in this category`
          : null,
      icon: (
        <Recycle size={16} />
      ),
      color: 'magenta',
    },

    {
      label:
        'High recyclability performance',
      value:
        highPct !== null
          ? `${highPct}%`
          : null,
      detail:
        'Share of processed items',
      icon: (
        <Gauge size={16} />
      ),
      color: 'lavender',
    },

    {
      label:
        'Top recovery material',
      value:
        recoveryByMaterial[0]
          ?.label || null,
      detail:
        recoveryByMaterial[0]
          ?.value !== undefined
          ? `${recoveryByMaterial[0].value} high-recyclability items`
          : null,
      icon: (
        <ArrowDown size={16} />
      ),
      color: 'golden',
    },
  ];

  return (
    <>
      <div className="rpt-row-group">
        <div className="rpt-row-label">
          Batch Summary
        </div>

        <div className="rpt-kpi-grid">
          <KpiCard
            icon={
              <Package size={18} />
            }
            label="Total Items Processed"
            value={totalItems}
            sublabel="Predictions recorded"
            color="teal"
          />

          <KpiCard
            icon={
              <Recycle size={18} />
            }
            label="Recyclable Items"
            value={highCount}
            sublabel="High recyclability"
            color="golden"
          />

          <KpiCard
            icon={
              <Gauge size={18} />
            }
            label="High Recyclability %"
            value={highPct}
            unit="%"
            sublabel="Share of items processed"
            color="magenta"
          />

          <KpiCard
            icon={
              <BrainCircuit size={18} />
            }
            label="Avg. Confidence"
            value={
              stats.average_confidence
            }
            unit="%"
            sublabel="Model confidence"
            color="lavender"
          />
        </div>
      </div>

      <div className="rpt-row-group">
        <div className="rpt-row-label">
          Processing Trend
        </div>

        <ChartPanel
          title="Processing / Classification Trend"
          subtitle="Items processed per day"
          color="teal"
          full
          empty={
            processingTrend.length ===
            0
          }
          emptyText="No processing history yet."
        >
          <TrendChart
            data={processingTrend}
            color={
              CHART_TEAL
            }
            unit=" items"
            xAxisTitle="Date"
            height={240}
          />
        </ChartPanel>
      </div>

      <ChartRow label="Waste & Recyclability Breakdown">
        <ChartPanel
          title="Waste Category Breakdown"
          subtitle="Quantity per waste category"
          color="golden"
          empty={
            wasteCategoryData.length ===
            0
          }
          emptyText="No processing data yet."
        >
          <HorizontalBarChart
            data={
              wasteCategoryData
            }
            colors={REPORT_COLORS}
          />
        </ChartPanel>

        <ChartPanel
          title="Recyclability Distribution"
          subtitle="Share of high, medium, and low recyclability"
          color="teal"
          empty={
            history.length === 0
          }
          emptyText="No processing data yet."
        >
          <DonutChart
            data={RECYCLABILITY_LEVELS.map(
              (level) => ({
                label: level,
                value:
                  history.filter(
                    (h) =>
                      normalizeRecyclability(
                        h.recyclability
                      ) === level
                  ).length,
              })
            )}
            totalLabel="TOTAL ITEMS"
          />
        </ChartPanel>
      </ChartRow>

      <ChartRow label="Recovery & Comparison Analysis">
        <ChartPanel
  title="Material Recovery Analysis"
  subtitle="High-recyclability count by material"
  color="lavender"
  empty={recoveryByMaterial.length === 0}
  emptyText="No recoverable materials recorded yet."
>
  <div className="recovery-material-chart" ref={recoveryChartRef}>
    {recoveryByMaterial.slice(0, 6).map((item, index) => {
      const maxValue = Math.max(
        ...recoveryByMaterial.map((x) => x.value),
        1
      );

      const height = (item.value / maxValue) * 90;

      const colors = [
        CHART_TEAL,
        CHART_GOLDEN,
        CHART_MAGENTA,
        CHART_LAVENDER,
        CHART_BLUE,
        '#7A2E52',
      ];

      const barColor = colors[index % colors.length];

      const handleEnter = (e) => {
        if (!recoveryChartRef.current) return;
        const pos = computeTooltipPosition({
          containerRect: recoveryChartRef.current.getBoundingClientRect(),
          anchorRect: e.currentTarget.getBoundingClientRect(),
          axis: 'vertical',
          tooltipWidth: 130,
          tooltipHeight: 46,
        });
        setActiveRecovery({ index, ...pos });
      };

      const handleLeave = () => setActiveRecovery(null);

      const handleTap = (e) => {
        if (activeRecovery && activeRecovery.index === index) {
          setActiveRecovery(null);
          return;
        }
        handleEnter(e);
      };

      return (
        <div
          className="recovery-material-column"
          key={item.label}
        >
          <div className="recovery-material-track">
            <div
              className={`recovery-material-fill${
                activeRecovery?.index === index
                  ? ' recovery-material-fill-active'
                  : ''
              }`}
              style={{
                height: `${height}%`,
                background: barColor,
              }}
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
              onClick={handleTap}
            />
          </div>

          <div
            className="recovery-material-label"
            title={item.label}
          >
            {item.label}
          </div>
        </div>
      );
    })}

    {activeRecovery !== null && (
      <ChartTooltip
        left={activeRecovery.left}
        top={activeRecovery.top}
        color={
          [
            CHART_TEAL,
            CHART_GOLDEN,
            CHART_MAGENTA,
            CHART_LAVENDER,
            CHART_BLUE,
            '#7A2E52',
          ][activeRecovery.index % 6]
        }
        title={recoveryByMaterial[activeRecovery.index]?.label}
        value={recoveryByMaterial[activeRecovery.index]?.value}
      />
    )}
  </div>
</ChartPanel>

        <ChartPanel
          title="Processing vs. Recovery Comparison"
          subtitle="Total processed vs. high-recyclability, by material"
          color="teal"
          empty={
            recoveryCompareCategories.length ===
            0
          }
          emptyText="No processing data yet."
        >
          <GroupedBarChart
            categories={
              recoveryCompareCategories
            }
            series={recoveryCompareSeries.map(
              (series, index) => ({
                ...series,
                color:
                  index === 0
                    ? CHART_TEAL
                    : CHART_GOLDEN,
              })
            )}
          />
        </ChartPanel>
      </ChartRow>

      <InsightsPanel
        title="Key Insights"
        insights={insights}
      />
    </>
  );
}


/* =========================================================
   SUSTAINABILITY MANAGER REPORT
   ========================================================= */

function SustainabilityManagerReport({
  stats,
  history,
}) {
  const envSummary =
    stats.sustainability_environmental_summary ||
    {};

  const trendRows =
    stats.sustainability_trend ||
    [];

  const co2Trend =
    trendRows
      .filter(
        (p) =>
          p.co2_saved_kg !== null
      )
      .map((p) => ({
        label: p.day,
        value: p.co2_saved_kg,
      }));

  const diversionTrend =
    trendRows
      .filter(
        (p) =>
          p.landfill_diversion_kg !==
          null
      )
      .map((p) => ({
        label: p.day,
        value:
          p.landfill_diversion_kg,
      }));

  const recyclingRateTrend =
    highRecyclabilityRateByDay(
      history
    );

  const avgRecyclingRate =
    recyclingRateTrend.length > 0
      ? Math.round(
          recyclingRateTrend.reduce(
            (sum, p) => sum + (Number(p.value) || 0),
            0
          ) / recyclingRateTrend.length
        )
      : 0;

  const materialCo2 =
    sumEnvFieldByGroup(
      history,
      'material',
      'estimated_co2_saved_kg',
      6
    ).map((m) => ({
      label: m.key,
      value: m.value,
    }));

  const {
    categories:
      wasteCatCategories,
    series: wasteCatSeries,
  } = crosstab(
    history,
    'waste_category',
    'recyclability',
    {
      seriesLevels:
        RECYCLABILITY_LEVELS,
      seriesColors:
        RECYCLABILITY_COLORS,
      normalizeSeriesValue:
        normalizeRecyclability,
      maxCategories: 6,
    }
  );

  const totalPredictions =
    stats.total_predictions || 0;

  const highCount =
    history.filter(
      (h) =>
        normalizeRecyclability(
          h.recyclability
        ) === 'High'
    ).length;

  const recyclingRate =
    totalPredictions > 0
      ? Math.round(
          (highCount /
            totalPredictions) *
            100
        )
      : null;

  const trendDirection =
    (() => {
      if (co2Trend.length < 2)
        return null;

      const first =
        co2Trend[0].value;

      const last =
        co2Trend[
          co2Trend.length - 1
        ].value;

      if (last > first)
        return 'CO₂ savings trending upward';

      if (last < first)
        return 'CO₂ savings trending downward';

      return 'CO₂ savings holding steady';
    })();

  const insights = [
    {
      label:
        'Strongest sustainability metric',
      value:
        envSummary.total_co2_saved_kg !==
          null &&
        envSummary.total_co2_saved_kg !==
          undefined
          ? `${envSummary.total_co2_saved_kg} kg`
          : null,
      detail:
        'Total CO₂ emissions avoided',
      icon: <Leaf size={16} />,
      color: 'teal',
    },

    {
      label:
        'Highest-impact material',
      value:
        materialCo2[0]?.label ||
        null,
      detail:
        materialCo2[0]?.value !==
        undefined
          ? `${materialCo2[0].value} kg CO₂ saved`
          : null,
      icon: (
        <Layers3 size={16} />
      ),
      color: 'golden',
    },

    {
      label: 'Trend direction',
      value: trendDirection,
      icon:
        trendDirection?.includes(
          'upward'
        ) ? (
          <TrendingUp size={16} />
        ) : trendDirection?.includes(
            'downward'
          ) ? (
          <TrendingDown
            size={16}
          />
        ) : (
          <Gauge size={16} />
        ),
      color: 'magenta',
    },

    {
      label:
        'Waste diversion performance',
      value:
        envSummary.total_landfill_diversion_kg !==
          null &&
        envSummary.total_landfill_diversion_kg !==
          undefined
          ? `${envSummary.total_landfill_diversion_kg} kg`
          : null,
      detail:
        'Diverted from landfill',
      icon: (
        <ArrowDown size={16} />
      ),
      color: 'lavender',
    },
  ];

  return (
    <>
      <div className="rpt-row-group">
        <div className="rpt-row-label">
          Impact Summary
        </div>

        <div className="rpt-kpi-grid">
          <KpiCard
            icon={<Leaf size={18} />}
            label="CO₂ Saved"
            value={
              envSummary.total_co2_saved_kg
            }
            unit=" kg"
            sublabel="Total emissions avoided"
            color="teal"
          />

          <KpiCard
            icon={
              <Droplets size={18} />
            }
            label="Water Saved"
            value={
              envSummary.total_water_saved_liters
            }
            unit=" L"
            sublabel="Total water conserved"
            color="lavender"
          />

          <KpiCard
            icon={<Zap size={18} />}
            label="Energy Saved"
            value={
              envSummary.total_energy_saved_mj
            }
            unit=" MJ"
            sublabel="Total energy conserved"
            color="golden"
          />

          <KpiCard
            icon={
              <ArrowDown size={18} />
            }
            label="Landfill Diversion"
            value={
              envSummary.total_landfill_diversion_kg
            }
            unit=" kg"
            sublabel="Diverted from landfill"
            color="magenta"
          />
        </div>
      </div>

      <div className="rpt-row-group">
        <div className="rpt-row-label">
          Environmental Trend
        </div>

        <ChartPanel
          title="Environmental Impact Trend"
          subtitle="CO₂ saved over time"
          color="teal"
          full
          empty={
            co2Trend.length === 0
          }
          emptyText="No environmental data yet."
        >
          <TrendChart
            data={co2Trend}
            color={
              CHART_TEAL
            }
            unit=" kg"
            xAxisTitle="Date"
            height={240}
          />
        </ChartPanel>
      </div>

      <ChartRow label="Diversion & Recycling Trends">
        <ChartPanel
          title="Waste Diversion Trend"
          subtitle="Landfill diversion over time"
          color="magenta"
          empty={
            diversionTrend.length ===
            0
          }
          emptyText="No diversion data yet."
        >
          <DonutChart
            data={diversionTrend}
            colors={rankShadeColors(
              diversionTrend,
              MAGENTA_DONUT_SHADES
            )}
            totalLabel="TOTAL KG"
            centerValue={
              envSummary.total_landfill_diversion_kg !==
                null &&
              envSummary.total_landfill_diversion_kg !==
                undefined
                ? envSummary.total_landfill_diversion_kg
                : undefined
            }
            centerUnit=" kg"
          />
        </ChartPanel>

        <ChartPanel
          title="Recycling Rate by Period"
          subtitle="% high-recyclability predictions per day"
          color="teal"
          empty={
            recyclingRateTrend.length ===
            0
          }
          emptyText="No prediction history yet."
        >
          <DonutChart
            data={recyclingRateTrend}
            colors={rankShadeColors(
              recyclingRateTrend,
              LAVENDER_DONUT_SHADES
            )}
            totalLabel="AVG RATE"
            centerValue={avgRecyclingRate}
            centerUnit="%"
          />
        </ChartPanel>
      </ChartRow>

      <ChartRow label="Impact & Composition Analysis">
        <ChartPanel
          title="Environmental Impact by Material"
          subtitle="CO₂ saved per material"
          color="golden"
          empty={
            materialCo2.length === 0
          }
          emptyText="No material-level environmental data yet."
        >
          <HorizontalBarChart
            data={materialCo2}
            color={
              CHART_GOLDEN
            }
            unit=" kg"
          />
        </ChartPanel>

        <ChartPanel
          title="Waste Category Composition"
          subtitle="Recyclability mix per waste category"
          color="teal"
          empty={
            wasteCatCategories.length ===
            0
          }
          emptyText="No data yet."
        >
          <StackedBarChart
            categories={
              wasteCatCategories
            }
            series={wasteCatSeries.map(
              (series) => ({
                ...series,
                color:
                  RECYCLABILITY_REPORT_COLORS[
                    series.key
                  ] ||
                  REPORT_COLORS[
                    0
                  ],
              })
            )}
          />
        </ChartPanel>
      </ChartRow>

      <InsightsPanel
        title="Key Insights"
        insights={insights}
      />
    </>
  );
}


/* =========================================================
   TEXTILE MANUFACTURER REPORT
   ========================================================= */

function ManufacturerReport({
  stats,
  history,
}) {
  const materialTrend =
    countByDay(history);

  const materialData =
    (stats.fabric_distribution || []).map(
      (f) => ({
        label: f.material,
        value: f.count,
      })
    );

  const {
    categories:
      wasteByMatCategories,
    series: wasteByMatSeries,
  } = crosstab(
    history,
    'material',
    'waste_category',
    {
      maxCategories: 6,
    }
  );

  const {
    categories:
      recByMatCategories,
    series: recByMatSeries,
  } = crosstab(
    history,
    'material',
    'recyclability',
    {
      seriesLevels:
        RECYCLABILITY_LEVELS,
      seriesColors:
        RECYCLABILITY_COLORS,
      normalizeSeriesValue:
        normalizeRecyclability,
      maxCategories: 6,
    }
  );

  const recoveryTrend =
    (
      stats.sustainability_trend ||
      []
    )
      .filter(
        (p) =>
          p.circularity_score !==
          null
      )
      .map((p) => ({
        label: p.day,
        value:
          p.circularity_score,
      }));

  const avgCircularityScore =
    recoveryTrend.length > 0
      ? Math.round(
          recoveryTrend.reduce(
            (sum, p) => sum + (Number(p.value) || 0),
            0
          ) / recoveryTrend.length
        )
      : 0;

  const totalPredictions =
    stats.total_predictions || 0;

  const highCount =
    history.filter(
      (h) =>
        normalizeRecyclability(
          h.recyclability
        ) === 'High'
    ).length;

  const recoveryRate =
    totalPredictions > 0
      ? Math.round(
          (highCount /
            totalPredictions) *
            100
        )
      : null;

  const wasteByMaterialTotals =
    wasteByMatCategories
      .map((cat, i) => ({
        label: cat,
        value:
          wasteByMatSeries.reduce(
            (sum, s) =>
              sum +
              (s.values[i] || 0),
            0
          ),
      }))
      .sort(
        (a, b) =>
          b.value - a.value
      );

  const bestRecyclabilityMaterial =
    (() => {
      const highSeries =
        recByMatSeries.find(
          (s) =>
            s.key === 'High'
        );

      if (!highSeries)
        return null;

      let bestIdx = -1;
      let bestVal = -1;

      highSeries.values.forEach(
        (v, i) => {
          if (v > bestVal) {
            bestVal = v;
            bestIdx = i;
          }
        }
      );

      return bestIdx >= 0 &&
        bestVal > 0
        ? `${recByMatCategories[bestIdx]} (${bestVal} high-recyclability items)`
        : null;
    })();

  const wasteTrendDirection =
    materialTrend.length >= 2
      ? materialTrend[
          materialTrend.length - 1
        ].value >=
        materialTrend[0].value
        ? 'Increasing activity over the recorded period'
        : 'Decreasing activity over the recorded period'
      : null;

  const insights = [
    {
      label:
        'Material with highest waste',
      value:
        wasteByMaterialTotals[0]
          ?.label || null,
      detail:
        wasteByMaterialTotals[0]
          ?.value !== undefined
          ? `${wasteByMaterialTotals[0].value} items`
          : null,
      icon: (
        <Layers3 size={16} />
      ),
      color: 'golden',
    },

    {
      label:
        'Material with highest recyclability',
      value:
        bestRecyclabilityMaterial,
      icon: (
        <Recycle size={16} />
      ),
      color: 'teal',
    },

    {
      label: 'Waste trend',
      value:
        wasteTrendDirection,
      icon:
        wasteTrendDirection?.startsWith(
          'Increasing'
        ) ? (
          <TrendingUp size={16} />
        ) : (
          <TrendingDown
            size={16}
          />
        ),
      color: 'magenta',
    },

    {
      label:
        'Recovery opportunity',
      value:
        recoveryRate !== null
          ? `${recoveryRate}%`
          : null,
      detail:
        'Of analyzed materials are highly recyclable',
      icon: (
        <ArrowDown size={16} />
      ),
      color: 'lavender',
    },
  ];

  return (
    <>
      <div className="rpt-row-group">
        <div className="rpt-row-label">
          Material Summary
        </div>

        <div className="rpt-kpi-grid">
          <KpiCard
            icon={
              <BrainCircuit size={18} />
            }
            label="Materials Analyzed"
            value={totalPredictions}
            sublabel="AI classifications recorded"
            color="teal"
          />

          <KpiCard
            icon={
              <Layers3 size={18} />
            }
            label="Waste Identified"
            value={
              stats.waste_category_distribution?.reduce(
                (sum, w) =>
                  sum + w.count,
                0
              ) ?? null
            }
            sublabel="Across all waste categories"
            color="golden"
          />

          <KpiCard
            icon={
              <Recycle size={18} />
            }
            label="Recyclable Materials"
            value={highCount}
            sublabel="High recyclability"
            color="magenta"
          />

          <KpiCard
            icon={
              <ArrowDown size={18} />
            }
            label="Recovery Rate"
            value={recoveryRate}
            unit="%"
            sublabel="Share of recyclable materials"
            color="lavender"
          />
        </div>
      </div>

      <div className="rpt-row-group">
        <div className="rpt-row-label">
          Material Trend
        </div>

        <ChartPanel
          title="Material Analysis Trend"
          subtitle="Predictions per day"
          color="teal"
          full
          empty={
            materialTrend.length ===
            0
          }
          emptyText="No prediction history yet."
        >
          <TrendChart
            data={materialTrend}
            color={
              CHART_TEAL
            }
            unit=" predictions"
            xAxisTitle="Date"
            height={240}
          />
        </ChartPanel>
      </div>

      <ChartRow label="Material Usage Breakdown">
        <ChartPanel
          title="Material Type Comparison"
          subtitle="Predictions by fabric/material"
          color="golden"
          empty={
            materialData.length === 0
          }
          emptyText="No data yet."
        >
          <HorizontalBarChart
            data={materialData}
            color={
              CHART_TEAL
            }
          />
        </ChartPanel>

        <ChartPanel
          title="Waste Category by Material"
          subtitle="Composition of waste categories per material"
          color="magenta"
          empty={
            wasteByMatCategories.length ===
            0
          }
          emptyText="No data yet."
        >
          <StackedBarChart
            categories={
              wasteByMatCategories
            }
            series={wasteByMatSeries.map(
              (series, index) => ({
                ...series,
                color:
                  REPORT_COLORS[
                    index %
                      REPORT_COLORS.length
                  ],
              })
            )}
          />
        </ChartPanel>
      </ChartRow>

      <ChartRow label="Recyclability & Recovery Analysis">
        <ChartPanel
          title="Recyclability by Material"
          subtitle="High / Medium / Low by material"
          color="lavender"
          empty={
            recByMatCategories.length ===
            0
          }
          emptyText="No data yet."
        >
          <GroupedBarChart
            categories={
              recByMatCategories
            }
            series={recByMatSeries.map(
              (series) => ({
                ...series,
                color:
                  RECYCLABILITY_REPORT_COLORS[
                    series.key
                  ] ||
                  CHART_LAVENDER,
              })
            )}
          />
        </ChartPanel>

        <ChartPanel
          title="Recovery Performance"
          subtitle="Circularity score trend over time"
          color="teal"
          empty={
            recoveryTrend.length ===
            0
          }
          emptyText="No sustainability data yet."
        >
          <DonutChart
            data={recoveryTrend}
            colors={REPORT_COLORS}
            totalLabel="AVG SCORE"
            centerValue={avgCircularityScore}
            showSeparators
          />
        </ChartPanel>
      </ChartRow>

      <InsightsPanel
        title="Key Insights"
        insights={insights}
      />
    </>
  );
}


/* =========================================================
   PAGE
   ========================================================= */

function Reports() {
  const user = getCurrentUser();

  const role = user?.role;

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [payload, setPayload] =
    useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');

      try {
        if (
          role === 'administrator'
        ) {
          const data =
            await getPlatformAnalytics();

          if (active) {
            setPayload({
              kind:
                'administrator',
              data,
            });
          }
        } else {
          const [
            stats,
            history,
          ] = await Promise.all([
            getPredictionDashboardStats(),
            getPredictionHistory(),
          ]);

          if (active) {
            setPayload({
              kind: role,
              stats,
              history:
                history || [],
            });
          }
        }
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              'Failed to load report data.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [role]);

  const description =
    useMemo(() => {
      switch (role) {
        case 'administrator':
          return 'Platform-wide reporting across every user, prediction, and inventory record on the system.';

        case 'recycling_facility_operator':
          return 'Operational reporting on the materials you have processed and their recyclability performance.';

        case 'sustainability_manager':
          return 'Environmental impact and sustainability performance reporting, calculated from your prediction history.';

        case 'textile_manufacturer':
          return 'Production and material-usage reporting covering fabric waste, recyclability, and recovery.';

        default:
          return 'Analytics and reporting for your account.';
      }
    }, [role]);

  return (
    <div className="dash-shell">
      <Topbar  />

      <main className="dash-page rpt-page-shell">
        <section className="rpt-page">

          <div className="rpt-header-row">
            <div className="rpt-header">
              <h2>
                Reports 
              </h2>

              <p>
                {description}
              </p>
            </div>


          </div>

          {loading ? (
            <div className="rpt-state">
              Loading report…
            </div>
          ) : error ? (
            <div className="dash-errors">
              <span>
                {error}
              </span>
            </div>
          ) : !payload ? (
            null
          ) : payload.kind ===
            'administrator' ? (
            <AdministratorReport
              data={payload.data}
            />
          ) : payload.kind ===
            'recycling_facility_operator' ? (
            <OperatorReport
              stats={payload.stats}
              history={
                payload.history
              }
            />
          ) : payload.kind ===
            'sustainability_manager' ? (
            <SustainabilityManagerReport
              stats={payload.stats}
              history={
                payload.history
              }
            />
          ) : payload.kind ===
            'textile_manufacturer' ? (
            <ManufacturerReport
              stats={payload.stats}
              history={
                payload.history
              }
            />
          ) : (
            <div className="rpt-state">
              Reporting is not yet
              configured for this role.
            </div>
          )}

        </section>
      </main>
    </div>
  );
}

export default Reports;