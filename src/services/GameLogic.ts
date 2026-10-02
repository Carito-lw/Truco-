import { Card, SPANISH_DECK, Suit, shuffleDeck } from '../utils/trucoEngine';

export type PlayerRole = 'player' | 'opponent';
export type TrickResult = 'player' | 'opponent' | 'parda';

export interface PlayedTrickState {
  playerCard?: Card;
  opponentCard?: Card;
  winner?: TrickResult;
}

export interface EnvidoResult {
  winner: PlayerRole;
  playerPoints: number;
  opponentPoints: number;
  pointsAwarded: number;
  message: string;
}

export interface HandEvaluation {
  isOver: boolean;
  winner?: PlayerRole;
  pointsAwarded: number;
  message: string;
}

/**
 * GameLogic - Servicio centralizado que gestiona las reglas básicas del Truco Criollo:
 * 1. Barajado y reparto de cartas (3 cartas por jugador).
 * 2. Jerarquía y comparación de cartas criollas.
 * 3. Cálculo reglamentario de Envido y Flor.
 * 4. Flujo de turnos, manos (manos 1, 2, 3), pardas y escalada de apuestas (Truco, Retruco, Vale 4).
 * 5. Toma de decisiones y respuestas inteligentes para el rival de IA.
 */
export class GameLogic {
  public playerHand: Card[] = [];
  public opponentHand: Card[] = [];
  public playedTricks: PlayedTrickState[] = [{}, {}, {}];
  public currentTrickIndex: number = 0; // 0, 1, 2
  public isPlayerTurn: boolean = true;
  public isManoPlayer: boolean = true;

  // Truco escalation: 0 = sin cantar (1 pt), 1 = Truco (2 pts), 2 = Retruco (3 pts), 3 = Vale 4 (4 pts)
  public trucoLevel: number = 0;
  public pendingTrucoCall: 'TRUCO' | 'RETRUCO' | 'VALE4' | null = null;
  public whoCalledTruco: PlayerRole | null = null;

  // Envido & Flor flags
  public envidoResolved: boolean = false;
  public florCalled: boolean = false;

  constructor() {
    this.startNewHand(true);
  }

  /**
   * Baraja la baraja española de 40 cartas y reparte 3 cartas a cada jugador
   */
  public dealHands(): { playerHand: Card[]; opponentHand: Card[] } {
    const deck = shuffleDeck();
    this.playerHand = [deck[0], deck[1], deck[2]];
    this.opponentHand = [deck[3], deck[4], deck[5]];
    return {
      playerHand: [...this.playerHand],
      opponentHand: [...this.opponentHand],
    };
  }

  /**
   * Inicia una nueva mano reiniciando los trucos, niveles de apuesta y turnos
   */
  public startNewHand(firstHand = false): { playerHand: Card[]; opponentHand: Card[] } {
    if (!firstHand) {
      this.isManoPlayer = !this.isManoPlayer;
    }
    this.isPlayerTurn = this.isManoPlayer;
    this.playedTricks = [{}, {}, {}];
    this.currentTrickIndex = 0;
    this.trucoLevel = 0;
    this.pendingTrucoCall = null;
    this.whoCalledTruco = null;
    this.envidoResolved = false;
    this.florCalled = false;

    return this.dealHands();
  }

  /**
   * Compara el poder jerárquico de dos cartas según el reglamento oficial del Truco Criollo
   * Retorna 1 si cardA gana, -1 si cardB gana, 0 si hay parda
   */
  public compareCards(cardA: Card, cardB: Card): 1 | -1 | 0 {
    if (cardA.rank > cardB.rank) return 1;
    if (cardA.rank < cardB.rank) return -1;
    return 0;
  }

  /**
   * Calcula el puntaje de Envido y la presencia de Flor para una mano dada
   */
  public calculateEnvido(cards: Card[]): { points: number; hasFlor: boolean; florPoints: number } {
    const cardVal = (num: number) => (num >= 10 ? 0 : num);

    const suitBuckets: Record<Suit, number[]> = {
      espadas: [],
      bastos: [],
      oros: [],
      copas: [],
    };

    cards.forEach((c) => {
      suitBuckets[c.suit].push(cardVal(c.number));
    });

    let maxEnvido = 0;
    let hasFlor = false;
    let florPoints = 0;

    for (const suit of Object.keys(suitBuckets) as Suit[]) {
      const vals = suitBuckets[suit];
      if (vals.length === 3) {
        hasFlor = true;
        florPoints = 20 + vals[0] + vals[1] + vals[2];
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

  /**
   * Evalúa y resuelve el envite de Envido (Envido, Real Envido o Falta Envido)
   */
  public resolveEnvido(
    callType: 'ENVIDO' | 'REAL_ENVIDO' | 'FALTA_ENVIDO' | 'CANTAR_33',
    targetScore = 30,
    currentScoreNos = 18,
    currentScoreEllos = 14
  ): EnvidoResult {
    this.envidoResolved = true;

    const pEnv = this.calculateEnvido(this.playerHand).points;
    const oEnv = this.calculateEnvido(this.opponentHand).points;

    // En caso de empate de tantos, gana quien es Mano
    let winner: PlayerRole = 'player';
    if (pEnv > oEnv) {
      winner = 'player';
    } else if (oEnv > pEnv) {
      winner = 'opponent';
    } else {
      winner = this.isManoPlayer ? 'player' : 'opponent';
    }

    let pointsAwarded = 2;
    if (callType === 'REAL_ENVIDO') {
      pointsAwarded = 3;
    } else if (callType === 'FALTA_ENVIDO') {
      const leader = Math.max(currentScoreNos, currentScoreEllos);
      pointsAwarded = Math.max(1, targetScore - leader);
    }

    const message =
      winner === 'player'
        ? `¡Ganaste el Envido con ${pEnv} frente a ${oEnv}!`
        : `El rival ganó el Envido con ${oEnv} frente a tus ${pEnv}.`;

    return {
      winner,
      playerPoints: pEnv,
      opponentPoints: oEnv,
      pointsAwarded,
      message,
    };
  }

  /**
   * Resuelve el cante de Flor (3 puntos directos al poseedor)
   */
  public resolveFlor(): { winner: PlayerRole; points: number; message: string } {
    this.florCalled = true;
    this.envidoResolved = true;
    return {
      winner: 'player',
      points: 3,
      message: '¡Flor cantada y cobrada con 3 puntos reglamentarios!',
    };
  }

  /**
   * Registra una carta jugada por el jugador
   */
  public playPlayerCard(card: Card): { trickIndex: number; isTrickComplete: boolean } {
    this.playerHand = this.playerHand.filter((c) => c.id !== card.id);
    const trick = this.playedTricks[this.currentTrickIndex];
    trick.playerCard = card;

    const isTrickComplete = !!trick.opponentCard;
    if (isTrickComplete) {
      this.evaluateCurrentTrick();
    } else {
      this.isPlayerTurn = false;
    }

    return {
      trickIndex: this.currentTrickIndex,
      isTrickComplete,
    };
  }

  /**
   * La IA selecciona y juega la mejor carta de su mano
   */
  public playOpponentCard(targetPlayerCard?: Card): Card | null {
    if (this.opponentHand.length === 0) return null;

    let chosenCard: Card = this.opponentHand[0];

    if (targetPlayerCard) {
      // Buscar la carta más baja con la que gana la baza
      const winningCards = this.opponentHand
        .filter((c) => c.rank > targetPlayerCard.rank)
        .sort((a, b) => a.rank - b.rank);

      if (winningCards.length > 0) {
        chosenCard = winningCards[0];
      } else {
        // No puede matar la carta del jugador, tira su carta más baja
        const sorted = [...this.opponentHand].sort((a, b) => a.rank - b.rank);
        chosenCard = sorted[0];
      }
    } else {
      // Rival abre la mano: juega carta fuerte o media
      const sorted = [...this.opponentHand].sort((a, b) => b.rank - a.rank);
      chosenCard = sorted[0];
    }

    this.opponentHand = this.opponentHand.filter((c) => c.id !== chosenCard.id);
    const trick = this.playedTricks[this.currentTrickIndex];
    trick.opponentCard = chosenCard;

    const isTrickComplete = !!trick.playerCard;
    if (isTrickComplete) {
      this.evaluateCurrentTrick();
    } else {
      this.isPlayerTurn = true;
    }

    return chosenCard;
  }

  /**
   * Evalúa la baza actual (mano 1, 2 o 3)
   */
  public evaluateCurrentTrick(): TrickResult {
    const trick = this.playedTricks[this.currentTrickIndex];
    if (!trick.playerCard || !trick.opponentCard) return 'parda';

    const comp = this.compareCards(trick.playerCard, trick.opponentCard);
    let result: TrickResult = 'parda';
    if (comp === 1) result = 'player';
    else if (comp === -1) result = 'opponent';

    trick.winner = result;
    return result;
  }

  /**
   * Evalúa si la mano completa de Truco (al mejor de 3 bazas) ya tiene un ganador
   */
  public evaluateHand(): HandEvaluation {
    const tricks = this.playedTricks;
    const pWins = tricks.filter((t) => t.winner === 'player').length;
    const oWins = tricks.filter((t) => t.winner === 'opponent').length;
    const currentPoints = this.getTrucoPointsAtStake();

    // 1. Ganar 2 de las 3 bazas
    if (pWins === 2) {
      return { isOver: true, winner: 'player', pointsAwarded: currentPoints, message: 'Ganaste 2 de 3 manos.' };
    }
    if (oWins === 2) {
      return { isOver: true, winner: 'opponent', pointsAwarded: currentPoints, message: 'El rival ganó 2 de 3 manos.' };
    }

    // 2. Manejo de Parda en primera mano
    if (this.currentTrickIndex >= 1 && tricks[0].winner === 'parda') {
      if (tricks[1].winner === 'player') {
        return { isOver: true, winner: 'player', pointsAwarded: currentPoints, message: 'Parda en primera mano, definiste en segunda.' };
      }
      if (tricks[1].winner === 'opponent') {
        return { isOver: true, winner: 'opponent', pointsAwarded: currentPoints, message: 'Parda en primera mano, definió el rival en segunda.' };
      }
    }

    // 3. Manejo de Parda en segunda mano con ganador en primera
    if (this.currentTrickIndex >= 1 && tricks[1].winner === 'parda' && tricks[0].winner && tricks[0].winner !== 'parda') {
      const winner = tricks[0].winner === 'player' ? 'player' : 'opponent';
      return {
        isOver: true,
        winner,
        pointsAwarded: currentPoints,
        message: `Parda en segunda mano, manda el ganador de primera (${winner === 'player' ? 'Vos' : 'El rival'}).`,
      };
    }

    // 4. Manejo de 3 manos completadas
    if (this.currentTrickIndex >= 2 && tricks[2].winner !== undefined) {
      if (pWins > oWins) {
        return { isOver: true, winner: 'player', pointsAwarded: currentPoints, message: 'Ganaste la tercera mano decisiva.' };
      }
      if (oWins > pWins) {
        return { isOver: true, winner: 'opponent', pointsAwarded: currentPoints, message: 'El rival ganó la tercera mano decisiva.' };
      }
      // Si la tercera es parda y la primera tuvo ganador: primera manda
      if (tricks[0].winner && tricks[0].winner !== 'parda') {
        const winner = tricks[0].winner === 'player' ? 'player' : 'opponent';
        return {
          isOver: true,
          winner,
          pointsAwarded: currentPoints,
          message: `Parda en tercera mano, define el ganador de la primera mano (${winner === 'player' ? 'Vos' : 'El rival'}).`,
        };
      }
      // Triple parda: gana quien fue Mano
      const winner = this.isManoPlayer ? 'player' : 'opponent';
      return {
        isOver: true,
        winner,
        pointsAwarded: currentPoints,
        message: `Triple parda: define la ley de la Mano para ${winner === 'player' ? 'Vos' : 'el Rival'}.`,
      };
    }

    // Continúa la mano
    return { isOver: false, pointsAwarded: currentPoints, message: 'Mano en curso.' };
  }

  /**
   * Avanza a la siguiente baza (1 -> 2 -> 3) asignando el turno al ganador de la última baza
   */
  public advanceToNextTrick(): number {
    const lastWinner = this.playedTricks[this.currentTrickIndex]?.winner;
    if (this.currentTrickIndex < 2) {
      this.currentTrickIndex += 1;
    }

    if (lastWinner === 'player') {
      this.isPlayerTurn = true;
    } else if (lastWinner === 'opponent') {
      this.isPlayerTurn = false;
    } else {
      // Si fue parda, arranca quien es Mano
      this.isPlayerTurn = this.isManoPlayer;
    }

    return this.currentTrickIndex;
  }

  /**
   * Puntos en juego según la escalada actual de Truco
   */
  public getTrucoPointsAtStake(): number {
    switch (this.trucoLevel) {
      case 1:
        return 2; // Truco
      case 2:
        return 3; // Retruco
      case 3:
        return 4; // Vale 4
      default:
        return 1; // Sin cantar
    }
  }

  /**
   * Cante de Truco / Retruco / Vale 4
   */
  public callTruco(caller: PlayerRole): { level: number; callName: string } {
    this.whoCalledTruco = caller;
    if (this.trucoLevel === 0) {
      this.trucoLevel = 1;
      this.pendingTrucoCall = 'TRUCO';
      return { level: 1, callName: '¡TRUCO!' };
    } else if (this.trucoLevel === 1) {
      this.trucoLevel = 2;
      this.pendingTrucoCall = 'RETRUCO';
      return { level: 2, callName: '¡RETRUCO!' };
    } else {
      this.trucoLevel = 3;
      this.pendingTrucoCall = 'VALE4';
      return { level: 3, callName: '¡VALE 4!' };
    }
  }

  /**
   * Respuesta al cante: Quiero o No Quiero
   */
  public answerTruco(accepted: boolean): { isOver: boolean; winner?: PlayerRole; pointsAwarded: number } {
    const pointsAtStake = this.getTrucoPointsAtStake();
    const previousPoints = Math.max(1, pointsAtStake - 1);

    if (accepted) {
      this.pendingTrucoCall = null;
      return { isOver: false, pointsAwarded: pointsAtStake };
    } else {
      // Si no quiere, el que cantó se lleva los puntos anteriores
      const winner = this.whoCalledTruco === 'player' ? 'player' : 'opponent';
      return {
        isOver: true,
        winner,
        pointsAwarded: previousPoints,
      };
    }
  }

  /**
   * Decisión de la IA ante un cante del jugador
   */
  public decideOpponentAnswer(): { answer: 'QUIERO' | 'NO_QUIERO' | 'RETRUCO' | 'VALE4'; speech: string } {
    // Si la IA tiene cartas altas (ranks >= 10 como 1E, 1B, 7E, 7O, 3s)
    const strongCards = this.opponentHand.filter((c) => c.rank >= 10);

    if (strongCards.length >= 2 && this.trucoLevel === 1) {
      return { answer: 'RETRUCO', speech: '¡QUIERO RETRUCO, CARAJO!' };
    }
    if (strongCards.length >= 2 && this.trucoLevel === 2) {
      return { answer: 'VALE4', speech: '¡QUIERO VALE CUATRO!' };
    }
    if (strongCards.length >= 1 || Math.random() > 0.35) {
      return { answer: 'QUIERO', speech: '¡QUIERO, VENGAN ESOS TANTOS!' };
    }
    return { answer: 'NO_QUIERO', speech: '¡Me achico, son tuyas gaucho!' };
  }

  /**
   * Decisión de la IA ante un envite de Envido
   */
  public decideOpponentEnvidoAnswer(
    callType: 'ENVIDO' | 'REAL_ENVIDO' | 'FALTA_ENVIDO'
  ): { answer: 'QUIERO' | 'NO_QUIERO' | 'REAL_ENVIDO' | 'FALTA_ENVIDO'; speech: string } {
    const oppEnv = this.calculateEnvido(this.opponentHand);

    if (oppEnv.hasFlor) {
      return { answer: 'QUIERO', speech: '¡CON FLOR ME ACHICO AL ENVIDO!' };
    }

    if (callType === 'ENVIDO') {
      if (oppEnv.points >= 30) {
        return { answer: 'REAL_ENVIDO', speech: '¡QUIERO Y REAL ENVIDO!' };
      } else if (oppEnv.points >= 26 || Math.random() > 0.3) {
        return { answer: 'QUIERO', speech: '¡QUIERO EL ENVIDO!' };
      } else {
        return { answer: 'NO_QUIERO', speech: '¡No quiero, son tuyos!' };
      }
    } else if (callType === 'REAL_ENVIDO') {
      if (oppEnv.points >= 31) {
        return { answer: 'FALTA_ENVIDO', speech: '¡Y FALTA ENVIDO!' };
      } else if (oppEnv.points >= 28 || Math.random() > 0.5) {
        return { answer: 'QUIERO', speech: '¡QUIERO ESE REAL ENVIDO!' };
      } else {
        return { answer: 'NO_QUIERO', speech: '¡Paso, no quiero!' };
      }
    } else {
      // FALTA ENVIDO
      if (oppEnv.points >= 31) {
        return { answer: 'QUIERO', speech: '¡QUIERO LA FALTA!' };
      } else {
        return { answer: 'NO_QUIERO', speech: '¡Muy bravo, no quiero la falta!' };
      }
    }
  }

  /**
   * Acción de irse al mazo: otorga los puntos acumulados al adversario
   */
  public surrenderMazo(whoSurrendered: PlayerRole): HandEvaluation {
    const winner: PlayerRole = whoSurrendered === 'player' ? 'opponent' : 'player';
    const pointsAwarded = this.getTrucoPointsAtStake();
    return {
      isOver: true,
      winner,
      pointsAwarded,
      message: `${whoSurrendered === 'player' ? 'Te fuiste al mazo' : 'El rival se fue al mazo'}.`,
    };
  }
}
