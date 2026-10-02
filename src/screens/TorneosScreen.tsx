import React, { useState, useEffect } from 'react';
import { ScreenType } from '../types';

interface TorneosScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const TorneosScreen: React.FC<TorneosScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'live' | 'calendar' | 'my-regs' | 'hall'>('live');
  const [isRegistered, setIsRegistered] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Countdown timer in seconds (1 hour, 24 minutes, 15 seconds)
  const [countdown, setCountdown] = useState(1 * 3600 + 24 * 60 + 15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(countdown / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((countdown % 3600) / 60)).padStart(2, '0');
  const seconds = String(countdown % 60).padStart(2, '0');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRegister = () => {
    setIsRegistered(true);
    showToast('¡Inscripción confirmada para la Copa La Espada Dorada!');
  };

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-secondary text-on-secondary px-space-lg py-space-sm rounded-xl shadow-2xl font-label-md font-bold flex items-center gap-space-xs animate-bounce">
          <span className="material-symbols-outlined text-title-md">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Ambient Glow Layer */}
      <div className="relative w-full overflow-hidden px-gutter-desktop py-space-lg">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-24 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* FEATURED TOURNAMENT HERO BANNER */}
        <section className="relative w-full rounded-xl bg-surface-container overflow-hidden shadow-xl p-space-xl flex flex-col xl:flex-row gap-space-xl items-center justify-between border border-surface-container-high/40">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container/40 via-surface-container to-surface-container-high pointer-events-none"></div>
          <div className="absolute -right-12 -bottom-12 w-80 h-80 opacity-15 pointer-events-none">
            <svg className="w-full h-full text-secondary" fill="currentColor" viewBox="0 0 200 200">
              <path d="M100 0 L125 75 L200 100 L125 125 L100 200 L75 125 L0 100 L75 75 Z" opacity="0.4"></path>
              <circle cx="100" cy="100" fill="none" r="50" stroke="currentColor" strokeWidth="4"></circle>
            </svg>
          </div>

          {/* Left Column: Title, Metadata, Prize pool */}
          <div className="relative z-10 flex flex-col gap-space-md max-w-2xl">
            <div className="flex flex-wrap items-center gap-space-sm">
              <span className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-wider font-bold shadow-md">
                <span className="w-2 h-2 rounded-full bg-on-secondary animate-ping"></span>
                Evento Mayor • Serie Oro
              </span>
              <span className="px-space-sm py-space-xs rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm">
                1v1 • A 30 Puntos • Con Flor
              </span>
              <span className="px-space-sm py-space-xs rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm">
                Eliminación Directa
              </span>
            </div>

            <div>
              <span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-bold">
                Temporada de Otoño 2024
              </span>
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight leading-none mt-space-xs">
                Copa La Espada Dorada
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-xs">
                La cita cumbre del envite criollo. Duelo de astucia, picardía y pulso de acero donde solo un gaucho levantará el galardón mayor.
              </p>
            </div>

            {/* Prize Pool Highlight Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mt-space-xs">
              <div className="flex items-center gap-space-md p-space-md rounded-lg bg-surface-container-low/80 backdrop-blur shadow-sm border border-secondary/20">
                <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-display-lg-mobile">monetization_on</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Pozo de Premios</span>
                  <span className="font-headline-md text-headline-md text-secondary font-bold">500,000</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Fichas de Oro Garantizadas</span>
                </div>
              </div>

              <div className="flex items-center gap-space-md p-space-md rounded-lg bg-surface-container-low/80 backdrop-blur shadow-sm border border-primary/20">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-display-lg-mobile">military_tech</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Trofeo Exclusivo</span>
                  <span className="font-title-lg text-title-lg text-primary font-bold">Cuchillo Criollo de Plata</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">+ Emote Épico & Badge Salón</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Registration Card & Live Countdown */}
          <div className="relative z-10 w-full xl:w-96 flex flex-col gap-space-md bg-surface-container-low p-space-lg rounded-xl shadow-xl border border-surface-container-high/60">
            {/* Live Countdown Segment */}
            <div className="flex flex-col items-center text-center p-space-md bg-surface-container rounded-lg border border-surface-container-high/40">
              <div className="flex items-center gap-space-xs text-secondary mb-space-xs">
                <span className="material-symbols-outlined text-title-md">alarm</span>
                <span className="font-label-sm text-label-sm uppercase tracking-widest font-bold">Cierre de Inscripción</span>
              </div>
              <div className="flex items-baseline gap-space-xs text-on-surface">
                <div className="flex flex-col items-center">
                  <span className="font-display-lg text-display-lg text-secondary font-bold tabular-nums" id="cd-hours">
                    {hours}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Horas</span>
                </div>
                <span className="font-headline-md text-headline-md text-secondary">:</span>
                <div className="flex flex-col items-center">
                  <span className="font-display-lg text-display-lg text-secondary font-bold tabular-nums" id="cd-mins">
                    {minutes}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Min</span>
                </div>
                <span className="font-headline-md text-headline-md text-secondary">:</span>
                <div className="flex flex-col items-center">
                  <span className="font-display-lg text-display-lg text-secondary font-bold tabular-nums" id="cd-secs">
                    {seconds}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Seg</span>
                </div>
              </div>
            </div>

            {/* Capacity Meter */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex justify-between font-label-md text-label-md">
                <span className="text-on-surface-variant">Cupos confirmados</span>
                <span className="text-secondary font-bold">112 / 128 (87%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div className="h-full bg-gradient-to-r from-secondary to-secondary-container rounded-full transition-all duration-500" style={{ width: '87.5%' }}></div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant text-right">
                Solo quedan 16 plazas libres
              </span>
            </div>

            {/* Main CTA Button */}
            <button
              id="register-btn"
              type="button"
              onClick={handleRegister}
              className={`w-full py-space-md px-space-lg rounded-xl font-label-lg text-label-lg font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-space-sm group cursor-pointer ${
                isRegistered
                  ? 'bg-primary-container text-primary border border-primary/40'
                  : 'bg-gradient-to-r from-secondary-container to-secondary text-on-secondary hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <span className="material-symbols-outlined text-title-lg group-hover:rotate-12 transition-transform">
                {isRegistered ? 'check_circle' : 'confirmation_number'}
              </span>
              <span>{isRegistered ? 'Inscripto con Éxito' : 'Inscribirse (5,000 Fichas)'}</span>
            </button>
            <div className="flex items-center justify-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-title-md text-primary">verified_user</span>
              <span>Check-in obligatorio 5 minutos antes</span>
            </div>
          </div>
        </section>

        {/* TOURNAMENT NAVIGATION TABS */}
        <div className="w-full mt-space-xl flex flex-wrap items-center justify-between gap-space-md pb-space-xs">
          <div className="flex flex-wrap items-center gap-space-xs bg-surface-container-low p-space-xs rounded-xl shadow-inner border border-surface-container-high/40">
            <button
              onClick={() => setActiveTab('live')}
              className={`tab-btn px-space-lg py-space-sm rounded-lg font-label-lg text-label-lg font-bold transition-all flex items-center gap-space-xs cursor-pointer ${
                activeTab === 'live' ? 'bg-primary-container text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-title-md">account_tree</span>
              <span>Llave En Vivo</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`tab-btn px-space-lg py-space-sm rounded-lg font-label-lg text-label-lg font-bold transition-all flex items-center gap-space-xs cursor-pointer ${
                activeTab === 'calendar' ? 'bg-primary-container text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-title-md">calendar_month</span>
              <span>Próximas Copas</span>
            </button>
            <button
              onClick={() => setActiveTab('my-regs')}
              className={`tab-btn px-space-lg py-space-sm rounded-lg font-label-lg text-label-lg font-bold transition-all flex items-center gap-space-xs cursor-pointer ${
                activeTab === 'my-regs' ? 'bg-primary-container text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-title-md">badge</span>
              <span>Mis Inscripciones</span>
              <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center font-bold">
                2
              </span>
            </button>
            <button
              onClick={() => setActiveTab('hall')}
              className={`tab-btn px-space-lg py-space-sm rounded-lg font-label-lg text-label-lg font-bold transition-all flex items-center gap-space-xs cursor-pointer ${
                activeTab === 'hall' ? 'bg-primary-container text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-title-md">emoji_events</span>
              <span>Salón de la Fama</span>
            </button>
          </div>

          <div className="flex items-center gap-space-sm">
            <button
              onClick={() => showToast('Creación de copas privadas entre amigos habilitada')}
              className="px-space-md py-space-sm rounded-lg bg-surface-container-high text-on-surface hover:text-secondary font-label-md text-label-md flex items-center gap-space-xs transition-colors cursor-pointer border border-surface-container-high"
              type="button"
            >
              <span className="material-symbols-outlined text-title-md">group_add</span>
              <span>Crear Torneo de Amigos</span>
            </button>
            <button
              onClick={() => showToast('Filtro de llaves aplicado')}
              className="p-space-sm rounded-lg bg-surface-container-high text-on-surface hover:text-secondary transition-colors cursor-pointer border border-surface-container-high"
              title="Filtrar brackets"
              type="button"
            >
              <span className="material-symbols-outlined text-title-md">tune</span>
            </button>
          </div>
        </div>

        {/* MAIN INTERACTIVE SECTION: LIVE BRACKET VISUALIZER */}
        <div className="w-full mt-space-lg bg-surface-container-low rounded-xl p-space-lg shadow-xl overflow-hidden border border-surface-container-high/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-md border-b border-surface-container-high/50">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-headline-md">hub</span>
              </div>
              <div>
                <div className="flex items-center gap-space-sm">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                    Llave Eliminatoria: Fase Final
                  </h2>
                  <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-error-container text-error font-label-sm text-label-sm uppercase font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                    En Curso
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Actualización punto a punto en tiempo real • Ronda 4 de 5
                </p>
              </div>
            </div>

            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                <span className="w-3 h-3 rounded bg-secondary"></span>
                <span>Clasificado</span>
              </div>
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                <span className="w-3 h-3 rounded bg-error"></span>
                <span>Mesa Caliente</span>
              </div>
              <div className="h-6 w-px bg-surface-container-highest"></div>
              <button
                className="px-space-sm py-space-xs rounded bg-surface-container text-on-surface font-label-sm text-label-sm hover:text-secondary flex items-center gap-1 transition-colors cursor-pointer border border-surface-container-high"
                id="zoom-reset-btn"
                type="button"
                onClick={() => showToast('Vista centrada en la Semifinal')}
              >
                <span className="material-symbols-outlined text-title-md">center_focus_strong</span>
                <span>Centrar</span>
              </button>
            </div>
          </div>

          {/* HORIZONTAL SCROLLABLE BRACKET TREE */}
          <div className="w-full overflow-x-auto py-space-lg">
            <div className="min-w-[1080px] grid grid-cols-4 gap-space-xl relative">
              {/* STAGE 1: Octavos de Final */}
              <div className="flex flex-col gap-space-lg">
                <div className="flex items-center justify-between pb-space-xs">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                    Octavos de Final
                  </span>
                  <span className="font-label-sm text-label-sm text-primary">8 Llaves</span>
                </div>

                {/* Matchup 1 */}
                <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container shadow-md transition-all hover:bg-surface-container-high group border border-surface-container-high/40">
                  <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>Mesa #01 • Terminado</span>
                    <span className="text-secondary font-bold">A 30</span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-high/90">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span className="material-symbols-outlined text-secondary text-title-md">stars</span>
                      <span className="font-title-md text-title-md text-secondary font-bold truncate">MartinFierro_01</span>
                    </div>
                    <span className="px-space-xs py-0.5 rounded bg-secondary text-on-secondary font-label-sm text-label-sm font-bold">30</span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-low opacity-60">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span className="material-symbols-outlined text-on-surface-variant text-title-md">person</span>
                      <span className="font-title-md text-title-md text-on-surface-variant truncate">PampaGaucho</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">22</span>
                  </div>
                </div>

                {/* Matchup 2 */}
                <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container shadow-md transition-all hover:bg-surface-container-high group border border-surface-container-high/40">
                  <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>Mesa #02 • Terminado</span>
                    <span className="text-secondary font-bold">A 30</span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-high/90">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span className="material-symbols-outlined text-secondary text-title-md">stars</span>
                      <span className="font-title-md text-title-md text-secondary font-bold truncate">ElZonda_Cuyo</span>
                    </div>
                    <span className="px-space-xs py-0.5 rounded bg-secondary text-on-secondary font-label-sm text-label-sm font-bold">30</span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-low opacity-60">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span className="material-symbols-outlined text-on-surface-variant text-title-md">person</span>
                      <span className="font-title-md text-title-md text-on-surface-variant truncate">GauchoPower</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">28</span>
                  </div>
                </div>

                {/* Matchup 3 */}
                <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container shadow-md transition-all hover:bg-surface-container-high group border border-surface-container-high/40">
                  <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>Mesa #03 • Terminado</span>
                    <span className="text-secondary font-bold">A 30</span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-low opacity-60">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span className="material-symbols-outlined text-on-surface-variant text-title-md">person</span>
                      <span className="font-title-md text-title-md text-on-surface-variant truncate">DonSegundoS</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">19</span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-high/90">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span className="material-symbols-outlined text-secondary text-title-md">stars</span>
                      <span className="font-title-md text-title-md text-secondary font-bold truncate">Facundo_99</span>
                    </div>
                    <span className="px-space-xs py-0.5 rounded bg-secondary text-on-secondary font-label-sm text-label-sm font-bold">30</span>
                  </div>
                </div>

                {/* Matchup 4 */}
                <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container shadow-md transition-all hover:bg-surface-container-high group border border-surface-container-high/40">
                  <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>Mesa #04 • Terminado</span>
                    <span className="text-secondary font-bold">A 30</span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-high/90">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span className="material-symbols-outlined text-secondary text-title-md">stars</span>
                      <span className="font-title-md text-title-md text-secondary font-bold truncate">LaTropilla_BA</span>
                    </div>
                    <span className="px-space-xs py-0.5 rounded bg-secondary text-on-secondary font-label-sm text-label-sm font-bold">30</span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-low opacity-60">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span className="material-symbols-outlined text-on-surface-variant text-title-md">person</span>
                      <span className="font-title-md text-title-md text-on-surface-variant truncate">ChingoloT</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">14</span>
                  </div>
                </div>
              </div>

              {/* STAGE 2: Cuartos de Final */}
              <div className="flex flex-col justify-around gap-space-xl">
                <div className="flex items-center justify-between pb-space-xs">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                    Cuartos de Final
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary">Definido</span>
                </div>

                {/* QF 1 */}
                <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container shadow-md border border-surface-container-high/40">
                  <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>Cuartos A • Terminado</span>
                    <span className="text-secondary font-bold">Buenas</span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-high/90">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span className="material-symbols-outlined text-secondary text-title-md">stars</span>
                      <span className="font-title-md text-title-md text-secondary font-bold truncate">MartinFierro_01</span>
                    </div>
                    <span className="px-space-xs py-0.5 rounded bg-secondary text-on-secondary font-label-sm text-label-sm font-bold">30</span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-low opacity-60">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span className="material-symbols-outlined text-on-surface-variant text-title-md">person</span>
                      <span className="font-title-md text-title-md text-on-surface-variant truncate">ElZonda_Cuyo</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">26</span>
                  </div>
                </div>

                {/* QF 2 */}
                <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container shadow-md border border-surface-container-high/40">
                  <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>Cuartos B • Terminado</span>
                    <span className="text-secondary font-bold">Buenas</span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-low opacity-60">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span className="material-symbols-outlined text-on-surface-variant text-title-md">person</span>
                      <span className="font-title-md text-title-md text-on-surface-variant truncate">Facundo_99</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">24</span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-high/90">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span className="material-symbols-outlined text-secondary text-title-md">stars</span>
                      <span className="font-title-md text-title-md text-secondary font-bold truncate">LaTropilla_BA</span>
                    </div>
                    <span className="px-space-xs py-0.5 rounded bg-secondary text-on-secondary font-label-sm text-label-sm font-bold">30</span>
                  </div>
                </div>
              </div>

              {/* STAGE 3: Semifinales (LIVE MATCH SPOTLIGHT) */}
              <div className="flex flex-col justify-center gap-space-lg">
                <div className="flex items-center justify-between pb-space-xs">
                  <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-bold">
                    Semifinal En Vivo
                  </span>
                  <span className="flex items-center gap-1 text-error font-label-sm text-label-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                    242 Espectadores
                  </span>
                </div>

                {/* Interactive Live Card */}
                <div className="relative flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-high shadow-xl border-l-4 border-secondary overflow-hidden border border-secondary/30">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-error-container text-error font-bold uppercase tracking-wider">
                      Mesa Central
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary font-bold">Mano 18 • Ronda 2</span>
                  </div>

                  {/* Player 1 */}
                  <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container">
                    <div className="flex items-center gap-space-sm min-w-0">
                      <span className="material-symbols-outlined text-secondary text-title-lg">military_tech</span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-title-md text-title-md text-on-surface font-bold truncate">MartinFierro_01</span>
                        <span className="font-label-sm text-label-sm text-primary">Tiene el Envido (31)</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-headline-md text-headline-md text-secondary font-bold">27</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Buenas</span>
                    </div>
                  </div>

                  {/* Matchstick Mini Representation */}
                  <div className="flex items-center justify-between px-space-xs text-on-surface-variant">
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-0.5 text-secondary">
                        <span className="material-symbols-outlined text-title-md">grid_view</span>
                        <span className="material-symbols-outlined text-title-md">grid_view</span>
                        <span className="material-symbols-outlined text-title-md">grid_view</span>
                        <span className="material-symbols-outlined text-title-md">grid_view</span>
                        <span className="material-symbols-outlined text-title-md">grid_view</span>
                        <span className="font-label-sm text-label-sm font-bold ml-1">+2</span>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary italic">Retruco Cantado</span>
                  </div>

                  {/* Player 2 */}
                  <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container">
                    <div className="flex items-center gap-space-sm min-w-0">
                      <span className="material-symbols-outlined text-on-surface-variant text-title-lg">shield</span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-title-md text-title-md text-on-surface font-bold truncate">LaTropilla_BA</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Pie de mano</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-headline-md text-headline-md text-on-surface font-bold">25</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Buenas</span>
                    </div>
                  </div>

                  {/* Spectate Button: Must match xpath //button[contains(., 'Entrar como Espectador')] */}
                  <button
                    onClick={() => onNavigate('mesa-en-vivo')}
                    className="w-full mt-space-xs py-space-xs px-space-md rounded bg-secondary text-on-secondary font-label-md text-label-md font-bold uppercase tracking-wider flex items-center justify-center gap-space-xs hover:bg-secondary-container transition-colors shadow cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-title-md">visibility</span>
                    <span>Entrar como Espectador</span>
                  </button>
                </div>
              </div>

              {/* STAGE 4: Gran Final */}
              <div className="flex flex-col justify-center gap-space-md">
                <div className="flex items-center justify-between pb-space-xs">
                  <span className="font-label-md text-label-md text-primary uppercase tracking-wider font-bold">
                    Gran Final
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">21:00 ART</span>
                </div>
                <div className="p-space-lg rounded-xl bg-surface-container-high/60 backdrop-blur flex flex-col items-center text-center gap-space-md shadow-2xl relative overflow-hidden border border-secondary/20">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                    <span className="material-symbols-outlined text-display-lg-mobile">trophy</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-md text-headline-md text-secondary font-bold">Trofeo de Oro</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Por la gloria de la Espada</span>
                  </div>

                  <div className="w-full flex flex-col gap-space-xs mt-space-xs">
                    <div className="p-space-xs rounded bg-surface-container text-on-surface-variant font-label-md text-label-md flex items-center justify-between">
                      <span className="italic">Ganador Semifinal 1</span>
                      <span className="material-symbols-outlined text-title-md">hourglass_empty</span>
                    </div>
                    <div className="text-secondary font-bold font-label-sm text-label-sm uppercase">VS</div>
                    <div className="p-space-xs rounded bg-surface-container text-on-surface-variant font-label-md text-label-md flex items-center justify-between">
                      <span className="font-bold text-on-surface">PayadorCuruzú</span>
                      <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary font-label-sm text-label-sm font-bold">
                        Semis 2 (W)
                      </span>
                    </div>
                  </div>
                  <div className="w-full pt-space-xs">
                    <span className="font-label-sm text-label-sm text-primary font-bold">Premio Campeón: 350,000 Fichas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOURNAMENT CALENDAR & SPEED CUPS SCHEDULE */}
        <div className="w-full mt-space-xl grid grid-cols-1 lg:grid-cols-3 gap-space-xl">
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-headline-md">schedule</span>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Calendario Oficial de Copas</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Torneos relámpago continuos y campeonatos de fin de semana con ranking Elo.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex px-space-sm py-space-xs rounded bg-surface-container-high text-primary font-label-sm text-label-sm border border-primary/20">
                Hora Local: Buenos Aires (GMT-3)
              </span>
            </div>

            <div className="flex flex-col gap-space-sm">
              {/* Flash Cup */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors border border-surface-container-high/40">
                <div className="flex items-center gap-space-md">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-surface-container-high text-secondary">
                    <span className="material-symbols-outlined text-title-lg">bolt</span>
                    <span className="font-label-sm text-label-sm font-bold uppercase">Flash</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-title-lg text-title-lg text-on-surface font-bold">Copa Relámpago Pampeana #412</span>
                      <span className="px-space-xs py-0.5 rounded bg-primary-container text-primary font-label-sm text-label-sm font-bold">Cada 30m</span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface-variant">16 Jugadores • Sin Flor • 1v1 a 15 Buenas • Eliminación Rápida</span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-space-lg">
                  <div className="flex flex-col sm:items-end">
                    <span className="font-title-md text-title-md text-secondary font-bold">15,000 Fichas</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Entrada: 1,000 Fichas</span>
                  </div>
                  <button
                    onClick={() => showToast('¡Inscripto en la Copa Relámpago Pampeana #412!')}
                    className="px-space-md py-space-xs rounded-lg bg-primary text-on-primary hover:bg-primary-fixed font-label-md text-label-md font-bold transition-all shadow cursor-pointer"
                    type="button"
                  >
                    Inscribirme
                  </button>
                </div>
              </div>

              {/* San Telmo Nocturno */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors border border-surface-container-high/40">
                <div className="flex items-center gap-space-md">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-secondary/15 text-secondary">
                    <span className="font-headline-md text-headline-md font-bold leading-none">23</span>
                    <span className="font-label-sm text-label-sm font-bold uppercase">VIE • 22h</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-title-lg text-title-lg text-on-surface font-bold">Torneo San Telmo Nocturno</span>
                      <span className="px-space-xs py-0.5 rounded bg-surface-container-highest text-secondary font-label-sm text-label-sm font-bold">Clásico</span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface-variant">64 Participantes • Parejas (2v2) • A 30 Puntos con Flor</span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-space-lg">
                  <div className="flex flex-col sm:items-end">
                    <span className="font-title-md text-title-md text-secondary font-bold">120,000 Fichas</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Entrada: 2,500 / Jugador</span>
                  </div>
                  <button
                    onClick={() => showToast('Detalles: Torneo oficial en parejas, inicio viernes 22:00 hs')}
                    className="px-space-md py-space-xs rounded-lg bg-surface-container-high text-on-surface hover:text-secondary font-label-md text-label-md font-bold transition-all cursor-pointer border border-surface-container-high"
                    type="button"
                  >
                    Detalles
                  </button>
                </div>
              </div>

              {/* Desafío 4 Provincias */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors border border-surface-container-high/40">
                <div className="flex items-center gap-space-md">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary/15 text-primary">
                    <span className="font-headline-md text-headline-md font-bold leading-none">25</span>
                    <span className="font-label-sm text-label-sm font-bold uppercase">DOM • 18h</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-title-lg text-title-lg text-on-surface font-bold">Desafío de las 4 Provincias</span>
                      <span className="px-space-xs py-0.5 rounded bg-primary-container text-primary font-label-sm text-label-sm font-bold">+250 ELO</span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface-variant">128 Maestros • Formato Suizo Clasificatorio + Playoffs</span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-space-lg">
                  <div className="flex flex-col sm:items-end">
                    <span className="font-title-md text-title-md text-secondary font-bold">300,000 Fichas</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Mínimo Nivel 20</span>
                  </div>
                  <button
                    onClick={() => showToast('Pre-clasificación registrada. Cumples con Nivel 28.')}
                    className="px-space-md py-space-xs rounded-lg bg-surface-container-high text-on-surface hover:text-secondary font-label-md text-label-md font-bold transition-all cursor-pointer border border-surface-container-high"
                    type="button"
                  >
                    Pre-clasificar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Salón de Campeones */}
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-secondary text-headline-md">stars</span>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Salón de Campeones</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Últimos monarcas consagrados</p>
              </div>
            </div>

            <div className="p-space-lg rounded-xl bg-surface-container flex flex-col gap-space-md shadow-lg border border-surface-container-high/40">
              {/* Champion 1 */}
              <div className="flex items-center gap-space-md pb-space-sm border-b border-surface-container-high">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-md">
                  <img
                    className="w-full h-full object-cover"
                    alt="DonAlvarado_BA avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMdVWXiEKlK1_htvxr7JIjwWH3xxTNNzxbbaOVowtIHt_-78CGpyy8tNBn0zfgOEGGn_UmiU0tAguJ5oXabjQF5ENjQnFp_XtCPms5ur8k4qG2Rd7gO0tw74JtUDGiD4KAhr_mPYL4sHML1Di7EIVSmeMlm-bxmFme1XQBJCOIzJBlUxkufYExpUny8sl35ClRYLJlemkCX664zBPBxqF-L8kR32QF40lLYETIVcitJ1IYIl5kLqk"
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-title-md text-title-md text-secondary font-bold truncate">DonAlvarado_BA</span>
                    <span className="font-label-sm text-label-sm text-primary font-bold">Oro</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant truncate">Copa Santos Vega (Mayo 2024)</span>
                </div>
              </div>

              {/* Champion 2 */}
              <div className="flex items-center gap-space-md pb-space-sm border-b border-surface-container-high">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-md">
                  <img
                    className="w-full h-full object-cover"
                    alt="VictoriaPampa avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCupMur82R9WRalyip4wVXTx8caVKzSXFYBYZjLCf8Q8eG087-_a8ZMVxwJA0xCzdspPkZf5-xAkCeQkKYLR42k3P9V0aEMGqCiaH1Fvh9tS_mi4fY28jN-Z3R8nZpLgHUZA1FxHXyITiPwFeJFmiPA9ghfhL4bpWLBUgiamx31XlxU4Erj_LxTYlkB8V77rGUdIexiIZ1Sxb2svoBCNCRxxU9CZneZ8mK16r5zEyBkzAHe7XJbFwE"
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-title-md text-title-md text-on-surface font-bold truncate">VictoriaPampa</span>
                    <span className="font-label-sm text-label-sm text-secondary font-bold">Plata</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant truncate">Gran Abierto Federal 1v1</span>
                </div>
              </div>

              {/* ELO Distribution Matrix */}
              <div className="flex flex-col gap-space-xs mt-space-xs p-space-md rounded-lg bg-surface-container-low border border-surface-container-high/30">
                <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">
                  Distribución de Puntos ELO
                </span>
                <div className="flex justify-between font-label-md text-label-md text-on-surface-variant">
                  <span>1º Puesto (Campeón):</span>
                  <span className="text-primary font-bold">+180 pts</span>
                </div>
                <div className="flex justify-between font-label-md text-label-md text-on-surface-variant">
                  <span>2º Puesto (Subcampeón):</span>
                  <span className="text-primary font-bold">+95 pts</span>
                </div>
                <div className="flex justify-between font-label-md text-label-md text-on-surface-variant">
                  <span>Semifinales (3º-4º):</span>
                  <span className="text-primary font-bold">+45 pts</span>
                </div>
              </div>

              <button
                onClick={() => showToast('Ranking de temporada cargado')}
                className="w-full py-space-xs px-space-md rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors text-center cursor-pointer border border-surface-container-high"
                type="button"
              >
                Ver Ranking General de Temporada
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
