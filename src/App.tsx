import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BetControls from './components/BetControls';
import ResultCard, { FlipResult } from './components/ResultCard';
import CoinFlipABI from './contracts/CoinFlip.json'
import { createAppClient, viemConnector } from '@farcaster/auth-client';
import '@farcaster/auth-kit/styles.css';
import { sdk } from '@farcaster/frame-sdk';
import { isFarcaster } from './utils/isFarcaster';

const CONTRACT_ADDRESS = '0x52540bEa8EdBD8DF057d097E4535ad884bB38a4B';

declare global {
  interface Window {
    ethereum: ethers.Eip1193Provider & { isMetaMask?: boolean; isCoinbaseWallet?: boolean };
  }
}

const App: React.FC = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [minBet, setMinBet] = useState('');
  const [maxBet, setMaxBet] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<FlipResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletSelected, setWalletSelected] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // Wallet selection logic
  const handleSelectWallet = (wallet: 'metamask' | 'coinbase') => {
    if (wallet === 'metamask' && window.ethereum?.isMetaMask) {
      setWalletSelected(true);
      setSelectedWallet('metamask');
      setError(null);
    } else if (wallet === 'coinbase' && window.ethereum?.isCoinbaseWallet) {
      setWalletSelected(true);
      setSelectedWallet('coinbase');
      setError(null);
    } else {
      setError('Selected wallet not found. Please install it and refresh the page.');
    }
  };

  // Initialize Farcaster Auth
  useEffect(() => {
    if (!walletSelected) return;
    if (isFarcaster()) {
      console.log("Farcaster environment detected, starting auth...");
      const initAuth = async () => {
        const appClient = createAppClient({
          relay: "https://relay.farcaster.xyz",
          ethereum: viemConnector(),
        });

        try {
          const { data } = await appClient.createChannel({
            siweUri: window.location.origin + "/login",
            domain: window.location.hostname,
          });
          console.log("Channel created", data);

          if (data) {
            const { data: statusData } = await appClient.watchStatus({
              channelToken: data.channelToken,
              timeout: 300_000,
              interval: 1_000,
            });
            console.log("Status data", statusData);

            if (statusData?.fid) {
              setIsConnected(true);
              console.log("Farcaster auth complete, UI enabled.");
            }
          }
        } catch (error) {
          setError('Farcaster authentication failed. Please make sure you are logged in to Warpcast.');
          console.error('Failed to authenticate with Farcaster:', error);
        }
      };

      initAuth();
    } else {
      setIsConnected(true);
      console.log("Not in Farcaster, UI enabled for dev.");
    }
  }, [walletSelected]);

  // Connect wallet and contract
  useEffect(() => {
    if (!walletSelected) return;
    const connect = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const _contract = new ethers.Contract(CONTRACT_ADDRESS, CoinFlipABI, signer);
          setContract(_contract);
          
          // Fetch min/max bet
          const min = await _contract.minBet();
          const max = await _contract.maxBet();
          setMinBet(ethers.formatEther(min));
          setMaxBet(ethers.formatEther(max));

          // Set up event listener using provider instead of contract
          const contractWithProvider = new ethers.Contract(CONTRACT_ADDRESS, CoinFlipABI, provider);
          contractWithProvider.on('FlipResult', (player: string, betAmount: ethers.BigNumberish, win: boolean, payout: ethers.BigNumberish) => {
            setLastResult({
              player,
              betAmount: ethers.formatEther(betAmount),
              win,
              payout: ethers.formatEther(payout)
            });
            setLoading(false);
          });

          // Cleanup function
          return () => {
            contractWithProvider.removeAllListeners('FlipResult');
          };
        } catch (error: unknown) {
          console.error('Connection error:', error);
          setError('Failed to connect wallet or contract.');
        }
      } else {
        setError('Please install MetaMask or Coinbase Wallet.');
      }
    };

    const cleanup = connect();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [walletSelected]);

  // Call Farcaster ready when UI is ready
  useEffect(() => {
    if (walletSelected && isFarcaster()) {
      sdk.actions.ready();
    }
  }, [walletSelected]);

  const handleFlip = async (amountOverride?: string) => {
    const amount = amountOverride || betAmount;
    if (!contract || !amount) return;
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.flip({ value: ethers.parseEther(amount) });
      await tx.wait();
      setBetAmount('');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message: string }).message || 'Transaction failed.');
      } else {
        setError('Transaction failed.');
      }
      setLoading(false);
    }
  };

  // Wallet selection UI
  if (!walletSelected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-[#836EF9]">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20 mx-auto flex flex-col items-center text-center relative overflow-hidden mt-4">
          <h2 className="text-2xl font-bold text-white mb-4">Select a wallet to connect:</h2>
          <div className="flex flex-col gap-4 w-full">
            <button
              className="bg-[#F6851B] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#e2761b] transition"
              onClick={() => handleSelectWallet('metamask')}
            >
              Connect MetaMask
            </button>
            <button
              className="bg-[#0052FF] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#003bbd] transition"
              onClick={() => handleSelectWallet('coinbase')}
            >
              Connect Coinbase Wallet
            </button>
          </div>
          {error && <div className="mt-4 text-red-500">{error}</div>}
        </div>
      </div>
    );
  }

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
          disabled={loading || !contract || !isConnected}
        />
        
        {/* Result display */}
        <ResultCard result={lastResult} />
        
        {/* Footer */}
        <div className="mt-8 text-xs text-white/50">
          <p>Built with ❤️</p>
        </div>
      </div>
    </div>
  );
};

export default App;