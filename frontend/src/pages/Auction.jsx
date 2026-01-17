import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Auction = () => {
  const [showBoughtPlayersModal, setShowBoughtPlayersModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);

  // Add marquee animation styles
  const marqueeStyle = `
    @keyframes marquee {
      0% {
        transform: translateX(100%);
      }
      100% {
        transform: translateX(-100%);
      }
    }
    @keyframes marquee-reverse {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
    .animate-marquee {
      animation: marquee 30s linear infinite;
    }
  `;

  // Sample data for bought players by manager
  const boughtPlayersByManager = {
    'GalacticManager_7': [
      { id: 1, name: 'Kylian Mbappé', pos: 'FW', team: 'PSG', price: '$85M', rating: 97 },
      { id: 2, name: 'Vinicius Jr', pos: 'LW', team: 'Real Madrid', price: '$78M', rating: 96 },
      { id: 3, name: 'Jude Bellingham', pos: 'CM', team: 'Real Madrid', price: '$65M', rating: 95 },
    ],
    'EliteScout_X': [
      { id: 4, name: 'Erling Haaland', pos: 'ST', team: 'Manchester City', price: '$120M', rating: 98 },
      { id: 5, name: 'Phil Foden', pos: 'RW', team: 'Manchester City', price: '$72M', rating: 94 },
    ],
    'StarkUnited': [
      { id: 6, name: 'Luka Modrić', pos: 'CM', team: 'Real Madrid', price: '$55M', rating: 92 },
      { id: 7, name: 'Toni Kroos', pos: 'CM', team: 'Real Madrid', price: '$58M', rating: 91 },
      { id: 8, name: 'Federico Valverde', pos: 'CM', team: 'Real Madrid', price: '$62M', rating: 93 },
    ]
  };

  const openManagerPlayers = (managerName) => {
    setSelectedManager(managerName);
    setShowBoughtPlayersModal(true);
  };

  const BoughtPlayersModal = () => {
    const players = boughtPlayersByManager[selectedManager] || [];
    
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setShowBoughtPlayersModal(false)}
        ></div>

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden animation-fadeIn">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary/20 to-transparent border-b border-white/10 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">groups</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase italic text-white">{selectedManager}</h2>
                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Squad Acquisitions</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBoughtPlayersModal(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all hover:scale-110"
                >
                  <span className="material-symbols-outlined text-white text-xl">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {players.length > 0 ? (
                <div className="grid gap-4">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="group bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-primary/50 rounded-xl p-4 transition-all hover:bg-white/10 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-primary font-bold text-sm">{player.rating}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white group-hover:text-primary transition-colors">{player.name}</h3>
                            <p className="text-xs text-white/60">{player.team} • {player.pos}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black italic text-primary">{player.price}</p>
                          <p className="text-xs text-white/40 font-bold">BID PRICE</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-white/20 mb-4">shopping_cart</span>
                  <p className="text-white/60 font-medium">No players purchased yet</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 bg-white/5 px-8 py-4 flex justify-between items-center">
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
                Total Players: <span className="text-primary font-black">{players.length}</span>
              </p>
              <button
                onClick={() => setShowBoughtPlayersModal(false)}
                className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:scale-105 transition-transform uppercase text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="bg-background-dark font-display text-white overflow-hidden h-screen" style={{
      background: "linear-gradient(rgba(10, 15, 11, 0.9), rgba(10, 15, 11, 0.95)), url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=2000')",
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>

<Navbar />

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
                    <div className="absolute left-1/2 top-6 -translate-x-1/2 flex items-center gap-8 bg-black/40 border border-white/10 px-6 py-2 rounded-full backdrop-blur-xl shadow-lg z-20">
            
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
             <Link to="/post_auction_statistics"><button className="size-9 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500/20 hover:scale-110 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]" title="End Auction">
                <span className="material-symbols-outlined text-lg">stop_circle</span>
              </button></Link>
            </div>

          </div>
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
                    <button className="h-14 w-32 bg-primary text-black font-black text-xl italic rounded hover:scale-105">BID</button>
                    <button className="h-14 px-8 bg-white/10 border border-white/10 rounded font-bold uppercase hover:bg-white/20">Pass</button>
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
              {['GalacticManager_7', 'EliteScout_X', 'StarkUnited'].map((manager) => (
                <div 
                  key={manager}
                  onClick={() => openManagerPlayers(manager)}
                  className="flex justify-between bg-white/5 hover:bg-white/10 p-2 rounded cursor-pointer border border-transparent hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <img src="https://placehold.co/100x100/FFD700/000000/png?text=M" className="w-6 h-6 rounded-full group-hover:scale-110 transition-transform" alt="Manager" />
                    <span className="text-xs font-bold group-hover:text-primary">{manager}</span>
                  </div>
                  <span className="material-symbols-outlined text-primary text-sm">expand_more</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm overflow-hidden flex flex-col relative shadow-lg">
            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-black/20">
              <button className="flex-1 py-3 text-[10px] font-bold uppercase bg-white/10 text-primary border-b-2 border-primary">Propose</button>
              <button className="flex-1 py-3 text-[10px] font-bold uppercase text-white/40 hover:text-white">Active Offers</button>
            </div>

            {/* Trade Content */}
            <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto">
              {/* Partner Selection */}
              <div>
                <select className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-xs text-white/80 font-bold uppercase outline-none hover:border-primary/50 transition-all focus:border-primary focus:bg-black/60">
                  <option>Select Partner...</option>
                  <option>GalacticManager_7</option>
                  <option>EliteScout_X</option>
                  <option>StarkUnited</option>
                </select>
              </div>

              {/* You Give Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">YOU GIVE</span>
                  <button className="flex items-center gap-1 text-[9px] bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded font-bold uppercase transition-all">
                    <span className="material-symbols-outlined text-sm">add</span> Player
                  </button>
                </div>
                
                {/* Selected Players Display */}
                <div className="min-h-10 bg-black/30 border border-white/5 rounded-lg p-3 flex flex-wrap gap-2 items-center">
                  <div className="bg-white/10 border border-white/10 rounded px-2 py-1 text-[9px] text-white font-bold">
                    Mbappé <span className="ml-1 cursor-pointer hover:text-red-400">×</span>
                  </div>
                </div>

                {/* Cash Offer */}
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-white/40 text-sm font-bold">$</span>
                  <input 
                    type="number" 
                    placeholder="Cash Offer (M)" 
                    className="w-full bg-black/30 border border-white/10 rounded-lg pl-8 pr-4 py-3 text-xs text-white placeholder-white/30 font-bold outline-none hover:border-white/20 focus:border-primary/50 focus:bg-black/40 transition-all"
                  />
                </div>
              </div>

              {/* Swap Icon */}
              <div className="flex justify-center -my-2">
                <div className="w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-all cursor-pointer shadow-lg">
                  <span className="material-symbols-outlined text-white/60 hover:text-primary transition-colors">swap_vert</span>
                </div>
              </div>

              {/* They Give Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">THEY GIVE</span>
                  <button className="flex items-center gap-1 text-[9px] bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded font-bold uppercase transition-all">
                    <span className="material-symbols-outlined text-sm">add</span> Player
                  </button>
                </div>

                {/* Selected Players Display */}
                <div className="min-h-10 bg-black/30 border border-white/5 rounded-lg p-3 flex flex-wrap gap-2 items-center">
                  <span className="text-[9px] text-white/30 font-bold italic">Add players...</span>
                </div>

                {/* Cash Request */}
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-white/40 text-sm font-bold">$</span>
                  <input 
                    type="number" 
                    placeholder="Request Cash (M)" 
                    className="w-full bg-black/30 border border-white/10 rounded-lg pl-8 pr-4 py-3 text-xs text-white placeholder-white/30 font-bold outline-none hover:border-white/20 focus:border-primary/50 focus:bg-black/40 transition-all"
                  />
                </div>
              </div>

              {/* Propose Trade Button */}
              <button className="w-full py-4 bg-primary text-black font-black text-sm uppercase tracking-widest rounded-lg hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(13,242,89,0.4)] transition-all mt-auto shadow-[0_0_15px_rgba(13,242,89,0.2)]">
                Propose Trade
              </button>
            </div>
          </div>
        </aside>
      </main>

      <footer className="h-10 w-full border-t border-white/10 bg-black/90 backdrop-blur-xl fixed bottom-0 left-0 flex items-center overflow-hidden z-50">
        <style>{marqueeStyle}</style>
        <div className="px-6 py-3 bg-primary text-black font-black text-xs uppercase italic tracking-wider shrink-0 z-50 skew-x-[-10deg] ml-[-10px] pl-8">
          <span className="skew-x-[10deg] inline-block">News</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee whitespace-nowrap flex gap-16 items-center text-xs font-medium text-white/80 py-2">
            <span><strong className="text-white">TRADE:</strong> EliteScout_X traded <strong>Haaland</strong> to StarkUnited for <strong>$120M</strong></span>
            <span><strong className="text-white">AUCTION:</strong> <strong>Vini Jr</strong> sold to LondonLions for <strong>$95M</strong></span>
            <span><strong className="text-white">BIDDING:</strong> <strong>Mbappé</strong> current bid <strong>$85M</strong></span>
            <span><strong className="text-white">TRANSFER:</strong> <strong>De Bruyne</strong> acquired for <strong>$72M</strong></span>
          </div>
        </div>
      </footer>

      {/* Bought Players Modal */}
      {showBoughtPlayersModal && <BoughtPlayersModal />}

    </div>
  );
};

export default Auction;
