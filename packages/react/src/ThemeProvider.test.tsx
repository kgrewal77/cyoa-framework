import { render, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeProvider.js";
import { darkTheme, lightTheme } from "./theme.js";

describe("ThemeProvider", () => {
  it("defaults to the light theme", () => {
    const { container } = render(
      <ThemeProvider>
        <span>content</span>
      </ThemeProvider>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue("--cyoa-background")).toBe(lightTheme.colorBackground);
  });

  it("applies the given theme's colors as CSS custom properties", () => {
    const { container } = render(
      <ThemeProvider theme={darkTheme}>
        <span>content</span>
      </ThemeProvider>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue("--cyoa-background")).toBe(darkTheme.colorBackground);
    expect(wrapper.style.getPropertyValue("--cyoa-choice-background")).toBe(
      darkTheme.colorChoiceBackground,
    );
    // jsdom normalizes hex colors assigned via the `background`/`color` shorthand to rgb().
    expect(wrapper.style.background).toBe("rgb(20, 23, 28)");
    expect(wrapper.style.color).toBe("rgb(232, 230, 225)");
  });

  it("useTheme returns the light theme outside of any provider", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe(lightTheme);
  });

  it("useTheme returns the theme passed to the nearest provider", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider theme={darkTheme}>{children}</ThemeProvider>,
    });
    expect(result.current).toBe(darkTheme);
  });
});
