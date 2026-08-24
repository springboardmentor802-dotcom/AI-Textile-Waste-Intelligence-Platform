import { useRef, useState } from 'react';
import ChartTooltip from './chartTooltip/ChartTooltip';
import { getTooltipPositionFromEvent } from './chartTooltip/tooltipPosition';
import './HorizontalBarChart.css';

/*
  Lightweight horizontal bar chart.

  Supports:
  - Single color using `color`
  - Multiple colors using `colors`
  - Sorting
  - Maximum number of items

  Hovering (desktop) or tapping (touch) a bar highlights it and
  shows a small tooltip anchored right next to that bar, flipping
  side automatically when the bar is near the chart edge.
*/

function HorizontalBarChart({
  data,
  color = '#63B0A5',
  colors = [],
  unit = '',
  maxItems = 8,
  sort = true,
  /* Optional fixed denominator (e.g. 100 for a 0-100% scale) instead
     of scaling bars relative to each other's max. Backward compatible:
     omitted everywhere else, so existing charts are unaffected. */
  maxValue = null,
  /* Optional 0..maxValue axis ticks rendered under the bars. */
  showAxis = false,
  /* Optional thicker bar track, opt-in via a boolean so existing
     charts keep their current track height. */
  thick = false,
}) {
  const containerRef = useRef(null);
  const [active, setActive] = useState(null); // { index, left, top }

  if (!data || data.length === 0) {
    return null;
  }

  const rows = sort
    ? [...data].sort((a, b) => b.value - a.value)
    : [...data];

  const visible = rows.slice(0, maxItems);

  const dynamicMax = Math.max(
    ...visible.map((d) => Number(d.value) || 0),
    1
  );

  const max = maxValue || dynamicMax;

  const activateFromTarget = (index, targetEl) => {
    const pos = getTooltipPositionFromEvent(
      containerRef.current,
      targetEl,
      { axis: 'horizontal', tooltipWidth: 128, tooltipHeight: 44 }
    );
    if (!pos) return;
    setActive({ index, ...pos });
  };

  const handleEnter = (e, index) => activateFromTarget(index, e.currentTarget);
  const handleLeave = () => setActive(null);

  const handleTap = (e, index) => {
    if (active && active.index === index) {
      setActive(null);
      return;
    }
    activateFromTarget(index, e.currentTarget);
  };

  return (
    <div
      className={`hbar-chart${
        thick ? ' hbar-chart-thick' : ''
      }`}
      ref={containerRef}
    >
      {visible.map((d, index) => {
        const value = Number(d.value) || 0;

        const pct = Math.max(
          (value / max) * 100,
          2
        );

        /*
          If multiple colors are provided,
          use a different color for each bar.

          Otherwise fall back to the normal
          single `color` prop.
        */
        const barColor =
          colors.length > 0
            ? colors[index % colors.length]
            : color;

        return (
          <div
            className="hbar-row"
            key={`${d.label}-${index}`}
          >
            <span
              className="hbar-label"
              title={d.label}
            >
              {d.label}
            </span>

            <div className="hbar-track">
              <div
                className={`hbar-fill${
                  active?.index === index ? ' hbar-fill-active' : ''
                }`}
                style={{
                  width: `${pct}%`,
                  backgroundColor: barColor,
                }}
                onMouseEnter={(e) => handleEnter(e, index)}
                onMouseLeave={handleLeave}
                onClick={(e) => handleTap(e, index)}
              />
            </div>

            
          </div>
        );
      })}

      {showAxis && (
        <div className="hbar-axis">
          <span className="hbar-axis-spacer" />
          <div className="hbar-axis-track">
            {[0, 25, 50, 75, 100].map((tick) => (
              <span
                className="hbar-axis-tick"
                key={tick}
              >
                {tick}%
              </span>
            ))}
          </div>
          <span className="hbar-axis-spacer" />
        </div>
      )}

      {active !== null && (
        <ChartTooltip
          left={active.left}
          top={active.top}
          color={
            colors.length > 0
              ? colors[active.index % colors.length]
              : color
          }
          title={visible[active.index].label}
          value={`${visible[active.index].value}${unit}`}
        />
      )}
    </div>
  );
}

export default HorizontalBarChart;
