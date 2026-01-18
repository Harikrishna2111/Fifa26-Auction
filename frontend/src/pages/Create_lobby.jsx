import React from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const Create_lobby = () => {
  return (
    <div className="bg-background-dark font-display text-white min-h-screen">
      {/* HEADER */}
      <Navbar />

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-6 py-14">
        <h1 className="text-3xl font-black uppercase italic flex items-center gap-3 mb-10 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          <span className="material-symbols-outlined text-primary text-4xl">
            add_circle
          </span>
          Setup Auction Lobby
        </h1>

        {/* UNIFIED PANEL */}
        <div
          className="rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
          style={{
            background: "rgba(18, 24, 22, 0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Subtle Background Texture */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <form className="space-y-12 relative z-10">
            {/* SECTION 1: GENERAL INFO */}
            <div>
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  wysiwyg
                </span>
                General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Auction Name */}
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-400">
                    Auction Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder="e.g. Premier League 2026"
                  />
                </div>

                {/* Team Name */}
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-400">
                    Your Team Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder="e.g. The Invincibles"
                  />
                </div>

                {/* Seasonal Toggle */}
                <div className="md:col-span-2 bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <span className="material-symbols-outlined">
                        calendar_month
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">Seasonal Auction</p>
                      <p className="text-xs text-slate-400">
                        Enable multi-round drafts and carry-over logic
                      </p>
                    </div>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      name="seasonal"
                      id="seasonal"
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-primary"
                    />
                    <label
                      htmlFor="seasonal"
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-700 cursor-pointer"
                    ></label>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-white/5" />

            {/* SECTION 2: FINANCIAL CONFIG */}
            <div>
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  attach_money
                </span>
                Financial Configuration
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Team Purse */}
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-400">
                    Team Purse ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-primary font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-8 pr-4 text-white font-mono focus:border-primary focus:outline-none transition-all"
                      placeholder="100000000"
                    />
                  </div>
                </div>

                {/* Enable Custom Bids */}
                <div className="space-y-2 flex flex-col justify-end">
                  <div className="h-[50px] bg-white/5 border border-white/5 rounded-lg px-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-300">
                      Enable Custom Bid Input
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-white/20 bg-black/40 text-primary focus:ring-0 focus:ring-offset-0"
                    />
                  </div>
                </div>

                {/* Bid Increments (Group of 3) */}
                <div className="lg:col-span-2 space-y-3">
                  <label className="text-xs uppercase font-bold text-slate-400 flex items-center gap-2">
                    Bid Increments <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">Min / Mid / Max</span>
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="relative group">
                      <span className="absolute -top-2 left-3 text-[9px] bg-background-dark px-1 text-slate-500 group-focus-within:text-primary">
                        MIN
                      </span>
                      <input
                        type="number"
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-center font-mono text-sm focus:border-primary focus:outline-none"
                        placeholder="1"
                      />
                    </div>
                    <div className="relative group">
                      <span className="absolute -top-2 left-3 text-[9px] bg-background-dark px-1 text-slate-500 group-focus-within:text-primary">
                        MID
                      </span>
                      <input
                        type="number"
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-center font-mono text-sm focus:border-primary focus:outline-none"
                        placeholder="5"
                      />
                    </div>
                    <div className="relative group">
                      <span className="absolute -top-2 left-3 text-[9px] bg-background-dark px-1 text-slate-500 group-focus-within:text-primary">
                        MAX
                      </span>
                      <input
                        type="number"
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-center font-mono text-sm focus:border-primary focus:outline-none"
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-white/5" />

            {/* SECTION 3: RULES & MECHANICS */}
            <div>
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">gavel</span>
                Auction Rules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Bidding Time */}
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-400">
                    Bidding Time
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-primary focus:outline-none transition-all"
                      placeholder="30"
                    />
                    <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-500">
                      SEC
                    </span>
                  </div>
                </div>

                {/* Min Players (> symbol) */}
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-400">
                    Min Players
                  </label>
                  <div className="flex items-center w-full bg-black/40 border border-white/10 rounded-lg focus-within:border-primary transition-all overflow-hidden">
                    <div className="bg-white/5 px-4 py-3 border-r border-white/10">
                      <span className="font-black text-primary text-sm">
                        &gt;
                      </span>
                    </div>
                    <input
                      type="number"
                      className="w-full bg-transparent border-none py-3 px-4 text-white placeholder:text-slate-600 focus:ring-0"
                      placeholder="11"
                    />
                  </div>
                </div>

                {/* Retention Strength */}
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-400 flex justify-between">
                    Retention Strength
                    <span className="text-[10px] text-slate-600 normal-case">
                      (0-100)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-primary focus:outline-none transition-all"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="pt-8">
              <Link to="/lobby">
                <button
                  className="w-full group relative bg-primary text-background-dark py-5 rounded-xl font-black uppercase tracking-[0.2em] overflow-hidden transition-all hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(13,242,89,0.3)]"
                  type="button"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine"></div>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Initialize Lobby <span className="material-symbols-outlined">rocket_launch</span>
                  </span>
                </button>
              </Link>
              <p className="text-xs text-slate-500 text-center mt-4 font-mono">
                * Managers will receive join codes after initialization.
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 text-center">
        <p className="text-xs text-slate-500">
          © 2026 Football Auction Engine.
        </p>
      </footer>

      {/* Custom Styles for Toggle Switch */}
      <style>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #0df259;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #0df259;
        }
        .animate-shine {
            animation: shine 1s;
        }
        @keyframes shine {
            100% {
                transform: translateX(100%);
            }
        }
      `}</style>
    </div>
  );
};

export default Create_lobby;