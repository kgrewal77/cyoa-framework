import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { lightTheme, themeToCssProperties, type Theme } from "./theme.js";

const ThemeContext = createContext<Theme>(lightTheme);

export interface ThemeProviderProps {
  /** @default lightTheme */
  theme?: Theme;
  children: ReactNode;
}

/**
 * Applies a `Theme` as CSS custom properties (e.g. `--cyoa-background`) on a wrapper
 * element, which the default `Scene`/`Choice` components read. Also exposes the theme
 * object itself via context, for custom components that would rather read plain values
 * through `useTheme()` than CSS variables.
 */
export function ThemeProvider({ theme = lightTheme, children }: ThemeProviderProps) {
  const style: CSSProperties = {
    ...(themeToCssProperties(theme) as CSSProperties),
    background: theme.colorBackground,
    color: theme.colorText,
  };

  return (
    <ThemeContext.Provider value={theme}>
      <div style={style}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
