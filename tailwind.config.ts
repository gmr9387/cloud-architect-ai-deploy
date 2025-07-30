import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
          glow: "hsl(211, 85%, 55%)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Premium color additions
        glass: {
          100: "rgba(255, 255, 255, 0.05)",
          200: "rgba(255, 255, 255, 0.1)",
          300: "rgba(255, 255, 255, 0.15)",
          400: "rgba(255, 255, 255, 0.2)",
        },
        premium: {
          gradient: {
            from: "#667eea",
            to: "#764ba2",
          },
          purple: {
            50: "#faf5ff",
            100: "#f3e8ff",
            500: "#8b5cf6",
            600: "#7c3aed",
            700: "#6d28d9",
            900: "#4c1d95",
          },
          gold: {
            50: "#fefdf8",
            100: "#fef7cd",
            500: "#eab308",
            600: "#ca8a04",
            700: "#a16207",
          },
        },
        ai: {
          primary: "hsl(260, 100%, 70%)",
          secondary: "hsl(280, 100%, 80%)",
          accent: "hsl(300, 100%, 60%)",
          glow: "hsl(270, 100%, 75%)",
        },
        status: {
          success: "hsl(142, 76%, 36%)",
          warning: "hsl(38, 92%, 50%)",
          error: "hsl(0, 84%, 60%)",
          info: "hsl(199, 89%, 48%)",
        },
        surface: {
          0: "hsl(0, 0%, 100%)",
          50: "hsl(210, 40%, 98%)",
          100: "hsl(210, 40%, 96%)",
          200: "hsl(214, 32%, 91%)",
          300: "hsl(213, 27%, 84%)",
          900: "hsl(222, 84%, 5%)",
          950: "hsl(229, 84%, 2%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["Inter Variable", "ui-sans-serif", "system-ui"],
        display: ["Cal Sans", "Inter Variable", "ui-sans-serif"],
        mono: ["JetBrains Mono Variable", "ui-monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Premium animations
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(59, 130, 246, 0.8)" },
        },
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center"
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center"
          },
        },
        "gradient-y": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "center top"
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "center bottom"
          },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "fade-in-down": "fade-in-down 0.6s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.4s ease-out",
        "slide-in-left": "slide-in-left 0.4s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "gradient-x": "gradient-x 15s ease infinite",
        "gradient-y": "gradient-y 15s ease infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "bounce-soft": "bounce-soft 2s ease-in-out infinite",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'xl-soft': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    // Add custom plugin for premium effects
    function({ addUtilities }: any) {
      const newUtilities = {
        '.glass-morphism': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-morphism-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.gradient-premium': {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        '.gradient-gold': {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 25%, #4facfe 75%, #00f2fe 100%)',
        },
        '.text-gradient': {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-gold': {
          background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.border-gradient': {
          borderImage: 'linear-gradient(135deg, #667eea, #764ba2) 1',
        },
        '.hover-lift': {
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        '.hover-glow': {
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
          },
        },
      }
      addUtilities(newUtilities)
    },
  ],
} satisfies Config;

export default config;
