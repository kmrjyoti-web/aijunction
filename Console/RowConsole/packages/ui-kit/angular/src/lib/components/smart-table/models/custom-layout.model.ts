export type LayoutTargetView = 'table-row' | 'card' | 'list-item';

export interface CustomLayout {
  id: string;
  name: string;
  targetView: LayoutTargetView;
  htmlTemplate: string;
}
