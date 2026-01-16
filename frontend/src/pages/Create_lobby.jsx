import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Create_lobby = () => {
  return (

<div className="bg-background-dark font-display text-white min-h-screen">

{/* HEADER */}
<header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur border-b border-white/10">
  <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary text-background-dark rounded-lg flex items-center justify-center">
        <span className="material-symbols-outlined">sports_soccer</span>
      </div>
      <h2 className="text-xl font-black uppercase italic">
        Footy<span className="text-primary">Auction</span>
      </h2>
    </div>

    <div className="flex items-center gap-4">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold">Alex Smith</p>
        <p className="text-[10px] text-primary uppercase font-black">Pro Manager</p>
      </div>
      <button className="flex items-center gap-1 text-slate-400 hover:text-white text-sm">
        <span className="material-symbols-outlined text-lg">logout</span> Logout
      </button>
    </div>
  </div>
</header>

{/* MAIN */}
<main className="max-w-7xl mx-auto px-6 py-14">

  <h1 className="text-2xl font-black uppercase italic flex items-center gap-2 mb-8">
    <span className="material-symbols-outlined text-primary">add_circle</span>
    Create New Lobby
  </h1>

  {/* UNIFIED PANEL */}
  <div className="rounded-3xl p-10 shadow-2xl" style={{background: 'rgba(22,27,24,0.85)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.05)'}}>

    <form className="grid grid-cols-1 lg:grid-cols-2 gap-10">

      {/* LEFT COLUMN */}
      <div className="space-y-6">

        <div>
          <label className="text-xs uppercase font-bold text-slate-400">Auction Name</label>
          <input className="w-full mt-2 bg-slate-800 border border-white/10 rounded-xl py-4 px-4 text-white placeholder:text-slate-400 focus:border-[#0df259] focus:shadow-[0_0_0_2px_rgba(13,242,89,0.25)] focus:outline-none"
                 placeholder="Champions League Draft 2024"/>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs uppercase font-bold text-slate-400">Bidding Time (sec)</label>
            <input type="number" className="w-full mt-2 bg-slate-800 border border-white/10 rounded-xl py-4 px-4 text-white placeholder:text-slate-400 focus:border-[#0df259] focus:shadow-[0_0_0_2px_rgba(13,242,89,0.25)] focus:outline-none"
                   placeholder="30"/>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-slate-400">Starting Price</label>
            <input className="w-full mt-2 bg-slate-800 border border-white/10 rounded-xl py-4 px-4 text-white placeholder:text-slate-400 focus:border-[#0df259] focus:shadow-[0_0_0_2px_rgba(13,242,89,0.25)] focus:outline-none"
                   placeholder="10,000"/>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase font-bold text-slate-400">Max Managers</label>
          <div className="flex items-center gap-4 mt-2">
            <input type="range" min="2" max="20" defaultValue="12" className="flex-1 accent-primary"/>
            <span className="text-primary font-bold">12</span>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase font-bold text-slate-400">Max Squad Size</label>
          <div className="flex items-center gap-4 mt-2">
            <input type="range" min="2" max="20" defaultValue="12" className="flex-1 accent-primary"/>
            <span className="text-primary font-bold">12</span>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-6">

        <h3 className="text-lg font-black uppercase tracking-wide flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">settings</span>
          Advanced Host Controls
        </h3>

        <div className="rounded-xl p-5 space-y-4" style={{background: 'rgba(22,27,24,0.85)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.05)'}}>
          <p className="font-bold">Bid Increments</p>
          <div className="flex gap-3">
            <label className="cursor-pointer">
              <input type="checkbox" defaultChecked className="hidden peer"/>
              <span className="px-4 py-1 rounded-full bg-primary/20 text-primary peer-checked:bg-primary peer-checked:text-background-dark text-sm font-bold">+5</span>
            </label>
            <label className="cursor-pointer">
              <input type="checkbox" defaultChecked className="hidden peer"/>
              <span className="px-4 py-1 rounded-full bg-primary/20 text-primary peer-checked:bg-primary peer-checked:text-background-dark text-sm font-bold">+10</span>
            </label>
            <label className="cursor-pointer">
              <input type="checkbox" defaultChecked className="hidden peer"/>
              <span className="px-4 py-1 rounded-full bg-primary/20 text-primary peer-checked:bg-primary peer-checked:text-background-dark text-sm font-bold">+15</span>
            </label>
          </div>
        </div>

        <div className="rounded-xl p-5 flex justify-between items-center" style={{background: 'rgba(22,27,24,0.85)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.05)'}}>
          <div>
            <p className="font-bold">Enable Custom Bids</p>
            <p className="text-xs text-slate-400">Allow manual bid input</p>
          </div>
          <input type="checkbox" defaultChecked className="accent-primary scale-125"/>
        </div>

        <div className="rounded-xl p-5 flex justify-between items-center" style={{background: 'rgba(22,27,24,0.85)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.05)'}}>
          <div>
            <p className="font-bold">Auto Skip Player</p>
            <p className="text-xs text-slate-400">Skip if no bids placed</p>
          </div>
          <input type="checkbox" defaultChecked className="accent-primary scale-125"/>
        </div>

      </div>

      {/* SUBMIT */} 
      <div className="lg:col-span-2 pt-6">
        <a href="lobby.html">        
          <button className="w-full bg-primary text-background-dark py-6 rounded-xl font-black uppercase tracking-widest
                       hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(13,242,89,0.4)]" type="button">
            Create Lobby
          </button>
        </a>
        <p className="text-xs text-slate-500 italic mt-3 text-center">
          All settings are locked once the lobby is created.
        </p>
      </div>

    </form>
  </div>

</main>

{/* FOOTER */}
<footer className="border-t border-white/5 py-10 text-center">
  <p className="text-xs text-slate-500">© 2026 Football Auction Engine. All rights reserved.</p>
</footer>

</div>

  );
};

export default Create_lobby;