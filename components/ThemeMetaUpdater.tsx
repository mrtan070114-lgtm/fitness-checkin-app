"use client";

import { useEffect } from "react";
import { getThemeByColor, getThemeCssVariableRecord, isThemeColor, themeCookieName, themeStorageKey } from "@/lib/themes";
import type { ThemeColor } from "@/types/database";

type ThemeMetaUpdaterProps = {
  themeColor?: ThemeColor | null;
};

function readCookieThemeColor(): ThemeColor | null {
  const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${themeCookieName}=([^;]*)`));
  let cookieValue: string | null = null;

  try {
    cookieValue = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
  } catch {
    cookieValue = null;
  }

  return isThemeColor(cookieValue) ? cookieValue : null;
}

function readStoredThemeColor(): ThemeColor | null {
  const cookieThemeColor = readCookieThemeColor();
  if (cookieThemeColor) return cookieThemeColor;

  try {
    const storageThemeColor = window.localStorage.getItem(themeStorageKey);
    return isThemeColor(storageThemeColor) ? storageThemeColor : null;
  } catch {
    return null;
  }
}

function persistThemeColor(themeColor: ThemeColor) {
  try {
    window.localStorage.setItem(themeStorageKey, themeColor);
  } catch {
    // localStorage can be unavailable in restricted browser modes.
  }

  try {
    document.cookie = `${themeCookieName}=${encodeURIComponent(themeColor)}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // Ignore cookie write failures; the meta tag has already been updated.
  }
}

function upsertMeta(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }

  meta.content = content;
}

export function ThemeMetaUpdater({ themeColor }: ThemeMetaUpdaterProps) {
  useEffect(() => {
    const resolvedThemeColor = themeColor === undefined ? readStoredThemeColor() : themeColor;
    const theme = getThemeByColor(resolvedThemeColor);
    const variables = getThemeCssVariableRecord(theme.value);

    Object.entries(variables).forEach(([name, value]) => {
      document.documentElement.style.setProperty(name, value);
    });
    upsertMeta("theme-color", theme.primary);
    upsertMeta("msapplication-TileColor", theme.primary);
    document.documentElement.style.setProperty("--app-status-bar-color", theme.primary);
    persistThemeColor(theme.value);
  }, [themeColor]);

  return null;
}
