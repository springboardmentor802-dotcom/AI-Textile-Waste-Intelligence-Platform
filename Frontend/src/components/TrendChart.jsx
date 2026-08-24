import { useRef, useState } from 'react';
import ChartTooltip from './chartTooltip/ChartTooltip';
import { getTooltipPositionFromEvent } from './chartTooltip/tooltipPosition';
import './TrendChart.css';

/* ---------------------------------------------------------
   Lightweight line-chart used across the sustainability
   pages. Pure SVG, no charting library dependency.

   Hovering (desktop) or tapping (touch) a data point shows a
   small tooltip anchored right next to that point, and tapping
   the same point again closes it.
---------------------------------------------------------- */
function TrendChart({
  data,
  color = '#63B0A5',
  lineColor,
  dotColor,
  unit = '',
  height = 180,
  xAxisTitle = '',
}) {
  const containerRef = useRef(null);
  const [active, setActive] = useState(null); // { index, left, top }

  if (!data || data.length === 0) return null;

  // The line/outline can be tinted independently from the fill via
  // `lineColor`, and the dots independently again via `dotColor`.
  // Dots default to matching the line (not the fill) since that's
  // the more common chart convention; pass `dotColor` explicitly
  // to override. When neither is passed, everything falls back to
  // the single `color` prop as before, so existing callers are
  // unaffected.
  const strokeColor = lineColor || color;
  const pointColor = dotColor || strokeColor;

  const width = 600;
  const paddingX = 24;
  const paddingY = 24;

  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const stepX =
    (width - paddingX * 2) / (data.length - 1 || 1);

  const points = data.map((d, i) => {
    const x = paddingX + i * stepX;

    const y =
      paddingY +
      (height - paddingY * 2) *
        (1 - (d.value - min) / range);

    return {
      x,
      y,
      ...d,
    };
  });

  const linePath = points
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    )
    .join(' ');

  const areaPath = `${linePath}
    L ${points[points.length - 1].x.toFixed(1)} ${height - paddingY}
    L ${points[0].x.toFixed(1)} ${height - paddingY}
    Z`;

  const activateFromTarget = (index, targetEl) => {
    const pos = getTooltipPositionFromEvent(
      containerRef.current,
      targetEl,
      { axis: 'vertical', tooltipWidth: 116, tooltipHeight: 44 }
    );
    if (!pos) return;
    setActive({ index, ...pos });
  };

  const handleEnter = (e, index) => {
    activateFromTarget(index, e.currentTarget);
  };

  const handleLeave = () => setActive(null);

  const handleTap = (e, index) => {
    if (active && active.index === index) {
      setActive(null);
      return;
    }
    activateFromTarget(index, e.currentTarget);
  };

  return (
    <div className="trend-chart" ref={containerRef}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="trend-chart-svg"
      >
        <path
          d={areaPath}
          fill={color}
          opacity="0.12"
          stroke="none"
        />

        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={active !== null ? 3 : 2.5}
          className="trend-chart-line"
        />

        {points.map((p, index) => (
          <circle
            key={`${p.label}-${index}`}
            cx={p.x}
            cy={p.y}
            r={active?.index === index ? 6.5 : 4}
            fill={pointColor}
            className="trend-chart-point"
            onMouseEnter={(e) => handleEnter(e, index)}
            onMouseLeave={handleLeave}
            onClick={(e) => handleTap(e, index)}
          />
        ))}
      </svg>

      <div className="trend-chart-labels">
        {points.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>

      {xAxisTitle && (
        <div className="trend-chart-axis-title">
          {xAxisTitle}
        </div>
      )}

      {active !== null && (
        <ChartTooltip
          left={active.left}
          top={active.top}
          color={color}
          title={points[active.index].label}
          value={`${points[active.index].value}${unit}`}
        />
      )}
    </div>
  );
}

export default TrendChart;