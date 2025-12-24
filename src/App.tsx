import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useRig } from './hooks/useRig';
import { TOKEN_ADDRESS } from './config/contracts';
import NeonCrash from './components/NeonCrash';

// Audio Theme - inline
class AudioTheme {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private currentStep: number = 0;
  private timerId: number | null = null;
  private bpm: number = 172;
  private lookahead: number = 25.0;
  private scheduleAheadTime: number = 0.1;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private createOsc(type: OscillatorType, freq: number, startTime: number, duration: number, volume: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playKick(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playSnare(time: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(time);
  }

  private playHiHat(time: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.02;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.02);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(time);
  }

  private scheduler() {
    while (this.ctx && this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.advanceNote();
    }
    this.timerId = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  private advanceNote() {
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextNoteTime += 0.25 * secondsPerBeat;
    this.currentStep = (this.currentStep + 1) % 16;
  }

  private scheduleNote(step: number, time: number) {
    if (step === 0 || step === 8 || step === 10) this.playKick(time);
    if (step === 4 || step === 12) this.playSnare(time);
    if (step % 2 === 0) this.playHiHat(time);
    if (step % 4 === 2) this.playHiHat(time + 0.05);
    const notes = [261.63, 329.63, 392.00, 523.25];
    const chaoticNote = notes[Math.floor(Math.random() * notes.length)] * (Math.random() > 0.8 ? 2 : 1);
    this.createOsc('square', chaoticNote, time, 0.1, 0.05);
    if (step % 8 === 0) {
      this.createOsc('triangle', 65.41, time, 0.5, 0.2);
    }
  }

  public start() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.nextNoteTime = this.ctx!.currentTime;
    this.scheduler();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) clearTimeout(this.timerId);
  }

  public toggle() {
    if (this.isPlaying) this.stop();
    else this.start();
    return this.isPlaying;
  }
}

const themeSong = new AudioTheme();

// ETH Price Hook
function useEthPrice() {
  const [ethPrice, setEthPrice] = useState<number>(3500);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await res.json();
        setEthPrice(data.ethereum.usd);
      } catch (err) {
        console.error('Failed to fetch ETH price:', err);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const ethToUsd = (eth: number) => eth * ethPrice;
  const usdToEth = (usd: number) => ethPrice > 0 ? usd / ethPrice : 0;

  return { ethPrice, ethToUsd, usdToEth };
}

// Floating emoji component
const FloatingEmoji = ({ emoji, style }: { emoji: string; style: React.CSSProperties }) => (
  <div className="fixed pointer-events-none text-4xl float opacity-50" style={style}>
    {emoji}
  </div>
);

// Random position generator
const randomPos = () => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 3}s`,
  animationDuration: `${2 + Math.random() * 4}s`,
});

const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { ethToUsd } = useEthPrice();
  
  const {
    isLoading,
    mineRate,
    price,
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

  const [commentary, setCommentary] = useState<string>("WELCOME TO FNB69P...");
  const [minedThisTurn, setMinedThisTurn] = useState(0);

  const mineRatePerSecond = mineRate / 1e18;
  const balance = unitBalance;
  const priceInEth = parseFloat(price);

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
        "🚀🚀🚀 MOON SOON 🚀🚀🚀",
        "WAGMI WAGMI WAGMI",
        "GIGABRAIN MOVE!!!",
      ];
      setCommentary(messages[Math.floor(Math.random() * messages.length)]);
      refetch();
    }
  }, [isConfirmed, refetch]);

  const handleEnter = () => {
    setHasEntered(true);
    themeSong.start();
    setMusicPlaying(true);
  };

  const toggleMusic = () => {
    themeSong.toggle();
    setMusicPlaying(!musicPlaying);
  };

  const handleMine = useCallback(async () => {
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }
    setCommentary("⛏️ MINING IN PROGRESS... ⛏️");
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

  const floatingEmojis = ['🍩', '⛏️', '💎', '🚀', '🔥', '💰', '🌙', '⚡', '🎮', '👾'];

  // ENTER SCREEN
  if (!hasEntered) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden scanlines">
        {/* Floating background emojis */}
        {floatingEmojis.map((emoji, i) => (
          <FloatingEmoji key={i} emoji={emoji} style={randomPos()} />
        ))}
        
        {/* Spinning background elements */}
        <div className="absolute top-10 left-10 text-6xl spin-chaos opacity-20">🍩</div>
        <div className="absolute bottom-10 right-10 text-6xl spin-chaos opacity-20" style={{ animationDelay: '1s' }}>⛏️</div>
        <div className="absolute top-1/4 right-1/4 text-4xl float opacity-30">💎</div>
        <div className="absolute bottom-1/4 left-1/4 text-4xl float opacity-30" style={{ animationDelay: '2s' }}>🚀</div>
        
        <div className="text-center p-8 relative z-10">
          <h1 className="text-6xl font-black text-mine-orange mb-4 rgb-split glitch">
            FNB69P
          </h1>
          <p className="text-white text-lg mb-2 font-mono neon-flicker">
            FrodoNixonBandicoot69pepe
          </p>
          <p className="text-gray-500 text-sm mb-8 font-mono wobble">
            a shitcoin on Base (ticker is $ETHEREUM btw)
          </p>
          
          {/* Crazy warning text */}
          <div className="mb-6 text-xs color-cycle font-bold">
            ⚠️ WARNING: MAXIMUM DEGEN TERRITORY ⚠️
          </div>
          
          <button
            onClick={handleEnter}
            className="bg-mine-orange text-mine-blue font-black text-3xl px-16 py-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all active:scale-95 rainbow-border pulse-scale"
          >
            🎮 ENTER 🎮
          </button>
          
          <p className="text-gray-600 text-sm mt-6 font-mono shake">
            🔊 SOUND ON FOR MAXIMUM CHAOS 🔊
          </p>
          
          <div className="mt-4 text-2xl crazy-bounce">
            🍩⛏️💎🚀🔥💰🌙⚡
          </div>
        </div>
      </div>
    );
  }

  // MAIN APP
  return (
    <div className="min-h-screen bg-black flex justify-center relative overflow-hidden crt-flicker">
      {/* Scanlines overlay */}
      <div className="scanlines fixed inset-0 pointer-events-none z-50"></div>
      
      {/* Floating chaos emojis */}
      {floatingEmojis.slice(0, 5).map((emoji, i) => (
        <FloatingEmoji key={i} emoji={emoji} style={randomPos()} />
      ))}
      
      {/* Side decorations */}
      <div className="fixed left-2 top-1/4 text-2xl spin-chaos opacity-30">🍩</div>
      <div className="fixed right-2 top-1/3 text-2xl spin-chaos opacity-30" style={{ animationDelay: '0.5s' }}>⛏️</div>
      <div className="fixed left-2 bottom-1/4 text-2xl float opacity-30">💎</div>
      <div className="fixed right-2 bottom-1/3 text-2xl float opacity-30" style={{ animationDelay: '1s' }}>🚀</div>
      
      <div className="w-full max-w-md bg-black text-white p-4 font-mono select-none overflow-x-hidden relative z-10">
        
        {/* 1. HEADER */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xs font-black uppercase italic bg-mine-blue px-2 leading-tight flex-1 mr-2 skew-chaos rainbow-border border-2">
            FrodoNixonBandicoot69pepe, a shitcoin on Base (ticker is $ETHEREUM btw)
          </h2>
          <div className="flex gap-1">
            <button 
              onClick={toggleMusic}
              className="bg-[#27272A] text-white px-2 py-1 rounded text-xs font-bold border border-black crazy-bounce"
            >
              {musicPlaying ? '🔊' : '🔇'}
            </button>
            <button 
              onClick={handleConnect}
              className="bg-[#2D1B44] text-[#A855F7] px-2 py-1 rounded flex items-center text-xs font-bold border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap pulse-scale"
            >
              <span className="mr-1">🔗</span> 
              {isConnected ? shortenAddress(address!) : 'Connect'}
            </button>
          </div>
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden mb-4 bg-mine-blue/20 border border-mine-blue">
          <div className="whitespace-nowrap animate-marquee text-xs py-1">
            🚀 $ETHEREUM TO THE MOON 🌙 | ⛏️ MINE NOW OR CRY LATER 😭 | 💎 DIAMOND HANDS ONLY 💎 | 🍩 DONUT GANG 🍩 | 🔥 THIS IS FINE 🔥 | 
            🚀 $ETHEREUM TO THE MOON 🌙 | ⛏️ MINE NOW OR CRY LATER 😭 | 💎 DIAMOND HANDS ONLY 💎 | 🍩 DONUT GANG 🍩 | 🔥 THIS IS FINE 🔥
          </div>
        </div>

        {/* CURRENT MINER */}
        {miner && miner !== '0x0000000000000000000000000000000000000000' && (
          <div className="mb-3 bg-mine-green/20 border-2 border-mine-green p-2 text-sm slide-chaos rainbow-border">
            <span className="text-gray-500 font-bold">⛏️ Current Miner: </span>
            <span className="font-black text-mine-green glitch">{shortenAddress(miner)}</span>
          </div>
        )}

        {/* EPOCH TIMER */}
        <div className="mb-4 text-right">
          <span className="text-gray-500 font-bold text-sm">⏱️ Epoch Timer: </span>
          <span className="text-xl font-black text-mine-orange rgb-split">{timer}</span>
        </div>

        {/* 2. CURRENT MINER STATS */}
        <div className="grid grid-cols-2 gap-4 mb-6 relative">
          {/* Decorative corner */}
          <div className="absolute -top-2 -left-2 text-lg spin-chaos">⚡</div>
          <div className="absolute -top-2 -right-2 text-lg spin-chaos" style={{ animationDelay: '0.5s' }}>💎</div>
          
          <div className="bg-black/50 p-2 border border-mine-orange/50 wobble">
            <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">⚡ Mine rate</label>
            <p className="text-lg font-black color-cycle">{mineRatePerSecond.toFixed(2)}/s</p>
          </div>
          <div className="bg-black/50 p-2 border border-mine-green/50 wobble" style={{ animationDelay: '0.2s' }}>
            <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">💰 Mined This Turn</label>
            <p className="text-lg font-black neon-flicker">{minedThisTurn.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-black/50 p-2 border border-mine-blue/50 wobble" style={{ animationDelay: '0.4s' }}>
            <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">💎 Mine Price</label>
            <p className="text-lg font-black">Ξ{priceInEth.toFixed(4)}</p>
            <p className="text-gray-600 font-bold text-xs rgb-split">${ethToUsd(priceInEth).toFixed(2)}</p>
          </div>
          <div className="bg-black/50 p-2 border border-purple-500/50 wobble" style={{ animationDelay: '0.6s' }}>
            <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">🔢 Epoch</label>
            <p className="text-lg font-black text-purple-400">#{epochId}</p>
          </div>
        </div>

        {/* 3. NEON CRASH CHARACTER */}
        <div className="w-full h-80 bg-mine-green border-4 border-black mb-6 flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] rainbow-border">
          <div className="absolute top-0 left-0 p-1 text-[10px] font-black bg-white text-mine-blue border-b-2 border-r-2 border-black z-10 glitch">FNB69P.OBJ</div>
          
          {/* Corner decorations */}
          <div className="absolute top-2 right-2 text-2xl spin-chaos">🍩</div>
          <div className="absolute bottom-2 left-2 text-2xl spin-chaos" style={{ animationDelay: '1s' }}>⛏️</div>
          <div className="absolute bottom-2 right-2 text-xl float">💎</div>
          
          <NeonCrash />
        </div>

        {/* 4. YOUR POSITION */}
        <div className="mb-6 border-t-4 border-mine-orange pt-4 relative">
          <div className="absolute -top-3 left-4 bg-black px-2 text-mine-orange text-xs">👇👇👇</div>
          <h2 className="text-xl font-black uppercase mb-4 italic rgb-split">💼 Your Position</h2>
          {!isConnected ? (
            <p className="text-gray-500 font-bold text-sm shake">🔗 Connect wallet to view your position 🔗</p>
          ) : isLoading ? (
            <p className="text-gray-500 font-bold text-sm">⏳ Loading... ⏳</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-mine-orange/20 to-transparent p-2 border border-mine-orange/30 slide-chaos">
                <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">🪙 FNB69p Balance</label>
                <p className="text-lg font-black">{balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500/20 to-transparent p-2 border border-pink-500/30 slide-chaos" style={{ animationDelay: '0.3s' }}>
                <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">🍩 DONUT</label>
                <p className="text-lg font-black">{donutBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-transparent p-2 border border-blue-500/30 slide-chaos" style={{ animationDelay: '0.6s' }}>
                <label className="text-gray-500 uppercase font-bold block mb-1 text-xs">⟠ ETH</label>
                <p className="text-lg font-black">Ξ{parseFloat(ethBalance).toFixed(4)}</p>
                <p className="text-gray-600 font-bold text-xs">${ethToUsd(parseFloat(ethBalance)).toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {/* 5. ABOUT SECTION */}
        <div className="mb-6 bg-mine-blue border-4 border-black p-3 relative skew-chaos" style={{ animationDuration: '10s' }}>
          <div className="absolute -top-3 -right-3 text-2xl spin-chaos">📖</div>
          <h2 className="text-xl font-black uppercase mb-3 italic neon-flicker">📜 About</h2>
          <p className="text-xs font-bold leading-relaxed mb-3">
            FNB69p is a shitcoin on base continuously mined through a dutch auction spot. This means only one person in the whole world can mine $ETHEREUM at a time. Each time someone mines the price doubles, and cools down to nothing over an hour. 80% of the mining price goes back to the last person who mined, meaning u might make money or lose money- but you always earn $ETHEREUM.
          </p>
          <p className="text-xs font-bold mb-3 text-mine-orange rgb-split">
            the ticker is $ETHEREUM btw, on jesse pollacks Base network.
          </p>
          <div className="flex items-center gap-2 mb-3 font-bold text-sm">
            <span className="text-gray-400">📍 Token:</span>
            <span className="text-white glitch">{shortenAddress(TOKEN_ADDRESS)}</span>
          </div>
          <button 
            onClick={() => navigator.clipboard.writeText(TOKEN_ADDRESS)}
            className="bg-[#27272A] px-3 py-1 rounded-full border border-gray-600 font-bold text-xs flex items-center pulse-scale"
          >
            📋 Copy Address <span className="ml-1">📋</span>
          </button>
        </div>

        {/* 6. AI COMMENTARY & MINE BUTTON */}
        <div className="sticky bottom-4 z-50">
          <div className="bg-mine-orange p-2 border-4 border-black mb-2 shake rainbow-border">
            <p className="text-xs font-black text-black bg-white p-1 glitch">
              {'> '} {commentary}
            </p>
          </div>
          <button
            onClick={handleMine}
            disabled={isMining}
            className={`
              w-full h-20 font-black text-2xl border-4 border-black 
              transition-all active:scale-95 relative overflow-hidden
              ${isMining 
                ? 'bg-mine-green text-white cursor-wait disco-bg' 
                : 'bg-mine-orange text-mine-blue shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 pulse-scale'
              }
            `}
          >
            <span className="relative z-10">
              {!isConnected ? '🔗 CONNECT 🔗' : isMining ? '⛏️ MINING... ⛏️' : `⛏️ MINE Ξ${priceInEth.toFixed(4)} ($${ethToUsd(priceInEth).toFixed(2)}) ⛏️`}
            </span>
          </button>
          
          {/* Bottom decoration */}
          <div className="text-center mt-2 text-xs color-cycle font-bold">
            🚀 WAGMI 🚀 NGMI 😭 WAGMI 🚀 NGMI 😭 🚀
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
