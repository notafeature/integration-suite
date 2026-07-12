/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAF8",
        panel: "#F1F1EF",
        "panel-deep": "#E7E7E4",
        ink: "#17181A",
        "ink-soft": "#62636A",
        line: "#E4E3DF",
        orient: "#6C7C93",
        "orient-deep": "#47566C",
        amber: "#C0894A",
        "amber-deep": "#9E6A2C",
        clay: "#A8482A",
        "clay-deep": "#7E351B",
        violet: "#857E97",
        "violet-deep": "#675F79",
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
