import { useState } from "react";
import { ThemeProvider, darkTheme, lightTheme, type Theme } from "cyoa-react";
import { Game } from "./Game.js";
import { sepiaTheme } from "./sepiaTheme.js";
import { lighthouseStory } from "./stories/lighthouse.js";
import "./App.css";

type ThemeName = "light" | "dark" | "sepia";

const themes: Record<ThemeName, Theme> = { light: lightTheme, dark: darkTheme, sepia: sepiaTheme };

export default function App() {
  const [playthrough, setPlaythrough] = useState(0);
  const [themeName, setThemeName] = useState<ThemeName>("dark");

  return (
    <ThemeProvider theme={themes[themeName]}>
      <main className="app">
        <div className="header">
          <h1>{lighthouseStory.title}</h1>
          <select
            className="theme-select"
            aria-label="Theme"
            value={themeName}
            onChange={(event) => setThemeName(event.target.value as ThemeName)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="sepia">Sepia (custom)</option>
          </select>
        </div>
        <p className="tagline">A tiny demo story, built with cyoa-core and rendered with cyoa-react.</p>
        <Game key={playthrough} story={lighthouseStory} onRestart={() => setPlaythrough((n) => n + 1)} />
      </main>
    </ThemeProvider>
  );
}
