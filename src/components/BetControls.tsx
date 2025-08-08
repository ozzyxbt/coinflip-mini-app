import React from 'react';
import { Coins } from 'lucide-react';

type BetControlsProps = {
  betAmount: string;
  setBetAmount: (amount: string) => void;
  handleFlip: (amount?: string) => Promise<void>;
  minBet: string;
  maxBet: string;
  loading: boolean;
  disabled: boolean;
};

const BetControls: React.FC<BetControlsProps> = ({
  betAmount,
  setBetAmount,
  handleFlip,
  minBet,
  maxBet,
  loading,
  disabled
}) => {
  // Quick bet handler
  const quickBet = async (amount: string) => {
    setBetAmount(amount);
    setTimeout(() => {
      handleFlip(amount);
    }, 0);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Custom bet input and flip button */}
      <div className="flex gap-2 items-center justify-center w-full">
        <div className="bet-input-container flex-1 max-w-[200px]">
          <input
            type="text"
            value={betAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              // Allow only numbers and decimal point
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setBetAmount(value);
              }
            }}
            placeholder="Enter bet amount"
            className="bet-input"
            disabled={loading || disabled}
            min="0"
            step="0.01"
          />
          <span className="bet-currency">MON</span>
        </div>
        <button
          onClick={() => {
            const parsedAmount = parseFloat(betAmount);
            if (!isNaN(parsedAmount) && parsedAmount > 0) {
              handleFlip();
            }
          }}
          disabled={loading || disabled || !betAmount || parseFloat(betAmount) <= 0 || isNaN(parseFloat(betAmount))}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#836EF9] to-[#A0055D] text-white font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100 whitespace-nowrap"
        >
          {loading ? 'Flipping...' : 'Flip Coin'}
        </button>
      </div>

      {/* Quick bet buttons in a grid */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          className="bg-white text-[#836EF9] font-bold px-4 py-2 rounded-lg shadow-md border-2 border-[#836EF9] hover:bg-[#F3F0FF] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          onClick={() => quickBet('1')}
          disabled={loading || disabled}
        >
          <Coins size={16} className="text-yellow-500" />
          1 MON
        </button>
        <button
          type="button"
          className="bg-white text-[#836EF9] font-bold px-4 py-2 rounded-lg shadow-md border-2 border-[#836EF9] hover:bg-[#F3F0FF] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          onClick={() => quickBet('10')}
          disabled={loading || disabled}
        >
          <Coins size={16} className="text-yellow-500" />
          10 MON
        </button>
        <button
          type="button"
          className="bg-white text-[#836EF9] font-bold px-4 py-2 rounded-lg shadow-md border-2 border-[#836EF9] hover:bg-[#F3F0FF] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          onClick={() => quickBet('100')}
          disabled={loading || disabled}
        >
          <Coins size={16} className="text-yellow-500" />
          100 MON
        </button>
      </div>

      <div className="text-sm text-white text-opacity-80 bg-[#200052]/40 p-2 rounded-lg">
        <p>Min Bet: <span className="font-semibold">{minBet} MON</span> • Max Bet: <span className="font-semibold">{maxBet} MON</span></p>
      </div>
    </div>
  );
};

export default BetControls;