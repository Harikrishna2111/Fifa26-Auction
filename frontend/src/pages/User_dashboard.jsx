import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const User_dashboard = () => {
  return (
    <div className="bg-background-dark font-display text-white min-h-screen">
      <Navbar isLoggedIn={true} userName="Alex Smith" userRole="Pro Manager" />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-12">
          <h1 className="text-3xl font-black mb-2">Manager <span className="text-primary italic">Dashboard</span></h1>
          <p className="text-slate-400">Welcome back, Alex</p>
        </div>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              Past Auctions
            </h2>
            <Link to="/view_all_auctions"><button className="text-sm font-bold text-primary hover:underline">View History</button></Link>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x">
            <div className="min-w-[300px] bg-card-dark border border-white/5 rounded-2xl p-6 snap-start card-hover transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold bg-white/10 text-slate-300 px-2 py-1 rounded uppercase tracking-widest">Completed</span>
                <span className="text-xs text-slate-500 font-medium">May 12, 2024</span>
              </div>
              <h3 className="text-lg font-bold mb-1">Champions Elite League</h3>
              <p className="text-sm text-slate-400 mb-4">Draft Session #42</p>
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">Acquired Team</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-accent-gold text-sm">shield</span>
                  </div>
                  <span className="font-bold">London Lions</span>
                </div>
              </div>
            </div>
            <div className="min-w-[300px] bg-card-dark border border-white/5 rounded-2xl p-6 snap-start card-hover transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold bg-white/10 text-slate-300 px-2 py-1 rounded uppercase tracking-widest">Completed</span>
                <span className="text-xs text-slate-500 font-medium">May 08, 2024</span>
              </div>
              <h3 className="text-lg font-bold mb-1">Global Pro Series</h3>
              <p className="text-sm text-slate-400 mb-4">Summer Draft</p>
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">Acquired Team</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-400 text-sm">shield</span>
                  </div>
                  <span className="font-bold">Oceanic FC</span>
                </div>
              </div>
            </div>
            <div className="min-w-[300px] bg-card-dark border border-white/5 rounded-2xl p-6 snap-start card-hover transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold bg-white/10 text-slate-300 px-2 py-1 rounded uppercase tracking-widest">Completed</span>
                <span className="text-xs text-slate-500 font-medium">May 01, 2024</span>
              </div>
              <h3 className="text-lg font-bold mb-1">Masters Invitational</h3>
              <p className="text-sm text-slate-400 mb-4">Legends Session</p>
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">Acquired Team</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-400 text-sm">shield</span>
                  </div>
                  <span className="font-bold">Dynasty Stars</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">groups</span>
              My Teams
            </h2>
            <Link to="/manage_teams"><button className="text-sm font-bold text-primary hover:underline">Manage All</button></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card-dark border border-white/10 rounded-2xl overflow-hidden group hover:border-primary/30 transition-all">
              <div className="h-2 bg-primary"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black uppercase italic">London Lions</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-bold">ACTIVE</span>
                </div>
                <div className="flex -space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-full border-2 border-card-dark bg-slate-800 overflow-hidden">
                    <img alt="Player" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaI-OdEcAegheBHPIWZugUKMGn-59W4GY3JEa3Qd1hJuwCyB10R-5fppWeGiktjA52i02UvsX-McchLeRgdmYtFgQrReBbJukThxbRI7vhWfqX_1Kwr3jJGr44mzeeKB3Mgb6p1gref6oV76h3UztsMS1CJB1JHXrTvLx_7oGpe3rrc58CPjxLsTQCZ4dR_x4vLUOS5iIUVLVNx8YzvPnZUblNAonIlaVw0J4EF_4wCcVhw8cfjc9-yHfb8r1TgvRIyIBD25n1Myc"/>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-card-dark bg-slate-800 overflow-hidden">
                    <img alt="Player" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUps7q3cIJGDkxrGYbzTNFxTAD6rS2oOVGJ0gEwz_mih68sB9sZJIpc0uqNMft4uxW6LqltFDs2Ob2xahbBDg2lzCcU0E7Cek4kLS3cxwZbgeBWjL4ikwb4PSg6DduV5lx3ftjF-sqMUKSefeszU9_TMgmdaUSm7zrRnrt3PSPEjWxJM7Zv_x-Y1ZWqVOF8UT9GKjkxCNd6gE5JtnoTSk5jfYinBCWMvQ_zxvRr9PGtxA2ItX1PdEXlZoEoHXhFYMy_XnbGdkiZH0"/>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-card-dark bg-slate-800 overflow-hidden">
                    <img alt="Player" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArnXW0-OMeKKqF9N2NfSbva7wr4fyuVVjW0n1frJ0nwiWp_uT2i7lTYHkwIdGk1vld4sip4aXrwlLA8-NJpADRscpMhLUO3GOqHysjuLHqNRvFNcUdAUGZiX-Gy5gzZ5bme3CkPokGDvT0Qdr7tjQ283WrXEQ-__R2OgEr2K6xppnvvaGb7MQZGHS7f1j86uRpWxu3lnM72MOKWNptxG2rv0tNTamFaKEjBrdMU181OsHlf0uSfT5QzSMY8gVVvKFRBzAU6_AstMw"/>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-card-dark bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                    +8
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-black">Rating</p>
                    <p className="text-lg font-black text-accent-gold">88 OVR</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-black">Value</p>
                    <p className="text-lg font-black">$420M</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card-dark border border-white/10 rounded-2xl overflow-hidden group hover:border-primary/30 transition-all">
              <div className="h-2 bg-blue-500"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black uppercase italic">Oceanic FC</h3>
                  <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-bold">IDLE</span>
                </div>
                <div className="flex -space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-full border-2 border-card-dark bg-slate-800 overflow-hidden">
                    <img alt="Player" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtoqHScF58_zyr4h_ZxNLaPJ95LKIftkwmd9wgPGcdz4h-Ez25dhMogKjMoO05IZ6U-HaJevQ2Diagko8w4jP-z0AkXNzefjHN_WPBXJ2Y-Y9LXXLYj9kQO7BshE96XkaHCpvg_aCAw4QyZdfIvSjPFCVWdWZ3XGPiA8RC8ijihTgO8TPfgJzjBKFVWdy1fZr1XsG59dHa5L-8EK3kGSG0BhdtSyCG_vgDS5PozJW7uvoNHdO6vF3ym3PyS53sUtRSBWqAl9Zx46I"/>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-card-dark bg-slate-800 overflow-hidden">
                    <img alt="Player" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaI-OdEcAegheBHPIWZugUKMGn-59W4GY3JEa3Qd1hJuwCyB10R-5fppWeGiktjA52i02UvsX-McchLeRgdmYtFgQrReBbJukThxbRI7vhWfqX_1Kwr3jJGr44mzeeKB3Mgb6p1gref6oV76h3UztsMS1CJB1JHXrTvLx_7oGpe3rrc58CPjxLsTQCZ4dR_x4vLUOS5iIUVLVNx8YzvPnZUblNAonIlaVw0J4EF_4wCcVhw8cfjc9-yHfb8r1TgvRIyIBD25n1Myc"/>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-card-dark bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                    +11
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-black">Rating</p>
                    <p className="text-lg font-black text-accent-gold">84 OVR</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-black">Value</p>
                    <p className="text-lg font-black">$315M</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative group cursor-pointer overflow-hidden rounded-3xl bg-primary p-10 flex flex-col justify-between min-h-[300px] transition-transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <span className="material-symbols-outlined text-[120px]">add_circle</span>
            </div>
            <div className="relative z-10">
              <h2 className="text-background-dark text-3xl font-black uppercase italic leading-tight mb-4">Create Your<br/>Auction Lobby</h2>
              <p className="text-background-dark/70 font-medium max-w-xs">Host your own custom draft. Invite friends and set your own league rules.</p>
            </div>
            <Link to="/create_lobby"><button className="relative z-10 w-fit bg-background-dark text-primary px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:shadow-xl transition-shadow">
              Start New Lobby
            </button></Link>
          </div>
          <div className="relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-white/10 bg-transparent p-10 flex flex-col justify-between min-h-[300px] transition-all hover:bg-white/5 hover:border-primary/50">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <span className="material-symbols-outlined text-[120px]">login</span>
            </div>
            <div className="relative z-10">
              <h2 className="text-white text-3xl font-black uppercase italic leading-tight mb-4">Join Active<br/>Auction Rooms</h2>
              <p className="text-slate-400 font-medium max-w-xs">Enter public or private rooms and start bidding on world-class talent now.</p>
            </div>
            <Link to="/join_lobby"><button className="relative z-10 w-fit bg-white text-background-dark px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-primary transition-colors">
              Browse Lobbies
            </button></Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default User_dashboard;
