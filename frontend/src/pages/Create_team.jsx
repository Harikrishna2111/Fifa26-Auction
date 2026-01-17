import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Create_team = () => {

  return (
    <>
    <body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col font-display">
{/* Top Navigation */}
<header class="sticky top-0 z-50 border-b border-solid border-white/10 bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-3">
<div class="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
<div class="flex items-center gap-10">
<div class="flex items-center gap-3">
<div class="size-8 bg-primary rounded-lg flex items-center justify-center">
<span class="material-symbols-outlined text-background-dark font-bold">sports_soccer</span>
</div>
<h2 class="text-white text-xl font-black leading-tight tracking-tight uppercase">KickOff<span class="text-primary">Pro</span></h2>
</div>
<nav class="hidden md:flex items-center gap-8">
<a class="text-white/60 hover:text-primary text-sm font-semibold transition-colors" href="#">Dashboard</a>
<a class="text-primary text-sm font-semibold transition-colors underline underline-offset-8" href="#">Auction</a>
<a class="text-white/60 hover:text-primary text-sm font-semibold transition-colors" href="#">Leagues</a>
<a class="text-white/60 hover:text-primary text-sm font-semibold transition-colors" href="#">Market</a>
</nav>
</div>
<div class="flex items-center gap-6">
<div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
<span class="material-symbols-outlined text-primary text-sm">payments</span>
<span class="text-white font-bold text-sm">€ 142.5M</span>
</div>
<div class="size-10 rounded-full border-2 border-primary overflow-hidden">
<img alt="User" class="w-full h-full object-cover" data-alt="User profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxi-5YiFOKdpr3Iy2vULy5IxvFm509Ie6nvutxi3gwE7RzBI6xxeon6JUJZo0t2nfG0plbIkpXI59FiGbQyIxIBaBurg2oAlqZV4Jt8N9MBWPbwWQX11nL-nying69DpDlJ74k1-YzegcGUgSwZocBeemidc5NFzQCk4IB8VZWsxBb-7IxGp0XjOcQD0mcXHhD2GqELQZ4G9apqt4v48fycJq-UPQWibcvfVl4fNZy6WA06mqrIeL1Jm6gI2HXmvjtWldwetAPSPE"/>
</div>
</div>
</div>
</header>
<main class="flex-1 max-w-[1400px] mx-auto w-full px-6 lg:px-20 py-8">
{/* Breadcrumbs & Heading */}
<div class="mb-8">
<div class="flex items-center gap-2 mb-4">
<a class="text-white/40 hover:text-white text-xs font-medium uppercase tracking-widest transition-colors" href="#">Dashboard</a>
<span class="material-symbols-outlined text-white/20 text-xs">chevron_right</span>
<a class="text-white/40 hover:text-white text-xs font-medium uppercase tracking-widest transition-colors" href="#">Auction</a>
<span class="material-symbols-outlined text-white/20 text-xs">chevron_right</span>
<span class="text-primary text-xs font-medium uppercase tracking-widest">Build Your Team</span>
</div>
<div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div class="max-w-2xl">
<h1 class="text-white text-5xl font-black leading-none tracking-tighter mb-3 uppercase italic">Build Your <span class="text-primary">Ultimate</span> Squad</h1>
<p class="text-white/60 text-lg">Scout the best talent, manage your budget, and draft a world-class team for the elite league.</p>
</div>
</div>
</div>
<div class="grid grid-cols-12 gap-8 items-start">
{/* Left Panel: Search & Selection */}
<div class="col-span-12 lg:col-span-8 space-y-6">
{/* Filters & Search */}
<div class="glass-panel rounded-xl p-4 flex flex-col md:flex-row gap-4">
<div class="flex-1 relative">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
<input class="w-full bg-white/5 border-white/10 focus:border-primary focus:ring-0 rounded-lg pl-12 text-white placeholder:text-white/30" placeholder="Search players by name, club, or nationality..." type="text"/>
</div>
<div class="flex gap-2">
<button class="bg-primary text-background-dark font-bold px-4 py-2 rounded-lg text-sm transition-transform active:scale-95">ALL</button>
<button class="bg-white/5 hover:bg-white/10 text-white font-semibold px-4 py-2 rounded-lg text-sm border border-white/10 transition-colors">FWD</button>
<button class="bg-white/5 hover:bg-white/10 text-white font-semibold px-4 py-2 rounded-lg text-sm border border-white/10 transition-colors">MID</button>
<button class="bg-white/5 hover:bg-white/10 text-white font-semibold px-4 py-2 rounded-lg text-sm border border-white/10 transition-colors">DEF</button>
<button class="bg-white/5 hover:bg-white/10 text-white font-semibold px-4 py-2 rounded-lg text-sm border border-white/10 transition-colors">GK</button>
</div>
</div>
{/* Player Grid */}
<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 h-[700px] overflow-y-auto pr-2 custom-scrollbar">
{/* Player Card 1 */}
<div class="group bg-white/5 border border-white/10 hover:border-primary/50 rounded-xl p-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(13,242,89,0.1)]">
<div class="flex justify-between items-start mb-4">
<div class="size-16 rounded-lg bg-white/10 overflow-hidden">
<img alt="Player" class="w-full h-full object-cover" data-alt="Football player portrait action shot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAH6NyHbJIeyPY0hgAax-X0oC7mzNVfdIjtPPrIfaCtHric_W5PfEXpD4JEYNnEpJzQHK6fSbL7mdoY87ASypa9R9DbR_sr6Wh7mTdOBeuFyQAWZ_QwOSkXDz1InHg2Bh4rxIvV8VLug8OaxxObeRLFAw3S7fjzBmgMBKxMKIkYwUq2N3DEkxRhgZfZvosispZlkeQCl5hacnBgUvlD0dv6JxKOiBOf9AjMvJBv_xB5pWoL2eNTbyupzy1rRqd6YSIJr0WO0uxLvsY"/>
</div>
<div class="text-right">
<div class="text-2xl font-black text-primary italic">91</div>
<div class="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none">Rating</div>
</div>
</div>
<div class="mb-4">
<h3 class="text-white font-bold text-lg leading-tight uppercase">Erling Haaland</h3>
<div class="flex items-center gap-2 mt-1">
<span class="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">FWD</span>
<span class="text-white/40 text-xs font-medium uppercase tracking-tighter">Manchester City</span>
</div>
</div>
<div class="grid grid-cols-3 gap-2 mb-5">
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">PAC</div>
<div class="text-sm font-bold text-white">89</div>
</div>
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">SHO</div>
<div class="text-sm font-bold text-white">93</div>
</div>
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">PHY</div>
<div class="text-sm font-bold text-white">88</div>
</div>
</div>
<button class="w-full bg-primary/10 group-hover:bg-primary border border-primary/30 text-primary group-hover:text-background-dark font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-sm">add_circle</span>
                            Add to Team
                        </button>
</div>
{/* Player Card 2 */}
<div class="group bg-white/5 border border-white/10 hover:border-primary/50 rounded-xl p-4 transition-all duration-300">
<div class="flex justify-between items-start mb-4">
<div class="size-16 rounded-lg bg-white/10 overflow-hidden">
<img alt="Player" class="w-full h-full object-cover" data-alt="Footballer on training field" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDReCletMHm6Eu_d81H5hTci6fMZEzHix-xkivg4bUs-ieUANQ44mRZ_1BtZOgL8ly4RE4eXRFpvMrnJmflv0voTCs8S2HvR1eskuk72sIXxTT1BYP07dcX6ZXpO5Kzm0JL73n_qkS-gwrWq8PYGe60JUOjZtn3rz8inK-NTUShG3jeW3KscqO5UEL5YK47SVucC14Dr1u2IwHekxa0SmZmZxqvzqsBeccDr5bqzQKties-t4HEfdvfqKfEVRhOTe0oi-x86t9LQJk"/>
</div>
<div class="text-right">
<div class="text-2xl font-black text-primary italic">90</div>
<div class="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none">Rating</div>
</div>
</div>
<div class="mb-4">
<h3 class="text-white font-bold text-lg leading-tight uppercase">Kevin De Bruyne</h3>
<div class="flex items-center gap-2 mt-1">
<span class="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">MID</span>
<span class="text-white/40 text-xs font-medium uppercase tracking-tighter">Manchester City</span>
</div>
</div>
<div class="grid grid-cols-3 gap-2 mb-5">
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">PAS</div>
<div class="text-sm font-bold text-white">94</div>
</div>
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">DRI</div>
<div class="text-sm font-bold text-white">87</div>
</div>
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">SHO</div>
<div class="text-sm font-bold text-white">88</div>
</div>
</div>
<button class="w-full bg-primary/10 group-hover:bg-primary border border-primary/30 text-primary group-hover:text-background-dark font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-sm">add_circle</span>
                            Add to Team
                        </button>
</div>
{/* Player Card 3 */}
<div class="group bg-white/5 border border-white/10 hover:border-primary/50 rounded-xl p-4 transition-all duration-300">
<div class="flex justify-between items-start mb-4">
<div class="size-16 rounded-lg bg-white/10 overflow-hidden">
<img alt="Player" class="w-full h-full object-cover" data-alt="Soccer player celebrating" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC3r_ojyszuX9OBgx9QIxRxGu-LVVjyS0HjD1v9s90FfzQRzveu2VW2M4PZXr83FitwvjkjUI1vO2j_ZInd9iF47pnD1xjRuLP3nQhBHI361sGhIjZJ-h857Du6oH9VawU7zElrxB0kRd6-HpPpe865a_zpsftN9g--BG_9i5QjiqNIZrgqk0viC513kevT9AuHShn2g4qm5YErKcM23cITcpRhy6VeiFz7hNicQlWElp7dSKy83Cq2I_Hy2EydA0w9Tt3J7UEYQs"/>
</div>
<div class="text-right">
<div class="text-2xl font-black text-primary italic">88</div>
<div class="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none">Rating</div>
</div>
</div>
<div class="mb-4">
<h3 class="text-white font-bold text-lg leading-tight uppercase">Ruben Dias</h3>
<div class="flex items-center gap-2 mt-1">
<span class="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">DEF</span>
<span class="text-white/40 text-xs font-medium uppercase tracking-tighter">Manchester City</span>
</div>
</div>
<div class="grid grid-cols-3 gap-2 mb-5">
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">DEF</div>
<div class="text-sm font-bold text-white">89</div>
</div>
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">PHY</div>
<div class="text-sm font-bold text-white">87</div>
</div>
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">PAS</div>
<div class="text-sm font-bold text-white">72</div>
</div>
</div>
<button class="w-full bg-primary/10 group-hover:bg-primary border border-primary/30 text-primary group-hover:text-background-dark font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-sm">add_circle</span>
                            Add to Team
                        </button>
</div>
{/* Repeat cards for scroll visual */}
<div class="group bg-white/5 border border-white/10 hover:border-primary/50 rounded-xl p-4 transition-all duration-300">
<div class="flex justify-between items-start mb-4">
<div class="size-16 rounded-lg bg-white/10 overflow-hidden">
<img alt="Player" class="w-full h-full object-cover" data-alt="Player profile portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMS7Z_OMavktH8ro1W6YpxaEvxe41Va89K1eeQ6dkotHBLrJmycmSS5xTvc4t5QiqI7lbc3lygah-X2U1H7OuL3x_gJ29Smv48Lc-T5_ti1QHN0RQ0-bIRpwnOuw1VDXonEW29R9va160jguhGjtba4nF-5-sWmwKKxWEcv8QheGjXp8b1jWRwmf93t6xpFod02UJ0rtb_6FQISJZ_CoYrKWRq7JzqSV3Dsow5HHy49aya_I33ArdcJye_EHQfF622OKeFrO_Rsc4"/>
</div>
<div class="text-right">
<div class="text-2xl font-black text-primary italic">89</div>
<div class="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none">Rating</div>
</div>
</div>
<div class="mb-4">
<h3 class="text-white font-bold text-lg leading-tight uppercase">Vinícius Jr</h3>
<div class="flex items-center gap-2 mt-1">
<span class="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">FWD</span>
<span class="text-white/40 text-xs font-medium uppercase tracking-tighter">Real Madrid</span>
</div>
</div>
<div class="grid grid-cols-3 gap-2 mb-5">
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">PAC</div>
<div class="text-sm font-bold text-white">95</div>
</div>
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">DRI</div>
<div class="text-sm font-bold text-white">90</div>
</div>
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">SHO</div>
<div class="text-sm font-bold text-white">82</div>
</div>
</div>
<button class="w-full bg-primary/10 group-hover:bg-primary border border-primary/30 text-primary group-hover:text-background-dark font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-sm">add_circle</span>
                            Add to Team
                        </button>
</div>
<div class="group bg-white/5 border border-white/10 hover:border-primary/50 rounded-xl p-4 transition-all duration-300">
<div class="flex justify-between items-start mb-4">
<div class="size-16 rounded-lg bg-white/10 overflow-hidden">
<img alt="Player" class="w-full h-full object-cover" data-alt="Professional athlete profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT1wqi0xg6Wo27qKKUJjQU-8jtiBpnZjCWd_-D4Ra-LCuykkagia6veGK-guFNQYV5DrP_cBPdFOcNgXIUfpvUlFcoSNN9B-E9fd91-pKfLlcJhBp36K6M0mb0zMw4VbVL-aMn9t37Wc1akqSeXzZI49XYfh4z1vRTDfUqeZogO9MIsYzSOoe6rgXGI4Lw_ZELhsUtTGZfYy8JRMlGslCzqIQrhiz0JgcNo0XUBuolV4-a5R2v_bW1o-BO4XdDIlv6D9WGeU4NxLM"/>
</div>
<div class="text-right">
<div class="text-2xl font-black text-primary italic">90</div>
<div class="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none">Rating</div>
</div>
</div>
<div class="mb-4">
<h3 class="text-white font-bold text-lg leading-tight uppercase">Mo Salah</h3>
<div class="flex items-center gap-2 mt-1">
<span class="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">FWD</span>
<span class="text-white/40 text-xs font-medium uppercase tracking-tighter">Liverpool FC</span>
</div>
</div>
<div class="grid grid-cols-3 gap-2 mb-5">
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">PAC</div>
<div class="text-sm font-bold text-white">91</div>
</div>
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">SHO</div>
<div class="text-sm font-bold text-white">89</div>
</div>
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">DRI</div>
<div class="text-sm font-bold text-white">88</div>
</div>
</div>
<button class="w-full bg-primary/10 group-hover:bg-primary border border-primary/30 text-primary group-hover:text-background-dark font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-sm">add_circle</span>
                            Add to Team
                        </button>
</div>
<div class="group bg-white/5 border border-white/10 hover:border-primary/50 rounded-xl p-4 transition-all duration-300">
<div class="flex justify-between items-start mb-4">
<div class="size-16 rounded-lg bg-white/10 overflow-hidden">
<img alt="Player" class="w-full h-full object-cover" data-alt="Football player profile pic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX1iZGCAquQpm__jrKG8gmx_UxgSsKiL-EpGG1sz-J4BPijwtrADoOxuYa6v0sYycuGb2JkITeA8tutT2shTrkIIKDvlBZTRk4hZd_cf3Ja4kcVI_F4jrbXjIfBuzwh1rvE6wSSrAD_uflmefjmSK_5e8QF266ZGrdD5axIR7LjcybnQgh2NR0i9usPOv7sffGYH7JAg3yBAtSI8AUGjYKVploG6Yz5R6oF6spOtT5uxTtbkKOtBrOL9Fpc9WTRjxw0AbfDW_zu1g"/>
</div>
<div class="text-right">
<div class="text-2xl font-black text-primary italic">87</div>
<div class="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none">Rating</div>
</div>
</div>
<div class="mb-4">
<h3 class="text-white font-bold text-lg leading-tight uppercase">Mike Maignan</h3>
<div class="flex items-center gap-2 mt-1">
<span class="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">GK</span>
<span class="text-white/40 text-xs font-medium uppercase tracking-tighter">AC Milan</span>
</div>
</div>
<div class="grid grid-cols-3 gap-2 mb-5">
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">DIV</div>
<div class="text-sm font-bold text-white">86</div>
</div>
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">REF</div>
<div class="text-sm font-bold text-white">89</div>
</div>
<div class="text-center p-1.5 bg-white/5 rounded">
<div class="text-[10px] text-white/40 font-bold uppercase">HAN</div>
<div class="text-sm font-bold text-white">84</div>
</div>
</div>
<button class="w-full bg-primary/10 group-hover:bg-primary border border-primary/30 text-primary group-hover:text-background-dark font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-sm">add_circle</span>
                            Add to Team
                        </button>
</div>
</div>
</div>
{/* Right Panel: Your Team */}
<div class="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-24">
{/* Team Summary Card */}
<div class="bg-primary text-background-dark rounded-xl p-6 shadow-xl relative overflow-hidden">
<div class="absolute right-[-20px] top-[-20px] opacity-10">
<span class="material-symbols-outlined !text-9xl">shield</span>
</div>
<div class="relative z-10">
<div class="flex justify-between items-start mb-6">
<div>
<h3 class="font-black text-2xl italic leading-none uppercase tracking-tighter">Squad Status</h3>
<p class="text-background-dark/70 font-bold uppercase text-xs tracking-widest mt-1">Elite League Season 2</p>
</div>
<div class="text-right">
<div class="text-4xl font-black italic">86</div>
<div class="text-[10px] font-bold uppercase tracking-widest leading-none">Avg OVR</div>
</div>
</div>
<div class="space-y-2 mb-4">
<div class="flex justify-between items-end">
<span class="font-bold text-sm uppercase">Squad Depth</span>
<span class="font-black text-lg italic leading-none">8/11</span>
</div>
<div class="w-full h-3 bg-background-dark/20 rounded-full overflow-hidden">
<div class="h-full bg-background-dark rounded-full w-[72%]"></div>
</div>
</div>
<div class="flex items-center gap-4 pt-4 border-t border-background-dark/10">
<div class="flex-1">
<div class="text-[10px] font-bold uppercase tracking-widest opacity-60">Remaining Budget</div>
<div class="text-xl font-black italic">€ 42.5M</div>
</div>
<div class="size-10 bg-background-dark text-primary rounded-lg flex items-center justify-center">
<span class="material-symbols-outlined">trending_up</span>
</div>
</div>
</div>
</div>
{/* Selected Players List */}
<div class="glass-panel rounded-xl overflow-hidden flex flex-col">
<div class="p-4 border-b border-white/10 flex justify-between items-center">
<h4 class="text-white font-bold uppercase tracking-wider text-sm italic">Active Roster</h4>
<span class="text-white/40 text-[10px] font-bold uppercase">Selection 1 of 1</span>
</div>
<div class="max-h-[460px] overflow-y-auto custom-scrollbar">
{/* Selected Player Row 1 */}
<div class="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
<div class="size-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
<img alt="Player" class="w-full h-full object-cover" data-alt="Close up of football player" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6_PEPrD-xmySyHc_k9W77CdkEoUk5nwnWuDK3MUkdb8kYpkO_3tj6fhQLGmycR7QC3kVuH62QarI-WIhMHZe2ZDABSOfc_x4N9r92f8p3mMdnBum2gFXdCQLb8IGPUETr8dr4nW993Y5lJ8PkvG1ZsWcbyqYhERdkhnGyCZy5d2FpbZGKhL43DWFB74bTFEcebx39oZx9TdS0-ygBJOUK0m48MFZ_F3ZkyAnYjQlePYFFt2Uij51stIWW6shNrAkR77YflbpUx8Q"/>
</div>
<div class="flex-1">
<h5 class="text-white font-bold text-sm uppercase tracking-tight">Kylian Mbappé</h5>
<div class="flex items-center gap-2">
<span class="text-primary text-[10px] font-black italic">91 OVR</span>
<span class="text-white/40 text-[10px] uppercase font-bold">FWD</span>
</div>
</div>
<button class="text-white/20 hover:text-red-500 transition-colors">
<span class="material-symbols-outlined text-lg">cancel</span>
</button>
</div>
{/* Selected Player Row 2 */}
<div class="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
<div class="size-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
<img alt="Player" class="w-full h-full object-cover" data-alt="Headshot of a soccer player" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBV-XmL-mmjpfAVvuOg93WsT9EqA2XXb0aoKrG7ONb68A5JFtzGjY4M51ZG6OlnF8g0yxvQ1Bq9tcpoXictdrZb26LdGtJXMeMo_7mw1_Mep2F2rcr-qe6Pc0sux-Ym7E6Gmiv9dFrT73kXpZDlrGUQBGrHicQHYV02DN4ocbP_j_k3uvps0ny7t7GM_UgU3p3cQuyF5C-OyG-0HvIyrHYQCkAMcqQcMqxiaB6FFRsAnaEFX6_9UmdhYbfelqz3SS8YRBGyYmsD790"/>
</div>
<div class="flex-1">
<h5 class="text-white font-bold text-sm uppercase tracking-tight">Jude Bellingham</h5>
<div class="flex items-center gap-2">
<span class="text-primary text-[10px] font-black italic">88 OVR</span>
<span class="text-white/40 text-[10px] uppercase font-bold">MID</span>
</div>
</div>
<button class="text-white/20 hover:text-red-500 transition-colors">
<span class="material-symbols-outlined text-lg">cancel</span>
</button>
</div>
{/* Selected Player Row 3 */}
<div class="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
<div class="size-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
<img alt="Player" class="w-full h-full object-cover" data-alt="Sports athlete portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3jtBLEeCyKKnOkUgeuZPAVqZs-Gqy855LDpQB1YMq9MkULyWkZ9dmgYtfxZRDVk0aDt0rbvDblvQn9VlfcVf-YkE8ISjvwv6IeBjwNCSdxf0SbTbNyoUyX8Ig5qSU8eKZZqYQ5YGV_IIZJ3do0W0iih7ADT6Oi5ZLUjTAppLH08MWMDdUhTgjaKuO1LQv59TxZf3M22ZxH6cD2E4atRo-Mo8ZNfBiCKAghmM1WB9KWrTXo02ZUw12bdQS87-WchX1jybmHjKGi2Q"/>
</div>
<div class="flex-1">
<h5 class="text-white font-bold text-sm uppercase tracking-tight">Virgil van Dijk</h5>
<div class="flex items-center gap-2">
<span class="text-primary text-[10px] font-black italic">89 OVR</span>
<span class="text-white/40 text-[10px] uppercase font-bold">DEF</span>
</div>
</div>
<button class="text-white/20 hover:text-red-500 transition-colors">
<span class="material-symbols-outlined text-lg">cancel</span>
</button>
</div>
{/* Empty Slot Suggestion */}
<div class="p-4 bg-white/2 border border-dashed border-white/10 m-3 rounded-lg flex flex-col items-center justify-center py-8 text-center">
<span class="material-symbols-outlined text-white/10 text-4xl mb-2">person_add</span>
<p class="text-white/30 text-xs font-bold uppercase tracking-widest">Select 3 more players</p>
</div>
</div>
</div>
</div>
</div>
</main>
{/* Bottom Sticky Global Action Bar */}
<footer class="fixed bottom-0 left-0 right-0 z-50 bg-background-dark/90 backdrop-blur-xl border-t border-white/10 px-6 lg:px-20 py-4">
<div class="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
<div class="hidden md:flex items-center gap-8">
<div class="flex flex-col">
<span class="text-[10px] text-white/40 uppercase font-black tracking-widest leading-none mb-1">Total Value</span>
<span class="text-white font-black italic text-lg leading-none">€ 118,500,000</span>
</div>
<div class="flex flex-col">
<span class="text-[10px] text-white/40 uppercase font-black tracking-widest leading-none mb-1">Squad Type</span>
<span class="text-primary font-black italic text-lg leading-none uppercase">Offensive Focus</span>
</div>
</div>
<div class="flex items-center gap-3 w-full sm:w-auto">
<Link to="/manage_teams"><button class="flex-1 sm:flex-none border border-white/20 hover:bg-white/5 text-white font-bold px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-sm">save</span>
                    Save Team
                </button></Link>
<Link to="/formation_settings"><button class="flex-1 sm:flex-none bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 text-background-dark font-black px-12 py-3 rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(13,242,89,0.3)] italic uppercase tracking-tight">
<span class="material-symbols-outlined font-black">grid_view</span>
                    Set Formation
                </button></Link>
</div>
</div>
</footer>
{/* Spacer for sticky footer */}
<div class="h-24"></div>
</body>
    </>
  );
};

export default Create_team;