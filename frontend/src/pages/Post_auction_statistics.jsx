import React, { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_URL } from "../config";

const Post_auction_statistics = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedTeamName, setSelectedTeamName] = useState('');
    const [selectedTeamPlayers, setSelectedTeamPlayers] = useState([]);

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const location = useLocation();
    const [searchParams] = useSearchParams();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const auctionId =
        location.state?.auctionId ||
        searchParams.get('auction_id') ||
        localStorage.getItem('lastAuctionId');

    useEffect(() => {
        if (!auctionId) {
            setLoading(false);
            return;
        }

        fetch(`${API_URL}/api/auctions/${auctionId}/stats`)
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data?.error || `Failed to fetch stats (${res.status})`);
                }
                return data;
            })
            .then(data => {
                if (!data || !Array.isArray(data.teams) || !data.global) {
                    throw new Error("Invalid stats response from server");
                }
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching stats:", err);
                setError(err.message || "Failed to load statistics");
                setLoading(false);
            });
    }, [auctionId]);

    const openSquadModal = (team) => {
        setSelectedTeamName(team.team_name);
        setSelectedTeamPlayers(team.players || []);
        setShowModal(true);
    };

    const closeSquadModal = () => {
        setShowModal(false);
    };

    const formatMoney = (amount) => {
        if (amount >= 1000000) {
            const val = amount / 1000000;
            return "£" + (Number.isInteger(val) ? val : val.toFixed(1)) + "M";
        }
        return "£" + (amount || 0).toLocaleString();
    };

    const formatDuration = (seconds) => {
        if (!seconds) return "00:00:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <div className="min-h-screen bg-background-dark text-white flex items-center justify-center font-bold text-xl uppercase tracking-widest">
            <div className="flex flex-col items-center gap-4">
                <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                Loading Statistics...
            </div>
        </div>;
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-background-dark text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">No Statistics Available</h1>
                    <p className="text-white/60 mb-6">{error || "Auction ID not found or data missing."}</p>
                    <Link to="/user_dashboard" className="bg-primary text-black font-bold py-2 px-6 rounded-lg hover:bg-primary/90">Go to Dashboard</Link>
                </div>
            </div>
        );
    }

    const global = stats?.global || {};
    const teams = Array.isArray(stats?.teams) ? stats.teams : [];
    const myTeam = teams.find(t => String(t.manager || '').toLowerCase() === String(user.username || '').toLowerCase()) || null;
    // Sort teams by spent to determine champion if not explicit. Server sorts by spent DESC.
    const champion = teams.length > 0 ? teams[0] : null;
    const others = teams.filter(t => !myTeam || t.team_id !== myTeam.team_id);

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

                        {/* YOUR SUMMARY */}
                        {myTeam && (
                            <div className="px-4 md:px-20 lg:px-40 flex justify-center mb-10">
                                <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
                                    <div className="rounded-xl border border-primary/40 bg-[#102216]/80 backdrop-blur-md p-6">
                                        <div className="flex items-center justify-between gap-4 flex-wrap">
                                            <div>
                                                <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Your Auction Summary</p>
                                                <h2 className="text-white text-3xl font-black uppercase italic">{myTeam.team_name}</h2>
                                                <p className="text-white/60 text-sm">Manager: {myTeam.manager}</p>
                                            </div>
                                            <Link to={`/formation_settings?team_id=${myTeam.team_id}`} className="px-4 py-2 rounded-lg bg-primary text-black text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-colors flex items-center gap-2">
                                                <span className="material-symbols-outlined">sports_soccer</span>
                                                Set Formation
                                            </Link>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                                            <div className="bg-white/5 rounded-lg p-4">
                                                <p className="text-white/50 text-xs uppercase tracking-wider">Total Spent</p>
                                                <p className="text-primary text-2xl font-bold">{formatMoney(myTeam.spent)}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-4">
                                                <p className="text-white/50 text-xs uppercase tracking-wider">Players Bought</p>
                                                <p className="text-white text-2xl font-bold">{myTeam.players_count}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-4">
                                                <p className="text-white/50 text-xs uppercase tracking-wider">Remaining Budget</p>
                                                <p className="text-white text-2xl font-bold">{formatMoney(myTeam.remaining_budget)}</p>
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Top Purchases</p>
                                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                                {myTeam.players.length > 0 ? myTeam.players.slice(0, 8).map(p => (
                                                    <div key={p.id} className="min-w-[90px] bg-white/5 rounded-lg p-2 border border-white/10">
                                                        <div className="h-14 w-full rounded bg-cover bg-center border border-white/10" style={{ backgroundImage: `url('${p.image_url}')` }}></div>
                                                        <p className="text-[10px] font-bold text-white mt-2 truncate">{p.name}</p>
                                                        <p className="text-[10px] text-primary">{formatMoney(p.acquired_price)}</p>
                                                    </div>
                                                )) : (
                                                    <p className="text-white/50 text-sm">No players purchased in this auction.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CHAMPION CARD */}
                        {champion && (
                            <div className="px-4 md:px-20 lg:px-40 flex justify-center mb-12">
                                <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
                                    <div className="p-4 @container">
                                        <div className="flex flex-col items-stretch justify-start rounded-xl @xl:flex-row @xl:items-center bg-[#1a2e1f]/80 backdrop-blur-md gold-glow overflow-hidden">
                                            <div className="relative w-full @xl:w-1/2 h-[350px] bg-center bg-no-repeat bg-cover flex items-end p-6 overflow-hidden"
                                                style={{ backgroundImage: 'linear-gradient(0deg, rgba(16, 34, 22, 1) 0%, rgba(16, 34, 22, 0) 50%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCYpgMPgcBAuNcx3f_mh2CfkCNblzvit1pJ3enyIVkKbzc5FeLlN2BVaTmtGRGkdcA6J6hPWMkZQoO7yKUG79A4ZcL6WVq1E_uuxHyAlWOpa7JNOrkluYaWcvLktsVC3fZ7r-DHP5u_j_MF9DARMgVjZuoMfOQ00CWDLI9ld35ICA4ZUK8uYq-dPVOSazcS2xluVYsFHW7aq7BUhGN6sHJpWP-wU_H3ZVzeV97mUec9UHp5hscc-S-H5zorKcK71RyoScjE9TTylcg")' }}>
                                                <div className="absolute top-4 left-4 bg-gold text-background-dark px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">emoji_events</span>
                                                    TOP SPENDER
                                                </div>
                                                <div>
                                                    <h3 className="text-gold text-4xl font-black uppercase italic">{champion.team_name}</h3>
                                                    <p className="text-white/80 font-medium">Manager: {champion.manager}</p>
                                                </div>
                                            </div>
                                            <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-6 py-8 px-8">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-white/5 p-4 rounded-lg">
                                                        <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Squad Value</p>
                                                        <p className="text-primary text-3xl font-bold">{formatMoney(champion.spent)}</p>
                                                    </div>
                                                    <div className="bg-white/5 p-4 rounded-lg">
                                                        <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Players Signed</p>
                                                        <p className="text-white text-3xl font-bold">{champion.players_count}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Star Acquisitions</p>
                                                    <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                                                        {champion.players.slice(0, 3).map(p => (
                                                            <div key={p.id} className="flex flex-col items-center gap-2 min-w-[60px]">
                                                                <div className="size-20 rounded-lg bg-cover bg-center border border-gold/30"
                                                                    style={{ backgroundImage: `url('${p.image_url}')` }}></div>
                                                                <p className="text-xs font-medium text-white/80 w-full truncate text-center">{p.name}</p>
                                                                <p className="text-[10px] text-primary">{formatMoney(p.acquired_price)}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Link to={`/formation_settings?team_id=${champion.team_id}`} className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 bg-primary text-background-dark font-bold hover:bg-primary/90 transition-colors">
                                                    <span className="material-symbols-outlined mr-2">sports_soccer</span>
                                                    SET FORMATION
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="px-4 md:px-20 lg:px-40 flex justify-center">
                            <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
                                <h2 className="text-white text-2xl font-bold leading-tight tracking-tight px-4 pb-6 pt-5 flex items-center gap-2 uppercase">
                                    <span className="w-8 h-[2px] bg-primary"></span>
                                    Other Competitors
                                </h2>
                            </div>
                        </div>

                        {/* OTHER TEAMS */}
                        <div className="px-4 md:px-20 lg:px-40 flex justify-center mb-20">
                            <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                                    {others.map(team => (
                                        <div key={team.team_id} className="flex flex-col gap-4 bg-[#1a2e1f]/40 backdrop-blur-sm p-5 rounded-xl border border-white/5 hover:border-white/20 transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">{team.team_name.charAt(0)}</div>
                                                    <div>
                                                        <p className="text-white text-lg font-bold leading-none mb-1">{team.team_name}</p>
                                                        <p className="text-white/50 text-xs">Manager: {team.manager}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-primary text-sm font-bold">{formatMoney(team.spent)}</p>
                                                    <p className="text-white/40 text-[10px] uppercase">Spent</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-white/40 text-[10px] uppercase mb-2 tracking-widest">Acquired Squad</p>
                                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                                                    {team.players.slice(0, 5).map(p => (
                                                        <div key={p.id} className="min-w-[50px] aspect-square rounded-md bg-cover bg-center border border-white/5 relative group/player"
                                                            style={{ backgroundImage: `url('${p.image_url}')` }}></div>
                                                    ))}
                                                    {team.players_count > 5 && (
                                                        <div className="min-w-[50px] aspect-square rounded-md bg-white/5 flex items-center justify-center border border-white/5">
                                                            <span className="text-white/40 text-xs font-bold">+{team.players_count - 5}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Link to={`/formation_settings?team_id=${team.team_id}`} className="w-full mt-2 py-2 rounded-lg bg-white/5 text-primary text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors border border-white/5 flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-sm">sports_soccer</span>
                                                Set Formation
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* GLOBAL STATS DASHBOARD */}
                        <div className="px-4 md:px-20 lg:px-40 flex justify-center pb-20">
                            <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
                                    <div className="bg-[#1a2e1f]/60 p-5 rounded-xl border border-white/5 flex items-center gap-4">
                                        <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center"><span className="material-symbols-outlined text-primary">trending_up</span></div>
                                        <div>
                                            <p className="text-white/40 text-[10px] uppercase tracking-wider">Most Expensive</p>
                                            <p className="text-white font-bold">{global.most_expensive ? `${global.most_expensive.name} (${formatMoney(global.most_expensive.acquired_price)})` : '---'}</p>
                                        </div>
                                    </div>
                                    {/* Placeholder for Biggest Bargain - hardcoded or assume logic later */}
                                    <div className="bg-[#1a2e1f]/60 p-5 rounded-xl border border-white/5 flex items-center gap-4">
                                        <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center"><span className="material-symbols-outlined text-primary">savings</span></div>
                                        <div>
                                            <p className="text-white/40 text-[10px] uppercase tracking-wider">Total Spent</p>
                                            <p className="text-white font-bold">{formatMoney(global.total_spent)}</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#1a2e1f]/60 p-5 rounded-xl border border-white/5 flex items-center gap-4">
                                        <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center"><span className="material-symbols-outlined text-primary">shopping_cart</span></div>
                                        <div><p className="text-white/40 text-[10px] uppercase tracking-wider">Total Sold</p><p className="text-white font-bold">{global.total_sold} Players</p></div>
                                    </div>
                                    <div className="bg-[#1a2e1f]/60 p-5 rounded-xl border border-white/5 flex items-center gap-4">
                                        <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center"><span className="material-symbols-outlined text-primary">history</span></div>
                                        <div><p className="text-white/40 text-[10px] uppercase tracking-wider">Duration</p><p className="text-white font-bold">{formatDuration(global.duration)}</p></div>
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
                                    <h3 className="text-2xl font-bold text-white uppercase italic">{selectedTeamName}</h3>
                                    <p className="text-white/50 text-sm">Full Squad List</p>
                                </div>
                                <button onClick={closeSquadModal} className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <span className="material-symbols-outlined text-white">close</span>
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 flex-1">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" id="modalPlayerList">
                                    {selectedTeamPlayers.map(p => (
                                        <div key={p.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-primary/50 transition-colors group cursor-pointer">
                                            <div className="size-20 rounded-full bg-cover bg-center border-2 border-white/10 group-hover:border-primary transition-colors" style={{ backgroundImage: `url('${p.image_url}')` }}></div>
                                            <div className="text-center">
                                                <p className="text-white font-bold text-sm">{p.name}</p>
                                                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">{p.position_group}</p>
                                            </div>
                                            <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">{formatMoney(p.acquired_price)}</div>
                                        </div>
                                    ))}
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
