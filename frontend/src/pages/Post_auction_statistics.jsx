import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Post_auction_statistics = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');

  const openSquadModal = (teamName) => {
    setSelectedTeam(teamName);
    setShowModal(true);
  };

  const closeSquadModal = () => {
    setShowModal(false);
  };

  return (
    <>
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-white overflow-x-hidden">
<div className="relative flex min-h-screen w-full flex-col stadium-bg group/design-root">
    <div className="absolute inset-0 confetti-overlay pointer-events-none"></div>
    <div className="layout-container flex h-full grow flex-col z-10">
        
<Navbar />
        <div className="px-4 md:px-20 lg:px-40 flex justify-center">
            <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
                <div className="py-8 px-4 text-center">
                    <h1 className="text-gold text-5xl md:text-7xl font-bold leading-tight tracking-tighter uppercase mb-2">Final Standings</h1>
                    <p className="text-white/60 text-lg uppercase tracking-widest font-light">The auction window has closed. Glory awaits.</p>
                </div>
            </div>
        </div>

        <div className="px-4 md:px-20 lg:px-40 flex justify-center mb-12">
            <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
                <div className="p-4 @container">
                    <div className="flex flex-col items-stretch justify-start rounded-xl @xl:flex-row @xl:items-center bg-[#1a2e1f]/80 backdrop-blur-md gold-glow overflow-hidden">
                        <div className="relative w-full @xl:w-1/2 h-[350px] bg-center bg-no-repeat bg-cover flex items-end p-6 overflow-hidden" data-alt="Champion team celebrate visual" style={{backgroundImage: 'linear-gradient(0deg, rgba(16, 34, 22, 1) 0%, rgba(16, 34, 22, 0) 50%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCYpgMPgcBAuNcx3f_mh2CfkCNblzvit1pJ3enyIVkKbzc5FeLlN2BVaTmtGRGkdcA6J6hPWMkZQoO7yKUG79A4ZcL6WVq1E_uuxHyAlWOpa7JNOrkluYaWcvLktsVC3fZ7r-DHP5u_j_MF9DARMgVjZuoMfOQ00CWDLI9ld35ICA4ZUK8uYq-dPVOSazcS2xluVYsFHW7aq7BUhGN6sHJpWP-wU_H3ZVzeV97mUec9UHp5hscc-S-H5zorKcK71RyoScjE9TTylcg")'}}>
                            <div className="absolute top-4 left-4 bg-gold text-background-dark px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">emoji_events</span>
                                CHAMPION
                            </div>
                            <div>
                                <h3 className="text-gold text-4xl font-black uppercase italic">The Invincibles</h3>
                                <p className="text-white/80 font-medium">Manager: Alex Ferguson</p>
                            </div>
                        </div>
                        <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-6 py-8 px-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-lg">
                                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Squad Value</p>
                                    <p className="text-primary text-3xl font-bold">£250.5M</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-lg">
                                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Players Signed</p>
                                    <p className="text-white text-3xl font-bold">11</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Star Acquisitions</p>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="size-20 rounded-lg bg-cover bg-center border border-gold/30" data-alt="Kylian Mbappe player portrait" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-tjDJVaW649IYUVVdTsGHhUn9o3bKsj3_752YObeb0mcBCeO6qAo7AKLhv7kOGSrnQbbJXJVR2N2R3nKmD7avoP9FKuJwVbfKH1vANYMWD7-S6AZPPC_JS_qd25J8hu8jkF9R_vZ7Cob55eQsWlEcG7_ASIfs1Tf484rcAgaabNYZGvSQV-lgsCLeQEjAZyk3abrBOFmnnwbmec3JWEdFUovevA1iyY8x653-hnN8x4sKllKhqbVm_DYuWgr0Lycn46141YndEDQ')"}}></div>
                                        <p className="text-xs font-medium text-white/80">Mbappé</p>
                                        <p className="text-[10px] text-primary">£95M</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="size-20 rounded-lg bg-cover bg-center border border-white/10" data-alt="Kevin De Bruyne player portrait" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCyk2kYoHx7gPh1HxW5cvT1shdZo6rHSLiyF2ZJDr6_I3CobMqG8fJ8EOvOMfF0GsFrCQEwuisdnsoVvKoUZir4RvDvd6R1Mgea4bQ_zbu8SF3WJzmg4mR4pwBKgKoladch24oGqKAvvut3PszKVxAoEcy8bwSVOYiprmkyuMoTkj7ASLCttMM1LAcH70-9WTDxKahsuK46XQMAiAfefzV1vkENKXoGCg5_tvtl_Rna2AKVjRZCCr1_C1K9X0pFtZHYnyemu6ONRwU')"}}></div>
                                        <p className="text-xs font-medium text-white/80">De Bruyne</p>
                                        <p className="text-[10px] text-primary">£78M</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="size-20 rounded-lg bg-cover bg-center border border-white/10" data-alt="Erling Haaland player portrait" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDP1XhKH4yA-Q1av72Fy2h9UK-yPKi8LJRASpbgbiorsVCBwtTiSvTGwN_GQWvA1UIgg4l81jnEgH4P1dYqBYAM-f4yDh0Rfp1M282m6lzXbuXKGPuVqbRJTQ9GZdWseZsoK3iisLemyHf2yuJbbVnLER6hxPIzkrErB_3kedjEH2uw8AFBPsNPid2AllrhclZ-K-VkpxE5NM5xv96GeB5z5HaHl4z8OrFKZxR7Ac5d1Gx5DFkWQOFJjDkQNC-VWJPvkst0PN3Y94E')"}}></div>
                                        <p className="text-xs font-medium text-white/80">Haaland</p>
                                        <p className="text-[10px] text-primary">£62M</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => openSquadModal('The Invincibles')} className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 bg-primary text-background-dark font-bold hover:bg-primary/90 transition-colors">
                                <span className="material-symbols-outlined mr-2">visibility</span>
                                VIEW FULL SQUAD
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="px-4 md:px-20 lg:px-40 flex justify-center">
            <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
                <h2 className="text-white text-2xl font-bold leading-tight tracking-tight px-4 pb-6 pt-5 flex items-center gap-2 uppercase">
                    <span className="w-8 h-[2px] bg-primary"></span>
                    Other Competitors
                </h2>
            </div>
        </div>

        <div className="px-4 md:px-20 lg:px-40 flex justify-center mb-20">
            <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                    <div className="flex flex-col gap-4 bg-[#1a2e1f]/40 backdrop-blur-sm p-5 rounded-xl border border-white/5 hover:border-white/20 transition-all group">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">U</div>
                                <div>
                                    <p className="text-white text-lg font-bold leading-none mb-1">United FC</p>
                                    <p className="text-white/50 text-xs">Manager: Mark R.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-primary text-sm font-bold">£180M</p>
                                <p className="text-white/40 text-[10px] uppercase">Spent</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-white/40 text-[10px] uppercase mb-2 tracking-widest">Acquired Squad</p>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                                <div className="min-w-[50px] aspect-square rounded-md bg-cover bg-center border border-white/5 relative group/player" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBN3pdSxgsvO18K3vUHYCSKDxw80TTTiNhIEu-5F_bMvI-JmNDqfYaj1bw8l2r9TObRZP4mAUEIEU2imjiI0NfQOwDP9CKYmPsUkoSf9cQaQ7ONHyPcLbcZgMDyCGHUd6FZXdRJTxeNYPMd5z8FCpBDH1FO4M2gSGedns-zIygsKvN7uCuLqKXV9KmfB1Z_p8fXFdA__f7pw0973KV-xAwGPVIn2yKqHDIFsRVWYpN4z2gjYibpj_W8KlbtzqLSy6beSnxgO_9cCjg')"}}></div>
                                <div className="min-w-[50px] aspect-square rounded-md bg-cover bg-center border border-white/5 relative group/player" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDD1DcIjAJR11p_vMVQ6jOoZhBFrgh2FCodkgp-7VHDR7GLGRUrBNTrMhZEMKBcm9UlZFgOxvb7SdI0bWYsIeRqce808nIh80snObPQQjaxlPsrBcI7zG0CL5If8IMU1Anj4fMLbUsLEX2_Yth4AZ7dHYD7DIH0Je5j26RnVyrPFOix5TDj9iuq4G1MPCnfpZps7FiqVWAwFydKPxrxj-2mcgjpXOQulvvDu-QjP_Mn02leVfuJYt6ur39qmFxyylYqsNnrBanEpyo')"}}></div>
                                <div className="min-w-[50px] aspect-square rounded-md bg-cover bg-center border border-white/5 relative group/player" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAGxtaLY4xUPPtmI9aWQA68RsfFpRJYwkYe7gwNWFffihBDF3So76X1hna7r_6m7Q-eTPGnoRedSXX6nhDA0VDwfpcnnjOgBsFaTWCfHPvS2LKhNZSX8esnAzBlYIO9jnjcFzFesEDupb2gQOlkePPAwAkNP42CJCdy5cQvswHu46F1C8dTvSYAE3yVvuwqj-L5LqXqjrMtCGmdXtCHIHBisUdTrSo82mSvWAmjQQkrSiBOEw8Ty329FJvlUy6gW3SpqvSYlj5CVgY')"}}></div>
                                <div className="min-w-[50px] aspect-square rounded-md bg-white/5 flex items-center justify-center border border-white/5"><span className="text-white/40 text-xs font-bold">+5</span></div>
                            </div>
                        </div>
                        <button onClick={() => openSquadModal('United FC')} className="w-full mt-2 py-2 rounded-lg bg-white/5 text-primary text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors border border-white/5">View Squad</button>
                    </div>

                    <div className="flex flex-col gap-4 bg-[#1a2e1f]/40 backdrop-blur-sm p-5 rounded-xl border border-white/5 hover:border-white/20 transition-all group">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">C</div>
                                <div>
                                    <p className="text-white text-lg font-bold leading-none mb-1">City Blues</p>
                                    <p className="text-white/50 text-xs">Manager: Pep G.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-primary text-sm font-bold">£195M</p>
                                <p className="text-white/40 text-[10px] uppercase">Spent</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-white/40 text-[10px] uppercase mb-2 tracking-widest">Acquired Squad</p>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                                <div className="min-w-[50px] aspect-square rounded-md bg-white/5 flex items-center justify-center border border-white/5"><span className="material-symbols-outlined text-white/20">person</span></div>
                                <div className="min-w-[50px] aspect-square rounded-md bg-white/5 flex items-center justify-center border border-white/5"><span className="material-symbols-outlined text-white/20">person</span></div>
                                <div className="min-w-[50px] aspect-square rounded-md bg-white/5 flex items-center justify-center border border-white/5"><span className="material-symbols-outlined text-white/20">person</span></div>
                                <div className="min-w-[50px] aspect-square rounded-md bg-white/5 flex items-center justify-center border border-white/5"><span className="text-white/40 text-xs font-bold">+11</span></div>
                            </div>
                        </div>
                        <button onClick={() => openSquadModal('City Blues')} className="w-full mt-2 py-2 rounded-lg bg-white/5 text-primary text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors border border-white/5">View Squad</button>
                    </div>

                    <div className="flex flex-col gap-4 bg-[#1a2e1f]/40 backdrop-blur-sm p-5 rounded-xl border border-white/5 hover:border-white/20 transition-all group">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold">L</div>
                                <div>
                                    <p className="text-white text-lg font-bold leading-none mb-1">London Lions</p>
                                    <p className="text-white/50 text-xs">Manager: Emma H.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-primary text-sm font-bold">£150M</p>
                                <p className="text-white/40 text-[10px] uppercase">Spent</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-white/40 text-[10px] uppercase mb-2 tracking-widest">Acquired Squad</p>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                                <div className="min-w-[50px] aspect-square rounded-md bg-white/5 flex items-center justify-center border border-white/5"><span className="material-symbols-outlined text-white/20">person</span></div>
                                <div className="min-w-[50px] aspect-square rounded-md bg-white/5 flex items-center justify-center border border-white/5"><span className="material-symbols-outlined text-white/20">person</span></div>
                                <div className="min-w-[50px] aspect-square rounded-md bg-white/5 flex items-center justify-center border border-white/5"><span className="text-white/40 text-xs font-bold">+9</span></div>
                            </div>
                        </div>
                        <button onClick={() => openSquadModal('London Lions')} className="w-full mt-2 py-2 rounded-lg bg-white/5 text-primary text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors border border-white/5">View Squad</button>
                    </div>
                </div>
            </div>
        </div>

        <div className="px-4 md:px-20 lg:px-40 flex justify-center pb-20">
            <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
                    <div className="bg-[#1a2e1f]/60 p-5 rounded-xl border border-white/5 flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center"><span className="material-symbols-outlined text-primary">trending_up</span></div>
                        <div><p className="text-white/40 text-[10px] uppercase tracking-wider">Most Expensive</p><p className="text-white font-bold">K. Mbappé (£95M)</p></div>
                    </div>
                    <div className="bg-[#1a2e1f]/60 p-5 rounded-xl border border-white/5 flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center"><span className="material-symbols-outlined text-primary">savings</span></div>
                        <div><p className="text-white/40 text-[10px] uppercase tracking-wider">Biggest Bargain</p><p className="text-white font-bold">J. Milner (£2M)</p></div>
                    </div>
                    <div className="bg-[#1a2e1f]/60 p-5 rounded-xl border border-white/5 flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center"><span className="material-symbols-outlined text-primary">shopping_cart</span></div>
                        <div><p className="text-white/40 text-[10px] uppercase tracking-wider">Total Bids</p><p className="text-white font-bold">1,429 Bids</p></div>
                    </div>
                    <div className="bg-[#1a2e1f]/60 p-5 rounded-xl border border-white/5 flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center"><span className="material-symbols-outlined text-primary">history</span></div>
                        <div><p className="text-white/40 text-[10px] uppercase tracking-wider">Auction Time</p><p className="text-white font-bold">02:45:12</p></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

{showModal && (
<div onClick={closeSquadModal} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-opacity duration-300">
    <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-5xl bg-[#1a2e1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#102216]">
            <div>
                <h3 className="text-2xl font-bold text-white uppercase italic">{selectedTeam}</h3>
                <p className="text-white/50 text-sm">Full Squad List</p>
            </div>
            <button onClick={closeSquadModal} className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-white">close</span>
            </button>
        </div>
        
        <div className="overflow-y-auto p-6 flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" id="modalPlayerList">
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-primary/50 transition-colors group cursor-pointer">
                    <div className="size-20 rounded-full bg-cover bg-center border-2 border-primary/30 group-hover:border-primary transition-colors" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-tjDJVaW649IYUVVdTsGHhUn9o3bKsj3_752YObeb0mcBCeO6qAo7AKLhv7kOGSrnQbbJXJVR2N2R3nKmD7avoP9FKuJwVbfKH1vANYMWD7-S6AZPPC_JS_qd25J8hu8jkF9R_vZ7Cob55eQsWlEcG7_ASIfs1Tf484rcAgaabNYZGvSQV-lgsCLeQEjAZyk3abrBOFmnnwbmec3JWEdFUovevA1iyY8x653-hnN8x4sKllKhqbVm_DYuWgr0Lycn46141YndEDQ')"}}></div>
                    <div className="text-center">
                        <p className="text-white font-bold text-sm">Kylian Mbappé</p>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Forward</p>
                    </div>
                    <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">£95M</div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-primary/50 transition-colors group cursor-pointer">
                    <div className="size-20 rounded-full bg-cover bg-center border-2 border-white/10 group-hover:border-primary transition-colors" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCyk2kYoHx7gPh1HxW5cvT1shdZo6rHSLiyF2ZJDr6_I3CobMqG8fJ8EOvOMfF0GsFrCQEwuisdnsoVvKoUZir4RvDvd6R1Mgea4bQ_zbu8SF3WJzmg4mR4pwBKgKoladch24oGqKAvvut3PszKVxAoEcy8bwSVOYiprmkyuMoTkj7ASLCttMM1LAcH70-9WTDxKahsuK46XQMAiAfefzV1vkENKXoGCg5_tvtl_Rna2AKVjRZCCr1_C1K9X0pFtZHYnyemu6ONRwU')"}}></div>
                    <div className="text-center">
                        <p className="text-white font-bold text-sm">Kevin De Bruyne</p>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Midfielder</p>
                    </div>
                    <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">£78M</div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-primary/50 transition-colors group cursor-pointer">
                    <div className="size-20 rounded-full bg-cover bg-center border-2 border-white/10 group-hover:border-primary transition-colors" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDP1XhKH4yA-Q1av72Fy2h9UK-yPKi8LJRASpbgbiorsVCBwtTiSvTGwN_GQWvA1UIgg4l81jnEgH4P1dYqBYAM-f4yDh0Rfp1M282m6lzXbuXKGPuVqbRJTQ9GZdWseZsoK3iisLemyHf2yuJbbVnLER6hxPIzkrErB_3kedjEH2uw8AFBPsNPid2AllrhclZ-K-VkpxE5NM5xv96GeB5z5HaHl4z8OrFKZxR7Ac5d1Gx5DFkWQOFJjDkQNC-VWJPvkst0PN3Y94E')"}}></div>
                    <div className="text-center">
                        <p className="text-white font-bold text-sm">Erling Haaland</p>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Forward</p>
                    </div>
                    <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">£62M</div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-primary/50 transition-colors group cursor-pointer">
                    <div className="size-20 rounded-full bg-cover bg-center border-2 border-white/10 group-hover:border-primary transition-colors" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBN3pdSxgsvO18K3vUHYCSKDxw80TTTiNhIEu-5F_bMvI-JmNDqfYaj1bw8l2r9TObRZP4mAUEIEU2imjiI0NfQOwDP9CKYmPsUkoSf9cQaQ7ONHyPcLbcZgMDyCGHUd6FZXdRJTxeNYPMd5z8FCpBDH1FO4M2gSGedns-zIygsKvN7uCuLqKXV9KmfB1Z_p8fXFdA__f7pw0973KV-xAwGPVIn2yKqHDIFsRVWYpN4z2gjYibpj_W8KlbtzqLSy6beSnxgO_9cCjg')"}}></div>
                    <div className="text-center">
                        <p className="text-white font-bold text-sm">Marcus Rashford</p>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Forward</p>
                    </div>
                    <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">£42M</div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-primary/50 transition-colors group cursor-pointer">
                    <div className="size-20 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/10 group-hover:border-primary transition-colors">
                        <span className="material-symbols-outlined text-3xl text-white/50">person</span>
                    </div>
                    <div className="text-center">
                        <p className="text-white font-bold text-sm">Bukayo Saka</p>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Midfielder</p>
                    </div>
                    <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">£55M</div>
                </div>
                 <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-primary/50 transition-colors group cursor-pointer">
                    <div className="size-20 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/10 group-hover:border-primary transition-colors">
                        <span className="material-symbols-outlined text-3xl text-white/50">person</span>
                    </div>
                    <div className="text-center">
                        <p className="text-white font-bold text-sm">Bruno Fernandes</p>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Midfielder</p>
                    </div>
                    <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">£60M</div>
                </div>
            </div>
        </div>
    </div>
</div>
)}

</div>
    </>
  );
};

export default Post_auction_statistics;