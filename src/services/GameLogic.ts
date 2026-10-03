import {
  SPANISH_DECK,
  calculateEnvido,
  type Card,
} from "../utils/trucoEngine.ts";

export type Player = "player" | "opponent";
export type TrickResult = Player | "parda";
export type Phase = "playing" | "reveal" | "handEnd" | "dealing" | "matchEnd";
export type Call = "envido" | "real" | "falta";
export type Action =
  | { type: "play"; cardId: string }
  | { type: "truco" }
  | { type: "envido"; call: Call }
  | { type: "accept" }
  | { type: "reject" }
  | { type: "fold" };
export interface Trick {
  leader: Player;
  player?: Card;
  opponent?: Card;
  winner?: TrickResult;
}
export interface TrucoBid {
  kind: "truco";
  caller: Player;
  value: number;
}
export interface EnvidoBid {
  kind: "envido";
  caller: Player;
  chain: Call[];
  value: number;
  previous: number;
  faltaValue: number;
}
export interface GameState {
  version: 1;
  revision: number;
  target: 15 | 30;
  scores: Record<Player, number>;
  phase: Phase;
  handNumber: number;
  mano: Player;
  turn: Player;
  original: Record<Player, Card[]>;
  hands: Record<Player, Card[]>;
  tricks: Trick[];
  trucoValue: number;
  raiseRight: Player | null;
  envidoDone: boolean;
  pending: TrucoBid | EnvidoBid | null;
  suspended: TrucoBid | null;
  speech: Partial<Record<Player, string>>;
  history: string[];
  result: string;
  winner?: Player;
}
export const other = (p: Player): Player =>
  p === "player" ? "opponent" : "player";
export const playerName = (p: Player) => (p === "player" ? "Vos" : "Rival");
export const callName = (c: Call) =>
  ({ envido: "Envido", real: "Real envido", falta: "Falta envido" })[c];
export const trucoName = (n: number) =>
  ({ 2: "Truco", 3: "Retruco", 4: "Vale cuatro" })[n] || "Sin truco";
export function shuffledDeck(random = Math.random): Card[] {
  const deck = [...SPANISH_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
function deal(s: GameState, random: () => number) {
  const deck = shuffledDeck(random);
  s.original = { player: deck.slice(0, 3), opponent: deck.slice(3, 6) };
  s.hands = {
    player: [...s.original.player],
    opponent: [...s.original.opponent],
  };
  s.tricks = [{ leader: s.mano }];
  s.turn = s.mano;
  s.trucoValue = 1;
  s.raiseRight = null;
  s.envidoDone = false;
  s.pending = null;
  s.suspended = null;
  s.speech = {};
  s.result = "";
  s.phase = "playing";
}
export function newGame(target: 15 | 30 = 30, random = Math.random): GameState {
  const mano: Player = random() < 0.5 ? "player" : "opponent";
  const s: GameState = {
    version: 1,
    revision: 0,
    target,
    scores: { player: 0, opponent: 0 },
    phase: "playing",
    handNumber: 1,
    mano,
    turn: mano,
    original: { player: [], opponent: [] },
    hands: { player: [], opponent: [] },
    tricks: [],
    trucoValue: 1,
    raiseRight: null,
    envidoDone: false,
    pending: null,
    suspended: null,
    speech: {},
    history: [],
    result: "",
  };
  deal(s, random);
  return s;
}
export function envidoPoints(s: GameState, p: Player) {
  return calculateEnvido(s.original[p]).points;
}
export function decisionActor(s: GameState): Player | null {
  return s.phase !== "playing"
    ? null
    : s.pending
      ? other(s.pending.caller)
      : s.turn;
}
export function legalActions(s: GameState, p: Player): Action[] {
  if (s.phase !== "playing" || decisionActor(s) !== p) return [];
  if (s.pending) {
    const a: Action[] = [{ type: "accept" }, { type: "reject" }];
    if (s.pending.kind === "truco") {
      if (s.pending.value < 4) a.push({ type: "truco" });
      if (
        s.pending.value === 2 &&
        !s.envidoDone &&
        s.tricks.length === 1 &&
        !s.tricks[0].winner
      )
        for (const call of ["envido", "real", "falta"] as Call[])
          a.push({ type: "envido", call });
    } else {
      const chain = s.pending.chain;
      if (!chain.includes("falta")) {
        if (
          !chain.includes("real") &&
          chain.filter((c) => c === "envido").length < 2
        )
          a.push({ type: "envido", call: "envido" });
        if (!chain.includes("real")) a.push({ type: "envido", call: "real" });
        a.push({ type: "envido", call: "falta" });
      }
    }
    return a;
  }
  const a: Action[] = s.hands[p].map((c) => ({ type: "play", cardId: c.id }));
  a.push({ type: "fold" });
  if (s.trucoValue < 4 && (s.trucoValue === 1 || s.raiseRight === p))
    a.push({ type: "truco" });
  if (
    !s.envidoDone &&
    s.trucoValue === 1 &&
    s.tricks.length === 1 &&
    s.hands[p].length === 3
  )
    for (const call of ["envido", "real", "falta"] as Call[])
      a.push({ type: "envido", call });
  return a;
}
function sameAction(a: Action, b: Action) {
  return (
    a.type === b.type &&
    (a.type !== "play" || (b.type === "play" && a.cardId === b.cardId)) &&
    (a.type !== "envido" || (b.type === "envido" && a.call === b.call))
  );
}
function record(s: GameState, text: string) {
  s.history = [...s.history.slice(-99), text];
}
function say(s: GameState, p: Player, text: string) {
  s.speech[p] = text;
  record(s, `${playerName(p)}: ${text}`);
}
function award(s: GameState, p: Player, points: number, reason: string) {
  s.scores[p] += points;
  s.result = `${playerName(p)} +${points} · ${reason}`;
  record(s, s.result);
  if (s.scores[p] >= s.target) {
    s.phase = "matchEnd";
    s.winner = p;
    s.pending = null;
    s.suspended = null;
  }
}
function finishHand(s: GameState, p: Player, points: number, reason: string) {
  award(s, p, points, reason);
  s.pending = null;
  s.suspended = null;
  if (s.phase !== "matchEnd") s.phase = "handEnd";
}
// Undefined until the hand is decided. A tie in the last trick favors the first winner.
export function handWinner(tricks: Trick[], mano: Player): Player | undefined {
  const w = tricks.map((t) => t.winner);
  if (w.filter((x) => x === "player").length >= 2) return "player";
  if (w.filter((x) => x === "opponent").length >= 2) return "opponent";
  if (w[1] !== undefined) {
    if (w[0] === "parda" && w[1] !== "parda") return w[1];
    if (w[1] === "parda" && w[0] !== "parda") return w[0];
  }
  if (w[2] !== undefined) {
    if (w[2] !== "parda") return w[2];
    return (
      (w.find((x) => x === "player" || x === "opponent") as
        | Player
        | undefined) || mano
    );
  }
}
export function act(s: GameState, p: Player, action: Action): GameState {
  if (!legalActions(s, p).some((a) => sameAction(a, action))) return s;
  const n = structuredClone(s);
  n.revision++;
  n.result = "";
  const bid = n.pending;
  if (action.type === "play") {
    const card = n.hands[p].find((c) => c.id === action.cardId)!;
    n.hands[p] = n.hands[p].filter((c) => c.id !== card.id);
    const trick = n.tricks[n.tricks.length - 1];
    trick[p] = card;
    n.speech = {};
    record(n, `${playerName(p)} juega ${card.number} de ${card.suit}`);
    if (trick.player && trick.opponent) {
      trick.winner =
        trick.player.rank === trick.opponent.rank
          ? "parda"
          : trick.player.rank > trick.opponent.rank
            ? "player"
            : "opponent";
      n.phase = "reveal";
    } else n.turn = other(p);
  } else if (action.type === "fold") {
    say(n, p, "Me voy al mazo");
    finishHand(n, other(p), n.trucoValue, "Se fue al mazo");
  } else if (action.type === "truco") {
    const value = bid?.kind === "truco" ? bid.value + 1 : n.trucoValue + 1;
    if (bid?.kind === "truco") {
      n.trucoValue = bid.value;
      n.envidoDone = true;
    }
    n.pending = { kind: "truco", caller: p, value };
    say(n, p, `¡${trucoName(value)}!`);
  } else if (action.type === "envido") {
    if (bid?.kind === "truco") n.suspended = bid;
    const old = bid?.kind === "envido" ? bid : null;
    const faltaValue =
      old?.faltaValue ??
      n.target - Math.max(n.scores.player, n.scores.opponent);
    n.pending = {
      kind: "envido",
      caller: p,
      chain: [...(old?.chain ?? []), action.call],
      previous: old?.value ?? 1,
      faltaValue,
      value:
        action.call === "falta"
          ? faltaValue
          : (old?.value ?? 0) + (action.call === "real" ? 3 : 2),
    };
    say(n, p, callName(action.call));
  } else if (bid && (action.type === "accept" || action.type === "reject")) {
    say(n, p, action.type === "accept" ? "Quiero" : "No quiero");
    if (bid.kind === "truco") {
      if (action.type === "reject")
        finishHand(
          n,
          bid.caller,
          n.trucoValue,
          `${trucoName(bid.value)} no querido`,
        );
      else {
        n.trucoValue = bid.value;
        n.raiseRight = p;
        n.envidoDone = true;
        n.pending = null;
      }
    } else {
      n.envidoDone = true;
      if (action.type === "reject")
        award(n, bid.caller, bid.previous, "Envido no querido");
      else {
        const a = envidoPoints(n, "player"),
          b = envidoPoints(n, "opponent");
        const winner = a === b ? n.mano : a > b ? "player" : "opponent";
        n.speech = { player: `Tengo ${a}`, opponent: `Tengo ${b}` };
        award(
          n,
          winner,
          bid.value,
          `Envido ${a} a ${b}${a === b ? " · gana quien es mano" : ""}`,
        );
      }
      if (n.phase !== "matchEnd") {
        n.pending = n.suspended;
        n.suspended = null;
      }
    }
  }
  return n;
}
export function advance(s: GameState, random = Math.random): GameState {
  if (!["reveal", "handEnd", "dealing"].includes(s.phase)) return s;
  const n = structuredClone(s);
  n.revision++;
  if (n.phase === "reveal") {
    const winner = handWinner(n.tricks, n.mano);
    if (winner) finishHand(n, winner, n.trucoValue, "Mano ganada");
    else {
      const last = n.tricks[n.tricks.length - 1];
      const leader =
        last.winner === "parda" ? last.leader : (last.winner as Player);
      n.tricks.push({ leader });
      n.turn = leader;
      n.phase = "playing";
      n.speech = {};
    }
  } else if (n.phase === "handEnd") {
    n.phase = "dealing";
    n.mano = other(n.mano);
    n.handNumber++;
    n.speech = {};
  } else deal(n, random);
  return n;
}
// Only own cards and public information enter the computer's decision.
export function chooseOpponentAction(
  s: GameState,
  random = Math.random,
): Action | null {
  const actions = legalActions(s, "opponent");
  if (!actions.length) return null;
  const own = s.hands.opponent;
  const points = envidoPoints(s, "opponent");
  const strong = own.filter((c) => c.rank >= 10).length;
  const find = (type: Action["type"]) => actions.find((a) => a.type === type);
  if (s.pending) {
    if (s.pending.kind === "envido") {
      const raise = actions.find(
        (a) =>
          a.type === "envido" && a.call === (points >= 32 ? "falta" : "real"),
      );
      if (points >= 30 && raise && random() < 0.3) return raise;
      return find(
        points >= (s.pending.chain.includes("falta") ? 29 : 25) ||
          random() < 0.15
          ? "accept"
          : "reject",
      )!;
    }
    if (points >= 27 && actions.some((a) => a.type === "envido"))
      return actions.find((a) => a.type === "envido")!;
    if (strong >= 2 && find("truco") && random() < 0.3) return find("truco")!;
    const won = s.tricks.some((t) => t.winner === "opponent");
    return find(strong || won || random() < 0.2 ? "accept" : "reject")!;
  }
  const envido = actions.find(
    (a) => a.type === "envido" && a.call === "envido",
  );
  if (envido && (points >= 27 || random() < 0.08)) return envido;
  if (find("truco") && (strong >= 2 || random() < 0.06)) return find("truco")!;
  const target = s.tricks[s.tricks.length - 1].player;
  const sorted = [...own].sort((a, b) => a.rank - b.rank);
  const card = target
    ? (sorted.find((c) => c.rank > target.rank) ?? sorted[0])
    : sorted[sorted.length - 1];
  return { type: "play", cardId: card.id };
}
export function opponentDelay(s: GameState, random = Math.random) {
  const min = s.pending ? 2500 : 1800;
  return min + Math.floor(random() * (s.pending ? 1500 : 1000));
}
