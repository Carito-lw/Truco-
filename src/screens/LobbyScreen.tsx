import React, { useState } from "react";
import type { ScreenType } from "../types";
import { TARGET_KEY, savedGame, saveGame } from "../services/gameStorage";
import { newGame } from "../services/GameLogic";
export const LobbyScreen = ({
  onNavigate,
}: {
  onNavigate: (screen: ScreenType) => void;
}) => {
  const [target, setTarget] = useState<15 | 30>(30);
  const [saved] = useState(savedGame);
  const start = () => {
    try {
      localStorage.setItem(TARGET_KEY, String(target));
    } catch {}
    saveGame(newGame(target));
    onNavigate("mesa-en-vivo");
  };
  return (
    <section className="truco-lobby">
      <div className="eyebrow">Salón digital · Truco argentino</div>
      <h1>
        Una mesa.
        <br />
        Toda la picardía.
      </h1>
      <p>
        Jugá mano a mano contra la computadora. Cantá, arriesgá y hacé valer tus
        cartas.
      </p>
      <div className="lobby-panel">
        <h2>Prepará la partida</h2>
        <fieldset>
          <legend>Puntos para ganar</legend>
          {([15, 30] as const).map((n) => (
            <label key={n}>
              <input
                type="radio"
                name="target"
                value={n}
                checked={target === n}
                onChange={() => setTarget(n)}
              />{" "}
              A {n} puntos
            </label>
          ))}
        </fieldset>
        <p>1 contra 1 · Sin flor · Sin apuestas</p>
        <button className="table-btn primary" onClick={start}>
          Nueva partida
        </button>
        {saved && saved.phase !== "matchEnd" && (
          <button
            className="table-btn"
            onClick={() => onNavigate("mesa-en-vivo")}
          >
            Continuar · {saved.scores.player} a {saved.scores.opponent}
          </button>
        )}
        <small>
          Se guarda en este navegador. Podés salir y continuar después.
        </small>
      </div>
      <details className="local-rules">
        <summary>Reglas de esta mesa</summary>
        <p>
          El envido se calcula con las tres cartas originales. En un empate gana
          quien es mano. Envido vale 2, real envido 3; los aumentos se suman. La
          falta envido vale lo que le falta a quien va adelante para llegar al
          objetivo, tanto en buenas como en malas. Esta variante se aplica a
          toda la partida.
        </p>
        <p>
          Gana dos vueltas, o la primera si la siguiente es parda. Si la primera
          es parda, decide la siguiente; tres pardas favorecen a quien es mano.
          Truco, retruco y vale cuatro valen 2, 3 y 4 puntos cuando se aceptan.
          Al rechazarlos se cobra el valor anterior. Después de aceptar, el
          derecho a aumentar es tuyo.
        </p>
        <p>
          Esta versión es local contra la computadora. Los modos multijugador y
          torneos todavía no están disponibles.
        </p>
      </details>
    </section>
  );
};
