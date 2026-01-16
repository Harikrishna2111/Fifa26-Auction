 import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DemoVideo from "../static/Demo_Video.mp4";

const Discover = () => {
  return (
<div class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen stadium-bg">

{/* Top Navigation Bar */}
<Navbar />

{/* MAIN */}
<main className="pt-10 pb-20 px-4 lg:px-20 max-w-[1440px] mx-auto">

  {/* HERO */}
  <section className="text-center mb-16 max-w-4xl mx-auto">
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-8">
      Platform Tour
    </div>

    <h1 className="text-6xl lg:text-8xl font-black mb-6">
      Discover <span className="text-primary">FootyAuction</span>
    </h1>

    <p className="text-slate-400 text-xl max-w-2xl mx-auto">
      The world’s most immersive real-time football auction platform.
    </p>
  </section>

  {/* 🔥 VIDEO SECTION (MOVED TO TOP + BIGGER) */}
  <section className="mb-24">
    <div className="relative group max-w-6xl mx-auto">
      <div className="absolute -inset-1 bg-primary/20 rounded-[2.5rem] blur opacity-30"></div>

      <div className="relative video-container rounded-[2rem] border border-white/10 overflow-hidden">
        <video
          className="w-full h-[70vh] object-cover"
          src={DemoVideo} 
          autoPlay
          loop
          muted
          playsInline
        ></video>

        <div className="absolute bottom-0 left-0 right-0 glass-nav border-t border-white/10 p-6 flex justify-between">
          <div>
            <p className="font-bold">Platform Walkthrough</p>
            <p className="text-xs text-slate-400">Live auction gameplay demo</p>
          </div>
          <span className="px-3 py-1 bg-white/5 rounded text-xs">LOOPING DEMO</span>
        </div>
      </div>
    </div>
  </section>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
<div className="p-6 bg-card-dark/40 rounded-2xl border border-white/5 hover:bg-card-dark/60 transition-colors">
<span className="material-symbols-outlined text-primary mb-4 text-3xl">live_tv</span>
<h4 className="font-bold mb-2">Live Auctions</h4>
<p className="text-sm text-slate-400">Experience the thrill of live bidding with low-latency data streams.</p>
</div>
<div className="p-6 bg-card-dark/40 rounded-2xl border border-white/5 hover:bg-card-dark/60 transition-colors">
<span className="material-symbols-outlined text-primary mb-4 text-3xl">strategy</span>
<h4 className="font-bold mb-2">Squad Building</h4>
<p className="text-sm text-slate-400">Manage positions and budgets to build a balanced, winning squad.</p>
</div>
<div className="p-6 bg-card-dark/40 rounded-2xl border border-white/5 hover:bg-card-dark/60 transition-colors">
<span className="material-symbols-outlined text-primary mb-4 text-3xl">trophy</span>
<h4 className="font-bold mb-2">Real-Time Competition</h4>
<p className="text-sm text-slate-400">Go head-to-head with other managers in instant leaderboard battles.</p>
</div>
<div className="p-6 bg-card-dark/40 rounded-2xl border border-white/5 hover:bg-card-dark/60 transition-colors">
<span className="material-symbols-outlined text-primary mb-4 text-3xl">admin_panel_settings</span>
<h4 className="font-bold mb-2">Admin Lobbies</h4>
<p className="text-sm text-slate-400">Full control over players, timers, and participants for league owners.</p>
</div>
</div>
</main>

<Footer />

</div>
  );
};

export default Discover;