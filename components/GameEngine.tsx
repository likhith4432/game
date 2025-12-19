
import React, { useRef, useEffect, useState } from 'react';
import { GameTheme, GameStatus } from '../types';

interface GameEngineProps {
  theme: GameTheme;
  status: GameStatus;
  onGameOver: (score: number, coins: number) => void;
  highScore: number;
}

const LANE_WIDTH = 120;
const GAME_WIDTH = LANE_WIDTH * 3;
const GAME_HEIGHT = 600;
const INITIAL_SPEED = 6;
const PLAYER_Y = 500;

interface Obstacle {
  id: number;
  lane: number;
  y: number;
  typeIndex: number;
  hit: boolean;
}

interface Collectible {
  id: number;
  lane: number;
  y: number;
  typeIndex: number;
  collected: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  text?: string;
}

const GameEngine: React.FC<GameEngineProps> = ({ theme, status, onGameOver, highScore }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  
  const stateRef = useRef({
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    speed: INITIAL_SPEED,
    frameCount: 0,
    score: 0,
    coins: 0,
    playerLane: 1,
    isJumping: false,
    jumpProgress: 0,
    isSliding: false,
    slideProgress: 0,
    lastSpawnFrame: 0,
    multiplier: 1,
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      
      const s = stateRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        s.playerLane = Math.max(0, s.playerLane - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        s.playerLane = Math.min(2, s.playerLane + 1);
      } else if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') {
        if (!s.isJumping && !s.isSliding) {
          s.isJumping = true;
          s.jumpProgress = 0;
        }
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        if (!s.isSliding && !s.isJumping) {
          s.isSliding = true;
          s.slideProgress = 0;
        } else if (s.isJumping) {
          s.isJumping = false;
          s.isSliding = true;
          s.slideProgress = 0;
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status]);

  const spawnParticles = (x: number, y: number, color: string, text?: string) => {
    for (let i = 0; i < (text ? 1 : 8); i++) {
      stateRef.current.particles.push({
        x, y,
        vx: text ? 0 : (Math.random() - 0.5) * 10,
        vy: text ? -2 : (Math.random() - 0.5) * 10,
        life: 1.0,
        color,
        text
      });
    }
  };

  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    stateRef.current = {
      obstacles: [],
      collectibles: [],
      particles: [],
      speed: INITIAL_SPEED,
      frameCount: 0,
      score: 0,
      coins: 0,
      playerLane: 1,
      isJumping: false,
      jumpProgress: 0,
      isSliding: false,
      slideProgress: 0,
      lastSpawnFrame: 0,
      multiplier: 1,
    };
    setScore(0);
    setCoins(0);
    setMultiplier(1);

    let animationId: number;

    const loop = () => {
      const s = stateRef.current;
      s.frameCount++;
      s.speed += 0.0005;

      // Distance scoring
      if (s.frameCount % 10 === 0) {
        s.score += s.multiplier;
        setScore(s.score);
      }

      // Multiplier increases every 1000 frames
      if (s.frameCount % 1000 === 0) {
        s.multiplier += 1;
        setMultiplier(s.multiplier);
        spawnParticles(GAME_WIDTH / 2, 100, '#fff', `X${s.multiplier} BOOST!`);
      }

      const spawnInterval = Math.max(25, Math.floor(60 / (s.speed / 5)));
      if (s.frameCount - s.lastSpawnFrame > spawnInterval) {
        s.lastSpawnFrame = s.frameCount;
        const numFilled = Math.random() > 0.75 ? 2 : 1;
        const availableLanes = [0, 1, 2].sort(() => Math.random() - 0.5);
        const filledLanes = availableLanes.slice(0, numFilled);

        filledLanes.forEach(lane => {
          const isCollectible = Math.random() > 0.8;
          if (isCollectible) {
            s.collectibles.push({
              id: Math.random(),
              lane,
              y: -100,
              typeIndex: Math.floor(Math.random() * theme.collectibles.length),
              collected: false
            });
          } else {
            s.obstacles.push({
              id: Math.random(),
              lane,
              y: -100,
              typeIndex: Math.floor(Math.random() * theme.obstacles.length),
              hit: false
            });
          }
        });
      }

      s.obstacles.forEach(o => o.y += s.speed);
      s.collectibles.forEach(c => c.y += s.speed);
      s.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
      });
      s.particles = s.particles.filter(p => p.life > 0);

      if (s.isJumping) {
        s.jumpProgress += 0.04;
        if (s.jumpProgress >= 1) {
          s.isJumping = false;
          s.jumpProgress = 0;
        }
      }
      if (s.isSliding) {
        s.slideProgress += 0.04;
        if (s.slideProgress >= 1) {
          s.isSliding = false;
          s.slideProgress = 0;
        }
      }

      const playerX = s.playerLane * LANE_WIDTH + LANE_WIDTH / 2;
      const jumpHeight = Math.sin(s.jumpProgress * Math.PI) * 100;

      s.obstacles.forEach(o => {
        if (!o.hit && o.lane === s.playerLane && Math.abs(o.y - PLAYER_Y) < 40) {
          const type = theme.obstacles[o.typeIndex].type;
          let collision = false;
          if (type === 'jump') {
            if (jumpHeight < 40) collision = true;
          } else if (type === 'slide') {
            if (!s.isSliding) collision = true;
          } else {
            collision = true;
          }

          if (collision) {
            o.hit = true;
            onGameOver(s.score, s.coins);
          }
        }
      });

      s.collectibles.forEach(c => {
        if (!c.collected && c.lane === s.playerLane && Math.abs(c.y - PLAYER_Y) < 50) {
          c.collected = true;
          const points = theme.collectibles[c.typeIndex].points;
          s.score += (points * s.multiplier);
          s.coins += 1;
          setScore(s.score);
          setCoins(s.coins);
          spawnParticles(playerX, c.y, theme.colors.accent, `+${points * s.multiplier}`);
        }
      });

      // DRAWING
      ctx.fillStyle = theme.colors.background;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = theme.colors.secondary;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.strokeStyle = theme.colors.accent + '22';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(LANE_WIDTH, 0); ctx.lineTo(LANE_WIDTH, GAME_HEIGHT);
      ctx.moveTo(LANE_WIDTH * 2, 0); ctx.lineTo(LANE_WIDTH * 2, GAME_HEIGHT);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      s.collectibles.forEach(c => {
        if (!c.collected) {
          ctx.font = '36px serif';
          ctx.fillText(theme.collectibles[c.typeIndex].emoji, c.lane * LANE_WIDTH + LANE_WIDTH / 2, c.y);
        }
      });

      s.obstacles.forEach(o => {
        const obsData = theme.obstacles[o.typeIndex];
        ctx.save();
        const x = o.lane * LANE_WIDTH + LANE_WIDTH / 2;
        if (obsData.type === 'slide') {
          ctx.fillStyle = theme.colors.primary + '44';
          ctx.fillRect(o.lane * LANE_WIDTH + 10, o.y - 80, LANE_WIDTH - 20, 40);
          ctx.font = '40px serif';
          ctx.fillText(obsData.emoji, x, o.y - 60);
        } else if (obsData.type === 'jump') {
          ctx.font = '40px serif';
          ctx.fillText(obsData.emoji, x, o.y);
        } else {
          ctx.font = '50px serif';
          ctx.fillText(obsData.emoji, x, o.y - 20);
        }
        ctx.restore();
      });

      s.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        if (p.text) {
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText(p.text, p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;

      ctx.save();
      const pEmoji = theme.character.emoji;
      ctx.font = s.isSliding ? '32px serif' : '52px serif';
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(playerX, PLAYER_Y + 10, 25 - jumpHeight/5, 10 - jumpHeight/10, 0, 0, Math.PI * 2);
      ctx.fill();

      const drawY = PLAYER_Y - jumpHeight;
      if (s.isSliding) {
        ctx.translate(playerX, drawY);
        ctx.scale(1.3, 0.6);
        ctx.fillText(pEmoji, 0, 0);
      } else {
        ctx.fillText(pEmoji, playerX, drawY);
      }
      ctx.restore();

      animationId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationId);
  }, [status, theme, onGameOver]);

  return (
    <div className="relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-30 pointer-events-none">
        <div className="flex flex-col drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <span className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.2em]">Score</span>
          <span className="text-5xl font-black italic text-white leading-none">{score}</span>
          <div className="mt-2 flex items-center gap-2">
            <span className="bg-white text-black px-2 py-0.5 rounded text-[10px] font-black italic">X{multiplier}</span>
            <span className="text-yellow-400 font-bold text-xs flex items-center">🪙 {coins}</span>
          </div>
        </div>
        <div className="flex flex-col items-end drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <span className="text-[10px] font-black uppercase text-pink-300 tracking-[0.2em]">High</span>
          <span className="text-2xl font-black italic text-white">{Math.max(highScore, score)}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default GameEngine;
