import { useState } from "react";
import { Game } from "./Game.js";
import { lighthouseStory } from "./stories/lighthouse.js";
import "./App.css";

export default function App() {
  const [playthrough, setPlaythrough] = useState(0);

  return (
    <main className="app">
      <h1>{lighthouseStory.title}</h1>
      <p className="tagline">A tiny demo story, built with cyoa-core and rendered with cyoa-react.</p>
      <Game key={playthrough} story={lighthouseStory} onRestart={() => setPlaythrough((n) => n + 1)} />
    </main>
  );
}
