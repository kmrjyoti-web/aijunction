export interface LayoutConfig {
    settings: {
        sidebar_type: string;
        sidebar_setting: string;
        layout_type: 'ltr' | 'rtl' | 'box-layout';
        sidebar_backround: string;
        selected_layout: string;
    };
    color: {
        primary_color: string;
        secondary_color: string;
    };
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
    settings: {
        sidebar_type: 'compact-wrapper',
        sidebar_setting: 'default-sidebar',
        layout_type: 'ltr',
        sidebar_backround: 'dark-sidebar',
        selected_layout: 'marg',
    },
    color: {
        primary_color: '#7366ff',
        secondary_color: '#f73164',
    },
};
