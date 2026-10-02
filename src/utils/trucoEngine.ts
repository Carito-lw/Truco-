export type Suit = 'espadas' | 'bastos' | 'oros' | 'copas';

export interface Card {
  id: string;
  suit: Suit;
  number: number;
  rank: number; // Higher is stronger: 14 = 1 de Espada ... 1 = 4s
  name: string;
  shortName: string;
  tierTag?: string;
}

// 40 cards of the Spanish Deck with Argentine Truco hierarchy
export const SPANISH_DECK: Card[] = [
  // 1s
  { id: '1E', suit: 'espadas', number: 1, rank: 14, name: 'Ancho de Espadas', shortName: '1E', tierTag: '1º MACHO' },
  { id: '1B', suit: 'bastos', number: 1, rank: 13, name: 'Ancho de Bastos', shortName: '1B', tierTag: '2º BRAVA' },
  { id: '1O', suit: 'oros', number: 1, rank: 8, name: 'Uno de Oros', shortName: '1O' },
  { id: '1C', suit: 'copas', number: 1, rank: 8, name: 'Uno de Copas', shortName: '1C' },

  // 7s
  { id: '7E', suit: 'espadas', number: 7, rank: 12, name: 'Siete de Espadas', shortName: '7E', tierTag: '3º BRAVO' },
  { id: '7O', suit: 'oros', number: 7, rank: 11, name: 'Siete de Oros', shortName: '7O', tierTag: '4º BRAVO' },
  { id: '7B', suit: 'bastos', number: 7, rank: 4, name: 'Siete de Bastos', shortName: '7B' },
  { id: '7C', suit: 'copas', number: 7, rank: 4, name: 'Siete de Copas', shortName: '7C' },

  // 3s
  { id: '3E', suit: 'espadas', number: 3, rank: 10, name: 'Tres de Espadas', shortName: '3E', tierTag: '5º TRES' },
  { id: '3B', suit: 'bastos', number: 3, rank: 10, name: 'Tres de Bastos', shortName: '3B', tierTag: '5º TRES' },
  { id: '3O', suit: 'oros', number: 3, rank: 10, name: 'Tres de Oros', shortName: '3O', tierTag: '5º TRES' },
  { id: '3C', suit: 'copas', number: 3, rank: 10, name: 'Tres de Copas', shortName: '3C', tierTag: '5º TRES' },

  // 2s
  { id: '2E', suit: 'espadas', number: 2, rank: 9, name: 'Dos de Espadas', shortName: '2E' },
  { id: '2B', suit: 'bastos', number: 2, rank: 9, name: 'Dos de Bastos', shortName: '2B' },
  { id: '2O', suit: 'oros', number: 2, rank: 9, name: 'Dos de Oros', shortName: '2O' },
  { id: '2C', suit: 'copas', number: 2, rank: 9, name: 'Dos de Copas', shortName: '2C' },

  // 12s
  { id: '12E', suit: 'espadas', number: 12, rank: 7, name: 'Rey de Espadas', shortName: '12E' },
  { id: '12B', suit: 'bastos', number: 12, rank: 7, name: 'Rey de Bastos', shortName: '12B' },
  { id: '12O', suit: 'oros', number: 12, rank: 7, name: 'Rey de Oros', shortName: '12O' },
  { id: '12C', suit: 'copas', number: 12, rank: 7, name: 'Rey de Copas', shortName: '12C' },

  // 11s
  { id: '11E', suit: 'espadas', number: 11, rank: 6, name: 'Caballo de Espadas', shortName: '11E' },
  { id: '11B', suit: 'bastos', number: 11, rank: 6, name: 'Caballo de Bastos', shortName: '11B' },
  { id: '11O', suit: 'oros', number: 11, rank: 6, name: 'Caballo de Oros', shortName: '11O' },
  { id: '11C', suit: 'copas', number: 11, rank: 6, name: 'Caballo de Copas', shortName: '11C' },

  // 10s
  { id: '10E', suit: 'espadas', number: 10, rank: 5, name: 'Sota de Espadas', shortName: '10E' },
  { id: '10B', suit: 'bastos', number: 10, rank: 5, name: 'Sota de Bastos', shortName: '10B' },
  { id: '10O', suit: 'oros', number: 10, rank: 5, name: 'Sota de Oros', shortName: '10O' },
  { id: '10C', suit: 'copas', number: 10, rank: 5, name: 'Sota de Copas', shortName: '10C' },

  // 6s
  { id: '6E', suit: 'espadas', number: 6, rank: 3, name: 'Seis de Espadas', shortName: '6E' },
  { id: '6B', suit: 'bastos', number: 6, rank: 3, name: 'Seis de Bastos', shortName: '6B' },
  { id: '6O', suit: 'oros', number: 6, rank: 3, name: 'Seis de Oros', shortName: '6O' },
  { id: '6C', suit: 'copas', number: 6, rank: 3, name: 'Seis de Copas', shortName: '6C' },

  // 5s
  { id: '5E', suit: 'espadas', number: 5, rank: 2, name: 'Cinco de Espadas', shortName: '5E' },
  { id: '5B', suit: 'bastos', number: 5, rank: 2, name: 'Cinco de Bastos', shortName: '5B' },
  { id: '5O', suit: 'oros', number: 5, rank: 2, name: 'Cinco de Oros', shortName: '5O' },
  { id: '5C', suit: 'copas', number: 5, rank: 2, name: 'Cinco de Copas', shortName: '5C' },

  // 4s
  { id: '4E', suit: 'espadas', number: 4, rank: 1, name: 'Cuatro de Espadas', shortName: '4E' },
  { id: '4B', suit: 'bastos', number: 4, rank: 1, name: 'Cuatro de Bastos', shortName: '4B' },
  { id: '4O', suit: 'oros', number: 4, rank: 1, name: 'Cuatro de Oros', shortName: '4O' },
  { id: '4C', suit: 'copas', number: 4, rank: 1, name: 'Cuatro de Copas', shortName: '4C' },
];

// Shuffle deck using Fisher-Yates
export function shuffleDeck(): Card[] {
  const deck = [...SPANISH_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Deal 3 cards to Player and 3 cards to Opponent
export function dealHands(): { playerHand: Card[]; opponentHand: Card[] } {
  const deck = shuffleDeck();
  return {
    playerHand: [deck[0], deck[1], deck[2]],
    opponentHand: [deck[3], deck[4], deck[5]],
  };
}

// Calculate Envido value for a 3-card hand
export function calculateEnvido(cards: Card[]): { points: number; hasFlor: boolean; florPoints?: number } {
  const cardVal = (num: number) => (num >= 10 ? 0 : num);

  // Group by suit
  const suits: Record<Suit, number[]> = {
    espadas: [],
    bastos: [],
    oros: [],
    copas: [],
  };

  cards.forEach((c) => {
    suits[c.suit].push(cardVal(c.number));
  });

  let maxEnvido = 0;
  let hasFlor = false;
  let florPoints = 0;

  for (const s of Object.keys(suits) as Suit[]) {
    const vals = suits[s];
    if (vals.length === 3) {
      hasFlor = true;
      florPoints = 20 + vals[0] + vals[1] + vals[2];
      // Flor hand also has an envido calculation (take highest pair)
      const sorted = [...vals].sort((a, b) => b - a);
      const pair = 20 + sorted[0] + sorted[1];
      if (pair > maxEnvido) maxEnvido = pair;
    } else if (vals.length === 2) {
      const pair = 20 + vals[0] + vals[1];
      if (pair > maxEnvido) maxEnvido = pair;
    } else if (vals.length === 1) {
      if (vals[0] > maxEnvido) maxEnvido = vals[0];
    }
  }

  return { points: maxEnvido, hasFlor, florPoints };
}

// Compare two cards: 1 if card1 wins, -1 if card2 wins, 0 if tie (parda)
export function compareCards(c1: Card, c2: Card): 1 | -1 | 0 {
  if (c1.rank > c2.rank) return 1;
  if (c1.rank < c2.rank) return -1;
  return 0;
}

// Web Audio sound effects synthesizer for tactile feedback
export function playSound(type: 'card' | 'chips' | 'applause' | 'canto' | 'tap') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    if (type === 'card' || type === 'tap') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'chips') {
      [800, 1200, 1600].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.03);
        gain.gain.setValueAtTime(0.15, now + i * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.03);
        osc.stop(now + i * 0.03 + 0.09);
      });
    } else if (type === 'canto') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.21);
    } else if (type === 'applause') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.31);
    }
  } catch (e) {
    // AudioContext not allowed or muted
  }
}
