import { SizerConfig } from '../models/table-config.model';
import { Density } from '../models/density.model';

/**
 * Calculates the number of table rows that can fit on the screen.
 * @param sizerConfig The configuration for page sizing.
 * @param windowHeight The current height of the window in pixels.
 * @param currentDensity The current density setting of the table.
 * @returns The calculated number of rows to display.
 */
export function calculatePageSize(
  sizerConfig: SizerConfig,
  windowHeight: number,
  currentDensity: Density
): number {
  if (!sizerConfig || !sizerConfig.enabled) {
    return 10; // Fallback to a default size if not configured
  }

  // fix: Corrected property name from 'nonTableVerticalSpace' to 'additionalReservedSpace' to match the SizerConfig interface.
  const availableHeight = windowHeight - (sizerConfig.additionalReservedSpace ?? 0);
  
  const densitySetting = sizerConfig.densities.find(d => d.name === currentDensity);
  // Fallback to the 'cozy' (middle) setting if the current one isn't found
  const rowHeight = densitySetting ? densitySetting.rowHeight : sizerConfig.densities[1]?.rowHeight || 50;


  if (rowHeight <= 0) {
    return 10; // Avoid division by zero
  }

  const pageSize = Math.floor(availableHeight / rowHeight);

  // Ensure the page size is at least a minimum value
  return Math.max(1, pageSize);
}
