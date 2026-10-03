import test from "node:test";
import assert from "node:assert/strict";
import {
  act,
  advance,
  decisionActor,
  legalActions,
  newGame,
  other,
  handWinner,
  envidoPoints,
  chooseOpponentAction,
  opponentDelay,
  type GameState,
  type Player,
  type TrickResult,
} from "../src/services/GameLogic.ts";
import { SPANISH_DECK, calculateEnvido } from "../src/utils/trucoEngine.ts";
import { readGame } from "../src/services/gameStorage.ts";
const card = (id: string) => SPANISH_DECK.find((c) => c.id === id)!;
function fixture(p = ["7E", "6E", "3O"], o = ["7B", "5B", "4C"]): GameState {
  const s = newGame(30, () => 0.2);
  s.mano = "player";
  s.turn = "player";
  s.tricks = [{ leader: "player" }];
  s.original = { player: p.map(card), opponent: o.map(card) };
  s.hands = structuredClone(s.original);
  return s;
}
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
test("40 unique cards, ranks and envido with faces / three matching suits", () => {
  assert.equal(new Set(SPANISH_DECK.map((c) => c.id)).size, 40);
  assert.deepEqual(
    ["1E", "1B", "7E", "7O"].map((id) => card(id).rank),
    [14, 13, 12, 11],
  );
  for (const [ids, points] of [
    [["7E", "6E", "3O"], 33],
    [["10E", "12E", "5O"], 20],
    [["7E", "6E", "5E"], 33],
    [["12E", "11C", "10O"], 0],
    [["4E", "5B", "7C"], 7],
  ] as [string[], number][])
    assert.equal(calculateEnvido(ids.map(card)).points, points);
});
test("all 27 trick combinations and early ties", () => {
  const choices: TrickResult[] = ["player", "opponent", "parda"];
  for (const a of choices)
    for (const b of choices)
      for (const c of choices)
        for (const mano of ["player", "opponent"] as Player[]) {
          const expected =
            a === b && a !== "parda"
              ? a
              : a === "parda" && b !== "parda"
                ? b
                : b === "parda" && a !== "parda"
                  ? a
                  : c !== "parda"
                    ? c
                    : a !== "parda"
                      ? a
                      : b !== "parda"
                        ? b
                        : mano;
          // Stop at the second trick when already decided; a third trick cannot exist in that case.
          const two = handWinner(
            [
              { leader: mano, winner: a },
              { leader: mano, winner: b },
            ],
            mano,
          );
          const actual =
            two ??
            handWinner(
              [a, b, c].map((winner) => ({ leader: mano, winner })),
              mano,
            );
          assert.equal(actual, expected, `${a}/${b}/${c}/${mano}`);
        }
  assert.equal(
    handWinner([{ leader: "player", winner: "parda" }], "player"),
    undefined,
  );
});
test("actions enforce turns, reject unknown/repeated cards and block play during calls", () => {
  let s = fixture();
  assert.equal(act(s, "opponent", { type: "play", cardId: "7B" }), s);
  assert.equal(act(s, "player", { type: "play", cardId: "missing" }), s);
  s = act(s, "player", { type: "truco" });
  assert.equal(act(s, "opponent", { type: "play", cardId: "7B" }), s);
  assert.equal(act(s, "player", { type: "accept" }), s);
  s = act(s, "opponent", { type: "accept" });
  assert.equal(s.turn, "player");
  assert.equal(s.trucoValue, 2);
  assert.equal(s.raiseRight, "opponent");
  assert.ok(!legalActions(s, "player").some((a) => a.type === "truco"));
  s = act(s, "player", { type: "play", cardId: "7E" });
  assert.equal(act(s, "player", { type: "play", cardId: "7E" }), s);
  assert.ok(legalActions(s, "opponent").some((a) => a.type === "truco"));
});
test("envido uses original three cards after playing and resumes suspended truco", () => {
  let s = fixture();
  s = act(s, "player", { type: "play", cardId: "7E" });
  assert.equal(envidoPoints(s, "player"), 33);
  s = act(s, "opponent", { type: "truco" });
  s = act(s, "player", { type: "envido", call: "envido" });
  assert.equal(s.suspended?.caller, "opponent");
  s = act(s, "opponent", { type: "accept" });
  assert.equal(s.scores.player, 2);
  assert.equal(s.pending?.kind, "truco");
  assert.equal(s.turn, "opponent");
  s = act(s, "player", { type: "accept" });
  assert.equal(decisionActor(s), "opponent");
});
test("envido increases accumulate, rejection awards previous stake and tie favors mano", () => {
  let s = fixture();
  s = act(s, "player", { type: "envido", call: "envido" });
  s = act(s, "opponent", { type: "envido", call: "envido" });
  s = act(s, "player", { type: "envido", call: "real" });
  assert.equal(s.pending?.value, 7);
  s = act(s, "opponent", { type: "envido", call: "falta" });
  s = act(s, "player", { type: "reject" });
  assert.equal(s.scores.opponent, 7);
  assert.equal(s.phase, "playing");
  assert.equal(s.turn, "player");
  s = fixture(["7E", "6E", "4C"], ["7B", "6B", "4O"]);
  s = act(s, "player", { type: "envido", call: "envido" });
  s = act(s, "opponent", { type: "accept" });
  assert.equal(s.scores.player, 2);
});
test("truco raises and rejects award 1,2,3 respectively", () => {
  for (let raises = 1; raises <= 3; raises++) {
    let s = fixture();
    let p: Player = "player";
    for (let n = 0; n < raises; n++) {
      s = act(s, p, { type: "truco" });
      p = other(p);
    }
    s = act(s, p, { type: "reject" });
    assert.equal(s.scores[other(p)], raises);
    assert.equal(s.phase, "handEnd");
    assert.equal(act(s, p, { type: "reject" }), s);
  }
});
test("fold awards accepted stake and only auto transition changes dealer", () => {
  let s = fixture();
  s = act(s, "player", { type: "truco" });
  s = act(s, "opponent", { type: "accept" });
  s = act(s, "player", { type: "fold" });
  assert.equal(s.scores.opponent, 2);
  const end = s;
  s = advance(s);
  assert.equal(s.phase, "dealing");
  assert.equal(s.mano, "opponent");
  s = advance(s, seeded(88));
  assert.equal(s.phase, "playing");
  assert.equal(s.turn, "opponent");
  assert.equal(s.hands.player.length, 3);
  assert.equal(end.phase, "handEnd");
});
test("envido ends match immediately; falta variant uses leader remaining points", () => {
  let s = fixture();
  s.scores.player = 28;
  s.scores.opponent = 20;
  s = act(s, "player", { type: "truco" });
  s = act(s, "opponent", { type: "envido", call: "falta" });
  assert.equal(s.pending?.value, 2);
  s = act(s, "player", { type: "accept" });
  assert.equal(s.phase, "matchEnd");
  assert.equal(s.winner, "player");
  assert.equal(s.pending, null);
  assert.equal(advance(s), s);
  assert.deepEqual(legalActions(s, "player"), []);
});
test("computer decision ignores hidden opponent cards and waits", () => {
  let s = fixture();
  s.mano = "opponent";
  s.turn = "opponent";
  s.tricks = [{ leader: "opponent" }];
  const a = chooseOpponentAction(s, () => 0.5);
  s.original.player = ["1E", "1B", "7O"].map(card);
  s.hands.player = [...s.original.player];
  assert.deepEqual(
    chooseOpponentAction(s, () => 0.5),
    a,
  );
  assert.ok(opponentDelay(s, () => 0) >= 1800);
});
test("save validation rejects corrupt state and accepts a valid hand", () => {
  assert.equal(readGame("{broken"), null);
  assert.equal(readGame("{}"), null);
  const s = fixture();
  assert.deepEqual(readGame(JSON.stringify(s)), s);
  s.original.player[0] = { ...s.original.player[0], rank: 999 };
  assert.equal(readGame(JSON.stringify(s)), null);
});
test("500 full seeded matches terminate, conserve cards, restore every phase, and score once", () => {
  for (let seed = 1; seed <= 500; seed++) {
    const random = seeded(seed);
    let s = newGame(seed % 2 ? 15 : 30, random);
    let steps = 0;
    while (s.phase !== "matchEnd" && steps++ < 2500) {
      assert.ok(
        readGame(JSON.stringify(s)),
        `invalid save: seed ${seed} phase ${s.phase}`,
      );
      const before = s;
      const actor = decisionActor(s);
      if (actor) {
        const legal = legalActions(s, actor);
        assert.ok(legal.length);
        const action =
          actor === "opponent"
            ? chooseOpponentAction(s, random)!
            : legal[Math.floor(random() * legal.length)];
        s = act(s, actor, action);
      } else s = advance(s, random);
      assert.notEqual(s, before);
      assert.equal(s.revision, before.revision + 1);
      assert.ok(
        s.scores.player >= before.scores.player &&
          s.scores.opponent >= before.scores.opponent,
      );
      for (const p of ["player", "opponent"] as const)
        assert.equal(
          s.hands[p].length + s.tricks.filter((t) => t[p]).length,
          3,
        );
    }
    assert.equal(s.phase, "matchEnd", `seed ${seed}`);
    assert.ok(s.scores[s.winner!] >= s.target);
    assert.ok(readGame(JSON.stringify(s)));
  }
});
