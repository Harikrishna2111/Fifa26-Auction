import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate('/user_dashboard');
  };
  return (<div className="dark"> 
<div className="dark bg-black font-display text-white min-h-screen flex items-center justify-center relative overflow-hidden">

<div className="absolute inset-0 pitch-pattern opacity-50"></div>
<div className="absolute inset-0 pitch-lines opacity-30"></div>

<main className="relative z-10 w-full max-w-md px-6">

{/* LOGO */}
<div className="flex flex-col items-center mb-10">
  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-background-dark mb-4">
    <span className="material-symbols-outlined text-3xl">sports_soccer</span>
  </div>
  <h1 className="text-3xl font-black uppercase italic">Footy<span className="text-primary">Auction</span></h1>
  <p className="text-slate-500 text-sm mt-2">DOORSTEP TO THE ARENA</p>
</div>

{/* CARD */}
<div className="bg-card-bg border border-white/5 rounded-3xl p-8 shadow-2xl">

{/* TOGGLE */}
<div className="flex p-1 bg-black/40 rounded-xl mb-8 border border-white/5">
  <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-primary text-background-dark' : 'text-slate-400'}`}>
    Login
  </button>
  <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-primary text-background-dark' : 'text-slate-400'}`}>
    Sign Up
  </button>
</div>

{/* FORMS */}
<div className="relative overflow-hidden min-h-[420px]">


{/* LOGIN FORM */}
{isLogin && (
<form className="space-y-6">
  <div>
    <label className="text-xs font-bold text-slate-400 uppercase">Username</label>
    <input className="w-full dark-input border border-white/10 rounded-xl py-4 px-4 neon-focus" placeholder="manager_name" />
  </div>

  <div>
    <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
    <input type="password" className="w-full dark-input border border-white/10 rounded-xl py-4 px-4 neon-focus" placeholder="••••••••" />
  </div>

<button
  type="button"
  onClick={handleSubmit}
  className="w-full bg-primary text-background-dark py-4 rounded-xl font-black uppercase tracking-widest">
  Enter
</button>

</form>
)}

{/* SIGNUP FORM */}
{!isLogin && (
<form className="space-y-6">

  {/* FULL NAME (ONLY HERE) */}
  <div>
    <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
    <input className="w-full dark-input border border-white/10 rounded-xl py-4 px-4 neon-focus" placeholder="Alex Ferguson" />
  </div>

  <div>
    <label className="text-xs font-bold text-slate-400 uppercase">Username</label>
    <input className="w-full dark-input border border-white/10 rounded-xl py-4 px-4 neon-focus" placeholder="manager_name" />
  </div>

  <div>
    <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
    <input type="password" className="w-full dark-input border border-white/10 rounded-xl py-4 px-4 neon-focus" placeholder="••••••••" />
  </div>

<button
  type="button"
  onClick={handleSubmit}
  className="w-full bg-primary text-background-dark py-4 rounded-xl font-black uppercase tracking-widest">
  Create Account
</button>

</form>
)}

</div>
</div>
</main>

</div></div>
  );
};

export default Login;
