import { useRef, useState } from 'react';
import ChartTooltip from './chartTooltip/ChartTooltip';
import { getTooltipPositionFromEvent } from './chartTooltip/tooltipPosition';
import './GroupedBarChart.css';

function GroupedBarChart({
  categories,
  series,
  unit = '',
  maxCategories = 6,
}) {
  const containerRef = useRef(null);
  const [active, setActive] = useState(null);

  if (
    !categories ||
    categories.length === 0 ||
    !series ||
    series.length === 0
  ) {
    return null;
  }

  const visibleCategories = categories.slice(0, maxCategories);

  // Maximum value controls the relative height of the bars.
  const max = Math.max(
    1,
    ...series.flatMap((s) =>
      s.values.slice(0, maxCategories)
    )
  );

  const isActive = (catIndex, seriesIndex) =>
    active &&
    active.catIndex === catIndex &&
    active.seriesIndex === seriesIndex;

  const activateFromTarget = (
    catIndex,
    seriesIndex,
    targetEl
  ) => {
    const pos = getTooltipPositionFromEvent(
      containerRef.current,
      targetEl,
      {
        axis: 'vertical',
        tooltipWidth: 122,
        tooltipHeight: 46,
      }
    );

    if (!pos) return;

    setActive({
      catIndex,
      seriesIndex,
      ...pos,
    });
  };

  const handleEnter = (
    e,
    catIndex,
    seriesIndex
  ) => {
    activateFromTarget(
      catIndex,
      seriesIndex,
      e.currentTarget
    );
  };

  const handleLeave = () => {
    setActive(null);
  };

  const handleTap = (
    e,
    catIndex,
    seriesIndex
  ) => {
    if (isActive(catIndex, seriesIndex)) {
      setActive(null);
      return;
    }

    activateFromTarget(
      catIndex,
      seriesIndex,
      e.currentTarget
    );
  };

  const activeSeries = active
    ? series[active.seriesIndex]
    : null;

  const activeValue = active
    ? activeSeries.values[active.catIndex] || 0
    : null;

  const activeCategory = active
    ? visibleCategories[active.catIndex]
    : null;

  return (
    <div
      className="gbar-chart"
      ref={containerRef}
    >
      {/* Legend */}
      <div className="gbar-legend">
        {series.map((s) => (
          <span
            className="gbar-legend-item"
            key={s.key}
          >
            <i
              style={{
                background: s.color,
              }}
            />
            {s.label}
          </span>
        ))}
      </div>

      {/* Chart */}
      <div className="gbar-body">
        <div className="gbar-plot">
          <div className="gbar-groups">
            {visibleCategories.map(
              (category, catIndex) => (
                <div
                  className="gbar-group"
                  key={category}
                >
                  <div className="gbar-bars">
                    {series.map(
                      (s, seriesIndex) => {
                        const value =
                          s.values[catIndex] || 0;

                        // Series with no value for this category aren't
                        // rendered at all (instead of an invisible
                        // 0-height column) so a category with only one
                        // or two non-zero series still centers its
                        // visible bar(s) directly under its label,
                        // rather than sitting off to one side of an
                        // empty reserved slot.
                        if (value <= 0) return null;

                        const pct =
                          max > 0
                            ? (value / max) * 100
                            : 0;

                        return (
                          <div
                            className="gbar-bar-col"
                            key={s.key}
                          >
                            <div className="gbar-bar-track">
                              <div
                                className={`gbar-bar-fill${
                                  isActive(
                                    catIndex,
                                    seriesIndex
                                  )
                                    ? ' gbar-bar-fill-active'
                                    : ''
                                }`}
                                style={{
                                  height: `${pct}%`,
                                  background: s.color,
                                }}
                                onMouseEnter={(e) =>
                                  handleEnter(
                                    e,
                                    catIndex,
                                    seriesIndex
                                  )
                                }
                                onMouseLeave={
                                  handleLeave
                                }
                                onClick={(e) =>
                                  handleTap(
                                    e,
                                    catIndex,
                                    seriesIndex
                                  )
                                }
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div
                    className="gbar-group-label"
                    title={category}
                  >
                    {category}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {active !== null && activeSeries && (
        <ChartTooltip
          left={active.left}
          top={active.top}
          color={activeSeries.color}
          title={activeSeries.label}
          value={`${activeValue}${unit}`}
          sublabel={activeCategory}
        />
      )}
    </div>
  );
}

export default GroupedBarChart;