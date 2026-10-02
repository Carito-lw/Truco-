export type ScreenType = 'lobby-de-salas' | 'mesa-en-vivo' | 'torneos-y-copas' | 'anotador-digital';

export interface Room {
  id: string;
  name: string;
  host: string;
  hostInitials: string;
  points: 15 | 30;
  flor: boolean;
  turnTime: number;
  bet: number;
  mode: '1v1' | '2v2' | '3v3';
  playersCurrent: number;
  playersMax: number;
  tag?: string;
  isVip?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  isMe: boolean;
  text: string;
  time: string;
  isSystem?: boolean;
}

export interface SpanishCard {
  id: string;
  number: number;
  suit: 'espadas' | 'bastos' | 'oros' | 'copas';
  name: string;
  nickname?: string;
  hierarchyRank: number;
  hierarchyTag?: string;
}
