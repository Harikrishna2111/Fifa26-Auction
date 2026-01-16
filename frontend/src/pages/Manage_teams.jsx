import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Manage_teams = () => {
  return (<>
    <div className="bg-background-light dark:bg-background-dark font-display text-white transition-colors duration-300">
<div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden stadium-vignette">

 <Navbar isLoggedIn={true} userName="Alex Smith" userRole="Pro Manager" />

<main className="flex-1 px-6 md:px-20 py-8 max-w-[1440px] mx-auto w-full">
{/* Breadcrumbs */}
<div className="flex items-center gap-2 mb-4">
<a className="text-primary/70 text-sm font-medium hover:underline" href="#">Dashboard</a>
<span className="text-white/30 text-xs material-symbols-outlined">chevron_right</span>
<span className="text-white text-sm font-medium">Manage Teams</span>
</div>
{/* Page Heading */}
<div className="flex flex-wrap justify-between items-end gap-4 mb-10">
<div className="flex flex-col gap-2">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-3xl">groups</span>
<h1 className="text-white text-4xl font-black tracking-tight">Manage All Teams</h1>
</div>
<p className="text-white/60 text-base max-w-md">Oversee, analyze, and optimize your global football portfolio from a single command center.</p>
</div>
<button className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all">
<span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
<span>Back to Dashboard</span>
</button>
</div>
{/* Tabs Section */}
<div className="flex border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
<button className="flex items-center gap-2 border-b-2 border-primary text-primary px-6 py-4 font-bold text-sm">
<span>All Squads</span>
<span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px]">12</span>
</button>
<button className="flex items-center gap-2 border-b-2 border-transparent text-white/50 hover:text-white px-6 py-4 font-bold text-sm transition-colors">
<span>Active Auctions</span>
<span className="bg-white/10 text-white/50 px-2 py-0.5 rounded text-[10px]">4</span>
</button>
<button className="flex items-center gap-2 border-b-2 border-transparent text-white/50 hover:text-white px-6 py-4 font-bold text-sm transition-colors">
<span>Idle Rosters</span>
<span className="bg-white/10 text-white/50 px-2 py-0.5 rounded text-[10px]">8</span>
</button>
</div>
{/* Management Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
{/* Active Team Card 1 */}
<div className="flex flex-col bg-surface-dark border-t-4 border-primary rounded-xl overflow-hidden card-glow-green transition-all duration-300">
<div className="p-6 flex flex-col h-full">
<div className="flex justify-between items-start mb-6">
<div className="flex flex-col">
<span className="text-[10px] font-black tracking-widest text-primary mb-1 uppercase">UK • Premier League</span>
<h3 className="text-xl font-black text-white uppercase tracking-tight">London Lions</h3>
</div>
<span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
                                ACTIVE
                            </span>
</div>
{/* Player Avatar Stack */}
<div className="flex items-center -space-x-3 mb-8">
<div className="size-10 rounded-full border-2 border-surface-dark bg-cover bg-center" data-alt="Player 1 avatar" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCRVtxzmyp7lvBkzU-NVfyPT_89whmbRtNM4lNjlf50iv6yoQsZdzmnGTUZmhJ3Bbnms85wUx91y4vgIiMFIhw7I6Qy4zRVY_1_-ThidvuAh54ytfJOYoAxaukYILFUQUCnYm4H9GokfijzkeTnPGus_DFgQkmdWiIgUNBt6Hpdv_DtpTp1mx60E4dXpJeUD98F-4O45ucAsIQzVI203_ADLfZ-rf38bkkugagM5IZbvvSSzgp4_bKQwsB6ARn3nYuLumaUexp56Gk')"}}></div>
<div className="size-10 rounded-full border-2 border-surface-dark bg-cover bg-center" data-alt="Player 2 avatar" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBZxkQYzPo9RXAT7QSoZn-cIfLr-QJFP1hm3UChJcVHB_rAWx_KoO0NC29hhJRJM3WSqjHX4BHRlmzOW4lu2xRd1ZokY2uTV1HPV22rmNGlpuRjtf1ovyFD1kvG5ZoX9cvnBGKbutsGrpTbSg2KmMYHW1y42n4Wg-ykf-bLpZuzI0YXdbDWNJTLkOSDXNlgoZdtaZLQAAyJuRp7p13VApzTp_tz0UNROovwV4aGNU8SAhF1nMA18EVmvj67gh6bkv9FbhW0ielfnew')"}}></div>
<div className="size-10 rounded-full border-2 border-surface-dark bg-cover bg-center" data-alt="Player 3 avatar" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARXxQifGEYGgRtiMt81OFpEdjVUIIs52DFMV5XbSTl2wmu7vWGOAs6TZcLBcgDxDPR7BO_UswBO9jhjdXfuaiw8diIg2DpuHFs3og334IdNII7gxe83AO5wFRbZ6carbNXl7oDPzfK-RRQGBqPXyxA7thFu8koNt9yHuiIGrbC-EASr4skvKqxEAtF-N87oSaqaSzZfOixYFqZUgi2IgZd3ycMTQjFZAUshImOfoEmHvoCVSY_jNQ3sM182DrfRbqS_dt5xcWmZb8')"}}></div>
<div className="size-10 rounded-full border-2 border-surface-dark bg-cover bg-center" data-alt="Player 4 avatar" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAb3eLZtX_Di5coIJ3PcMow9IDrIJV1ivXdNrjP9PfxkQtWlwRgqTVBl7H7F78VPhFQLkWlYWWggr47SDAKoevYkJSdJfGvvCduI8mNitO4N-iiQpROoPgLCtTPrnUgcrabglIRQpjUPfS-M0cBSnysILfv58U654BKWpi6nEzJJJzUf-jZjUnQ0Lf_-WaOtINrnAVn6LooXf9j4hRq8Xb7-u5sxi_Ns_mARC5C4H9eN_FU8jUMdL-LeqqRVhKPe-A-z1TgRiaJty0')"}}></div>
<div className="size-10 rounded-full border-2 border-surface-dark bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                +7
                            </div>
</div>
{/* Stats Row */}
<div className="grid grid-cols-2 gap-4 mb-8">
<div className="bg-white/5 rounded-lg p-3">
<p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Team OVR</p>
<p className="text-2xl font-black text-white">88</p>
</div>
<div className="bg-white/5 rounded-lg p-3">
<p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Market Value</p>
<p className="text-2xl font-black text-primary">$420M</p>
</div>
</div>
{/* Actions */}
<div className="flex flex-col gap-2 mt-auto">
<a href="formation_settings.html"><button className="w-full py-3 bg-primary text-background-dark font-black text-sm rounded-lg hover:brightness-110 transition-all uppercase tracking-wider">View Squad</button></a>
</div>
</div>
</div>
{/* Active Team Card 2 */}
<div className="flex flex-col bg-surface-dark border-t-4 border-primary rounded-xl overflow-hidden card-glow-green transition-all duration-300">
<div className="p-6 flex flex-col h-full">
<div className="flex justify-between items-start mb-6">
<div className="flex flex-col">
<span className="text-[10px] font-black tracking-widest text-primary mb-1 uppercase">France • Ligue 1</span>
<h3 className="text-xl font-black text-white uppercase tracking-tight">Paris Elite</h3>
</div>
<span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
                                ACTIVE
                            </span>
</div>
<div className="flex items-center -space-x-3 mb-8">
<div className="size-10 rounded-full border-2 border-surface-dark bg-cover bg-center" data-alt="Player avatar" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC7gmSeATKWFVhRr-kzW0JugQJeUv-YU6oeWS0YMOSBwchr8TvCvbDx07eqoZSlAzSGHHCN6IVk5XytxjAqScIX0KzUcmOmOdJV2HtPOZebhyD8GqM9lynSHLJ5IeohqXyFpHhCLd4YHWaknVWCST0g-8LEtY8pQDkEFzyrwIP9OlP-UxYBFqg2rNUC1QQuADPvKIlH4S9uYwril9gVG_yaFNZ8hwa20BoLxsR5SBDbvqXqWbSSf53Cq3Sguo8zjI8k5pI8Xm2eBq8')"}}></div>
<div className="size-10 rounded-full border-2 border-surface-dark bg-cover bg-center" data-alt="Player avatar" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDxmSql79rbqSnOO43Mp_BK_8na9hb1qaNyV9X0vI7NSbW3Md-HwFDxYu2Nu3cvt9tLbLRKArHXZYt3xkFx_w-ggFDS6-nvpt0h99DVqb6bkIgZ6tjw14vGKM86pxCgRmfZtPX0DMxz4OG6hRfmv2A-DfOxMhVX-_XQboKhNKiD52DXw8hIRB70fGTICE_QyrMbyUjwLaZJLm5VM71bTMq9Vnmw6ope0eBVCvthCsV2AVRLGYh3uCuIp8Ke42TTCBGKHxYsQQKuCQM')"}}></div>
<div className="size-10 rounded-full border-2 border-surface-dark bg-cover bg-center" data-alt="Player avatar" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBUHE2ANF77MnH7r-zqtSKz50Cpvd7kXcFTgFEL0sMalOtozk7JFxkhXtZh6lCR-9mj9RZfWN4DEaXzEXOGFyPeMM7W7b0afReugjWvke507zeaeH8JNpoGRdvV_k5IjzAgWmlix68Yv8-He4i2ugDW-38Jcwn7il8NorNScgxD75RiSepMeK6_Uk-1G64Y5Z614tGphoQ92EsC8bM1sUzddk3z9fy5P2SvostyQfeTxm_rRfmmpOqVJeaYhDcUqrgS2kyik7C1mDo')"}}></div>
<div className="size-10 rounded-full border-2 border-surface-dark bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">+12</div>
</div>
<div className="grid grid-cols-2 gap-4 mb-8">
<div className="bg-white/5 rounded-lg p-3">
<p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Team OVR</p>
<p className="text-2xl font-black text-white">91</p>
</div>
<div className="bg-white/5 rounded-lg p-3">
<p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Market Value</p>
<p className="text-2xl font-black text-primary">$550M</p>
</div>
</div>
<div className="flex flex-col gap-2 mt-auto">
<button className="w-full py-3 bg-primary text-background-dark font-black text-sm rounded-lg hover:brightness-110 transition-all uppercase tracking-wider">View Squad</button>
</div>
</div>
</div>
{/* Idle Team Card 1 */}
<div className="flex flex-col bg-surface-dark border-t-4 border-blue-500 rounded-xl overflow-hidden card-glow-blue transition-all duration-300 opacity-80 hover:opacity-100">
<div className="p-6 flex flex-col h-full">
<div className="flex justify-between items-start mb-6">
<div className="flex flex-col">
<span className="text-[10px] font-black tracking-widest text-blue-500 mb-1 uppercase">Spain • La Liga</span>
<h3 className="text-xl font-black text-white uppercase tracking-tight text-white/70">Madrid Kings</h3>
</div>
<span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold">
                                IDLE
                            </span>
</div>
<div className="flex items-center -space-x-3 mb-8">
<div className="size-10 rounded-full border-2 border-surface-dark bg-cover bg-center grayscale" data-alt="Player avatar" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAWI3CRUdplC15vMQoKlmaJ1KHGttJruAIe7oakSEYZ2QcpfmH3EjqLotowH8wcGHZARe89iD7mPjqA_aBjt8mPWfOe5L1kbC8bcDkyw9a7REljbwVsAIXAweB5vjGRFPrcj-U37ytoYE5XE2teEU2O_d5gfhmD5Hm3fp6SXIfGREND9ZrVahvKscdZqEXz1a_V1fC9iXsdjxFo8WI_5SzMnxgyCfT7iVWK-FiT8cj2oixTSTy9478itNMEctF3O5V2ltfOqpk3g-c')"}}></div>
<div className="size-10 rounded-full border-2 border-surface-dark bg-cover bg-center grayscale" data-alt="Player avatar" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCPIvIvJEm413yZP4UD4rH6_rwdKdTS6n8CO1Of058G6Ymz4XzcQjyyDX8kM0x6uVybD5C3--R7OkJk7fS7TT5VwQSteiDDILb_lZVkwe6Ho-D7PV-pOzuou0xBeYcJ0Zeje0YrWxjAUG6n0PiUI4EyTbNGn2zjbOyqJbyGIV9jnks5RQOKqGGCGHtY9D8FXdsbk-Hx2qQ7x-zZG_lSz1_c6Dtp2F535lETO28oKtes0X77plET8HbxlEXauMW2Tcz9ua9XR53t3Ew')"}}></div>
<div className="size-10 rounded-full border-2 border-surface-dark bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-500">+3</div>
</div>
<div className="grid grid-cols-2 gap-4 mb-8">
<div className="bg-white/5 rounded-lg p-3">
<p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Team OVR</p>
<p className="text-2xl font-black text-white/50">84</p>
</div>
<div className="bg-white/5 rounded-lg p-3">
<p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Market Value</p>
<p className="text-2xl font-black text-blue-500">$310M</p>
</div>
</div>
<div className="flex flex-col gap-2 mt-auto">
<button className="w-full py-3 bg-blue-500 text-white font-black text-sm rounded-lg hover:brightness-110 transition-all uppercase tracking-wider">View Squad</button>
</div>
</div>
</div>
{/* Idle Team Card 2 */}
<div className="flex flex-col bg-surface-dark border-t-4 border-blue-500 rounded-xl overflow-hidden card-glow-blue transition-all duration-300 opacity-80 hover:opacity-100">
<div className="p-6 flex flex-col h-full">
<div className="flex justify-between items-start mb-6">
<div className="flex flex-col">
<span className="text-[10px] font-black tracking-widest text-blue-500 mb-1 uppercase">Germany • Bundesliga</span>
<h3 className="text-xl font-black text-white uppercase tracking-tight text-white/70">Berlin Wall</h3>
</div>
<span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold">
                                IDLE
                            </span>
</div>
<div className="flex items-center -space-x-3 mb-8">
<div className="size-10 rounded-full border-2 border-surface-dark bg-cover bg-center grayscale" data-alt="Player avatar" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCiGw1iOR7kKjuJQmdN7b0UnSQXf_laSH3rSIhJ0W91P2dnJ5WxNnYB8ZibVOPspg6CgmCzkkJSyTbEmfnM0NAANe6CJv_ENgvJUDjFGT-o3r3vUsiRUynApo9MLErSO3D_3skWKOJGNSsDhpvrjVeq0e4E0rwTXLJrAJXcpGv2CiRsTXTMWTNv2Gz_JzTp-SClxBS-MXQ-pC1YOHMOnihzxPtdrdEjVYW8eTlOK3FR-7N-LFjmAMt58H8cF9KHLRhZUvlwZuRqglE')"}}></div>
<div className="size-10 rounded-full border-2 border-surface-dark bg-cover bg-center grayscale" data-alt="Player avatar" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBMnjJcxcZPlqhbiRX3SrAGs-bxg5EinrwkOmMtA-StNi3hpYD1H4dGCV1K0GiFl-_WBN5o00Gr2kTVe7QZ3xcA_u2icURWqLit3wqqzRQCNOmndu3TCuXJnvQUbBmuBLKVuUW9QU6SR0qHId-1Wn9oiI6l0QnmHHIoNTgwDIw5ynR3TO_cl2Kh1NX-vIi1MBWYWF0ajcACCGOZ_30yT4XqcvWC1eK0whU2unbQ61dQ7Z6q529Ca-t2jA8fneksSWccxN1UO7M2rWE')"}}></div>
<div className="size-10 rounded-full border-2 border-surface-dark bg-cover bg-center grayscale" data-alt="Player avatar" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDkqu3fZhxkizf3WnSKeh9_XCFFL64Viy_V2ux2VNuRpZmZrqxthdDwXtM7bBNfD4wLDIQEhzevnYQXFK4hnt5asdRNpWRZ6-zxtRX-TSZGN59utn9Zccz3txowMafX1z8QhaKJgjTP7yIlCSn-rLKpJmLACNZeHtBe_eraiIqNGDCJY3rmK3t4OCb6hAz5wvGRMnU5bdd5qJvOhS4b12-RRgvvNPrzpvEKdgWn9BZzNen-3nIccCi2bQaw-6I7aVbIZZQNZYO-USI')"}}></div>
<div className="size-10 rounded-full border-2 border-surface-dark bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-500">+15</div>
</div>
<div className="grid grid-cols-2 gap-4 mb-8">
<div className="bg-white/5 rounded-lg p-3">
<p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Team OVR</p>
<p className="text-2xl font-black text-white/50">82</p>
</div>
<div className="bg-white/5 rounded-lg p-3">
<p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Market Value</p>
<p className="text-2xl font-black text-blue-500">$280M</p>
</div>
</div>
<div className="flex flex-col gap-2 mt-auto">
<button className="w-full py-3 bg-blue-500 text-white font-black text-sm rounded-lg hover:brightness-110 transition-all uppercase tracking-wider">View Squad</button>
</div>
</div>
</div>
{/* Create New Team Card */}
<div className="flex flex-col bg-white/5 border-2 border-dashed border-white/20 rounded-xl overflow-hidden hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group cursor-pointer min-h-[400px]">
<div className="p-6 flex flex-col h-full items-center justify-center text-center">
<div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
<span className="material-symbols-outlined text-4xl text-white/40 group-hover:text-primary transition-colors">add</span>
</div>
<h3 className="text-xl font-black text-white uppercase mb-2">Create New Squad</h3>
<p className="text-white/40 text-sm max-w-[200px] mb-8">Establish a new franchise and begin scouting top tier talent.</p>
<Link to="/create-team">
<button className="px-8 py-3 bg-white/10 text-white font-black text-sm rounded-lg group-hover:bg-primary group-hover:text-background-dark transition-all uppercase tracking-wider">Start Drafting</button>
</Link>
</div>
</div>
</div>
</main>
<Footer />
</div>
</div>
 </> );
}


export default Manage_teams;