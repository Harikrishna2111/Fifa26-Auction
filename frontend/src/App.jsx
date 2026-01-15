import { useState } from 'react'
import './App.css'
import Landing_page from './pages/Landing_page'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing_page />} />
    </Routes>
    </BrowserRouter>
  
  )
}

export default App
