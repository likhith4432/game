
import React, { useState, useEffect } from 'react';
import { GameStatus, GameTheme, GameState, getRank } from './types';
import { generateGameFromPrompt } from './geminiService';
import GameEngine from './components/GameEngine';
import Header from './components/Header';
import { Rocket, Wand2, Play, RefreshCcw, Info, Trophy, Keyboard, Coins, Medal } from 'lucide-react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('Cyberpunk cat escape from robot dogs');
  const [loadingText, setLoadingText] = useState('Dreaming up the world...');
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    coins: 0,
    distance: 0,
    highScore: Number(localStorage.getItem('gemini_runner_highscore')) || 0,
    status: GameStatus.IDLE,
    theme: null,
  });

  const loadingMessages = [
    "Painting the horizons...",
    "Sourcing exotic emojis...",
    "Architecting lane physics...",
    "Gemini is thinking hard...",
    "Polishing the collectibles...",
    "Baking the world geometry..."
  ];

  useEffect(() => {
    let interval: any;
    if (gameState.status === GameStatus.GENERATING) {
      let i = 0;
      interval = setInterval(() => {
        setLoadingText(loadingMessages[i % loadingMessages.length]);
        i++;
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [gameState.status]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGameState(prev => ({ ...prev, status: GameStatus.GENERATING }));
    try {
      const theme = await generateGameFromPrompt(prompt);
      setGameState(prev => ({ ...prev, theme, status: GameStatus.READY }));
    } catch (error) {
      alert("Oops! Gemini ran into a hurdle. Try again.");
      setGameState(prev => ({ ...prev, status: GameStatus.IDLE }));
    }
  };

  const startGame = () => {
    setGameState(prev => ({ ...prev, status: GameStatus.PLAYING, score: 0, coins: 0, distance: 0 }));
  };

  const onGameOver = (finalScore: number, finalCoins: number) => {
    setGameState(prev => {
      const newHigh = Math.max(prev.highScore, finalScore);
      localStorage.setItem('gemini_runner_highscore', newHigh.toString());
      return { 
        ...prev, 
        status: GameStatus.GAMEOVER, 
        score: finalScore, 
        coins: finalCoins,
        highScore: newHigh 
      };
    });
  };

  const resetToMenu = () => {
    setGameState(prev => ({ ...prev, status: GameStatus.IDLE, theme: null }));
  };

  const rank = getRank(gameState.score);
  const nextRankThreshold = gameState.score < 300 ? 300 : gameState.score < 1000 ? 1000 : gameState.score < 2000 ? 2000 : 5000;
  const rankProgress = Math.min(100, (gameState.score / nextRankThreshold) * 100);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 selection:bg-indigo-500/30 font-sans">
      <Header />
      
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 flex flex-col items-center justify-center">
        {gameState.status === GameStatus.IDLE && (
          <div className="w-full max-w-3xl text-center space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-br from-white via-indigo-300 to-purple-500 bg-clip-text text-transparent">
                RUN YOUR WORLD
              </h1>
              <p className="text-slate-400 text-lg md:text-2xl max-w-xl mx-auto font-medium">
                Describe a universe. AI builds the gameplay.
              </p>
            </div>

            <div className="relative group p-1 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-2xl">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your game world..."
                className="w-full h-40 bg-slate-900 border-2 border-slate-800 rounded-[2.2rem] p-8 text-xl md:text-2xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none placeholder:text-slate-700"
              />
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="absolute bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/20 hover:shadow-indigo-500/40"
              >
                <Wand2 className="w-6 h-6" />
                FORGE
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {['8-Bit Mushroom Kingdom', 'Steampunk London Skies', 'Inside a Computer Chip', 'A Giant Candy Factory'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  className="px-5 py-2.5 rounded-full bg-slate-900/40 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-slate-100 transition-all text-sm font-bold uppercase tracking-wider"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState.status === GameStatus.GENERATING && (
          <div className="flex flex-col items-center space-y-10">
            <div className="relative">
              <div className="w-32 h-32 border-8 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
              <Rocket className="absolute inset-0 m-auto w-12 h-12 text-indigo-400 animate-bounce" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-4xl font-black text-white italic tracking-tighter animate-pulse">{loadingText}</p>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Building with Gemini 3 Flash</p>
            </div>
          </div>
        )}

        {gameState.status === GameStatus.READY && gameState.theme && (
          <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95 duration-500 backdrop-blur-2xl shadow-3xl">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 block">World Created</span>
                <h2 className="text-5xl font-black mb-3 tracking-tighter leading-tight">{gameState.theme.worldName}</h2>
                <p className="text-slate-400 leading-relaxed font-medium text-lg">{gameState.theme.description}</p>
              </div>
              <div 
                className="w-24 h-24 shrink-0 rounded-3xl flex items-center justify-center text-5xl shadow-2xl border-4"
                style={{ backgroundColor: gameState.theme.colors.background, borderColor: gameState.theme.colors.accent }}
              >
                {gameState.theme.character.emoji}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-slate-800/30 border border-slate-700/50">
                <p className="text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Hero</p>
                <p className="text-xl font-bold">{gameState.theme.character.name}</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-800/30 border border-slate-700/50">
                <p className="text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Global Best</p>
                <p className="text-xl font-bold text-indigo-400">{gameState.highScore}</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={startGame}
                className="w-full bg-white hover:bg-slate-200 text-black py-6 rounded-[1.5rem] font-black text-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.97] shadow-2xl"
              >
                <Play className="w-8 h-8 fill-current" />
                PLAY NOW
              </button>
              
              <button
                onClick={() => setGameState(prev => ({ ...prev, status: GameStatus.IDLE }))}
                className="w-full text-slate-500 hover:text-slate-300 font-bold py-2 transition-colors flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
              >
                <RefreshCcw className="w-3 h-3" />
                Change Prompt
              </button>
            </div>
          </div>
        )}

        {(gameState.status === GameStatus.PLAYING || gameState.status === GameStatus.GAMEOVER) && gameState.theme && (
          <div className="w-full flex flex-col items-center gap-6">
             <div className="w-full h-[650px] max-w-xl relative overflow-hidden rounded-[3rem] shadow-[0_0_100px_rgba(79,70,229,0.2)] border-8 border-slate-900 bg-slate-900">
                <GameEngine 
                  theme={gameState.theme} 
                  status={gameState.status} 
                  onGameOver={onGameOver} 
                  highScore={gameState.highScore}
                />
                
                {gameState.status === GameStatus.GAMEOVER && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center z-50 animate-in zoom-in-110 duration-300">
                    <div className="mb-4">
                      <div className="relative inline-block">
                        <Trophy className="w-20 h-20 text-yellow-500 mx-auto drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] animate-bounce" />
                        <div className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-full p-2 border-4 border-slate-950">
                          <Medal className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-indigo-400 font-black tracking-widest text-xs uppercase mb-1">Achieved Rank</p>
                      <h2 className={`text-5xl font-black italic tracking-tighter uppercase ${
                        rank === 'LEGENDARY' ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500' : 'text-white'
                      }`}>{rank}</h2>
                    </div>
                    
                    <div className="w-full max-w-xs mb-8 space-y-2">
                       <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                          <span>Progress to Next</span>
                          <span>{Math.round(rankProgress)}%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                            style={{ width: `${rankProgress}%` }}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full mb-10">
                       <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/10">
                          <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase mb-1">Score</p>
                          <p className="text-xl font-black text-white">{gameState.score}</p>
                       </div>
                       <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/10">
                          <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase mb-1">Coins</p>
                          <p className="text-xl font-black text-yellow-400 flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {gameState.coins}
                          </p>
                       </div>
                       <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/10">
                          <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase mb-1">Best</p>
                          <p className="text-xl font-black text-indigo-400">{gameState.highScore}</p>
                       </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                      <button
                        onClick={startGame}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/30"
                      >
                        <RefreshCcw className="w-5 h-5" />
                        RUN AGAIN
                      </button>
                      <button
                        onClick={resetToMenu}
                        className="bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Info className="w-4 h-4" />
                        MAIN MENU
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {gameState.status === GameStatus.PLAYING && (
                <div className="flex items-center gap-8 bg-slate-900/50 px-8 py-3 rounded-full border border-slate-800 text-slate-400 text-xs font-bold animate-in fade-in duration-1000">
                  <div className="flex items-center gap-2"><Keyboard className="w-4 h-4" /> Move: Arrows</div>
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                  <div>Jump: Up</div>
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                  <div>Slide: Down</div>
                </div>
              )}
          </div>
        )}
      </main>

      <footer className="p-8 text-center border-t border-slate-900 bg-slate-950">
        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium mb-1">
          <span>Created with</span>
          <Wand2 className="w-4 h-4 text-indigo-500" />
          <span>Gemini Intelligence</span>
        </div>
        <p className="text-slate-700 text-[10px] uppercase font-black tracking-widest">Endless Runner Generator 1.1</p>
      </footer>
    </div>
  );
};

export default App;
