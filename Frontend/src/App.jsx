import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { store } from './store/store.js'
import Home from './pages/public/Home.jsx'
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
import OrgTournamentHistory from './pages/organizer/OrgTournamentHistory.jsx'
import ContactUs from './pages/public/ContactUs.jsx'
import Tournament from './pages/public/Tournament.jsx'
import PlayerDashboard from './pages/player/PlayerDashboard.jsx'
import PlayerMyTournament from './pages/player/PlayerMyTournament.jsx'
import PlayerWalletandEarning from './pages/player/PlayerWalletandEarning.jsx'
import PlayerNotifications from './pages/player/Notifications.jsx'
import PlayerTournamentHistory from './pages/player/PlayerTournamentHistory.jsx'
import OrgNotification from './pages/organizer/OrgNotification.jsx'
import WalletKhaltiReturn from './pages/player/WalletKhaltiReturn.jsx'
import WalletEsewaReturn from './pages/player/WalletEsewaReturn.jsx'
import WalletStripeReturn from './pages/player/WalletStripeReturn.jsx'
import TournaHeader from './pages/public/TounamentPage/TournaHeader.jsx'
import OrgWallet from './pages/organizer/OrgWallet.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminPayment from './pages/admin/AdminPayment.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminTournaments from './pages/admin/AdminTournaments.jsx'
import AdminReports from './pages/admin/AdminReports.jsx'
import NotificationSocketManager from './components/common/NotificationSocketManager.jsx'

// Redirect SuperAdmin away from public pages to admin dashboard
const HomeRedirect = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth || {})
  if (isAuthenticated && user?.role === 'SuperAdmin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  return children
}

// Pages that admins are allowed to access (besides /admin/* routes)
const ADMIN_ALLOWED_PATHS = ['/view-profile', '/update-profile']

// Creating a component to protect routes that require authentication
const AuthGate = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth || {})
  const location = useLocation()

  if (!isAuthenticated) {
    toast.info('You need to login first before watching other pages', {
      toastId: `auth-required-${location.pathname}`,
    })
    return <Navigate to="/" replace />
  }

  // Block SuperAdmin from accessing player/organizer pages
  if (user?.role === 'SuperAdmin' && !ADMIN_ALLOWED_PATHS.includes(location.pathname)) {
    toast.error('You do not have access to this page', { toastId: 'admin-no-access' })
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}

// Protect admin-only routes (superuser check)
const AdminGate = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth || {})
  const location = useLocation()

  if (!isAuthenticated) {
    toast.info('You need to login first', { toastId: `auth-required-${location.pathname}` })
    return <Navigate to="/" replace />
  }

  if (user?.role !== 'SuperAdmin') {
    toast.error('Access denied. Admin only.', { toastId: 'admin-denied' })
    return <Navigate to="/" replace />
  }

  return children
}

// Keep /notifications route working while routing to role-specific pages
const NotificationsRedirect = () => {
  const { user } = useSelector((state) => state.auth || {})
  const target = user?.is_organizer ? '/organizer/notifications' : '/player/notifications'
  return <Navigate to={target} replace />
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <NotificationSocketManager />
        <Routes>
          <Route path='/' element={<HomeRedirect><Home /></HomeRedirect>} />
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
          <Route path='/organizer/history' element={<AuthGate> <OrgTournamentHistory /></AuthGate>} />
          <Route path='/contact-us' element={<AuthGate> <ContactUs /></AuthGate>} />
          <Route path='/tournaments' element={<AuthGate> <Tournament /></AuthGate>} />
          <Route path='/tournaments/:id' element={<AuthGate> <TournaHeader /></AuthGate>} />
          <Route path='/PlayerDashboard' element={<AuthGate> <PlayerDashboard /></AuthGate>} />
          <Route path='/PlayerMyTournament' element={<AuthGate> <PlayerMyTournament /></AuthGate>} />
          <Route path='/PlayerWalletandEarning' element={<AuthGate> <PlayerWalletandEarning /></AuthGate>} />
          <Route path='/player/notifications' element={<AuthGate> <PlayerNotifications /></AuthGate>} />
          <Route path='/player/history' element={<AuthGate> <PlayerTournamentHistory /></AuthGate>} />
          <Route path='/organizer/notifications' element={<AuthGate> <OrgNotification /></AuthGate>} />
          <Route path='/notifications' element={<AuthGate> <NotificationsRedirect /></AuthGate>} />
          <Route path='/wallet/khalti-return' element={<WalletKhaltiReturn />} />
          <Route path='/wallet/esewa-return' element={<WalletEsewaReturn />} />
          <Route path='/wallet/stripe-return' element={<WalletStripeReturn />} />
          <Route path='/Tournaheader' element={<AuthGate> <TournaHeader /></AuthGate>} />
          <Route path='/OrgWallet' element={<AuthGate> <OrgWallet /></AuthGate>} />

          {/* Admin Routes */}
          <Route path='/admin/dashboard' element={<AdminGate> <AdminDashboard /></AdminGate>} />
          <Route path='/admin/withdrawals' element={<AdminGate> <AdminPayment /></AdminGate>} />
          <Route path='/admin/users' element={<AdminGate> <AdminUsers /></AdminGate>} />
          <Route path='/admin/tournaments' element={<AdminGate> <AdminTournaments /></AdminGate>} />
          <Route path='/admin/reports' element={<AdminGate> <AdminReports /></AdminGate>} />

        </Routes>
      </Router>
    </Provider>
  );
}

export default App;