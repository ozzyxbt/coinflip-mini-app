import React, { useState, useEffect } from 'react';
import BetControls from './components/BetControls';
import ResultCard, { FlipResult } from './components/ResultCard';
import CoinFlipABI from './contracts/CoinFlip.json';
import { sdk } from '@farcaster/frame-sdk';
import { isFarcaster } from './utils/isFarcaster';
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { parseEther, formatEther, decodeEventLog } from 'viem';

const CONTRACT_ADDRESS = '0x52540bEa8EdBD8DF057d097E4535ad884bB38a4B';

const App: React.FC = () => {
  const [betAmount, setBetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<FlipResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Wagmi hooks
  const { isConnected, address } = useAccount();
  const { connectors, connect, status } = useConnect();
  const { disconnect } = useDisconnect();
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

  // Call Farcaster ready as soon as the UI is ready to show
  useEffect(() => {
    if (isFarcaster()) {
      sdk.actions.ready();
    }
  }, []);

  // Poll for last result after a flip
  useEffect(() => {
    if (!publicClient || !address) return;
    const poll = async () => {
      try {
        // Get all logs for the contract
        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          fromBlock: 0n,
          toBlock: 'latest',
        });
        // FlipResult(address,uint256,bool,uint256) topic hash
        const flipResultTopic = '0xa7dca083af9d4a18995955808b492a05018568056be61b7abedebaa03c7c5872';
        const userLogs = logs.filter(log =>
          log.topics &&
          log.topics[0] === flipResultTopic &&
          log.topics[1]?.toLowerCase() === address?.toLowerCase()
        );
        if (userLogs.length > 0) {
          const last = userLogs[userLogs.length - 1];
          const decoded = decodeEventLog({
            abi: CoinFlipABI,
            data: last.data,
            topics: last.topics,
          });
          if (decoded.args && Array.isArray(decoded.args)) {
            setLastResult({
              player: address,
              betAmount: formatEther(decoded.args[1] as bigint),
              win: decoded.args[2] as boolean,
              payout: formatEther(decoded.args[3] as bigint),
            });
          } else if (decoded.args && typeof decoded.args === 'object' && !Array.isArray(decoded.args)) {
            const args = decoded.args as unknown as { betAmount: bigint; win: boolean; payout: bigint };
            setLastResult({
              player: address,
              betAmount: formatEther(args.betAmount),
              win: args.win,
              payout: formatEther(args.payout),
            });
          }
        }
      } catch {
        // ignore
      }
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [publicClient, address]);

  const handleFlip = async (amountOverride?: string) => {
    const amount = amountOverride || betAmount;
    if (!amount) return;
    setLoading(true);
    setError(null);
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CoinFlipABI,
        functionName: 'flip',
        value: parseEther(amount),
      });
      setBetAmount('');
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Transaction failed.');
    }
    setLoading(false);
  };

  // Wallet connection UI
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-[#836EF9]">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20 mx-auto flex flex-col items-center text-center relative overflow-hidden mt-4">
          <h2 className="text-2xl font-bold text-white mb-4">Select a wallet to connect:</h2>
          <div className="flex flex-col gap-4 w-full">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                className="bg-[#836EF9] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#200052] transition"
                onClick={() => connect({ connector })}
                disabled={status === 'pending'}
              >
                {status === 'pending' ? 'Connecting...' : `Connect ${connector.name}`}
              </button>
            ))}
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