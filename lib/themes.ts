import type { CSSProperties } from "react";
import type { ThemeColor } from "@/types/database";

export type AppTheme = {
  value: ThemeColor;
  label: string;
  primary: string;
  primarySoft: string;
  primaryVerySoft: string;
  primaryDark: string;
  canvas: string;
  canvasTop: string;
  canvasBottom: string;
  surface: string;
  surfaceSoft: string;
  text: string;
  muted: string;
  line: string;
  shadowRgb: string;
  buttonBg: string;
  buttonText: string;
  navActiveBg: string;
  navActiveText: string;
  accentBorder: string;
  border: string;
  card: string;
};

export const themes: Record<ThemeColor, AppTheme> = {
  green: {
    value: "green",
    label: "绿色",
    primary: "#126b42",
    primarySoft: "#edf7f0",
    primaryVerySoft: "#f7faf5",
    primaryDark: "#0b5433",
    canvas: "#eef4ef",
    canvasTop: "#f8fbf9",
    canvasBottom: "#e7f0ea",
    surface: "#ffffff",
    surfaceSoft: "#f4f8f5",
    text: "#17221c",
    muted: "#627067",
    line: "#d8e3dc",
    shadowRgb: "31, 61, 43",
    buttonBg: "#126b42",
    buttonText: "#ffffff",
    navActiveBg: "#eef8f1",
    navActiveText: "#0b5433",
    accentBorder: "rgba(18, 107, 66, 0.24)",
    border: "rgba(18, 107, 66, 0.24)",
    card: "rgba(255, 255, 255, 0.96)"
  },
  blue: {
    value: "blue",
    label: "蓝色",
    primary: "#2563eb",
    primarySoft: "#eff6ff",
    primaryVerySoft: "#f8fbff",
    primaryDark: "#1d4ed8",
    canvas: "#eff2f6",
    canvasTop: "#fafbfd",
    canvasBottom: "#e6ebf2",
    surface: "#ffffff",
    surfaceSoft: "#f4f6fa",
    text: "#18202b",
    muted: "#626d7e",
    line: "#d9e0e9",
    shadowRgb: "29, 48, 74",
    buttonBg: "#2563eb",
    buttonText: "#ffffff",
    navActiveBg: "#eaf2ff",
    navActiveText: "#1d4ed8",
    accentBorder: "rgba(37, 99, 235, 0.24)",
    border: "rgba(37, 99, 235, 0.24)",
    card: "rgba(255, 255, 255, 0.96)"
  },
  purple: {
    value: "purple",
    label: "紫色",
    primary: "#7c3aed",
    primarySoft: "#f5f0ff",
    primaryVerySoft: "#fbf8ff",
    primaryDark: "#5b21b6",
    canvas: "#f2eff5",
    canvasTop: "#fcfafd",
    canvasBottom: "#eae5ef",
    surface: "#ffffff",
    surfaceSoft: "#f7f3f9",
    text: "#241d2a",
    muted: "#706576",
    line: "#e2dae7",
    shadowRgb: "57, 39, 69",
    buttonBg: "#7c3aed",
    buttonText: "#ffffff",
    navActiveBg: "#f0e9ff",
    navActiveText: "#5b21b6",
    accentBorder: "rgba(124, 58, 237, 0.24)",
    border: "rgba(124, 58, 237, 0.24)",
    card: "rgba(255, 255, 255, 0.96)"
  },
  pink: {
    value: "pink",
    label: "粉色",
    primary: "#a9275d",
    primarySoft: "#f7e8ee",
    primaryVerySoft: "#fff9fb",
    primaryDark: "#842048",
    canvas: "#f8f1f4",
    canvasTop: "#fff9fb",
    canvasBottom: "#f3e9ee",
    surface: "#ffffff",
    surfaceSoft: "#fbf3f6",
    text: "#241b20",
    muted: "#75676e",
    line: "#e8d9df",
    shadowRgb: "78, 42, 57",
    buttonBg: "#a9275d",
    buttonText: "#ffffff",
    navActiveBg: "#f5e4eb",
    navActiveText: "#842048",
    accentBorder: "rgba(169, 39, 93, 0.22)",
    border: "rgba(169, 39, 93, 0.2)",
    card: "rgba(255, 255, 255, 0.97)"
  },
  orange: {
    value: "orange",
    label: "橙色",
    primary: "#c84c08",
    primarySoft: "#fff7ed",
    primaryVerySoft: "#fffbf7",
    primaryDark: "#9a3c08",
    canvas: "#f7f1ed",
    canvasTop: "#fffbf8",
    canvasBottom: "#efe6e0",
    surface: "#ffffff",
    surfaceSoft: "#fbf5f1",
    text: "#281e19",
    muted: "#786b64",
    line: "#e8ddd6",
    shadowRgb: "76, 48, 33",
    buttonBg: "#c84c08",
    buttonText: "#ffffff",
    navActiveBg: "#ffedd5",
    navActiveText: "#9a3c08",
    accentBorder: "rgba(200, 76, 8, 0.24)",
    border: "rgba(200, 76, 8, 0.24)",
    card: "rgba(255, 255, 255, 0.96)"
  },
  black: {
    value: "black",
    label: "黑色",
    primary: "#111827",
    primarySoft: "#f3f4f6",
    primaryVerySoft: "#f9fafb",
    primaryDark: "#030712",
    canvas: "#f1f2f3",
    canvasTop: "#fbfbfc",
    canvasBottom: "#e7e9ec",
    surface: "#ffffff",
    surfaceSoft: "#f5f6f7",
    text: "#181a1f",
    muted: "#656a73",
    line: "#dddfe3",
    shadowRgb: "28, 30, 35",
    buttonBg: "#111827",
    buttonText: "#ffffff",
    navActiveBg: "#e5e7eb",
    navActiveText: "#111827",
    accentBorder: "rgba(17, 24, 39, 0.22)",
    border: "rgba(17, 24, 39, 0.22)",
    card: "rgba(255, 255, 255, 0.96)"
  }
};

export const themeOptions = Object.values(themes);
export const themeStorageKey = "fitness-checkin-theme-color";
export const themeCookieName = "fitness_checkin_theme_color";

export function isThemeColor(value: unknown): value is ThemeColor {
  return typeof value === "string" && value in themes;
}

export function getThemeByColor(themeColor: string | null | undefined) {
  return isThemeColor(themeColor) ? themes[themeColor] : themes.green;
}

export function getThemeCssVariables(themeColor: string | null | undefined) {
  return getThemeCssVariableRecord(themeColor) as CSSProperties;
}

export function getThemeCssVariableRecord(themeColor: string | null | undefined) {
  const theme = getThemeByColor(themeColor);

  return {
    "--bg": theme.canvas,
    "--app-bg-top": theme.canvasTop,
    "--app-bg-bottom": theme.canvasBottom,
    "--surface": theme.surface,
    "--surface-soft": theme.surfaceSoft,
    "--text": theme.text,
    "--muted": theme.muted,
    "--line": theme.line,
    "--theme-shadow-rgb": theme.shadowRgb,
    "--color-primary": theme.primary,
    "--color-primary-soft": theme.primarySoft,
    "--color-primary-very-soft": theme.primaryVerySoft,
    "--color-primary-dark": theme.primaryDark,
    "--color-button-bg": theme.buttonBg,
    "--color-button-text": theme.buttonText,
    "--color-nav-active-bg": theme.navActiveBg,
    "--color-nav-active-text": theme.navActiveText,
    "--color-accent-border": theme.accentBorder,
    "--color-border": theme.border,
    "--color-card": theme.card
  };
}
