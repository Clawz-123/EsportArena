import React, { useState, useEffect } from 'react';
import { Camera, Loader2, ArrowLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { toast } from 'react-toastify';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { fetchUserProfile, updateUserProfile, clearUpdateSuccess } from '../../slices/viewprofile';
import { updateProfileValidationSchema } from '../utils/UpdateProfileValidation';

const UpdateProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { profile, loading } = useSelector((state) => state.profile);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { updating, updateSuccess, updateError } = useSelector((state) => state.profile);

    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        dispatch(fetchUserProfile());
    }, [dispatch, isAuthenticated, navigate]);

    const displayImagePreview = imagePreview || (profile && profile.profile_image) || null;

    useEffect(() => {
        if (updateSuccess) {
            toast.success('Profile updated successfully!');
            dispatch(clearUpdateSuccess());
            setTimeout(() => navigate('/view-profile'), 1500);
        }
    }, [updateSuccess, dispatch, navigate]);

    useEffect(() => {
        if (updateError) {
            const errorMessage = typeof updateError === 'string' 
                ? updateError 
                : updateError.message || 'Failed to update profile. Please try again.';
            toast.error(errorMessage);
        }
    }, [updateError]);

    const getInitials = (name) => {
        if (!name) return "U";
        const parts = String(name).trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0]?.[0] || ""}${parts[parts.length - 1]?.[0] || ""}`.toUpperCase() || "U";
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFormSubmit = (values) => {
        const digitsOnlyPhone = (values.contactNo || '').replace(/\D/g, '');
        const updateData = {
            name: values.displayName,
            phone_number: digitsOnlyPhone,
        };

        if (profileImage) {
            updateData.profile_image = profileImage;
        }
        dispatch(updateUserProfile(updateData));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e1a] pt-24">
                <Header />
                <div className="container mx-auto px-6 py-8 flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!profile) return null;

    const displayName = profile?.username || profile?.organizer_name || '';
    const initials = getInitials(displayName);

    return (
        <div className="min-h-screen bg-[#0F172A] pt-24 font-inter text-white">
            <Header />
            <div className="container mx-auto px-6 py-12 max-w-3xl">
                <div className="bg-[#111625] border border-slate-800 rounded-xl p-8 shadow-xl">
                    <Link
                        to="/view-profile"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Profile
                    </Link>
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
                        <p className="text-slate-400 text-sm">Update your profile information</p>
                    </div>

                    <Formik
                        initialValues={{
                            displayName: profile?.username || profile?.organizer_name || '',
                            contactNo: profile?.contact || '',
                            email: profile?.email || '',
                            accountType: profile?.role || 'Player',
                        }}
                        validationSchema={updateProfileValidationSchema}
                        onSubmit={handleFormSubmit}
                        enableReinitialize
                    >
                        {({ errors, touched, isSubmitting }) => (
                            <Form className="space-y-8">
                        <div className="flex justify-center mb-8">
                            <div className="relative group">
                                {displayImagePreview ? (
                                    <img
                                        src={displayImagePreview}
                                        alt="Profile"
                                        className="h-28 w-28 rounded-full object-cover border-4 border-[#1e2538]"
                                    />
                                ) : (
                                    <div className="h-28 w-28 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-[#1e2538]">
                                        {initials}
                                    </div>
                                )}
                                <label
                                    htmlFor="profile-image"
                                    className="absolute bottom-1 right-1 h-9 w-9 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg border-2 border-[#111625]"
                                >
                                    <Camera className="h-4 w-4 text-white" />
                                </label>
                                <input
                                    id="profile-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="displayName" className="block text-slate-300 text-sm font-semibold">
                                        Display Name
                                    </label>
                                    <Field
                                        type="text"
                                        id="displayName"
                                        name="displayName"
                                        placeholder="Enter your display name"
                                        className={`w-full px-4 py-3.5 rounded-lg bg-[#0F172A] border text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${errors.displayName && touched.displayName ? 'border-red-500' : 'border-slate-700'}`}
                                    />
                                    <ErrorMessage name="displayName" component="p" className="text-red-400 text-xs" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="contactNo" className="block text-slate-300 text-sm font-semibold">
                                        Contact No
                                    </label>
                                    <Field
                                        type="tel"
                                        id="contactNo"
                                        name="contactNo"
                                        placeholder="Enter your contact number"
                                        className={`w-full px-4 py-3.5 rounded-lg bg-[#0F172A] border text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${errors.contactNo && touched.contactNo ? 'border-red-500' : 'border-slate-700'}`}
                                    />
                                    <ErrorMessage name="contactNo" component="p" className="text-red-400 text-xs" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-slate-300 text-sm font-semibold">
                                        Email Address
                                    </label>
                                    <Field
                                        type="email"
                                        id="email"
                                        name="email"
                                        disabled
                                        className="w-full px-4 py-3.5 rounded-lg bg-[#1e2538]/50 border border-slate-700/50 text-slate-400 cursor-not-allowed"
                                    />
                                    <p className="text-slate-500 text-xs">Email cannot be changed</p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="accountType" className="block text-slate-300 text-sm font-semibold">
                                        Account Type
                                    </label>
                                    <Field
                                        type="text"
                                        id="accountType"
                                        name="accountType"
                                        disabled
                                        className="w-full px-4 py-3.5 rounded-lg bg-[#1e2538]/50 border border-slate-700/50 text-slate-400 cursor-not-allowed capitalize"
                                    />
                                </div>
                        </div>

                                <div className="flex justify-between items-center pt-6">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/view-profile')}
                                        className="px-8 py-3 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-medium"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={updating || isSubmitting}
                                        className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {updating || isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Saving Changes...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default UpdateProfile;
