/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAF8",
        panel: "#F3F1EA",
        "panel-deep": "#EAE6DB",
        ink: "#211F1B",
        "ink-soft": "#6B6559",
        line: "#DBD7CC",
        orient: "#7C8AA0",
        "orient-deep": "#59667C",
        amber: "#C0894A",
        "amber-deep": "#9E6A2C",
        clay: "#A8542F",
        "clay-deep": "#853F20",
        violet: "#8A8398",
        "violet-deep": "#6A6379",
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { label: '0.18em' },
    },
  },
  plugins: [],
};
