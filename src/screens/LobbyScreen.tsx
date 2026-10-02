import React, { useState } from 'react';
import { ScreenType, Room } from '../types';

interface LobbyScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pointFilter, setPointFilter] = useState('all');
  const [florFilter, setFlorFilter] = useState('all');
  const [betFilter, setBetFilter] = useState('all');
  const [timerFilter, setTimerFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchingQuickMatch, setIsSearchingQuickMatch] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New table form state
  const [newTableName, setNewTableName] = useState('Pulpería de los Valientes');
  const [newTableMode, setNewTableMode] = useState('2v2');
  const [newTablePoints, setNewTablePoints] = useState('30');
  const [newTableFlor, setNewTableFlor] = useState('true');
  const [newTableBet, setNewTableBet] = useState('2000');
  const [newTablePrivate, setNewTablePrivate] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const initialRooms: Room[] = [
    {
      id: 'room-1',
      name: 'Mesa de los Ases - Solo Criollos',
      host: 'DonPancho84',
      hostInitials: 'DP',
      points: 30,
      flor: true,
      turnTime: 30,
      bet: 5000,
      mode: '2v2',
      playersCurrent: 2,
      playersMax: 4,
      isVip: true,
      tag: 'VIP',
    },
    {
      id: 'room-2',
      name: 'Duelo Cuyano Rápido',
      host: 'MendozaGaucho',
      hostInitials: 'MG',
      points: 15,
      flor: false,
      turnTime: 15,
      bet: 1000,
      mode: '1v1',
      playersCurrent: 1,
      playersMax: 2,
      tag: '15s Turno',
    },
    {
      id: 'room-3',
      name: 'Pulpería de San Telmo',
      host: 'CarlitosGardelito',
      hostInitials: 'CG',
      points: 30,
      flor: true,
      turnTime: 30,
      bet: 0,
      mode: '2v2',
      playersCurrent: 3,
      playersMax: 4,
      tag: 'Amistosa',
    },
    {
      id: 'room-4',
      name: 'La Querencia de los Fuertes',
      host: 'MartinFierro_Real',
      hostInitials: 'MF',
      points: 30,
      flor: true,
      turnTime: 30,
      bet: 10000,
      mode: '1v1',
      playersCurrent: 1,
      playersMax: 2,
      tag: '+1800 ELO',
    },
  ];

  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  const handleQuickMatch = () => {
    setIsSearchingQuickMatch(true);
    setTimeout(() => {
      setIsSearchingQuickMatch(false);
      onNavigate('mesa-en-vivo');
    }, 800);
  };

  const handleCreateTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: newTableName,
      host: 'Facundo "El Zorzal"',
      hostInitials: 'FZ',
      points: Number(newTablePoints) as 15 | 30,
      flor: newTableFlor === 'true',
      turnTime: 30,
      bet: Number(newTableBet),
      mode: newTableMode as '1v1' | '2v2' | '3v3',
      playersCurrent: 1,
      playersMax: newTableMode === '1v1' ? 2 : newTableMode === '2v2' ? 4 : 6,
      tag: newTablePrivate ? 'Privada' : 'Nueva',
    };
    setRooms([newRoom, ...rooms]);
    setIsCreateModalOpen(false);
    showToast('¡Mesa creada con éxito! Entrando a la mesa...');
    setTimeout(() => onNavigate('mesa-en-vivo'), 600);
  };

  const filteredRooms = rooms.filter((r) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchHost = r.host.toLowerCase().includes(q);
      if (!matchName && !matchHost) return false;
    }
    if (pointFilter !== 'all' && String(r.points) !== pointFilter) return false;
    if (florFilter === 'con-flor' && !r.flor) return false;
    if (florFilter === 'sin-flor' && r.flor) return false;
    if (betFilter === 'amistosa' && r.bet !== 0) return false;
    if (betFilter === '500' && r.bet !== 500) return false;
    if (betFilter === '2000' && r.bet !== 2000 && r.bet !== 5000) return false;
    if (betFilter === '10000' && r.bet < 10000) return false;
    if (timerFilter !== 'all' && String(r.turnTime) !== timerFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-secondary text-on-secondary px-space-lg py-space-sm rounded-xl shadow-2xl font-label-md font-bold flex items-center gap-space-xs animate-bounce">
          <span className="material-symbols-outlined text-title-md">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-surface-container-lowest px-gutter-desktop py-space-xl">
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          {/* Top Live Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container/60 backdrop-blur-md px-space-md py-space-xs rounded-full shadow-sm border border-surface-container-high/40">
            <div className="flex items-center gap-space-sm text-secondary">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-container"></span>
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest font-bold text-secondary">
                Red Federal Activa
              </span>
            </div>
            <div className="flex items-center gap-space-md font-label-md text-label-md text-on-surface-variant flex-wrap">
              <span className="flex items-center gap-1">
                <strong className="text-primary font-bold">3,420</strong> Jugadores en línea
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <strong className="text-secondary font-bold">890</strong> Mesas batiendo cartas
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <strong className="text-on-surface font-bold">12</strong> Torneos y Copas en curso
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-primary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-title-md">speed</span>
              <span>Ping: 22ms (BUE)</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="px-space-sm py-0.5 rounded-full bg-primary-container text-primary font-label-sm text-label-sm font-bold uppercase tracking-wider">
                  Emparejamiento Táctico Inmediato
                </span>
                <span className="text-on-surface-variant font-label-sm text-label-sm tracking-wide">• 100% Sin Esperas</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                Sentate a la mesa criolla, tirá la falta y cantá el primer truco.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                Emparejate en segundos con rivales de tu mismo calibre ELO. Sentí el crujido del mazo español, la picardía de las señas y el rigor de los 30 puntos con flor.
              </p>
              <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                <button
                  className="group relative flex items-center justify-center gap-space-sm px-space-xl py-space-md bg-gradient-to-r from-secondary-container via-secondary to-secondary-fixed text-on-secondary-container rounded-xl font-label-lg text-label-lg font-bold shadow-lg hover:shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  id="quick-match-btn"
                  type="button"
                  onClick={handleQuickMatch}
                >
                  <span className="material-symbols-outlined text-headline-md group-hover:rotate-12 transition-transform">
                    {isSearchingQuickMatch ? 'progress_activity' : 'bolt'}
                  </span>
                  <span>
                    {isSearchingQuickMatch ? 'Buscando rival criollo...' : 'Jugar Ahora: 1v1 a 30 con Flor'}
                  </span>
                </button>
                <div className="flex flex-col text-on-surface-variant font-label-sm text-label-sm">
                  <span className="font-bold text-on-surface">Apuesta Base: 500 Fichas</span>
                  <span>Reglamento oficial AFA / Salón Criollo</span>
                </div>
              </div>
            </div>

            {/* Featured Live Table Artwork */}
            <div className="lg:col-span-5 relative">
              <div 
                className="relative w-full h-64 rounded-xl overflow-hidden shadow-2xl bg-surface-container border border-surface-container-high cursor-pointer group"
                onClick={() => onNavigate('mesa-en-vivo')}
              >
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Mesa caliente"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvD0c64RWEFIQ9REpJMHgmIJvWGTvaxU8NecMTG0uLi83yUKtB_GFYxSxgCodGhOAkxbk5f0EpVcaPY9gxzyHhNoLuZaRCQGOk5Ik207j1JUQWhrPziWuZFfQHB9CnN6GvWyZlHM-2nzp3YVmcQ9Z6bsLsMp5jw07txie73OFrHVmbxiZdfekajuRApeAc6pnxsVpqy0qqOMVtQoNqXJoCVCLcNzxOvR1-Kn9NKpAM9W3xUjU5fDs"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-on-surface">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-secondary text-headline-md animate-pulse">local_fire_department</span>
                    <div>
                      <div className="font-title-md text-title-md font-bold">Mesa Caliente del Momento</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Duelo de Leyendas • Pozo 50,000 Fichas</div>
                    </div>
                  </div>
                  <span className="px-space-sm py-1 bg-surface-container-highest/90 text-primary font-label-sm text-label-sm rounded-md font-bold">
                    EN VIVO
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Mode Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mt-space-sm">
            {/* 1 vs 1 Criollo */}
            <button
              className="group flex flex-col justify-between p-space-md bg-surface-container hover:bg-surface-container-high rounded-xl text-left shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-surface-container-high/60 cursor-pointer"
              type="button"
              onClick={() => onNavigate('mesa-en-vivo')}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-title-lg">swords</span>
                </div>
                <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">Mano a Mano</span>
              </div>
              <div className="mt-space-md">
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold group-hover:text-primary transition-colors">
                  1 vs 1 Criollo
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Duelo puro a sangre fría. Mentiras, envite veloz y cálculo exacto de cartas.
                </p>
              </div>
              <div className="flex items-center justify-between mt-space-md pt-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">1,120 en cola</span>
                <span className="material-symbols-outlined text-title-md text-primary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </button>

            {/* 2 vs 2 En Parejas */}
            <button
              className="group flex flex-col justify-between p-space-md bg-surface-container hover:bg-surface-container-high rounded-xl text-left shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-surface-container-high/60 cursor-pointer"
              type="button"
              onClick={() => onNavigate('mesa-en-vivo')}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-title-lg">group</span>
                </div>
                <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">Pica Pica</span>
              </div>
              <div className="mt-space-md">
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold group-hover:text-secondary transition-colors">
                  2 vs 2 En Parejas
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Guiño de ojo, ceja arriba y lengua afuera. Señas secretas integradas al HUD.
                </p>
              </div>
              <div className="flex items-center justify-between mt-space-md pt-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">1,840 en cola</span>
                <span className="material-symbols-outlined text-title-md text-secondary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </button>

            {/* 3 vs 3 de Pulpería */}
            <button
              className="group flex flex-col justify-between p-space-md bg-surface-container hover:bg-surface-container-high rounded-xl text-left shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-surface-container-high/60 cursor-pointer"
              type="button"
              onClick={() => onNavigate('mesa-en-vivo')}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface">
                  <span className="material-symbols-outlined text-title-lg">diversity_3</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">Gallo Criollo</span>
              </div>
              <div className="mt-space-md">
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold group-hover:text-primary transition-colors">
                  3 vs 3 de Pulpería
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Partida multitudinaria de a seis. Mesa ancha, idas y vueltas épicas en ronda.
                </p>
              </div>
              <div className="flex items-center justify-between mt-space-md pt-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">360 en cola</span>
                <span className="material-symbols-outlined text-title-md text-primary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </button>

            {/* Sala con Amigos */}
            <button
              className="group flex flex-col justify-between p-space-md bg-gradient-to-br from-surface-container to-surface-container-high hover:to-surface-bright rounded-xl text-left shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-secondary/20 cursor-pointer"
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-title-lg">key</span>
                </div>
                <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">Mesa Cerrada</span>
              </div>
              <div className="mt-space-md">
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold group-hover:text-secondary transition-colors">
                  Sala con Amigos
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Con clave personalizada, chat de voz con mate virtual y reglas a medida.
                </p>
              </div>
              <div className="flex items-center justify-between mt-space-md pt-space-xs">
                <span className="font-label-sm text-label-sm text-secondary font-bold">Código o Link</span>
                <span className="material-symbols-outlined text-title-md text-secondary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Main Tables & Community Section */}
      <section className="w-full px-gutter-desktop py-space-lg">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          {/* Search & Filters Bar */}
          <div className="bg-surface-container p-space-md rounded-xl shadow-lg flex flex-col gap-space-md border border-surface-container-high/40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-title-lg">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container-high"
                  id="table-search-input"
                  placeholder="Buscar mesa por nombre de sala, anfitrión o apuesta..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="flex items-center justify-center gap-space-xs px-space-lg py-2.5 bg-secondary-container hover:bg-secondary text-on-secondary-container rounded-lg font-label-lg text-label-lg font-bold shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
                id="open-create-modal"
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <span className="material-symbols-outlined text-title-md">add_circle</span>
                <span>Crear Nueva Mesa</span>
              </button>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm pt-space-xs">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant">Límite de Puntos</label>
                <select
                  value={pointFilter}
                  onChange={(e) => setPointFilter(e.target.value)}
                  className="bg-surface-container-lowest text-on-surface px-space-sm py-2 rounded-lg font-label-md text-label-md focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container-high"
                >
                  <option value="all">Cualquiera (15 o 30)</option>
                  <option value="30">A 30 Puntos (Completo)</option>
                  <option value="15">A 15 Puntos (Rápido)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant">Regla de Flor</label>
                <select
                  value={florFilter}
                  onChange={(e) => setFlorFilter(e.target.value)}
                  className="bg-surface-container-lowest text-on-surface px-space-sm py-2 rounded-lg font-label-md text-label-md focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container-high"
                >
                  <option value="all">Todas las salas</option>
                  <option value="con-flor">Con Flor Obligatoria</option>
                  <option value="sin-flor">Sin Flor (Solo Envido)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant">Apuesta / Entrada</label>
                <select
                  value={betFilter}
                  onChange={(e) => setBetFilter(e.target.value)}
                  className="bg-surface-container-lowest text-on-surface px-space-sm py-2 rounded-lg font-label-md text-label-md focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container-high"
                >
                  <option value="all">Cualquier pozo</option>
                  <option value="amistosa">Amistosa (Gratis / 0 fichas)</option>
                  <option value="500">500 Fichas</option>
                  <option value="2000">2,000 Fichas</option>
                  <option value="10000">10,000+ Fichas (VIP)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant">Reloj de Turno</label>
                <select
                  value={timerFilter}
                  onChange={(e) => setTimerFilter(e.target.value)}
                  className="bg-surface-container-lowest text-on-surface px-space-sm py-2 rounded-lg font-label-md text-label-md focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container-high"
                >
                  <option value="all">Cualquier velocidad</option>
                  <option value="15">Relámpago (15s)</option>
                  <option value="30">Estándar (30s)</option>
                  <option value="60">Tranquilo (60s)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tables List + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* Rooms List */}
            <div className="lg:col-span-8 flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Salas de Juego Abiertas</h2>
                  <span className="px-space-xs py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-bold border border-secondary/20">
                    {filteredRooms.length} Disponibles
                  </span>
                </div>
                <div className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                  <span>Ordenar por:</span>
                  <button className="text-primary font-bold hover:underline cursor-pointer">Pozo Mayor</button>
                </div>
              </div>

              {/* Table Items */}
              <div className="flex flex-col gap-space-sm">
                {filteredRooms.map((room, idx) => (
                  <div
                    key={room.id}
                    className="group p-space-md bg-surface-container hover:bg-surface-container-high rounded-xl shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border border-surface-container-high/50"
                  >
                    <div className="flex items-start gap-space-md">
                      <div className="w-12 h-12 rounded-xl bg-primary-container/60 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                        <span className="material-symbols-outlined text-headline-md">
                          {room.mode === '1v1' ? 'swords' : room.mode === '3v3' ? 'diversity_3' : 'playing_cards'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-space-xs flex-wrap">
                          <h3 className="font-title-lg text-title-lg text-on-surface font-bold group-hover:text-secondary transition-colors">
                            {room.name}
                          </h3>
                          {room.tag && (
                            <span className="px-space-xs py-0.5 rounded bg-surface-container-highest text-secondary font-label-sm text-label-sm font-bold">
                              {room.tag}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm flex-wrap">
                          <span>Anfitrión: <strong>{room.host}</strong></span>
                          <span>•</span>
                          <span className="text-primary font-bold">A {room.points} Pts</span>
                          <span>•</span>
                          <span>{room.flor ? 'Con Flor' : 'Sin Flor'}</span>
                          <span>•</span>
                          <span>Turnos de {room.turnTime}s</span>
                        </div>
                        <div className="flex items-center gap-space-xs mt-1">
                          <div className="flex -space-x-2">
                            {Array.from({ length: room.playersMax }).map((_, i) => {
                              const isOccupied = i < room.playersCurrent;
                              return (
                                <span
                                  key={i}
                                  className={`inline-block w-6 h-6 rounded-full text-center font-label-sm font-bold leading-6 ring-2 ring-surface-container ${
                                    isOccupied
                                      ? i === 0
                                        ? 'bg-secondary-container text-on-secondary-container'
                                        : 'bg-primary-container text-primary'
                                      : 'bg-surface-container-highest text-outline'
                                  }`}
                                >
                                  {isOccupied ? (i === 0 ? room.hostInitials : 'TG') : '?'}
                                </span>
                              );
                            })}
                          </div>
                          <span className="font-label-sm text-label-sm text-secondary font-bold pl-1">
                            {room.playersCurrent}/{room.playersMax} Jugadores
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-space-sm shrink-0">
                      <div className="flex items-center gap-1 text-secondary font-label-lg text-label-lg font-bold">
                        <span className="material-symbols-outlined text-title-md">
                          {room.bet === 0 ? 'savings' : 'monetization_on'}
                        </span>
                        <span>{room.bet === 0 ? 'Sin apuesta' : `${room.bet.toLocaleString()} c/u`}</span>
                      </div>
                      <div className="flex items-center gap-space-xs">
                        <button
                          onClick={() => onNavigate('mesa-en-vivo')}
                          className="px-space-sm py-1.5 bg-surface-container-highest hover:bg-surface-bright text-on-surface rounded-lg font-label-sm text-label-sm font-bold transition-colors cursor-pointer"
                          type="button"
                        >
                          Espectar
                        </button>
                        {/* Note: The first room button has "Unirse" which matches //button[contains(., 'Unirse')][1] */}
                        <button
                          onClick={() => onNavigate('mesa-en-vivo')}
                          className="px-space-md py-1.5 bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary rounded-lg font-label-md text-label-md font-bold transition-all shadow-sm cursor-pointer"
                          type="button"
                        >
                          {idx === 0 ? 'Unirse' : idx === 1 ? 'Unirse' : idx === 2 ? 'Completar Pareja' : 'Aceptar Desafío'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="p-space-md bg-surface-container rounded-xl flex items-center justify-between border border-surface-container-high/40">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Mostrando {filteredRooms.length} de 38 mesas con cupo disponible
                </span>
                <div className="flex items-center gap-space-xs">
                  <button className="px-space-sm py-1 rounded bg-surface-container-high text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-highest">
                    Anterior
                  </button>
                  <button className="px-space-sm py-1 rounded bg-primary-container text-primary font-label-md text-label-md font-bold">
                    1
                  </button>
                  <button className="px-space-sm py-1 rounded bg-surface-container-high text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-highest">
                    2
                  </button>
                  <button className="px-space-sm py-1 rounded bg-surface-container-high text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-highest">
                    3
                  </button>
                  <button className="px-space-sm py-1 rounded bg-surface-container-high text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-highest">
                    Siguiente
                  </button>
                </div>
              </div>
            </div>

            {/* Aside Column */}
            <aside className="lg:col-span-4 flex flex-col gap-space-lg">
              {/* Amigos del Fogón */}
              <div className="bg-surface-container p-space-md rounded-xl shadow-md flex flex-col gap-space-md border border-surface-container-high/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary text-title-lg">fireplace</span>
                    <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Amigos del Fogón</h3>
                  </div>
                  <span className="px-space-xs py-0.5 rounded-full bg-primary-container text-primary font-label-sm text-label-sm font-bold">
                    4 Conectados
                  </span>
                </div>

                <div className="flex flex-col gap-space-sm">
                  {/* Friend 1 */}
                  <div className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-space-sm">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-label-md">
                          FA
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-surface-container"></span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-title-md text-title-md text-on-surface leading-tight">Facundo Albarracín</span>
                        <span className="font-label-sm text-label-sm text-secondary">Jugando mano a mano</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('mesa-en-vivo')}
                      className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-highest transition-colors cursor-pointer"
                      title="Espectar partida"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-title-md">visibility</span>
                    </button>
                  </div>

                  {/* Friend 2 */}
                  <div className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-space-sm">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-label-md">
                          LM
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-surface-container"></span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-title-md text-title-md text-on-surface leading-tight">Lucía Maidana</span>
                        <span className="font-label-sm text-label-sm text-primary font-bold">Libre en el Lobby</span>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Invitación enviada a Lucía Maidana')}
                      className="px-space-sm py-1 bg-primary-container text-primary hover:bg-primary hover:text-on-primary rounded-lg font-label-sm text-label-sm font-bold transition-colors cursor-pointer"
                      type="button"
                    >
                      Invitar
                    </button>
                  </div>

                  {/* Friend 3 */}
                  <div className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-space-sm">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-bold text-label-md">
                          JM
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-surface-container"></span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-title-md text-title-md text-on-surface leading-tight">Juancho Morales</span>
                        <span className="font-label-sm text-label-sm text-primary font-bold">Libre en el Lobby</span>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Invitación enviada a Juancho Morales')}
                      className="px-space-sm py-1 bg-primary-container text-primary hover:bg-primary hover:text-on-primary rounded-lg font-label-sm text-label-sm font-bold transition-colors cursor-pointer"
                      type="button"
                    >
                      Invitar
                    </button>
                  </div>

                  {/* Friend 4 */}
                  <div className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-space-sm">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-bold text-label-md">
                          EP
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-outline ring-2 ring-surface-container"></span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-title-md text-title-md text-on-surface-variant leading-tight">Esteban Pampa</span>
                        <span className="font-label-sm text-label-sm text-outline">Ausente (hace 10m)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Zumbido enviado a Esteban')}
                      className="p-1.5 text-outline hover:text-on-surface rounded-lg cursor-pointer"
                      title="Mandar zumbido"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-title-md">notifications</span>
                    </button>
                  </div>
                </div>

                <div className="pt-space-xs">
                  <button
                    onClick={() => {
                      const id = prompt('Ingrese el ID de compadre a buscar:');
                      if (id) showToast(`Solicitud de amistad enviada a ${id}`);
                    }}
                    className="w-full py-2 bg-surface-container-lowest hover:bg-surface-container-highest text-on-surface rounded-lg font-label-md text-label-md font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-title-md">person_add</span>
                    <span>Buscar Compadres por ID</span>
                  </button>
                </div>
              </div>

              {/* Top 5 Gauchos del Mes */}
              <div className="bg-surface-container p-space-md rounded-xl shadow-md flex flex-col gap-space-md border border-surface-container-high/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary text-title-lg">emoji_events</span>
                    <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Top 5 Gauchos del Mes</h3>
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary font-bold">Temporada 9</span>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded-lg">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-6 text-center font-headline-md text-headline-md font-bold text-secondary">1</span>
                      <div className="flex flex-col">
                        <span className="font-title-md text-title-md text-on-surface font-bold">DonSilvano_Pampa</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">2,410 ELO • 88% Victorias</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-secondary text-title-lg">military_tech</span>
                  </div>

                  <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded-lg">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-6 text-center font-headline-md text-headline-md font-bold text-on-surface">2</span>
                      <div className="flex flex-col">
                        <span className="font-title-md text-title-md text-on-surface font-bold">LaGauchaBrava</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">2,345 ELO • 84% Victorias</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline text-title-lg">military_tech</span>
                  </div>

                  <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded-lg">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-6 text-center font-headline-md text-headline-md font-bold text-secondary-fixed">3</span>
                      <div className="flex flex-col">
                        <span className="font-title-md text-title-md text-on-surface font-bold">CuraBrochero_As</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">2,290 ELO • 81% Victorias</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-secondary-fixed text-title-lg">military_tech</span>
                  </div>

                  <div className="flex items-center justify-between p-space-xs bg-surface-container-lowest rounded-lg">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-6 text-center font-title-md text-title-md font-bold text-on-surface-variant">4</span>
                      <div className="flex flex-col">
                        <span className="font-title-md text-title-md text-on-surface">FacuElMentiroso</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">2,180 ELO</span>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm text-primary font-bold">+45 pts hoy</span>
                  </div>

                  <div className="flex items-center justify-between p-space-xs bg-surface-container-lowest rounded-lg">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-6 text-center font-title-md text-title-md font-bold text-on-surface-variant">5</span>
                      <div className="flex flex-col">
                        <span className="font-title-md text-title-md text-on-surface">El_Payador_77</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">2,150 ELO</span>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm text-primary font-bold">+12 pts hoy</span>
                  </div>
                </div>

                <div className="p-space-sm bg-surface-container-low rounded-lg flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                  <span>Tu Posición: <strong className="text-secondary font-bold">#42 Nacional</strong></span>
                  <a className="text-primary font-bold hover:underline" href="#top-gauchos" onClick={(e) => { e.preventDefault(); showToast('Tu ranking actual es #42 con 1,840 ELO'); }}>
                    Ver Tabla Completa
                  </a>
                </div>
              </div>

              {/* Código Criollo Notice */}
              <div className="p-space-md rounded-xl bg-gradient-to-br from-primary-container to-surface-container-high shadow-md flex flex-col gap-space-xs text-on-primary-container border border-primary/20">
                <div className="flex items-center gap-space-xs text-primary">
                  <span className="material-symbols-outlined text-title-lg">gavel</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest font-bold">Código Criollo</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface">
                  En este salón digital el engaño es táctico, pero el respeto es sagrado. Los abandonos deliberados restan 50 ELO y suspenden el pozo por 24hs.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Create Table Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md p-gutter"
          id="create-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-xl bg-surface-container p-space-xl rounded-xl shadow-2xl flex flex-col gap-space-md border border-secondary/30">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-headline-md">table_restaurant</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Fundar Nueva Mesa Criolla</h2>
              </div>
              <button
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                id="close-create-modal"
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form className="flex flex-col gap-space-md" id="create-table-form" onSubmit={handleCreateTableSubmit}>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md font-bold text-on-surface">Nombre del Salón o Sala</label>
                <input
                  className="px-space-md py-2.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container-high"
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md font-bold text-on-surface">Modalidad</label>
                  <select
                    className="px-space-md py-2.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container-high"
                    value={newTableMode}
                    onChange={(e) => setNewTableMode(e.target.value)}
                  >
                    <option value="1v1">Mano a Mano (1 vs 1)</option>
                    <option value="2v2">En Parejas (2 vs 2)</option>
                    <option value="3v3">Gallo Criollo (3 vs 3)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md font-bold text-on-surface">Puntaje Final</label>
                  <select
                    className="px-space-md py-2.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container-high"
                    value={newTablePoints}
                    onChange={(e) => setNewTablePoints(e.target.value)}
                  >
                    <option value="30">A 30 Puntos (Buenas y Malas)</option>
                    <option value="15">A 15 Puntos (Partida Corta)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md font-bold text-on-surface">Regla de Flor</label>
                  <select
                    className="px-space-md py-2.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container-high"
                    value={newTableFlor}
                    onChange={(e) => setNewTableFlor(e.target.value)}
                  >
                    <option value="true">Con Flor (Tradición)</option>
                    <option value="false">Sin Flor (Solo Envido)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md font-bold text-on-surface">Apuesta Inicial</label>
                  <select
                    className="px-space-md py-2.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container-high"
                    value={newTableBet}
                    onChange={(e) => setNewTableBet(e.target.value)}
                  >
                    <option value="0">Partida Amistosa (0)</option>
                    <option value="500">500 Fichas</option>
                    <option value="2000">2,000 Fichas</option>
                    <option value="10000">10,000 Fichas</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg border border-surface-container-high">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-secondary">lock</span>
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface">Sala Privada con Clave</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Solo ingresan quienes tengan el código</span>
                  </div>
                </div>
                <input
                  className="w-5 h-5 accent-secondary cursor-pointer"
                  type="checkbox"
                  checked={newTablePrivate}
                  onChange={(e) => setNewTablePrivate(e.target.checked)}
                />
              </div>

              <div className="flex items-center justify-end gap-space-sm pt-space-sm">
                <button
                  className="px-space-lg py-2.5 bg-surface-container-highest hover:bg-surface-bright text-on-surface rounded-lg font-label-lg text-label-lg transition-colors cursor-pointer"
                  id="cancel-create-modal"
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="px-space-xl py-2.5 bg-secondary-container hover:bg-secondary text-on-secondary-container rounded-lg font-label-lg text-label-lg font-bold shadow-lg transition-all cursor-pointer"
                  type="submit"
                >
                  Abrir Mesa y Esperar Rivales
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
