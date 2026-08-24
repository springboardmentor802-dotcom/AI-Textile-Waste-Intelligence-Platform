import { useRef, useState } from 'react';
import ChartTooltip from './chartTooltip/ChartTooltip';
import { getTooltipPositionFromEvent } from './chartTooltip/tooltipPosition';
import './StackedBarChart.css';

/* ---------------------------------------------------------
   Lightweight stacked bar chart — used to show composition
   across categories or time (e.g. waste category mix per
   material, or per time period). Pure SVG/CSS, no charting
   library dependency — consistent with the other chart
   components in this project.

   Expects:
     categories = [string, ...]                     (x-axis groups)
     series = [{ key, label, color, values: [] }]    (values aligned to categories)

   Hovering (desktop) or tapping (touch) a single segment
   highlights only that segment and shows a small tooltip
   right next to it.
---------------------------------------------------------- */
function StackedBarChart({ categories, series, unit = '', maxCategories = 8 }) {
  const containerRef = useRef(null);
  const [active, setActive] = useState(null); // { catIndex, seriesIndex, left, top }

  if (!categories || categories.length === 0 || !series || series.length === 0) {
    return null;
  }

  const visibleCategories = categories.slice(0, maxCategories);
  const totals = visibleCategories.map((_, i) =>
    series.reduce((sum, s) => sum + (s.values[i] || 0), 0)
  );
  const max = Math.max(1, ...totals);

  const isActive = (catIndex, seriesIndex) =>
    active && active.catIndex === catIndex && active.seriesIndex === seriesIndex;

  const activateFromTarget = (catIndex, seriesIndex, targetEl) => {
    const pos = getTooltipPositionFromEvent(
      containerRef.current,
      targetEl,
      { axis: 'vertical', tooltipWidth: 122, tooltipHeight: 46 }
    );
    if (!pos) return;
    setActive({ catIndex, seriesIndex, ...pos });
  };

  const handleEnter = (e, catIndex, seriesIndex) =>
    activateFromTarget(catIndex, seriesIndex, e.currentTarget);

  const handleLeave = () => setActive(null);

  const handleTap = (e, catIndex, seriesIndex) => {
    if (isActive(catIndex, seriesIndex)) {
      setActive(null);
      return;
    }
    activateFromTarget(catIndex, seriesIndex, e.currentTarget);
  };

  const activeSeries = active ? series[active.seriesIndex] : null;
  const activeValue = active ? activeSeries.values[active.catIndex] || 0 : null;
  const activeCategory = active ? visibleCategories[active.catIndex] : null;
  const activeTotal = active ? totals[active.catIndex] : null;
  const activePct =
    active && activeTotal > 0
      ? Math.round((activeValue / activeTotal) * 100)
      : null;

  return (
    <div className="sbar-chart" ref={containerRef}>
      <div className="sbar-legend">
        {series.map((s) => (
          <span className="sbar-legend-item" key={s.key}>
            <i style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <div className="sbar-groups">
        {visibleCategories.map((category, catIndex) => {
          const total = totals[catIndex];
          const totalPct = max > 0 ? Math.max((total / max) * 100, total > 0 ? 3 : 0) : 0;

          return (
            <div className="sbar-group" key={category}>
              <div className="sbar-track">
                <div className="sbar-stack" style={{ height: `${totalPct}%` }}>
                  {series.map((s, seriesIndex) => {
                    const value = s.values[catIndex] || 0;
                    const segmentPct = total > 0 ? (value / total) * 100 : 0;
                    if (segmentPct <= 0) return null;
                    return (
                      <div
                        key={s.key}
                        className={`sbar-segment${
                          isActive(catIndex, seriesIndex) ? ' sbar-segment-active' : ''
                        }`}
                        style={{ height: `${segmentPct}%`, background: s.color }}
                        onMouseEnter={(e) => handleEnter(e, catIndex, seriesIndex)}
                        onMouseLeave={handleLeave}
                        onClick={(e) => handleTap(e, catIndex, seriesIndex)}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="sbar-group-label" title={category}>
                {category}
              </div>
            </div>
          );
        })}
      </div>

      {active !== null && (
        <ChartTooltip
          left={active.left}
          top={active.top}
          color={activeSeries.color}
          title={activeSeries.label}
          value={`${activeValue}${unit}`}
          sublabel={
            activePct !== null ? `${activeCategory} · ${activePct}%` : activeCategory
          }
        />
      )}
    </div>
  );
}

export default StackedBarChart;
