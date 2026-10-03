import React from "react";
import type { ScreenType } from "../types";
import type { UserProfile } from "../firebase";
interface Props {
  currentScreen: ScreenType;
  onNavigate: (s: ScreenType) => void;
  onToggleJerarquiaModal?: () => void;
  userProfile?: UserProfile | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onOpenLiveVoice?: () => void;
}
export const Header = ({
  onNavigate,
  onToggleJerarquiaModal,
  userProfile,
  onLogin,
  onLogout,
}: Props) => (
  <header className="app-nav">
    <button className="app-brand" onClick={() => onNavigate("lobby-de-salas")}>
      Truco Criollo
    </button>
    <nav aria-label="Navegación principal">
      <button
        className="table-btn desktop-nav"
        onClick={() => onNavigate("anotador-digital")}
      >
        Anotador
      </button>
      <button className="table-btn" onClick={onToggleJerarquiaModal}>
        Cartas
      </button>
      <button className="table-btn" onClick={userProfile ? onLogout : onLogin}>
        {userProfile ? "Cerrar sesión" : "Ingresar"}
      </button>
    </nav>
  </header>
);
