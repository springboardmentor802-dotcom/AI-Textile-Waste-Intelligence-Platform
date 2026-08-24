import './ChartTooltip.css';

/* ---------------------------------------------------------
   Small, compact, chart-anchored tooltip shared by every
   interactive chart. Always positioned via `left`/`top`
   (already clamped to stay inside the chart container) and
   colored with a thin border matching the hovered series.
---------------------------------------------------------- */
function ChartTooltip({ left, top, color = '#3F858B', title, value, sublabel }) {
  return (
    <div
      className="chart-tooltip"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        borderColor: color,
      }}
    >
      <span className="chart-tooltip-title">{title}</span>
      <span className="chart-tooltip-value" style={{ color }}>
        {value}
      </span>
      {sublabel && <span className="chart-tooltip-sublabel">{sublabel}</span>}
    </div>
  );
}

export default ChartTooltip;
