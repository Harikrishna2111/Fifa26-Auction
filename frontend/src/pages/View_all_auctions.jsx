import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const View_all_auctions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [modalType, setModalType] = useState("");
  const [currentSeason, setCurrentSeason] = useState(1);

  const squadData = [
    { name: "Mbappé", rating: 97, pos: "FW", img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=400", price: "$95M" },
    { name: "De Bruyne", rating: 91, pos: "MF", img: "https://placehold.co/300x400/101010/FFFFFF/png?text=KDB", price: "$78M" },
    { name: "Van Dijk", rating: 89, pos: "DF", img: "https://placehold.co/300x400/101010/FFFFFF/png?text=VVD", price: "$60M" },
    { name: "Ederson", rating: 88, pos: "GK", img: "https://placehold.co/300x400/101010/FFFFFF/png?text=Ederson", price: "$45M" },
    { name: "Saka", rating: 86, pos: "RW", img: "https://placehold.co/300x400/101010/FFFFFF/png?text=Saka", price: "$55M" },
    { name: "Rice", rating: 85, pos: "CDM", img: "https://placehold.co/300x400/101010/FFFFFF/png?text=Rice", price: "$50M" },
    { name: "Son", rating: 89, pos: "LW", img: "https://placehold.co/300x400/101010/FFFFFF/png?text=Son", price: "$65M" },
  ];

  const getCardStyle = (rating) => {
    if (rating >= 90) return { border: 'border-auction-gold', text: 'text-auction-gold', bg: 'bg-gradient-to-b from-[#4a3b00] to-black', glow: 'shadow-[0_0_20px_rgba(255,215,0,0.2)]' };
    if (rating >= 85) return { border: 'border-primary', text: 'text-primary', bg: 'bg-gradient-to-b from-[#064e1c] to-black', glow: 'shadow-[0_0_20px_rgba(13,242,89,0.2)]' };
    return { border: 'border-white/30', text: 'text-white/60', bg: 'bg-gradient-to-b from-gray-800 to-black', glow: '' };
  };

  const openSquadModal = (teamName, type) => {
    setSelectedTeam(teamName);
    setModalType(type);
    setCurrentSeason(1);
    setIsModalOpen(true);
  };

  const closeSquadModal = () => {
    setIsModalOpen(false);
  };

  const changeSeason = (dir) => {
    setCurrentSeason(prev => {
      const newSeason = prev + dir;
      if (newSeason < 1) return 1;
      if (newSeason > 5) return 5;
      return newSeason;
    });
  };

  return (
    <div className="bg-background-dark font-display text-white min-h-screen stadium-bg flex flex-col">
 <Navbar isLoggedIn={true} userName="Alex Smith" userRole="Pro Manager" />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-lg">history_edu</span>
              <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">Archive</span>
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tight">Auction History</h1>
            <p className="text-white/50 mt-2 max-w-lg">Review your past drafts, resume paused sessions, and manage your seasonal progress.</p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button className="px-4 py-2 bg-primary text-black rounded-lg text-xs font-bold uppercase tracking-wider">All</button>
            <button className="px-4 py-2 text-white/60 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">Seasonal</button>
            <button className="px-4 py-2 text-white/60 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">One-Off</button>
            <button className="px-4 py-2 text-white/60 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">Paused</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="card-hoverable bg-panel-dark/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                <div className="size-2 rounded-full bg-primary shadow-[0_0_10px_#0df259]"></div>
                <span className="text-primary text-[10px] font-black tracking-widest uppercase">Completed</span>
              </div>
              <span className="text-white/30 text-xs font-mono">Oct 24, 2025</span>
            </div>

            <h3 className="text-2xl font-black italic uppercase leading-none mb-1 text-white group-hover:text-primary transition-colors">Legends Draft</h3>
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6 block">Season 1 • European League</span>

            <div className="w-full h-px bg-white/10 mb-6"></div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-white/30 text-[9px] uppercase font-bold tracking-widest">Acquired Team</span>
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center font-bold border border-white/20">L</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">London Blues</span>
                      <div className="flex text-auction-gold text-[10px]">
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm text-white/20">star</span>
                      </div>
                    </div>
                    <span className="text-xs text-white/40">11 Players</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center gap-2">
              <Link to="/create_lobby" className="flex-1 h-10 bg-white/5 border border-white/10 hover:bg-primary hover:text-black hover:border-primary rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                Start Season 2 <span className="material-symbols-outlined text-sm">play_arrow</span>
              </Link>
              <button onClick={() => openSquadModal('London Blues', 'season')} className="size-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/20 hover:text-primary flex items-center justify-center transition-colors" title="View Full Squad">
                <span className="material-symbols-outlined">visibility</span>
              </button>
            </div>
          </div>

          {/* Card 2 - Paused */}
          <div className="card-hoverable bg-panel-dark/60 backdrop-blur-md border border-auction-yellow/30 rounded-2xl p-6 flex flex-col relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-2 px-3 py-1 bg-auction-yellow/10 border border-auction-yellow/30 rounded-full">
                <div className="size-2 rounded-full bg-auction-yellow animate-pulse"></div>
                <span className="text-auction-yellow text-[10px] font-black tracking-widest uppercase">Paused</span>
              </div>
              <span className="text-white/30 text-xs font-mono">Yesterday</span>
            </div>

            <h3 className="text-2xl font-black italic uppercase leading-none mb-1 text-white">Sunday League</h3>
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6 block">Non-Seasonal • Quick Draft</span>

            <div className="w-full h-px bg-white/10 mb-6"></div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-white/30 text-[9px] uppercase font-bold tracking-widest">Current Team</span>
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-red-600 flex items-center justify-center font-bold border border-white/20">M</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">Manchester Red</span>
                    </div>
                    <span className="text-xs text-white/40">In Progress...</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center gap-2">
              <button className="w-full h-10 bg-yellow-500 text-black rounded-lg text-xs font-black uppercase tracking-wider hover:bg-yellow-400 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                <span className="material-symbols-outlined text-base">resume</span> Resume Auction
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card-hoverable bg-panel-dark/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                <div className="size-2 rounded-full bg-primary shadow-[0_0_10px_#0df259]"></div>
                <span className="text-primary text-[10px] font-black tracking-widest uppercase">Completed</span>
              </div>
              <span className="text-white/30 text-xs font-mono">Sep 15, 2025</span>
            </div>

            <h3 className="text-2xl font-black italic uppercase leading-none mb-1 text-white group-hover:text-primary transition-colors">Global Stars</h3>
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6 block">Non-Seasonal • Exhibition</span>

            <div className="w-full h-px bg-white/10 mb-6"></div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-white/30 text-[9px] uppercase font-bold tracking-widest">Acquired Team</span>
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-white text-black flex items-center justify-center font-bold border border-white/20">R</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">Real Madrid</span>
                      <div className="flex text-auction-gold text-[10px]">
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm">star</span>
                      </div>
                    </div>
                    <span className="text-xs text-white/40">14 Players</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex justify-end">
              <button onClick={() => openSquadModal('Real Madrid', 'exhibition')} className="w-full h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/50 flex items-center justify-center gap-2 transition-all text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined">visibility</span> View Squad
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Squad Modal */}
      {isModalOpen && (
        <div onClick={(e) => e.target.id === 'squadModal' && closeSquadModal()} id="squadModal" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="relative w-full max-w-6xl bg-panel-dark border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex flex-col border-b border-white/10 bg-black/40">
              <div className="flex items-center justify-between p-6">
                <div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{selectedTeam}</h2>
                  <p className="text-primary text-xs font-bold uppercase tracking-widest mt-1">Full Squad List</p>
                </div>
                <button onClick={closeSquadModal} className="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {modalType === 'season' && (
                <div className="flex justify-center items-center gap-6 py-3 bg-[#0e1f15] border-t border-white/5">
                  <button onClick={() => changeSeason(-1)} className="p-1 text-white/50 hover:text-primary transition"><span className="material-symbols-outlined">chevron_left</span></button>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Viewing</span>
                    <span className="text-lg font-black text-white uppercase tracking-wider italic">Season {currentSeason}</span>
                  </div>
                  <button onClick={() => changeSeason(1)} className="p-1 text-white/50 hover:text-primary transition"><span className="material-symbols-outlined">chevron_right</span></button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 flex items-center custom-scroll bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2e24] to-[#0a0f0b]">
              <div className="flex gap-6 px-4">
                {squadData.map((player, index) => {
                  const style = getCardStyle(player.rating);
                  return (
                    <div key={index} className={`flex-shrink-0 w-64 h-96 ${style.bg} rounded-2xl border-2 ${style.border} relative overflow-hidden group ${style.glow} transition-transform hover:scale-105 hover:z-10 cursor-pointer`}>
                      <div className="absolute top-4 left-4 z-10">
                        <span className="text-4xl font-black text-white drop-shadow-md block leading-none">{player.rating}</span>
                        <span className="text-sm font-bold text-white/60 uppercase tracking-widest">{player.pos}</span>
                      </div>
                      <div className="absolute inset-0 flex items-end justify-center pb-20">
                        <img src={player.img} className="w-[90%] object-contain drop-shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-500" alt={player.name} />
                      </div>
                      <div className="absolute bottom-0 w-full p-4 bg-black/60 backdrop-blur-sm border-t border-white/10">
                        <h4 className="text-xl font-black text-white uppercase italic truncate">{player.name}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Acquired For</span>
                          <span className={`text-lg font-black ${style.text}`}>{player.price}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default View_all_auctions;
