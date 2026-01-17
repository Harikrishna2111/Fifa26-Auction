import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const Preacution_phase = () => {
  const playerCardGradient = {
    background: 'linear-gradient(180deg, rgba(18, 35, 15, 0) 0%, rgba(18, 35, 15, 0.9) 100%)'
  };

  return (

<div className="bg-background-light dark:bg-background-dark text-white min-h-screen flex flex-col" style={{fontFamily: "'Space Grotesk', sans-serif"}}>
{/* Top Navigation */}
<Navbar />
{/* Main Content */}
<main className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full px-6 lg:px-12 py-8 gap-8 overflow-hidden">
{/* Header & Breadcrumbs */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<nav className="flex items-center gap-2 mb-2">
<a className="text-[#98ce8d] text-sm font-medium" href="#">Season 2</a>
<span className="text-[#274b20] font-bold">/</span>
<span className="text-white/60 text-sm font-medium">Pre-Auction Management</span>
</nav>
<div className="flex items-center gap-4">
<h1 className="text-4xl font-extrabold tracking-tight">Pre-Auction: Season 2</h1>
<span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold uppercase tracking-widest">
<span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                        Live Phase
                    </span>
</div>
</div>
<div className="bg-[#1a2e16] p-4 rounded-xl border border-[#274b20] min-w-[280px]">
<div className="flex justify-between items-center mb-2">
<span className="text-xs uppercase font-bold text-[#98ce8d]">Retention Progress</span>
<span className="text-sm font-bold text-primary">7 / 10</span>
</div>
<div className="h-2 w-full bg-[#12230f] rounded-full overflow-hidden border border-[#274b20]">
<div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(43,255,0,0.5)]" style={{width: '70%'}}></div>
</div>
<p className="text-[10px] mt-2 text-[#98ce8d]/60 italic">3 slots remaining before mandatory auction submission.</p>
</div>
</div>
{/* Dashboard Grid */}
<div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 min-h-0">
{/* Left: My Team Retention */}
<section className="xl:col-span-5 flex flex-col bg-[#1a2e16]/30 rounded-xl border border-[#274b20] overflow-hidden">
<div className="p-5 border-b border-[#274b20] flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
<h2 className="text-xl font-bold flex items-center gap-2">
<span className="material-symbols-outlined text-primary">groups</span>
                        My Team – Retention
                    </h2>
<span className="text-xs text-[#98ce8d]">Cost: €42.5M</span>
</div>
<div className="flex-1 overflow-y-auto p-5 space-y-4">
{/* Player Card 1 */}
<div className="relative group bg-[#1a2e16] border border-[#274b20] hover:border-primary/50 transition-all rounded-lg overflow-hidden flex h-32">
<div className="w-32 bg-cover bg-center shrink-0" data-alt="Close up of a football player in jersey" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBLtSFYuZhVLW04Sr0E0fotzlpOT0QK4LKHMZBfIs7fmhc6RG3GvXyvZ73qvWmEZu0BhE1hfAdIrNvukNDFXIqkzQisNWrH4pwh1xduJR7XJIq1pL1mEXgxjHaV3zkzktD1h7FzLDM6zDqO9oBraoo6bBdDzTW6u0jsdZB2seK_fsbmCcFMWLLXBCnPzZmxkykmprK0QxgxrjtRqUUhTweCiKnK1_5kk65pU5ujQGN8SXDqjHbKK0z6YciLl24mnlt3NjKYUk1mrEI')"}}>
<div className="w-full h-full" style={{background: 'linear-gradient(180deg, rgba(18, 35, 15, 0) 0%, rgba(18, 35, 15, 0.9) 100%)'}}></div>
</div>
<div className="flex-1 p-4 flex flex-col justify-between">
<div className="flex justify-between items-start">
<div>
<h3 className="font-bold text-lg leading-tight">Erling Haaland</h3>
<span className="text-xs text-primary font-bold uppercase">FWD • Manchester City</span>
</div>
<div className="text-right">
<div className="text-sm font-bold">€18.0M</div>
<div className="text-[10px] text-[#98ce8d]">Current Value</div>
</div>
</div>
<div className="flex items-center justify-between">
<div className="flex gap-3">
<div className="flex flex-col">
<span className="text-[10px] text-[#98ce8d] uppercase">Goals</span>
<span className="text-sm font-bold italic">32</span>
</div>
<div className="flex flex-col">
<span className="text-[10px] text-[#98ce8d] uppercase">XG</span>
<span className="text-sm font-bold italic">28.4</span>
</div>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-[#12230f] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
<span className="ml-2 text-xs font-bold text-primary">RETAIN</span>
</label>
</div>
</div>
</div>
{/* Player Card 2 */}
<div className="relative group bg-[#1a2e16] border border-[#274b20] hover:border-primary/50 transition-all rounded-lg overflow-hidden flex h-32">
<div className="w-32 bg-cover bg-center shrink-0" data-alt="Football player in action shot" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAT2sc7uHHxxCAJ6FqRwzH-yvkctfNkQo5CsNLBYdw0GEqbM4ZtC_C-Ax6Ch2WkBUdNOMWRjHPVl2PCmPUdvEfrSzQJK_a9ouWdI_P0ykgeMt2Ea1I6CrH-l44qwRF9bEUQIVNhPjdolmkz1V4104Sbqup9taduEK0QUE29gtJO1CHLMfuA5DNfMB8PbBj3BbwIMQWOis6R27wB5zELOS6_y3phFBNieAHpfjD2OIMD2mIHQnVFMEYWiA5fCaAsj9PxYbM6rVsdeF0')"}}>
<div className="w-full h-full" style={{background: 'linear-gradient(180deg, rgba(18, 35, 15, 0) 0%, rgba(18, 35, 15, 0.9) 100%)'}}></div>
</div>
<div className="flex-1 p-4 flex flex-col justify-between">
<div className="flex justify-between items-start">
<div>
<h3 className="font-bold text-lg leading-tight">Bukayo Saka</h3>
<span className="text-xs text-primary font-bold uppercase">MID • Arsenal</span>
</div>
<div className="text-right">
<div className="text-sm font-bold">€12.5M</div>
<div className="text-[10px] text-[#98ce8d]">Current Value</div>
</div>
</div>
<div className="flex items-center justify-between">
<div className="flex gap-3">
<div className="flex flex-col">
<span className="text-[10px] text-[#98ce8d] uppercase">Assists</span>
<span className="text-sm font-bold italic">12</span>
</div>
<div className="flex flex-col">
<span className="text-[10px] text-[#98ce8d] uppercase">KP</span>
<span className="text-sm font-bold italic">64</span>
</div>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-[#12230f] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
<span className="ml-2 text-xs font-bold text-primary">RETAIN</span>
</label>
</div>
</div>
</div>
{/* Player Card 3 */}
<div className="relative group bg-[#1a2e16] border border-[#274b20] hover:border-primary/50 transition-all rounded-lg overflow-hidden flex h-32 grayscale opacity-60 hover:grayscale-0 hover:opacity-100">
<div className="w-32 bg-cover bg-center shrink-0" data-alt="Professional soccer player headshot" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuABa28CPImC8c5NGqMaYbvJMs-ULycUlL3EGaK1Ti8uFSJ_0XgMSZCIZsAHGklPdkPsnv1cK8zw305woAGdmeccaR5COoS-WgEXrdGBG_OOe5_VqQvJMHMzlfvLbk1GIqD6buP8E1jvx93lIcb_8oAOVKDXMUO91Pvr9g2fEWyP6t1so4IzVX-roYNTWvRk-59OtGDEQUwBMUkKe69O2hHZgvWoZuf-ltxELL7GCuAN6tDM4kOMH7RHExMZrpNzTpDwJTa-MrQpkkI')"}}>
<div className="w-full h-full" style={{background: 'linear-gradient(180deg, rgba(18, 35, 15, 0) 0%, rgba(18, 35, 15, 0.9) 100%)'}}></div>
</div>
<div className="flex-1 p-4 flex flex-col justify-between">
<div className="flex justify-between items-start">
<div>
<h3 className="font-bold text-lg leading-tight">Virgil van Dijk</h3>
<span className="text-xs text-primary font-bold uppercase">DEF • Liverpool</span>
</div>
<div className="text-right">
<div className="text-sm font-bold">€9.5M</div>
<div className="text-[10px] text-[#98ce8d]">Current Value</div>
</div>
</div>
<div className="flex items-center justify-between">
<div className="flex gap-3">
<div className="flex flex-col">
<span className="text-[10px] text-[#98ce8d] uppercase">CS</span>
<span className="text-sm font-bold italic">14</span>
</div>
<div className="flex flex-col">
<span className="text-[10px] text-[#98ce8d] uppercase">Tkl</span>
<span className="text-sm font-bold italic">42</span>
</div>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-[#12230f] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
<span className="ml-2 text-xs font-bold text-white/40">RELEASE</span>
</label>
</div>
</div>
</div>
</div>
</section>
{/* Right: Trade Market */}
<section className="xl:col-span-7 flex flex-col bg-[#1a2e16]/30 rounded-xl border border-[#274b20] overflow-hidden">
<div className="p-5 border-b border-[#274b20] space-y-4">
<div className="flex items-center justify-between">
<h2 className="text-xl font-bold flex items-center gap-2">
<span className="material-symbols-outlined text-primary">shopping_cart</span>
                            Trade Market
                        </h2>
<div className="flex gap-2">
<button className="px-3 py-1 rounded-full text-xs font-bold bg-[#12230f] border border-[#274b20] hover:border-primary">All Positions</button>
<button className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-black">FWD</button>
<button className="px-3 py-1 rounded-full text-xs font-bold bg-[#12230f] border border-[#274b20] hover:border-primary text-[#98ce8d]">MID</button>
<button className="px-3 py-1 rounded-full text-xs font-bold bg-[#12230f] border border-[#274b20] hover:border-primary text-[#98ce8d]">DEF</button>
</div>
</div>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#98ce8d] scale-75">search</span>
<input className="w-full bg-[#12230f] border border-[#274b20] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-[#98ce8d]/40 shadow-inner" placeholder="Search players, clubs or positions..." type="text"/>
</div>
</div>
<div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
{/* Market Card 1 */}
<div className="bg-[#1a2e16] border border-[#274b20] rounded-xl overflow-hidden group hover:border-primary/40 transition-all flex flex-col">
<div className="h-32 bg-cover bg-center relative" data-alt="Football player celebration" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDo9373wmHch7E-94AsGKj4PBbneIJDIctvDfYnGD37OLT4Ti5FGnEeoObW6dymeqZ69iE_ywaOuBnIBysfQkncMgM4WDOCx8txV57W93AdaVXjDzXAb5PnU4ylgtSDVRO2mu1nk4lG7Hx4J0rmoZgDtd5j5t7QdsGbsl7WyZsmY9lEH5ZnEnBOcj3LujDmWH_X4N-Lo5HeoV2fSHIYo_bf7WPJU0keNvGN04A6ZfUeE1LQTMq6cDD7WP4dcBo-AiFUT7T_n4Ple6Y')"}}>
<div className="absolute inset-0 bg-gradient-to-t from-[#1a2e16] to-transparent"></div>
<div className="absolute bottom-2 left-3">
<h4 className="font-bold text-lg">Kylian Mbappé</h4>
<span className="text-[10px] text-primary font-bold uppercase tracking-widest">Real Madrid</span>
</div>
<div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-primary text-black text-[10px] font-black italic">
                                S2 ELITE
                            </div>
</div>
<div className="p-4 flex flex-col flex-1">
<div className="flex justify-between items-center mb-4">
<div className="flex gap-4">
<div className="text-center">
<div className="text-[10px] text-[#98ce8d] uppercase">Rating</div>
<div className="font-bold">92</div>
</div>
<div className="text-center">
<div className="text-[10px] text-[#98ce8d] uppercase">Form</div>
<div className="font-bold text-primary">A+</div>
</div>
</div>
<div className="text-right">
<div className="text-xs text-[#98ce8d]">Valuation</div>
<div className="font-bold text-lg">€22.0M</div>
</div>
</div>
<button className="w-full py-2.5 bg-primary/10 border border-primary/40 text-primary rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-primary hover:text-black transition-all">
                                Propose Trade
                            </button>
</div>
</div>
{/* Market Card 2 */}
<div className="bg-[#1a2e16] border border-[#274b20] rounded-xl overflow-hidden group hover:border-primary/40 transition-all flex flex-col">
<div className="h-32 bg-cover bg-center relative" data-alt="Dynamic sports player photography" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZNv22KZN6Ji3dz_1v-dzyeSslPyTkLp3-svN76in0uc7FbUhytPsm-7_I7l9WA85rxnCENaNGvrKGsNDaw-AK4Z27vbiV955E-2ZOetVf2aTd3-UR92T48PsXDWtHJKbNgYXEiuDA1j7wBEiNG8el-F4YD6dr4xNLckmwMlAQr0PWw45c6q2SYJzR7CyyqrtW-JYlCMPhYW8_aYur0cbaq6B_6fw90aSkw9ejBM8--G4I-9ZBUTa6wOlz1M8M-uiwo-RrgYf7IzI')"}}>
<div className="absolute inset-0 bg-gradient-to-t from-[#1a2e16] to-transparent"></div>
<div className="absolute bottom-2 left-3">
<h4 className="font-bold text-lg">Mohamed Salah</h4>
<span className="text-[10px] text-primary font-bold uppercase tracking-widest">Liverpool</span>
</div>
</div>
<div className="p-4 flex flex-col flex-1">
<div className="flex justify-between items-center mb-4">
<div className="flex gap-4">
<div className="text-center">
<div className="text-[10px] text-[#98ce8d] uppercase">Rating</div>
<div className="font-bold">89</div>
</div>
<div className="text-center">
<div className="text-[10px] text-[#98ce8d] uppercase">Form</div>
<div className="font-bold">B+</div>
</div>
</div>
<div className="text-right">
<div className="text-xs text-[#98ce8d]">Valuation</div>
<div className="font-bold text-lg">€15.4M</div>
</div>
</div>
<button className="w-full py-2.5 bg-primary/10 border border-primary/40 text-primary rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-primary hover:text-black transition-all">
                                Propose Trade
                            </button>
</div>
</div>
{/* Market Card 3 */}
<div className="bg-[#1a2e16] border border-[#274b20] rounded-xl overflow-hidden group hover:border-primary/40 transition-all flex flex-col">
<div className="h-32 bg-cover bg-center relative" data-alt="Football match action background" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBb5Y0-c6MmeIkRydML_MZiPJVHVxjxHTYfn6IqtHjftE9b11sdhnriDmDUpA_dUPUL_noTbEiEd8l8qs2KGwE-mwLGZDd_PEs1xNLUoE2HdSjN7F9BC6xqqS0AWhhSI0jMhfDzva35tzJFFHDUYLtKJtUHqpIKjSNl2XnSDotDe0riJmod7YC1ShilUr3jJau-W7UM60jfgN-rN1rh7mAKyPFzTGjazL0XoUJ0n5lkKi8nxu4tcdOwSNe7ntNNM1RsVsrtWTJY2dY')"}}>
<div className="absolute inset-0 bg-gradient-to-t from-[#1a2e16] to-transparent"></div>
<div className="absolute bottom-2 left-3">
<h4 className="font-bold text-lg">Harry Kane</h4>
<span className="text-[10px] text-primary font-bold uppercase tracking-widest">Bayern Munich</span>
</div>
</div>
<div className="p-4 flex flex-col flex-1">
<div className="flex justify-between items-center mb-4">
<div className="flex gap-4">
<div className="text-center">
<div className="text-[10px] text-[#98ce8d] uppercase">Rating</div>
<div className="font-bold">90</div>
</div>
<div className="text-center">
<div className="text-[10px] text-[#98ce8d] uppercase">Form</div>
<div className="font-bold text-primary">A</div>
</div>
</div>
<div className="text-right">
<div className="text-xs text-[#98ce8d]">Valuation</div>
<div className="font-bold text-lg">€17.8M</div>
</div>
</div>
<button className="w-full py-2.5 bg-primary/10 border border-primary/40 text-primary rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-primary hover:text-black transition-all">
                                Propose Trade
                            </button>
</div>
</div>
{/* Market Card 4 */}
<div className="bg-[#1a2e16] border border-[#274b20] rounded-xl overflow-hidden group hover:border-primary/40 transition-all flex flex-col">
<div className="h-32 bg-cover bg-center relative" data-alt="Abstract soccer stadium lights pattern" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCPI2ZKlkEf5to3bJjshV4cyZBkUAJCLNFIBBbNuM0JkUTVi8qFXVIjh0MnlhlHDftEoOmH4mNmjU0QwCFgK4fYa59hyCHi3J-TCgX91SVq69u1g1s84CFN1MPWry9PTMXrUqz0y5YYwr3YUksQciqDmXDJ40Jry4xQzf7wROPMigNXGGZA6zYmQxZ7x3fnJgns01DgF3HlW7dy_6_MHJd4J7KkrnvK_BGZl_YAFKr4qH-phPUemk0lNr_PdYrWSFJ5BuhkEwzDy30')"}}>
<div className="absolute inset-0 bg-gradient-to-t from-[#1a2e16] to-transparent"></div>
<div className="absolute bottom-2 left-3">
<h4 className="font-bold text-lg">Robert Lewandowski</h4>
<span className="text-[10px] text-primary font-bold uppercase tracking-widest">FC Barcelona</span>
</div>
</div>
<div className="p-4 flex flex-col flex-1">
<div className="flex justify-between items-center mb-4">
<div className="flex gap-4">
<div className="text-center">
<div className="text-[10px] text-[#98ce8d] uppercase">Rating</div>
<div className="font-bold">88</div>
</div>
<div className="text-center">
<div className="text-[10px] text-[#98ce8d] uppercase">Form</div>
<div className="font-bold">B</div>
</div>
</div>
<div className="text-right">
<div className="text-xs text-[#98ce8d]">Valuation</div>
<div className="font-bold text-lg">€14.2M</div>
</div>
</div>
<button className="w-full py-2.5 bg-primary/10 border border-primary/40 text-primary rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-primary hover:text-black transition-all">
                                Propose Trade
                            </button>
</div>
</div>
</div>
</section>
</div>
{/* Trade Activity Section */}
<section className="mt-4">
<h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#98ce8d] mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-xs">sync_alt</span>
                Recent Trade Activity
            </h3>
<div className="flex gap-4 overflow-x-auto pb-4">
<div className="flex-shrink-0 w-80 bg-[#1a2e16] border border-[#274b20] rounded-lg p-3 flex items-center gap-4">
<div className="size-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
<span className="material-symbols-outlined text-primary">pending</span>
</div>
<div>
<div className="text-xs font-bold text-primary mb-0.5">TRADE PENDING</div>
<div className="text-sm font-medium">Bellingham ⇄ Rashford</div>
<div className="text-[10px] text-[#98ce8d]">Sent to United FC • 2m ago</div>
</div>
</div>
<div className="flex-shrink-0 w-80 bg-[#1a2e16] border border-primary/50 rounded-lg p-3 flex items-center gap-4">
<div className="size-10 bg-primary rounded-full flex items-center justify-center">
<span className="material-symbols-outlined text-black font-bold">check_circle</span>
</div>
<div>
<div className="text-xs font-bold text-primary mb-0.5 uppercase tracking-wider">Offer Accepted</div>
<div className="text-sm font-medium">Musiala transfer finalized</div>
<div className="text-[10px] text-[#98ce8d]">Successfully added to squad • 15m ago</div>
</div>
</div>
<div className="flex-shrink-0 w-80 bg-[#1a2e16] border border-[#274b20] rounded-lg p-3 flex items-center gap-4">
<div className="size-10 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
<span className="material-symbols-outlined text-red-500">cancel</span>
</div>
<div>
<div className="text-xs font-bold text-red-500 mb-0.5">OFFER REJECTED</div>
<div className="text-sm font-medium">Vinícius Jr bid declined</div>
<div className="text-[10px] text-[#98ce8d]">Real Galacticos asking for more • 45m ago</div>
</div>
</div>
<div className="flex-shrink-0 w-80 bg-[#1a2e16] border border-[#274b20] rounded-lg p-3 flex items-center gap-4">
<div className="size-10 bg-[#98ce8d]/10 rounded-full flex items-center justify-center border border-[#98ce8d]/20">
<span className="material-symbols-outlined text-[#98ce8d]">mail</span>
</div>
<div>
<div className="text-xs font-bold text-[#98ce8d] mb-0.5 uppercase">New Incoming Offer</div>
<div className="text-sm font-medium">Inter Stars wants Rodri</div>
<div className="text-[10px] text-[#98ce8d]">Package includes €5M Cash • 1h ago</div>
</div>
</div>
</div>
</section>
</main>
{/* Bottom Sticky Bar */}
<footer className="sticky bottom-0 bg-background-dark/95 backdrop-blur-xl border-t border-[#274b20] px-6 lg:px-12 py-5 z-50">
<div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
<div className="flex items-center gap-8 text-sm">
<div className="flex flex-col">
<span className="text-[10px] uppercase text-[#98ce8d]">Active Retentions</span>
<span className="font-bold text-primary">7 Players</span>
</div>
<div className="w-px h-8 bg-[#274b20]"></div>
<div className="flex flex-col">
<span className="text-[10px] uppercase text-[#98ce8d]">Retention Cost</span>
<span className="font-bold">€42.5M</span>
</div>
<div className="w-px h-8 bg-[#274b20]"></div>
<div className="flex flex-col">
<span className="text-[10px] uppercase text-[#98ce8d]">Remaining Budget</span>
<span className="font-bold text-primary italic">€102.7M</span>
</div>
</div>
<div className="flex gap-4 w-full sm:w-auto">
<button className="flex-1 sm:flex-none px-8 py-3 bg-[#1a2e16] border border-[#274b20] hover:border-primary/60 rounded-xl font-bold transition-all uppercase tracking-widest text-xs">
                    Save Draft
                </button>
<button className="flex-1 sm:flex-none px-8 py-3 bg-primary text-black rounded-xl font-extrabold transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(43,255,0,0.3)] uppercase tracking-widest text-xs">
                    Confirm Retentions
                </button>
<Link to="/auction"><button className="hidden lg:flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold transition-all uppercase tracking-widest text-xs">
                    Ready for Auction
                    <span className="material-symbols-outlined scale-75">arrow_forward</span>
</button></Link>
</div>
</div>
</footer>
</div>

  );
};

export default Preacution_phase;