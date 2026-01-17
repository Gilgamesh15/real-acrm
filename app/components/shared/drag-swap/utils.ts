export const getOverlapPercentage = (rect1: DOMRect, rect2: DOMRect) => {
  const overlapWidth = Math.max(
    0,
    Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left)
  );
  const overlapHeight = Math.max(
    0,
    Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top)
  );

  const overlapArea = overlapWidth * overlapHeight;
  const draggedArea = rect1.width * rect1.height;
  return overlapArea / draggedArea;
};
