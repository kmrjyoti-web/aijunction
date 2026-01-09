export type LayoutId = 'google' | 'outlook' | 'classic';

export interface Layout {
    id: LayoutId;
    name: string;
}
