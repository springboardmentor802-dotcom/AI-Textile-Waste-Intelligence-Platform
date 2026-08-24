import { useRef, useState } from 'react';
import ChartTooltip from './chartTooltip/ChartTooltip';
import { getTooltipPositionFromEvent } from './chartTooltip/tooltipPosition';
import './WasteBarChart.css';

/* ---------------------------------------------------------
   Lightweight bar chart used for categorical distributions
   (e.g. waste category, fabric type). Pure SVG/CSS, no
   charting library dependency — separate from TrendChart,
   which stays untouched and is only for line/trend data.

   Expects: data = [{ label: string, value: number }]

   Hovering (desktop) or tapping (touch) a bar highlights it
   and shows a small tooltip directly above it.
---------------------------------------------------------- */
function WasteBarChart({ data, color = '#B79A25', unit = '', height = 180 }) {
  const containerRef = useRef(null);
  const [active, setActive] = useState(null); // { index, left, top }

  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value), 1);

  const activateFromTarget = (index, targetEl) => {
    const pos = getTooltipPositionFromEvent(
      containerRef.current,
      targetEl,
      { axis: 'vertical', tooltipWidth: 122, tooltipHeight: 44 }
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
    <div className="waste-bar-chart" style={{ height }} ref={containerRef}>
      <div className="waste-bar-chart-bars">
        {data.map((d, index) => {
          const pct = Math.max((d.value / max) * 100, 2);

          return (
            <div className="waste-bar-col" key={d.label}>

              <div className="waste-bar-track">
                <div
                  className={`waste-bar-fill${
                    active?.index === index ? ' waste-bar-fill-active' : ''
                  }`}
                  style={{ height: `${pct}%`, background: color }}
                  onMouseEnter={(e) => handleEnter(e, index)}
                  onMouseLeave={handleLeave}
                  onClick={(e) => handleTap(e, index)}
                >
                  <span className="waste-bar-badge" style={{ color }}>
                    {d.value}
                    {unit}
                  </span>
                </div>
              </div>
              <div className="waste-bar-label">{d.label}</div>
            </div>
          );
        })}
      </div>

      {active !== null && (
        <ChartTooltip
          left={active.left}
          top={active.top}
          color={color}
          title={data[active.index].label}
          value={`${data[active.index].value}${unit}`}
        />
      )}
    </div>
  );
}

export default WasteBarChart;