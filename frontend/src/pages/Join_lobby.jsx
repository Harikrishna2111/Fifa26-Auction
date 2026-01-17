import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const Join_lobby = () => {
  return (

<div className="font-display bg-background-light dark:bg-background-dark text-white min-h-screen" style={{backgroundColor: '#102216', backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(13, 242, 89, 0.05) 1px, transparent 0)', backgroundSize: '32px 32px'}}>
<div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
<Navbar />
<main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
{/* Back Button Area */}
<div className="w-full max-w-[480px] mb-6">
<button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-bold group">
<span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
<a href="user_dashboard.html"><span>Back to Dashboard</span>
</a></button>
</div>
{/* Main Join Card */}
<div className="w-full max-w-[480px] bg-[#183422]/60 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-xl shadow-2xl">
<div className="text-center mb-10">
<h1 className="text-white tracking-tight text-[32px] font-bold leading-tight mb-3">Enter Lobby Code</h1>
<p className="text-white/60 text-base font-normal leading-relaxed">
                        Join the high-stakes draft. Enter the unique code provided by your auction host.
                    </p>
</div>
{/* Input Form */}
<div className="space-y-6">
<div className="flex flex-col gap-2">
<label className="text-primary text-xs font-bold uppercase tracking-widest pl-1">Lobby Code</label>
<div className="relative rounded-xl overflow-hidden transition-all duration-300" style={{boxShadow: '0 0 15px rgba(13, 242, 89, 0.4)'}}>
<input autoFocus className="form-input flex w-full border-none bg-black/40 text-white text-2xl text-center tracking-[0.2em] font-bold h-16 rounded-xl focus:ring-2 focus:ring-primary placeholder:text-white/20 placeholder:tracking-normal uppercase" placeholder="882-FTB" type="text"/>
</div>
</div>
{/* CTA Button */}
<Link to="/lobby"><button className="mt-10 w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-black h-14 rounded-xl font-extrabold text-base tracking-wide transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(13,242,89,0.2)]">
<span>JOIN AUCTION</span>
<span className="material-symbols-outlined font-bold">bolt</span>
</button></Link>
{/* Feedback Messages */}
<div className="min-h-[24px] text-center">
{/* Example Error State: hidden by default or toggle visibility */}
<p className="text-red-400 text-sm font-medium flex items-center justify-center gap-2 hidden">
<span className="material-symbols-outlined text-sm">error</span>
                            Lobby code not found. Please verify and try again.
                        </p>
{/* Example Success State: shown during transition */}
<p className="text-primary text-sm font-bold flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-sm animate-pulse">check_circle</span>
                            Ready to enter the pitch.
                        </p>
</div>
</div>
</div>
{/* Quick Stats/Info Footer inside main container */}
<div className="mt-12 flex flex-wrap justify-center gap-8 text-white/40 text-xs font-medium uppercase tracking-widest">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">groups</span>
<span>1,240 Active Lobbies</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">verified_user</span>
<span>Secure Draft System</span>
</div>
</div>
</main>
{/* Decorative Element */}
<div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
</div>
</div>

  );
};

export default Join_lobby;









