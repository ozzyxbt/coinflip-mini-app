import React, { useState, useEffect } from 'react';

type CoinProps = {
  flipping: boolean;
  result?: boolean | null;
  onAnimationComplete?: () => void;
};

const Coin: React.FC<CoinProps> = ({ flipping, result, onAnimationComplete }) => {
  const [animationState, setAnimationState] = useState<'idle' | 'flipping' | 'revealing' | 'complete'>('idle');
  const [finalResult, setFinalResult] = useState<boolean | null>(null);

  useEffect(() => {
    if (flipping && animationState !== 'flipping') {
      setAnimationState('flipping');
      
      // Schedule the reveal phase
      const flipTimer = setTimeout(() => {
        setAnimationState('revealing');
        setFinalResult(result);
        
        // After revealing, set to complete
        const completeTimer = setTimeout(() => {
          setAnimationState('complete');
          if (onAnimationComplete) onAnimationComplete();
        }, 1000);
        
        return () => clearTimeout(completeTimer);
      }, 1500);
      
      return () => clearTimeout(flipTimer);
    }
    
    // Reset when not flipping
    if (!flipping && animationState !== 'idle' && animationState === 'complete') {
      setAnimationState('idle');
    }
  }, [flipping, result, animationState, onAnimationComplete]);

  // When a new flip starts, reset the animation state
  useEffect(() => {
    if (flipping) {
      setAnimationState('flipping');
    }
  }, [flipping]);

  if (animationState === 'idle' && !finalResult) {
    return null;
  }

  return (
    <div className={`coin-container w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto relative ${animationState === 'complete' && finalResult ? 'scale-110 transition-transform' : ''}`}>
      <div 
        className={`coin relative w-full h-full ${
          animationState === 'flipping' 
            ? 'animate-flip' 
            : animationState === 'revealing' 
              ? 'animate-coin-bounce' 
              : ''
        }`}
      >
        {/* Heads - Win */}
        <div className="coin-side coin-heads flex items-center justify-center overflow-hidden">
          <div className={`text-7xl ${finalResult ? 'visible' : 'invisible'}`}>🏆</div>
          <div className="absolute inset-0 rounded-full border-4 border-[#200052] shadow-lg overflow-hidden">
            <div className="shimmer absolute inset-0"></div>
          </div>
        </div>
        
        {/* Tails - Lose */}
        <div className="coin-side coin-tails flex items-center justify-center overflow-hidden">
          <div className={`text-7xl ${finalResult === false ? 'visible' : 'invisible'}`}>💀</div>
          <div className="absolute inset-0 rounded-full border-4 border-[#200052] shadow-lg overflow-hidden">
            <div className="shimmer absolute inset-0"></div>
          </div>
        </div>
      </div>
      
      {/* Bottom shadow/glow effect */}
      <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 rounded-full blur-md ${
        finalResult ? 'bg-yellow-400/50' : finalResult === false ? 'bg-red-500/50' : 'bg-purple-400/30'
      }`}></div>
      
      {/* Win animation */}
      {animationState === 'complete' && finalResult && (
        <WinAnimation />
      )}
    </div>
  );
};

const WinAnimation: React.FC = () => {
  const [particles, setParticles] = useState<React.ReactNode[]>([]);
  
  useEffect(() => {
    const newParticles = [];
    const colors = ['#FFD700', '#FFC107', '#836EF9', '#200052', '#FFFFFF'];
    
    for (let i = 0; i < 30; i++) {
      const left = `${Math.random() * 100}%`;
      const delay = `${Math.random() * 1.5}s`;
      const duration = `${0.5 + Math.random() * 2}s`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = `${5 + Math.random() * 10}px`;
      
      const style = {
        left,
        animation: `confettiFall ${duration} ease-out ${delay} forwards`,
        backgroundColor: color,
        width: size,
        height: size,
      };
      
      newParticles.push(<div key={i} className="confetti absolute top-0" style={style} />);
    }
    
    setParticles(newParticles);
  }, []);
  
  return <div className="win-animation">{particles}</div>;
};

export default Coin;