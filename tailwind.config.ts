import type { Config } from "tailwindcss";

// token là hex nên pha alpha bằng color-mix để class kiểu bg-main/10 vẫn chạy
const c = (v: string) =>
  `color-mix(in srgb, var(${v}) calc(<alpha-value> * 100%), transparent)`;

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-roboto)", "system-ui", "sans-serif"],
      },
      colors: {
        main: {
          DEFAULT: c("--main"),
          soft: c("--main-soft"),
          tint: c("--main-tint"),
          muted: c("--main-muted"),
        },
        onMainSub: c("--on-main-sub"),
        surface: c("--surface"),
        mainText: c("--main-text"),
        subText: c("--sub-text"),
        labelText: c("--label-text"),
        iconMuted: c("--icon-muted"),
        line: {
          DEFAULT: c("--line"),
          soft: c("--line-soft"),
          strong: c("--line-strong"),
        },
        run: {
          DEFAULT: c("--run"),
          bg: c("--run-bg"),
          fg: c("--run-fg"),
          light: c("--run-light"),
          cell: c("--run-cell"),
          line: c("--run-line"),
        },
        idle: {
          DEFAULT: c("--idle"),
          bg: c("--idle-bg"),
          fg: c("--idle-fg"),
          cell: c("--idle-cell"),
          line: c("--idle-line"),
          on: c("--idle-on"),
        },
        stop: {
          DEFAULT: c("--stop"),
          bg: c("--stop-bg"),
          fg: c("--stop-fg"),
          cell: c("--stop-cell"),
          line: c("--stop-line"),
          on: c("--stop-on"),
        },
        zone: {
          DEFAULT: c("--zone"),
          bg: c("--zone-bg"),
          on: c("--zone-on"),
        },
        background: c("--background"),
        foreground: c("--foreground"),
        card: {
          DEFAULT: c("--card"),
          foreground: c("--card-foreground"),
        },
        popover: {
          DEFAULT: c("--popover"),
          foreground: c("--popover-foreground"),
        },
        primary: {
          DEFAULT: c("--primary"),
          foreground: c("--primary-foreground"),
        },
        secondary: {
          DEFAULT: c("--secondary"),
          foreground: c("--secondary-foreground"),
        },
        muted: {
          DEFAULT: c("--muted"),
          foreground: c("--muted-foreground"),
        },
        accent: {
          DEFAULT: c("--accent"),
          foreground: c("--accent-foreground"),
        },
        destructive: {
          DEFAULT: c("--destructive"),
          foreground: c("--destructive-foreground"),
        },
        border: c("--border"),
        input: c("--input"),
        ring: c("--ring"),
        chart: {
          "1": c("--chart-1"),
          "2": c("--chart-2"),
          "3": c("--chart-3"),
          "4": c("--chart-4"),
          "5": c("--chart-5"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
