/** @type {import('tailwindcss').Config} */
module.exports = {
    important: true, // Adds !important to all classes
    content: [
        "./apps/shell/src/**/*.{html,ts}",
        "./packages/ui-kit/angular/src/**/*.{html,ts}",
        "./packages/ui-kit/angular/src/assets/scss/**/*.scss",
        "./packages/theme/src/**/*.{html,ts}"
    ],
    theme: {
        screens: {
            xxl: { max: "1399px" },
            xl: { max: "1199px" },
            lg: { max: "991px" },
            md: { max: "767px" },
            sm: { max: "575px" },
        },
        extend: {},
    },
    plugins: [],
};
