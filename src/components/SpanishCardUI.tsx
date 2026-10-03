import React from "react";
import type { Card, Suit } from "../utils/trucoEngine";
interface Props {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  isPlayable?: boolean;
  size?: "sm" | "md" | "lg";
}
function SuitArt({ suit }: { suit: Suit }) {
  if (suit === "oros")
    return (
      <g>
        <circle
          cx="20"
          cy="25"
          r="15"
          fill="#e5b943"
          stroke="#9e6222"
          strokeWidth="2"
        />
        <circle cx="20" cy="25" r="10" fill="none" stroke="#a67225" />
        <path
          d="m20 16 3 6 7 3-7 3-3 6-3-6-7-3 7-3z"
          fill="#fff3b9"
          stroke="#9e6222"
        />
      </g>
    );
  if (suit === "copas")
    return (
      <g stroke="#805629" strokeWidth="1.5">
        <path d="M7 9h26c0 13-5 20-13 21C12 29 7 22 7 9Z" fill="#dca839" />
        <ellipse cx="20" cy="10" rx="12" ry="4" fill="#a23c32" />
        <path d="M18 29h4v11l9 4H9l9-4z" fill="#dca839" />
        <path d="M12 15c1 6 3 9 5 11" fill="none" stroke="#fff2bd" />
      </g>
    );
  if (suit === "espadas")
    return (
      <g stroke="#264957" strokeWidth="1.5">
        <path d="m20 2 5 9-3 24h-4l-3-24z" fill="#9eb9c3" />
        <path d="M20 5v29" stroke="#fff" />
        <path d="M9 33q11 5 22 0v5H9zM18 38h4v9h-4z" fill="#dcb24c" />
        <circle cx="20" cy="47" r="2.5" fill="#b65639" />
      </g>
    );
  return (
    <g stroke="#345537" strokeWidth="1.5">
      <path
        d="M17 47c-1-8-6-21-7-31S15 2 20 3s12 4 10 14-6 23-7 30z"
        fill="#b29148"
      />
      <path d="m18 42-2-25m7 19 2-22" stroke="#604b2a" />
      <path
        d="m14 25-8-6 6-2m14 12 9-9-7 1M15 10l-5-5m15 7 7-4"
        fill="#38794d"
      />
    </g>
  );
}
export const SpanishCardUI = ({
  card,
  onClick,
  disabled = false,
  className = "",
  size = "md",
}: Props) => {
  const art = (
    <svg viewBox="0 0 100 150" aria-hidden="true">
      <rect
        x="4"
        y="4"
        width="92"
        height="142"
        rx="5"
        fill="#fbf5e5"
        stroke="#c5af83"
      />
      <rect
        x="9"
        y="9"
        width="82"
        height="132"
        rx="3"
        fill="none"
        stroke="#b59e7344"
      />
      <g
        fill={card.suit === "copas" ? "#923932" : "#263e39"}
        fontFamily="Georgia,serif"
        fontWeight="bold"
        fontSize="20"
      >
        <text x="12" y="26">
          {card.number}
        </text>
        <text transform="rotate(180 50 75)" x="12" y="26">
          {card.number}
        </text>
      </g>
      {card.number < 10 ? (
        <g>
          {Array.from({ length: card.number }, (_, i) => {
            const n = card.number;
            const single = n === 1;
            const x = single
              ? 25
              : n % 2 && i === n - 1
                ? 37
                : i % 2 === 0
                  ? 18
                  : 56;
            const y = single
              ? 43
              : n % 2 && i === n - 1
                ? 56
                : 30 + Math.floor(i / 2) * (n > 5 ? 28 : 40);
            return (
              <g
                key={i}
                transform={`translate(${x} ${y}) scale(${single ? 1.25 : 0.65})`}
              >
                <SuitArt suit={card.suit} />
              </g>
            );
          })}
        </g>
      ) : (
        <g>
          <path
            d="M28 118 35 65h30l7 53Z"
            fill={card.suit === "copas" ? "#983d34" : "#315e75"}
            stroke="#b68d37"
            strokeWidth="2"
          />
          <path d="m50 67-9 48h18Z" fill="#ddad48" />
          <circle cx="50" cy="51" r="12" fill="#e4be91" stroke="#8d6340" />
          <path
            d={
              card.number === 12
                ? "m37 40-3-14 10 7 6-12 6 12 10-7-3 14z"
                : "M35 40q15-20 30 0z"
            }
            fill="#d3a43a"
            stroke="#8a6026"
          />
          <path d="M44 53q6 7 12 0" fill="none" stroke="#8d6340" />
          <g transform="translate(59 70) scale(.7)">
            <SuitArt suit={card.suit} />
          </g>
          <text
            x="50"
            y="132"
            textAnchor="middle"
            fontFamily="Georgia"
            fontSize="9"
            fill="#594b36"
          >
            {card.number === 10
              ? "SOTA"
              : card.number === 11
                ? "CABALLO"
                : "REY"}
          </text>
          {card.number === 11 && (
            <path
              d="m21 102 1-18 12-11 7 4-5 12-8-1 6 17z"
              fill="#e6ded0"
              stroke="#6d6252"
            />
          )}
        </g>
      )}
    </svg>
  );
  const cls = `spanish-card card-${size} ${className}`;
  return onClick ? (
    <button
      type="button"
      className={cls}
      disabled={disabled}
      onClick={onClick}
      aria-label={`Jugar ${card.number} de ${card.suit}`}
    >
      {art}
    </button>
  ) : (
    <div
      className={cls}
      role="img"
      aria-label={`${card.number} de ${card.suit}`}
    >
      {art}
    </div>
  );
};
