import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { store } from './store/store.js'
import Home from './pages/public/home.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import VerifyOtp from './pages/Otp/VerifyOtp.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import ViewProfile from './pages/public/ViewProfile.jsx'
import UpdateProfile from './pages/public/UpdateProfile.jsx'
import OrgDashboard from './pages/organizer/OrgDashboard.jsx'
import OrgTournaments from './pages/organizer/OrgTournaments.jsx'
import OrgCreateTournament from './pages/organizer/OrgCreateTournament.jsx'
import OrgParticipant from './pages/organizer/individual/OrgTournamentHeader.jsx'
import ContactUs from './pages/public/ContactUs.jsx'
import Tournament from './pages/public/Tournament.jsx'
import PlayerDashboard from './pages/player/PlayerDashboard.jsx'
import PlayerMyTournament from './pages/player/PlayerMyTournament.jsx'
import TournaHeader from './pages/public/TounamentPage/TournaHeader.jsx'
import OrgResultVerification from './pages/organizer/OrgResultVerification.jsx'

// Creating a component to protect routes that require authentication
const AuthGate = ({ children }) => {
  // Reading the authentication state from the Redux store
  const { isAuthenticated } = useSelector((state) => state.auth || {})
  const location = useLocation()

  if (!isAuthenticated) {
    toast.info('You need to login first before watching other pages', {
      toastId: `auth-required-${location.pathname}`,
    })
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/verify-otp' element={<VerifyOtp />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/view-profile' element={<AuthGate> <ViewProfile /></AuthGate>} />
          <Route path='/update-profile' element={<AuthGate> <UpdateProfile /></AuthGate>} />
          <Route path='/OrgDashboard' element={<AuthGate> <OrgDashboard /></AuthGate>} />
          <Route path='/Orgtournaments' element={<AuthGate> <OrgTournaments /></AuthGate>} />
          <Route path='/OrgCreateTournament' element={<AuthGate> <OrgCreateTournament /></AuthGate>} />
          <Route path='/organizer/tournaments/:id' element={<AuthGate> <OrgParticipant /></AuthGate>} />
          <Route path='/contact-us' element={<AuthGate> <ContactUs /></AuthGate>} />
          <Route path='/tournaments' element={<AuthGate> <Tournament /></AuthGate>} />
          <Route path='/tournaments/:id' element={<AuthGate> <TournaHeader /></AuthGate>} />
          <Route path='/PlayerDashboard' element={<AuthGate> <PlayerDashboard /></AuthGate>} />
          <Route path='/PlayerMyTournament' element={<AuthGate> <PlayerMyTournament /></AuthGate>} />
          <Route path='/Tournaheader' element={<AuthGate> <TournaHeader /></AuthGate>} />
          <Route path='/OrgResultVerification' element={<AuthGate> <OrgResultVerification /></AuthGate>} />



        </Routes>
      </Router>
    </Provider>
  );
}

export default App;