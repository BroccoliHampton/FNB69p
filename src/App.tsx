import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useRig } from './hooks/useRig';
import { TOKEN_ADDRESS } from './config/contracts';

const NeonCrash: React.FC = () => {
  return (
    <div 
      className="relative neon-crash" 
      style={{ 
        perspective: '1000px', 
        width: '200px', 
        height: '300px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Crude Head */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-mine-orange border-4 border-white" 
           style={{ transform: 'translateZ(40px) rotateX(-10deg)' }}>
        {/* Mouth/Muzzle */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-10 bg-[#FFC0CB] border-2 border-black" style={{ transform: 'translateZ(10px)' }}>
          <div className="w-full h-4 bg-white border-b-2 border-black mt-1"></div>
        </div>
        {/* Eyes */}
        <div className="absolute top-4 left-2 w-8 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>
        <div className="absolute top-4 right-2 w-8 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>
        {/* Ears */}
        <div className="absolute -top-10 -left-6 w-10 h-16 bg-mine-orange border-4 border-black" style={{ clipPath: 'polygon(100% 100%, 0 100%, 50% 0)' }}></div>
        <div className="absolute -top-10 -right-6 w-10 h-16 bg-mine-orange border-4 border-black" style={{ clipPath: 'polygon(100% 100%, 0 100%, 50% 0)' }}></div>
        {/* Hair spikes */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-12 bg-red-600 border-2 border-black rotate-12"></div>
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-4 h-12 bg-red-600 border-2 border-black -rotate-12"></div>
      </div>

      {/* Crude Body */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-16 h-32 bg-mine-orange border-4 border-white" style={{ transform: 'translateZ(10px) rotateX(10deg)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-20 bg-mine-orange brightness-125"></div>
      </div>

      {/* Arms */}
      <div className="absolute top-28 -left-8 w-10 h-24 bg-mine-orange border-2 border-white rotate-[30deg]" style={{ transform: 'translateZ(-10px)' }}></div>
      <div className="absolute top-28 -right-8 w-10 h-24 bg-mine-orange border-2 border-white rotate-[-30deg]" style={{ transform: 'translateZ(-10px)' }}></div>

      {/* Gloves */}
      <div className="absolute top-44 -left-12 w-12 h-12 bg-red-800 border-2 border-black" style={{ transform: 'translateZ(20px)' }}></div>
      <div className="absolute top-44 -right-12 w-12 h-12 bg-red-800 border-2 border-black" style={{ transform: 'translateZ(20px)' }}></div>

      {/* Pants (Blue) */}
      <div className="absolute top-52 left-1/2 -translate-x-1/2 w-20 h-16 bg-mine-blue border-4 border-white" style={{ transform: 'translateZ(30px)' }}></div>

      {/* Legs/Feet */}
      <div className="absolute top-64 left-4 w-12 h-20 bg-mine-orange border-2 border-black"></div>
      <div className="absolute top-64 right-4 w-12 h-20 bg-mine-orange border-2 border-black"></div>
      
      {/* Shoes */}
      <div className="absolute top-80 left-0 w-16 h-8 bg-red-600 border-4 border-black rounded-full" style={{ transform: 'translateZ(40px)' }}></div>
      <div className="absolute top-80 right-0 w-16 h-8 bg-red-600 border-4 border-black rounded-full" style={{ transform: 'translateZ(40px)' }}></div>
    </div>
  );
};

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
  const [minedThisTurn, setMinedThisTurn] = useState(0);

  const mineRatePerSecond = mineRate / 1e18;
  const balance = unitBalance;
  const priceInEth = parseFloat(price);

  // Calculate mined this turn based on elapsed time and mine rate
  useEffect(() => {
    if (!epochStartTime || !mineRatePerSecond) return;
    
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - epochStartTime;
      const mined = elapsed * mineRatePerSecond;
      setMinedThisTurn(mined);
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

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-md bg-black text-white p-4 font-mono select-none overflow-x-hidden">
        
        {/* 1. HEADER */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-sm font-black uppercase italic bg-mine-blue px-2 leading-tight" style={{ wordBreak: 'break-word' }}>
            FrodoNixonBandicoot69pepe, a shitcoin on Base (ticker is $ETHEREUM btw)
          </h2>
          <button 
            onClick={handleConnect}
            className="bg-[#2D1B44] text-[#A855F7] px-2 py-1 rounded flex items-center text-xs font-bold border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap ml-2"
          >
            <span className="mr-1">🔗</span> 
            {isConnected ? shortenAddress(address!) : 'Connect'}
          </button>
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
            <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">Mined This Turn</label>
            <p className="text-lg font-black">{minedThisTurn.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <p className="text-gray-600 font-bold text-xs">${(minedThisTurn * unitPrice).toFixed(4)}</p>
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

        {/* 3. NEON CRASH CHARACTER */}
        <div className="w-full h-80 bg-mine-green border-2 border-black mb-6 flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 p-1 text-[10px] font-black bg-white text-mine-blue border-b-2 border-r-2 border-black z-10">FNB69P.OBJ</div>
          <NeonCrash />
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
          <p className="text-xs font-bold leading-relaxed mb-3">
            FNB69p is a shitcoin on base continuously mined through a dutch auction spot. This means only one person in the whole world can mine $ETHEREUM at a time. Each time someone mines the price doubles, and cools down to nothing over an hour. 80% of the mining price goes back to the last person who mined, meaning u might make money or lose money- but you always earn $ETHEREUM.
          </p>
          <p className="text-xs font-bold mb-3 text-mine-orange">
            the ticker is $ETHEREUM btw, on jesse pollacks Base network.
          </p>
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
