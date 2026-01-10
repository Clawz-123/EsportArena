import React, { useEffect } from 'react';
import { User, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { fetchUserProfile } from '../../slices/viewprofile';

const ViewProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading, error } = useSelector((state) => state.profile);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchUserProfile());
  }, [dispatch, isAuthenticated, navigate]);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0]?.[0] || ""}${parts[parts.length - 1]?.[0] || ""}`.toUpperCase() || "U";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] pt-24">
        <Header />
        <div className="container mx-auto px-6 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] pt-24">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-400">Failed to load profile. Please try again.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) return null;
  const displayName = profile.username || profile.organizer_name || profile.email || "User";
  const initials = getInitials(displayName);

  return (
    <div className="min-h-screen bg-[#0F172A] pt-24">
      <Header />
      <div className="container mx-auto px-50 py-8">

        <div className="bg-[#111625] border border-slate-800 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            {profile.profile_image ? (
              <img 
                src={profile.profile_image} 
                alt={displayName}
                className="h-24 w-24 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shrink-0">
                {initials}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{displayName}</h1>
              <span className="bg-[#1e2538] text-slate-400 px-4 py-1.5 rounded-md text-sm font-medium">
                {profile.role || "User"}
              </span>
            </div>

            <div className="flex gap-4 mt-4 md:mt-0">
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-[#1e2538] hover:bg-slate-700 text-slate-200 px-6 py-2.5 rounded hover:text-white font-medium transition-colors"
              >
                Dashboard
              </button>
              <Link to="/update-profile">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded font-medium transition-colors"
                >
                  Edit Profile
                </button> 
              </Link>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
        <div className="bg-[#111625] border border-slate-800 rounded-lg p-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-130">

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-slate-400" />
                <label className="text-slate-400 text-sm">Email Address</label>
              </div>
              <p className="text-white font-medium pl-8">{profile.email || "N/A"}</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-slate-400" />
                <label className="text-slate-400 text-sm">Member Since</label>
              </div>
              <p className="text-white font-medium pl-8">{formatDate(profile.date_joined)}</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <User className="h-5 w-5 text-slate-400" />
                <label className="text-slate-400 text-sm">Account Type</label>
              </div>
              <p className="text-white font-medium pl-8">{profile.role || "N/A"}</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Phone className="h-5 w-5 text-slate-400" />
                <label className="text-slate-400 text-sm">Contact No</label>
              </div>
              <p className="text-white font-medium pl-8">{profile.contact || "N/A"}</p>
            </div>

          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default ViewProfile;
