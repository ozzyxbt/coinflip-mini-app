import React, { useState, useEffect, useCallback } from 'react';
import BetControls from './components/BetControls';
import ResultCard, { FlipResult } from './components/ResultCard';
import CoinFlipABI from './contracts/CoinFlip.json';
import { sdk } from '@farcaster/frame-sdk';
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseEther, formatEther, type Hash } from 'viem';

const CONTRACT_ADDRESS = '0x52540bEa8EdBD8DF057d097E4535ad884bB38a4B';

const App: React.FC = () => {
  const [betAmount, setBetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<FlipResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hash | undefined>();
  const [showSplash, setShowSplash] = useState(true);

  // Wagmi hooks
  const { isConnected, address, chainId } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // Read minBet and maxBet
  const { data: minBetRaw } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CoinFlipABI,
    functionName: 'minBet',
  });
  const { data: maxBetRaw } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CoinFlipABI,
    functionName: 'maxBet',
  });
  const minBet = minBetRaw ? formatEther(minBetRaw as bigint) : '';
  const maxBet = maxBetRaw ? formatEther(maxBetRaw as bigint) : '';

  // Write: flip
  const { writeContractAsync } = useWriteContract();

  // Wait for transaction receipt and extract logs
  const { data: receipt, isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Initialize SDK and hide splash
  useEffect(() => {
    // Signal to Farcaster that the app is ready
    sdk.actions.ready();
    
    // Hide splash screen after a brief moment
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Auto-connect wallet when app loads
  useEffect(() => {
    if (!isConnected && connectors.length > 0 && !showSplash) {
      connectAsync({ connector: connectors[0] }).catch(err => {
        console.error('Auto-connect failed:', err);
      });
    }
  }, [isConnected, connectors, connectAsync, showSplash]);

  // Auto-switch to Monad Testnet if needed
  useEffect(() => {
    if (isConnected && chainId && chainId !== 10143) {
      switchChain({ chainId: 10143 }).catch(err => {
        console.error('Failed to switch chain:', err);
        setError('Please switch to Monad Testnet');
      });
    }
  }, [isConnected, chainId, switchChain]);

  // Process transaction receipt and extract result
  useEffect(() => {
    if (receipt && receipt.logs && receipt.logs.length > 0) {
      console.log('Transaction receipt:', receipt);
      
      // Try to find the FlipResult event in the logs
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
          try {
            // FlipResult event signature
            const flipResultTopic = '0xa7dca083af9d4a18995955808b492a05018568056be61b7abedebaa03c7c5872';
            
            if (log.topics[0] === flipResultTopic) {
              // Extract values from log data
              // The event is: FlipResult(indexed address player, uint256 betAmount, bool win, uint256 payout)
              // player is indexed (topics[1]), others are in data
              
              // Decode the data field
              const data = log.data.slice(2); // Remove 0x prefix
              
              // Each value is 32 bytes (64 hex chars)
              const betAmountHex = '0x' + data.slice(0, 64);
              const winHex = '0x' + data.slice(64, 128);
              const payoutHex = '0x' + data.slice(128, 192);
              
              const betAmountValue = BigInt(betAmountHex);
              const winValue = winHex === '0x0000000000000000000000000000000000000000000000000000000000000001';
              const payoutValue = BigInt(payoutHex);
              
              console.log('Decoded FlipResult:', {
                betAmount: formatEther(betAmountValue),
                win: winValue,
                payout: formatEther(payoutValue)
              });
              
              setLastResult({
                player: address || '',
                betAmount: formatEther(betAmountValue),
                win: winValue,
                payout: formatEther(payoutValue),
              });
              
              break;
            }
          } catch (err) {
            console.error('Error decoding log:', err);
          }
        }
      }
    }
  }, [receipt, address]);

  const handleFlip = useCallback(async (amountOverride?: string) => {
    const amount = amountOverride || betAmount;
    if (!amount) return;
    
    console.log('Starting flip with amount:', amount);
    setLoading(true);
    setError(null);
    setTxHash(undefined);
    
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CoinFlipABI,
        functionName: 'flip',
        value: parseEther(amount),
      });
      
      console.log('Transaction sent with hash:', hash);
      setTxHash(hash);
      setBetAmount('');
      
      // Clear previous result
      setLastResult(null);
      
    } catch (err: unknown) {
      console.error('Transaction failed:', err);
      const errorMessage = (err as Error)?.message || 'Transaction failed.';
      
      // Parse common error messages
      if (errorMessage.includes('BetTooLow')) {
        setError(`Minimum bet is ${minBet} MON`);
      } else if (errorMessage.includes('BetTooHigh')) {
        setError(`Maximum bet is ${maxBet} MON`);
      } else if (errorMessage.includes('InsufficientContractBalance')) {
        setError('Contract has insufficient balance');
      } else if (errorMessage.includes('User rejected') || errorMessage.includes('User denied')) {
        setError('Transaction rejected');
      } else {
        setError('Transaction failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [betAmount, writeContractAsync, minBet, maxBet]);

  // Show splash screen
  if (showSplash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#200052] via-[#836EF9] to-[#A0055D]">
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4">🪙</div>
          <h1 className="text-4xl font-bold text-white mb-2">CoinFlip</h1>
          <p className="text-white/80 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show connecting state
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-[#200052] via-[#836EF9] to-[#A0055D]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🪙</div>
          <h1 className="text-4xl font-bold text-white mb-2">CoinFlip</h1>
          <p className="text-white/80 text-lg">Connecting wallet...</p>
          {error && (
            <div className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}
          {connectors.length > 0 && (
            <button
              onClick={() => connectAsync({ connector: connectors[0] })}
              className="mt-4 px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
            >
              Connect Manually
            </button>
          )}
        </div>
      </div>
    );
  }

  // Main app UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-[#836EF9]">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/20 mx-auto flex flex-col items-center text-center relative overflow-hidden">
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#200052] via-[#836EF9] to-[#A0055D]" />
        
        {/* Logo and title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white text-center tracking-tight mb-1 sm:mb-2">
          CoinFlip
        </h1>
        <p className="text-white/70 mb-4 sm:mb-6 text-sm sm:text-base">Double or nothing</p>
        
        {/* Status indicator */}
        {isWaitingForReceipt && (
          <div className="mb-4 bg-yellow-100/90 text-yellow-800 px-3 py-2 rounded-lg text-sm animate-pulse">
            ⏳ Processing transaction...
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        {/* Bet controls */}
        <BetControls
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          handleFlip={handleFlip}
          minBet={minBet}
          maxBet={maxBet}
          loading={loading || isWaitingForReceipt}
          disabled={loading || isWaitingForReceipt}
        />
        
        {/* Result display */}
        {lastResult && <ResultCard result={lastResult} />}
        
        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-xs text-white/50">
          <p>Built with ❤️ on Monad</p>
          <button className="ml-2 text-xs underline" onClick={() => disconnect()}>Disconnect</button>
        </div>
      </div>
    </div>
  );
};

export default App;