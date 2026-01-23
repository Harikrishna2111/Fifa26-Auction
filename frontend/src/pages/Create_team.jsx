import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { API_URL } from "../config";

const Create_team = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [position, setPosition] = useState("ALL");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(18);
    const [total, setTotal] = useState(0);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const MAX_SQUAD = 20;
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    useEffect(() => {
        // Restore selected players from location state or localStorage
        const savedPlayers = location.state?.selectedPlayers || JSON.parse(localStorage.getItem('selectedPlayers') || '[]');
        if (savedPlayers.length > 0) {
            setSelectedPlayers(savedPlayers);
        }
    }, []);

    useEffect(() => {
        fetchPlayers();
    }, [page, position]);

    useEffect(() => {
        // Save to localStorage whenever selectedPlayers changes
        localStorage.setItem('selectedPlayers', JSON.stringify(selectedPlayers));
    }, [selectedPlayers]);

    const fetchPlayers = async (opts = {}) => {
        try {
            setLoading(true);
            setError(null);
            const q = new URLSearchParams();
            const s = opts.search !== undefined ? opts.search : search;
            const p = opts.position !== undefined ? opts.position : position;
            if (s) q.set('search', s);
            if (p && p !== 'ALL') q.set('position', p);

            const currentPage = opts.page !== undefined ? opts.page : page;
            const currentPageSize = opts.pageSize !== undefined ? opts.pageSize : pageSize;
            q.set('limit', currentPageSize);
            q.set('offset', (currentPage - 1) * currentPageSize);

            const res = await fetch(`${API_URL}/api/players/market?${q.toString()}`);
            if (!res.ok) throw new Error('Failed to load players');
            const data = await res.json();
            // API returns { total, players } now — handle both shapes
            if (Array.isArray(data)) {
                setPlayers(data);
                setTotal(data.length);
            } else {
                setPlayers(data.players || []);
                setTotal(data.total || 0);
            }
        } catch (err) {
            setError(err.message || 'Unknown error');
            setPlayers([]);
        } finally {
            setLoading(false);
        }
    };

    const addPlayer = (player) => {
        if (!player) return;
        if (selectedPlayers.find((p) => p.id === player.id)) return;
        if (selectedPlayers.length >= MAX_SQUAD) return;
        setSelectedPlayers((s) => [...s, player]);
    };

    const removePlayer = (playerId) => {
        setSelectedPlayers((s) => s.filter((p) => p.id !== playerId));
    };

    const handlePositionClick = (pos) => {
        setPosition(pos);
        setPage(1);
    };

    const handleSearch = () => {
        setPage(1);
        fetchPlayers({ search, page: 1 });
    };

    return (
        <>
            <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col font-display">
                <Navbar />
                <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 lg:px-20 py-8">
                    <div className="mb-8">

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div className="max-w-2xl">
                                <h1 className="text-white text-5xl font-black leading-none tracking-tighter mb-3 uppercase italic">Build Your <span className="text-primary">Ultimate</span> Squad</h1>
                                <p className="text-white/60 text-lg">Scout the best talent, manage your budget, and draft a world-class team for the elite league.</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-8 items-start">
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            <div className="glass-panel rounded-xl p-4 flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                        className="w-full bg-white/5 border-white/10 focus:border-primary focus:ring-0 rounded-lg pl-12 text-white placeholder:text-white/30"
                                        placeholder="Search players by name, club, or nationality..."
                                        type="text"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSearch} className="ml-2 bg-white/6 hover:bg-white/10 text-white font-semibold px-3 py-2 rounded-lg text-sm border border-white/10">Search</button>

                                    <button onClick={() => handlePositionClick('ALL')} className={`px-4 py-2 rounded-lg text-sm transition-transform active:scale-95 font-bold ${position === 'ALL' ? 'bg-primary text-background-dark' : 'bg-white/5 text-white border border-white/10'}`}>ALL</button>
                                    <button onClick={() => handlePositionClick('FWD')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${position === 'FWD' ? 'bg-primary text-background-dark font-bold' : 'bg-white/5 text-white border border-white/10'}`}>FWD</button>
                                    <button onClick={() => handlePositionClick('MID')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${position === 'MID' ? 'bg-primary text-background-dark font-bold' : 'bg-white/5 text-white border border-white/10'}`}>MID</button>
                                    <button onClick={() => handlePositionClick('DEF')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${position === 'DEF' ? 'bg-primary text-background-dark font-bold' : 'bg-white/5 text-white border border-white/10'}`}>DEF</button>
                                    <button onClick={() => handlePositionClick('GK')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${position === 'GK' ? 'bg-primary text-background-dark font-bold' : 'bg-white/5 text-white border border-white/10'}`}>GK</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="col-span-full flex justify-center items-center py-20">
                                        <div className="text-white/60">Loading players...</div>
                                    </div>
                                ) : error ? (
                                    <div className="col-span-full flex justify-center items-center py-20">
                                        <div className="text-red-400">Error: {error}</div>
                                    </div>
                                ) : players.length === 0 ? (
                                    <div className="col-span-full flex justify-center items-center py-20">
                                        <div className="text-white/60">No players found</div>
                                    </div>
                                ) : (
                                    players.map((p) => (
                                        <div key={p.id} className="group bg-white/5 border border-white/10 hover:border-primary/50 rounded-xl p-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(13,242,89,0.1)]">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="size-16 rounded-lg bg-white/10 overflow-hidden">
                                                    <img alt={p.name} className="w-full h-full object-cover" src={p.image_url} />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-primary italic">{p.overall}</div>
                                                    <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none">Rating</div>
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <h3 className="text-white font-bold text-lg leading-tight uppercase">{p.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">{p.position_group}</span>
                                                    <span className="text-white/40 text-xs font-medium uppercase tracking-tighter">{p.club || p.nation}</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 mb-5">
                                                <div className="text-center p-1.5 bg-white/5 rounded">
                                                    <div className="text-[10px] text-white/40 font-bold uppercase">PAC</div>
                                                    <div className="text-sm font-bold text-white">{p.pac ?? '-'}</div>
                                                </div>
                                                <div className="text-center p-1.5 bg-white/5 rounded">
                                                    <div className="text-[10px] text-white/40 font-bold uppercase">SHO</div>
                                                    <div className="text-sm font-bold text-white">{p.sho ?? '-'}</div>
                                                </div>
                                                <div className="text-center p-1.5 bg-white/5 rounded">
                                                    <div className="text-[10px] text-white/40 font-bold uppercase">DRI</div>
                                                    <div className="text-sm font-bold text-white">{p.dri ?? '-'}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => addPlayer(p)} disabled={selectedPlayers.find(sp => sp.id === p.id) || selectedPlayers.length >= MAX_SQUAD} className="w-full bg-primary/10 group-hover:bg-primary border border-primary/30 text-primary group-hover:text-background-dark font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                                <span className="material-symbols-outlined text-sm">add_circle</span>
                                                {selectedPlayers.find(sp => sp.id === p.id) ? 'Added' : 'Add to Team'}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            {/* Pagination controls */}
                            <div className="flex items-center justify-between gap-4 mt-3">
                                <div className="text-white/60 text-sm">{total} players</div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { if (page > 1) { setPage(page - 1); } }} disabled={page <= 1} className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40">Prev</button>
                                    <div className="text-white/80 text-sm">Page {page} of {Math.max(1, Math.ceil(total / pageSize))}</div>
                                    <button onClick={() => { if (page * pageSize < total) { setPage(page + 1); } }} disabled={page * pageSize >= total} className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40">Next</button>
                                </div>
                            </div>
                        </div>
                        {/* Right Panel: Your Team */}
                        <div className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                            {/* Team Summary Card */}
                            <div className="bg-primary text-background-dark rounded-xl p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute right-[-20px] top-[-20px] opacity-10">
                                    <span className="material-symbols-outlined !text-9xl">shield</span>
                                </div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="font-black text-2xl italic leading-none uppercase tracking-tighter">Squad Status</h3>
                                            <p className="text-background-dark/70 font-bold uppercase text-xs tracking-widest mt-1">Elite League Season 2</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-4xl font-black italic">{selectedPlayers.length > 0 ? Math.round(selectedPlayers.reduce((sum, p) => sum + (p.overall || 0), 0) / selectedPlayers.length) : 0}</div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest leading-none">Avg OVR</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between items-end">
                                            <span className="font-bold text-sm uppercase">Squad Depth</span>
                                            <span className="font-black text-lg italic leading-none">{selectedPlayers.length}/{MAX_SQUAD}</span>
                                        </div>
                                        <div className="w-full h-3 bg-background-dark/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-background-dark rounded-full" style={{ width: `${(selectedPlayers.length / MAX_SQUAD) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 pt-4 border-t border-background-dark/10">
                                        <div className="flex-1">
                                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Remaining Budget</div>
                                            <div className="text-xl font-black italic">€ 42.5M</div>
                                        </div>
                                        <div className="size-10 bg-background-dark text-primary rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined">trending_up</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Selected Players List */}
                            <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                    <h4 className="text-white font-bold uppercase tracking-wider text-sm italic">Active Roster</h4>
                                    <span className="text-white/40 text-[10px] font-bold uppercase">{selectedPlayers.length} of {MAX_SQUAD}</span>
                                </div>
                                <div className="max-h-[460px] overflow-y-auto custom-scrollbar">
                                    {selectedPlayers.length === 0 ? (
                                        <div className="p-4 bg-white/2 border border-dashed border-white/10 m-3 rounded-lg flex flex-col items-center justify-center py-8 text-center">
                                            <span className="material-symbols-outlined text-white/10 text-4xl mb-2">person_add</span>
                                            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Select {MAX_SQUAD} players</p>
                                        </div>
                                    ) : (
                                        <>
                                            {selectedPlayers.map((player) => (
                                                <div key={player.id} className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                    <div className="size-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                                                        <img alt={player.name} className="w-full h-full object-cover" src={player.image_url} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className="text-white font-bold text-sm uppercase tracking-tight">{player.name}</h5>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-primary text-[10px] font-black italic">{player.overall} OVR</span>
                                                            <span className="text-white/40 text-[10px] uppercase font-bold">{player.position_group}</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removePlayer(player.id)} className="text-white/20 hover:text-red-500 transition-colors">
                                                        <span className="material-symbols-outlined text-lg">cancel</span>
                                                    </button>
                                                </div>
                                            ))}
                                            {selectedPlayers.length < MAX_SQUAD && (
                                                <div className="p-4 bg-white/2 border border-dashed border-white/10 m-3 rounded-lg flex flex-col items-center justify-center py-8 text-center">
                                                    <span className="material-symbols-outlined text-white/10 text-4xl mb-2">person_add</span>
                                                    <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Select {MAX_SQUAD - selectedPlayers.length} more player{MAX_SQUAD - selectedPlayers.length !== 1 ? 's' : ''}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background-dark/90 backdrop-blur-xl border-t border-white/10 px-6 lg:px-20 py-4">
                    <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="hidden md:flex items-center gap-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white/40 uppercase font-black tracking-widest leading-none mb-1">Total Value</span>
                                <span className="text-white font-black italic text-lg leading-none">€ 118,500,000</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white/40 uppercase font-black tracking-widest leading-none mb-1">Squad Type</span>
                                <span className="text-primary font-black italic text-lg leading-none uppercase">Offensive Focus</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button onClick={() => setShowSaveModal(true)} className="flex-1 sm:flex-none border border-white/20 hover:bg-white/5 text-white font-bold px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">save</span>
                                Save Team
                            </button>
                            <button onClick={() => navigate('/formation_settings', { state: { selectedPlayers } })} className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 text-background-dark font-black px-12 py-3 rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(13,242,89,0.3)] italic uppercase tracking-tight">
                                <span className="material-symbols-outlined font-black">grid_view</span>
                                Set Formation
                            </button>
                        </div>
                    </div>
                </footer>
                {showSaveModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if (!saving) { setShowSaveModal(false); setTeamName(''); setSaveError(null); } }}></div>
                        <div className="relative glass-panel w-full max-w-lg mx-4 rounded-xl p-6 z-10">
                            <h3 className="text-white font-black text-xl mb-2">Save Team</h3>
                            <p className="text-white/60 mb-4">Enter a name for your team. This will create a new team and add the selected players.</p>
                            <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team name" className="w-full mb-3 p-3 rounded bg-white/5 border border-white/10 text-white" />
                            {saveError && <div className="text-red-400 text-sm mb-2">{saveError}</div>}
                            <div className="flex items-center justify-end gap-3 mt-4">
                                <button onClick={() => { if (!saving) { setShowSaveModal(false); setTeamName(''); setSaveError(null); } }} className="px-4 py-2 rounded bg-white/5 text-white">Cancel</button>
                                <button onClick={async () => {
                                    if (!teamName || selectedPlayers.length === 0) return setSaveError('Please provide a name and select at least one player');
                                    try {
                                        setSaving(true);
                                        setSaveError(null);
                                        const user = JSON.parse(localStorage.getItem('user') || 'null');
                                        const manager_id = user?.id || parseInt(localStorage.getItem('userId') || '0') || 0;
                                        const payload = {
                                            name: teamName,
                                            manager_id,
                                            players: selectedPlayers.map(p => ({ player_id: p.id, acquired_price: p.value || 0 }))
                                        };
                                        const res = await fetch(`${API_URL}/api/teams`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(payload)
                                        });
                                        const data = await res.json();
                                        if (!res.ok) throw new Error(data.error || 'Failed to save team');
                                        // clear selection and close modal
                                        setSelectedPlayers([]);
                                        localStorage.removeItem('selectedPlayers');
                                        setTeamName('');
                                        setShowSaveModal(false);
                                        // navigate to manage teams to show created team
                                        navigate('/manage_teams');
                                    } catch (err) {
                                        setSaveError(err.message || 'Save failed');
                                    } finally {
                                        setSaving(false);
                                    }
                                }} disabled={saving} className="px-4 py-2 rounded bg-primary text-background-dark font-bold disabled:opacity-50">{saving ? 'Saving...' : 'Save Team'}</button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="h-24"></div>
            </div>
        </>
    );
};

export default Create_team;