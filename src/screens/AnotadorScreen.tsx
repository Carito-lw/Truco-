import React, { useState } from 'react';
import { ScreenType } from '../types';

interface AnotadorScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const AnotadorScreen: React.FC<AnotadorScreenProps> = () => {
  const [targetPoints, setTargetPoints] = useState<15 | 30>(30);
  const [scoreNosotros, setScoreNosotros] = useState(18);
  const [scoreEllos, setScoreEllos] = useState(12);
  const [voiceAssistantActive, setVoiceAssistantActive] = useState(false);
  const [gritosLog, setGritosLog] = useState([
    {
      id: 1,
      team: 'NOS',
      teamColor: 'primary',
      text: '"Envido cantado" (31 de espadas declarado por El Zorzal)',
      points: '+2 Pts ganados',
      pointColor: 'secondary',
    },
    {
      id: 2,
      team: 'ELLOS',
      teamColor: 'secondary',
      text: '"Real Envido... ¡Quiero!" (Respondido con 29)',
      points: 'No querido (1 pt)',
      pointColor: 'on-surface-variant',
    },
    {
      id: 3,
      team: 'NOS',
      teamColor: 'primary',
      text: '"¡Truco carajo!" — Primera parda, define matador en segunda.',
      points: '+2 Pts en juego',
      pointColor: 'primary',
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addPoints = (team: 'nosotros' | 'ellos', amount: number) => {
    if (team === 'nosotros') {
      const nextScore = Math.max(0, Math.min(targetPoints, scoreNosotros + amount));
      setScoreNosotros(nextScore);
      if (nextScore >= targetPoints) {
        showToast('¡Partida finalizada! ¡Victoria contundente de NOSOTROS!');
      }
    } else {
      const nextScore = Math.max(0, Math.min(targetPoints, scoreEllos + amount));
      setScoreEllos(nextScore);
      if (nextScore >= targetPoints) {
        showToast('¡Partida finalizada! ¡Victoria de ELLOS!');
      }
    }
  };

  const applyFaltaEnvido = (winningTeam: 'nosotros' | 'ellos') => {
    // In Truco, Falta Envido gives the points needed by the leading team to win the game (or to win the current chico)
    const leaderScore = Math.max(scoreNosotros, scoreEllos);
    const pointsNeeded = targetPoints - leaderScore;

    if (winningTeam === 'nosotros') {
      addPoints('nosotros', pointsNeeded);
      showToast(`¡Falta Envido otorgado a NOSOTROS (+${pointsNeeded} pts)!`);
    } else {
      addPoints('ellos', pointsNeeded);
      showToast(`¡Falta Envido otorgado a ELLOS (+${pointsNeeded} pts)!`);
    }
  };

  const handleResetMatch = () => {
    setScoreNosotros(0);
    setScoreEllos(0);
    showToast('Tanteador reiniciado a cero para un nuevo chico');
  };

  const handleClearGritos = () => {
    setGritosLog([]);
    showToast('Historial de mano activa limpiado');
  };

  // Helper to render clusters of matches
  const renderMatchstickBoxes = (totalPoints: number, team: 'nosotros' | 'ellos') => {
    // 6 boxes of 5 (for 30 points) or 3 boxes of 5 (for 15 points)
    const maxBoxes = targetPoints === 30 ? 6 : 3;
    const boxes = [];

    for (let boxIdx = 0; boxIdx < maxBoxes; boxIdx++) {
      const boxStart = boxIdx * 5;
      const pointsInThisBox = Math.max(0, Math.min(5, totalPoints - boxStart));

      if (pointsInThisBox === 0) {
        // Empty box slot
        boxes.push(
          <div
            key={boxIdx}
            className="relative w-full aspect-square border-2 border-dashed border-surface-container-high bg-surface-container-low/20 rounded-lg p-2 flex items-center justify-center opacity-30"
          >
            <span className="material-symbols-outlined text-surface-variant">add</span>
          </div>
        );
      } else {
        // Render 1 to 5 matchsticks
        // Sticks: 1: top, 2: right, 3: bottom, 4: left, 5: diagonal
        boxes.push(
          <div
            key={boxIdx}
            className="relative w-full aspect-square bg-surface-container-high/40 rounded-lg p-2 flex items-center justify-center shadow-sm border border-surface-container-high/40"
          >
            <svg className="w-full h-full text-secondary" fill="none" viewBox="0 0 100 100">
              {/* 1: Top */}
              {pointsInThisBox >= 1 && (
                <>
                  <line stroke="currentColor" strokeLinecap="round" strokeWidth="5" x1="20" x2="80" y1="20" y2="20" />
                  <circle cx="20" cy="20" fill="#ffb4ab" r="4.5" />
                </>
              )}
              {/* 2: Right */}
              {pointsInThisBox >= 2 && (
                <>
                  <line stroke="currentColor" strokeLinecap="round" strokeWidth="5" x1="80" x2="80" y1="20" y2="80" />
                  <circle cx="80" cy="20" fill="#ffb4ab" r="4.5" />
                </>
              )}
              {/* 3: Bottom */}
              {pointsInThisBox >= 3 && (
                <>
                  <line stroke="currentColor" strokeLinecap="round" strokeWidth="5" x1="80" x2="20" y1="80" y2="80" />
                  <circle cx="80" cy="80" fill="#ffb4ab" r="4.5" />
                </>
              )}
              {/* 4: Left */}
              {pointsInThisBox >= 4 && (
                <>
                  <line stroke="currentColor" strokeLinecap="round" strokeWidth="5" x1="20" x2="20" y1="80" y2="20" />
                  <circle cx="20" cy="80" fill="#ffb4ab" r="4.5" />
                </>
              )}
              {/* 5: Diagonal strike */}
              {pointsInThisBox >= 5 && (
                <>
                  <line stroke="#ffb3ad" strokeLinecap="round" strokeWidth="5" x1="22" x2="78" y1="22" y2="78" />
                  <circle cx="78" cy="78" fill="#ffb4ab" r="4.5" />
                </>
              )}
            </svg>
            <span
              className={`absolute bottom-1 right-2 font-label-sm text-[10px] ${
                pointsInThisBox === 5 ? 'text-on-surface-variant' : 'text-secondary font-bold'
              }`}
            >
              {boxStart + pointsInThisBox}
            </span>
          </div>
        );
      }
    }

    return boxes;
  };

  const getPhaseText = (score: number) => {
    if (targetPoints === 15) return 'A 15 Puntos';
    return score >= 15 ? 'En Las Buenas' : 'En Las Malas';
  };

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-secondary text-on-secondary px-space-lg py-space-sm rounded-xl shadow-2xl font-label-md font-bold flex items-center gap-space-xs animate-bounce">
          <span className="material-symbols-outlined text-title-md">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="w-full px-gutter-desktop py-space-xl">
        {/* Header Context Bar with Badges */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md mb-space-xl">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-sm mb-space-xs flex-wrap">
              <span className="px-space-sm py-0.5 rounded-full bg-primary-container text-primary font-label-sm uppercase tracking-widest font-bold">
                Herramienta de Asistencia Real
              </span>
              <span className="px-space-sm py-0.5 rounded-full bg-surface-container-high text-secondary font-label-sm uppercase tracking-wider font-bold">
                Fósforos Táctiles
              </span>
              <span className="flex items-center gap-1 text-on-surface-variant font-label-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Sincronización en Directo
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Anotador Digital &amp; Sala de Telemetría
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Lleva el tanteo reglamentario de tus partidas cara a cara con cálculo automático de cantes, fósforos criollos y análisis de picardía.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="flex items-center bg-surface-container-high p-1 rounded-xl shadow-inner border border-surface-container-highest">
              <button
                id="btn-target-15"
                onClick={() => setTargetPoints(15)}
                className={`px-space-md py-space-xs rounded-lg font-label-md transition-all cursor-pointer ${
                  targetPoints === 15
                    ? 'bg-secondary text-on-secondary font-bold shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                A 15 (Cortita)
              </button>
              <button
                id="btn-target-30"
                onClick={() => setTargetPoints(30)}
                className={`px-space-md py-space-xs rounded-lg font-label-md transition-all cursor-pointer ${
                  targetPoints === 30
                    ? 'bg-secondary text-on-secondary font-bold shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                A 30 (Completa)
              </button>
            </div>

            <button
              id="btn-voice-toggle"
              onClick={() => {
                setVoiceAssistantActive(!voiceAssistantActive);
                showToast(
                  !voiceAssistantActive
                    ? "Asistente por voz criollo activado. Escuchando cantes: 'Envido', 'Truco', 'Falta'..."
                    : 'Asistente por voz pausado.'
                );
              }}
              className={`flex items-center gap-space-xs px-space-md py-space-sm rounded-xl transition-colors shadow-sm cursor-pointer border border-secondary/30 ${
                voiceAssistantActive ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container hover:bg-surface-container-high text-secondary'
              }`}
            >
              <span className="material-symbols-outlined text-title-md">mic</span>
              <span className="font-label-md uppercase tracking-wider">Cantar Tantos</span>
            </button>

            <button
              id="btn-reset-match"
              onClick={handleResetMatch}
              className="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-error-container hover:bg-surface-container-highest text-on-error-container transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-title-md">restart_alt</span>
              <span className="font-label-md font-bold">Nuevo Chico</span>
            </button>
          </div>
        </div>

        {/* Main Dual Split Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl items-start">
          {/* LEFT & CENTER: Slate Scoreboard (8 cols) */}
          <section className="xl:col-span-8 flex flex-col gap-space-lg">
            <div className="relative w-full rounded-2xl bg-surface-container-lowest p-space-md md:p-space-lg shadow-2xl overflow-hidden border border-surface-container-high/40">
              <div className="absolute inset-0 bg-gradient-to-b from-primary-container/20 via-surface-container-lowest to-surface-container-low/40 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col gap-space-lg">
                {/* Headers: Column Names & Point Counters */}
                <div className="grid grid-cols-2 gap-space-md text-center">
                  {/* NOSOTROS */}
                  <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col items-center justify-between relative overflow-hidden border border-primary/20">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-label-sm uppercase tracking-widest text-primary font-bold">Local / Mano</span>
                      <span className="material-symbols-outlined text-primary text-title-md">stars</span>
                    </div>
                    <div className="my-space-xs flex flex-col items-center">
                      <span className="font-headline-lg text-headline-lg text-primary tracking-wider">NOSOTROS</span>
                      <div className="flex items-baseline gap-space-xs">
                        <span className="font-display-lg text-display-lg text-on-surface font-bold" id="score-nosotros">
                          {scoreNosotros}
                        </span>
                        <span className="font-label-md text-on-surface-variant" id="target-label-nos">
                          / {targetPoints}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-space-md py-0.5 rounded-full font-label-sm font-bold tracking-wide ${
                        scoreNosotros >= 15
                          ? 'bg-primary-container text-primary'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                      id="phase-nosotros"
                    >
                      {getPhaseText(scoreNosotros)}
                    </span>
                  </div>

                  {/* ELLOS */}
                  <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col items-center justify-between relative overflow-hidden border border-secondary/20">
                    <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-label-sm uppercase tracking-widest text-secondary font-bold">Visita / Pie</span>
                      <span className="material-symbols-outlined text-secondary text-title-md">shield</span>
                    </div>
                    <div className="my-space-xs flex flex-col items-center">
                      <span className="font-headline-lg text-headline-lg text-secondary tracking-wider">ELLOS</span>
                      <div className="flex items-baseline gap-space-xs">
                        <span className="font-display-lg text-display-lg text-on-surface font-bold" id="score-ellos">
                          {scoreEllos}
                        </span>
                        <span className="font-label-md text-on-surface-variant" id="target-label-ellos">
                          / {targetPoints}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-space-md py-0.5 rounded-full font-label-sm font-bold tracking-wide ${
                        scoreEllos >= 15
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-surface-container-high text-secondary'
                      }`}
                      id="phase-ellos"
                    >
                      {getPhaseText(scoreEllos)}
                    </span>
                  </div>
                </div>

                {/* Chalkboard Slate Matchstick Clusters */}
                <div className="bg-surface-container-low rounded-xl p-space-md md:p-space-lg shadow-inner relative border border-surface-container-high/30">
                  <div className="flex items-center justify-between pb-space-sm mb-space-md bg-surface-container px-space-md py-space-xs rounded-lg">
                    <div className="flex items-center gap-space-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-title-md">expand_more</span>
                      <span className="font-label-sm uppercase tracking-widest font-bold">Las Malas (1 a 15)</span>
                    </div>
                    <div className="h-4 w-px bg-outline-variant"></div>
                    <div className="flex items-center gap-space-xs text-secondary font-bold">
                      <span className="material-symbols-outlined text-title-md">hotel_class</span>
                      <span className="font-label-sm uppercase tracking-widest">Las Buenas (16 a 30)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-space-md md:gap-space-lg relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-outline-variant opacity-40"></div>

                    {/* NOSOTROS Matches */}
                    <div className="flex flex-col gap-space-md">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-on-surface-variant font-bold">Fósforos (Nosotros)</span>
                        <span className="font-label-sm text-primary font-bold">
                          {Math.floor(scoreNosotros / 5)} Cajas Completas
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-space-sm min-h-[14rem] p-space-sm bg-surface-container-lowest/60 rounded-xl border border-surface-container-high/20" id="clusters-nosotros">
                        {renderMatchstickBoxes(scoreNosotros, 'nosotros')}
                      </div>

                      {/* Quick Add Buttons for NOSOTROS */}
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-space-xs">
                        <button
                          onClick={() => addPoints('nosotros', 1)}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container hover:bg-primary-container text-on-surface hover:text-primary transition-all shadow-sm cursor-pointer border border-surface-container-high"
                        >
                          <span className="font-title-md font-bold">+1</span>
                          <span className="font-label-sm text-on-surface-variant text-[10px]">Tanto</span>
                        </button>
                        <button
                          onClick={() => addPoints('nosotros', 2)}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container hover:bg-primary-container text-on-surface hover:text-primary transition-all shadow-sm cursor-pointer border border-surface-container-high"
                        >
                          <span className="font-title-md font-bold">+2</span>
                          <span className="font-label-sm text-on-surface-variant text-[10px]">Truco</span>
                        </button>
                        <button
                          onClick={() => addPoints('nosotros', 3)}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container hover:bg-primary-container text-on-surface hover:text-primary transition-all shadow-sm cursor-pointer border border-surface-container-high"
                        >
                          <span className="font-title-md font-bold">+3</span>
                          <span className="font-label-sm text-on-surface-variant text-[10px]">Re/Env</span>
                        </button>
                        <button
                          onClick={() => addPoints('nosotros', 4)}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container hover:bg-primary-container text-on-surface hover:text-primary transition-all shadow-sm cursor-pointer border border-surface-container-high"
                        >
                          <span className="font-title-md font-bold">+4</span>
                          <span className="font-label-sm text-on-surface-variant text-[10px]">Vale 4</span>
                        </button>
                        <button
                          onClick={() => addPoints('nosotros', -1)}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container-high hover:bg-error-container text-error transition-all shadow-sm cursor-pointer border border-surface-container-high"
                        >
                          <span className="font-title-md font-bold">-1</span>
                          <span className="font-label-sm text-on-surface-variant text-[10px]">Corregir</span>
                        </button>
                      </div>
                    </div>

                    {/* ELLOS Matches */}
                    <div className="flex flex-col gap-space-md">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-on-surface-variant font-bold">Fósforos (Ellos)</span>
                        <span className="font-label-sm text-secondary font-bold">
                          {Math.floor(scoreEllos / 5)} Cajas Completas
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-space-sm min-h-[14rem] p-space-sm bg-surface-container-lowest/60 rounded-xl border border-surface-container-high/20" id="clusters-ellos">
                        {renderMatchstickBoxes(scoreEllos, 'ellos')}
                      </div>

                      {/* Quick Add Buttons for ELLOS */}
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-space-xs">
                        <button
                          onClick={() => addPoints('ellos', 1)}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container hover:bg-secondary-container text-on-surface hover:text-on-secondary-container transition-all shadow-sm cursor-pointer border border-surface-container-high"
                        >
                          <span className="font-title-md font-bold">+1</span>
                          <span className="font-label-sm text-on-surface-variant text-[10px]">Tanto</span>
                        </button>
                        <button
                          onClick={() => addPoints('ellos', 2)}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container hover:bg-secondary-container text-on-surface hover:text-on-secondary-container transition-all shadow-sm cursor-pointer border border-surface-container-high"
                        >
                          <span className="font-title-md font-bold">+2</span>
                          <span className="font-label-sm text-on-surface-variant text-[10px]">Truco</span>
                        </button>
                        <button
                          onClick={() => addPoints('ellos', 3)}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container hover:bg-secondary-container text-on-surface hover:text-on-secondary-container transition-all shadow-sm cursor-pointer border border-surface-container-high"
                        >
                          <span className="font-title-md font-bold">+3</span>
                          <span className="font-label-sm text-on-surface-variant text-[10px]">Re/Env</span>
                        </button>
                        <button
                          onClick={() => addPoints('ellos', 4)}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container hover:bg-secondary-container text-on-surface hover:text-on-secondary-container transition-all shadow-sm cursor-pointer border border-surface-container-high"
                        >
                          <span className="font-title-md font-bold">+4</span>
                          <span className="font-label-sm text-on-surface-variant text-[10px]">Vale 4</span>
                        </button>
                        <button
                          onClick={() => addPoints('ellos', -1)}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container-high hover:bg-error-container text-error transition-all shadow-sm cursor-pointer border border-surface-container-high"
                        >
                          <span className="font-title-md font-bold">-1</span>
                          <span className="font-label-sm text-on-surface-variant text-[10px]">Corregir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Falta Envido Calculator Drawer */}
                <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col md:flex-row items-center justify-between gap-space-md border border-surface-container-high/40">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-title-lg">calculate</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-title-md text-title-md text-on-surface">Cálculo de Falta Envido Automático</span>
                      <span className="font-body-md text-body-md text-on-surface-variant">
                        {scoreNosotros >= 15
                          ? `Nosotros en Buenas (faltan ${targetPoints - scoreNosotros}). `
                          : `Nosotros en Malas (faltan ${targetPoints - scoreNosotros}). `}
                        {scoreEllos >= 15
                          ? `Ellos en Buenas (faltan ${targetPoints - scoreEllos}).`
                          : `Ellos en Malas (faltan ${targetPoints - scoreEllos}).`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <button
                      onClick={() => applyFaltaEnvido('nosotros')}
                      className="px-space-md py-space-xs bg-primary text-on-primary rounded-lg font-label-md font-bold hover:brightness-110 transition-all shadow-sm cursor-pointer"
                    >
                      Falta a Nosotros (+{targetPoints - Math.max(scoreNosotros, scoreEllos)})
                    </button>
                    <button
                      onClick={() => applyFaltaEnvido('ellos')}
                      className="px-space-md py-space-xs bg-secondary text-on-secondary rounded-lg font-label-md font-bold hover:brightness-110 transition-all shadow-sm cursor-pointer"
                    >
                      Falta a Ellos (+{targetPoints - Math.max(scoreNosotros, scoreEllos)})
                    </button>
                  </div>
                </div>

                {/* Historial de Gritos en Mano Activa */}
                <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col gap-space-sm border border-surface-container-high/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-secondary text-title-md">history_edu</span>
                      <span className="font-title-md text-title-md text-on-surface">Historial de Gritos en Mano Activa</span>
                    </div>
                    <button
                      onClick={handleClearGritos}
                      className="font-label-sm text-primary hover:underline uppercase tracking-wider font-bold cursor-pointer"
                    >
                      Limpiar Mano
                    </button>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    {gritosLog.length === 0 ? (
                      <p className="text-xs text-on-surface-variant py-2 italic text-center">
                        Mano limpia. Iniciando nuevo reparto...
                      </p>
                    ) : (
                      gritosLog.map((grito) => (
                        <div
                          key={grito.id}
                          className="flex items-center justify-between py-space-xs px-space-sm bg-surface-container rounded-lg border border-surface-container-high/30"
                        >
                          <div className="flex items-center gap-space-sm">
                            <span
                              className={`px-2 py-0.5 rounded font-label-sm font-bold ${
                                grito.teamColor === 'primary'
                                  ? 'bg-primary-container text-primary'
                                  : 'bg-surface-container-high text-secondary'
                              }`}
                            >
                              {grito.team}
                            </span>
                            <span className="font-body-md text-body-md text-on-surface">{grito.text}</span>
                          </div>
                          <span
                            className={`font-label-sm font-bold ${
                              grito.pointColor === 'secondary'
                                ? 'text-secondary'
                                : grritoColor(grito.pointColor)
                            }`}
                          >
                            {grito.points}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT SECTION: Gaucho Player Stats & Criollo Telemetry (4 cols) */}
          <aside className="xl:col-span-4 flex flex-col gap-space-lg">
            {/* Player Bio Profile Card */}
            <div className="bg-surface-container-low rounded-2xl p-space-md md:p-space-lg shadow-xl relative overflow-hidden border border-surface-container-high/40">
              <div className="flex items-center gap-space-md mb-space-md">
                <div className="relative">
                  <img
                    alt="Facundo El Zorzal avatar"
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-secondary shadow-lg"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLecnXvJSNzE-Zj5ik_UP0YBsGBY3q2Fmx15OOXRaCruKgtUzRIZQ8gGlnb1uuCk6MDhr7_02Pqu4Z7YrPMXPmqSixyD_vzKCyUZ-6bA1ZFa_8ZnKS31PULHdv2BnPvhkmhE6VUzqjySniSeOHZVDcG0KluIwFUbl7Dlb5oshfVv2tIed6rhBUWGVvQMN8ZsYigjf2ylbhRy6ifdouTX_OyMCAM8Puth1hnW2Ol_sA1DFLuM9QgdU"
                  />
                  <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 bg-secondary text-on-secondary rounded font-label-sm font-bold uppercase tracking-wider text-[9px]">
                    Capitán
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm uppercase tracking-widest text-secondary font-bold">
                    Jugador Certificado
                  </span>
                  <span className="font-title-lg text-title-lg text-on-surface font-bold truncate">
                    Facundo "El Zorzal"
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant truncate">
                    Club Social San Telmo • 1,840 ELO
                  </span>
                </div>
              </div>

              {/* Tally Highlights Grid */}
              <div className="grid grid-cols-3 gap-space-xs bg-surface-container p-space-sm rounded-xl mb-space-md text-center border border-surface-container-high/40">
                <div className="flex flex-col">
                  <span className="font-headline-md text-headline-md text-primary font-bold">68.4%</span>
                  <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">
                    Win Rate
                  </span>
                </div>
                <div className="flex flex-col border-x border-outline-variant/30">
                  <span className="font-headline-md text-headline-md text-on-surface font-bold">412</span>
                  <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">
                    Partidas
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-md text-headline-md text-secondary font-bold">282</span>
                  <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">
                    Victorias
                  </span>
                </div>
              </div>

              {/* Telemetry Meters */}
              <div className="flex flex-col gap-space-md">
                <span className="font-label-md uppercase tracking-wider text-on-surface font-bold">
                  Análisis Táctico Criollo
                </span>

                {/* Meter 1: Envido */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-label-md text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-title-md text-secondary">flare</span>
                      Efectividad del Envido
                    </span>
                    <span className="font-label-md text-primary font-bold">74% (Prom. 28.5)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: '74%' }}></div>
                  </div>
                  <span className="font-label-sm text-on-surface-variant text-[11px]">
                    Gana 3 de cada 4 tantos cuando canta o responde primero.
                  </span>
                </div>

                {/* Meter 2: Bluff */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-label-md text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-title-md text-secondary">psychology</span>
                      Índice Mentiroso (Bluff)
                    </span>
                    <span className="font-label-md text-secondary font-bold">62% Éxito</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-secondary rounded-full transition-all" style={{ width: '62%' }}></div>
                  </div>
                  <span className="font-label-sm text-on-surface-variant text-[11px]">
                    62% de Trucos ganados sin espada ni basto mayor.
                  </span>
                </div>

                {/* Meter 3: Flor */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-label-md text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-title-md text-secondary">local_florist</span>
                      Frecuencia de Flor
                    </span>
                    <span className="font-label-md text-on-surface font-bold">45 Cantadas</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-secondary-container rounded-full transition-all" style={{ width: '82%' }}></div>
                  </div>
                  <div className="flex justify-between items-center font-label-sm text-[11px] text-on-surface-variant">
                    <span>3 Contraflores Ganadas</span>
                    <span className="text-primary font-bold">100% Invicto en Flor</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Table Battles Log */}
            <div className="bg-surface-container-low rounded-2xl p-space-md md:p-space-lg shadow-xl flex flex-col gap-space-md border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <span className="font-title-md text-title-md text-on-surface">Historial de Encuentros</span>
                <span className="font-label-sm text-secondary uppercase tracking-wider font-bold">Temporada Clausura</span>
              </div>
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between p-space-sm bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-xs">
                      V
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-on-surface font-bold">vs. Los Matadores de Boedo</span>
                      <span className="font-label-sm text-on-surface-variant">Mano a Mano (A 30) • 30 - 24</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-label-md text-primary font-bold">+24 ELO</span>
                    <span className="font-label-sm text-on-surface-variant text-[10px]">Ayer</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-space-sm bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-xs">
                      V
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-on-surface font-bold">vs. Pampa Gaucha Dúo</span>
                      <span className="font-label-sm text-on-surface-variant">Parejas con Flor • 30 - 19</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-label-md text-primary font-bold">+18 ELO</span>
                    <span className="font-label-sm text-on-surface-variant text-[10px]">24 May</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-space-sm bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center font-bold text-xs">
                      D
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-on-surface font-bold">vs. Don Atahualpa</span>
                      <span className="font-label-sm text-on-surface-variant">Chico Rápido (A 15) • 13 - 15</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-label-md text-error font-bold">-16 ELO</span>
                    <span className="font-label-sm text-on-surface-variant text-[10px]">22 May</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-space-sm bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-xs">
                      V
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-on-surface font-bold">vs. La Tropilla Brava</span>
                      <span className="font-label-sm text-on-surface-variant">Final de Ronda • 30 - 27</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-label-md text-primary font-bold">+31 ELO</span>
                    <span className="font-label-sm text-on-surface-variant text-[10px]">19 May</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-space-sm bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-xs">
                      V
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-on-surface font-bold">vs. Milongueros del Sur</span>
                      <span className="font-label-sm text-on-surface-variant">Tercer Puesto Copa • 30 - 21</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-label-md text-primary font-bold">+22 ELO</span>
                    <span className="font-label-sm text-on-surface-variant text-[10px]">16 May</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Criollo Advice Card */}
            <div className="bg-gradient-to-r from-primary-container to-surface-container-high rounded-2xl p-space-md text-on-surface shadow-lg flex items-center gap-space-md border border-primary/20">
              <span className="material-symbols-outlined text-secondary text-display-lg shrink-0">tips_and_updates</span>
              <div className="flex flex-col">
                <span className="font-title-md text-title-md font-bold text-secondary">Regla Criolla de Oro</span>
                <p className="font-body-md text-body-md text-on-surface-variant leading-snug">
                  "Al que va al frente con 31 de mano, el envido no se le niega: o se redobla con picardía o se paga con honor."
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

function grritoColor(colorKey: string) {
  if (colorKey === 'primary') return 'text-primary';
  if (colorKey === 'secondary') return 'text-secondary';
  return 'text-on-surface-variant';
}
