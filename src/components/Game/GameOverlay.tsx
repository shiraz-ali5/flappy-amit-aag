import { Button } from '@/components/ui/button';

interface GameOverlayProps {
  isGameStarted: boolean;
  isGameOver: boolean;
  score: number;
  onStart: () => void;
  onRestart: () => void;
}

export const GameOverlay = ({ 
  isGameStarted, 
  isGameOver, 
  score, 
  onStart, 
  onRestart 
}: GameOverlayProps) => {
  if (!isGameStarted) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
        <h1 className="game-title text-6xl md:text-8xl font-black mb-8 text-primary animate-float">
          FLAPPY<br />
          <span className="text-secondary">AMITABH</span>
        </h1>
        <p className="text-2xl md:text-3xl text-accent mb-8 font-bold animate-pulse">
          🔥 MKB AAG EDITION 🔥
        </p>
        <Button
          onClick={onStart}
          size="lg"
          className="bg-gradient-fire text-2xl font-black py-8 px-12 fire-glow hover:scale-110 transition-transform"
        >
          TAP TO START
        </Button>
        <p className="mt-8 text-muted-foreground text-lg">
          Click or press SPACE to flap
        </p>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-shake">
        <div className="text-center space-y-6 animate-scale-in">
          <h2 className="text-6xl md:text-7xl font-black text-destructive game-title">
            🔥 MKB AAG! 🔥
          </h2>
          <p className="text-3xl md:text-4xl font-bold text-foreground">
            GAME OVER
          </p>
          <div className="bg-card/90 rounded-2xl p-8 border-4 border-primary fire-glow">
            <p className="text-xl text-muted-foreground mb-2">Final Score</p>
            <p className="text-6xl font-black text-primary">{score}</p>
          </div>
          <Button
            onClick={onRestart}
            size="lg"
            className="bg-gradient-fire text-2xl font-black py-8 px-12 fire-glow hover:scale-110 transition-transform mt-8"
          >
            RESTART
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2">
      <div className="bg-card/90 rounded-2xl px-8 py-4 border-4 border-primary fire-glow">
        <p className="text-lg text-muted-foreground text-center">SCORE</p>
        <p className="text-5xl font-black text-primary text-center">{score}</p>
      </div>
    </div>
  );
};
