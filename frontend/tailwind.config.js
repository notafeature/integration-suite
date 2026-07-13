/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--c-canvas) / <alpha-value>)",
        panel: "rgb(var(--c-panel) / <alpha-value>)",
        "panel-deep": "rgb(var(--c-panel-deep) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--c-ink-soft) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        orient: "rgb(var(--c-orient) / <alpha-value>)",
        "orient-deep": "rgb(var(--c-orient-deep) / <alpha-value>)",
        amber: "rgb(var(--c-amber) / <alpha-value>)",
        "amber-deep": "rgb(var(--c-amber-deep) / <alpha-value>)",
        clay: "rgb(var(--c-clay) / <alpha-value>)",
        "clay-deep": "rgb(var(--c-clay-deep) / <alpha-value>)",
        violet: "rgb(var(--c-violet) / <alpha-value>)",
        "violet-deep": "rgb(var(--c-violet-deep) / <alpha-value>)",
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { label: '0.16em' },
    },
  },
  plugins: [],
};
