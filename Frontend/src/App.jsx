import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store.js'; 
import Home from './pages/public/home.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import VerifyOtp from './pages/Otp/VerifyOtp.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ViewProfile from './pages/public/ViewProfile.jsx';
import UpdateProfile from './pages/public/UpdateProfile.jsx';
import OrgDashboard  from './pages/organizer/OrgDashboard.jsx';
import OrgTournaments from './pages/organizer/OrgTournaments.jsx';
import OrgCreateTournament from './pages/organizer/OrgCreateTournament.jsx';
import ContactUs from './pages/public/ContactUs.jsx';

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
          <Route path='/view-profile' element={<ViewProfile />} />
          <Route path='/update-profile' element={<UpdateProfile />} />
          <Route path='/OrgDashboard' element={<OrgDashboard />} />
          <Route path='/Orgtournaments' element={<OrgTournaments />} />
          <Route path='/OrgCreateTournament' element={<OrgCreateTournament />} />
          <Route path='/contact-us' element={<ContactUs />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;