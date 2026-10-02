import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-lowest py-space-xl border-t border-surface-container-high/40 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="w-full px-gutter-desktop flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <span className="font-headline-md text-headline-md text-primary">Truco Criollo</span>
          <span className="font-body-md text-body-md text-on-surface-variant">
            Puro envite, picardía y tradición argentina en alta fidelidad.
          </span>
        </div>
        <div className="flex items-center gap-space-lg flex-wrap">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-bold">
            Partida Encriptada • Fair Play RNG Certificado
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            © 2024 Salón Truco Criollo.
          </span>
        </div>
      </div>
    </footer>
  );
};
