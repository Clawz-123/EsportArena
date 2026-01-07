import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { Gamepad2 } from "lucide-react";
import { toast } from "react-toastify";
import { resendOtp, clearOtpState } from "../../slices/auth";
import { forgotPasswordValidationSchema } from "../utils/resetvalidation";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { resendLoading, resendError, resendSuccess } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        dispatch(clearOtpState());
        return () => {
            dispatch(clearOtpState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (resendSuccess) {
            toast.success("OTP sent successfully! Redirecting to verification");
            const timer = setTimeout(() => navigate("/verify-otp"), 1500);
            return () => clearTimeout(timer);
        }
    }, [resendSuccess, navigate]);

    useEffect(() => {
        if (!resendError) return;

        let errorMessage = "Failed to send OTP";
        if (resendError?.error) errorMessage = resendError.error;
        else if (resendError?.detail) errorMessage = resendError.detail;
        else if (resendError?.Error_Message?.error)
            errorMessage = resendError.Error_Message.error;
        else if (typeof resendError === "string")
            errorMessage = resendError;

        toast.error(errorMessage);
    }, [resendError]);

    const formik = useFormik({
        initialValues: { email: "" },
        validationSchema: forgotPasswordValidationSchema,
        onSubmit: (values) => {
            localStorage.setItem(
                "forgotPasswordEmail",
                JSON.stringify({ email: values.email })
            );

            dispatch(resendOtp({ email: values.email }));
        },
    });

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] px-4 py-8">
            <div className="w-full max-w-md">
                <div className="bg-[#151b2b]/80 rounded-2xl border border-[#1e293b] p-8 shadow-lg relative">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Gamepad2 className="w-8 h-8 text-blue-500" />
                            <h1 className="text-2xl font-bold">
                                <span className="text-blue-500">Esports</span>{' '}
                                <span className="bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Arena</span>
                            </h1>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
                        <p className="text-gray-400">Enter your registered email to receive a password reset code</p>
                    </div>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-white mb-2 font-medium">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your registered email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full px-4 py-3 rounded-xl bg-[#1a1f2e] border transition-colors text-white placeholder-gray-500 focus:outline-none ${formik.touched.email && formik.errors.email
                                    ? 'border-red-500'
                                    : 'border-[#1e293b] focus:ring-2 focus:ring-blue-500'
                                    }`}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={resendLoading}
                            className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {resendLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending OTP...
                                </span>
                            ) : (
                                "Send Reset Code"
                            )}
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-slate-400">Remember your password? <Link to="/login" className="text-blue-500 hover:text-blue-400 font-meduim">Back to Login</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
