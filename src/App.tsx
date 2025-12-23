import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { TickerInfo, MarketStats } from './types';
import { useRig } from './hooks/useRig';
import { TOKEN_ADDRESS } from './config/contracts';

const App: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const {
    state,
    isLoading,
    readError,
    status,
    mineRate,
    glazed,
    price,
    unitPrice,
    unitBalance,
    donutBalance,
    ethBalance,
    timer,
    miner,
    epochId,
    mine,
    isMining,
    isConfirmed,
    refetch,
  } = useRig();

  const [commentary, setCommentary] = useState<string>("INITIALIZING UGLY MINER...");

  const mineRatePerSecond = mineRate / 1e18;
  const totalMined = glazed / 1e18;
  const balance = unitBalance;
  const priceInEth = parseFloat(price);
  
  const [marketStats] = useState<MarketStats>({
    marketCap: 47.00,
    totalSupply: 544640,
    liquidity: 38.42,
    volume24h: 33.31,
  });

  const tickerInfo: TickerInfo = {
    symbol: "$ETHEREUM",
    name: "STICKR ツ",
    address: `${TOKEN_ADDRESS.slice(0, 6)}...${TOKEN_ADDRESS.slice(-4)}`,
    deployedBy: "FNB69P",
    description: "the ticker is $ETHEREUM. FNB69P. second best shitcoin on Base.",
    timer: timer
  };

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
    console.log('Button clicked!');
    console.log('isConnected:', isConnected);
    
    if (!isConnected) {
      console.log('Connecting wallet...');
      connect({ connector: injected() });
      return;
    }
    
    console.log('Calling mine...');
    setCommentary("MINING IN PROGRESS...");
    await mine();
    console.log('Mine called');
  }, [isConnected, connect, mine]);

  const handleConnect = () => {
    console.log('Connect button clicked, isConnected:', isConnected);
    if (isConnected) {
      disconnect();
    } else {
      connect({ connector: injected() });
    }
  };

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-black text-white p-4 font-mono select-none overflow-x-hidden">
      
      {/* 1. MINER HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black uppercase italic bg-mine-blue px-2">Miner</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleConnect}
            className="bg-[#2D1B44] text-[#A855F7] px-4 py-1 rounded flex items-center text-sm font-bold border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <span className="mr-2">🔗</span> 
            {isConnected ? shortenAddress(address!) : 'Connect'}
          </button>
          <button className="bg-[#3F3F46] text-[#E4E4E7] px-4 py-1 rounded flex items-center text-sm font-bold border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="mr-2">📋</span> Share
          </button>
        </div>
      </div>

      {/* 2. PROFILE SECTION */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white border-4 border-mine-blue flex items-center justify-center overflow-hidden">
            <div className="w-12 h-12 bg-mine-orange flex items-center justify-center text-2xl font-black text-white italic">⛏️</div>
          </div>
          <div>
            <h3 className="text-2xl font-black leading-none">{tickerInfo.name}</h3>
            <p className="text-gray-500 font-bold">{tickerInfo.address}</p>
          </div>
        </div>
        <div className="text-gray-500 font-bold text-xl">{tickerInfo.timer}</div>
      </div>

      {/* CURRENT MINER */}
      {miner && miner !== '0x0000000000000000000000000000000000000000' && (
        <div className="mb-4 bg-mine-green/20 border-2 border-mine-green p-2">
          <span className="text-gray-500 font-bold">Current Miner: </span>
          <span className="font-black text-mine-green">{shortenAddress(miner)}</span>
        </div>
      )}

      {/* 3. MAIN MINING STATS */}
      <div className="grid grid-cols-2 gap-y-6 mb-8">
        <div>
          <label className="text-gray-500 uppercase font-bold block mb-1">Mine rate</label>
          <p className="text-2xl font-black">{mineRatePerSecond.toFixed(2)}/s</p>
          <p className="text-gray-600 font-bold text-sm">${(mineRatePerSecond * unitPrice).toFixed(4)}/s</p>
        </div>
        <div>
          <label className="text-gray-500 uppercase font-bold block mb-1">Total Glazed</label>
          <div className="flex items-center">
            <p className="text-2xl font-black">+{totalMined.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <p className="text-gray-600 font-bold text-sm">${(totalMined * unitPrice).toFixed(2)}</p>
        </div>
        <div>
          <label className="text-gray-500 uppercase font-bold block mb-1">Mine Price</label>
          <p className="text-2xl font-black">Ξ{priceInEth.toFixed(4)}</p>
        </div>
        <div>
          <label className="text-gray-500 uppercase font-bold block mb-1">Epoch</label>
          <p className="text-2xl font-black">#{epochId}</p>
        </div>
      </div>

      {/* 4. 3D FLAG (CENTERED CONTAINER) */}
      <div className="w-full h-64 bg-mine-green border-4 border-black mb-8 flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 p-2 text-xs font-black bg-white text-mine-blue border-b-4 border-r-4 border-black z-10">UGLY_FLAG.OBJ</div>
        <div className="text-6xl font-black text-white animate-pulse">⛏️</div>
      </div>

      {/* 5. YOUR POSITION */}
      <div className="mb-8 border-t-4 border-mine-orange pt-4">
        <h2 className="text-3xl font-black uppercase mb-6 italic">Your position</h2>
        {!isConnected ? (
          <p className="text-gray-500 font-bold">Connect wallet to view your position</p>
        ) : isLoading ? (
          <p className="text-gray-500 font-bold">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 gap-y-6">
            <div>
              <label className="text-gray-500 uppercase font-bold block mb-1">Token Balance</label>
              <div className="flex items-center">
                <p className="text-2xl font-black">{balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
              <p className="text-gray-600 font-bold text-sm">${(balance * unitPrice).toFixed(2)}</p>
            </div>
            <div>
              <label className="text-gray-500 uppercase font-bold block mb-1">DONUT Balance</label>
              <div className="flex items-center">
                <p className="text-2xl font-black">🍩 {donutBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div>
              <label className="text-gray-500 uppercase font-bold block mb-1">ETH Balance</label>
              <p className="text-2xl font-black">Ξ{parseFloat(ethBalance).toFixed(4)}</p>
            </div>
            <div>
              <label className="text-gray-500 uppercase font-bold block mb-1">Unit Price</label>
              <p className="text-2xl font-black">${unitPrice.toFixed(6)}</p>
            </div>
          </div>
        )}
      </div>

      {/* 6. ABOUT SECTION */}
      <div className="mb-8 bg-mine-blue border-4 border-black p-4">
        <h2 className="text-3xl font-black uppercase mb-4 italic">About</h2>
        <div className="flex items-center gap-2 mb-4 font-bold">
          <span className="text-gray-400">Deployed by</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-mine-blue"></div>
            <div className="w-4 h-4 bg-mine-orange"></div>
            <div className="w-4 h-4 bg-mine-green"></div>
          </div>
          <span>ticker $ETHEREUM</span>
        </div>
        <p className="text-xl font-bold leading-tight mb-6">{tickerInfo.description}</p>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => navigator.clipboard.writeText(TOKEN_ADDRESS)}
            className="bg-[#27272A] px-4 py-2 rounded-full border border-gray-600 font-bold text-sm flex items-center"
          >
            ETHEREUM <span className="ml-2">📋</span>
          </button>
          <button className="bg-[#27272A] px-4 py-2 rounded-full border border-gray-600 font-bold text-sm flex items-center">
            ETHEREUM–DONUT LP <span className="ml-2">📋</span>
          </button>
        </div>
      </div>

      {/* 7. STATS SECTION */}
      <div className="mb-8 border-b-4 border-mine-green pb-8">
        <h2 className="text-3xl font-black uppercase mb-6 italic">Stats</h2>
        <div className="grid grid-cols-2 gap-y-8">
          <div>
            <label className="text-gray-500 uppercase font-bold block mb-1">Market cap</label>
            <p className="text-2xl font-black">${marketStats.marketCap.toFixed(2)}</p>
          </div>
          <div>
            <label className="text-gray-500 uppercase font-bold block mb-1">Total supply</label>
            <p className="text-2xl font-black">{marketStats.totalSupply.toLocaleString()}</p>
          </div>
          <div>
            <label className="text-gray-500 uppercase font-bold block mb-1">Liquidity</label>
            <p className="text-2xl font-black">${marketStats.liquidity.toFixed(2)}</p>
          </div>
          <div>
            <label className="text-gray-500 uppercase font-bold block mb-1">24h volume</label>
            <p className="text-2xl font-black">${marketStats.volume24h.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* 8. AI COMMENTARY & MINE BUTTON */}
      <div className="sticky bottom-4 z-50">
        <div className="bg-mine-orange p-2 border-4 border-black mb-2 animate-bounce">
          <p className="text-sm font-black text-black bg-white p-1">
            {'> '} {commentary}
          </p>
        </div>
        <button
          onClick={handleMine}
          disabled={isMining}
          className={`
            w-full h-24 font-black text-5xl border-8 border-black 
            transition-all active:scale-95
            ${isMining 
              ? 'bg-mine-green text-white cursor-wait' 
              : 'bg-mine-orange text-mine-blue shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
            }
          `}
        >
          {!isConnected ? 'CONNECT' : isMining ? 'MINING...' : `MINE (Ξ${priceInEth.toFixed(4)})`}
        </button>
      </div>

      {/* UGLY SIDEBAR OVERLAY */}
      <div className="hidden xl:block fixed top-0 left-0 w-8 h-full bg-mine-orange border-r-4 border-black flex flex-col items-center py-4 gap-8 opacity-50">
        <div className="rotate-90 font-black text-black text-xs whitespace-nowrap">UGLY_INTERFACE_v69.0.1</div>
      </div>
    </div>
  );
};

export default App;
