import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

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

const Auction = () => {
  // --- STATE ---
  const [showBoughtPlayersModal, setShowBoughtPlayersModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);

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
  const [currentStrategyIndex, setCurrentStrategyIndex] = useState(0);
  const [liveFormation, setLiveFormation] = useState('4-3-3');
  
  // Squad Arrays
  const [pitchPlayers, setPitchPlayers] = useState([]);
  const [subPlayers, setSubPlayers] = useState([]);
  const [resPlayers, setResPlayers] = useState([]);

  // Drag State
  const dragItem = useRef(null); 
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverTarget, setDragOverTarget] = useState(null);

  // --- DATA ---
  const allLivePlayers = [
    { id: 1, name: "Mbappé", pos: "ST", rating: 97, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p223094.png", stat: "PAC 97" },
    { id: 2, name: "Salah", pos: "RW", rating: 90, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p118748.png", stat: "PAC 91" },
    { id: 3, name: "Son", pos: "LW", rating: 89, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p85971.png", stat: "SHO 89" },
    { id: 4, name: "De Bruyne", pos: "CM", rating: 96, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p61366.png", stat: "PAS 94" },
    { id: 5, name: "Fernandes", pos: "CM", rating: 88, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p122798.png", stat: "PAS 90" },
    { id: 6, name: "Rice", pos: "CDM", rating: 86, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p204480.png", stat: "DEF 85" },
    { id: 7, name: "Shaw", pos: "LB", rating: 83, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p106760.png", stat: "PAC 82" },
    { id: 8, name: "Dias", pos: "CB", rating: 89, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p171287.png", stat: "DEF 89" },
    { id: 9, name: "Saliba", pos: "CB", rating: 87, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p243016.png", stat: "DEF 88" },
    { id: 10, name: "Trippier", pos: "RB", rating: 84, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p101178.png", stat: "PAS 86" },
    { id: 11, name: "Ederson", pos: "GK", rating: 89, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p106573.png", stat: "REF 91" },
    { id: 12, name: "Varane", pos: "CB", rating: 84, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p93111.png", stat: "DEF 85" },
    { id: 13, name: "Rashford", pos: "LW", rating: 83, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p172780.png", stat: "PAC 88" },
    { id: 14, name: "Saka", pos: "RW", rating: 86, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p223340.png", stat: "DRI 87" },
    { id: 15, name: "Ramsdale", pos: "GK", rating: 81, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p172649.png", stat: "REF 82" },
    { id: 16, name: "Nketiah", pos: "ST", rating: 78, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p179402.png", stat: "PAC 82" },
    { id: 17, name: "Maguire", pos: "CB", rating: 79, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p95658.png", stat: "PHY 85" },
  ];

  const boughtPlayersByManager = {
    'GalacticManager_7': [{ id: 1, name: 'Mbappé', pos: 'FW', team: 'PSG', price: '$85M', rating: 97 }],
    'EliteScout_X': [{ id: 4, name: 'Haaland', pos: 'ST', team: 'City', price: '$120M', rating: 98 }],
    'StarkUnited': [{ id: 6, name: 'Modrić', pos: 'CM', team: 'Real', price: '$55M', rating: 92 }]
  };

  const tradePool = {
    you: ["Mbappé", "De Bruyne", "Ederson", "Rice"],
    them: ["Haaland", "Vini Jr", "Allison", "Van Dijk", "Rashford"]
  };

  const strategies = [
    { name: "Plan A (Meta)", pitch: ["Mbappé", "Salah", "Son", "De Bruyne", "Ederson", "Dias", "Saliba", "Shaw", "Trippier", "Rodri", "Fernandes"], sub: ["Rice", "Varane"], res: ["Maguire"] },
    { name: "Plan B (Budget)", pitch: ["Jesus", "Saka", "Diaz", "Rice", "Ramsdale"], sub: ["Nketiah"], res: [] }
  ];

  // COMPACT COORDINATES (To fit without scrolling)
  const formations = {
    "4-3-3": [{role:"GK",left:50,top:85},{role:"LB",left:15,top:70},{role:"CB",left:38,top:75},{role:"CB",left:62,top:75},{role:"RB",left:85,top:70},{role:"CM",left:30,top:45},{role:"CM",left:50,top:50},{role:"CM",left:70,top:45},{role:"LW",left:15,top:15},{role:"ST",left:50,top:10},{role:"RW",left:85,top:15}],
    "4-4-2": [{role:"GK",left:50,top:85},{role:"LB",left:15,top:70},{role:"CB",left:38,top:75},{role:"CB",left:62,top:75},{role:"RB",left:85,top:70},{role:"LM",left:15,top:40},{role:"CM",left:40,top:45},{role:"CM",left:60,top:45},{role:"RM",left:85,top:40},{role:"ST",left:35,top:15},{role:"ST",left:65,top:15}],
    "3-5-2": [{role:"GK",left:50,top:85},{role:"CB",left:20,top:72},{role:"CB",left:50,top:68},{role:"CB",left:80,top:72},{role:"LM",left:10,top:40},{role:"CDM",left:35,top:50},{role:"CM",left:50,top:35},{role:"CDM",left:65,top:50},{role:"RM",left:90,top:40},{role:"ST",left:35,top:15},{role:"ST",left:65,top:15}],
  };

  useEffect(() => {
    setPitchPlayers(allLivePlayers.slice(0, 11));
    setSubPlayers(allLivePlayers.slice(11, 15));
    setResPlayers(allLivePlayers.slice(15));
  }, []);

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

  const openManagerPlayers = (managerName) => {
    setSelectedManager(managerName);
    setShowBoughtPlayersModal(true);
  };

  const nextStrategy = () => setCurrentStrategyIndex((prev) => (prev + 1) % strategies.length);
  const prevStrategy = () => setCurrentStrategyIndex((prev) => (prev - 1 + strategies.length) % strategies.length);

  // --- COMPARE MODAL ---
  const CompareModal = () => {
    const strategy = strategies[currentStrategyIndex];
    const isPlayerInStrategy = (player) => {
      if (!player) return false;
      return [...strategy.pitch, ...strategy.sub, ...strategy.res].includes(player.name);
    };

    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setShowCompareModal(false)}></div>
        <div className="relative w-[95vw] h-[95vh] bg-[#0a0f0b] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          
          <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/40">
            <h3 className="text-xl font-black uppercase tracking-wider italic flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-[#39ff14]">strategy</span> Squad Comparison
            </h3>
            <button onClick={() => setShowCompareModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition text-white"><span className="material-symbols-outlined">close</span></button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* LEFT: Strategy List */}
            <div className="w-[28%] flex flex-col border-r border-white/10 bg-[#0e1411]">
              <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-black/20">
                <span className="text-[#39ff14] font-bold text-xs uppercase tracking-widest">My Strategy</span>
                <div className="flex gap-1">
                  <button onClick={prevStrategy} className="hover:bg-white/10 rounded p-1 text-white"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                  <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/60">{strategy.name}</span>
                  <button onClick={nextStrategy} className="hover:bg-white/10 rounded p-1 text-white"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scroll">
                {['pitch', 'sub', 'res'].map(section => (
                  <div key={section}>
                    <div className="text-[9px] text-white/30 font-bold uppercase mb-1 mt-2">
                      {section === 'pitch' ? 'Starting XI' : section === 'sub' ? 'Substitutes' : 'Reserves'}
                    </div>
                    {strategy[section].map((name, idx) => {
                      const isMatch = [...pitchPlayers, ...subPlayers, ...resPlayers].some(p => p && p.name === name);
                      return (
                        <div key={idx} className={`flex items-center gap-2 p-2 rounded border mb-1 ${isMatch ? 'border-[#ffd700] bg-[#ffd700]/10' : 'border-white/5 bg-white/5'}`}>
                          <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-[8px] font-bold text-white/50">{name.charAt(0)}</div>
                          <span className={`text-xs font-bold ${isMatch ? 'text-[#ffd700]' : 'text-white'}`}>{name}</span>
                          {isMatch && <span className="text-[8px] bg-[#ffd700] text-black font-bold px-1 rounded ml-auto">MATCH</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}
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
                style={{background: 'repeating-linear-gradient(90deg, #1a2e24 0px, #1a2e24 50px, #1f362a 50px, #1f362a 100px)'}}
                onClick={() => { setDragOverTarget(null); }}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="absolute inset-4 border-2 border-white/5 rounded-xl pointer-events-none"></div>
                <div className="absolute top-1/2 left-4 right-4 h-px bg-white/5 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/5 rounded-full pointer-events-none"></div>

                {formations[liveFormation].map((coord, index) => {
                  const player = pitchPlayers[index];
                  const posColor = (player && player.pos === coord.role) ? "bg-[#39ff14] text-black border-[#39ff14]" : "bg-red-500 text-white border-red-500";
                  
                  return (
                    <div key={index} className="absolute w-20 h-32 transition-all duration-500 ease-in-out" style={{left: `${coord.left}%`, top: `${coord.top}%`, transform: 'translate(-50%, -50%)'}}>
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

  const BoughtPlayersModal = () => {
    const players = boughtPlayersByManager[selectedManager] || [];
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
            <div className="grid gap-4">
              {players.map((player) => (
                <div key={player.id} className="group bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-primary/50 rounded-xl p-4 transition-all hover:bg-white/10 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center"><span className="text-primary font-bold text-sm">{player.rating}</span></div>
                      <div className="flex-1"><h3 className="font-bold text-white group-hover:text-primary transition-colors">{player.name}</h3><p className="text-xs text-white/60">{player.team} • {player.pos}</p></div>
                    </div>
                    <div className="text-right"><p className="text-lg font-black italic text-primary">{player.price}</p><p className="text-xs text-white/40 font-bold">BID PRICE</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm flex-1 flex flex-col shadow-2xl">
            <div className="relative h-2/3">
              <img className="w-full h-full object-cover object-top" src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=800" alt="Player"/>
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                <p className="text-[#39ff14] text-xs font-bold tracking-[0.2em] mb-1">CURRENT PLAYER</p>
                <h3 className="text-3xl font-bold uppercase tracking-tight italic">Kylian Mbappé</h3>
                <p className="text-white/60 text-sm">FW | France • PSG</p>
              </div>
            </div>
            <div className="p-6 flex-1 bg-black/40">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col items-center bg-white/5 border border-white/5 p-2 rounded"><span className="text-xl font-bold text-[#39ff14] italic">97</span><span className="text-[9px] text-white/40 font-bold">SPD</span></div>
                <div className="flex flex-col items-center bg-white/5 border border-white/5 p-2 rounded"><span className="text-xl font-bold text-[#39ff14] italic">92</span><span className="text-[9px] text-white/40 font-bold">SHO</span></div>
                <div className="flex flex-col items-center bg-white/5 border border-white/5 p-2 rounded"><span className="text-xl font-bold text-[#39ff14] italic">95</span><span className="text-[9px] text-white/40 font-bold">DRI</span></div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-12 bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 rounded flex items-center justify-center text-[#ff4d4d] font-bold text-xl">00</div>
                <div className="flex-1 h-12 bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 rounded flex items-center justify-center text-[#ff4d4d] font-bold text-xl">00</div>
                <div className="flex-1 h-12 bg-[#ff4d4d] border border-[#ff4d4d] rounded flex items-center justify-center text-white font-bold text-xl">15</div>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex-1 flex flex-col">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            
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
                <button className="size-9 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 flex items-center justify-center hover:bg-yellow-500/20 hover:scale-110 transition-all">
                  <span className="material-symbols-outlined text-lg">pause</span>
                </button>
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
              <h1 className="text-[120px] font-bold leading-none tracking-tighter text-[#ffd700] italic mb-2">$85<span className="text-6xl not-italic ml-2">M</span></h1>
              <div className="flex items-center justify-center gap-3">
                <img className="w-8 h-8 rounded-full border border-[#ffd700]" src="https://placehold.co/100x100/FFD700/000000/png?text=GM" alt="Bidder" />
                <p className="text-[#ffd700] font-medium uppercase tracking-widest text-sm">Bidder: <span className="text-white">GalacticManager_7</span></p>
              </div>
            </div>
            <div className="mt-12 w-full max-w-xl px-12 z-10">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <button className="h-16 bg-[#39ff14] text-black font-black text-xl italic rounded hover:scale-105 transition-transform">+$5M</button>
                <button className="h-16 bg-[#39ff14] text-black font-black text-xl italic rounded hover:scale-105 transition-transform">+$10M</button>
                <button className="h-16 bg-[#39ff14] text-black font-black text-xl italic rounded hover:scale-105 transition-transform">+$20M</button>
              </div>
              <div className="flex gap-4">
                <input className="flex-1 bg-black/50 border border-white/20 rounded px-6 font-bold text-lg text-white" placeholder="Custom bid..." type="text"/>
                <button className="h-14 w-32 bg-[#39ff14] text-black font-black text-xl italic rounded hover:scale-105">BID</button>
                <button className="h-14 px-8 bg-white/10 border border-white/10 rounded font-bold uppercase hover:bg-white/20">Pass</button>
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
              {['GalacticManager_7', 'EliteScout_X', 'StarkUnited'].map((manager) => (
                <div key={manager} onClick={() => openManagerPlayers(manager)} className="flex justify-between bg-white/5 hover:bg-white/10 p-2 rounded cursor-pointer border border-transparent hover:border-[#39ff14]/50 transition-all group">
                  <div className="flex items-center gap-2">
                    <img src="https://placehold.co/100x100/FFD700/000000/png?text=M" className="w-6 h-6 rounded-full" alt="Manager" />
                    <span className="text-xs font-bold group-hover:text-[#39ff14]">{manager}</span>
                  </div>
                  <span className="material-symbols-outlined text-[#39ff14] text-sm">expand_more</span>
                </div>
              ))}
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
                  <div className="flex items-center gap-2 border-t border-white/5 pt-2"><span className="text-[10px] text-white/40">$</span><input type="number" placeholder="Cash Offer (M)" value={youCash} onChange={(e) => setYouCash(e.target.value)} className="bg-transparent text-xs w-full outline-none text-white font-bold"/></div>
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
                  <div className="flex items-center gap-2 border-t border-white/5 pt-2"><span className="text-[10px] text-white/40">$</span><input type="number" placeholder="Request Cash (M)" value={theyCash} onChange={(e) => setTheyCash(e.target.value)} className="bg-transparent text-xs w-full outline-none text-white font-bold"/></div>
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
      {showCompareModal && <CompareModal />}

    </div>
  );
};

export default Auction;