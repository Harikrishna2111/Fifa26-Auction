import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

import { API_URL } from "../config";

const Manage_teams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem("user")) || { id: null };
            if (!user || !user.id) {
                setError("User not logged in");
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_URL}/api/teams/manage?user_id=${user.id}`);
            if (!res.ok) throw new Error("Failed to fetch teams");
            const data = await res.json();
            setTeams(data);
        } catch (err) {
            setError(err.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    const formatMarket = (val) => {
        if (val == null) return "--";
        if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
        if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
        return `$${val}`;
    };

    const statusBadge = (status) => {
        if (status === "ACTIVE") {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                    </span>
                    ACTIVE
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold">
                IDLE
            </span>
        );
    };

    const totalCount = teams.length;
    const activeCount = teams.filter((t) => t.status === "ACTIVE").length;
    const idleCount = teams.filter((t) => t.status !== "ACTIVE").length;

    const filteredTeams = teams.filter((t) => {
        if (filter === 'ALL') return true;
        if (filter === 'ACTIVE') return t.status === 'ACTIVE';
        if (filter === 'IDLE') return t.status !== 'ACTIVE';
        return true;
    });

    return (<>
        <div className="bg-background-light dark:bg-background-dark font-display text-white transition-colors duration-300">
            <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden stadium-vignette">

                <Navbar isLoggedIn={!!localStorage.getItem("user")} userName={(JSON.parse(localStorage.getItem("user")) || {}).name || ""} />

                <main className="flex-1 px-6 md:px-20 py-8 max-w-[1440px] mx-auto w-full">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 mb-4">
                        <a className="text-primary/70 text-sm font-medium hover:underline" href="#">Dashboard</a>
                        <span className="text-white/30 text-xs material-symbols-outlined">chevron_right</span>
                        <span className="text-white text-sm font-medium">Manage Teams</span>
                    </div>
                    {/* Page Heading */}
                    <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-3xl">groups</span>
                                <h1 className="text-white text-4xl font-black tracking-tight">Manage All Teams</h1>
                            </div>
                            <p className="text-white/60 text-base max-w-md">Oversee, analyze, and optimize your global football portfolio from a single command center.</p>
                        </div>
                        <button className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all">
                            <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
                            <span>Back to Dashboard</span>
                        </button>
                    </div>
                    {/* Tabs Section */}
                    <div className="flex border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
                        <button onClick={() => setFilter('ALL')} className={`flex items-center gap-2 px-6 py-4 font-bold text-sm ${filter === 'ALL' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-white/50 hover:text-white'}`}>
                            <span>All Squads</span>
                            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px]">{totalCount}</span>
                        </button>
                        <button onClick={() => setFilter('ACTIVE')} className={`flex items-center gap-2 px-6 py-4 font-bold text-sm ${filter === 'ACTIVE' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-white/50 hover:text-white'}`}>
                            <span>Active Auctions</span>
                            <span className="bg-white/10 text-white/50 px-2 py-0.5 rounded text-[10px]">{activeCount}</span>
                        </button>
                        <button onClick={() => setFilter('IDLE')} className={`flex items-center gap-2 px-6 py-4 font-bold text-sm ${filter === 'IDLE' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-white/50 hover:text-white'}`}>
                            <span>Idle Rosters</span>
                            <span className="bg-white/10 text-white/50 px-2 py-0.5 rounded text-[10px]">{idleCount}</span>
                        </button>
                    </div>
                    {/* Management Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full flex justify-center items-center py-20">
                                <div className="text-white/60">Loading teams...</div>
                            </div>
                        ) : error ? (
                            <div className="col-span-full flex justify-center items-center py-20">
                                <div className="text-red-400">Error: {error}</div>
                            </div>
                        ) : teams.length === 0 ? (
                            <div className="col-span-full flex justify-center items-center py-20">
                                <div className="text-white/60">No teams found</div>
                            </div>
                        ) : filteredTeams.length === 0 ? (
                            <div className="col-span-full flex justify-center items-center py-20">
                                <div className="text-white/60">No teams found for selected filter</div>
                            </div>
                        ) : (
                            filteredTeams.map((team) => (
                                <div key={team.id} className={`flex flex-col bg-surface-dark border-t-4 rounded-xl overflow-hidden transition-all duration-300 ${team.status === 'ACTIVE' ? 'border-green-500 card-glow-green' : 'border-blue-500 card-glow-blue opacity-90 hover:opacity-100'}`}>
                                    <div className="p-6 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black tracking-widest text-primary mb-1 uppercase">{team.league || 'Unknown'}</span>
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight">{team.name}</h3>
                                            </div>
                                            {statusBadge(team.status)}
                                        </div>

                                        <div className="flex items-center -space-x-3 mb-8">
                                            {(team.avatars || []).slice(0, 3).map((url, idx) => (
                                                <div key={idx} className="size-10 rounded-full border-2 border-surface-dark bg-cover bg-center" style={{ backgroundImage: `url('${url}')` }}></div>
                                            ))}
                                            {(team.avatars && team.avatars.length > 3) ? (
                                                <div className="size-10 rounded-full border-2 border-surface-dark bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">+{team.avatars.length - 3}</div>
                                            ) : null}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Team OVR</p>
                                                <p className="text-2xl font-black text-white">{team.teamOVR ?? '--'}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Market Value</p>
                                                <p className="text-2xl font-black text-primary">{formatMarket(team.marketValue)}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 mt-auto">
                                            <Link to={`/formation_settings?team_id=${team.id}`}>
                                                <button className="w-full py-3 bg-primary text-background-dark font-black text-sm rounded-lg hover:brightness-110 transition-all uppercase tracking-wider">View Squad</button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Create New Team Card */}
                        <div className="flex flex-col bg-white/5 border-2 border-dashed border-white/20 rounded-xl overflow-hidden hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group cursor-pointer min-h-[400px]">
                            <div className="p-6 flex flex-col h-full items-center justify-center text-center">
                                <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                    <span className="material-symbols-outlined text-4xl text-white/40 group-hover:text-primary transition-colors">add</span>
                                </div>
                                <h3 className="text-xl font-black text-white uppercase mb-2">Create New Squad</h3>
                                <p className="text-white/40 text-sm max-w-[200px] mb-8">Establish a new franchise and begin scouting top tier talent.</p>
                                <Link to="/create_team">
                                    <button className="px-8 py-3 bg-white/10 text-white font-black text-sm rounded-lg group-hover:bg-primary group-hover:text-background-dark transition-all uppercase tracking-wider">Start Drafting</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    </>);
}


export default Manage_teams;