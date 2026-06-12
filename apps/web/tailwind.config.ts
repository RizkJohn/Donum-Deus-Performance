import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        bg1: "var(--bg1)",
        bg2: "var(--bg2)",
        bg3: "var(--bg3)",
        line: "var(--border)",
        line2: "var(--border2)",
        ink: "var(--text)",
        ink2: "var(--text2)",
        ink3: "var(--text3)",
        accent: "var(--accent)",
        accent2: "var(--accent-2)",
        accent3: "var(--accent-3)",
        warm: "var(--warm)",
        danger: "var(--red)",
        sage: "var(--sage)",
      },
      fontFamily: {
        play: ["var(--font-play)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
        bask: ["var(--font-bask)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
