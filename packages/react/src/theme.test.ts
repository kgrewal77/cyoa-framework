import { describe, expect, it } from "vitest";
import { createTheme, darkTheme, lightTheme, type Theme } from "./theme.js";

describe("createTheme", () => {
  it("defaults to overriding lightTheme", () => {
    const theme = createTheme({ colorChoiceBackground: "#fef3c7" });
    expect(theme).toEqual({ ...lightTheme, colorChoiceBackground: "#fef3c7" });
  });

  it("overrides an explicitly given base theme", () => {
    const theme = createTheme({ colorChoiceBackground: "#1f2937" }, darkTheme);
    expect(theme).toEqual({ ...darkTheme, colorChoiceBackground: "#1f2937" });
  });

  it("returns a theme still assignable to Theme, satisfying every token", () => {
    const theme: Theme = createTheme({});
    expect(theme).toEqual(lightTheme);
  });
});
