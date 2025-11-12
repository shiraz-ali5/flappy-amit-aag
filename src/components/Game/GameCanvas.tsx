import { useEffect, useRef, useState } from 'react';
import amitabhImg from '@/assets/amitabh.png';
import fireImg from '@/assets/fire.png';

interface GameCanvasProps {
  onGameOver: () => void;
  onScoreUpdate: (score: number) => void;
  isGameStarted: boolean;
  isGameOver: boolean;
  onRestart: () => void;
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Obstacle {
  x: number;
  topHeight: number;
  gap: number;
  passed: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export const GameCanvas = ({ 
  onGameOver, 
  onScoreUpdate, 
  isGameStarted, 
  isGameOver,
  onRestart 
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<{ amitabh: HTMLImageElement | null; fire: HTMLImageElement | null }>({
    amitabh: null,
    fire: null
  });

  // Game state
  const gameState = useRef({
    player: { x: 100, y: 250, width: 60, height: 60, velocity: 0 },
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    score: 0,
    frameCount: 0,
    gravity: 0.6,
    jumpStrength: -10,
    obstacleSpeed: 3,
    obstacleGap: 180,
    shake: 0,
  });

  // Load images
  useEffect(() => {
    const amitabh = new Image();
    const fire = new Image();

    amitabh.src = amitabhImg;
    fire.src = fireImg;

    amitabh.onload = () => {
      setImages(prev => ({ ...prev, amitabh }));
    };

    fire.onload = () => {
      setImages(prev => ({ ...prev, fire }));
    };
  }, []);

  // Reset game
  const resetGame = () => {
    gameState.current = {
      player: { x: 100, y: 250, width: 60, height: 60, velocity: 0 },
      obstacles: [],
      particles: [],
      score: 0,
      frameCount: 0,
      gravity: 0.6,
      jumpStrength: -10,
      obstacleSpeed: 3,
      obstacleGap: 180,
      shake: 0,
    };
    onScoreUpdate(0);
    onRestart();
  };

  // Handle jump
  const handleJump = () => {
    if (!isGameStarted || isGameOver) return;
    gameState.current.player.velocity = gameState.current.jumpStrength;
  };

  // Add event listeners
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
      }
    };

    const handleClick = () => {
      handleJump();
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleClick);
    };
  }, [isGameStarted, isGameOver]);

  // Create particles
  const createParticles = (x: number, y: number) => {
    for (let i = 0; i < 20; i++) {
      gameState.current.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        color: `hsl(${Math.random() * 60}, 100%, 60%)`,
      });
    }
  };

  // Check collision
  const checkCollision = (rect1: GameObject, rect2: GameObject): boolean => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  // Game loop
  useEffect(() => {
    if (!isGameStarted || isGameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = () => {
      const { player, obstacles, particles, shake } = gameState.current;

      // Clear canvas with shake effect
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      if (shake > 0) {
        ctx.translate(Math.random() * shake - shake / 2, Math.random() * shake - shake / 2);
        gameState.current.shake *= 0.9;
      }

      // Update player
      player.velocity += gameState.current.gravity;
      player.y += player.velocity;

      // Spawn obstacles
      if (gameState.current.frameCount % 120 === 0) {
        const topHeight = Math.random() * (canvas.height - gameState.current.obstacleGap - 100) + 50;
        obstacles.push({
          x: canvas.width,
          topHeight,
          gap: gameState.current.obstacleGap,
          passed: false,
        });
      }

      // Update and draw obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= gameState.current.obstacleSpeed;

        // Draw fire obstacles
        if (images.fire) {
          // Top fire
          ctx.save();
          ctx.translate(obstacle.x + 40, obstacle.topHeight);
          ctx.rotate(Math.PI);
          ctx.drawImage(images.fire, -40, -obstacle.topHeight, 80, obstacle.topHeight);
          ctx.restore();

          // Bottom fire
          const bottomY = obstacle.topHeight + obstacle.gap;
          ctx.drawImage(
            images.fire,
            obstacle.x,
            bottomY,
            80,
            canvas.height - bottomY
          );
        }

        // Check collision
        const topRect = { x: obstacle.x, y: 0, width: 80, height: obstacle.topHeight };
        const bottomRect = { 
          x: obstacle.x, 
          y: obstacle.topHeight + obstacle.gap, 
          width: 80, 
          height: canvas.height 
        };

        if (checkCollision(player, topRect) || checkCollision(player, bottomRect)) {
          createParticles(player.x + player.width / 2, player.y + player.height / 2);
          gameState.current.shake = 20;
          onGameOver();
        }

        // Update score
        if (!obstacle.passed && obstacle.x + 80 < player.x) {
          obstacle.passed = true;
          gameState.current.score++;
          onScoreUpdate(gameState.current.score);
        }

        // Remove off-screen obstacles
        if (obstacle.x + 80 < 0) {
          obstacles.splice(i, 1);
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.3;
        particle.life -= 0.02;

        if (particle.life > 0) {
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          particles.splice(i, 1);
        }
      }

      // Draw player
      if (images.amitabh) {
        ctx.save();
        ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        ctx.rotate(Math.min(player.velocity * 0.05, Math.PI / 4));
        ctx.drawImage(
          images.amitabh,
          -player.width / 2,
          -player.height / 2,
          player.width,
          player.height
        );
        ctx.restore();
      }

      // Check boundaries
      if (player.y + player.height > canvas.height || player.y < 0) {
        createParticles(player.x + player.width / 2, player.y + player.height / 2);
        gameState.current.shake = 20;
        onGameOver();
      }

      ctx.restore();
      gameState.current.frameCount++;
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isGameStarted, isGameOver, images, onGameOver, onScoreUpdate]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="w-full h-full border-4 border-primary rounded-lg shadow-[0_0_50px_rgba(255,107,53,0.5)]"
    />
  );
};
