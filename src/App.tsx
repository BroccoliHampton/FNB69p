import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useRig } from './hooks/useRig';
import { TOKEN_ADDRESS } from './config/contracts';

const App: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const {
    isLoading,
    mineRate,
    price,
    unitPrice,
    unitBalance,
    donutBalance,
    ethBalance,
    timer,
    miner,
    epochId,
    epochStartTime,
    mine,
    isMining,
    isConfirmed,
    refetch,
  } = useRig();

  const [commentary, setCommentary] = useState<string>("INITIALIZING UGLY MINER...");
  const [glazedThisTurn, setGlazedThisTurn] = useState(0);

  const mineRatePerSecond = mineRate / 1e18;
  const balance = unitBalance;
  const priceInEth = parseFloat(price);

  // Calculate glazed this turn based on elapsed time and mine rate
  useEffect(() => {
    if (!epochStartTime || !mineRatePerSecond) return;
    
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - epochStartTime;
      const glazed = elapsed * mineRatePerSecond;
      setGlazedThisTurn(glazed);
    }, 1000);

    return () => clearInterval(interval);
  }, [epochStartTime, mineRatePerSecond]);

  useEffect(() => {
    if (isConfirmed) {
      const messages = [
        "BLOCKS MINED SUCCESSFULLY!",
        "HASH RATE MAXIMIZED!",
        "TOKENS SECURED!",
        "MINING OPERATION COMPLETE!",
        "PROOF OF WORK VERIFIED!",
      ];
      setCommentary(messages[Math.floor(Math.random() * messages.length)]);
      refetch();
    }
  }, [isConfirmed, refetch]);

  const handleMine = useCallback(async () => {
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }
    setCommentary("MINING IN PROGRESS...");
    await mine();
  }, [isConnected, connect, mine]);

  const handleConnect = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect({ connector: injected() });
    }
  };

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Flag component
  const CrudeFlag = () => (
    <div className="relative w-32 h-20" style={{ perspective: '500px' }}>
      <div className="absolute inset-0 flex">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex-1 flag-segment"
            style={{
              backgroundColor: i % 3 === 0 ? '#0000FF' : i % 3 === 1 ? '#FF4500' : '#008000',
              animationDelay: `${i * 0.1}s`,
              transformOrigin: 'left center',
            }}
          />
        ))}
      </div>
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-800" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-md bg-black text-white p-4 font-mono select-none overflow-x-hidden">
        
        {/* 1. MINER HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black uppercase italic bg-mine-blue px-2">Miner</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleConnect}
              className="bg-[#2D1B44] text-[#A855F7] px-3 py-1 rounded flex items-center text-xs font-bold border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <span className="mr-1">🔗</span> 
              {isConnected ? shortenAddress(address!) : 'Connect'}
            </button>
          </div>
        </div>

        {/* CURRENT MINER */}
        {miner && miner !== '0x0000000000000000000000000000000000000000' && (
          <div className="mb-3 bg-mine-green/20 border border-mine-green p-2 text-sm">
            <span className="text-gray-500 font-bold">Current Miner: </span>
            <span className="font-black text-mine-green">{shortenAddress(miner)}</span>
          </div>
        )}

        {/* EPOCH TIMER */}
        <div className="mb-4 text-right">
          <span className="text-gray-500 font-bold text-sm">Epoch Timer: </span>
          <span className="text-lg font-black text-mine-orange">{timer}</span>
        </div>

        {/* 2. CURRENT MINER STATS */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">Mine rate</label>
            <p className="text-lg font-black">{mineRatePerSecond.toFixed(2)}/s</p>
            <p className="text-gray-600 font-bold text-xs">${(mineRatePerSecond * unitPrice).toFixed(4)}/s</p>
          </div>
          <div>
            <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">Glazed This Turn</label>
            <p className="text-lg font-black">{glazedThisTurn.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <p className="text-gray-600 font-bold text-xs">${(glazedThisTurn * unitPrice).toFixed(4)}</p>
          </div>
          <div>
            <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">Mine Price</label>
            <p className="text-lg font-black">Ξ{priceInEth.toFixed(4)}</p>
          </div>
          <div>
            <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">Epoch</label>
            <p className="text-lg font-black">#{epochId}</p>
          </div>
        </div>

        {/* 3. FLAG */}
        <div className="w-full h-40 bg-mine-green border-2 border-black mb-6 flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 p-1 text-[10px] font-black bg-white text-mine-blue border-b-2 border-r-2 border-black z-10">UGLY_FLAG.OBJ</div>
          <CrudeFlag />
        </div>

        {/* 4. YOUR POSITION */}
        <div className="mb-6 border-t-2 border-mine-orange pt-4">
          <h2 className="text-xl font-black uppercase mb-4 italic">Your Position</h2>
          {!isConnected ? (
            <p className="text-gray-500 font-bold text-sm">Connect wallet to view your position</p>
          ) : isLoading ? (
            <p className="text-gray-500 font-bold text-sm">Loading...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">Token Balance</label>
                <p className="text-lg font-black">{balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-gray-600 font-bold text-xs">${(balance * unitPrice).toFixed(2)}</p>
              </div>
              <div>
                <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">DONUT Balance</label>
                <p className="text-lg font-black">🍩 {donutBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">ETH Balance</label>
                <p className="text-lg font-black">Ξ{parseFloat(ethBalance).toFixed(4)}</p>
              </div>
              <div>
                <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">Unit Price</label>
                <p className="text-lg font-black">${unitPrice.toFixed(6)}</p>
              </div>
            </div>
          )}
        </div>

        {/* 5. ABOUT SECTION */}
        <div className="mb-6 bg-mine-blue border-2 border-black p-3">
          <h2 className="text-xl font-black uppercase mb-3 italic">About</h2>
          <div className="flex items-center gap-2 mb-3 font-bold text-sm">
            <span className="text-gray-400">Token:</span>
            <span className="text-white">{shortenAddress(TOKEN_ADDRESS)}</span>
          </div>
          <button 
            onClick={() => navigator.clipboard.writeText(TOKEN_ADDRESS)}
            className="bg-[#27272A] px-3 py-1 rounded-full border border-gray-600 font-bold text-xs flex items-center"
          >
            Copy Address <span className="ml-1">📋</span>
          </button>
        </div>

        {/* 6. AI COMMENTARY & MINE BUTTON */}
        <div className="sticky bottom-4 z-50">
          <div className="bg-mine-orange p-2 border-2 border-black mb-2">
            <p className="text-xs font-black text-black bg-white p-1">
              {'> '} {commentary}
            </p>
          </div>
          <button
            onClick={handleMine}
            disabled={isMining}
            className={`
              w-full h-16 font-black text-3xl border-4 border-black 
              transition-all active:scale-95
              ${isMining 
                ? 'bg-mine-green text-white cursor-wait' 
                : 'bg-mine-orange text-mine-blue shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
              }
            `}
          >
            {!isConnected ? 'CONNECT' : isMining ? 'MINING...' : `MINE (Ξ${priceInEth.toFixed(4)})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
