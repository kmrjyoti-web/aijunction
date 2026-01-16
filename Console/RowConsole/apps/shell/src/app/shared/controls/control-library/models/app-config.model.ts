
export const GLOBAL_APP_CONFIG = {
    transliteration: {
        defaultLanguage: 'hi',
        languages: [
            { code: 'hi', label: 'Hindi' },
            { code: 'bn', label: 'Bengali' },
            { code: 'gu', label: 'Gujarati' },
            { code: 'mr', label: 'Marathi' },
            { code: 'ta', label: 'Tamil' },
            { code: 'te', label: 'Telugu' },
            { code: 'ml', label: 'Malayalam' },
            { code: 'kn', label: 'Kannada' },
            { code: 'pa', label: 'Punjabi' },
            { code: 'ur', label: 'Urdu' }
        ]
    },
    apiEndpoints: {
        base: '', // Will be populated from environment
        ai: ''
    }
};
