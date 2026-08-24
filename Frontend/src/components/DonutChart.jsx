import './DonutChart.css';

function DonutChart({ data, centerValue, centerLabel = 'Total', size = 190 }) {
  const valid = (data || []).filter((item) => Number(item.value) > 0);
  const total = valid.reduce((sum, item) => sum + Number(item.value), 0);

  if (!valid.length || total <= 0) return null;

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="donut-chart" style={{ '--donut-size': `${size}px` }}>
      <div className="donut-visual">
        <svg viewBox="0 0 160 160" aria-label="Distribution chart">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#eef2ef" strokeWidth="22" />
          {valid.map((item) => {
            const portion = Number(item.value) / total;
            const dash = portion * circumference;
            const currentOffset = offset;
            offset += dash;
            return (
              <circle
                key={item.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={item.color || '#3E7A80'}
                strokeWidth="22"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-currentOffset}
                transform="rotate(-90 80 80)"
              />
            );
          })}
        </svg>
        
      </div>

      <div className="donut-legend">
        {valid.map((item) => (
          <div className="donut-legend-row" key={item.label}>
            <span className="donut-dot" style={{ background: item.color || '#3E7A80' }} />
            <span className="donut-name" title={item.label}>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{Math.round((Number(item.value) / total) * 100)}%</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DonutChart;
