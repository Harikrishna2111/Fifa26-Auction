import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { API_URL } from "../config";
import io from "socket.io-client";

const Preacution_phase = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auctionId = searchParams.get("auction_id");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [selectedRetentions, setSelectedRetentions] = useState(new Set());
  const [marketQuery, setMarketQuery] = useState("");
  const [marketPos, setMarketPos] = useState("ALL");
  const [savingRetentions, setSavingRetentions] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const selectionInitializedRef = useRef(false);

  const fetchPreauctionData = () => {
    return fetch(`${API_URL}/api/auctions/${auctionId}/preauction?user_id=${user.id}`)
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Failed to load pre-auction data");
        return payload;
      })
      .then((payload) => {
        setData(payload);
        if (!selectionInitializedRef.current) {
          const initialSelected = Array.isArray(payload?.my_retained_ids) ? payload.my_retained_ids : [];
          setSelectedRetentions(new Set(initialSelected));
          selectionInitializedRef.current = true;
        }
      });
  };

  useEffect(() => {
    if (!auctionId || !user?.id) {
      setLoading(false);
      setError("Missing auction or user context.");
      return;
    }

    selectionInitializedRef.current = false;
    setLoading(true);
    fetchPreauctionData()
      .catch((err) => {
        console.error("Pre-auction fetch error:", err);
        setError(err.message || "Failed to load pre-auction data");
      })
      .finally(() => setLoading(false));
  }, [auctionId, user?.id]);

  useEffect(() => {
    if (!auctionId || !user?.id) return;

    const newSocket = io(API_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5
    });
    setSocket(newSocket);

    const joinPayload = {
      auction_id: auctionId,
      user_id: user.id,
      team_name: user.username || "Your Team"
    };

    newSocket.on("connect", () => {
      newSocket.emit("join_lobby", joinPayload);
    });
    if (newSocket.connected) {
      newSocket.emit("join_lobby", joinPayload);
    }

    newSocket.on("retentions_updated", () => {
      fetchPreauctionData().catch(() => {});
    });

    newSocket.on("preauction_advanced", () => {
      navigate(`/auction?auction_id=${auctionId}`);
    });

    newSocket.on("error", (payload) => {
      if (payload?.message) {
        setSaveMessage(payload.message);
        setAdvancing(false);
      }
    });

    const poll = setInterval(() => {
      fetchPreauctionData().catch(() => {});
    }, 4000);

    return () => {
      clearInterval(poll);
      newSocket.close();
    };
  }, [auctionId, user?.id, navigate]);

  const retentionLimit = data?.auction?.retention_limit ?? 10;
  const myPlayers = data?.my_players_prev || [];
  const marketPlayers = data?.market_players_prev || [];
  const myTeamName = data?.my_team?.team_name || user?.username || "My Team";
  const season = data?.auction?.season || "-";
  const isAdmin = Number(data?.auction?.host_id) === Number(user?.id);
  const allConfirmed = Boolean(data?.all_confirmed);

  const selectedPlayers = useMemo(
    () => myPlayers.filter((p) => selectedRetentions.has(p.id)),
    [myPlayers, selectedRetentions]
  );
  const selectedCost = selectedPlayers.reduce((sum, p) => sum + Number(p.acquired_price || 0), 0);

  const filteredMarket = useMemo(() => {
    return marketPlayers.filter((p) => {
      const q = marketQuery.trim().toLowerCase();
      const posOk = marketPos === "ALL" || String(p.position_group || "").toUpperCase().includes(marketPos);
      const qOk =
        !q ||
        String(p.name || "").toLowerCase().includes(q) ||
        String(p.club || "").toLowerCase().includes(q) ||
        String(p.position_group || "").toLowerCase().includes(q);
      return posOk && qOk;
    });
  }, [marketPlayers, marketQuery, marketPos]);

  const toggleRetention = (playerId) => {
    setSelectedRetentions((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        if (next.size >= retentionLimit) return next;
        next.add(playerId);
      }
      return next;
    });
  };

  const handleConfirmRetentions = async () => {
    if (!auctionId || !user?.id) return;
    setSavingRetentions(true);
    setSaveMessage("");
    try {
      const playerIds = Array.from(selectedRetentions);
      const res = await fetch(`${API_URL}/api/auctions/${auctionId}/retentions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          player_ids: playerIds
        })
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to confirm retentions");
      }

      // Reflect updated budget in current participant snapshot.
      setData((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        if (next.my_team) {
          next.my_team = { ...next.my_team, budget: payload.remaining_budget };
        }
        if (Array.isArray(next.participants)) {
          next.participants = next.participants.map((p) =>
            p.user_id === user.id ? { ...p, budget: payload.remaining_budget } : p
          );
        }
        next.my_retained_ids = payload.retained_player_ids || playerIds;
        return next;
      });
      setSelectedRetentions(new Set(payload.retained_player_ids || playerIds));

      setSaveMessage("Retentions confirmed successfully.");
    } catch (e) {
      console.error("Confirm retentions error:", e);
      setSaveMessage(e.message || "Failed to confirm retentions.");
    } finally {
      setSavingRetentions(false);
    }
  };

  const handleAdvanceToAuction = () => {
    if (!socket || !socket.connected || !isAdmin || !allConfirmed || advancing) return;
    setAdvancing(true);
    setSaveMessage("");
    socket.emit("advance_to_auction", { auction_id: auctionId, user_id: user.id });
  };

  const formatMoney = (amount) => {
    const n = Number(amount || 0);
    if (n >= 1000000) {
      const v = n / 1000000;
      return `$${Number.isInteger(v) ? v : v.toFixed(1)}M`;
    }
    return `$${n.toLocaleString()}`;
  };

  const remainingSlots = Math.max(0, retentionLimit - selectedRetentions.size);
  const progressPct = retentionLimit > 0 ? (selectedRetentions.size / retentionLimit) * 100 : 0;

  if (loading) {
    return (
      <div className="bg-background-dark text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold uppercase tracking-widest text-sm">Loading pre-auction data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background-dark text-white min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-black uppercase mb-3">Pre-Auction Data Unavailable</h2>
          <p className="text-white/60 mb-8">{error}</p>
          <Link to="/user_dashboard" className="inline-flex px-6 py-3 bg-primary text-black rounded-lg font-bold uppercase text-xs tracking-wider">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-white min-h-screen flex flex-col" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />
      <main className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full px-6 lg:px-12 py-8 gap-8 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 mb-2">
              <span className="text-[#98ce8d] text-sm font-medium">Season {season}</span>
              <span className="text-[#274b20] font-bold">/</span>
              <span className="text-white/60 text-sm font-medium">Pre-Auction Management</span>
            </nav>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-extrabold tracking-tight">Pre-Auction: Season {season}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Live Phase
              </span>
            </div>
          </div>
          <div className="bg-[#1a2e16] p-4 rounded-xl border border-[#274b20] min-w-[280px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs uppercase font-bold text-[#98ce8d]">Retention Progress</span>
              <span className="text-sm font-bold text-primary">{selectedRetentions.size} / {retentionLimit}</span>
            </div>
            <div className="h-2 w-full bg-[#12230f] rounded-full overflow-hidden border border-[#274b20]">
              <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(43,255,0,0.5)]" style={{ width: `${progressPct}%` }}></div>
            </div>
            <p className="text-[10px] mt-2 text-[#98ce8d]/60 italic">{remainingSlots} slots remaining before retention cap.</p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 min-h-0">
          <section className="xl:col-span-5 flex flex-col bg-[#1a2e16]/30 rounded-xl border border-[#274b20] overflow-hidden">
            <div className="p-5 border-b border-[#274b20] flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">groups</span>
                {myTeamName} - Retention
              </h2>
              <span className="text-xs text-[#98ce8d]">Selected Cost: {formatMoney(selectedCost)}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {myPlayers.length === 0 && (
                <div className="text-white/50 text-sm italic text-center py-10">No previous-season players found for your team.</div>
              )}
              {myPlayers.map((p) => {
                const retained = selectedRetentions.has(p.id);
                return (
                  <div key={p.id} className={`relative group bg-[#1a2e16] border transition-all rounded-lg overflow-hidden flex h-32 ${retained ? "border-primary/60" : "border-[#274b20] hover:border-primary/40"}`}>
                    <div className="w-32 bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${p.image_url || ""}')` }}>
                      <div className="w-full h-full" style={{ background: "linear-gradient(180deg, rgba(18, 35, 15, 0) 0%, rgba(18, 35, 15, 0.9) 100%)" }}></div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                          <span className="text-xs text-primary font-bold uppercase">{p.position_group || "-"} - {p.club || "Unknown Club"}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{formatMoney(p.acquired_price)}</div>
                          <div className="text-[10px] text-[#98ce8d]">Last Season Price</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[#98ce8d] uppercase">Overall</span>
                            <span className="text-sm font-bold italic">{p.overall || "-"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[#98ce8d] uppercase">Nation</span>
                            <span className="text-sm font-bold italic">{p.nation || "-"}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleRetention(p.id)}
                          className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${retained ? "bg-primary text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
                        >
                          {retained ? "Retained" : "Retain"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="xl:col-span-7 flex flex-col bg-[#1a2e16]/30 rounded-xl border border-[#274b20] overflow-hidden">
            <div className="p-5 border-b border-[#274b20] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shopping_cart</span>
                  Previous Season Market Snapshot
                </h2>
                <div className="flex gap-2">
                  {["ALL", "FWD", "MID", "DEF", "GK"].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setMarketPos(pos)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${marketPos === pos ? "bg-primary text-black border-primary" : "bg-[#12230f] border-[#274b20] text-[#98ce8d] hover:border-primary"}`}
                    >
                      {pos === "ALL" ? "All Positions" : pos}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#98ce8d] scale-75">search</span>
                <input
                  value={marketQuery}
                  onChange={(e) => setMarketQuery(e.target.value)}
                  className="w-full bg-[#12230f] border border-[#274b20] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-[#98ce8d]/40 shadow-inner"
                  placeholder="Search players, clubs or positions..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMarket.length === 0 && (
                <div className="text-white/50 text-sm italic md:col-span-2 text-center py-10">No market players found from previous season.</div>
              )}
              {filteredMarket.slice(0, 40).map((p) => (
                <div key={`${p.id}-${p.user_id || "x"}`} className="bg-[#1a2e16] border border-[#274b20] rounded-xl overflow-hidden group hover:border-primary/40 transition-all flex flex-col">
                  <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url('${p.image_url || ""}')` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e16] to-transparent"></div>
                    <div className="absolute bottom-2 left-3">
                      <h4 className="font-bold text-lg">{p.name}</h4>
                      <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{p.club || "Unknown Club"}</span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <div className="text-[10px] text-[#98ce8d] uppercase">Rating</div>
                          <div className="font-bold">{p.overall || "-"}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-[#98ce8d] uppercase">Pos</div>
                          <div className="font-bold text-primary">{p.position_group || "-"}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#98ce8d]">Last Price</div>
                        <div className="font-bold text-lg">{formatMoney(p.acquired_price)}</div>
                      </div>
                    </div>
                    <button className="w-full py-2.5 bg-primary/10 border border-primary/40 text-primary rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-primary hover:text-black transition-all">
                      Propose Trade
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#98ce8d] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">history</span>
            Previous Season Snapshot
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {(data?.participants || []).map((p) => (
              <div key={p.user_id} className="flex-shrink-0 w-80 bg-[#1a2e16] border border-[#274b20] rounded-lg p-3 flex items-center gap-4">
                <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary">groups</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-primary mb-0.5 uppercase tracking-wider">{p.team_name}</div>
                  <div className="text-sm font-medium">{p.players_count_prev || 0} players from last season</div>
                  <div className="text-[10px] text-[#98ce8d]">Current Budget: {formatMoney(p.budget || 0)}</div>
                  <div className={`text-[10px] font-bold uppercase ${p.retention_confirmed ? "text-primary" : "text-yellow-300"}`}>
                    {p.retention_confirmed ? "Retentions Confirmed" : "Pending Confirmation"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="sticky bottom-0 bg-background-dark/95 backdrop-blur-xl border-t border-[#274b20] px-6 lg:px-12 py-5 z-50">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8 text-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-[#98ce8d]">Active Retentions</span>
              <span className="font-bold text-primary">{selectedRetentions.size} Players</span>
            </div>
            <div className="w-px h-8 bg-[#274b20]"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-[#98ce8d]">Retention Cost</span>
              <span className="font-bold">{formatMoney(selectedCost)}</span>
            </div>
            <div className="w-px h-8 bg-[#274b20]"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-[#98ce8d]">Remaining Slots</span>
              <span className="font-bold text-primary italic">{remainingSlots}</span>
            </div>
            <div className="w-px h-8 bg-[#274b20]"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-[#98ce8d]">Market Players</span>
              <span className="font-bold">{filteredMarket.length}</span>
            </div>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button
              onClick={handleConfirmRetentions}
              disabled={savingRetentions}
              className={`flex-1 sm:flex-none px-8 py-3 bg-primary text-black rounded-xl font-extrabold transition-all uppercase tracking-widest text-xs ${savingRetentions ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(43,255,0,0.3)]"}`}
            >
              {savingRetentions ? "Saving..." : "Confirm Retentions"}
            </button>
            {isAdmin && (
              <button
                onClick={handleAdvanceToAuction}
                disabled={!allConfirmed || advancing}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all uppercase tracking-widest text-xs ${
                  allConfirmed && !advancing
                    ? "bg-white/5 border border-white/10 hover:bg-white/10"
                    : "bg-white/5 border border-white/10 opacity-50 cursor-not-allowed"
                }`}
              >
                {advancing ? "Advancing..." : "Ready for Auction"}
                <span className="material-symbols-outlined scale-75">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
        {saveMessage && (
          <div className="max-w-[1440px] mx-auto mt-3 text-xs font-bold uppercase tracking-wider text-primary">
            {saveMessage}
          </div>
        )}
      </footer>
    </div>
  );
};

export default Preacution_phase;
