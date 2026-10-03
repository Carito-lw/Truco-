import React, { useState } from "react";
import type { ScreenType } from "../types";
type Entry = { scores: [number, number]; text: string };
export const AnotadorScreen = (_: { onNavigate: (s: ScreenType) => void }) => {
  const [target, setTarget] = useState<15 | 30>(30);
  const [entries, setEntries] = useState<Entry[]>([
    { scores: [0, 0], text: "Partida iniciada" },
  ]);
  const scores = entries.at(-1)!.scores;
  const finished = scores.some((s) => s >= target);
  const add = (team: 0 | 1, amount: number) => {
    if (finished) return;
    setEntries((current) => {
      const next: [number, number] = [...current.at(-1)!.scores];
      next[team] = Math.min(target, next[team] + amount);
      return [
        ...current,
        {
          scores: next,
          text: `${team === 0 ? "Nosotros" : "Ellos"} +${amount}`,
        },
      ];
    });
  };
  const reset = (n: 15 | 30) => {
    setTarget(n);
    setEntries([{ scores: [0, 0], text: "Partida iniciada" }]);
  };
  return (
    <section className="truco-lobby">
      <div className="eyebrow">Para jugar con cartas reales</div>
      <h1>Anotador manual</h1>
      <p>Este marcador es independiente de la partida contra la computadora.</p>
      <div className="lobby-panel">
        <label>
          Objetivo{" "}
          <select
            aria-label="Objetivo"
            value={target}
            onChange={(e) => {
              if (
                scores.every((s) => s === 0) ||
                window.confirm(
                  "Cambiar el objetivo reinicia el marcador. ¿Continuar?",
                )
              )
                reset(Number(e.target.value) as 15 | 30);
            }}
          >
            <option value="15">15 puntos</option>
            <option value="30">30 puntos</option>
          </select>
        </label>
        {([0, 1] as const).map((team) => (
          <div className="manual-score" key={team}>
            <h2>
              {team === 0 ? "Nosotros" : "Ellos"} · {scores[team]}
            </h2>
            <div>
              {[1, 2, 3, 4].map((n) => (
                <button
                  className="table-btn"
                  key={n}
                  disabled={finished}
                  onClick={() => add(team, n)}
                >
                  +{n}
                </button>
              ))}
              <button
                className="table-btn"
                disabled={finished}
                onClick={() => add(team, target - Math.max(...scores))}
              >
                Falta envido
              </button>
            </div>
          </div>
        ))}
        {finished && (
          <p role="status">
            Ganó {scores[0] >= target ? "Nosotros" : "Ellos"}.
          </p>
        )}
        <button
          className="table-btn"
          disabled={entries.length < 2}
          onClick={() => setEntries((current) => current.slice(0, -1))}
        >
          Deshacer
        </button>
        <button
          className="table-btn"
          onClick={() => {
            if (window.confirm("¿Reiniciar el marcador?")) reset(target);
          }}
        >
          Reiniciar
        </button>
      </div>
      <details>
        <summary>Movimientos</summary>
        <ol>
          {entries.map((e, i) => (
            <li key={i}>
              {e.text} · {e.scores.join(" a ")}
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
};
