import React from 'react';

const CoinFlipFrame: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-[#836EF9]">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20 mx-auto flex flex-col items-center text-center relative overflow-hidden">
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#200052] via-[#836EF9] to-[#A0055D]" />
        
        {/* Logo and title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center tracking-tight mb-2">
          CoinFlip
        </h1>
        
        <p className="text-white/70 mb-6">Double or nothing</p>
        
        {/* Frame buttons */}
        <div className="flex flex-col gap-4 w-full">
          <button
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#836EF9] to-[#A0055D] text-white font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={() => window.location.href = '/flip/1'}
          >
            Bet 1 MON
          </button>
          
          <button
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#836EF9] to-[#A0055D] text-white font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={() => window.location.href = '/flip/10'}
          >
            Bet 10 MON
          </button>
          
          <button
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#836EF9] to-[#A0055D] text-white font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={() => window.location.href = '/flip/100'}
          >
            Bet 100 MON
          </button>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-xs text-white/50">
          <p>Built with ❤️</p>
        </div>
      </div>
    </div>
  );
};

export default CoinFlipFrame; 