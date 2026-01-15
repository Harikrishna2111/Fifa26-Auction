 import React from "react";
import { Link } from "react-router-dom";

const Landing_page = () => {
  return (<div className="dark">

    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-300">
{/* Top Navigation Bar*/}
<nav className="sticky top-0 z-50 glass-nav border-b border-white/10">
<div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-background-dark font-bold">sports_soccer</span>
</div>
<h1 className="text-xl font-black tracking-tight uppercase italic">Footy<span className="text-primary">Auction</span></h1>
</div>
<div className="hidden md:flex items-center gap-10">
<Link className="text-sm font-medium text-primary border-b-2 border-primary pb-1" to="/landing_page.html">Home</Link>
<Link className="text-sm font-medium hover:text-primary transition-colors" to="/player_stats.html">Players</Link>
<Link className="text-sm font-medium hover:text-primary transition-colors" to="/auction_rules.html">Auction Rules</Link>
<Link className="text-sm font-medium hover:text-primary transition-colors" to="/discover.html">Discover</Link>
</div>
<div className="flex items-center gap-4">
<a href="login.html"><button className="px-5 py-2 text-sm font-bold hover:text-primary transition-colors">Login</button></a>
<a href="login.html"><button className="bg-primary text-background-dark px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-white transition-all">Sign Up</button></a>
</div>
</div>
</nav>
<div>
{/* Hero Section*/}
<section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">
{/* Background Image with Overlay*/}
<div className="absolute inset-0 z-0">
<div className="absolute inset-0 bg-gradient-to-b from-background-dark/60 via-background-dark/80 to-background-dark z-10"></div>
<img alt="Football Stadium" className="w-full h-full object-cover" data-alt="Cinematic night stadium atmosphere with bright floodlights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbBxm6rNDIKKsnUjENcAAIdYWUP02IjPT_IRgMFJsz4lSCP8DBdjziR8EEBmbyrKOHXOPvFhZVVJDibDXCOrJHYwP4WtHrAmVBXJJ7YTWRKkPI6XKaqsSJ7KdvaeZtt6WK0CXQ3n5ksVS9aHiEQGi25rK2n5KU2HtbvY_xZiMqr8m1JMJKKZNgdIW72gK-Qq0bl8d-PxsNecD-cp3QrYSG4YbdNi-2pwn8WD_KxVwiSxmdq9GXJCaRX5LEP6bsQ6bfjMXEcXH0aAc"/>
</div>
<div className="relative z-20 max-w-4xl px-6 text-center flex flex-col items-center">
<div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-widest uppercase">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
                    Experience your first Auction now
                </div>
<h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                    Build Your Dream <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 italic uppercase">Football Squad</span>
</h1>
<p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl font-light">
                    Experience the thrill of live bidding and strategic team building in the world's most competitive football auction platform.
                </p>
<div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
<a href="login.html"><button className="bg-primary text-background-dark px-10 py-5 rounded-xl text-lg font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(13,242,89,0.5)] transition-all">
                        Start Auction
                    </button></a>
<a href="discover.html"><button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-10 py-5 rounded-xl text-lg font-bold hover:bg-white/20 transition-all">
                        View Demo
                    </button></a>
</div>
</div>
</section>
{/* Feature Section*/}
<section className="py-24 px-6 max-w-7xl mx-auto">
<div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
<div className="max-w-xl">
<h2 className="text-3xl md:text-4xl font-black mb-4">Premium Auction <span className="text-primary italic">Features</span></h2>
<p className="text-slate-400 text-lg">Everything you need to scout, bid, and dominate the league. Built for managers who know their stats.</p>
</div>
<div className="hidden md:block">
<span className="material-symbols-outlined text-6xl text-white/10">sports_score</span>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
{/* Feature Card 1*/}
<div className="group p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-primary/50 transition-all duration-300 flex flex-col gap-6 neon-glow">
<div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
<span className="material-symbols-outlined gold-icon text-3xl">gavel</span>
</div>
<div>
<h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Live Auctions</h3>
<p className="text-slate-400 leading-relaxed">Join active rooms and compete for the world's best talent in real-time. Global markets open 24/7.</p>
</div>
</div>
{/* Feature Card 2*/}
<div className="group p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-primary/50 transition-all duration-300 flex flex-col gap-6 neon-glow">
<div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
<span className="material-symbols-outlined gold-icon text-3xl">bolt</span>
</div>
<div>
<h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Real-Time Bidding</h3>
<p className="text-slate-400 leading-relaxed">Lightning-fast updates ensuring you never miss a bid on your favorite players. Sub-second latency.</p>
</div>
</div>
{/* Feature Card 3*/}
<div className="group p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-primary/50 transition-all duration-300 flex flex-col gap-6 neon-glow">
<div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
<span className="material-symbols-outlined gold-icon text-3xl">diversity_3</span>
</div>
<div>
<h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Team Builder</h3>
<p className="text-slate-400 leading-relaxed">Manage your budget and chemistry to create an unbeatable lineup. Dynamic tactical adjustments.</p>
</div>
</div>
</div>
</section>
{/* Player Showcase Section Header*/}
<section className="pt-20 pb-10 px-6 max-w-7xl mx-auto">
<div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
<h2 className="text-2xl font-black uppercase tracking-tight">Top Player <span className="text-primary">Picks</span></h2>
<a className="text-primary text-sm font-bold flex items-center gap-2 hover:underline" href="#">
                    View Market <span className="material-symbols-outlined">arrow_forward</span>
</a>
</div>
{/* Player Carousel Container*/}
<div className="flex overflow-x-auto pb-10 gap-6 scrollbar-hide snap-x">
{/* Player Card 1*/}
<div className="min-w-[280px] md:min-w-[320px] snap-start group cursor-pointer">
<div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
<img alt="Erling Haaland" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Modern footballer in action silhouette against bright stadium lights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaI-OdEcAegheBHPIWZugUKMGn-59W4GY3JEa3Qd1hJuwCyB10R-5fppWeGiktjA52i02UvsX-McchLeRgdmYtFgQrReBbJukThxbRI7vhWfqX_1Kwr3jJGr44mzeeKB3Mgb6p1gref6oV76h3UztsMS1CJB1JHXrTvLx_7oGpe3rrc58CPjxLsTQCZ4dR_x4vLUOS5iIUVLVNx8YzvPnZUblNAonIlaVw0J4EF_4wCcVhw8cfjc9-yHfb8r1TgvRIyIBD25n1Myc"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
<span className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Current Bid</span>
<div className="text-2xl font-black text-white">$150.0M</div>
</div>
</div>
<div className="flex justify-between items-start">
<div>
<p className="text-lg font-bold">Erling Haaland</p>
<p className="text-slate-500 text-sm">Manchester City • FW</p>
</div>
<div className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold">91 OVR</div>
</div>
</div>
{/* Player Card 2*/}
<div className="min-w-[280px] md:min-w-[320px] snap-start group cursor-pointer">
<div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
<img alt="Kylian Mbappe" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Football player close-up with energetic match lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUps7q3cIJGDkxrGYbzTNFxTAD6rS2oOVGJ0gEwz_mih68sB9sZJIpc0uqNMft4uxW6LqltFDs2Ob2xahbBDg2lzCcU0E7Cek4kLS3cxwZbgeBWjL4ikwb4PSg6DduV5lx3ftjF-sqMUKSefeszU9_TMgmdaUSm7zrRnrt3PSPEjWxJM7Zv_x-Y1ZWqVOF8UT9GKjkxCNd6gE5JtnoTSk5jfYinBCWMvQ_zxvRr9PGtxA2ItX1PdEXlZoEoHXhFYMy_XnbGdkiZH0"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
<span className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Current Bid</span>
<div className="text-2xl font-black text-white">$165.5M</div>
</div>
</div>
<div className="flex justify-between items-start">
<div>
<p className="text-lg font-bold">Kylian Mbappé</p>
<p className="text-slate-500 text-sm">Real Madrid • FW</p>
</div>
<div className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold">92 OVR</div>
</div>
</div>
{/* Player Card 3*/}
<div className="min-w-[280px] md:min-w-[320px] snap-start group cursor-pointer">
<div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
<img alt="Kevin De Bruyne" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Football pitch and blurred stadium background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArnXW0-OMeKKqF9N2NfSbva7wr4fyuVVjW0n1frJ0nwiWp_uT2i7lTYHkwIdGk1vld4sip4aXrwlLA8-NJpADRscpMhLUO3GOqHysjuLHqNRvFNcUdAUGZiX-Gy5gzZ5bme3CkPokGDvT0Qdr7tjQ283WrXEQ-__R2OgEr2K6xppnvvaGb7MQZGHS7f1j86uRpWxu3lnM72MOKWNptxG2rv0tNTamFaKEjBrdMU181OsHlf0uSfT5QzSMY8gVVvKFRBzAU6_AstMw"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
<span className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Current Bid</span>
<div className="text-2xl font-black text-white">$92.0M</div>
</div>
</div>
<div className="flex justify-between items-start">
<div>
<p className="text-lg font-bold">Kevin De Bruyne</p>
<p className="text-slate-500 text-sm">Manchester City • MF</p>
</div>
<div className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold">90 OVR</div>
</div>
</div>
{/* Player Card 4*/}
<div className="min-w-[280px] md:min-w-[320px] snap-start group cursor-pointer">
<div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
<img alt="Mohamed Salah" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="A football lying on stadium grass at night" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtoqHScF58_zyr4h_ZxNLaPJ95LKIftkwmd9wgPGcdz4h-Ez25dhMogKjMoO05IZ6U-HaJevQ2Diagko8w4jP-z0AkXNzefjHN_WPBXJ2Y-Y9LXXLYj9kQO7BshE96XkaHCpvg_aCAw4QyZdfIvSjPFCVWdWZ3XGPiA8RC8ijihTgO8TPfgJzjBKFVWdy1fZr1XsG59dHa5L-8EK3kGSG0BhdtSyCG_vgDS5PozJW7uvoNHdO6vF3ym3PyS53sUtRSBWqAl9Zx46I"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
<span className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Current Bid</span>
<div className="text-2xl font-black text-white">$88.5M</div>
</div>
</div>
<div className="flex justify-between items-start">
<div>
<p className="text-lg font-bold">Mohamed Salah</p>
<p className="text-slate-500 text-sm">Liverpool • FW</p>
</div>
<div className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold">89 OVR</div>
</div>
</div>
</div>
</section>
{/* Final CTA Section*/}
<section className="bg-primary mt-20 py-20 px-6">
<div className="max-w-4xl mx-auto text-center">
<h2 className="text-background-dark text-4xl md:text-5xl font-black mb-6">Ready to Lead Your Team?</h2>
<p className="text-background-dark/80 text-xl font-medium mb-10">Join thousands of managers and start your journey to the championship today.</p>
<a href="login.html"><button className="bg-background-dark text-primary px-12 py-5 rounded-full text-xl font-black uppercase tracking-widest hover:scale-105 transition-transform">
                    Create My Team
                </button></a>
</div>
</section>
</div>
{/* Footer*/}
<footer className="border-t border-white/5 bg-background-dark py-12 px-4 lg:px-20 text-center">
<div className="flex flex-col items-center gap-6">
<div className="flex items-center gap-2 opacity-50">
<span className="material-symbols-outlined">gavel</span>
<p className="text-sm font-medium">Football Auction System v1.0.0</p>
</div>

<p className="text-slate-600 text-xs">© 2026 Football Auction Engine. All rights reserved.</p>
</div>
</footer>
</div></div>
  );
};

export default Landing_page;
