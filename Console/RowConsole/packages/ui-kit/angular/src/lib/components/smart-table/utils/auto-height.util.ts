/**
 * Calculates the optimal page size based on the available vertical space of a container element.
 *
 * @param containerElement The HTML element that will contain the rows. This is typically the main scrolling area.
 * @param rowHeight The height of a single row in pixels.
 * @param additionalReservedSpace Optional extra space (e.g., for footers or margins) to subtract from the container's height.
 * @returns The number of rows that can fit within the calculated space.
 */
export function calculatePageSizeFromElement(
  containerElement: HTMLElement,
  rowHeight: number,
  additionalReservedSpace: number = 0
): number {
  if (!containerElement || rowHeight <= 0) {
    return 10; // Fallback to a default size
  }

  // The clientHeight is the visible height of the content area. We subtract any extra reserved space.
  const availableHeight = containerElement.clientHeight - additionalReservedSpace;
  const pageSize = Math.floor(availableHeight / rowHeight);

  // Ensure the page size is at least a minimum value (e.g., 1).
  return Math.max(1, pageSize);
}
