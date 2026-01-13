export type LayoutId =
    | 'google'
    | 'outlook'
    | 'classic'
    | 'modern'
    | 'dubai'
    | 'los-angeles'
    | 'paris'
    | 'tokyo'
    | 'moscow'
    | 'singapore'
    | 'newyork'
    | 'barcelona'
    | 'madrid'
    | 'rome'
    | 'seoul'
    | 'london';

export interface Layout {
    id: LayoutId;
    name: string;
}

export interface AppConfig {
    settings: {
        layout_type: string;
        layout_version: string;
        sidebar_type: string;
        icon: string;
        layout: string;
    };
    color: {
        primary: string;
        secondary: string;
    };
}
