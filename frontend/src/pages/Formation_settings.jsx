import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const Formation_settings = () => {
  const [currentFormation, setCurrentFormation] = useState('4-3-3');
  const [pitchPlayers, setPitchPlayers] = useState([]);
  const [subPlayers, setSubPlayers] = useState([]);
  const [resPlayers, setResPlayers] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [squadRating, setSquadRating] = useState(88);
  const [squadChemistry, setSquadChemistry] = useState('33/33');

  const players = [
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
    { id: 18, name: "Young", pos: "LB", rating: 75, img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p173954.png", stat: "PAC 70" }
  ];

  const formations = {
    "4-3-3": [
      { role: "GK", left: 50, top: 90 }, { role: "LB", left: 12, top: 72 }, { role: "CB", left: 36, top: 78 }, { role: "CB", left: 64, top: 78 }, { role: "RB", left: 88, top: 72 },
      { role: "CM", left: 32, top: 45 }, { role: "CM", left: 50, top: 52 }, { role: "CM", left: 68, top: 45 },
      { role: "LW", left: 15, top: 15 }, { role: "ST", left: 50, top: 10 }, { role: "RW", left: 85, top: 15 }
    ],
    "4-4-2": [
      { role: "GK", left: 50, top: 90 }, { role: "LB", left: 10, top: 72 }, { role: "CB", left: 35, top: 78 }, { role: "CB", left: 65, top: 78 }, { role: "RB", left: 90, top: 72 },
      { role: "LM", left: 12, top: 40 }, { role: "CM", left: 38, top: 48 }, { role: "CM", left: 62, top: 48 }, { role: "RM", left: 88, top: 40 },
      { role: "ST", left: 35, top: 12 }, { role: "ST", left: 65, top: 12 }
    ],
    "4-2-3-1": [
      { role: "GK", left: 50, top: 90 }, { role: "LB", left: 12, top: 72 }, { role: "CB", left: 36, top: 78 }, { role: "CB", left: 64, top: 78 }, { role: "RB", left: 88, top: 72 },
      { role: "CDM", left: 35, top: 55 }, { role: "CDM", left: 65, top: 55 },
      { role: "CAM", left: 18, top: 28 }, { role: "CAM", left: 50, top: 32 }, { role: "CAM", left: 82, top: 28 }, { role: "ST", left: 50, top: 10 }
    ],
    "5-3-2": [
      { role: "GK", left: 50, top: 92 }, { role: "LWB", left: 8, top: 60 }, { role: "CB", left: 30, top: 75 }, { role: "CB", left: 50, top: 78 }, { role: "CB", left: 70, top: 75 }, { role: "RWB", left: 92, top: 60 },
      { role: "CM", left: 30, top: 40 }, { role: "CM", left: 50, top: 45 }, { role: "CM", left: 70, top: 40 },
      { role: "ST", left: 35, top: 12 }, { role: "ST", left: 65, top: 12 }
    ]
  };

  useEffect(() => {
    setPitchPlayers(players.slice(0, 11));
    setSubPlayers(players.slice(11, 15));
    setResPlayers(players.slice(15));
  }, []);

  useEffect(() => {
    calculateStats();
  }, [pitchPlayers, currentFormation]);

  const getCardStyle = (rating) => {
    if (rating >= 90) {
      return { bgClass: 'bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900', borderClass: 'border-cyan-400', textClass: 'text-cyan-300', shadowClass: 'shadow-cyan-500/40', hasShine: true };
    } else if (rating >= 86) {
      return { bgClass: 'bg-gradient-to-br from-[#4a3b00] via-[#3d3100] to-[#1a1400]', borderClass: 'border-[#ffd700]', textClass: 'text-[#ffd700]', shadowClass: 'shadow-[#ffd700]/20', hasShine: false };
    } else if (rating >= 80) {
      return { bgClass: 'bg-gradient-to-br from-[#424242] via-[#303030] to-[#121212]', borderClass: 'border-[#e0e0e0]', textClass: 'text-[#e0e0e0]', shadowClass: 'shadow-white/10', hasShine: false };
    } else {
      return { bgClass: 'bg-gradient-to-br from-[#3e2723] via-[#2d1b18] to-[#1a0f0d]', borderClass: 'border-[#d7ccc8]', textClass: 'text-[#d7ccc8]', shadowClass: 'shadow-orange-900/20', hasShine: false };
    }
  };

  const handleMouseDown = (e, type, index) => {
    setDraggedItem({ type, index });
  };

  const handleMouseUp = () => {
    setDraggedItem(null);
  };

  const swapPlayers = (sourcetype, sourceIndex, targetType, targetIndex) => {
    if (sourcetype === targetType && sourceIndex === targetIndex) return;

    let newPitchPlayers = [...pitchPlayers];
    let newSubPlayers = [...subPlayers];
    let newResPlayers = [...resPlayers];

    // Get source player
    let sourcePlayer;
    if (sourcetype === 'pitch') sourcePlayer = newPitchPlayers[sourceIndex];
    else if (sourcetype === 'sub') sourcePlayer = newSubPlayers[sourceIndex];
    else sourcePlayer = newResPlayers[sourceIndex];

    // Get target player
    let targetPlayer;
    if (targetType === 'pitch') targetPlayer = newPitchPlayers[targetIndex];
    else if (targetType === 'sub') targetPlayer = newSubPlayers[targetIndex];
    else targetPlayer = newResPlayers[targetIndex];

    // Swap
    if (sourcetype === 'pitch') newPitchPlayers[sourceIndex] = targetPlayer;
    else if (sourcetype === 'sub') newSubPlayers[sourceIndex] = targetPlayer;
    else newResPlayers[sourceIndex] = targetPlayer;

    if (targetType === 'pitch') newPitchPlayers[targetIndex] = sourcePlayer;
    else if (targetType === 'sub') newSubPlayers[targetIndex] = sourcePlayer;
    else newResPlayers[targetIndex] = sourcePlayer;

    setPitchPlayers(newPitchPlayers);
    setSubPlayers(newSubPlayers);
    setResPlayers(newResPlayers);
  };

  const handlePlayerClick = (type, index) => {
    if (!draggedItem) return;
    swapPlayers(draggedItem.type, draggedItem.index, type, index);
    setDraggedItem(null);
  };

  const calculateStats = () => {
    const total = pitchPlayers.reduce((acc, p) => acc + (p ? p.rating : 0), 0);
    const avg = Math.floor(total / 11);
    const currentCoords = formations[currentFormation];
    let chem = 0;
    pitchPlayers.forEach((p, i) => { if(p && p.pos === currentCoords[i].role) chem += 3; });
    chem = Math.min(chem, 33);
    setSquadRating(avg);
    setSquadChemistry(`${chem}/33`);
  };

  const PlayerCard = ({ player, sizeClass, locationType, index }) => {
    const style = getCardStyle(player.rating);
    const isDragging = draggedItem?.type === locationType && draggedItem?.index === index;
    const isSelected = draggedItem?.type === locationType && draggedItem?.index === index;
    
    const handleSwapClick = (e) => {
      e.stopPropagation();
      
      if (isSelected) {
        // Deselect
        setDraggedItem(null);
      } else if (draggedItem) {
        // Swap with selected
        swapPlayers(draggedItem.type, draggedItem.index, locationType, index);
        setDraggedItem(null);
      } else {
        // Select this card
        setDraggedItem({ type: locationType, index });
      }
    };
    
    return (
      <div 
        style={{ opacity: isDragging ? 0.6 : 1 }}
        className={`${sizeClass} ${style.bgClass} ${style.borderClass} border-2 rounded-xl flex flex-col relative shadow-lg hover:scale-105 ${isSelected ? 'ring-4 ring-yellow-400' : ''} transition-all duration-150 group overflow-hidden ${style.shadowClass}`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-white/5 opacity-50 pointer-events-none"></div>
        <div className="absolute top-1.5 left-2 flex flex-col leading-none z-20 pointer-events-none">
          <span className="text-xl font-black italic text-white drop-shadow-md">{player.rating}</span>
          <span className={`text-[9px] font-bold ${style.textClass} uppercase tracking-widest mt-0.5`}>{player.pos}</span>
        </div>
        <div className="flex-1 flex items-end justify-center overflow-hidden relative pointer-events-none">
          <img src={player.img} alt={player.name} className="w-[85%] h-[85%] object-contain relative z-10 drop-shadow-2xl" />
        </div>
        <div className="bg-black/60 backdrop-blur-md py-1.5 text-center border-t border-white/5 relative z-20">
          <div className="text-[10px] font-black uppercase tracking-wider text-white truncate px-1 pointer-events-none">{player.name}</div>
          <div className={`text-[8px] ${style.textClass} font-mono font-bold opacity-90 mt-0.5 pointer-events-none`}>{player.stat}</div>
          <button
            onClick={handleSwapClick}
            className={`mt-1.5 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${
              isSelected
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : draggedItem
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {isSelected ? '✓ Selected' : draggedItem ? 'Swap' : 'Select'}
          </button>
        </div>
      </div>
    );
  };

  return (<>
    <div className="font-display flex flex-col h-screen overflow-hidden bg-[#050807]" style={{backgroundImage: 'radial-gradient(#152a1e 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
      <style>{`@keyframes shine { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
 <Navbar isLoggedIn={true} userName="Alex Smith" userRole="Pro Manager" />

      <div className="flex-1 flex overflow-hidden">
        <div className="absolute top-[80px] left-0 right-0 z-40 bg-[#050807]/80 backdrop-blur-md px-8 py-3 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Formation</h2>
            <div className="bg-black/40 px-3 py-1 rounded text-xs text-white/50 border border-white/5 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">drag_indicator</span> Drag & Drop
            </div>
          </div>
          <div className="flex gap-2 bg-black/60 p-1 rounded-xl border border-white/10">
            {Object.keys(formations).map(fmt => (
              <button key={fmt} onClick={() => setCurrentFormation(fmt)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${fmt === currentFormation ? 'bg-[#39ff14] text-black' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>{fmt}</button>
            ))}
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-white/40 uppercase">Rating</span>
              <span className="text-xl text-yellow-400 italic">{squadRating}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-white/40 uppercase">Chemistry</span>
              <span className={`text-xl font-black italic ${parseInt(squadChemistry) >= 30 ? 'text-[#39ff14]' : 'text-yellow-400'}`}>{squadChemistry}</span>
            </div>
          </div>
        </div>
        <div className="w-full h-full pt-[130px] grid grid-cols-1 lg:grid-cols-[1fr_380px] 2xl:grid-cols-[1fr_450px] gap-0">
          <div className="relative overflow-y-auto p-6 pb-32 bg-[#050807]">
            <div className="relative w-full max-w-[1200px] aspect-[16/11] mx-auto rounded-[3rem] border-[6px] border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden" style={{background: 'repeating-linear-gradient(90deg, #152a1e 0px, #152a1e 100px, #112218 100px, #112218 200px)'}}>
              <div className="absolute inset-0 opacity-40 pointer-events-none">
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-white/30"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[2px] border-white/30 rounded-full"></div>
                <div className="absolute top-[15%] bottom-[15%] left-0 w-32 border-r-[2px] border-y-[2px] border-white/30"></div>
                <div className="absolute top-[15%] bottom-[15%] right-0 w-32 border-l-[2px] border-y-[2px] border-white/30"></div>
              </div>
              <div className="absolute inset-0 w-full h-full">
                {formations[currentFormation].map((coord, index) => {
                  const player = pitchPlayers[index];
                  if (!player) return null;
                  const isCorrectPos = player.pos === coord.role;
                  const posColor = isCorrectPos ? "bg-[#39ff14] text-black border-[#39ff14]" : "bg-red-500 text-white border-red-500";
                  return (
                    <div 
                      key={index} 
                      className="absolute w-24 h-36 transition-all duration-500" 
                      style={{left: `${coord.left}%`, top: `${coord.top}%`, transform: 'translate(-50%, -50%)'}}
                    >
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${posColor} border font-black text-[9px] px-1.5 py-0.5 rounded shadow-lg z-0 transition-colors pointer-events-none`}>{coord.role}</div>
                      <PlayerCard player={player} sizeClass="w-full h-full" locationType="pitch" index={index} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="bg-[#121816]/95 border-l border-white/10 flex flex-col h-full overflow-hidden shadow-2xl z-30">
            <div className="p-4 border-b border-white/10 bg-black/20">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#39ff14]">groups</span> Squad Depth
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3 px-1">
                  <span className="text-xs font-bold text-[#39ff14] uppercase tracking-wider">Substitutes</span>
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/50">7 MAX</span>
                </div>
                <div className="grid grid-cols-2 2xl:grid-cols-2 gap-3">
                  {subPlayers.map((player, index) => (
                    <div key={player.id} className="flex-none">
                      <PlayerCard player={player} sizeClass="w-full h-40" locationType="sub" index={index} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-3 px-1">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Reserves</span>
                </div>
                <div className="grid grid-cols-2 2xl:grid-cols-2 gap-3">
                  {resPlayers.map((player, index) => (
                    <div key={player.id} className="flex-none">
                      <PlayerCard player={player} sizeClass="w-full h-40" locationType="res" index={index} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
              <Link to="/manage_teams">
                <button className="w-full bg-[#39ff14] hover:bg-[#2bff00] text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">save</span>
                  Save Squad
                </button>
              </Link>
            </div>
          </div>
        </div>
        
      </div>
      
    </div>
    <Footer /></>
  );
};

export default Formation_settings;
