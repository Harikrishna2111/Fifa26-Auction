import { useState } from 'react'
import './App.css'
import Landing_page from './pages/Landing_page'
import Player_stats from './pages/Player_stats'
import Auction_rules from './pages/Auction_rules'
import Discover from './pages/Discover'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import User_dashboard from './pages/User_dashboard'

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

    </Routes>
    </BrowserRouter>
  
  )
}

export default App
