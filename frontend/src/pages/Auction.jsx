import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import Navbar from '../components/Navbar';
import io from 'socket.io-client';

// --- 3D GAVEL COMPONENT ---
const GavelModel = ({ result }) => {
  const group = useRef();
  const pivotRef = useRef();
  const startTime = useRef(null);

  const bandColor = result === 'sold' ? "#ffd700" : "#999999";

  useFrame((state) => {
    if (!pivotRef.current) return;

    // Initialize start time on first frame to ensure consistency
    if (startTime.current === null) {
      startTime.current = state.clock.getElapsedTime();
    }

    const t = state.clock.getElapsedTime() - startTime.current;

    let rotZ = 0;

    // ANIMATION SEQUENCE (ONE TAP)
    // 0.0s - 0.5s: Raise Gavel (0 -> 45 deg)
    // 0.5s - 0.6s: Strike! (45 -> -10 deg)
    // 0.6s+: Stay down (with small bounce)

    if (t < 0.5) {
      // Raise up
      rotZ = THREE.MathUtils.lerp(0, Math.PI / 4, t / 0.5);
    } else if (t < 0.6) {
      // STRIKE DOWN FAST!
      const strikePhase = (t - 0.5) / 0.1;
      rotZ = THREE.MathUtils.lerp(Math.PI / 4, -0.1, strikePhase);
    } else {
      // Settle at -0.1
      rotZ = -0.1;
      // Small rebound effect
      if (t < 1.0) {
        rotZ += Math.sin((t - 0.6) * 15) * 0.05 * (1 - (t - 0.6) / 0.4);
      }
    }

    pivotRef.current.rotation.z = rotZ;

    // Gentle float/spin for visual flair
    if (group.current) {
      group.current.rotation.y = t * 0.2;
      group.current.position.y = -0.5 + Math.sin(t) * 0.05;
    }
  });

  return (
    <group ref={group} dispose={null} scale={1.0} position={[0, -0.5, 0]}>
      {/* Pivot Group for Animation */}
      <group ref={pivotRef} position={[1, -1, 0]}>
        {/* Offset the model so handle end is at pivot (0,0,0) */}
        <group position={[-1, 1, 0]}>
          {/* Handle */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 3, 32]} />
            <meshStandardMaterial color="#4a2c18" roughness={0.4} />
          </mesh>

          {/* Head */}
          <group position={[0, 2, 0]} rotation={[0, 0, Math.PI / 2]}>
            {/* Main Cylinder */}
            <mesh>
              <cylinderGeometry args={[0.4, 0.4, 1.8, 32]} />
              <meshStandardMaterial color="#3e2723" roughness={0.2} metalness={0.1} />
            </mesh>

            {/* Metal Caps */}
            <mesh position={[0, 0.95, 0]}>
              <cylinderGeometry args={[0.42, 0.4, 0.1, 32]} />
              <meshStandardMaterial color={bandColor} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.95, 0]}>
              <cylinderGeometry args={[0.4, 0.42, 0.1, 32]} />
              <meshStandardMaterial color={bandColor} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};


// --- HELPER: PLAYER CARD (Defined Outside) ---
const PlayerCard = ({ player, sizeClass, locationType, index, isDragging, isHovered, isMatch, onDragStart, onDrop, onDragOver, onDragEnd }) => {

  const getCardStyle = (rating) => {
    if (rating >= 90) return { bg: 'bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900', border: 'border-cyan-400', text: 'text-cyan-300', shadow: 'shadow-cyan-500/40' };
    if (rating >= 86) return { bg: 'bg-gradient-to-br from-[#4a3b00] via-[#3d3100] to-[#1a1400]', border: 'border-[#ffd700]', text: 'text-[#ffd700]', shadow: 'shadow-[#ffd700]/20' };
    if (rating >= 80) return { bg: 'bg-gradient-to-br from-[#424242] via-[#303030] to-[#121212]', border: 'border-[#e0e0e0]', text: 'text-[#e0e0e0]', shadow: 'shadow-white/10' };
    return { bg: 'bg-gradient-to-br from-[#3e2723] via-[#2d1b18] to-[#1a0f0d]', border: 'border-[#d7ccc8]', text: 'text-[#d7ccc8]', shadow: 'shadow-orange-900/20' };
  };

  // Render Empty Slot
  if (!player) {
    return (
      <div
        onDragOver={(e) => onDragOver(e, locationType, index)}
        onDrop={(e) => onDrop(e, locationType, index)}
        className={`${sizeClass} border-2 border-dashed border-white/10 rounded-xl bg-white/5 flex items-center justify-center transition-all duration-200 ${isHovered ? 'border-[#39ff14] bg-[#39ff14]/20' : ''}`}
      >
        <span className="text-white/20 text-xs font-bold uppercase pointer-events-none">Empty</span>
      </div>
    );
  }

  const style = getCardStyle(player.rating);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, locationType, index, player)}
      onDragOver={(e) => onDragOver(e, locationType, index)}
      onDrop={(e) => onDrop(e, locationType, index)}
      onDragEnd={onDragEnd}
      className={`
        ${sizeClass} ${style.bg} ${style.border} border-2 rounded-xl flex flex-col relative shadow-lg 
        cursor-grab active:cursor-grabbing overflow-hidden select-none
        transition-all duration-500 ease-in-out /* Smooth Transition */
        ${isDragging ? 'opacity-40 scale-95 grayscale' : 'opacity-100 hover:scale-[1.03]'}
        ${isHovered ? 'ring-4 ring-[#39ff14] scale-105 z-50' : ''}
        ${isMatch ? 'ring-2 ring-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.4)]' : ''}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-white/5 opacity-50 pointer-events-none"></div>

      {/* Match Badge */}
      {isMatch && <div className="absolute top-0 right-0 bg-[#ffd700] text-black text-[8px] font-black px-1.5 py-0.5 rounded-bl shadow z-30">MATCH</div>}

      <div className="absolute top-1.5 left-2 flex flex-col leading-none z-20 pointer-events-none">
        <span className="text-xl font-black italic text-white drop-shadow-md">{player.rating}</span>
        <span className={`text-[9px] font-bold ${style.text} uppercase tracking-widest mt-0.5`}>{player.pos}</span>
      </div>
      <div className="flex-1 flex items-end justify-center overflow-hidden relative pointer-events-none">
        <img src={player.img} alt={player.name} className="w-[85%] h-[85%] object-contain relative z-10 drop-shadow-2xl" />
      </div>
      <div className="bg-black/60 backdrop-blur-md py-1.5 text-center border-t border-white/5 relative z-20 pointer-events-none">
        <div className="text-[10px] font-black uppercase tracking-wider text-white truncate px-1">{player.name}</div>
        <div className={`text-[8px] ${style.text} font-mono font-bold opacity-90 mt-0.5`}>{player.stat}</div>
      </div>
    </div>
  );
};


const formatMoney = (amount) => {
  if (amount === undefined || amount === null) return "---";
  if (amount >= 1000000) {
    const val = amount / 1000000;
    // Show decimal only if needed (e.g. 3.5M vs 3M)
    return (Number.isInteger(val) ? val : val.toFixed(1)) + "M";
  }
  return amount.toLocaleString();
};

// Moved definitions outside component to avoid recreation/passing
const tradePool = {
  you: ["Mbappé", "De Bruyne", "Ederson", "Rice"],
  them: ["Haaland", "Vini Jr", "Allison", "Van Dijk", "Rashford"]
};

const formations = {
  "4-3-3": [{ role: "GK", left: 50, top: 85 }, { role: "LB", left: 15, top: 70 }, { role: "CB", left: 38, top: 75 }, { role: "CB", left: 62, top: 75 }, { role: "RB", left: 85, top: 70 }, { role: "CM", left: 30, top: 45 }, { role: "CM", left: 50, top: 50 }, { role: "CM", left: 70, top: 45 }, { role: "LW", left: 15, top: 15 }, { role: "ST", left: 50, top: 10 }, { role: "RW", left: 85, top: 15 }],
  "4-4-2": [{ role: "GK", left: 50, top: 85 }, { role: "LB", left: 15, top: 70 }, { role: "CB", left: 38, top: 75 }, { role: "CB", left: 62, top: 75 }, { role: "RB", left: 85, top: 70 }, { role: "LM", left: 15, top: 40 }, { role: "CM", left: 40, top: 45 }, { role: "CM", left: 60, top: 45 }, { role: "RM", left: 85, top: 40 }, { role: "ST", left: 35, top: 15 }, { role: "ST", left: 65, top: 15 }],
  "3-5-2": [{ role: "GK", left: 50, top: 85 }, { role: "CB", left: 20, top: 72 }, { role: "CB", left: 50, top: 68 }, { role: "CB", left: 80, top: 72 }, { role: "LM", left: 10, top: 40 }, { role: "CDM", left: 35, top: 50 }, { role: "CM", left: 50, top: 35 }, { role: "CDM", left: 65, top: 50 }, { role: "RM", left: 90, top: 40 }, { role: "ST", left: 35, top: 15 }, { role: "ST", left: 65, top: 15 }],
};

// --- COMPARE MODAL ---
const CompareModal = ({
  onClose,
  pitchPlayers,
  subPlayers,
  resPlayers,
  liveFormation, setLiveFormation,
  dragItem, dragOverTarget,
  handleDragStart, handleDragOver, handleDrop, handleDragEnd
}) => {
  const userObj = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userObj.id || parseInt(localStorage.getItem('userId') || '0') || 0;

  const [strategies, setStrategies] = useState([]);
  const [currentStrategyIndex, setCurrentStrategyIndex] = useState(0);
  const [activeStrategyPlayers, setActiveStrategyPlayers] = useState([]);

  const nextStrategy = () => setCurrentStrategyIndex((prev) => (prev + 1) % (strategies.length || 1));
  const prevStrategy = () => setCurrentStrategyIndex((prev) => (prev - 1 + (strategies.length || 1)) % (strategies.length || 1));

  // 1. Fetch User Strategies (Plans)
  useEffect(() => {
    fetch(`${API_URL}/api/teams/manage?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStrategies(data);
        }
      })
      .catch(err => console.error("Error fetching strategies:", err));
  }, []);

  // 2. Fetch Players for Active Strategy
  useEffect(() => {
    if (strategies.length > 0) {
      const strategy = strategies[currentStrategyIndex];
      if (strategy) {
        fetch(`${API_URL}/api/teams/${strategy.id}/players`)
          .then(res => res.json())
          .then(data => {
            setActiveStrategyPlayers(data);
          });
      }
    } else {
      setActiveStrategyPlayers([]);
    }
  }, [strategies, currentStrategyIndex]);

  // isPlayerInStrategy CHECK
  const isPlayerInStrategy = (player) => {
    if (!player) return false;
    return activeStrategyPlayers.some(p => p.name === player.name);
  };

  const currentStrategyName = strategies[currentStrategyIndex]?.name || "No Plans";

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-[95vw] h-[95vh] bg-[#0a0f0b] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/40">
          <h3 className="text-xl font-black uppercase tracking-wider italic flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-[#39ff14]">strategy</span> Squad Comparison
          </h3>
          <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition text-white"><span className="material-symbols-outlined">close</span></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Strategy List */}
          <div className="w-[28%] flex flex-col border-r border-white/10 bg-[#0e1411]">
            <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-black/20">
              <span className="text-[#39ff14] font-bold text-xs uppercase tracking-widest">My Strategy</span>
              <div className="flex gap-1">
                <button onClick={prevStrategy} className="hover:bg-white/10 rounded p-1 text-white"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/60">{currentStrategyName}</span>
                <button onClick={nextStrategy} className="hover:bg-white/10 rounded p-1 text-white"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scroll">
              <div className="text-[9px] text-white/30 font-bold uppercase mb-1 mt-2">Planned Players</div>
              {activeStrategyPlayers.length === 0 && <div className="text-white/20 text-xs italic">No players in this plan.</div>}
              {activeStrategyPlayers.map((player, idx) => {
                // Check if active strategy player is in LIVE squad
                const isMatch = [...pitchPlayers, ...subPlayers, ...resPlayers].some(p => p && p.name === player.name);
                return (
                  <div key={idx} className={`flex items-center gap-2 p-2 rounded border mb-1 ${isMatch ? 'border-[#ffd700] bg-[#ffd700]/10' : 'border-white/5 bg-white/5'}`}>
                    <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-[8px] font-bold text-white/50">{player.name.charAt(0)}</div>
                    <span className={`text-xs font-bold ${isMatch ? 'text-[#ffd700]' : 'text-white'}`}>{player.name}</span>
                    {isMatch && <span className="text-[8px] bg-[#ffd700] text-black font-bold px-1 rounded ml-auto">MATCH</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Live Squad Interactive */}
          <div className="flex-1 flex flex-col bg-[#0e1411]">
            <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-black/20">
              <span className="text-white font-bold text-xs uppercase tracking-widest">Live Squad</span>
              <div className="flex gap-1">
                {Object.keys(formations).map(fmt => (
                  <button key={fmt} onClick={() => setLiveFormation(fmt)} className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${liveFormation === fmt ? 'bg-[#39ff14] text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>{fmt}</button>
                ))}
              </div>
            </div>

            {/* NON-SCROLLABLE PITCH */}
            <div
              className="flex-1 relative p-4"
              style={{ background: 'repeating-linear-gradient(90deg, #1a2e24 0px, #1a2e24 50px, #1f362a 50px, #1f362a 100px)' }}
              onClick={() => { /* setDragOverTarget(null) - not passed, ignored */ }}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="absolute inset-4 border-2 border-white/5 rounded-xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-4 right-4 h-px bg-white/5 pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/5 rounded-full pointer-events-none"></div>

              {formations[liveFormation].map((coord, index) => {
                const player = pitchPlayers[index];
                const posColor = (player && player.pos === coord.role) ? "bg-[#39ff14] text-black border-[#39ff14]" : "bg-red-500 text-white border-red-500";

                return (
                  <div key={index} className="absolute w-20 h-32 transition-all duration-500 ease-in-out" style={{ left: `${coord.left}%`, top: `${coord.top}%`, transform: 'translate(-50%, -50%)' }}>
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${posColor} border font-black text-[9px] px-1.5 py-0.5 rounded shadow-lg z-0 transition-colors pointer-events-none whitespace-nowrap`}>{coord.role}</div>
                    <PlayerCard
                      player={player}
                      sizeClass="w-full h-full"
                      locationType="pitch"
                      index={index}
                      isDragging={dragItem.current?.type === 'pitch' && dragItem.current?.index === index}
                      isHovered={dragOverTarget?.type === 'pitch' && dragOverTarget?.index === index}
                      isMatch={isPlayerInStrategy(player)}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                    />
                  </div>
                );
              })}
            </div>

            {/* BENCH */}
            <div className="h-36 border-t border-white/10 bg-black/40 grid grid-cols-2 divide-x divide-white/10 text-white">
              <div className="p-2 flex flex-col">
                <div className="text-[10px] text-[#39ff14]/70 uppercase font-bold mb-1 flex justify-between"><span>Substitutes</span><span className="text-[9px] bg-white/5 px-1 rounded">7 Max</span></div>
                <div className="grid grid-cols-4 gap-2 overflow-y-auto custom-scroll">
                  {subPlayers.map((player, index) => (
                    <div key={`sub-${index}`} className="h-24 w-full">
                      <PlayerCard
                        player={player}
                        sizeClass="w-full h-full"
                        locationType="sub"
                        index={index}
                        isDragging={dragItem.current?.type === 'sub' && dragItem.current?.index === index}
                        isHovered={dragOverTarget?.type === 'sub' && dragOverTarget?.index === index}
                        isMatch={isPlayerInStrategy(player)}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-2 flex flex-col">
                <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Reserves</div>
                <div className="grid grid-cols-4 gap-2 overflow-y-auto custom-scroll">
                  {resPlayers.map((player, index) => (
                    <div key={`res-${index}`} className="h-24 w-full">
                      <PlayerCard
                        player={player}
                        sizeClass="w-full h-full"
                        locationType="res"
                        index={index}
                        isDragging={dragItem.current?.type === 'res' && dragItem.current?.index === index}
                        isHovered={dragOverTarget?.type === 'res' && dragOverTarget?.index === index}
                        isMatch={isPlayerInStrategy(player)}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Auction = () => {
  const [searchParams] = useSearchParams();
  const auctionId = searchParams.get('auction_id');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // -- REAL AUCTION STATE --
  const [participants, setParticipants] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [biddingTime, setBiddingTime] = useState(30);
  const [timer, setTimer] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [auctionSettings, setAuctionSettings] = useState({
    bid_inc_min: 1000000,
    bid_inc_mid: 5000000,
    bid_inc_max: 10000000,
    custom_bid_enabled: true
  });
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState("None");
  const [socket, setSocket] = useState(null);
  const biddingTimeRef = useRef(30);
  const [customBid, setCustomBid] = useState("");

  const placeBid = (amount) => {
    if (!socket || !amount) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const participant = participants.find(p => p.user_id === user.id);
    const teamName = participant ? participant.team_name : (user.username || "Team");
    const budget = participant ? participant.budget : 0;

    // Consecutive Bid Check
    if (highestBidder === teamName) {
      alert("Bid is already with you");
      return;
    }

    // Budget Check
    if (amount > budget) {
      alert(`You cant bid more than your purse (${formatMoney(budget)})`);
      return;
    }

    if (amount <= highestBid) {
      alert("Bid must be higher than current bid!");
      return;
    }

    socket.emit("place_bid", {
      auction_id: auctionId,
      amount: parseInt(amount),
      bidder: teamName,
      user_id: user.id
    });
    setCustomBid("");
  };
  const handlePass = () => {
    if (!socket) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const participant = participants.find(p => p.user_id === user.id);
    const teamName = participant ? participant.team_name : (user.username || "Team");

    socket.emit("pass_turn", {
      auction_id: auctionId,
      user_id: user.id,
      team_name: teamName
    });
  };

  const handleTogglePause = () => {
    if (!socket) return;
    socket.emit("toggle_pause", { auction_id: auctionId });
  };

  useEffect(() => {
    biddingTimeRef.current = biddingTime;
  }, [biddingTime]);

  useEffect(() => {
    console.log("Auction Component Mounted. Auction ID:", auctionId);
    if (!auctionId) return;

    // 1. Fetch Participants
    fetch(`${API_URL}/api/lobby/${auctionId}/participants`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setParticipants(data);
      })
      .catch(err => console.error("Error fetching participants:", err));

    // 2. Fetch Auction Settings
    fetch(`${API_URL}/api/lobby/${auctionId}/details`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          // Normalize increments to Millions if stored as small integers
          if (data.bid_inc_min < 1000) data.bid_inc_min *= 1000000;
          if (data.bid_inc_mid < 1000) data.bid_inc_mid *= 1000000;
          if (data.bid_inc_max < 1000) data.bid_inc_max *= 1000000;

          if (data.bidding_time) {
            setBiddingTime(data.bidding_time);
            setTimer(data.bidding_time);
          }
          setAuctionSettings(data);
        }
      });

    // 3. Fetch Available Players
    fetch(`${API_URL}/api/lobby/${auctionId}/available_players`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          console.log("Available Players Fetched:", data.length);
          setAvailablePlayers(data);
          // Removed manual setCurrentPlayer to avoid race condition with sync_auction
        }
      });

    // 4. Socket Setup
    const newSocket = io(API_URL, { transports: ['websocket', 'polling'] });

    // USER INFO for join
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // 5. Fetch Live Squad (Current Auction) - MOVED HERE
    fetch(`${API_URL}/api/auctions/${auctionId}/squad?user_id=${user.id || 0}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Auto-fill pitch (11), sub (7), res (rest)
          setPitchPlayers(data.slice(0, 11));
          setSubPlayers(data.slice(11, 18));
          setResPlayers(data.slice(18));
        }
      })
      .catch(err => console.error("Error fetching live squad:", err));

    newSocket.emit("join_lobby", {
      auction_id: auctionId,
      user_id: user.id || 0,
      team_name: user.username || "Spectator"
    });

    // SYNC STATE (On Connect/Reconnect)
    newSocket.on("sync_auction", (data) => {
      console.log("Syncing Auction State:", data);

      // 1. Sync Index/Player
      if (data.current_index !== undefined) {
        setCurrentIndex(data.current_index);
        // We need to wait for availablePlayers to be set, but this runs async.
        // Using functional update or ref for players might be needed if they are not loaded yet.
        // However, players fetch should be fast. 
        // We'll rely on existing 'availablePlayers' dependency in another effect 
        // OR just set index and let a `useEffect([currentIndex, availablePlayers])` update the player.
      }

      // 2. Sync Bid
      setHighestBid(Number(data.highest_bid) || 0);
      setHighestBidder(data.highest_bidder || "None");

      // 3. Sync Status & Timer
      if (data.status === 'PAUSED') {
        setIsPaused(true);
        setIsTimerActive(false);
      } else {
        setIsPaused(false);
        if (data.round_expires) {
          const remaining = Math.max(0, Math.ceil(data.round_expires - (Date.now() / 1000)));
          setTimer(remaining);
          setIsTimerActive(remaining > 0);
        }
      }
    });

    newSocket.on("auction_status_change", (data) => {
      console.log("Auction Status Changed:", data);
      if (data.status === 'PAUSED') {
        setIsPaused(true);
        setIsTimerActive(false);
      } else if (data.status === 'LIVE') {
        setIsPaused(false);
        if (data.round_expires) {
          const remaining = Math.max(0, Math.ceil(data.round_expires - (Date.now() / 1000)));
          setTimer(remaining);
          setIsTimerActive(remaining > 0);
        }
      }
    });

    newSocket.on("round_changed", (data) => {
      console.log("Round Changed:", data);
      setAuctionResult(null);
      setHighestBid(0);
      setHighestBidder("None");
      setCurrentIndex(data.current_index);

      // Calculate remaining from expires
      const remaining = Math.max(0, Math.ceil(data.round_expires - (Date.now() / 1000)));
      setTimer(remaining);
      setIsTimerActive(true);
    });

    newSocket.on("bid_placed", (data) => {
      console.log("Bid Placed:", data);
      setHighestBid(Number(data.amount));
      setHighestBidder(data.bidder);

      // Sync Timer using server timestamp
      if (data.round_expires) {
        const remaining = Math.max(0, Math.ceil(data.round_expires - (Date.now() / 1000)));
        setTimer(remaining);
      } else {
        // Fallback
        setTimer(biddingTimeRef.current);
      }
      setIsTimerActive(true);
    });

    newSocket.on("player_finalized", (data) => {
      console.log("Player Finalized:", data);
      setAuctionResult(data.result); // Trigger Animation ('sold' / 'unsold')
      setIsTimerActive(false);

      // 1. Optimistic Update (Immediate Feedback)
      if (data.result === 'sold' && data.updated_budget !== undefined) {
        setParticipants(prev => {
          return prev.map(p => {
            // Validate against user_id AND team_name to be sure
            if ((data.user_id && p.user_id == data.user_id) || (data.bidder && p.team_name === data.bidder)) {
              return { ...p, budget: data.updated_budget };
            }
            return p;
          });
        });
      }

      // 2. Fetch Sync (Ensure Consistency)
      fetch(`${API_URL}/api/lobby/${auctionId}/participants?_t=${Date.now()}`)
        .then(res => res.json())
        .then(pData => {
          if (Array.isArray(pData)) {
            setParticipants(pData);
          }
        })
        .catch(err => console.error("Failed to refresh participants", err));

      // 3. Refresh Live Squad
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if ((data.user_id && user.id == data.user_id) || (data.bidder && user.username === data.bidder)) {
        fetch(`${API_URL}/api/auctions/${auctionId}/squad?user_id=${user.id || 0}`)
          .then(res => res.json())
          .then(allMyPlayers => {
            if (Array.isArray(allMyPlayers)) {
              handleSquadUpdate(allMyPlayers);
            }
          })
          .catch(err => console.error("Error refreshing live squad:", err));
      }
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();

  }, [auctionId]);

  useEffect(() => {
    console.log("Updating Current Player. Index:", currentIndex, "Available:", availablePlayers.length);
    if (availablePlayers.length > 0 && availablePlayers[currentIndex]) {
      setCurrentPlayer(availablePlayers[currentIndex]);
    } else if (availablePlayers.length > 0 && currentIndex >= availablePlayers.length) {
      console.warn("Index out of bounds! Auction Complete?");
      // potentially handle end of auction here
    }
  }, [currentIndex, availablePlayers]);

  // Timer Interval
  useEffect(() => {
    if (!isTimerActive) return;

    if (timer === 0) {
      setIsTimerActive(false);
      // Time Up Logic: Check if sold or unsold
      // Only HOST should ideally triggering this to DB, but for UI sync we emit from here.
      // Actually, let's keep it simple: Host client finalizes.
      // For now, allow any client to trigger "End of Round" locally, then wait for server confirm?
      // Better: Host triggers 'finalize_player'

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      // Simple check: if I am the host (or just do it - backend handles race conditions mostly)
      // Let's assume the user is valid.

      const result = highestBid > 0 ? 'sold' : 'unsold';

      socket.emit("finalize_player", {
        auction_id: auctionId,
        player_id: currentPlayer?.id,
        result: result,
        amount: highestBid,
        bidder: highestBidder
      });

      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, isTimerActive, highestBid, highestBidder, currentPlayer]);

  // --- STATE ---
  const [showBoughtPlayersModal, setShowBoughtPlayersModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  // Auction Result State (sold, unsold, null)
  const [auctionResult, setAuctionResult] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [managerPlayers, setManagerPlayers] = useState([]);

  // Squad Arrays
  const [pitchPlayers, setPitchPlayers] = useState([]);
  const [subPlayers, setSubPlayers] = useState([]);
  const [resPlayers, setResPlayers] = useState([]);

  // Ref to track current squad state for socket updates
  const squadStateRef = useRef({ pitch: [], sub: [], res: [] });

  useEffect(() => {
    squadStateRef.current = { pitch: pitchPlayers, sub: subPlayers, res: resPlayers };
  }, [pitchPlayers, subPlayers, resPlayers]);

  const handleSquadUpdate = (allPlayers) => {
    const { pitch, sub, res } = squadStateRef.current;

    // 1. Identify Existing IDs
    const existingIds = new Set();
    pitch.forEach(p => { if (p) existingIds.add(p.id); });
    sub.forEach(p => { if (p) existingIds.add(p.id); });
    res.forEach(p => { if (p) existingIds.add(p.id); });

    // 2. Find New Players
    const newPlayers = allPlayers.filter(p => !existingIds.has(p.id));

    if (newPlayers.length === 0) return; // No changes needed

    console.log("Adding new players to formation:", newPlayers);

    // 3. Add to Arrays (Clone first)
    // We assume formation on pitch is sacred. Only fill empty subs or rest to reserves.
    const nextSub = [...sub];
    // Ensure 7 slots in sub array
    while (nextSub.length < 7) nextSub.push(undefined);

    const nextRes = [...res];

    newPlayers.forEach(p => {
      let placed = false;
      // Try Sub
      for (let i = 0; i < 7; i++) {
        if (!nextSub[i]) {
          nextSub[i] = p;
          placed = true;
          break;
        }
      }
      // Else Reserve
      if (!placed) nextRes.push(p);
    });

    setSubPlayers(nextSub);
    setResPlayers(nextRes);
    // Pitch doesn't change
  };

  const openManagerPlayers = (managerName) => {
    setSelectedManager(managerName);
    setShowBoughtPlayersModal(true);
    setManagerPlayers([]); // Clear previous

    const part = participants.find(p => p.team_name === managerName);
    if (part && part.user_id) {
      fetch(`${API_URL}/api/auctions/${auctionId}/squad?user_id=${part.user_id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setManagerPlayers(data);
        })
        .catch(err => console.error("Error fetching squad:", err));
    }
  };

  // Trade State
  const [tradeTab, setTradeTab] = useState('propose');
  const [tradePartner, setTradePartner] = useState('');
  const [youGivePlayers, setYouGivePlayers] = useState([]);
  const [theyGivePlayers, setTheyGivePlayers] = useState([]);
  const [youCash, setYouCash] = useState('');
  const [theyCash, setTheyCash] = useState('');
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [selectorSide, setSelectorSide] = useState('you');

  // Compare Modal State
  const [liveFormation, setLiveFormation] = useState('4-3-3');

  // Drag State
  const dragItem = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverTarget, setDragOverTarget] = useState(null);

  // --- DATA ---
  // tradePool and formations moved to module scope


  // --- DRAG HANDLERS ---
  const handleDragStart = (e, type, index, player) => {
    dragItem.current = { type, index };
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => setIsDragging(true), 0);
  };

  const handleDragOver = (e, type, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverTarget?.type !== type || dragOverTarget?.index !== index) {
      setDragOverTarget({ type, index });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverTarget(null);
    dragItem.current = null;
  };

  const handleDrop = (e, targetType, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();

    setDragOverTarget(null);
    setIsDragging(false);

    const source = dragItem.current;
    if (!source) return;
    if (source.type === targetType && source.index === targetIndex) return;

    // List Logic
    const getList = (t) => {
      if (t === 'pitch') return [...pitchPlayers];
      if (t === 'sub') return [...subPlayers];
      if (t === 'res') return [...resPlayers];
      return [];
    };

    const setList = (t, newList) => {
      if (t === 'pitch') setPitchPlayers(newList);
      if (t === 'sub') setSubPlayers(newList);
      if (t === 'res') setResPlayers(newList);
    };

    const sourceList = getList(source.type);
    const targetList = getList(targetType);

    const sourceItem = sourceList[source.index];
    const targetItem = targetList[targetIndex];

    if (source.type === targetType) {
      sourceList[source.index] = targetItem;
      sourceList[targetIndex] = sourceItem;
      setList(source.type, sourceList);
    } else {
      sourceList[source.index] = targetItem;
      targetList[targetIndex] = sourceItem;
      setList(source.type, sourceList);
      setList(targetType, targetList);
    }
  };

  // --- HANDLERS ---
  const openPlayerSelector = (side) => {
    setSelectorSide(side);
    setShowPlayerSelector(true);
  };

  const addPlayerToTrade = (player) => {
    if (selectorSide === 'you') {
      if (!youGivePlayers.includes(player)) setYouGivePlayers([...youGivePlayers, player]);
    } else {
      if (!theyGivePlayers.includes(player)) setTheyGivePlayers([...theyGivePlayers, player]);
    }
    setShowPlayerSelector(false);
  };

  const removePlayerFromTrade = (side, player) => {
    if (side === 'you') setYouGivePlayers(youGivePlayers.filter(p => p !== player));
    else setTheyGivePlayers(theyGivePlayers.filter(p => p !== player));
  };



  // --- COMPARE MODAL ---
  // (Component moved outside logic to avoid re-renders)


  const BoughtPlayersModal = () => {
    // Use fetched managerPlayers instead of hardcoded data
    const players = managerPlayers;

    return (
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowBoughtPlayersModal(false)}></div>
        <div className="relative w-full max-w-2xl bg-[#0b1a12] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
          <div className="relative bg-gradient-to-r from-primary/20 to-transparent border-b border-white/10 px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center"><span className="material-symbols-outlined text-primary text-2xl">groups</span></div>
              <div><h2 className="text-2xl font-black uppercase italic text-white">{selectedManager}</h2><p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Squad Acquisitions</p></div>
            </div>
            <button onClick={() => setShowBoughtPlayersModal(false)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><span className="material-symbols-outlined text-white">close</span></button>
          </div>
          <div className="p-8 overflow-y-auto">
            {players.length === 0 ? (
              <div className="text-white/30 text-center italic">No players purchased yet.</div>
            ) : (
              <div className="grid gap-4">
                {players.map((player) => (
                  <div key={player.id} className="group bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-primary/50 rounded-xl p-4 transition-all hover:bg-white/10 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center"><span className="text-primary font-bold text-sm">{player.rating}</span></div>
                        <div className="flex-1"><h3 className="font-bold text-white group-hover:text-primary transition-colors">{player.name}</h3><p className="text-xs text-white/60">{player.pos}</p></div>
                      </div>
                      <div className="text-right"><p className="text-lg font-black italic text-primary">${formatMoney(player.price)}</p><p className="text-xs text-white/40 font-bold">BID PRICE</p></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleNextPlayer = () => {
    // Server-side logic handles index increment now
    if (!socket) return;
    socket.emit("next_player", { auction_id: auctionId });
  };

  const GavelModal = () => {
    return (
      <div className="fixed inset-0 z-[5000] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-in fade-in duration-300"></div>
        <div className="relative z-10 flex flex-col items-center animate-in zoom-in-50 duration-500 w-full">

          {/* 3D GAVEL SCENE */}
          <div className="relative mb-0 w-[500px] h-[400px]">
            <div className={`absolute inset-0 blur-[100px] opacity-20 rounded-full ${auctionResult === 'sold' ? 'bg-[#39ff14]' : 'bg-red-500'}`}></div>
            <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[5, 10, 5]} intensity={1.5} color={auctionResult === 'sold' ? "#ffd700" : "#ffffff"} />
              <pointLight position={[-5, 5, -5]} intensity={1} color={auctionResult === 'sold' ? "#39ff14" : "#ff4444"} />
              <Environment preset="city" />
              <GavelModel result={auctionResult} />
            </Canvas>
          </div>

          <h1 className={`text-[80px] font-black italic tracking-tighter leading-none mb-4 drop-shadow-lg ${auctionResult === 'sold' ? 'text-white' : 'text-white/50'}`}>
            {auctionResult === 'sold' ? 'SOLD!' : 'UNSOLD'}
          </h1>

          {auctionResult === 'sold' ? (
            <div className="flex flex-col items-center gap-2 mb-8">
              <div className="text-3xl font-bold uppercase tracking-widest text-[#39ff14]">{highestBidder}</div>
              <div className="text-6xl font-black italic text-white">${highestBid ? highestBid.toLocaleString() : '0'}</div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-white/40 uppercase tracking-widest mb-8">No Bids Received</div>
          )}

          <button onClick={handleNextPlayer} className="px-12 py-4 bg-white/10 border border-white/20 rounded-full text-white font-bold uppercase tracking-widest hover:bg-white/20 hover:scale-105 transition-all">
            Continue to Next Player
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#0a0f0b] font-display text-white overflow-hidden h-screen" style={{
      background: "linear-gradient(rgba(10, 15, 11, 0.9), rgba(10, 15, 11, 0.95)), url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=2000')",
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>
      <style>{`
        .gem-shine { background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.4) 40%, transparent 50%); background-size: 200% 100%; animation: shine 4s infinite linear; position: absolute; inset: 0; pointer-events: none; z-index: 20; }
        @keyframes shine { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <Navbar />

      <main className="flex h-[calc(100vh-128px)] w-full overflow-hidden p-6 gap-6 relative z-10">

        <aside className="w-[380px] flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm flex-1 flex flex-col shadow-2xl relative">

            {/* TIMER (Absolute) */}
            <div className="absolute top-4 right-4 z-20">
              <div className={`backdrop-blur-md border px-5 py-2 rounded-xl shadow-lg transition-all ${timer <= 5 ? "bg-red-500/80 border-red-500 animate-pulse" : "bg-black/60 border-[#39ff14]/50"
                }`}>
                <span className={`text-4xl font-black italic tracking-tighter ${timer <= 5 ? "text-white" : "text-[#39ff14]"}`}>
                  {timer < 10 ? `0${timer}` : timer}
                </span>
                <span className="text-[10px] font-bold text-white/60 ml-1">SEC</span>
              </div>
            </div>

            <div className="relative h-2/3">
              <img className="w-full h-full object-cover object-top" src={currentPlayer?.image_url || "https://placehold.co/400x600/102016/FFFFFF/png?text=Player"} alt="Player" />
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                <p className="text-[#39ff14] text-xs font-bold tracking-[0.2em] mb-1">
                  {currentPlayer ? "CURRENT PLAYER" : "WAITING..."}
                </p>
                <h3 className="text-3xl font-bold uppercase tracking-tight italic truncate">
                  {currentPlayer?.name || "---"}
                </h3>
                <p className="text-white/60 text-sm">{currentPlayer?.position_group || "POS"} | {currentPlayer?.nation || "Nation"} • {currentPlayer?.club || "Club"}</p>
              </div>
            </div>
            <div className="p-6 flex-1 bg-black/40">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col items-center bg-white/5 border border-white/5 p-2 rounded"><span className="text-xl font-bold text-[#39ff14] italic">{currentPlayer?.overall || currentPlayer?.rating || '-'}</span><span className="text-[9px] text-white/40 font-bold">RATING</span></div>
                <div className="flex flex-col items-center bg-white/5 border border-white/5 p-2 rounded"><span className="text-xl font-bold text-[#39ff14] italic">{currentPlayer?.sho || '-'}</span><span className="text-[9px] text-white/40 font-bold">SHO</span></div>
                <div className="flex flex-col items-center bg-white/5 border border-white/5 p-2 rounded"><span className="text-xl font-bold text-[#39ff14] italic">{currentPlayer?.dri || '-'}</span><span className="text-[9px] text-white/40 font-bold">DRI</span></div>
              </div>

              {/* Purse View */}
              <div className="bg-white/5 border border-white/10 rounded p-4 h-24 flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-white/40 mb-1">Your Remaining Purse</span>
                <span className="text-3xl font-black italic text-[#39ff14] tracking-tighter">
                  ${formatMoney(participants.find(p => p.user_id == (JSON.parse(localStorage.getItem('user') || '{}').id))?.budget ?? 0)}
                </span>
                <span className="text-[9px] uppercase font-bold text-white/20 mt-1">Initial: ${formatMoney(auctionSettings.purse_per_team || 0)}</span>
              </div>

            </div>
          </div>
        </aside>

        <section className="flex-1 flex flex-col">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">

            {/* PAUSED OVERLAY */}
            {isPaused && (
              <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
                <div className="bg-black/80 border border-yellow-500/50 p-8 rounded-2xl flex flex-col items-center shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                  <span className="material-symbols-outlined text-yellow-500 text-6xl mb-4 animate-pulse">pause_circle</span>
                  <h2 className="text-4xl font-black text-yellow-500 italic uppercase tracking-wider">Auction Paused</h2>
                  {(parseInt(user?.id) === parseInt(auctionSettings.host_id)) ? (
                    <button
                      onClick={handleTogglePause}
                      className="mt-6 px-8 py-3 bg-yellow-500 text-black font-black uppercase rounded hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                    >
                      <span className="material-symbols-outlined">play_arrow</span>
                      Resume Auction
                    </button>
                  ) : (
                    <p className="text-white/50 font-bold uppercase tracking-widest mt-2 text-sm">Waiting for host to resume...</p>
                  )}
                </div>
              </div>
            )}

            {/* Top Admin Bar */}
            <div className="absolute left-1/2 top-6 -translate-x-1/2 flex items-center gap-8 bg-black/40 border border-white/10 px-6 py-2 rounded-full backdrop-blur-xl shadow-lg z-20">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-0.5">Upcoming Pool</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/60 text-sm">groups_3</span>
                  <span className="text-xs font-black text-white tracking-wider">MIDFIELDERS</span>
                  <span className="text-[9px] text-black bg-[#39ff14] px-1.5 py-0.5 rounded font-bold">12</span>
                </div>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div className="flex items-center gap-3">
                {/* PAUSE BUTTON (HOST ONLY) */}
                {(parseInt(user?.id) === parseInt(auctionSettings.host_id)) && (
                  <button
                    onClick={handleTogglePause}
                    className={`size-9 rounded-full border flex items-center justify-center hover:scale-110 transition-all ${isPaused ? 'bg-[#39ff14]/10 border-[#39ff14]/30 text-[#39ff14] hover:bg-[#39ff14]/20' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20'}`}
                    title={isPaused ? "Resume Auction" : "Pause Auction"}
                  >
                    <span className="material-symbols-outlined text-lg">{isPaused ? 'play_arrow' : 'pause'}</span>
                  </button>
                )}
                {/* END AUCTION BUTTON */}
                <Link to="/post_auction_statistics">
                  <button className="size-9 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500/20 hover:scale-110 transition-all" title="End Auction">
                    <span className="material-symbols-outlined text-lg">stop_circle</span>
                  </button>
                </Link>
                {/* EXIT BUTTON */}
                <Link to="/post_auction_statistics">
                  <button className="ml-2 px-4 py-1.5 bg-white/5 border border-white/10 text-white/60 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">logout</span> Exit
                  </button>
                </Link>
              </div>
            </div>

            <div className="text-center z-10">
              <p className="text-white/40 text-sm font-bold tracking-[0.3em] uppercase mb-4">Current High Bid</p>
              <h1 className="text-[100px] font-bold leading-none tracking-tighter text-[#ffd700] italic mb-2">
                {highestBid > 0 ? (
                  <>
                    <span className="text-6xl align-top mr-2 text-[#ffd700]/70">$</span>
                    {formatMoney(highestBid)}
                  </>
                ) : (
                  <span className="text-white/20">---</span>
                )}
              </h1>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffd700] to-[#b39700] flex items-center justify-center text-black font-black text-lg border-2 border-white/10 shadow-lg">
                  {highestBidder !== "None" ? highestBidder.substring(0, 2).toUpperCase() : "-"}
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-[#ffd700] font-bold uppercase tracking-widest text-xs mb-0.5">Bidder</p>
                  <p className="text-white font-black text-lg tracking-wide">{highestBidder !== "None" ? highestBidder : "Waiting for bids..."}</p>
                </div>
              </div>
            </div>
            <div className="mt-12 w-full max-w-xl px-12 z-10">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <button disabled={isPaused} onClick={() => placeBid(Number(highestBid) + auctionSettings.bid_inc_min)} className={`h-16 bg-[#39ff14] text-black font-black text-xl italic rounded hover:scale-105 transition-transform ${isPaused ? 'opacity-50 grayscale cursor-not-allowed pointer-events-none' : ''}`}>{formatMoney(auctionSettings.bid_inc_min)}</button>
                <button disabled={isPaused} onClick={() => placeBid(Number(highestBid) + auctionSettings.bid_inc_mid)} className={`h-16 bg-[#39ff14] text-black font-black text-xl italic rounded hover:scale-105 transition-transform ${isPaused ? 'opacity-50 grayscale cursor-not-allowed pointer-events-none' : ''}`}>{formatMoney(auctionSettings.bid_inc_mid)}</button>
                <button disabled={isPaused} onClick={() => placeBid(Number(highestBid) + auctionSettings.bid_inc_max)} className={`h-16 bg-[#39ff14] text-black font-black text-xl italic rounded hover:scale-105 transition-transform ${isPaused ? 'opacity-50 grayscale cursor-not-allowed pointer-events-none' : ''}`}>{formatMoney(auctionSettings.bid_inc_max)}</button>
              </div>
              <div className="flex gap-4">
                <input
                  value={customBid}
                  onChange={(e) => setCustomBid(e.target.value)}
                  disabled={!auctionSettings.custom_bid_enabled || isPaused}
                  className={`flex-1 bg-black/50 border border-white/20 rounded px-6 font-bold text-lg text-white ${(!auctionSettings.custom_bid_enabled || isPaused) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder={isPaused ? "PAUSED" : (auctionSettings.custom_bid_enabled ? "Custom bid..." : "Disabled")}
                  type="number"
                />
                <button
                  onClick={() => placeBid(Number(highestBid) + (parseFloat(customBid) * 1000000))}
                  disabled={!auctionSettings.custom_bid_enabled || isPaused}
                  className={`h-14 w-24 bg-[#39ff14] text-black font-black text-xl italic rounded hover:scale-105 shadow-[0_0_20px_rgba(57,255,20,0.4)] ${(!auctionSettings.custom_bid_enabled || isPaused) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  BID
                </button>
                <button disabled={isPaused} onClick={handlePass} className={`h-14 px-8 bg-white/10 border border-white/10 rounded font-bold uppercase text-white/60 hover:text-white hover:bg-white/20 transition-all ${isPaused ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                  Pass
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="w-[340px] flex flex-col gap-6">
          <div className="h-1/3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm flex flex-col overflow-hidden">
            <div className="p-3 border-b border-white/10 bg-black/20 font-bold text-xs uppercase tracking-widest flex justify-between items-center">
              <span>Live Activity</span><span className="text-[9px] bg-[#39ff14]/20 text-[#39ff14] px-2 rounded">REAL-TIME</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {participants.length === 0 ? (
                <div className="text-white/40 text-[10px] text-center italic p-4">
                  No participants connected...<br />
                  (Auction ID: {auctionId || 'None'})
                </div>
              ) : (
                participants.map((participant) => (
                  <div key={participant.user_id || participant.team_name} onClick={() => openManagerPlayers(participant.team_name)} className="flex justify-between bg-white/5 hover:bg-white/10 p-2 rounded cursor-pointer border border-transparent hover:border-[#39ff14]/50 transition-all group">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#39ff14]/20 to-black flex items-center justify-center border border-white/10 overflow-hidden">
                        <span className="text-[10px] font-bold text-white">{participant.team_name?.charAt(0)}</span>
                      </div>
                      <span className="text-xs font-bold group-hover:text-[#39ff14] truncate max-w-[150px]">{participant.team_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#ffd700]">${formatMoney(participant.budget ?? 0)}</span>
                      <span className="material-symbols-outlined text-[#39ff14] text-sm">expand_more</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TRADE SECTION */}
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm overflow-hidden flex flex-col relative shadow-lg">
            <div className="flex border-b border-white/10 bg-black/20">
              <button onClick={() => setTradeTab('propose')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider ${tradeTab === 'propose' ? 'bg-white/10 text-[#39ff14] border-b-2 border-[#39ff14]' : 'text-white/40 hover:text-white'}`}>Propose</button>
              <button onClick={() => setTradeTab('active')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider ${tradeTab === 'active' ? 'bg-white/10 text-[#39ff14] border-b-2 border-[#39ff14]' : 'text-white/40 hover:text-white'}`}>Active Offers</button>
            </div>

            {tradeTab === 'propose' ? (
              <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto custom-scroll relative">
                <select value={tradePartner} onChange={(e) => setTradePartner(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs text-white outline-none mb-2">
                  <option value="">Select Partner...</option>
                  <option value="GalacticManager_7">GalacticManager_7</option>
                  <option value="StarkUnited">StarkUnited</option>
                </select>

                <div className="bg-black/30 border border-white/5 rounded p-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-[#39ff14] uppercase">You Give</span>
                    <button onClick={() => openPlayerSelector('you')} className="text-[9px] bg-white/10 px-2 py-0.5 rounded hover:bg-[#39ff14] hover:text-black transition flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">add</span> Player</button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
                    {youGivePlayers.map(p => (
                      <div key={p} className="bg-white/10 border border-white/10 rounded px-2 py-1 text-[9px] text-white font-bold flex items-center gap-1">{p} <span onClick={() => removePlayerFromTrade('you', p)} className="cursor-pointer hover:text-red-400">×</span></div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 border-t border-white/5 pt-2"><span className="text-[10px] text-white/40">$</span><input type="number" placeholder="Cash Offer (M)" value={youCash} onChange={(e) => setYouCash(e.target.value)} className="bg-transparent text-xs w-full outline-none text-white font-bold" /></div>
                </div>

                <div className="flex justify-center -my-3 z-10"><div className="bg-black border border-white/20 rounded-full p-1 shadow-lg"><span className="material-symbols-outlined text-sm text-white/50">swap_vert</span></div></div>

                <div className="bg-black/30 border border-white/5 rounded p-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-white/50 uppercase">They Give</span>
                    <button onClick={() => openPlayerSelector('them')} className="text-[9px] bg-white/10 px-2 py-0.5 rounded hover:bg-white/20 transition flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">add</span> Player</button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
                    {theyGivePlayers.map(p => (
                      <div key={p} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[9px] text-white/70 font-bold flex items-center gap-1">{p} <span onClick={() => removePlayerFromTrade('them', p)} className="cursor-pointer hover:text-red-400">×</span></div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 border-t border-white/5 pt-2"><span className="text-[10px] text-white/40">$</span><input type="number" placeholder="Request Cash (M)" value={theyCash} onChange={(e) => setTheyCash(e.target.value)} className="bg-transparent text-xs w-full outline-none text-white font-bold" /></div>
                </div>

                <button className="w-full py-3 bg-[#39ff14] text-black text-xs font-black uppercase rounded hover:scale-[1.02] mt-auto shadow-[0_0_15px_rgba(13,242,89,0.3)]">Propose Trade</button>

                {showPlayerSelector && (
                  <div className="absolute inset-0 bg-[#121816] z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-white/10 flex justify-between items-center bg-black/40"><span className="text-xs font-bold text-white uppercase">Select Player</span><button onClick={() => setShowPlayerSelector(false)} className="text-white/50 hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button></div>
                    <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 custom-scroll">{tradePool[selectorSide].map(p => (<div key={p} onClick={() => addPlayerToTrade(p)} className="p-2 bg-white/5 hover:bg-white/10 rounded cursor-pointer text-xs font-bold text-white flex justify-between border border-white/5">{p} <span className="material-symbols-outlined text-sm text-[#39ff14]">add_circle</span></div>))}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto"><p class="text-[10px] text-center text-white/30 mt-4">No active offers.</p></div>
            )}

            <div className="p-4 bg-black/40 border-t border-white/10">
              <button onClick={() => setShowCompareModal(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all">
                <span className="material-symbols-outlined text-lg">grid_view</span> Compare Squads
              </button>
            </div>
          </div>
        </aside>
      </main>

      <footer className="h-10 w-full border-t border-white/10 bg-black/90 backdrop-blur-xl fixed bottom-0 left-0 flex items-center overflow-hidden z-50">
        <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } } .animate-marquee { animation: marquee 30s linear infinite; }`}</style>
        <div className="px-6 py-3 bg-[#39ff14] text-black font-black text-xs uppercase italic tracking-wider shrink-0 z-50 skew-x-[-10deg] ml-[-10px] pl-8"><span className="skew-x-[10deg] inline-block">News</span></div>
        <div className="flex-1 overflow-hidden relative"><div className="animate-marquee whitespace-nowrap flex gap-16 items-center text-xs font-medium text-white/80 py-2"><span><strong className="text-white">TRADE:</strong> EliteScout_X traded <strong>Haaland</strong>...</span></div></div>
      </footer>

      {showBoughtPlayersModal && <BoughtPlayersModal />}
      {showCompareModal && (
        <CompareModal
          onClose={() => setShowCompareModal(false)}
          pitchPlayers={pitchPlayers}
          subPlayers={subPlayers}
          resPlayers={resPlayers}
          setPitchPlayers={setPitchPlayers}
          setSubPlayers={setSubPlayers}
          setResPlayers={setResPlayers}
          liveFormation={liveFormation}
          setLiveFormation={setLiveFormation}
          dragItem={dragItem} // Pass ref
          dragOverTarget={dragOverTarget}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          handleDragEnd={handleDragEnd}
          auctionId={auctionId}
        />
      )}
      {auctionResult && <GavelModal />}

    </div>
  );
};

export default Auction;