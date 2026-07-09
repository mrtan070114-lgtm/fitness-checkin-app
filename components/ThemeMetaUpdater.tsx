"use client";

import { useEffect } from "react";
import { getThemeByColor, getThemeCssVariableRecord, themeCookieName, themeStorageKey } from "@/lib/themes";
import type { ThemeColor } from "@/types/database";

type ThemeMetaUpdaterProps = {
  themeColor: ThemeColor | null;
};

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
    const theme = getThemeByColor(themeColor);
    const variables = getThemeCssVariableRecord(theme.value);

    Object.entries(variables).forEach(([name, value]) => {
      document.documentElement.style.setProperty(name, value);
    });
    upsertMeta("theme-color", theme.primary);
    upsertMeta("msapplication-TileColor", theme.primary);
    document.documentElement.style.setProperty("--app-status-bar-color", theme.primary);
    window.localStorage.setItem(themeStorageKey, theme.value);
    document.cookie = `${themeCookieName}=${encodeURIComponent(theme.value)}; path=/; max-age=31536000; samesite=lax`;
  }, [themeColor]);

  return null;
}
