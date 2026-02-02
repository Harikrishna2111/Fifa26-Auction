import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";
import io from "socket.io-client";
import { API_URL } from "../config";

const Lobby = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auctionId = searchParams.get("auction_id");
  const joinCode = searchParams.get("join_code");
  const urlTeamName = searchParams.get("team_name");

  const [lobbyData, setLobbyData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [socket, setSocket] = useState(null);
  const isNavigatingToAuction = React.useRef(false);

  useEffect(() => {
    if (!auctionId) return;

    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);

    // Fetch lobby data and participants
    const fetchLobby = () => {
      fetch(`${API_URL}/api/lobby/${auctionId}`)
        .then(res => res.json())
        .then(data => setLobbyData(data));

      fetch(`${API_URL}/api/lobby/${auctionId}/participants`)
        .then(res => res.json())
        .then(data => setParticipants(data));
    };

    fetchLobby();
    const interval = setInterval(fetchLobby, 3000);

    // Connect to socket with explicit websocket transport for stability
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });
    setSocket(newSocket);

    // Ensure we join the room only after connection is established
    newSocket.on("connect", () => {
      console.log("Connected to socket:", newSocket.id);
      console.log("Joining room:", `lobby_${auctionId}`);
      newSocket.emit("join_lobby", {
        auction_id: auctionId,
        user_id: user.id,
        team_name: urlTeamName || user.username || "Your Team"
      });
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket Connection Error:", err);
    });

    // Fallback in case it's already connected (re-renders)
    if (newSocket.connected) {
      newSocket.emit("join_lobby", {
        auction_id: auctionId,
        user_id: user.id,
        team_name: urlTeamName || user.username || "Your Team"
      });
    }

    newSocket.on("user_joined", (data) => {
      fetchLobby(); // Refresh when someone joins
    });

    newSocket.on("user_left", (data) => {
      fetchLobby(); // Refresh when someone leaves
    });

    newSocket.on("auction_started", (data) => {
      console.log("Auction started event received:", data);
      isNavigatingToAuction.current = true;
      // Logic: Season 1 -> Auction Page, Season >= 2 -> Pre-Auction Phase
      if (data && data.season >= 2) {
        navigate(`/preauction_phase?auction_id=${auctionId}`);
      } else {
        navigate(`/auction?auction_id=${auctionId}`);
      }
    });

    return () => {
      clearInterval(interval);
      if (!isNavigatingToAuction.current) {
        newSocket.emit("leave_lobby", {
          auction_id: auctionId,
          user_id: user.id
        });
      }
      newSocket.close();
    };
  }, [auctionId, navigate]);

  const handleStartAuction = () => {
    if (socket && socket.connected) {
      console.log("Emitting start_auction for ID:", auctionId);
      socket.emit("start_auction", { auction_id: auctionId });
      isNavigatingToAuction.current = true;

      // Admin Logic: Navigate slightly delayed to ensure emit is sent
      setTimeout(() => {
        if (lobbyData && lobbyData.season >= 2) {
          navigate(`/preauction_phase?auction_id=${auctionId}`);
        } else {
          navigate(`/auction?auction_id=${auctionId}`);
        }
      }, 500);
    } else {
      console.error("Socket not connected. Cannot start auction.");
      alert("Connection to server lost. Please refresh the page.");
    }
  };

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

        <Navbar />
        <main className="flex flex-col items-center flex-1 px-4 py-10">
          <div className="max-w-[1000px] w-full flex flex-col items-center">
            {/* Headline & Stats */}
            <div className="flex flex-col items-center gap-2 mb-10">
              <h1 className="text-white tracking-tight text-4xl md:text-5xl font-black leading-tight text-center">{lobbyData?.name || "Loading..."}</h1>
              <div className="mt-6 bg-primary/10 border border-primary/30 rounded-xl p-4 flex flex-col items-center min-w-[200px]" style={{ boxShadow: '0 0 15px rgba(13, 242, 89, 0.4)' }}>
                <p className="text-primary/70 text-xs font-bold uppercase tracking-widest">Lobby Code</p>
                <p className="text-primary text-3xl font-black tracking-widest">{lobbyData?.join_code || joinCode || "N/A"}</p>
              </div>
            </div>
            {/* Section Header */}
            <div className="w-full flex justify-between items-end px-4 mb-4">
              <h2 className="text-white text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">groups</span>
                Joined Managers ({lobbyData?.player_count || 0}/20)
              </h2>
              <span className="text-white/40 text-sm font-medium">Waiting for players to join...</span>
            </div>
            {/* Image Grid (Managers) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
              {participants.map((participant, idx) => (
                <div key={participant.user_id} className="flex flex-col items-center gap-3">
                  <div className="relative group">
                    {idx === 0 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                        <span className="material-symbols-outlined text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">workspace_premium</span>
                      </div>
                    )}
                    <div className={`size-24 rounded-full ${idx === 0 ? 'border-4 border-primary' : 'border-2 border-white/20'} p-1 relative overflow-hidden bg-background-dark hover:border-white/40 transition-all`} style={idx === 0 ? { boxShadow: '0 0 15px rgba(13, 242, 89, 0.4)' } : {}}>
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-background-dark flex items-center justify-center">
                        <span className="text-white text-2xl font-black">{participant.team_name?.charAt(0) || 'U'}</span>
                      </div>
                    </div>
                    {idx === 0 && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#FFD700] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Admin</div>
                    )}
                  </div>
                  <p className={`${idx === 0 ? 'text-primary' : 'text-white/80'} text-sm font-bold truncate max-w-[120px]`}>{participant.team_name}</p>
                </div>
              ))}
              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 20 - participants.length) }).map((_, idx) => (
                <div key={`empty-${idx}`} className="flex flex-col items-center gap-3 opacity-30">
                  <div className="size-24 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">person_add</span>
                  </div>
                  <p className="text-white/40 text-xs font-medium italic">Empty Slot</p>
                </div>
              ))}
            </div>
            {/* Action Section */}
            <div className="mt-16 w-full flex flex-col items-center gap-6">
              <p className="text-primary font-bold text-lg flex items-center gap-3" style={{ animation: 'pulse-soft 2s infinite ease-in-out' }}>
                <span className="size-2 rounded-full bg-primary inline-block"></span>
                Waiting for admin to start auction...
              </p>
              {/* High Impact Start Button (Visible for Host Only) */}
              {lobbyData?.host_id === JSON.parse(localStorage.getItem('user') || '{}').id ? (
                <button onClick={handleStartAuction} className="group relative flex min-w-[320px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-16 px-8 bg-primary text-background-dark text-xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(13,242,89,0.5)]">
                  <span className="flex items-center gap-2">
                    Start Auction
                    <span className="material-symbols-outlined font-bold">play_arrow</span>
                  </span>
                </button>
              ) : (
                <div className="text-white/60 text-base font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">schedule</span>
                  Waiting for host to start...
                </div>
              )}
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
