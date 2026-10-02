import React from 'react';
import { Card, Suit } from '../utils/trucoEngine';

interface SpanishCardUIProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  isPlayable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SpanishCardUI: React.FC<SpanishCardUIProps> = ({
  card,
  onClick,
  disabled,
  className = '',
  isPlayable = true,
  size = 'md',
}) => {
  const isEspada = card.suit === 'espadas';
  const isBasto = card.suit === 'bastos';
  const isOro = card.suit === 'oros';
  const isCopa = card.suit === 'copas';

  const isSmall = size === 'sm';

  // Primary colors
  const primaryColor = isEspada
    ? 'text-[#0F3826]'
    : isBasto
    ? 'text-[#653E00]'
    : isOro
    ? 'text-[#8A5200]'
    : 'text-[#6A000B]';

  const badgeColor = isEspada
    ? 'bg-gradient-to-r from-[#D4AF37] via-[#FFDE73] to-[#C19A26] text-[#2A1700]'
    : isBasto
    ? 'bg-[#472A00] text-[#FFB95F] border border-[#8A5200]'
    : isOro
    ? 'bg-gradient-to-r from-[#EE9800] to-[#FFB95F] text-[#381F00]'
    : 'bg-gradient-to-r from-[#6A000B] to-[#930013] text-[#FFDAD7]';

  // Center vector rendering
  const renderCenterArt = () => {
    const iconSize = isSmall ? 'w-8 h-8' : 'w-11 h-11';
    if (isEspada) {
      return (
        <svg className={`${iconSize} filter drop-shadow-sm`} viewBox="0 0 80 80" fill="none">
          <line x1="20" y1="64" x2="60" y2="16" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <line x1="20" y1="64" x2="60" y2="16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="40" cy="40" r="7" fill="#D4AF37" stroke="#927218" strokeWidth="2" />
          <path d="M26 58L20 64L22 66L28 60" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (isBasto) {
      return (
        <svg className={`${iconSize} filter drop-shadow-sm`} viewBox="0 0 80 80" fill="none">
          <path d="M22 62C20 60 21 57 23 55L53 23C56 20 60 21 62 23C64 25 64 28 62 30L32 62C30 64 24 64 22 62Z" fill="#B4710A" stroke="#472A00" strokeWidth="1.5" />
          <ellipse cx="38" cy="42" rx="4" ry="8" transform="rotate(-45 38 42)" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
          <circle cx="58" cy="24" r="3.5" fill="#EE9800" stroke="#FFE17D" strokeWidth="1" />
        </svg>
      );
    }
    if (isOro) {
      return (
        <svg className={`${iconSize} filter drop-shadow-sm`} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="22" fill="#FBBF24" stroke="#874F03" strokeWidth="2" />
          <circle cx="40" cy="40" r="14" fill="#FDE047" stroke="#B45309" strokeWidth="1" />
          <polygon points="40,30 43,37 50,40 43,43 40,50 37,43 30,40 37,37" fill="#FFFBEB" />
        </svg>
      );
    }
    // Copas
    return (
      <svg className={`${iconSize} filter drop-shadow-sm`} viewBox="0 0 80 80" fill="none">
        <path d="M24 20H56C56 38 46 48 40 50C34 48 24 38 24 20Z" fill="#EAB308" stroke="#713F12" strokeWidth="1.5" />
        <ellipse cx="40" cy="24" rx="14" ry="3" fill="#991B1B" />
        <rect x="38" y="50" width="4" height="14" fill="#EAB308" />
        <path d="M28 68C36 65 44 65 52 68H28Z" fill="#EAB308" />
      </svg>
    );
  };

  const renderSuitIcon = (customSize?: string) => {
    const sizeCls = customSize || (isSmall ? 'w-2.5 h-2.5' : 'w-3 h-3');
    if (isEspada) {
      return (
        <svg className={`${sizeCls} text-[#1E5C3E]`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15 8H9L12 2ZM11 9H13V18H11V9ZM7 19H17V21H7V19Z" />
        </svg>
      );
    }
    if (isBasto) {
      return (
        <svg className={`${sizeCls} text-[#EE9800]`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.5 4.5C18.5 3.5 17 3.5 16 4.5L6.5 14C5.5 15 5.5 16.5 6.5 17.5L8.5 19.5C9.5 20.5 11 20.5 12 19.5L21.5 10C22.5 9 22.5 7.5 21.5 6.5L19.5 4.5Z" />
        </svg>
      );
    }
    if (isOro) {
      return (
        <svg className={`${sizeCls} text-[#EE9800]`} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="8" stroke="#8A5200" strokeWidth="2" fill="none" />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      );
    }
    return (
      <svg className={`${sizeCls} text-[#930013]`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 3H19C19 8.5 15 11.5 13 12V18H17V20H7V18H11V12C9 11.5 5 8.5 5 3Z" />
      </svg>
    );
  };

  return (
    <div
      onClick={!disabled && onClick ? onClick : undefined}
      className={`group relative bg-gradient-to-b from-[#FFFDF8] via-[#FAF5EA] to-[#EFE4D2] rounded-xl shadow-lg ${
        isSmall ? 'p-1.5' : 'p-2'
      } flex flex-col justify-between border-2 border-[#D4AF37] transition-all duration-200 select-none overflow-hidden ${
        isPlayable && !disabled
          ? 'cursor-pointer hover:-translate-y-3 hover:z-30 hover:scale-105 active:scale-95 ring-2 ring-primary/40'
          : ''
      } ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''} ${className}`}
    >
      {/* Gold Foil Inset Rim */}
      <div className="absolute inset-0.5 rounded-lg border border-[#D4AF37]/40 pointer-events-none"></div>

      {/* Hierarchy Badge if any */}
      {card.tierTag && !isSmall && (
        <div
          className={`absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider shadow flex items-center gap-0.5 z-20 border border-white/40 ${badgeColor}`}
        >
          <span>{card.tierTag}</span>
        </div>
      )}

      {/* Top Left Index */}
      <div className="flex items-center justify-between leading-none z-10">
        <div className="flex flex-col items-center">
          <span className={`font-black leading-none ${isSmall ? 'text-sm' : 'text-base sm:text-lg'} ${primaryColor}`}>
            {card.number}
          </span>
          <div className="mt-0.5">{renderSuitIcon()}</div>
        </div>
        {!isSmall && (
          <span className={`text-[8px] font-bold uppercase tracking-wider opacity-60 ${primaryColor}`}>
            {card.suit}
          </span>
        )}
      </div>

      {/* Center Art */}
      <div className="relative flex flex-col items-center justify-center my-auto z-10">
        {renderCenterArt()}
        <span className={`font-bold uppercase tracking-tight text-center leading-none mt-0.5 ${
          isSmall ? 'text-[9px]' : 'text-[10px] sm:text-[11px]'
        } ${primaryColor}`}>
          {card.shortName || `${card.number} ${card.suit}`}
        </span>
      </div>

      {/* Bottom Right Index */}
      <div className="flex items-center justify-between leading-none rotate-180 z-10">
        <div className="flex flex-col items-center">
          <span className={`font-black leading-none ${isSmall ? 'text-sm' : 'text-base sm:text-lg'} ${primaryColor}`}>
            {card.number}
          </span>
          <div className="mt-0.5">{renderSuitIcon()}</div>
        </div>
      </div>
    </div>
  );
};
