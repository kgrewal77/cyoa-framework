export interface Theme {
  colorBackground: string;
  colorText: string;
  colorMutedText: string;
  colorChoiceBackground: string;
  colorChoiceBackgroundHover: string;
  colorChoiceBorder: string;
  colorChoiceText: string;
}

export const lightTheme: Theme = {
  colorBackground: "#ffffff",
  colorText: "#1a1a1a",
  colorMutedText: "#6b7280",
  colorChoiceBackground: "#f3f4f6",
  colorChoiceBackgroundHover: "#e5e7eb",
  colorChoiceBorder: "#d1d5db",
  colorChoiceText: "#1a1a1a",
};

export const darkTheme: Theme = {
  colorBackground: "#14171c",
  colorText: "#e8e6e1",
  colorMutedText: "#9a978f",
  colorChoiceBackground: "#1e2127",
  colorChoiceBackgroundHover: "#262a31",
  colorChoiceBorder: "#3a3d44",
  colorChoiceText: "#e8e6e1",
};

/**
 * Builds a custom theme by overriding one or more tokens of a base theme (`lightTheme`
 * by default). A fully custom theme can also be written from scratch as a plain object
 * satisfying `Theme` — this is just a convenience for tweaking an existing one.
 */
export function createTheme(overrides: Partial<Theme>, base: Theme = lightTheme): Theme {
  return { ...base, ...overrides };
}

/** CSS custom property names `ThemeProvider` sets and the default `Scene`/`Choice` read. */
export const themeCssVar = {
  background: "--cyoa-background",
  text: "--cyoa-text",
  mutedText: "--cyoa-muted-text",
  choiceBackground: "--cyoa-choice-background",
  choiceBackgroundHover: "--cyoa-choice-background-hover",
  choiceBorder: "--cyoa-choice-border",
  choiceText: "--cyoa-choice-text",
} as const satisfies Record<string, `--cyoa-${string}`>;

export function themeToCssProperties(theme: Theme): Record<string, string> {
  return {
    [themeCssVar.background]: theme.colorBackground,
    [themeCssVar.text]: theme.colorText,
    [themeCssVar.mutedText]: theme.colorMutedText,
    [themeCssVar.choiceBackground]: theme.colorChoiceBackground,
    [themeCssVar.choiceBackgroundHover]: theme.colorChoiceBackgroundHover,
    [themeCssVar.choiceBorder]: theme.colorChoiceBorder,
    [themeCssVar.choiceText]: theme.colorChoiceText,
  };
}
