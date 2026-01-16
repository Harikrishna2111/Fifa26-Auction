import React from "react";

const Auction = () => {
  return (
    <div className="bg-background-dark font-display text-white overflow-hidden h-screen" style={{
      background: "linear-gradient(rgba(10, 15, 11, 0.9), rgba(10, 15, 11, 0.95)), url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=2000')",
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>

      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background-dark/80 backdrop-blur-md relative">
        <div className="max-w-full mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">sports_soccer</span>
            <h2 className="text-xl font-black uppercase italic">Footy<span className="text-primary">Auction</span></h2>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8 bg-black/40 border border-white/10 px-6 py-2 rounded-full backdrop-blur-xl shadow-lg">
            
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-0.5">Upcoming Pool</span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white/60 text-sm">groups_3</span>
                <span className="text-xs font-black text-white tracking-wider">MIDFIELDERS</span>
                <span className="text-[9px] text-black bg-primary px-1.5 py-0.5 rounded font-bold">12</span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10"></div>

            <div className="flex items-center gap-3">
              <button className="size-9 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 flex items-center justify-center hover:bg-yellow-500/20 hover:scale-110 transition-all shadow-[0_0_10px_rgba(234,179,8,0.2)]" title="Pause Auction">
                <span className="material-symbols-outlined text-lg">pause</span>
              </button>
              <button className="size-9 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500/20 hover:scale-110 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]" title="End Auction">
                <span className="material-symbols-outlined text-lg">stop_circle</span>
              </button>
            </div>

          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">Alex Smith</p>
              <p className="text-[10px] text-primary uppercase font-black">Pro Manager</p>
            </div>
            <img src="https://placehold.co/100x100/101010/FFFFFF/png?text=AS" className="w-10 h-10 rounded-full border border-primary/30" alt="User" />
          </div>
        </div>
      </header>

      <main className="flex h-[calc(100vh-128px)] w-full overflow-hidden p-6 gap-6 relative z-10">
        <aside className="w-[380px] flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm flex-1 flex flex-col shadow-2xl">
            <div className="relative h-2/3">
              <img className="w-full h-full object-cover object-top" src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=800" alt="Player"/>
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                <p className="text-primary text-xs font-bold tracking-[0.2em] mb-1">CURRENT PLAYER</p>
                <h3 className="text-3xl font-bold uppercase tracking-tight italic">Kylian Mbappé</h3>
                <p className="text-white/60 text-sm">FW | France • PSG</p>
              </div>
            </div>
            <div className="p-6 flex-1 bg-black/40">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col items-center bg-white/5 border border-white/5 p-2 rounded"><span className="text-xl font-bold text-primary italic">97</span><span className="text-[9px] text-white/40 font-bold">SPD</span></div>
                <div className="flex flex-col items-center bg-white/5 border border-white/5 p-2 rounded"><span className="text-xl font-bold text-primary italic">92</span><span className="text-[9px] text-white/40 font-bold">SHO</span></div>
                <div className="flex flex-col items-center bg-white/5 border border-white/5 p-2 rounded"><span className="text-xl font-bold text-primary italic">95</span><span className="text-[9px] text-white/40 font-bold">DRI</span></div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-12 bg-auction-red/10 border border-auction-red/30 rounded flex items-center justify-center text-auction-red font-bold text-xl">00</div>
                <div className="flex-1 h-12 bg-auction-red/10 border border-auction-red/30 rounded flex items-center justify-center text-auction-red font-bold text-xl">00</div>
                <div className="flex-1 h-12 bg-auction-red border border-auction-red rounded flex items-center justify-center text-white font-bold text-xl">15</div>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex-1 flex flex-col">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            <div className="text-center z-10">
              <p className="text-white/40 text-sm font-bold tracking-[0.3em] uppercase mb-4">Current High Bid</p>
              <h1 className="text-[120px] font-bold leading-none tracking-tighter text-auction-gold italic mb-2">$85<span className="text-6xl not-italic ml-2">M</span></h1>
              <div className="flex items-center justify-center gap-3">
                <img className="w-8 h-8 rounded-full border border-auction-gold" src="https://placehold.co/100x100/FFD700/000000/png?text=GM" alt="Bidder" />
                <p className="text-auction-gold font-medium uppercase tracking-widest text-sm">Bidder: <span className="text-white">GalacticManager_7</span></p>
              </div>
            </div>
            <div className="mt-12 w-full max-w-xl px-12 z-10">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <button className="h-16 bg-primary text-black font-black text-xl italic rounded hover:scale-105 transition-transform">+$5M</button>
                <button className="h-16 bg-primary text-black font-black text-xl italic rounded hover:scale-105 transition-transform">+$10M</button>
                <button className="h-16 bg-primary text-black font-black text-xl italic rounded hover:scale-105 transition-transform">+$20M</button>
              </div>
              <div className="flex gap-4">
                <input className="flex-1 bg-black/50 border border-white/20 rounded px-6 font-bold text-lg text-white" placeholder="Custom bid..." type="text"/>
                <button className="h-14 px-8 bg-white/10 border border-white/10 rounded font-bold uppercase hover:bg-white/20">Pass</button>
                <button className="h-14 w-32 bg-primary text-black font-black text-xl italic rounded hover:scale-105">BID</button>
              </div>
            </div>
          </div>
        </section>

        <aside className="w-[340px] flex flex-col gap-6">
          <div className="h-1/3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm flex flex-col overflow-hidden">
            <div className="p-3 border-b border-white/10 bg-black/20 font-bold text-xs uppercase tracking-widest flex justify-between items-center">
              <span>Live Activity</span><span className="text-[9px] bg-primary/20 text-primary px-2 rounded">REAL-TIME</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              <div className="flex justify-between bg-white/5 hover:bg-white/10 p-2 rounded cursor-pointer border border-transparent hover:border-primary/50 transition-all group">
                <div className="flex items-center gap-2">
                  <img src="https://placehold.co/100x100/FFD700/000000/png?text=GM" className="w-6 h-6 rounded-full group-hover:scale-110 transition-transform" alt="Manager" />
                  <span className="text-xs font-bold group-hover:text-primary">GalacticManager_7</span>
                </div>
                <span className="text-primary font-bold text-xs">$85M</span>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm overflow-hidden flex flex-col relative shadow-lg">
            <div className="flex border-b border-white/10 bg-black/20">
              <button className="flex-1 py-3 text-[10px] font-bold uppercase bg-white/10 text-primary border-b-2 border-primary">Propose</button>
              <button className="flex-1 py-3 text-[10px] font-bold uppercase text-white/40 hover:text-white">Active Offers</button>
            </div>
            <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto relative">
              <p className="text-[10px] text-center text-white/30 mt-4">Trade functionality coming soon...</p>
            </div>
          </div>
        </aside>
      </main>

      <footer className="h-10 w-full border-t border-white/10 bg-black/90 backdrop-blur-xl fixed bottom-0 left-0 flex items-center overflow-hidden z-50">
        <div className="px-6 py-3 bg-primary text-black font-black text-xs uppercase italic tracking-wider shrink-0 z-50 skew-x-[-10deg] ml-[-10px] pl-8">
          <span className="skew-x-[10deg] inline-block">News</span>
        </div>
        <div className="flex-1 overflow-hidden relative group">
          <div className="whitespace-nowrap flex gap-16 items-center text-xs font-medium text-white/80">
            <span><strong className="text-white">TRADE:</strong> EliteScout_X traded <strong>Haaland</strong> to StarkUnited for <strong>$120M</strong></span>
            <span><strong className="text-white">AUCTION:</strong> <strong>Vini Jr</strong> sold to LondonLions for <strong>$95M</strong></span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Auction;
