import React from 'react';

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
  if (!result) return null;

  return (
    <div className={`mt-6 p-4 rounded-xl shadow text-center font-semibold text-lg transition-all duration-300 ${result.win ? 'bg-[#FBFAF9] text-[#200052] border-2 border-[#FFD700]' : 'bg-[#FBFAF9] text-[#A0055D] border-2 border-[#A0055D]'}`}>
      <div className="mb-1">Bet: <span className="font-bold">{result.betAmount} MON</span></div>
      <div className="mb-1">Result: <span className="font-bold">{result.win ? 'Win 🎉' : 'Lose 💀'}</span></div>
      {result.win && (
        <div>Payout: <span className="font-bold">{result.payout} MON</span></div>
      )}
    </div>
  );
};

export default ResultCard;