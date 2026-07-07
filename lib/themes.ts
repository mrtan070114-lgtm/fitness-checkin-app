import type { CSSProperties } from "react";
import type { ThemeColor } from "@/types/database";

export type AppTheme = {
  value: ThemeColor;
  label: string;
  primary: string;
  primarySoft: string;
  primaryDark: string;
  buttonBg: string;
  buttonText: string;
  navActiveBg: string;
  navActiveText: string;
  accentBorder: string;
};

export const themes: Record<ThemeColor, AppTheme> = {
  green: {
    value: "green",
    label: "绿色",
    primary: "#126b42",
    primarySoft: "#edf7f0",
    primaryDark: "#0b5433",
    buttonBg: "#126b42",
    buttonText: "#ffffff",
    navActiveBg: "#eef8f1",
    navActiveText: "#0b5433",
    accentBorder: "rgba(18, 107, 66, 0.24)"
  },
  blue: {
    value: "blue",
    label: "蓝色",
    primary: "#2563eb",
    primarySoft: "#eff6ff",
    primaryDark: "#1d4ed8",
    buttonBg: "#2563eb",
    buttonText: "#ffffff",
    navActiveBg: "#eaf2ff",
    navActiveText: "#1d4ed8",
    accentBorder: "rgba(37, 99, 235, 0.24)"
  },
  purple: {
    value: "purple",
    label: "紫色",
    primary: "#7c3aed",
    primarySoft: "#f5f0ff",
    primaryDark: "#5b21b6",
    buttonBg: "#7c3aed",
    buttonText: "#ffffff",
    navActiveBg: "#f0e9ff",
    navActiveText: "#5b21b6",
    accentBorder: "rgba(124, 58, 237, 0.24)"
  },
  pink: {
    value: "pink",
    label: "粉色",
    primary: "#db2777",
    primarySoft: "#fdf2f8",
    primaryDark: "#be185d",
    buttonBg: "#db2777",
    buttonText: "#ffffff",
    navActiveBg: "#fce7f3",
    navActiveText: "#be185d",
    accentBorder: "rgba(219, 39, 119, 0.24)"
  },
  orange: {
    value: "orange",
    label: "橙色",
    primary: "#ea580c",
    primarySoft: "#fff7ed",
    primaryDark: "#c2410c",
    buttonBg: "#ea580c",
    buttonText: "#ffffff",
    navActiveBg: "#ffedd5",
    navActiveText: "#c2410c",
    accentBorder: "rgba(234, 88, 12, 0.26)"
  },
  black: {
    value: "black",
    label: "黑色",
    primary: "#111827",
    primarySoft: "#f3f4f6",
    primaryDark: "#030712",
    buttonBg: "#111827",
    buttonText: "#ffffff",
    navActiveBg: "#e5e7eb",
    navActiveText: "#111827",
    accentBorder: "rgba(17, 24, 39, 0.22)"
  }
};

export const themeOptions = Object.values(themes);

export function isThemeColor(value: unknown): value is ThemeColor {
  return typeof value === "string" && value in themes;
}

export function getThemeByColor(themeColor: string | null | undefined) {
  return isThemeColor(themeColor) ? themes[themeColor] : themes.green;
}

export function getThemeCssVariables(themeColor: string | null | undefined) {
  const theme = getThemeByColor(themeColor);

  return {
    "--color-primary": theme.primary,
    "--color-primary-soft": theme.primarySoft,
    "--color-primary-dark": theme.primaryDark,
    "--color-button-bg": theme.buttonBg,
    "--color-button-text": theme.buttonText,
    "--color-nav-active-bg": theme.navActiveBg,
    "--color-nav-active-text": theme.navActiveText,
    "--color-accent-border": theme.accentBorder
  } as CSSProperties;
}
