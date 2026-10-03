import React, { useEffect, useState } from "react";
import type { ScreenType } from "../types";
import { SpanishCardUI } from "../components/SpanishCardUI";
import {
  act,
  advance,
  callName,
  chooseOpponentAction,
  decisionActor,
  envidoPoints,
  legalActions,
  newGame,
  opponentDelay,
  other,
  playerName,
  trucoName,
  type Action,
} from "../services/GameLogic";
import { loadGame, saveGame } from "../services/gameStorage";

export const MesaEnVivoScreen = ({
  onNavigate,
}: {
  onNavigate: (screen: ScreenType) => void;
}) => {
  const [game, setGame] = useState(loadGame);
  const [history, setHistory] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const actions = legalActions(game, "player");
  const actor = decisionActor(game);
  const label = (a: Action) =>
    a.type === "envido"
      ? callName(a.call)
      : a.type === "truco"
        ? trucoName(
            game.pending?.kind === "truco"
              ? game.pending.value + 1
              : game.trucoValue + 1,
          )
        : {
            accept: "Quiero",
            reject: "No quiero",
            fold: "Ir al mazo",
            play: "Jugar",
          }[a.type];
  useEffect(() => {
    setSaveError(!saveGame(game));
  }, [game]);
  useEffect(() => {
    if (history) return;
    let delay: number;
    if (game.phase === "reveal") delay = 1400;
    else if (game.phase === "handEnd" || game.phase === "dealing") delay = 2000;
    else if (actor === "opponent") delay = opponentDelay(game);
    else return;
    const timer = window.setTimeout(
      () =>
        setGame((current) => {
          if (current !== game) return current;
          if (current.phase !== "playing") return advance(current);
          const action = chooseOpponentAction(current);
          return action ? act(current, "opponent", action) : current;
        }),
      delay,
    );
    return () => window.clearTimeout(timer);
  }, [game, actor, history]);
  const send = (action: Action) =>
    setGame((current) => act(current, "player", action));
  const status =
    game.phase === "matchEnd"
      ? "Partida terminada"
      : game.phase === "handEnd"
        ? game.result
        : game.phase === "dealing"
          ? "Comienza una nueva mano"
          : game.phase === "reveal"
            ? "Cartas sobre la mesa"
            : game.pending
              ? `${game.pending.kind === "truco" ? trucoName(game.pending.value) : game.pending.chain.map(callName).join(" + ")} · ${actor === "player" ? "Tu respuesta" : "El rival está pensando…"}`
              : actor === "player"
                ? "Tu turno · elegí una carta o cantá"
                : "El rival está pensando…";
  return (
    <section className="game-room" aria-label="Mesa de truco">
      <header className="match-bar">
        <button
          className="table-btn"
          onClick={() => onNavigate("lobby-de-salas")}
        >
          Salir
        </button>
        <div className="scoreboard">
          <div>
            <span>Vos</span>
            <strong>{game.scores.player}</strong>
          </div>
          <p>
            A {game.target}
            <small>Sin flor</small>
          </p>
          <div>
            <span>Rival</span>
            <strong>{game.scores.opponent}</strong>
          </div>
        </div>
        <button
          className="table-btn"
          onClick={() => setHistory(true)}
          aria-label="Ver historial"
        >
          Historial
        </button>
      </header>
      {saveError && (
        <p role="alert">No se pudo guardar la partida en este navegador.</p>
      )}
      <div className="table-felt">
        <div className="seat opponent-seat">
          <div className="seat-name">
            Rival{" "}
            <span>
              Computadora · {game.mano === "opponent" ? "es mano" : "reparte"}
            </span>
          </div>
          <div className="speech" aria-live="polite">
            {game.speech.opponent ||
              (actor === "opponent" ? "Estoy pensando…" : "")}
          </div>
          <div className="card-row opponent-cards">
            {game.hands.opponent.map((c) => (
              <div
                key={c.id}
                className="card-back"
                aria-label="Carta del rival boca abajo"
              />
            ))}
          </div>
        </div>
        <div
          className={`dealer-deck ${other(game.mano) === "opponent" ? "dealer-top" : "dealer-bottom"}`}
          aria-label={`Mazo: reparte ${playerName(other(game.mano))}`}
        >
          <div className="card-back" />
          <small>Mazo</small>
        </div>
        <div className="played-area" aria-label="Cartas jugadas">
          {game.tricks.map((t, i) => (
            <div className="trick-column" key={i}>
              <div className="played-slot">
                {t.opponent && (
                  <SpanishCardUI
                    card={t.opponent}
                    size="sm"
                    isPlayable={false}
                  />
                )}
              </div>
              <span className="trick-outcome">
                {t.winner === "parda"
                  ? "Parda"
                  : t.winner
                    ? `${playerName(t.winner)} gana`
                    : ""}
              </span>
              <div className="played-slot">
                {t.player && (
                  <SpanishCardUI card={t.player} size="sm" isPlayable={false} />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="seat player-seat">
          <div className="speech" aria-live="polite">
            {game.speech.player || ""}
          </div>
          <div className="card-row player-cards">
            {game.hands.player.map((c) => (
              <SpanishCardUI
                key={c.id}
                card={c}
                size="lg"
                disabled={
                  !actions.some((a) => a.type === "play" && a.cardId === c.id)
                }
                onClick={() => send({ type: "play", cardId: c.id })}
              />
            ))}
          </div>
          <div className="seat-name">
            Vos{" "}
            <span>
              {game.mano === "player" ? "Sos mano" : "Repartís"} · Envido:{" "}
              {envidoPoints(game, "player")}
            </span>
          </div>
        </div>
        {(game.phase === "handEnd" ||
          game.phase === "dealing" ||
          game.phase === "matchEnd") && (
          <div className="round-overlay" role="status">
            <div>
              <span className="eyebrow">
                {game.phase === "matchEnd"
                  ? "Fin de partida"
                  : game.phase === "dealing"
                    ? `Mano ${game.handNumber}`
                    : "Resultado"}
              </span>
              <h2>
                {game.phase === "matchEnd"
                  ? game.winner === "player"
                    ? "Ganaste la partida"
                    : "El rival ganó la partida"
                  : game.phase === "dealing"
                    ? "Comienza una nueva mano"
                    : game.result}
              </h2>
              <p>
                {game.phase === "dealing"
                  ? `${playerName(game.mano)} empieza · repartiendo…`
                  : game.phase === "matchEnd"
                    ? `${game.scores.player} a ${game.scores.opponent}`
                    : "La próxima mano comienza automáticamente"}
              </p>
              {game.phase === "matchEnd" && (
                <button
                  className="table-btn primary"
                  onClick={() => setGame(newGame(game.target))}
                >
                  Jugar otra partida
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <footer className="action-dock">
        <div className="turn-status" role="status">
          {status}
        </div>
        <div className="action-buttons">
          {actions
            .filter((a) => a.type !== "play")
            .map((a) => (
              <button
                key={a.type === "envido" ? a.call : a.type}
                className={`table-btn ${a.type === "accept" ? "primary" : ""} ${a.type === "fold" || a.type === "reject" ? "muted" : ""}`}
                onClick={() => send(a)}
              >
                {label(a)}
              </button>
            ))}
        </div>
        <p className="stake">
          Truco: {game.trucoValue} {game.trucoValue === 1 ? "punto" : "puntos"}{" "}
          en juego
          {game.pending?.kind === "envido"
            ? ` · Envido querido: ${game.pending.value}, no querido: ${game.pending.previous}`
            : ""}
        </p>
      </footer>
      {history && (
        <div className="game-modal" onClick={() => setHistory(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="table-btn"
              onClick={() => setHistory(false)}
            >
              Cerrar
            </button>
            <h2 id="history-title">Historial de la partida</h2>
            <ol>
              {game.history.length ? (
                game.history.map((h, i) => <li key={i}>{h}</li>)
              ) : (
                <li>Primera mano. El marcador empieza en cero.</li>
              )}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
};
