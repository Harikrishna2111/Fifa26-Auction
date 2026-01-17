import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

const handleLogin = async () => {
  setError("");
  setLoading(true);

  console.log("Attempting login with:", { username, password: "***" });

  try {
    console.log("Sending request to: http://localhost:5000/api/auth/login");
    
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      mode: "cors",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    console.log("Response status:", res.status);
    console.log("Response headers:", res.headers);

    const data = await res.json();
    console.log("Response data:", data);

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    localStorage.setItem(
  "user",
  JSON.stringify({
    id: data.user.id,
    fullname: data.user.fullname,
    username: data.user.username,
    role: "Pro Manager"
  })
);
    navigate("/user_dashboard");
  } catch (err) {
    console.error("Login error details:", err);
    setError(`Connection failed: ${err.message}`);
  } finally {
    setLoading(false);
  }
};


const handleSignup = async () => {
  setError("");
  setLoading(true);

  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      mode: "cors",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ fullname, username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Signup failed");
      return;
    }

    setIsLogin(true);
  } catch (err) {
    console.error("Signup error:", err);
    setError(`Server unreachable. Make sure backend is running on port 5000.`);
  } finally {
    setLoading(false);
  }
};


const [fullname, setFullname] = useState("");
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);


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
  {error && (
  <div className="mb-4 text-sm text-red-400 font-bold text-center">
    {error}
  </div>
)}
{/* FORMS */}
<div className="relative overflow-hidden min-h-[420px]">


{/* LOGIN FORM */}
{isLogin && (
<form className="space-y-6">
  <div>
    <label className="text-xs font-bold text-slate-400 uppercase">Username</label>
<input
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  className="w-full dark-input border border-white/10 rounded-xl py-4 px-4 neon-focus"
  placeholder="manager_name"
/>  </div>

  <div>
    <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
<input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full dark-input border border-white/10 rounded-xl py-4 px-4 neon-focus"
  placeholder="••••••••"
/>  </div>

<button
  type="button"
  disabled={loading}
  onClick={handleLogin}
  className="w-full bg-primary text-background-dark py-4 rounded-xl font-black uppercase tracking-widest disabled:opacity-50"
>
  {loading ? "Entering..." : "Enter"}
</button>

</form>
)}

{/* SIGNUP FORM */}
{!isLogin && (

<form className="space-y-6">

  {/* FULL NAME (ONLY HERE) */}
  <div>
    <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
<input
  value={fullname}
  onChange={(e) => setFullname(e.target.value)}
  className="w-full dark-input border border-white/10 rounded-xl py-4 px-4 neon-focus"
  placeholder="Alex Ferguson"
/>  </div>

  <div>
    <label className="text-xs font-bold text-slate-400 uppercase">Username</label>
<input
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  className="w-full dark-input border border-white/10 rounded-xl py-4 px-4 neon-focus"
  placeholder="manager_name"
/>  </div>

  <div>
    <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
<input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full dark-input border border-white/10 rounded-xl py-4 px-4 neon-focus"
  placeholder="••••••••"
/>  </div>

<button
  type="button"
  disabled={loading}
  onClick={handleSignup}
  className="w-full bg-primary text-background-dark py-4 rounded-xl font-black uppercase tracking-widest disabled:opacity-50"
>
  {loading ? "Creating..." : "Create Account"}
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
