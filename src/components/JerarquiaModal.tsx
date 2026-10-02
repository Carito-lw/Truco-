import React from 'react';

interface JerarquiaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JerarquiaModal: React.FC<JerarquiaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const cardRankings = [
    { rank: 1, name: 'Ancho de Espadas (El Macho)', suit: 'Espada', desc: 'La carta más poderosa del juego. Mata todo.' },
    { rank: 2, name: 'Ancho de Bastos (La Hembra / Bastillo)', suit: 'Basto', desc: 'Segunda carta más alta. Invencible salvo por el Espada.' },
    { rank: 3, name: 'Siete de Espadas (Siete Bravo)', suit: 'Espada', desc: 'Tercera brava. Mata al siete de oro y a los tres.' },
    { rank: 4, name: 'Siete de Oros (El Guacho / Siete Bravo)', suit: 'Oro', desc: 'Cuarta brava. Gana a todos los 3.' },
    { rank: 5, name: 'Todos los Tres (3E, 3B, 3O, 3C)', suit: 'Todos', desc: 'Matan a los dos. Si empatan en primera, deciden.' },
    { rank: 6, name: 'Todos los Dos (2E, 2B, 2O, 2C)', suit: 'Todos', desc: 'Matan a los unos falsos y figuras.' },
    { rank: 7, name: 'Unos Falsos (1 Copas, 1 Oros)', suit: 'Copa/Oro', desc: 'No son bravas. Matan a las figuras.' },
    { rank: 8, name: 'Doce (12), Once (11), Diez (10)', suit: 'Figuras', desc: 'Rey, Caballo y Sota en orden descendente.' },
    { rank: 9, name: 'Sietes Falsos (7 Copas, 7 Bastos)', suit: 'Copa/Basto', desc: 'No son bravas, pero suman 7 en el Envido.' },
    { rank: 10, name: 'Seises (6), Cincos (5), Cuatros (4)', suit: 'Bajas', desc: 'El cuatro es la carta más baja de la baraja.' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md p-gutter">
      <div className="relative w-full max-w-2xl bg-surface-container p-space-xl rounded-xl shadow-2xl border border-secondary/30 flex flex-col gap-space-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-headline-md">menu_book</span>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Jerarquía de Cartas Criollas</h2>
              <p className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">Reglamento Oficial Salón Argentino</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-space-xs">
          {cardRankings.map((item) => (
            <div key={item.rank} className="flex items-center justify-between p- space-xs px-3 py-2 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-space-sm">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${item.rank <= 4 ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface'}`}>
                  {item.rank}
                </span>
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-surface font-bold">{item.name}</span>
                  <span className="text-xs text-on-surface-variant">{item.desc}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container text-secondary text-xs font-bold">
                {item.suit}
              </span>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-primary-container/40 border border-primary/20 text-xs text-on-primary-container">
          <strong>Tip Criollo:</strong> El Envido se calcula sumando 20 más las dos cartas del mismo palo (las figuras 10, 11, 12 valen 0 para el Envido). Máximo posible: 33 puntos (7 y 6 del mismo palo).
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-space-lg py-2 bg-secondary text-on-secondary font-bold rounded-lg font-label-md"
          >
            Entendido, compadre
          </button>
        </div>
      </div>
    </div>
  );
};
