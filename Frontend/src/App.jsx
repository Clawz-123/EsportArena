import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/public/home.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'

function App() {


  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
