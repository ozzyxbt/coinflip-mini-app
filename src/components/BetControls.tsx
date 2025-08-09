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

  // Handle input change with better validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string
    if (value === '') {
      setBetAmount('');
      return;
    }
    
    // Allow numbers with optional decimal point
    // Also allow trailing decimal point for typing convenience
    if (/^\d*\.?\d*$/.test(value)) {
      // Prevent multiple leading zeros
      if (value.startsWith('00')) {
        return;
      }
      
      // Limit decimal places to 18 (standard for ETH/MON)
      const parts = value.split('.');
      if (parts.length === 2 && parts[1].length > 18) {
        return;
      }
      
      setBetAmount(value);
    }
  };

  // Validate and handle flip
  const handleFlipClick = () => {
    const parsedAmount = parseFloat(betAmount);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      handleFlip();
    }
  };

  const isValidAmount = betAmount && !isNaN(parseFloat(betAmount)) && parseFloat(betAmount) > 0;

  return (
    <div className="space-y-4 w-full">
      {/* Custom bet input and flip button */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-center w-full">
        <div className="relative flex-1 sm:max-w-[200px]">
          <input
            type="text"
            inputMode="decimal"
            value={betAmount}
            onChange={handleInputChange}
            placeholder="Amount"
            className="w-full pr-14 bg-white/10 border border-white/20 rounded-lg text-white text-base px-3 py-3 sm:py-2.5 transition-all focus:outline-none focus:border-white/40 focus:bg-white/15 placeholder:text-white/50"
            disabled={loading || disabled}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 text-sm font-medium pointer-events-none">
            MON
          </span>
        </div>
        <button
          onClick={handleFlipClick}
          disabled={loading || disabled || !isValidAmount}
          className="px-6 py-3 sm:py-2.5 rounded-lg bg-gradient-to-r from-[#836EF9] to-[#A0055D] text-white font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100 whitespace-nowrap"
        >
          {loading ? 'Flipping...' : 'Flip Coin'}
        </button>
      </div>

      {/* Quick bet buttons in a grid */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          className="bg-white text-[#836EF9] font-bold px-2 sm:px-4 py-2.5 sm:py-2 rounded-lg shadow-md border-2 border-[#836EF9] hover:bg-[#F3F0FF] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col sm:flex-row items-center justify-center gap-1 text-sm sm:text-base"
          onClick={() => quickBet('1')}
          disabled={loading || disabled}
        >
          <Coins size={16} className="text-yellow-500" />
          <span>1 MON</span>
        </button>
        <button
          type="button"
          className="bg-white text-[#836EF9] font-bold px-2 sm:px-4 py-2.5 sm:py-2 rounded-lg shadow-md border-2 border-[#836EF9] hover:bg-[#F3F0FF] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col sm:flex-row items-center justify-center gap-1 text-sm sm:text-base"
          onClick={() => quickBet('10')}
          disabled={loading || disabled}
        >
          <Coins size={16} className="text-yellow-500" />
          <span>10 MON</span>
        </button>
        <button
          type="button"
          className="bg-white text-[#836EF9] font-bold px-2 sm:px-4 py-2.5 sm:py-2 rounded-lg shadow-md border-2 border-[#836EF9] hover:bg-[#F3F0FF] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col sm:flex-row items-center justify-center gap-1 text-sm sm:text-base"
          onClick={() => quickBet('100')}
          disabled={loading || disabled}
        >
          <Coins size={16} className="text-yellow-500" />
          <span>100 MON</span>
        </button>
      </div>

      {/* Bet limits info */}
      <div className="text-xs sm:text-sm text-white text-opacity-80 bg-[#200052]/40 p-2 rounded-lg">
        <p className="flex flex-wrap justify-center gap-2">
          <span>Min: <span className="font-semibold">{minBet || '0'} MON</span></span>
          <span className="hidden sm:inline">•</span>
          <span>Max: <span className="font-semibold">{maxBet || '0'} MON</span></span>
        </p>
      </div>
    </div>
  );
};

export default BetControls;