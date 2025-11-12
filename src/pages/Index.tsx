import { useState, useRef, useEffect } from 'react';
import { GameCanvas } from '@/components/Game/GameCanvas';
import { GameOverlay } from '@/components/Game/GameOverlay';
import { toast } from 'sonner';

const Index = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  // Audio refs (users will need to add their own audio files)
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const gameOverAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio elements
    // Note: Users need to add aag_aag.mp3 and mkb_aag.mp3 to public/audio/ folder
    bgAudioRef.current = new Audio('/audio/aag_aag.mp3');
    gameOverAudioRef.current = new Audio('/audio/mkb_aag.mp3');
    
    if (bgAudioRef.current) {
      bgAudioRef.current.loop = true;
      bgAudioRef.current.volume = 0.5;
    }
    
    if (gameOverAudioRef.current) {
      gameOverAudioRef.current.volume = 0.7;
    }

    // Show toast about audio files
    const hasShownAudioToast = localStorage.getItem('audioToastShown');
    if (!hasShownAudioToast) {
      toast.info('Add your audio files to public/audio/ folder', {
        description: 'Place aag_aag.mp3 and mkb_aag.mp3 in public/audio/ for sound effects',
        duration: 5000,
      });
      localStorage.setItem('audioToastShown', 'true');
    }

    return () => {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
      }
      if (gameOverAudioRef.current) {
        gameOverAudioRef.current.pause();
      }
    };
  }, []);

  const handleStart = () => {
    setIsGameStarted(true);
    setIsGameOver(false);
    setScore(0);
    
    // Play background audio
    if (bgAudioRef.current) {
      bgAudioRef.current.currentTime = 0;
      bgAudioRef.current.play().catch(err => {
        console.log('Audio autoplay prevented:', err);
        toast.error('Click to enable sound');
      });
    }
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    
    // Stop background audio
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
    }
    
    // Play game over sound
    if (gameOverAudioRef.current) {
      gameOverAudioRef.current.currentTime = 0;
      gameOverAudioRef.current.play().catch(err => {
        console.log('Game over sound failed:', err);
      });
    }

    toast.error('🔥 MKB AAG!', {
      description: `You scored ${score} points!`,
    });
  };

  const handleRestart = () => {
    setIsGameStarted(false);
    setIsGameOver(false);
    setScore(0);
  };

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
    
    // Special milestone toasts
    if (newScore === 10) {
      toast.success('🔥 Legendary Move! 10 Points!', {
        description: 'Amitabh is unstoppable!',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background glow */}
      <div className="fixed inset-0 bg-gradient-glow opacity-50 animate-pulse pointer-events-none" />
      
      <div className="relative w-full max-w-4xl aspect-[4/3] bg-card/50 rounded-2xl border-4 border-primary/50 overflow-hidden shadow-2xl">
        <GameCanvas
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
          isGameStarted={isGameStarted}
          isGameOver={isGameOver}
          onRestart={handleRestart}
        />
        
        <GameOverlay
          isGameStarted={isGameStarted}
          isGameOver={isGameOver}
          score={score}
          onStart={handleStart}
          onRestart={handleRestart}
        />
      </div>

      {/* Instructions footer */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-center">
        <p className="text-muted-foreground text-sm">
          Made with 🔥 by Lovable AI
        </p>
      </div>
    </div>
  );
};

export default Index;
