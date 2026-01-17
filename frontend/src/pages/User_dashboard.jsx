import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const User_dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const userId = 1; // TEMP: replace later with logged-in user id
  
  useEffect(() => {
    fetch(`http://localhost:5000/api/dashboard/${userId}`)
      .then(res => res.json())
      .then(data => setDashboard(data))
      .catch(err => console.error(err));
  }, []);

  if (!dashboard) {
    return (
      <div className="bg-background-dark min-h-screen flex items-center justify-center text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    
    <div className="bg-background-dark font-display text-white min-h-screen">
<Navbar
  isLoggedIn={true}
  userName={dashboard.manager.fullname}
  userRole="Pro Manager"
/>
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-12">
          <h1 className="text-3xl font-black mb-2">Manager <span className="text-primary italic">Dashboard</span></h1>
<p className="text-slate-400">
  Welcome back, {dashboard.manager.fullname.split(" ")[0]}
</p>
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
  {dashboard.past_auctions.map(auction => (
    <div
      key={auction.id}
      className="min-w-[300px] bg-card-dark border border-white/5 rounded-2xl p-6 snap-start card-hover transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded uppercase">
          {auction.status}
        </span>
        <span className="text-xs text-slate-500">
          {auction.end_date}
        </span>
      </div>

      <h3 className="text-lg font-bold mb-1">{auction.name}</h3>
      <p className="text-sm text-slate-400 mb-4">{auction.season}</p>

      <div className="pt-4 border-t border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-black mb-2">
          Acquired Team
        </p>
        <span className="font-bold">{auction.acquired_team}</span>
      </div>
    </div>
  ))}
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
  {dashboard.teams.map(team => (
    <div
      key={team.id}
      className="bg-card-dark border border-white/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-all"
    >
      <div className={`h-2 ${team.status === "ACTIVE" ? "bg-primary" : "bg-blue-500"}`}></div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black uppercase italic">{team.name}</h3>
          <span className="text-xs px-2 py-1 rounded font-bold bg-white/10">
            {team.status}
          </span>
        </div>

        {/* Players */}
        <div className="flex -space-x-3 mb-6">
          {team.players.map(p => (
            <div key={p.id} className="w-10 h-10 rounded-full border-2 border-card-dark overflow-hidden">
              <img src={p.image_url} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-3 rounded-xl">
            <p className="text-[10px] text-slate-500 uppercase font-black">Rating</p>
            <p className="text-lg font-black">{team.rating} OVR</p>
          </div>

          <div className="bg-white/5 p-3 rounded-xl">
            <p className="text-[10px] text-slate-500 uppercase font-black">Value</p>
            <p className="text-lg font-black">${(team.value / 1_000_000).toFixed(0)}M</p>
          </div>
        </div>
      </div>
    </div>
  ))}
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
