import React, { useState } from 'react';
import { ScreenType } from '../types';
import { UserProfile } from '../firebase';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onToggleJerarquiaModal?: () => void;
  userProfile?: UserProfile | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onOpenLiveVoice?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onToggleJerarquiaModal,
  userProfile,
  onLogin,
  onLogout,
  onOpenLiveVoice,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks: { id: ScreenType; label: string; path: string }[] = [
    { id: 'mesa-en-vivo', label: 'Mesa en Vivo', path: 'mesa-en-vivo' },
    { id: 'lobby-de-salas', label: 'Lobby de Salas', path: 'lobby-de-salas' },
    { id: 'torneos-y-copas', label: 'Torneos & Copas', path: 'torneos-y-copas' },
    { id: 'anotador-digital', label: 'Anotador Digital', path: 'anotador-digital' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-low/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-b border-surface-container-high/40">
      <div className={`${currentScreen === 'mesa-en-vivo' ? 'h-14 sm:h-16' : 'h-20'} w-full px-gutter-desktop flex items-center justify-between gap-space-md transition-all duration-200`}>
        <div className="flex items-center gap-space-lg">
          {/* Logo */}
          <div
            className="flex items-center gap-space-sm cursor-pointer select-none"
            onClick={() => onNavigate('lobby-de-salas')}
          >
            <div className="relative w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center overflow-hidden border border-primary/30">
              <span className="material-symbols-outlined text-secondary text-title-lg">style</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md tracking-tight text-primary leading-none">
                Truco Criollo
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                Salón Digital
              </span>
            </div>
          </div>

          {/* Desktop & XPath Nav */}
          <nav className="flex items-center gap-space-xs" data-active-classes="bg-primary-container text-primary font-bold">
            {navLinks.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.path}`}
                  data-path={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.id);
                  }}
                  className={`px-space-md py-space-sm rounded-lg font-label-lg text-label-lg transition-all ${
                    isActive
                      ? 'bg-primary-container text-primary font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* User Badges & Utilities */}
        <div className="flex items-center gap-space-md">
          {/* Live Voice Button (gemini-3.8-live) */}
          <button
            onClick={onOpenLiveVoice}
            className="flex items-center gap-1.5 px-space-md py-space-xs rounded-full bg-gradient-to-r from-secondary-container/20 to-secondary/30 hover:to-secondary/50 text-secondary border border-secondary/40 font-label-md transition-all shadow-sm cursor-pointer"
            type="button"
            title="Abrir conversación de voz con Gemini 3.8 Live"
          >
            <span className="material-symbols-outlined text-title-md animate-pulse">record_voice_over</span>
            <span className="font-bold hidden sm:inline">Voz en Vivo</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-secondary text-on-secondary font-bold uppercase">Live</span>
          </button>

          {/* ELO Level */}
          <div className="hidden md:flex items-center gap-space-sm px-space-md py-space-xs bg-surface-container-high rounded-full border border-secondary/20">
            <span className="material-symbols-outlined text-secondary text-title-md">military_tech</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                Nivel 28 • Maestro
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-bold leading-none">
                {userProfile ? `${userProfile.elo} ELO` : '1,840 ELO'}
              </span>
            </div>
          </div>

          {/* Chips */}
          <div className="flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container-high rounded-full border border-secondary/30">
            <span className="material-symbols-outlined text-secondary text-title-md">monetization_on</span>
            <span className="font-label-lg text-label-lg text-on-surface font-bold">
              {userProfile ? userProfile.chips.toLocaleString() : '14,250'}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Fichas</span>
          </div>

          {/* Jerarquía Button */}
          <button
            onClick={onToggleJerarquiaModal}
            className="hidden lg:flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container rounded-lg text-primary hover:bg-surface-container-high hover:text-on-surface transition-colors border border-primary/20 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-title-md">menu_book</span>
            <span className="font-label-md text-label-md uppercase tracking-wider font-bold">Jerarquía</span>
          </button>

          {/* Sound & Notifications */}
          <div className="flex items-center gap-space-xs">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-label="Sonido"
              className={`p-space-xs transition-colors rounded-lg cursor-pointer ${
                soundEnabled ? 'text-secondary' : 'text-outline-variant hover:text-on-surface'
              }`}
              type="button"
              title={soundEnabled ? 'Sonido activado' : 'Sonido silenciado'}
            >
              <span className="material-symbols-outlined text-title-lg">
                {soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notificaciones"
              className="relative p-space-xs text-on-surface-variant hover:text-secondary transition-colors rounded-lg cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-title-lg">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            </button>
          </div>

          {/* Google Sign-in or Avatar */}
          {userProfile ? (
            <div className="relative">
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-space-sm pl-space-xs cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  <img
                    alt={userProfile.displayName || 'Profile'}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/40"
                    src={
                      userProfile.photoURL ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBLecnXvJSNzE-Zj5ik_UP0YBsGBY3q2Fmx15OOXRaCruKgtUzRIZQ8gGlnb1uuCk6MDhr7_02Pqu4Z7YrPMXPmqSixyD_vzKCyUZ-6bA1ZFa_8ZnKS31PULHdv2BnPvhkmhE6VUzqjySniSeOHZVDcG0KluIwFUbl7Dlb5oshfVv2tIed6rhBUWGVvQMN8ZsYigjf2ylbhRy6ifdouTX_OyMCAM8Puth1hnW2Ol_sA1DFLuM9QgdU'
                    }
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-surface-container-low"></span>
                </div>
              </div>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-64 bg-surface-container p-3 rounded-xl shadow-2xl border border-surface-container-high z-50 text-xs">
                  <div className="pb-2 border-b border-surface-container-high mb-2">
                    <p className="font-bold text-on-surface text-sm truncate">{userProfile.displayName}</p>
                    <p className="text-on-surface-variant text-[11px] truncate">{userProfile.email}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-secondary font-bold">
                      <span>{userProfile.elo} ELO</span>
                      <span>•</span>
                      <span>{userProfile.chips.toLocaleString()} Fichas</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full text-left py-1.5 px-2 rounded hover:bg-error-container hover:text-on-error-container text-error transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-secondary/30 text-xs font-bold transition-all shadow cursor-pointer"
              type="button"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Acceder con Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="absolute right-6 top-20 w-80 bg-surface-container p-space-md rounded-xl shadow-2xl border border-surface-container-high z-50 text-sm">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container-high mb-2">
            <span className="font-title-md font-bold text-secondary">Avisos del Fogón</span>
            <button onClick={() => setShowNotifications(false)} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <div className="space-y-2">
            <div className="p-2 rounded bg-surface-container-low">
              <p className="font-bold text-primary">Copa La Espada Dorada</p>
              <p className="text-xs text-on-surface-variant">La inscripción cierra en breve. Faltan 16 cupos.</p>
            </div>
            <div className="p-2 rounded bg-surface-container-low">
              <p className="font-bold text-secondary">Facundo Albarracín</p>
              <p className="text-xs text-on-surface-variant">Te invitó a jugar en Pulpería de San Telmo.</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
