import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { API_URL } from "../config";

const View_all_auctions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [squadData, setSquadData] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalType, setModalType] = useState('team');
  const [currentSeason, setCurrentSeason] = useState(1);
  const [squadLoading, setSquadLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const userDataStr = localStorage.getItem('user');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;

      let url = `${API_URL}/api/auctions`;
      if (userData) {
        url += `?user_id=${userData.id}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }

      const data = await response.json();
      setAuctions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSquadData = async (auctionId) => {
    try {
      setSquadLoading(true);
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) {
        console.error('User not logged in');
        setSquadData([]);
        return;
      }

      const response = await fetch(`${API_URL}/api/auctions/${auctionId}/squad?user_id=${userData.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch squad data');
      }

      const data = await response.json();
      setSquadData(data);
    } catch (err) {
      console.error('Error fetching squad:', err);
      setSquadData([]);
    } finally {
      setSquadLoading(false);
    }
  };

  const getCardStyle = (rating) => {
    if (rating >= 90) return { border: 'border-auction-gold', text: 'text-auction-gold', bg: 'bg-gradient-to-b from-[#4a3b00] to-black', glow: 'shadow-[0_0_20px_rgba(255,215,0,0.2)]' };
    if (rating >= 85) return { border: 'border-primary', text: 'text-primary', bg: 'bg-gradient-to-b from-[#064e1c] to-black', glow: 'shadow-[0_0_20px_rgba(13,242,89,0.2)]' };
    return { border: 'border-white/30', text: 'text-white/60', bg: 'bg-gradient-to-b from-gray-800 to-black', glow: '' };
  };

  const getStatusClasses = (status) => {
    if (!status) return { dot: 'bg-white/30', text: 'text-white/60', bg: 'bg-white/5', border: 'border-white/10' };
    if (status === 'PAUSED') {
      return { dot: 'bg-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]', text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
    }
    if (status === 'COMPLETED' || status === 'FINISHED' || status === 'ENDED') {
      return { dot: 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.25)]', text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
    }
    return { dot: 'bg-primary shadow-[0_0_10px_#0df259]', text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
  };

  const openSquadModal = async (auction) => {
    setSelectedAuction(auction);
    setModalType(auction.type === 'SEASONAL' ? 'season' : 'team');
    setCurrentSeason((auction.season && auction.season.number) || 1);
    setIsModalOpen(true);
    await fetchSquadData(auction.auctionId);
  };

  const closeSquadModal = () => {
    setIsModalOpen(false);
    setSelectedAuction(null);
    setSquadData([]);
  };

  const changeSeason = (dir) => {
    // Keep existing season change logic if needed
  };

  // Derived filtered list based on selected filter
  const filteredAuctions = auctions.filter(a => {
    if (filter === 'ALL') return true;
    if (filter === 'PAUSED') return a.status === 'PAUSED';
    if (filter === 'SEASONAL') return a.type === 'SEASONAL';
    if (filter === 'ONE-OFF') return a.type === 'ONE-OFF';
    return true;
  });

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
            <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${filter === 'ALL' ? 'bg-primary text-black' : 'text-white/60 hover:text-white'}`}>All</button>
            <button onClick={() => setFilter('SEASONAL')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${filter === 'SEASONAL' ? 'bg-primary text-black' : 'text-white/60 hover:text-white'}`}>Seasonal</button>
            <button onClick={() => setFilter('ONE-OFF')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${filter === 'ONE-OFF' ? 'bg-primary text-black' : 'text-white/60 hover:text-white'}`}>One-Off</button>
            <button onClick={() => setFilter('PAUSED')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${filter === 'PAUSED' ? 'bg-primary text-black' : 'text-white/60 hover:text-white'}`}>Paused</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="text-white/60">Loading auctions...</div>
            </div>
          ) : error ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="text-red-400">Error: {error}</div>
            </div>
          ) : auctions.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="text-white/60">No auctions found</div>
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="text-white/60">No auctions found for selected filter</div>
            </div>
          ) : (
            filteredAuctions.map((auction) => (
              <div key={auction.auctionId} className="card-hoverable bg-panel-dark/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6 relative z-10">
                  {(() => {
                    const sc = getStatusClasses(auction.status);
                    return (
                      <div className={`flex items-center gap-2 px-3 py-1 ${sc.bg} border ${sc.border} rounded-full`}>
                        <div className={`size-2 rounded-full ${sc.dot}`}></div>
                        <span className={`${sc.text} text-[10px] font-black tracking-widest uppercase`}>{auction.status}</span>
                      </div>
                    );
                  })()}
                  <span className="text-white/30 text-xs font-mono">{auction.displayDate}</span>
                </div>

                <h3 className="text-2xl font-black italic uppercase leading-none mb-1 text-white group-hover:text-primary transition-colors">{auction.name}</h3>
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6 block">{auction.season || 'Non-Seasonal'} • {auction.type}</span>

                <div className="w-full h-px bg-white/10 mb-6"></div>

                <div className="flex items-center justify-between mb-6">
                  {auction.team ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-white/30 text-[9px] uppercase font-bold tracking-widest">Acquired Team</span>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center font-bold border border-white/20">
                          {auction.team.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-sm">{auction.team.name}</span>
                          </div>
                          <span className="text-xs text-white/40">{auction.team.playerCount} Players</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-white/30 text-[9px] uppercase font-bold tracking-widest">Status</span>
                      <span className="text-white/50 text-sm italic">Didn't Participate</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center gap-2">
                  {auction.status === 'PAUSED' ? (
                    <button className="w-full h-10 bg-yellow-500 text-black rounded-lg text-xs font-black uppercase tracking-wider hover:bg-yellow-400 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                      <span className="material-symbols-outlined text-base">resume</span> Resume
                    </button>
                  ) : auction.type === 'SEASONAL' ? (
                    <>
                      <Link to={`/create_lobby?continue_season=${auction.auctionId}`} className="flex-1 h-10 bg-white/5 border border-white/10 hover:bg-primary hover:text-black hover:border-primary rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                        Start Season {parseInt(auction.season || 0) + 1} <span className="material-symbols-outlined text-sm">play_arrow</span>
                      </Link>
                      <button onClick={() => openSquadModal(auction)} className="size-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/20 hover:text-primary flex items-center justify-center transition-colors" title="View Squad">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </>
                  ) : (
                    <button onClick={() => openSquadModal(auction)} className="w-full h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/50 flex items-center justify-center gap-2 transition-all text-xs font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined">visibility</span> View Team
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
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
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{selectedAuction?.team?.name || 'Squad'}</h2>
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
                {squadLoading ? (
                  <div className="w-full flex justify-center items-center py-20">
                    <div className="text-white/60">Loading squad data...</div>
                  </div>
                ) : squadData.length === 0 ? (
                  <div className="w-full flex justify-center items-center py-20">
                    <div className="text-white/60">No players found</div>
                  </div>
                ) : (
                  squadData.map((player, index) => {
                    const style = getCardStyle(player.rating);
                    return (
                      <div key={index} className={`flex-shrink-0 w-48 h-80 ${style.bg} rounded-2xl border ${style.border} relative overflow-hidden group ${style.glow} transition-transform hover:scale-105 hover:z-10 cursor-pointer shadow-md`}>
                        <div className="absolute top-3 left-3 z-10">
                          <span className="text-3xl font-black text-white drop-shadow block leading-none">{player.rating}</span>
                          <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">{player.pos}</span>
                        </div>
                        <div className="absolute inset-0 flex items-end justify-center pb-16">
                          <img src={player.img} className="w-[72%] object-contain drop-shadow-xl grayscale group-hover:grayscale-0 transition-all duration-400" alt={player.name} />
                        </div>
                        <div className="absolute bottom-0 w-full p-3 bg-black/60 backdrop-blur-sm border-t border-white/8">
                          <h4 className="text-lg font-black text-white uppercase italic truncate">{player.name}</h4>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Acquired</span>
                            <span className={`text-md font-black px-2 py-1 rounded-md ${style.text} bg-white/5`}>{player.price}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default View_all_auctions;