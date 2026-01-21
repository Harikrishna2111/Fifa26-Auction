import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Create_team = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [position, setPosition] = useState("ALL");

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async (opts = {}) => {
        try {
            setLoading(true);
            setError(null);
            const q = new URLSearchParams();
            const s = opts.search !== undefined ? opts.search : search;
            const p = opts.position !== undefined ? opts.position : position;
            if (s) q.set('search', s);
            if (p && p !== 'ALL') q.set('position', p);

            const res = await fetch(`http://localhost:5000/api/players/market?${q.toString()}`);
            if (!res.ok) throw new Error('Failed to load players');
            const data = await res.json();
            setPlayers(data);
        } catch (err) {
            setError(err.message || 'Unknown error');
            setPlayers([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePositionClick = (pos) => {
        setPosition(pos);
        fetchPlayers({ position: pos });
    };

    const handleSearch = () => {
        fetchPlayers({ search });
    };

    return (
        <>
            <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col font-display">
                <Navbar />
                <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 lg:px-20 py-8">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <a className="text-white/40 hover:text-white text-xs font-medium uppercase tracking-widest transition-colors" href="#">Dashboard</a>
                            <span className="material-symbols-outlined text-white/20 text-xs">chevron_right</span>
                            <a className="text-white/40 hover:text-white text-xs font-medium uppercase tracking-widest transition-colors" href="#">Auction</a>
                            <span className="material-symbols-outlined text-white/20 text-xs">chevron_right</span>
                            <span className="text-primary text-xs font-medium uppercase tracking-widest">Build Your Team</span>
                        </div>
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
                                    <input className="w-full bg-white/5 border-white/10 focus:border-primary focus:ring-0 rounded-lg pl-12 text-white placeholder:text-white/30" placeholder="Search players by name, club, or nationality..." type="text"/>
                                </div>
                                <div className="flex gap-2">
                                    <button className="bg-primary text-background-dark font-bold px-4 py-2 rounded-lg text-sm transition-transform active:scale-95">ALL</button>
                                    <button className="bg-white/5 hover:bg-white/10 text-white font-semibold px-4 py-2 rounded-lg text-sm border border-white/10 transition-colors">FWD</button>
                                    <button className="bg-white/5 hover:bg-white/10 text-white font-semibold px-4 py-2 rounded-lg text-sm border border-white/10 transition-colors">MID</button>
                                    <button className="bg-white/5 hover:bg-white/10 text-white font-semibold px-4 py-2 rounded-lg text-sm border border-white/10 transition-colors">DEF</button>
                                    <button className="bg-white/5 hover:bg-white/10 text-white font-semibold px-4 py-2 rounded-lg text-sm border border-white/10 transition-colors">GK</button>
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
                                                    <div className="text-sm font-bold text-white">{p.pace ?? '-'}</div>
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
                                            <button className="w-full bg-primary/10 group-hover:bg-primary border border-primary/30 text-primary group-hover:text-background-dark font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-sm">add_circle</span>
                                                Add to Team
                                            </button>
                                        </div>
                                    ))
                                )}
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
<div className="text-4xl font-black italic">86</div>
<div className="text-[10px] font-bold uppercase tracking-widest leading-none">Avg OVR</div>
</div>
</div>
<div className="space-y-2 mb-4">
<div className="flex justify-between items-end">
<span className="font-bold text-sm uppercase">Squad Depth</span>
<span className="font-black text-lg italic leading-none">8/11</span>
</div>
<div className="w-full h-3 bg-background-dark/20 rounded-full overflow-hidden">
<div className="h-full bg-background-dark rounded-full w-[72%]"></div>
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
<span className="text-white/40 text-[10px] font-bold uppercase">Selection 1 of 1</span>
</div>
<div className="max-h-[460px] overflow-y-auto custom-scrollbar">
{/* Selected Player Row 1 */}
<div className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
<div className="size-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
<img alt="Player" className="w-full h-full object-cover" data-alt="Close up of football player" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6_PEPrD-xmySyHc_k9W77CdkEoUk5nwnWuDK3MUkdb8kYpkO_3tj6fhQLGmycR7QC3kVuH62QarI-WIhMHZe2ZDABSOfc_x4N9r92f8p3mMdnBum2gFXdCQLb8IGPUETr8dr4nW993Y5lJ8PkvG1ZsWcbyqYhERdkhnGyCZy5d2FpbZGKhL43DWFB74bTFEcebx39oZx9TdS0-ygBJOUK0m48MFZ_F3ZkyAnYjQlePYFFt2Uij51stIWW6shNrAkR77YflbpUx8Q"/>
</div>
<div className="flex-1">
<h5 className="text-white font-bold text-sm uppercase tracking-tight">Kylian Mbappé</h5>
<div className="flex items-center gap-2">
<span className="text-primary text-[10px] font-black italic">91 OVR</span>
<span className="text-white/40 text-[10px] uppercase font-bold">FWD</span>
</div>
</div>
<button className="text-white/20 hover:text-red-500 transition-colors">
<span className="material-symbols-outlined text-lg">cancel</span>
</button>
</div>
{/* Selected Player Row 2 */}
<div className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
<div className="size-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
<img alt="Player" className="w-full h-full object-cover" data-alt="Headshot of a soccer player" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBV-XmL-mmjpfAVvuOg93WsT9EqA2XXb0aoKrG7ONb68A5JFtzGjY4M51ZG6OlnF8g0yxvQ1Bq9tcpoXictdrZb26LdGtJXMeMo_7mw1_Mep2F2rcr-qe6Pc0sux-Ym7E6Gmiv9dFrT73kXpZDlrGUQBGrHicQHYV02DN4ocbP_j_k3uvps0ny7t7GM_UgU3p3cQuyF5C-OyG-0HvIyrHYQCkAMcqQcMqxiaB6FFRsAnaEFX6_9UmdhYbfelqz3SS8YRBGyYmsD790"/>
</div>
<div className="flex-1">
<h5 className="text-white font-bold text-sm uppercase tracking-tight">Jude Bellingham</h5>
<div className="flex items-center gap-2">
<span className="text-primary text-[10px] font-black italic">88 OVR</span>
<span className="text-white/40 text-[10px] uppercase font-bold">MID</span>
</div>
</div>
<button className="text-white/20 hover:text-red-500 transition-colors">
<span className="material-symbols-outlined text-lg">cancel</span>
</button>
</div>
{/* Selected Player Row 3 */}
<div className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
<div className="size-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
<img alt="Player" className="w-full h-full object-cover" data-alt="Sports athlete portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3jtBLEeCyKKnOkUgeuZPAVqZs-Gqy855LDpQB1YMq9MkULyWkZ9dmgYtfxZRDVk0aDt0rbvDblvQn9VlfcVf-YkE8ISjvwv6IeBjwNCSdxf0SbTbNyoUyX8Ig5qSU8eKZZqYQ5YGV_IIZJ3do0W0iih7ADT6Oi5ZLUjTAppLH08MWMDdUhTgjaKuO1LQv59TxZf3M22ZxH6cD2E4atRo-Mo8ZNfBiCKAghmM1WB9KWrTXo02ZUw12bdQS87-WchX1jybmHjKGi2Q"/>
</div>
<div className="flex-1">
<h5 className="text-white font-bold text-sm uppercase tracking-tight">Virgil van Dijk</h5>
<div className="flex items-center gap-2">
<span className="text-primary text-[10px] font-black italic">89 OVR</span>
<span className="text-white/40 text-[10px] uppercase font-bold">DEF</span>
</div>
</div>
<button className="text-white/20 hover:text-red-500 transition-colors">
<span className="material-symbols-outlined text-lg">cancel</span>
</button>
</div>
{/* Empty Slot Suggestion */}
<div className="p-4 bg-white/2 border border-dashed border-white/10 m-3 rounded-lg flex flex-col items-center justify-center py-8 text-center">
<span className="material-symbols-outlined text-white/10 text-4xl mb-2">person_add</span>
<p className="text-white/30 text-xs font-bold uppercase tracking-widest">Select 3 more players</p>
</div>
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
                            <Link to="/manage_teams">
                                <button className="flex-1 sm:flex-none border border-white/20 hover:bg-white/5 text-white font-bold px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">save</span>
                                    Save Team
                                </button>
                            </Link>
                            <Link to="/formation_settings">
                                <button className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 text-background-dark font-black px-12 py-3 rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(13,242,89,0.3)] italic uppercase tracking-tight">
                                    <span className="material-symbols-outlined font-black">grid_view</span>
                                    Set Formation
                                </button>
                            </Link>
                        </div>
                    </div>
                </footer>
                <div className="h-24"></div>
            </div>
        </>
  );
};

export default Create_team;