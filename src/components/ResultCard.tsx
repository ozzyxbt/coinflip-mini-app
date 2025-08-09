import React, { useEffect, useState } from 'react';

export type FlipResult = {
  player: string;
  betAmount: string;
  win: boolean;
  payout: string;
} | null;

type ResultCardProps = {
  result: FlipResult;
};

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (result) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [result]);

  if (!result) return null;

  return (
    <div 
      className={`mt-6 p-4 rounded-xl shadow-lg text-center font-semibold transition-all duration-500 transform ${
        isAnimating ? 'scale-105' : 'scale-100'
      } ${
        result.win 
          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-400' 
          : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-400'
      }`}
    >
      {/* Result emoji */}
      <div className={`text-5xl mb-3 ${isAnimating ? 'animate-bounce' : ''}`}>
        {result.win ? '🎉' : '😢'}
      </div>
      
      {/* Result text */}
      <div className="text-2xl mb-2">
        {result.win ? 'You Won!' : 'You Lost'}
      </div>
      
      {/* Bet amount */}
      <div className="text-sm opacity-80 mb-1">
        Bet: <span className="font-bold">{result.betAmount} MON</span>
      </div>
      
      {/* Payout (only show if won) */}
      {result.win && (
        <div className="text-lg mt-2">
          <span className="text-green-600">+</span>
          <span className="font-bold text-green-700">{result.payout} MON</span>
        </div>
      )}
    </div>
  );
};

export default ResultCard;