/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        astro: { DEFAULT: "#4D7FE8", glow: "#38BDF8", soft: "#E3ECFC", dark: "#1E3A8A" },
        bio: { DEFAULT: "#4DAF83", glow: "#10B981", soft: "#E1F3EA", dark: "#064E3B" },
        tamil: { DEFAULT: "#8D75C7", glow: "#C084FC", soft: "#EEE9F9", gold: "#D4A359", dark: "#4C1D95" },
        cross: { DEFAULT: "#3D9FA1", glow: "#22D3EE", soft: "#E0F2F2" },
        temporal: { DEFAULT: "#D99B42", glow: "#F59E0B", soft: "#FBEEDC" },
        ink: { DEFAULT: "#17324D", secondary: "#617589", muted: "#8899A8", faint: "#B9C6D2" },
        paper: { DEFAULT: "#EEF4F5", alt: "#F2F5F3", deep: "#EAF1F4" },
        hypothesis: "#C98B9E",
        interp: "#B4764A",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
        tamil: ["'Noto Sans Tamil'", "'Latha'", "'Nirmala UI'", "sans-serif"],
      },
      boxShadow: {
        glass: "0 18px 44px -14px rgba(23, 50, 77, 0.22), 0 2px 8px -2px rgba(23, 50, 77, 0.10), inset 0 1px 0 rgba(255,255,255,0.75)",
        "glass-sm": "0 8px 22px -8px rgba(23, 50, 77, 0.16), inset 0 1px 0 rgba(255,255,255,0.65)",
        "glow-astro": "0 0 24px rgba(77, 127, 232, 0.35)",
        "glow-bio": "0 0 24px rgba(77, 175, 131, 0.35)",
        "glow-tamil": "0 0 24px rgba(141, 117, 199, 0.35)",
        "glow-core": "0 0 36px rgba(61, 159, 161, 0.40)",
      },
      letterSpacing: {
        widest2: "0.22em",
      },
      transitionTimingFunction: {
        epistemic: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
