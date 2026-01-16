import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Lobby = () => {
  const stadiumGradientStyle = {
    background: 'radial-gradient(circle at top, #1a3a24 0%, #102216 70%)'
  };
  
  const smokeOverlayStyle = {
    background: 'linear-gradient(180deg, transparent 0%, rgba(16, 34, 22, 0.8) 100%)',
    pointerEvents: 'none'
  };

  return (

<div className="font-display bg-background-light dark:bg-background-dark text-white min-h-screen relative overflow-x-hidden">
{/* Stadium Atmosphere Layer */}
<div className="fixed inset-0 -z-10" style={stadiumGradientStyle}></div>
<div className="fixed inset-0 -z-5" style={smokeOverlayStyle}></div>
<div className="layout-container flex h-full grow flex-col">

<header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background-dark/80 backdrop-blur-md">
<div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-background-dark">
<span className="material-symbols-outlined font-bold">sports_soccer</span>
</div>
<h2 className="text-xl font-black tracking-tighter uppercase italic">Footy<span className="text-primary">Auction</span></h2>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-3 pr-6 border-r border-white/10">
    <a href="user_dashboard.html"><button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white/5 hover:bg-white/10 text-white text-sm font-bold leading-normal transition-all">
<span className="truncate">Leave Lobby</span>
</button></a>
<div className="text-right hidden sm:block">
    
<p className="text-sm font-bold">Alex Smith</p>
<p className="text-[10px] text-primary uppercase font-black tracking-wider">Pro Manager</p>
</div>
<div className="w-10 h-10 rounded-full bg-white/10 border border-primary/30 flex items-center justify-center overflow-hidden">
<span className="material-symbols-outlined text-primary">person</span>
</div>
</div>
<a href="login.html"><button className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
<span className="material-symbols-outlined text-lg">logout</span>
                    Logout
                </button></a>
</div>
</div>
</header>
<main className="flex flex-col items-center flex-1 px-4 py-10">
<div className="max-w-[1000px] w-full flex flex-col items-center">
{/* Headline & Stats */}
<div className="flex flex-col items-center gap-2 mb-10">
<h1 className="text-white tracking-tight text-4xl md:text-5xl font-black leading-tight text-center">Elite Champions League</h1>
<div className="mt-6 bg-primary/10 border border-primary/30 rounded-xl p-4 flex flex-col items-center min-w-[200px]" style={{boxShadow: '0 0 15px rgba(13, 242, 89, 0.4)'}}>
<p className="text-primary/70 text-xs font-bold uppercase tracking-widest">Lobby Code</p>
<p className="text-primary text-3xl font-black tracking-widest">Z7-K92</p>
</div>
</div>
{/* Section Header */}
<div className="w-full flex justify-between items-end px-4 mb-4">
<h2 className="text-white text-xl font-bold flex items-center gap-2">
<span className="material-symbols-outlined text-primary">groups</span>
                        Joined Managers (12/20)
                    </h2>
<span className="text-white/40 text-sm font-medium">Waiting for players to join...</span>
</div>
{/* Image Grid (Managers) */}
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
{/* Admin (Highlighted) */}
<div className="flex flex-col items-center gap-3">
<div className="relative group">
<div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
<span className="material-symbols-outlined text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">workspace_premium</span>
</div>
<div className="size-24 rounded-full border-4 border-primary p-1 relative overflow-hidden bg-background-dark" style={{boxShadow: '0 0 15px rgba(13, 242, 89, 0.4)'}}>
<div className="w-full h-full rounded-full bg-cover bg-center" data-alt="Admin user avatar" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCZKqcLIIMCVHjGyKKj06jlaQn_NgtotA6TcEd08QrF-3q0xvvkMYwReMmS0_JiORrT2auix3A-veACDjENIKpJi3oagxX0i0_okuAslcjODxcmQylLxUQvyA4qlnkEGQJuBpFN8c5Ge-x8QWJ2cHL4hBfI4pn5EMzB9lsnAxgtercVca44-p-rytuy3RIehAJNnlSFr1ReOhnIOvTZUPgutDYqrnaPYLzcKp1efnrKbvdik9QOvp0QLYeSc-Vp04jdHb-Kyzz-pxk")'}}></div>
</div>
<div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#FFD700] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Admin</div>
</div>
<p className="text-primary text-sm font-bold truncate max-w-[120px]">Marcus (You)</p>
</div>
{/* Other Managers */}
<div className="flex flex-col items-center gap-3">
<div className="size-24 rounded-full border-2 border-white/20 p-1 hover:border-white/40 transition-all">
<div className="w-full h-full rounded-full bg-cover bg-center" data-alt="Manager avatar 2" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBn9EEqlJuWADvjrEIuPElperbqbx0GSl_8PmN2MzMmRkphDh5-yrEXgJ3yfA92SyJ_zLV0WMDN9Jevj9jUd4-hNp0f13torX1nwIRr9yRXYjMNHfIHYu5sfwQonS8KFWwIye2Pj47UBiVCh1yOHgILsSAlxh4pRCS14UgJiaw79LEfptSwXI_Jv1ktQw1bzZr95pf8TX-2w9ZyKTc4djTtYjdDcTTs8CQaEgrllYfQlI8HN1v-T33lRe_NvXx8VgWcIS0f5tDTPiI")'}}></div>
</div>
<p className="text-white/80 text-sm font-medium">Davey Jones</p>
</div>
<div className="flex flex-col items-center gap-3">
<div className="size-24 rounded-full border-2 border-white/20 p-1 hover:border-white/40 transition-all">
<div className="w-full h-full rounded-full bg-cover bg-center" data-alt="Manager avatar 3" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB6OpxS1pHB6c8EIn0C6VK4mFZ9vTRtQgdaCpXDdDAZ7FRhmfoXBrgR8KcX5INfl2khXrOqx_bCC-hpEfFLFPCW0dxGQ1poR7P0et8sX5TOl9-bmUwDbTnxqr7228qP-kaUrW9ckWL0jEERYGs9X9noisJ_GS7oiwALfLgtERjaxOnGI4ifXr5ngEVRt6iijvRjawi8utZirYDAxbIU272uw73u4SVG_KPLPbOWwxi-l1kccbexxpn9rQh2DAngbqhcXWyyVe6sExQ")'}}></div>
</div>
<p className="text-white/80 text-sm font-medium">Sarah FC</p>
</div>
<div className="flex flex-col items-center gap-3">
<div className="size-24 rounded-full border-2 border-white/20 p-1 hover:border-white/40 transition-all">
<div className="w-full h-full rounded-full bg-cover bg-center" data-alt="Manager avatar 4" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCfBNZbKBwUsNg7sPWxEJlFnvSsLjvZH6N5VXf8qmA4glmGE9XnxFQJAj1jtFtgnKcRVXlyeF2BvBQmoF0h_u4PKZ77xPa6jsj5h8RIPH4DK5lsoL8Lmrwcio_fbH-BOHAW9TvDltQevtbXBMDEnmT3x7wPcw4EwWFSrjLFeP4NG1CMi0k-hzUguuuSDddxCpFWIylXMiO1_-sGZo8pTBxU5sOvroPXEjctbPltmujKdFyyuheefh889ckR-DM-YFrjvNzzgRYnH5Q")'}}></div>
</div>
<p className="text-white/80 text-sm font-medium">Beto Manager</p>
</div>
<div className="flex flex-col items-center gap-3">
<div className="size-24 rounded-full border-2 border-white/20 p-1 hover:border-white/40 transition-all">
<div className="w-full h-full rounded-full bg-cover bg-center" data-alt="Manager avatar 5" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBrxFIFAvNAI1IzHhd2759h4Gw5C7aPwUne2gpfB7nUaXcHmdX053UXbahsrEDRFc2hEGfJWoS9xszMPMy2Fvmz0maa_5tyXZHkRf0N9STBImKOu53bcj2lzeqeiz5e4JKXlS5PtjsWa75wqVwluh-g14OxGwCJMc7nuQTJueibQi9gYIFPDGvH0PeoDvNx-qVF_O4yAMZcOgOvCPh_NjbkyaXwk7JypM-6n7pg9IHzltGLaToMa3VvE_qMIk2syB6Vf-a3pitov2Q")'}}></div>
</div>
<p className="text-white/80 text-sm font-medium">Elena United</p>
</div>
<div className="flex flex-col items-center gap-3">
<div className="size-24 rounded-full border-2 border-white/20 p-1 hover:border-white/40 transition-all">
<div className="w-full h-full rounded-full bg-cover bg-center" data-alt="Manager avatar 6" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD6vyoQ6FYsBNtpikBWJPEZt7ub7ao4bWp7BmcyX97XoSP7m4PXZyWxzwUUrpK0pt7P6FAWA0dDMcTrv98w2jCP4gS8Dbt0rj71RyTwH9lQRvX2xhoAuvMpArp6taQY6DZtq_GMM8YTzgUZJFS44-lod3oRCNLGk7chrGG9aJSPAD4o91g_nxSd1JAB83_tAyiUVrk0M519PvEtTse1Ivq3kcxAC8dHyH_a-XWwcfvmtcrGazxMli9sbtnDWbg9uBm2CGMhKFUiAIk")'}}></div>
</div>
<p className="text-white/80 text-sm font-medium">The Gaffer</p>
</div>
{/* Placeholder slots */}
<div className="flex flex-col items-center gap-3 opacity-30">
<div className="size-24 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center">
<span className="material-symbols-outlined text-3xl">person_add</span>
</div>
<p className="text-white/40 text-xs font-medium italic">Empty Slot</p>
</div>
<div className="flex flex-col items-center gap-3 opacity-30">
<div className="size-24 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center">
<span className="material-symbols-outlined text-3xl">person_add</span>
</div>
<p className="text-white/40 text-xs font-medium italic">Empty Slot</p>
</div>
</div>
{/* Action Section */}
<div className="mt-16 w-full flex flex-col items-center gap-6">
<p className="text-primary font-bold text-lg flex items-center gap-3" style={{animation: 'pulse-soft 2s infinite ease-in-out'}}>
<span className="size-2 rounded-full bg-primary inline-block"></span>
                        Waiting for admin to start auction...
                    </p>
{/* High Impact Start Button (Visible for Admin) */}
<a href="preauction_phase.html"><button className="group relative flex min-w-[320px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-16 px-8 bg-primary text-background-dark text-xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(13,242,89,0.5)]">
<span className="flex items-center gap-2">
                            Start Auction
                            <span className="material-symbols-outlined font-bold">play_arrow</span>
</span>
</button></a>
</div>
</div>
</main>
{/* Footer */}
<Footer />
</div>
</div>

  );
};

export default Lobby;
