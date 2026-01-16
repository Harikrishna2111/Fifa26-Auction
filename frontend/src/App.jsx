import { useState } from 'react'
import './App.css'
import Landing_page from './pages/Landing_page'
import Player_stats from './pages/Player_stats'
import Auction_rules from './pages/Auction_rules'
import Discover from './pages/Discover'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import User_dashboard from './pages/User_dashboard'
import View_all_auctions from './pages/View_all_auctions'
import Manage_teams from './pages/Manage_teams'
import Formation_settings from './pages/Formation_settings'
import Create_lobby from './pages/Create_lobby'
import Join_lobby from './pages/Join_lobby'
import Lobby from './pages/lobby'
import Preacution_phase from './pages/Preauction_phase'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing_page />} />
      <Route path="/player_stats" element={<Player_stats />} />
      <Route path="/auction_rules" element={<Auction_rules />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/login" element={<Login />} />
      <Route path="/user_dashboard" element={<User_dashboard />} />
      <Route path='/view_all_auctions' element={<View_all_auctions />} />
      <Route path='/manage_teams' element={<Manage_teams />} />
      <Route path='/formation_settings' element={<Formation_settings />} />
      <Route path='/create_lobby' element={<Create_lobby />} />
      <Route path='/join_lobby' element={<Join_lobby />} />
      <Route path='/lobby' element={<Lobby />} />
      <Route path="/preauction_phase" element={<Preacution_phase />} />
    </Routes>
    </BrowserRouter>
  
  )
}

export default App
