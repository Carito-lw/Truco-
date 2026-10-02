import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ScreenType, ChatMessage } from '../types';
import { MesaTelemetry, GameTelemetryEvent } from '../components/MesaTelemetry';
import { Card, playSound, calculateEnvido } from '../utils/trucoEngine';
import { GameLogic } from '../services/GameLogic';
import { SpanishCardUI } from '../components/SpanishCardUI';
import { JerarquiaModal } from '../components/JerarquiaModal';

interface MesaEnVivoScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

interface PlayedTrick {
  playerCard?: Card;
  opponentCard?: Card;
  winner?: 'player' | 'opponent' | 'parda';
}

export const MesaEnVivoScreen: React.FC<MesaEnVivoScreenProps> = ({ onNavigate }) => {
  // Service instance of GameLogic
  const game = useMemo(() => new GameLogic(), []);

  // Chat scroll container ref
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Target points (30 para partido oficial)
  const targetPoints = 30;

  // Game scores (Nosotros vs Ellos)
  const [scoreNos, setScoreNos] = useState(16);
  const [scoreEllos, setScoreEllos] = useState(12);
  const [scoreFlash, setScoreFlash] = useState<'nos' | 'ellos' | null>(null);

  // Hands dealt
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [opponentHand, setOpponentHand] = useState<Card[]>([]);

  // Round / Tricks state (Baza 1, Baza 2, Baza 3)
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [playedTricks, setPlayedTricks] = useState<PlayedTrick[]>([{}, {}, {}]);
  const [roundWinners, setRoundWinners] = useState<('NOS' | 'ELLOS' | 'PARDA')[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [isManoPlayer, setIsManoPlayer] = useState<boolean>(true);
  const [isWaitingTrickEnd, setIsWaitingTrickEnd] = useState<boolean>(false);

  // Truco and Envido states
  const [trucoLevel, setTrucoLevel] = useState<number>(0);
  const [envidoResolved, setEnvidoResolved] = useState<boolean>(false);
  const [pendingCall, setPendingCall] = useState<string | null>(null);
  const [apuestaState, setApuestaState] = useState<string>('Sin cantar (1 pt)');

  // Match Over State (THE ONLY MODAL: when someone reaches 30 points)
  const [matchOver, setMatchOver] = useState<boolean>(false);
  const [matchWinner, setMatchWinner] = useState<'player' | 'opponent' | null>(null);

  // Opponent interaction
  const [opponentTimer, setOpponentTimer] = useState<number>(5);
  const [speechBubbleText, setSpeechBubbleText] = useState('¡QUIERO!');
  const [speechBubbleVisible, setSpeechBubbleVisible] = useState(false);

  // Floating Overlays: 'none' | 'chat' | 'telemetry'
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'chat' | 'telemetry'>('none');
  const [isJerarquiaModalOpen, setIsJerarquiaModalOpen] = useState(false);

  // Chat input
  const [chatInput, setChatInput] = useState('');

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ElTape_99', text: '¡Buenas tardes gaucho! A ver qué tenés.', isMe: false, time: '15:40' },
    { id: '2', sender: 'Vos', text: 'Buenas y santas, a jugar criollo y con respeto.', isMe: true, time: '15:41' },
    { id: '3', sender: 'ElTape_99', text: '¡A la pesca no se va en mi mesa!', isMe: false, time: '15:42' },
  ]);

  // Telemetry events
  const [telemetryEvents, setTelemetryEvents] = useState<GameTelemetryEvent[]>([
    {
      id: 'init-1',
      type: 'Envido',
      callName: 'Real Envido',
      caller: 'Vos',
      winner: 'Vos',
      points: 3,
      timestamp: '15:42:10',
      detail: 'Ganaste con 33 de mano frente a 29.',
    },
    {
      id: 'init-2',
      type: 'Truco',
      callName: 'Truco',
      caller: 'ElTape_99',
      winner: 'Vos',
      points: 2,
      timestamp: '15:42:35',
      detail: 'Parda en primera, definiste con Ancho de Bastos en segunda.',
    },
  ]);

  // Initial Deal on component mount
  useEffect(() => {
    startNewHand(false);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, activeOverlay]);

  // Timer countdown for opponent realism
  useEffect(() => {
    const timer = setInterval(() => {
      setOpponentTimer((prev) => (prev > 1 ? prev - 1 : 7));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  // Deals a fresh 3-card hand using GameLogic
  const startNewHand = (changeMano = true) => {
    const { playerHand: pHand, opponentHand: oHand } = game.startNewHand(!changeMano);
    setPlayerHand(pHand);
    setOpponentHand(oHand);
    setPlayedTricks([{}, {}, {}]);
    setRoundWinners([]);
    setCurrentRound(1);
    setPendingCall(null);
    setTrucoLevel(0);
    setEnvidoResolved(false);
    setApuestaState('Sin cantar (1 pt)');
    setSpeechBubbleVisible(false);
    setIsWaitingTrickEnd(false);
    setIsManoPlayer(game.isManoPlayer);
    setIsPlayerTurn(game.isPlayerTurn);

    playSound('chips');

    // If opponent is Mano, opponent plays their opening move after brief natural delay
    if (!game.isPlayerTurn) {
      setOpponentTimer(3);
      setTimeout(() => {
        executeOpponentOpening();
      }, 900);
    }
  };

  // Opponent opening decision when Mano
  const executeOpponentOpening = () => {
    if (matchOver) return;
    const oppEnv = game.calculateEnvido(game.opponentHand);
    // Opponent can call envido if strong
    if (oppEnv.points >= 28 && !game.envidoResolved && Math.random() > 0.45) {
      setPendingCall('ENVIDO');
      setSpeechBubbleText('¡ENVIDO!');
      setSpeechBubbleVisible(true);
      playSound('canto');
      handleSendChat('¡ENVIDO!', false, 'ElTape_99');
    } else {
      executeOpponentCardPlay();
    }
  };

  // Resumes trick card play after an Envido, Flor, or Truco call without getting stuck
  const resumeTrickPlay = (delayMs = 900) => {
    setTimeout(() => {
      setSpeechBubbleVisible(false);
      const currentTrick = game.playedTricks[game.currentTrickIndex] || {};

      // If opponent already threw a card in this trick, it's player's turn to answer
      if (currentTrick.opponentCard && !currentTrick.playerCard) {
        game.isPlayerTurn = true;
        setIsPlayerTurn(true);
        setIsWaitingTrickEnd(false);
      }
      // If player already threw a card, opponent must answer
      else if (currentTrick.playerCard && !currentTrick.opponentCard) {
        game.isPlayerTurn = false;
        setIsPlayerTurn(false);
        setIsWaitingTrickEnd(false);
        setOpponentTimer(3);
        setTimeout(() => {
          executeOpponentCardPlay(currentTrick.playerCard);
        }, 600);
      }
      // If neither has played a card in this trick yet: Mano plays first!
      else {
        if (game.isManoPlayer) {
          game.isPlayerTurn = true;
          setIsPlayerTurn(true);
          setIsWaitingTrickEnd(false);
        } else {
          game.isPlayerTurn = false;
          setIsPlayerTurn(false);
          setIsWaitingTrickEnd(false);
          setOpponentTimer(3);
          setTimeout(() => {
            executeOpponentCardPlay();
          }, 600);
        }
      }
    }, delayMs);
  };

  // User player plays a card directly to the table (NO POPUPS)
  const handlePlayCard = (card: Card) => {
    if (!isPlayerTurn || isWaitingTrickEnd || matchOver) return;

    playSound('card');

    const result = game.playPlayerCard(card);
    setPlayerHand([...game.playerHand]);
    setPlayedTricks([...game.playedTricks]);

    if (result.isTrickComplete) {
      evaluateTrick();
    } else {
      setIsPlayerTurn(false);
      setOpponentTimer(3);
      setTimeout(() => {
        executeOpponentCardPlay(card);
      }, 700);
    }
  };

  // Opponent plays a card directly to the table (NO POPUPS)
  const executeOpponentCardPlay = (playerPlayedCard?: Card) => {
    if (game.opponentHand.length === 0 || matchOver) return;

    game.playOpponentCard(playerPlayedCard);
    playSound('card');

    setOpponentHand([...game.opponentHand]);
    setPlayedTricks([...game.playedTricks]);

    const currentTrick = game.playedTricks[game.currentTrickIndex];
    if (currentTrick.playerCard && currentTrick.opponentCard) {
      evaluateTrick();
    } else {
      setIsPlayerTurn(game.isPlayerTurn);
    }
  };

  // Evaluate who wins the trick (cards stay on table, updates winner pill)
  const evaluateTrick = () => {
    setIsWaitingTrickEnd(true);
    const trickWinner = game.evaluateCurrentTrick();
    setPlayedTricks([...game.playedTricks]);

    const winnerTag = trickWinner === 'player' ? 'NOS' : trickWinner === 'opponent' ? 'ELLOS' : 'PARDA';

    // Brief delay to let the player view both cards clearly
    setTimeout(() => {
      setRoundWinners((prev) => {
        const next = [...prev];
        next[game.currentTrickIndex] = winnerTag;
        return next;
      });

      const handEval = game.evaluateHand();
      if (handEval.isOver && handEval.winner) {
        setIsWaitingTrickEnd(false);
        finishHand(handEval.winner, handEval.pointsAwarded, handEval.message);
      } else {
        const nextTrickIdx = game.advanceToNextTrick();
        setCurrentRound(nextTrickIdx + 1);
        setIsWaitingTrickEnd(false);
        setIsPlayerTurn(game.isPlayerTurn);

        if (!game.isPlayerTurn) {
          setOpponentTimer(3);
          setTimeout(() => {
            executeOpponentCardPlay();
          }, 800);
        }
      }
    }, 900);
  };

  // Finalize hand, update score, and AUTOMATICALLY proceed to next hand (NO BUTTON CLICKING)
  const finishHand = (winner: 'player' | 'opponent', points: number, message: string) => {
    let nextScoreNos = scoreNos;
    let nextScoreEllos = scoreEllos;

    if (winner === 'player') {
      playSound('applause');
      nextScoreNos = Math.min(targetPoints, scoreNos + points);
      setScoreNos(nextScoreNos);
      setScoreFlash('nos');
    } else {
      playSound('tap');
      nextScoreEllos = Math.min(targetPoints, scoreEllos + points);
      setScoreEllos(nextScoreEllos);
      setScoreFlash('ellos');
    }

    setTimeout(() => setScoreFlash(null), 1800);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTelemetryEvents((prev) => [
      {
        id: `evt-${Date.now()}`,
        type: 'Truco',
        callName: game.trucoLevel === 3 ? 'Vale 4' : game.trucoLevel === 2 ? 'Retruco' : 'Truco',
        caller: winner === 'player' ? 'Vos' : 'ElTape_99',
        winner: winner === 'player' ? 'Vos' : 'ElTape_99',
        points,
        timestamp: timeStr,
        detail: message,
      },
      ...prev,
    ]);

    // Check if the entire match reached 30 points (THE ONLY EXCEPTION where user starts a new match)
    if (nextScoreNos >= targetPoints || nextScoreEllos >= targetPoints) {
      setTimeout(() => {
        setMatchOver(true);
        setMatchWinner(nextScoreNos >= targetPoints ? 'player' : 'opponent');
      }, 1000);
      return;
    }

    // AUTOMATIC PROGRESSION: Wait 2.2 seconds so player sees final trick and score, then deal next hand
    setTimeout(() => {
      startNewHand(true);
    }, 2200);
  };

  // Restart match from scratch
  const restartMatch = () => {
    setScoreNos(0);
    setScoreEllos(0);
    setMatchOver(false);
    setMatchWinner(null);
    setScoreFlash(null);
    startNewHand(false);
  };

  // Handle action calls (Truco, Envido, Flor, Quiero, No Quiero)
  const handleActionCall = (action: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (action === 'QUIERO') {
      playSound('canto');
      setSpeechBubbleVisible(true);

      // Answering Envido
      if (pendingCall === 'ENVIDO' || pendingCall === 'REAL_ENVIDO' || pendingCall === 'FALTA_ENVIDO') {
        const callType = pendingCall === 'FALTA_ENVIDO' ? 'FALTA_ENVIDO' : pendingCall === 'REAL_ENVIDO' ? 'REAL_ENVIDO' : 'ENVIDO';
        const envRes = game.resolveEnvido(callType, targetPoints, scoreNos, scoreEllos);
        setEnvidoResolved(true);

        if (envRes.winner === 'player') {
          setScoreNos((prev) => Math.min(targetPoints, prev + envRes.pointsAwarded));
          setScoreFlash('nos');
          setSpeechBubbleText(`¡Son buenas tus ${envRes.playerPoints}!`);
        } else {
          setScoreEllos((prev) => Math.min(targetPoints, prev + envRes.pointsAwarded));
          setScoreFlash('ellos');
          setSpeechBubbleText(`¡Tengo ${envRes.opponentPoints}, son mejores!`);
        }
        setTimeout(() => setScoreFlash(null), 1800);
        setPendingCall(null);
        handleSendChat(`¡Quiero! Tengo ${envRes.playerPoints} de tanto.`);
        setTelemetryEvents((prev) => [
          {
            id: `evt-${Date.now()}`,
            type: 'Envido',
            callName: callType,
            caller: 'ElTape_99',
            winner: envRes.winner === 'player' ? 'Vos' : 'ElTape_99',
            points: envRes.pointsAwarded,
            timestamp: timeStr,
            detail: envRes.message,
          },
          ...prev,
        ]);

        // CRUCIAL: Resume card play so the game doesn't get stuck!
        resumeTrickPlay(1100);
        return;
      }

      // Answering Truco
      game.answerTruco(true);
      setTrucoLevel(game.trucoLevel);
      setApuestaState(
        game.trucoLevel === 3
          ? '¡VALE 4! (4 pts)'
          : game.trucoLevel === 2
          ? '¡RETRUCO! (3 pts)'
          : '¡TRUCO! (2 pts)'
      );
      setSpeechBubbleText('¡SE JUEGA!');
      setPendingCall(null);
      handleSendChat('¡QUIERO! ¡Vengan esos tantos!');

      // Resume card play after answering Truco
      resumeTrickPlay(1000);
    } else if (action === 'NO_QUIERO') {
      playSound('tap');
      setSpeechBubbleVisible(true);

      // Refusing Envido
      if (pendingCall === 'ENVIDO' || pendingCall === 'REAL_ENVIDO' || pendingCall === 'FALTA_ENVIDO') {
        setEnvidoResolved(true);
        const pts = pendingCall === 'FALTA_ENVIDO' ? 2 : 1;
        setScoreEllos((prev) => Math.min(targetPoints, prev + pts));
        setScoreFlash('ellos');
        setTimeout(() => setScoreFlash(null), 1800);
        setSpeechBubbleText('¡Son míos los tantos!');
        setPendingCall(null);
        handleSendChat('No quiero.');

        // Resume card play
        resumeTrickPlay(1000);
        return;
      }

      // Refusing Truco
      setSpeechBubbleText('¡Te achicaste!');
      handleSendChat('No quiero.');
      const res = game.answerTruco(false);
      finishHand('opponent', res.pointsAwarded, 'No quisiste el cante.');
    } else if (action === 'VALE4' || action === 'RETRUCO' || action === 'TRUCO') {
      playSound('canto');
      const callInfo = game.callTruco('player');
      setTrucoLevel(callInfo.level);
      setApuestaState(`${callInfo.callName} (Esperando)`);
      handleSendChat(`¡${callInfo.callName}!`);

      // Rival responds
      setTimeout(() => {
        const aiAnswer = game.decideOpponentAnswer();
        if (aiAnswer.answer === 'QUIERO') {
          game.answerTruco(true);
          setSpeechBubbleText(aiAnswer.speech);
          setSpeechBubbleVisible(true);
          setApuestaState(`${callInfo.callName} (${game.getTrucoPointsAtStake()} pts)`);
          setPendingCall(null);
          resumeTrickPlay(1000);
        } else if (aiAnswer.answer === 'NO_QUIERO') {
          setSpeechBubbleText(aiAnswer.speech);
          setSpeechBubbleVisible(true);
          const res = game.answerTruco(false);
          finishHand('player', res.pointsAwarded, 'El rival no quiso el cante.');
        } else if (aiAnswer.answer === 'RETRUCO' || aiAnswer.answer === 'VALE4') {
          game.callTruco('opponent');
          setSpeechBubbleText(aiAnswer.speech);
          setSpeechBubbleVisible(true);
          setPendingCall(aiAnswer.answer);
          setApuestaState(`${aiAnswer.answer} (${game.getTrucoPointsAtStake()} pts)`);
        }
      }, 700);
    } else if (action === 'FLOR') {
      playSound('canto');
      const florRes = game.resolveFlor();
      setSpeechBubbleText('¡CON FLOR!');
      setSpeechBubbleVisible(true);
      handleSendChat('¡CANTAR FLOR!');
      setScoreNos((prev) => Math.min(targetPoints, prev + florRes.points));
      setScoreFlash('nos');
      setTimeout(() => setScoreFlash(null), 1800);
      setEnvidoResolved(true);
      resumeTrickPlay(1000);
    } else if (action === 'ENVIDO' || action === 'REAL_ENVIDO' || action === 'FALTA_ENVIDO' || action === 'CANTAR_33') {
      playSound('canto');
      if (action === 'CANTAR_33') {
        const pEnv = game.calculateEnvido(playerHand).points;
        handleSendChat(`¡Tengo ${pEnv} de tanto!`);
        return;
      }

      const callType = action === 'FALTA_ENVIDO' ? 'FALTA_ENVIDO' : action === 'REAL_ENVIDO' ? 'REAL_ENVIDO' : 'ENVIDO';
      handleSendChat(`¡${action.replace('_', ' ')}!`);

      // Rival responds
      const oppDecision = game.decideOpponentEnvidoAnswer(callType);
      setSpeechBubbleText(oppDecision.speech);
      setSpeechBubbleVisible(true);

      if (oppDecision.answer === 'NO_QUIERO') {
        const pointsAwarded = callType === 'FALTA_ENVIDO' ? 2 : 1;
        setEnvidoResolved(true);
        setScoreNos((prev) => Math.min(targetPoints, prev + pointsAwarded));
        setScoreFlash('nos');
        setTimeout(() => setScoreFlash(null), 1800);

        // Resume card play after opponent declines envido
        resumeTrickPlay(1100);
      } else {
        const envRes = game.resolveEnvido(callType, targetPoints, scoreNos, scoreEllos);
        setEnvidoResolved(true);

        if (envRes.winner === 'player') {
          setScoreNos((prev) => Math.min(targetPoints, prev + envRes.pointsAwarded));
          setScoreFlash('nos');
        } else {
          setScoreEllos((prev) => Math.min(targetPoints, prev + envRes.pointsAwarded));
          setScoreFlash('ellos');
        }
        setTimeout(() => setScoreFlash(null), 1800);

        // Resume card play after opponent accepts envido
        resumeTrickPlay(1200);
      }
    }
  };

  const handleSendChat = (text: string, isSystem = false, customSender = 'Vos') => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      sender: isSystem ? 'Sistema' : customSender,
      isMe: !isSystem && customSender === 'Vos',
      isSystem,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    if (!isSystem && customSender === 'Vos') {
      setTimeout(() => {
        const responses = [
          '¡Mirá con lo que viene!',
          '¡Esa carta la tenía yo marcada!',
          '¡Abran cancha que viene con espadas!',
          'Bien jugado gaucho, pero todavía falta.',
          '¡Juegue callado que el truco se juega en la mesa!',
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-opp-${Date.now()}`,
            sender: 'ElTape_99',
            isMe: false,
            text: randomResponse,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 1100);
    }
  };

  // Calculated Envido
  const currentEnvido = calculateEnvido(playerHand);

  return (
    <div className="w-full h-full max-w-5xl mx-auto px-2 py-1 flex flex-col justify-between overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* 1. MATCH OVER MODAL (The ONLY modal in the entire game: at 30 points)    */}
      {/* ========================================================================= */}
      {matchOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container border-2 border-secondary p-5 rounded-2xl max-w-sm w-full text-center shadow-2xl animate-fade-in">
            <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-3xl">
                {matchWinner === 'player' ? 'emoji_events' : 'sentiment_dissatisfied'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-on-surface">
              {matchWinner === 'player' ? '¡CAMPEÓN DE LA MESA FEDERAL!' : '¡PARTIDO PARA EL RIVAL!'}
            </h2>
            <p className="text-secondary mt-1 font-semibold text-xs">
              {matchWinner === 'player'
                ? `Alcanzaste los ${targetPoints} tantos reglamentarios.`
                : `ElTape_99 sumó ${scoreEllos} tantos frente a tus ${scoreNos}.`}
            </p>
            <div className="my-3 py-1.5 bg-surface-container-low rounded-xl flex justify-around text-base font-black">
              <span className="text-primary">Vos: {scoreNos} pts</span>
              <span className="text-secondary">Rival: {scoreEllos} pts</span>
            </div>
            <button
              onClick={restartMatch}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-secondary-container to-secondary text-on-secondary font-bold text-sm shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Comenzar Nueva Partida
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TOP BAR: Compact Scoreboard, Mano, Bazás tracker, Bet, Tool toggles    */}
      {/* ========================================================================= */}
      <header className="w-full bg-surface-container-low/95 px-2.5 py-1 rounded-xl border border-surface-container-high/60 shadow flex items-center justify-between gap-1.5 shrink-0">
        {/* Scores Plate */}
        <div className="flex items-center gap-1.5">
          {/* NOS (Vos) */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all ${
              scoreFlash === 'nos'
                ? 'bg-primary text-on-primary ring-2 ring-primary scale-105'
                : 'bg-surface-container border-primary/40'
            }`}
          >
            <span className="text-[10px] font-black uppercase text-primary">NOS (Vos)</span>
            <span className="text-base font-black text-primary leading-none">{scoreNos}</span>
            <span className="text-[9px] text-on-surface-variant font-semibold">/{targetPoints}</span>
          </div>

          <span className="text-[10px] font-black text-outline-variant">vs</span>

          {/* ELLOS (Rival) */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all ${
              scoreFlash === 'ellos'
                ? 'bg-secondary text-on-secondary ring-2 ring-secondary scale-105'
                : 'bg-surface-container border-secondary/40'
            }`}
          >
            <span className="text-[10px] font-black uppercase text-secondary">ELLOS</span>
            <span className="text-base font-black text-secondary leading-none">{scoreEllos}</span>
            <span className="text-[9px] text-on-surface-variant font-semibold">/{targetPoints}</span>
          </div>
        </div>

        {/* 3 Bazás tracker */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((idx) => {
            const res = roundWinners[idx];
            const isCurrent = currentRound === idx + 1 && !res;
            return (
              <div
                key={idx}
                className={`px-1.5 py-0.2 rounded text-[10px] font-black flex items-center gap-0.5 border ${
                  res === 'NOS'
                    ? 'bg-primary text-on-primary border-primary'
                    : res === 'ELLOS'
                    ? 'bg-secondary text-on-secondary border-secondary'
                    : res === 'PARDA'
                    ? 'bg-surface-bright text-secondary border-secondary/50'
                    : isCurrent
                    ? 'bg-surface-container-highest text-secondary border-secondary/70 animate-pulse'
                    : 'bg-surface-container text-outline-variant border-surface-container-high'
                }`}
              >
                <span>B{idx + 1}:</span>
                <span>{res || (isCurrent ? '•' : '-')}</span>
              </div>
            );
          })}
        </div>

        {/* Status: Mano & Current Bet */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-surface-container text-[10px] font-bold text-on-surface border border-surface-container-high">
            <span className="w-3 h-3 rounded-full bg-secondary text-on-secondary text-[8px] font-black flex items-center justify-center">
              M
            </span>
            <span>{isManoPlayer ? 'Sos Mano' : 'Rival Mano'}</span>
          </div>

          <div className="flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-secondary/15 text-secondary text-[10px] font-black border border-secondary/30">
            <span className="material-symbols-outlined text-[12px]">local_fire_department</span>
            <span>{apuestaState}</span>
          </div>

          {/* Quick Toggle: Chat */}
          <button
            onClick={() => setActiveOverlay(activeOverlay === 'chat' ? 'none' : 'chat')}
            className={`p-1 rounded-md border cursor-pointer transition-colors ${
              activeOverlay === 'chat'
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container text-on-surface border-surface-container-high hover:border-primary/40'
            }`}
            title="Abrir Chat Criollo"
          >
            <span className="material-symbols-outlined text-sm">forum</span>
          </button>

          {/* Quick Toggle: Jerarquía */}
          <button
            onClick={() => setIsJerarquiaModalOpen(true)}
            className="p-1 rounded-md bg-surface-container text-on-surface border border-surface-container-high hover:border-secondary/40 cursor-pointer"
            title="Jerarquía de cartas"
          >
            <span className="material-symbols-outlined text-sm">menu_book</span>
          </button>

          {/* Quick Toggle: Telemetría */}
          <button
            onClick={() => setActiveOverlay(activeOverlay === 'telemetry' ? 'none' : 'telemetry')}
            className={`p-1 rounded-md border cursor-pointer transition-colors ${
              activeOverlay === 'telemetry'
                ? 'bg-secondary text-on-secondary border-secondary'
                : 'bg-surface-container text-on-surface border-surface-container-high hover:border-secondary/40'
            }`}
            title="Telemetría"
          >
            <span className="material-symbols-outlined text-sm">insights</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. GREEN FELT ARENA (FITS 100% IN VIEWPORT, ZERO SCROLLING)              */}
      {/* ========================================================================= */}
      <main className="relative w-full flex-1 min-h-0 rounded-2xl bg-gradient-to-b from-[#092218] via-[#0b2f1f] to-[#071911] border-3 border-[#1c382b] p-1.5 shadow-2xl flex flex-col justify-between overflow-hidden my-1">
        {/* Felt textured pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#a5d0b7_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* TOP ROW: OPPONENT INFORMATION & CARDS IN HAND */}
        <div className="relative z-10 w-full flex items-center justify-between px-1 shrink-0">
          {/* Opponent Profile Badge */}
          <div className="flex items-center gap-1.5 bg-surface-container-lowest/85 px-2 py-0.5 rounded-full border border-surface-container-high shadow-md">
            <img
              className="w-6 h-6 rounded-full object-cover ring-1 ring-secondary/60"
              alt="ElTape_99"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDi-ocX96gJiMPz-AWwnrwVoGUmt6Yp0dI4pzw18_kMRAzkzVHtdHBKTDvHX1FE40AWOJUYV-jruF1KmG2ioH2tSrz_VSCEpXd1iefSQbmKaX-7kVDcei3mNi6OHjyZxwpFssFoXqHpnZrGPE_O4XSq3ewM_pGpvhkti97ClQsW8JTGjjpP1oobdUjQuX4zuNGJwOsm9iuDYKWOKV8Ju9Eg1yG3CVh99f0UUoaumloN0eGD2ouxVTs"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-bold text-on-surface">ElTape_99</span>
              <span className="text-[8px] text-secondary font-semibold">1,790 ELO</span>
            </div>
            <span className="text-[8px] font-bold text-error bg-error-container/40 px-1 rounded ml-0.5">
              {opponentTimer}s
            </span>
          </div>

          {/* Opponent Speech / Canto Bubble */}
          {speechBubbleVisible && (
            <div className="bg-secondary text-on-secondary px-2.5 py-0.2 rounded-full text-[11px] font-black shadow-lg flex items-center gap-1 animate-pulse border border-yellow-300">
              <span className="material-symbols-outlined text-[11px]">campaign</span>
              <span>{speechBubbleText}</span>
            </div>
          )}

          {/* Opponent Card Backs (remaining cards) */}
          <div className="flex items-center -space-x-1.5">
            {opponentHand.map((_, i) => (
              <div
                key={i}
                className="w-6 h-9 bg-surface-container-highest rounded border border-primary/40 shadow-sm flex items-center justify-center transform -rotate-3"
              >
                <div className="w-4 h-7 bg-primary-container/80 rounded border-transparent flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[10px] opacity-60">shield</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER TABLE: 3 BAZAS SIDE-BY-SIDE (RIVAL CARDS 100% VISIBLE & COMPACT)   */}
        {/* ========================================================================= */}
        <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center py-0.5">
          <div className="w-full max-w-3xl grid grid-cols-3 gap-1.5 sm:gap-3 px-0.5">
            {[0, 1, 2].map((bazaIdx) => {
              const trick = playedTricks[bazaIdx];
              const winner = roundWinners[bazaIdx];
              const isCurrent = currentRound === bazaIdx + 1 && !winner;

              return (
                <div
                  key={bazaIdx}
                  className={`flex flex-col items-center justify-between p-1 sm:p-1.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-surface-container-lowest/70 border-secondary/70 ring-1 ring-secondary/40 shadow-md'
                      : winner
                      ? 'bg-surface-container-lowest/50 border-surface-container-high/40'
                      : 'bg-surface-container-lowest/20 border-white/5 opacity-60'
                  }`}
                >
                  {/* Baza Header */}
                  <div className="w-full flex items-center justify-between mb-0.5 px-0.5">
                    <span className="text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-wider">
                      Baza {bazaIdx + 1}
                    </span>
                    {winner ? (
                      <span
                        className={`text-[8px] sm:text-[9px] font-black px-1.5 rounded-full ${
                          winner === 'NOS'
                            ? 'bg-primary text-on-primary'
                            : winner === 'ELLOS'
                            ? 'bg-secondary text-on-secondary'
                            : 'bg-surface-bright text-secondary'
                        }`}
                      >
                        {winner === 'NOS' ? 'Ganas Vos' : winner === 'ELLOS' ? 'Gana Rival' : 'Parda'}
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[8px] font-bold text-secondary animate-pulse">En juego</span>
                    ) : (
                      <span className="text-[8px] text-outline">Por jugar</span>
                    )}
                  </div>

                  {/* CARDS DISPLAY: RIVAL CARD & YOUR CARD SIDE-BY-SIDE */}
                  <div className="w-full flex items-center justify-around gap-1 my-0.5">
                    {/* Rival Card */}
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-black text-secondary uppercase mb-0.2">Rival</span>
                      {trick?.opponentCard ? (
                        <SpanishCardUI
                          card={trick.opponentCard}
                          size="sm"
                          isPlayable={false}
                          className="w-13 h-19 sm:w-15 sm:h-22 ring-1 ring-secondary/80 shadow"
                        />
                      ) : (
                        <div className="w-13 h-19 sm:w-15 sm:h-22 rounded-lg border border-dashed border-secondary/30 flex items-center justify-center text-[8px] text-secondary/40 text-center p-0.5 bg-surface-container-lowest/20">
                          {isCurrent && !isPlayerTurn ? 'Jugando...' : '...'}
                        </div>
                      )}
                    </div>

                    <div className="text-[9px] font-black text-white/30">vs</div>

                    {/* Vos Card */}
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-black text-primary uppercase mb-0.2">Vos</span>
                      {trick?.playerCard ? (
                        <SpanishCardUI
                          card={trick.playerCard}
                          size="sm"
                          isPlayable={false}
                          className="w-13 h-19 sm:w-15 sm:h-22 ring-1 ring-primary/80 shadow"
                        />
                      ) : (
                        <div className="w-13 h-19 sm:w-15 sm:h-22 rounded-lg border border-dashed border-primary/30 flex items-center justify-center text-[8px] text-primary/40 text-center p-0.5 bg-surface-container-lowest/20">
                          {isCurrent && isPlayerTurn && !isWaitingTrickEnd ? '¡Tirá!' : '...'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM SECTION: PLAYER HAND & TURN STATUS                                */}
        {/* ========================================================================= */}
        <div className="relative z-10 w-full flex flex-col items-center shrink-0">
          {/* Status Indicator & Envido Display */}
          <div className="mb-0.5 flex items-center gap-1.5">
            {isPlayerTurn && !isWaitingTrickEnd ? (
              <span className="bg-primary text-on-primary font-black text-[10px] px-2 py-0.2 rounded-full shadow animate-pulse flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px]">touch_app</span>
                ¡Tu turno! Tocá tu carta
              </span>
            ) : (
              <span className="bg-surface-container text-on-surface-variant font-bold text-[10px] px-2 py-0.2 rounded-full border border-surface-container-high">
                {isWaitingTrickEnd ? 'Evaluando baza...' : 'Turno de ElTape_99...'}
              </span>
            )}

            {/* Calculated Envido Tag */}
            <div className="bg-surface-container-lowest/90 px-1.5 py-0.2 rounded-full border border-surface-container-high text-[10px] flex items-center gap-1">
              <span className="material-symbols-outlined text-secondary text-[11px]">eco</span>
              <span className="text-on-surface-variant font-medium">Tanto:</span>
              <span className="font-black text-secondary">{currentEnvido.points}</span>
              {currentEnvido.hasFlor && (
                <span className="bg-primary text-on-primary text-[8px] px-1 rounded font-black uppercase animate-pulse">
                  ¡Flor!
                </span>
              )}
            </div>
          </div>

          {/* Player Hand Fan (3 cards max, reactive) */}
          <div className="flex items-end justify-center -space-x-2 sm:-space-x-3 pb-0.5">
            {playerHand.map((card, i) => (
              <SpanishCardUI
                key={card.id}
                card={card}
                size="md"
                onClick={() => handlePlayCard(card)}
                disabled={!isPlayerTurn || isWaitingTrickEnd || matchOver}
                isPlayable={isPlayerTurn && !isWaitingTrickEnd && !matchOver}
                className={`w-18 h-26 sm:w-22 sm:h-30 transition-transform duration-150 ${
                  i === 0 ? '-rotate-3' : i === 1 ? 'rotate-0' : 'rotate-3'
                }`}
              />
            ))}
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. ACTION CONTROL DOCK (DIRECTLY ACCESSIBLE, NEVER SCROLLS)               */}
      {/* ========================================================================= */}
      <section className="w-full bg-surface-container-low/95 p-1 rounded-xl border border-surface-container-high/60 shadow flex flex-col gap-1 shrink-0">
        {/* Primary Row: QUIERO, NO QUIERO, TRUCO/RETRUCO/VALE4, AL MAZO */}
        <div className="grid grid-cols-4 gap-1">
          {/* QUIERO */}
          <button
            onClick={() => handleActionCall('QUIERO')}
            disabled={!pendingCall || matchOver}
            className={`py-1 px-1 rounded-lg font-black text-xs tracking-tight shadow flex items-center justify-center gap-1 cursor-pointer transition-all ${
              pendingCall
                ? 'bg-primary text-on-primary hover:brightness-110 active:scale-95 animate-pulse ring-2 ring-primary-container'
                : 'bg-surface-container text-outline opacity-40 cursor-not-allowed'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>¡QUIERO!</span>
          </button>

          {/* NO QUIERO */}
          <button
            onClick={() => handleActionCall('NO_QUIERO')}
            disabled={!pendingCall || matchOver}
            className={`py-1 px-1 rounded-lg font-black text-xs tracking-tight shadow flex items-center justify-center gap-1 cursor-pointer border border-outline-variant/30 transition-all ${
              pendingCall
                ? 'bg-surface-container-highest text-on-surface hover:bg-surface-bright active:scale-95 ring-2 ring-error/50'
                : 'bg-surface-container text-outline opacity-40 cursor-not-allowed'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-sm">cancel</span>
            <span>NO QUIERO</span>
          </button>

          {/* TRUCO / RETRUCO / VALE 4 */}
          <button
            onClick={() => handleActionCall(trucoLevel === 0 ? 'TRUCO' : trucoLevel === 1 ? 'RETRUCO' : 'VALE4')}
            disabled={matchOver || trucoLevel >= 3}
            className="py-1 px-1 rounded-lg bg-gradient-to-r from-secondary-container to-secondary text-on-secondary font-black text-xs tracking-tight shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">local_fire_department</span>
            <span>{trucoLevel === 0 ? '¡TRUCO!' : trucoLevel === 1 ? '¡RETRUCO!' : '¡VALE 4!'}</span>
          </button>

          {/* AL MAZO: returns to Lobby */}
          <button
            onClick={() => onNavigate('lobby-de-salas')}
            className="py-1 px-1 rounded-lg bg-error-container text-on-error-container font-black text-xs tracking-tight shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">layers_clear</span>
            <span>AL MAZO</span>
          </button>
        </div>

        {/* Secondary Row: ENVIDO, REAL ENVIDO, FALTA ENVIDO, FLOR, CANTAR */}
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => handleActionCall('ENVIDO')}
            disabled={envidoResolved || matchOver}
            className={`py-0.5 px-1 rounded font-black text-[10px] transition-colors cursor-pointer border ${
              !envidoResolved
                ? 'bg-secondary-container text-on-secondary-container border-secondary/40 hover:brightness-110'
                : 'bg-surface-container text-outline opacity-40 cursor-not-allowed border-surface-container-high'
            }`}
            type="button"
          >
            ENVIDO (2)
          </button>

          <button
            onClick={() => handleActionCall('REAL_ENVIDO')}
            disabled={envidoResolved || matchOver}
            className={`py-0.5 px-1 rounded font-black text-[10px] transition-colors cursor-pointer border ${
              !envidoResolved
                ? 'bg-surface-container text-secondary border-secondary/20 hover:bg-surface-container-high'
                : 'bg-surface-container text-outline opacity-40 cursor-not-allowed border-surface-container-high'
            }`}
            type="button"
          >
            REAL (3)
          </button>

          <button
            onClick={() => handleActionCall('FALTA_ENVIDO')}
            disabled={envidoResolved || matchOver}
            className={`py-0.5 px-1 rounded font-black text-[10px] transition-colors cursor-pointer border ${
              !envidoResolved
                ? 'bg-surface-container text-secondary border-secondary/20 hover:bg-surface-container-high'
                : 'bg-surface-container text-outline opacity-40 cursor-not-allowed border-surface-container-high'
            }`}
            type="button"
          >
            FALTA
          </button>

          <button
            onClick={() => handleActionCall('FLOR')}
            disabled={envidoResolved || !currentEnvido.hasFlor || matchOver}
            className={`py-0.5 px-1 rounded font-black text-[10px] transition-colors flex items-center justify-center gap-0.5 cursor-pointer border ${
              currentEnvido.hasFlor && !envidoResolved
                ? 'bg-primary-container text-primary border-primary/40 animate-pulse'
                : 'bg-surface-container text-outline opacity-40 cursor-not-allowed border-surface-container-high'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[10px]">filter_vintage</span>
            <span>FLOR (3)</span>
          </button>

          <button
            onClick={() => handleActionCall('CANTAR_33')}
            disabled={matchOver}
            className="py-0.5 px-1 rounded bg-surface-container text-on-surface-variant font-black text-[10px] hover:bg-surface-container-high transition-colors flex items-center justify-center gap-0.5 cursor-pointer border border-outline-variant/30"
            type="button"
          >
            <span className="material-symbols-outlined text-[10px]">record_voice_over</span>
            <span>CANTAR {currentEnvido.points}</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FLOATING OVERLAYS: CHAT & TELEMETRY (DOES NOT DEFORM THE TABLE)        */}
      {/* ========================================================================= */}
      {activeOverlay === 'chat' && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:justify-end p-2 sm:p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-surface-container-low p-3 rounded-2xl border border-primary/40 shadow-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-surface-container-high">
              <span className="font-bold text-xs text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">forum</span>
                Charla con ElTape_99
              </span>
              <button
                onClick={() => setActiveOverlay('none')}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer text-xs font-bold"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Chat Feed */}
            <div ref={chatScrollRef} className="max-h-44 overflow-y-auto space-y-1 text-xs pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-1.5 rounded-lg ${
                    m.isSystem
                      ? 'bg-surface-container-lowest text-secondary text-center font-semibold'
                      : m.isMe
                      ? 'bg-primary-container/40 text-primary border border-primary/20'
                      : 'bg-surface-container text-on-surface border border-surface-container-high/40'
                  }`}
                >
                  {!m.isSystem && <span className="font-bold mr-1">{m.sender}:</span>}
                  <span>{m.text}</span>
                </div>
              ))}
            </div>

            {/* Quick Phrases */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 text-xs">
              {['¡Tocá y cantá!', '¡A la pesca!', 'Mano a mano...', '¡Pida caña!'].map((phrase) => (
                <button
                  key={phrase}
                  onClick={() => handleSendChat(phrase)}
                  className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface whitespace-nowrap cursor-pointer text-[10px]"
                >
                  {phrase}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Escribí al rival..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendChat(chatInput);
                }}
                className="flex-1 bg-surface-container-lowest text-xs text-on-surface px-2 py-1 rounded-lg border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-secondary"
              />
              <button
                onClick={() => handleSendChat(chatInput)}
                className="px-2.5 py-1 rounded-lg bg-secondary text-on-secondary text-xs font-bold cursor-pointer"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TELEMETRY OVERLAY */}
      {activeOverlay === 'telemetry' && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
          <div className="w-full max-w-xl bg-surface-container-low p-4 rounded-2xl border border-secondary/40 shadow-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-surface-container-high">
              <span className="font-bold text-sm text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-base">insights</span>
                Telemetría y Registro Táctico
              </span>
              <button
                onClick={() => setActiveOverlay('none')}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer text-xs font-bold"
              >
                ✕ Cerrar
              </button>
            </div>
            <MesaTelemetry events={telemetryEvents} />
          </div>
        </div>
      )}

      {/* Rules Hierarchy Modal */}
      <JerarquiaModal
        isOpen={isJerarquiaModalOpen}
        onClose={() => setIsJerarquiaModalOpen(false)}
      />
    </div>
  );
};
