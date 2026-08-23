import { createTheme } from "cyoa-react";

/**
 * A custom theme built with `createTheme`, overriding just a few of `lightTheme`'s
 * tokens (the default base) — the rest (text colors) fall through unchanged.
 */
export const sepiaTheme = createTheme({
  colorBackground: "#f4ecd8",
  colorChoiceBackground: "#e8dcc0",
  colorChoiceBackgroundHover: "#ddcda8",
  colorChoiceBorder: "#c2af86",
});
