import React, { useState, useEffect, useCallback } from 'react';
import BetControls from './components/BetControls';
import ResultCard, { FlipResult } from './components/ResultCard';
import CoinFlipABI from './contracts/CoinFlip.json';
import { sdk } from '@farcaster/frame-sdk';
import { isFarcaster } from './utils/isFarcaster';
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, usePublicClient, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, decodeEventLog, type Hash } from 'viem';

const CONTRACT_ADDRESS = '0x52540bEa8EdBD8DF057d097E4535ad884bB38a4B';

const App: React.FC = () => {
  const [betAmount, setBetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<FlipResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [txHash, setTxHash] = useState<Hash | undefined>();

  // Wagmi hooks
  const { isConnected, address, chainId } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();

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

  // Wait for transaction receipt
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Function to poll for results
  const pollForResults = useCallback(async () => {
    if (!publicClient || !address) {
      console.log('Missing publicClient or address for polling');
      return;
    }
    
    console.log('Polling for results for address:', address);
    
    try {
      // Get recent logs from the last 100 blocks
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock > 100n ? currentBlock - 100n : 0n;
      
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        fromBlock: fromBlock,
        toBlock: 'latest',
      });
      
      console.log(`Fetched ${logs.length} total logs from block ${fromBlock} to latest`);
      
      // FlipResult event signature
      const flipResultTopic = '0xa7dca083af9d4a18995955808b492a05018568056be61b7abedebaa03c7c5872';
      
      // Filter logs for FlipResult events
      const flipResultLogs = logs.filter(log => 
        log.topics && log.topics[0] === flipResultTopic
      );
      
      console.log(`Found ${flipResultLogs.length} FlipResult events`);
      
      // Decode and filter for user's address
      const userResults: FlipResult[] = [];
      
      for (const log of flipResultLogs) {
        try {
          const decoded = decodeEventLog({
            abi: CoinFlipABI,
            data: log.data,
            topics: log.topics,
          });
          
          console.log('Decoded event:', decoded);
          
          // Check if this event is for our user
          let eventAddress: string | undefined;
          let eventBetAmount: bigint | undefined;
          let eventWin: boolean | undefined;
          let eventPayout: bigint | undefined;
          
          if (decoded.eventName === 'FlipResult') {
            if (decoded.args && Array.isArray(decoded.args)) {
              eventAddress = decoded.args[0] as string;
              eventBetAmount = decoded.args[1] as bigint;
              eventWin = decoded.args[2] as boolean;
              eventPayout = decoded.args[3] as bigint;
            } else if (decoded.args && typeof decoded.args === 'object') {
              const args = decoded.args as Record<string, unknown>;
              eventAddress = args.player as string || args.user as string || args.address as string;
              eventBetAmount = args.betAmount as bigint || args.amount as bigint;
              eventWin = args.win as boolean || args.won as boolean;
              eventPayout = args.payout as bigint || args.winAmount as bigint;
            }
            
            if (eventAddress && eventAddress.toLowerCase() === address.toLowerCase()) {
              console.log('Found user event:', { eventAddress, eventBetAmount, eventWin, eventPayout });
              userResults.push({
                player: eventAddress,
                betAmount: formatEther(eventBetAmount || 0n),
                win: eventWin || false,
                payout: formatEther(eventPayout || 0n),
              });
            }
          }
        } catch (decodeError) {
          console.error('Error decoding log:', decodeError);
        }
      }
      
      console.log(`Found ${userResults.length} results for user ${address}`);
      
      // Set the most recent result
      if (userResults.length > 0) {
        const mostRecent = userResults[userResults.length - 1];
        console.log('Setting last result:', mostRecent);
        setLastResult(mostRecent);
      }
    } catch (error) {
      console.error('Error polling for results:', error);
    }
  }, [publicClient, address]);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      console.log('Initializing app, isFarcaster:', isFarcaster());
      
      // If in Farcaster, wait a bit before calling ready
      if (isFarcaster()) {
        console.log('In Farcaster environment, waiting before ready...');
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Calling sdk.actions.ready()');
        sdk.actions.ready();
      }
      
      // Mark as initialized
      setIsInitialized(true);
      
      // Try to auto-connect wallet
      if (!isConnected && connectors.length > 0) {
        console.log('Attempting auto-connect with connector:', connectors[0]?.name);
        try {
          await connectAsync({ connector: connectors[0] });
          console.log('Auto-connect successful');
        } catch (err) {
          console.error('Auto-connect failed:', err);
          setError('Failed to connect wallet');
        }
      }
    };
    
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-switch to Monad Testnet if connected to wrong chain
  useEffect(() => {
    if (isConnected && chainId && chainId !== 10143) {
      console.log('Wrong chain detected, switching to Monad Testnet');
      switchChain({ chainId: 10143 }).catch(err => {
        console.error('Failed to switch chain:', err);
        setError('Please switch to Monad Testnet');
      });
    }
  }, [isConnected, chainId, switchChain]);

  // Poll for results when receipt is available
  useEffect(() => {
    if (receipt) {
      console.log('Transaction receipt received:', receipt);
      // Poll immediately after receipt
      pollForResults();
      // Poll again after a delay
      const timeout = setTimeout(() => {
        pollForResults();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [receipt, pollForResults]);

  // Regular polling for results
  useEffect(() => {
    if (!publicClient || !address) return;
    
    console.log('Setting up regular polling for address:', address);
    
    // Initial poll
    pollForResults();
    
    // Set up interval
    const interval = setInterval(() => {
      pollForResults();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [publicClient, address, pollForResults]);

  const handleFlip = async (amountOverride?: string) => {
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
      
    } catch (err: unknown) {
      console.error('Transaction failed:', err);
      setError((err as Error)?.message || 'Transaction failed.');
    }
    
    setLoading(false);
  };

  // Show splash screen only in Farcaster and only while not initialized
  if (isFarcaster() && !isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#200052] via-[#836EF9] to-[#A0055D]">
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4">🪙</div>
          <h1 className="text-4xl font-bold text-white mb-2">CoinFlip</h1>
          <p className="text-white/80 text-lg">Loading Farcaster...</p>
        </div>
      </div>
    );
  }

  // Show connecting state while wallet is being connected
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
        </div>
      </div>
    );
  }

  // Main app UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-[#836EF9]">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20 mx-auto flex flex-col items-center text-center relative overflow-hidden mt-4">
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#200052] via-[#836EF9] to-[#A0055D]" />
        
        {/* Logo and title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center tracking-tight mb-2">
          CoinFlip
        </h1>
        <p className="text-white/70 mb-6">Double or nothing</p>
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-white/50 mb-4">
            <p>Address: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
            <p>Chain: {chainId}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-center">
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
          loading={loading}
          disabled={loading}
        />
        
        {/* Result display */}
        <ResultCard result={lastResult} />
        
        {/* Footer */}
        <div className="mt-8 text-xs text-white/50">
          <p>Built with ❤️</p>
          <button className="ml-2 text-xs underline" onClick={() => disconnect()}>Disconnect</button>
        </div>
      </div>
    </div>
  );
};

export default App;