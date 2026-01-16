import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Player_stats = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const openModal = (player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen stadium-bg">
      <Navbar />
      <main className="max-w-[1280px] mx-auto px-6 py-12">
        {/* Page Heading */}
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-5xl font-black leading-tight tracking-tighter mb-4">
            Available <span className="text-primary">Football Players</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl">
            Scout the global elite and prepare your bids.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input className="w-full bg-background-dark/50 border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-primary focus:border-primary transition-all" placeholder="Search players by name, club, or nationality..." type="text" />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <div className="bg-primary text-background-dark px-5 py-3 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap">
              All Positions
            </div>
            <div className="bg-white/5 border border-white/10 hover:border-primary text-white px-5 py-3 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-colors">
              Forward
            </div>
            <div className="bg-white/5 border border-white/10 hover:border-primary text-white px-5 py-3 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-colors">
              Midfielder
            </div>
            <div className="bg-white/5 border border-white/10 hover:border-primary text-white px-5 py-3 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-colors">
              Defender
            </div>
            <div className="bg-white/5 border border-white/10 hover:border-primary text-white px-5 py-3 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-colors">
              Goalkeeper
            </div>
          </div>
        </div>

        {/* Player Details Modal */}
        {isModalOpen && selectedPlayer && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center">
            <div onClick={closeModal} className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            <div className="relative max-w-4xl w-full mx-6 bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <button onClick={closeModal} className="absolute top-4 right-4 text-white/60 hover:text-primary transition">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                <div className="relative rounded-2xl overflow-hidden">
                  <img className="w-full h-full object-cover" src={selectedPlayer.image} alt={selectedPlayer.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102216] to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="text-4xl font-black text-primary">{selectedPlayer.ovr}</span>
                    <p className="text-xs font-bold tracking-widest">OVR</p>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <h2 className="text-3xl font-black text-primary">{selectedPlayer.name}</h2>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-primary/20 text-primary px-3 py-1 text-xs font-bold rounded-full uppercase">{selectedPlayer.position}</span>
                    <span className="bg-white/10 px-3 py-1 text-xs font-bold rounded-full uppercase">{selectedPlayer.nation}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                    <div><span className="text-slate-500">Age</span><br /><span className="font-bold text-primary">{selectedPlayer.age}</span></div>
                    <div><span className="text-slate-500">Height</span><br /><span className="font-bold">{selectedPlayer.height}</span></div>
                    <div><span className="text-slate-500">Preferred Foot</span><br /><span className="font-bold">{selectedPlayer.foot}</span></div>
                    <div><span className="text-slate-500">Club</span><br /><span className="font-bold">{selectedPlayer.club}</span></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase font-bold">Value</p>
                      <p className="font-black text-primary">{selectedPlayer.value}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase font-bold">Wage</p>
                      <p className="font-black text-emerald-400">{selectedPlayer.wage}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase font-bold">Potential</p>
                      <p className="font-black text-green-400">{selectedPlayer.potential}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase text-primary mb-3">Core Attributes</h4>
                    <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                      <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase font-bold">PAC</p>
                        <p className="text-2xl font-black text-primary">{selectedPlayer.pac}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase font-bold">SHO</p>
                        <p className="text-2xl font-black text-emerald-400">{selectedPlayer.sho}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase font-bold">DRI</p>
                        <p className="text-2xl font-black text-green-400">{selectedPlayer.dri}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex gap-4 pt-6">
                    <button onClick={closeModal} className="flex-1 bg-white/10 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:bg-primary hover:text-background-dark hover:shadow-[0_0_15px_rgba(13,242,89,0.6)]">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* Player Card 1 */}
          <div className="group player-card-hover bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 flex flex-col items-center">
              <span className="text-3xl font-black text-primary leading-none">91</span>
              <span className="text-[10px] font-bold text-white uppercase tracking-widest mt-1">OVR</span>
            </div>
            <div className="h-64 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#102216] to-transparent z-10"></div>
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAF9qJuScH6lMf6-l2ROys2B2sDdjbqw61VAemFtlXfG6tlRbX1qOQ-dYXR4WVc9xw7AZtVuGxuG4VZjZ2pFoJ1PDZDMydaZs1i-vNssCNQN05Q7MmclYQO15CR18oNM7KnLYt1XiAyl6TMkSxsxpO3RsAKz4iKcKA5RiuRnmergljbFbphoeRp_gSlsTZNBMp9OmOPkWSc3K_wpoEv5tIhVQ1FHLvlqr5hdwfG8pGnxX3GzNYyjPfSu1ZcE0zAGM1WTsVvxxEECfU" alt="Kylian Mbappé" />
            </div>
            <div className="p-6 relative z-20 -mt-12">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">Forward</span>
                <span className="text-slate-400 text-[10px] font-bold uppercase">France</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Kylian Mbappé</h3>
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">PAC</p>
                  <p className="font-black text-white">97</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">SHO</p>
                  <p className="font-black text-white">90</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">DRI</p>
                  <p className="font-black text-white">92</p>
                </div>
              </div>
              <button onClick={() => openModal({ name: 'Kylian Mbappé', position: 'Forward', nation: 'France', ovr: 91, pac: 97, sho: 90, dri: 92, age: 25, height: '178 cm', foot: 'Right', club: 'PSG', value: '$180M', wage: '$350K', potential: 94, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAF9qJuScH6lMf6-l2ROys2B2sDdjbqw61VAemFtlXfG6tlRbX1qOQ-dYXR4WVc9xw7AZtVuGxuG4VZjZ2pFoJ1PDZDMydaZs1i-vNssCNQN05Q7MmclYQO15CR18oNM7KnLYt1XiAyl6TMkSxsxpO3RsAKz4iKcKA5RiuRnmergljbFbphoeRp_gSlsTZNBMp9OmOPkWSc3K_wpoEv5tIhVQ1FHLvlqr5hdwfG8pGnxX3GzNYyjPfSu1ZcE0zAGM1WTsVvxxEECfU' })} className="w-full mt-6 bg-white/10 group-hover:bg-primary group-hover:text-background-dark py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                View Details
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-16 flex items-center justify-center gap-4">
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-primary transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-lg bg-primary text-background-dark font-bold">1</button>
            <button className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-primary transition-colors">2</button>
            <button className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-primary transition-colors">3</button>
            <span className="mx-2">...</span>
            <button className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-primary transition-colors">12</button>
          </div>
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-primary transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Player_stats;
