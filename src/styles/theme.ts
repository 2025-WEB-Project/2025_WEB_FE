export const theme = {
  colors: {
    bg: "#ffffff",
    text: "#111",
    subtext: "#666",
    primary: "#93b3a0",
    border: "#e6e8eb",
    panel: "#f7f8f9",
    black: "#111",
    danger: "#e5484d"    
  },
  radius: "14px",
  gap: "16px",
  shadow: "0 6px 20px rgba(0,0,0,0.06)"
} as const;

export type AppTheme = typeof theme;
