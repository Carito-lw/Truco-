import {
  type GameState,
  newGame,
  legalActions,
  decisionActor,
} from "./GameLogic.ts";
import { SPANISH_DECK } from "../utils/trucoEngine.ts";
export const SAVE_KEY = "truco-criollo-match-v1";
export const TARGET_KEY = "truco-criollo-target";
export function readGame(raw: string | null): GameState | null {
  try {
    if (!raw) return null;
    const s = JSON.parse(raw) as GameState;
    const players = ["player", "opponent"] as const;
    if (
      s.version !== 1 ||
      ![15, 30].includes(s.target) ||
      !Number.isInteger(s.revision) ||
      s.revision < 0 ||
      !Number.isInteger(s.handNumber) ||
      s.handNumber < 1
    )
      return null;
    if (
      !players.includes(s.mano) ||
      !players.includes(s.turn) ||
      !["playing", "reveal", "handEnd", "dealing", "matchEnd"].includes(s.phase)
    )
      return null;
    if (
      !players.every(
        (p) =>
          Number.isInteger(s.scores[p]) &&
          s.scores[p] >= 0 &&
          s.scores[p] < 100,
      )
    )
      return null;
    if (
      ![1, 2, 3, 4].includes(s.trucoValue) ||
      ![null, ...players].includes(s.raiseRight) ||
      typeof s.envidoDone !== "boolean"
    )
      return null;
    if (
      !Array.isArray(s.tricks) ||
      s.tricks.length < 1 ||
      s.tricks.length > 3 ||
      !Array.isArray(s.history) ||
      !s.history.every((h) => typeof h === "string") ||
      typeof s.result !== "string"
    )
      return null;
    if (
      !s.speech ||
      !Object.values(s.speech).every((v) => typeof v === "string")
    )
      return null;
    const validCard = (c: any) =>
      SPANISH_DECK.some(
        (d) =>
          d.id === c?.id &&
          d.suit === c.suit &&
          d.number === c.number &&
          d.rank === c.rank,
      );
    for (const p of players) {
      if (
        s.original[p].length !== 3 ||
        !s.original[p].every(validCard) ||
        !Array.isArray(s.hands[p]) ||
        s.hands[p].length > 3
      )
        return null;
      const played = s.tricks.flatMap((t) => (t[p] ? [t[p]!] : []));
      const all = [...played, ...s.hands[p]];
      if (
        all.length !== 3 ||
        new Set(all.map((c) => c.id)).size !== 3 ||
        !all.every(
          (c) => validCard(c) && s.original[p].some((o) => o.id === c.id),
        )
      )
        return null;
    }
    if (
      new Set([...s.original.player, ...s.original.opponent].map((c) => c.id))
        .size !== 6
    )
      return null;
    for (const t of s.tricks)
      if (
        !players.includes(t.leader) ||
        ![undefined, "parda", ...players].includes(t.winner)
      )
        return null;
    const validBid = (b: any) =>
      b &&
      players.includes(b.caller) &&
      (b.kind === "truco"
        ? [2, 3, 4].includes(b.value)
        : b.kind === "envido" &&
          Array.isArray(b.chain) &&
          b.chain.length > 0 &&
          b.chain.length <= 4 &&
          b.chain.every((c: string) =>
            ["envido", "real", "falta"].includes(c),
          ) &&
          [b.value, b.previous, b.faltaValue].every(
            (v) => Number.isInteger(v) && v > 0 && v <= 30,
          ));
    if (
      (s.pending !== null && !validBid(s.pending)) ||
      (s.suspended !== null &&
        (!validBid(s.suspended) || s.suspended.kind !== "truco"))
    )
      return null;
    if (
      s.phase === "matchEnd" &&
      (!players.includes(s.winner!) || s.scores[s.winner!] < s.target)
    )
      return null;
    if (s.phase !== "matchEnd" && players.some((p) => s.scores[p] >= s.target))
      return null;
    if (
      s.phase === "playing" &&
      !legalActions(s, decisionActor(s)!).some(
        (a) => a.type === "play" || a.type === "accept",
      )
    )
      return null;
    return s;
  } catch {
    return null;
  }
}
let memorySave: GameState | null = null;
export function savedGame(): GameState | null {
  try {
    return readGame(localStorage.getItem(SAVE_KEY)) ?? memorySave;
  } catch {
    return memorySave;
  }
}
export function saveGame(s: GameState): boolean {
  memorySave = s;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}
export function loadGame(): GameState {
  const saved = savedGame();
  if (saved) return saved;
  try {
    return newGame(localStorage.getItem(TARGET_KEY) === "15" ? 15 : 30);
  } catch {
    return newGame();
  }
}
