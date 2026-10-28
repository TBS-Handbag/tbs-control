import type { Config } from "tailwindcss";

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
          DEFAULT: "hsl(var(--main))",
          soft: "hsl(var(--main-soft))",
          tint: "hsl(var(--main-tint))",
          muted: "hsl(var(--main-muted))",
        },
        onMainSub: "hsl(var(--on-main-sub))",
        surface: "hsl(var(--surface))",
        mainText: "hsl(var(--main-text))",
        subText: "hsl(var(--sub-text))",
        labelText: "hsl(var(--label-text))",
        iconMuted: "hsl(var(--icon-muted))",
        line: {
          DEFAULT: "hsl(var(--line))",
          soft: "hsl(var(--line-soft))",
          strong: "hsl(var(--line-strong))",
        },
        run: {
          DEFAULT: "hsl(var(--run))",
          bg: "hsl(var(--run-bg))",
          fg: "hsl(var(--run-fg))",
          light: "hsl(var(--run-light))",
        },
        stop: {
          DEFAULT: "hsl(var(--stop))",
          bg: "hsl(var(--stop-bg))",
          fg: "hsl(var(--stop-fg))",
          cell: "hsl(var(--stop-cell))",
          line: "hsl(var(--stop-line))",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
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
