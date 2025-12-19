
export enum GameStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  READY = 'READY',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export interface GameTheme {
  worldName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
  character: {
    name: string;
    emoji: string;
    description: string;
  };
  obstacles: Array<{
    name: string;
    emoji: string;
    behavior: 'static' | 'moving';
    type: 'jump' | 'slide' | 'dodge';
  }>;
  collectibles: Array<{
    name: string;
    emoji: string;
    points: number;
  }>;
}

export interface GameState {
  score: number;
  coins: number;
  distance: number;
  highScore: number;
  status: GameStatus;
  theme: GameTheme | null;
}

export type PlayerRank = 'NOVICE' | 'RACER' | 'ELITE' | 'MASTER' | 'LEGENDARY';

export const getRank = (score: number): PlayerRank => {
  if (score > 5000) return 'LEGENDARY';
  if (score > 2000) return 'MASTER';
  if (score > 1000) return 'ELITE';
  if (score > 300) return 'RACER';
  return 'NOVICE';
};
