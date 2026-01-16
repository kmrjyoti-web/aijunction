export type Density = 'comfortable' | 'cozy' | 'compact' | 'ultra-compact';

export interface DensitySetting {
  name: Density;
  rowHeight: number;
  cssClass: string;
}