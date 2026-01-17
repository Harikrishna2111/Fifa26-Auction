import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {  

const user = JSON.parse(localStorage.getItem("user"));
const isLoggedIn = !!user;
const userName = user?.fullname;
const userRole = user?.role || "Pro Manager";





  const navigate = useNavigate();

  const navLinkClasses = ({ isActive }) =>
    `text-sm font-medium transition-colors pb-1 ${
      isActive
        ? "text-primary border-b-2 border-primary"
        : "hover:text-primary"
    }`;

const handleLogout = () => {
  localStorage.removeItem("user");
  navigate("/login");
};

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 glass-nav border-b border-white/10 dark">
        <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-background-dark font-bold">
                sports_soccer
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight uppercase italic">
              Footy<span className="text-primary">Auction</span>
            </h1>
          </div>

          {/* Nav Links - Only show when not logged in */}
          {!isLoggedIn && (
            <div className="hidden md:flex items-center gap-10">
              <NavLink to="/" end className={navLinkClasses}>
                Home
              </NavLink>
              <NavLink to="/player_stats" className={navLinkClasses}>
                Players
              </NavLink>
              <NavLink to="/auction_rules" className={navLinkClasses}>
                Auction Rules
              </NavLink>
              <NavLink to="/discover" className={navLinkClasses}>
                Discover
              </NavLink>
            </div>
          )}

          {/* Auth Buttons or User Profile */}
          {isLoggedIn ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold">{userName}</p>
                  <p className="text-[10px] text-primary uppercase font-black tracking-wider">{userRole}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 border border-primary/30 flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-primary">person</span>
                </div>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">logout</span>
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <NavLink to="/login">
                <button className="px-5 py-2 text-sm font-bold hover:text-primary transition-colors">
                  Login
                </button>
              </NavLink>
              <NavLink to="/login">
                <button className="bg-primary text-background-dark px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-white transition-all">
                  Sign Up
                </button>
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
