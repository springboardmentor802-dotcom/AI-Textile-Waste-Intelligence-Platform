/* ---------------------------------------------------------
   Shared tooltip-positioning helper.

   Every interactive chart (trend, horizontal bar, grouped bar,
   stacked bar, waste/vertical bar, donut) needs the same thing:
   given the DOM rect of the hovered/touched element and the
   rect of its chart container, work out where a small compact
   tooltip should sit so it always stays close to that element
   and never gets clipped by the container edge.

   This keeps the "keep it near the element, flip when there's
   no room" logic in one place instead of six.
---------------------------------------------------------- */

const GAP = 8;
const EDGE_PADDING = 6;

/**
 * axis 'vertical'   -> tooltip prefers to sit ABOVE the anchor,
 *                      falls back to BELOW when there isn't room.
 *                      Used by: line points, vertical/grouped/
 *                      stacked bars, donut segments.
 * axis 'horizontal' -> tooltip prefers to sit to the RIGHT of the
 *                      anchor, falls back to the LEFT when there
 *                      isn't room. Used by: horizontal bars.
 */
export function computeTooltipPosition({
  containerRect,
  anchorRect,
  tooltipWidth = 130,
  tooltipHeight = 46,
  axis = 'vertical',
}) {
  // Anchor position expressed relative to the container's own
  // top-left corner, so the tooltip can be positioned with plain
  // absolute left/top inside a `position: relative` container.
  const anchor = {
    top: anchorRect.top - containerRect.top,
    bottom: anchorRect.bottom - containerRect.top,
    left: anchorRect.left - containerRect.left,
    right: anchorRect.right - containerRect.left,
    centerX: anchorRect.left - containerRect.left + anchorRect.width / 2,
    centerY: anchorRect.top - containerRect.top + anchorRect.height / 2,
  };

  const cWidth = containerRect.width;
  const cHeight = containerRect.height;

  let left;
  let top;
  let placement;

  if (axis === 'horizontal') {
    const fitsRight = anchor.right + GAP + tooltipWidth <= cWidth - EDGE_PADDING;
    const fitsLeft = anchor.left - GAP - tooltipWidth >= EDGE_PADDING;

    if (fitsRight || !fitsLeft) {
      left = anchor.right + GAP;
      placement = 'right';
    } else {
      left = anchor.left - GAP - tooltipWidth;
      placement = 'left';
    }

    top = anchor.centerY - tooltipHeight / 2;
  } else {
    const fitsAbove = anchor.top - GAP - tooltipHeight >= EDGE_PADDING;

    if (fitsAbove) {
      top = anchor.top - GAP - tooltipHeight;
      placement = 'top';
    } else {
      top = anchor.bottom + GAP;
      placement = 'bottom';
    }

    left = anchor.centerX - tooltipWidth / 2;
  }

  // Clamp so the box always stays inside the container.
  left = Math.min(
    Math.max(left, EDGE_PADDING),
    Math.max(cWidth - tooltipWidth - EDGE_PADDING, EDGE_PADDING)
  );

  top = Math.min(
    Math.max(top, EDGE_PADDING),
    Math.max(cHeight - tooltipHeight - EDGE_PADDING, EDGE_PADDING)
  );

  return { left, top, placement };
}

/**
 * Reads the live rects of the container and the hovered/touched
 * element and returns the clamped tooltip position in one call.
 */
export function getTooltipPositionFromEvent(
  containerEl,
  anchorEl,
  options = {}
) {
  if (!containerEl || !anchorEl) return null;

  const containerRect = containerEl.getBoundingClientRect();
  const anchorRect = anchorEl.getBoundingClientRect();

  return computeTooltipPosition({
    containerRect,
    anchorRect,
    ...options,
  });
}
