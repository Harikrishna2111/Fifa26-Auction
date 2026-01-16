 import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Auction_rules = () => {
  const [activeSection, setActiveSection] = useState('lobby');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['lobby', 'bidding', 'allocation', 'control', 'visibility'];
      const scrollPosition = window.scrollY + 300;

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element) {
          const { offsetTop } = element;
          if (scrollPosition >= offsetTop) {
            setActiveSection(sections[i]);
            return;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
<div class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen stadium-bg">
<Navbar />
<div className="pt-24 pb-20 px-4 lg:px-20 max-w-[1440px] mx-auto">
{/* Hero Section */}
<section className="relative rounded-3xl overflow-hidden mb-12">
<div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/80 to-transparent z-10"></div>

<div className="relative h-[400px] flex flex-col justify-center px-8 lg:px-16 z-20" data-alt="Dark football stadium atmospheric background" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCRV5sXcjjTqmLaaGe9utlAnl5lovRfEJoSPUXZ4lO9Hjsb-pQay7jnfnkzEFFPOx4fEDQGbSyA4vGJ_fajCpCJnhpbOHFxG_vQg65wTEKX7iXDeyECDwil_ffys8dTGbsJPUW05hEqDyz1FmkC7cxCQncw5tIjbc1ZofhSiRXr-W3l8bMale3HCjn7ktjupl3kxwbbx1VsNyhhb8Bsi1TFVt_ncY1uobQsWUkmSudaDzlo2itg85sVdSanEQe7raN13LcIdgaFYm4')", backgroundSize: 'cover' }}>


<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider mb-6 w-fit">
<span className="material-symbols-outlined text-sm">verified</span> Fair Play Guaranteed
                </div>
<h1 className="text-5xl lg:text-7xl font-black mb-4">Auction <span className="text-primary">Rules</span></h1>
<p className="text-slate-400 max-w-xl text-lg mb-8">
                    Professional bidding environment designed for competitive league drafts. Review these guidelines to ensure a smooth auction process.
                </p>
<div className="flex gap-4">
<Link to="/login"><button className="bg-primary text-background-dark px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
                        Join Live Lobby
                    </button></Link>
<button className="bg-white/10 text-white border border-white/10 px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-all">
                        Download PDF
                    </button>
</div></div>
</section>
<div className="flex flex-col lg:flex-row gap-12 items-start">
{/* Sticky Side Navigation */}
<aside className="w-full lg:w-64 sticky top-28 hidden lg:block">
<div className="flex flex-col gap-1 p-4 bg-white/5 rounded-2xl border border-white/10">
<p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Navigation</p>
<a className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeSection === 'lobby' ? 'bg-primary/10 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} href="#lobby">
<span className="material-symbols-outlined text-[20px]">meeting_room</span> Lobby Rules
                    </a>
<a className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeSection === 'bidding' ? 'bg-primary/10 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} href="#bidding">
<span className="material-symbols-outlined text-[20px]">gavel</span> Bidding Rules
                    </a>
<a className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeSection === 'allocation' ? 'bg-primary/10 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} href="#allocation">
<span className="material-symbols-outlined text-[20px]">group_add</span> Player Allocation
                    </a>
<a className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeSection === 'control' ? 'bg-primary/10 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} href="#control">
<span className="material-symbols-outlined text-[20px]">settings_suggest</span> Auction Control
                    </a>
<a className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeSection === 'visibility' ? 'bg-primary/10 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} href="#visibility">
<span className="material-symbols-outlined text-[20px]">visibility</span> Team Visibility
                    </a>
</div>
</aside>
{/* Rules Content */}
<div className="flex-1 space-y-8">
{/* Lobby Rules */}
<section className="rule-card-border bg-white/5 rounded-xl border border-white/5 p-6 lg:p-8 hover:bg-white/[0.07] transition-colors scroll-mt-24" id="lobby">
<div className="flex items-center gap-4 mb-6">
<div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
<span className="material-symbols-outlined">key</span>
</div>
<div>
<h2 className="text-2xl font-bold">Auction Lobby Rules</h2>
<p className="text-slate-400 text-sm">Setting up and entering your draft room</p>
</div>
</div>
<div className="grid md:grid-cols-2 gap-6 text-slate-300">
<div className="space-y-4">
<div className="flex gap-3">
<span className="text-primary font-bold">01.</span>
<p>Lobbies are created by the League Commissioner. A unique 6-digit access code is required for all participants.</p>
</div>
<div className="flex gap-3">
<span className="text-primary font-bold">02.</span>
<p>Minimum of 4 participants are required to initialize the auction countdown.</p>
</div>
</div>
<div className="space-y-4">
<div className="flex gap-3">
<span className="text-primary font-bold">03.</span>
<p>Lobby access closes once the first player is put under the hammer to prevent interruptions.</p>
</div>
<div className="flex gap-3">
<span className="text-primary font-bold">04.</span>
<p>Participants must maintain a stable connection; re-entry is allowed only if the auction is paused.</p>
</div>
</div>
</div>
</section>
{/* Bidding Rules */}
<section className="rule-card-border bg-white/5 rounded-xl border border-white/5 p-6 lg:p-8 hover:bg-white/[0.07] transition-colors scroll-mt-24" id="bidding">
<div className="flex items-center gap-4 mb-6">
<div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
<span className="material-symbols-outlined">timer</span>
</div>
<div>
<h2 className="text-2xl font-bold">Bidding Mechanics</h2>
<p className="text-slate-400 text-sm">Increments, timers, and custom offers</p>
</div>
</div>
<div className="space-y-6">
<p className="text-slate-300">The auction uses a fast-paced dynamic bidding system. Familiarize yourself with these controls:</p>
<div className="flex flex-wrap gap-4">
<div className="bg-background-dark/50 border border-white/10 p-4 rounded-2xl flex-1 min-w-[200px]">
<p className="text-xs font-bold text-slate-500 uppercase mb-3">Bid Increments</p>
<div className="flex gap-2">
<span className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm font-bold border border-primary/30">+5M</span>
<span className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm font-bold border border-primary/30">+10M</span>
<span className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm font-bold border border-primary/30">+25M</span>
</div>
</div>
<div className="bg-background-dark/50 border border-white/10 p-4 rounded-2xl flex-1 min-w-[200px]">
<p className="text-xs font-bold text-slate-500 uppercase mb-3">Timer Logic</p>
<p className="text-sm text-slate-300">Countdown starts at <span className="text-primary font-bold">15s</span>. Any bid placed within the last 5s resets the clock to 5s.</p>
</div>
</div>
<div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
<h4 className="text-primary font-bold flex items-center gap-2 mb-2">
<span className="material-symbols-outlined text-sm">info</span> Custom Bidding
                            </h4>
<p className="text-sm text-slate-300">Users can type custom values. However, custom bids must be at least 1M higher than the current highest bid.</p>
</div>
</div>
</section>
{/* Player Allocation */}
<section className="rule-card-border bg-white/5 rounded-xl border border-white/5 p-6 lg:p-8 hover:bg-white/[0.07] transition-colors scroll-mt-24" id="allocation">
<div className="flex items-center gap-4 mb-6">
<div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
<span className="material-symbols-outlined">person_add</span>
</div>
<div>
<h2 className="text-2xl font-bold">Player Allocation</h2>
<p className="text-slate-400 text-sm">Winning bids and sequential order</p>
</div>
</div>
<div className="space-y-4 text-slate-300">
<div className="flex items-start gap-4">
<div className="size-8 rounded-lg bg-white/10 flex-shrink-0 flex items-center justify-center text-xs font-bold">1</div>
<p>Players are presented in a pre-determined sequential order based on position (GK → DEF → MID → FWD) unless "Randomized Order" is enabled by the admin.</p>
</div>
<div className="flex items-start gap-4">
<div className="size-8 rounded-lg bg-white/10 flex-shrink-0 flex items-center justify-center text-xs font-bold">2</div>
<p>Once the timer hits zero, the player is instantly allocated to the highest bidder's roster. Funds are deducted automatically from the remaining budget.</p>
</div>
<div className="flex items-start gap-4">
<div className="size-8 rounded-lg bg-white/10 flex-shrink-0 flex items-center justify-center text-xs font-bold">3</div>
<p>If no bids are placed, the player is moved to the "Unsold" pool and may be re-auctioned at the end of the session.</p>
</div>
</div>
</section>
{/* Auction Control */}
<section className="rule-card-border bg-white/5 rounded-xl border border-white/5 p-6 lg:p-8 hover:bg-white/[0.07] transition-colors scroll-mt-24" id="control">
<div className="flex items-center gap-4 mb-6">
<div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
<span className="material-symbols-outlined">shield_person</span>
</div>
<div>
<h2 className="text-2xl font-bold">Auction Control</h2>
<p className="text-slate-400 text-sm">Administrative powers and pausing</p>
</div>
</div>
<div className="grid md:grid-cols-2 gap-4">
<div className="p-5 bg-background-dark/40 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group">
<div className="flex items-center justify-between mb-3">
<span className="font-bold text-white">Pause Function</span>
<span className="material-symbols-outlined text-primary">pause_circle</span>
</div>
<p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Admin can pause at any time for breaks or technical disputes. Bidding is disabled while paused.</p>
</div>
<div className="p-5 bg-background-dark/40 rounded-2xl border border-white/5 hover:border-red-500/20 transition-all group">
<div className="flex items-center justify-between mb-3">
<span className="font-bold text-white">Emergency Stop</span>
<span className="material-symbols-outlined text-red-500">stop_circle</span>
</div>
<p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Force ends the current player auction. Bids are voided and the player is returned to the pool.</p>
</div>
</div>
</section>
{/* Team Visibility */}
<section className="rule-card-border bg-white/5 rounded-xl border border-white/5 p-6 lg:p-8 hover:bg-white/[0.07] transition-colors scroll-mt-24" id="visibility">
<div className="flex flex-col md:flex-row gap-8 items-center">
<div className="flex-1">
<div className="flex items-center gap-4 mb-4">
<div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
<span className="material-symbols-outlined">bar_chart</span>
</div>
<h2 className="text-2xl font-bold">Team Visibility</h2>
</div>
<p className="text-slate-300 mb-6 leading-relaxed">
                                Strategy is key. You can monitor competitors in real-time. The "Squad Preview" pane shows their current roster, remaining budget, and most expensive purchase.
                            </p>
<div className="flex items-center gap-6">
<div className="text-center">
<p className="text-2xl font-black text-primary">Real-time</p>
<p className="text-[10px] text-slate-500 uppercase tracking-widest">Budget Updates</p>
</div>
<div className="w-px h-10 bg-white/10"></div>
<div className="text-center">
<p className="text-2xl font-black text-white">100%</p>
<p className="text-[10px] text-slate-500 uppercase tracking-widest">Transparency</p>
</div>
</div>
</div>
<div className="w-full md:w-64 h-48 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center" data-alt="Abstract data visualization pattern">
<div className="relative w-32 h-32">
<div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
<div className="absolute inset-0 rounded-full border-t-4 border-primary shadow-[0_0_15px_rgba(13,242,89,0.5)]"></div>
<div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-primary">ANALYTICS</div>
</div>
</div>
</div>
</section>
</div>
</div>

</div>
<Footer />

</div>
  );
};

export default Auction_rules;