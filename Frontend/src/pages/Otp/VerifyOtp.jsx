import React, { useState, useEffect } from "react";
import { Gamepad2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { verifyOtp, resendOtp, clearOtpState } from "../../slices/auth";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    otpLoading,
    otpError,
    otpSuccess,
    resendLoading,
    resendSuccess,
    resendError
  } = useSelector((state) => state.auth);

  const [registeredData] = useState(() => {
    const regData = JSON.parse(localStorage.getItem("registeredData"));
    const forgotData = JSON.parse(localStorage.getItem("forgotPasswordEmail"));
    return regData || forgotData || null;
  });

  const [isForgotPasswordFlow] = useState(() => {
    return !!localStorage.getItem("forgotPasswordEmail");
  });

  useEffect(() => {
    const regData = JSON.parse(localStorage.getItem("registeredData"));
    const forgotData = JSON.parse(localStorage.getItem("forgotPasswordEmail"));
    const data = regData || forgotData;

    if (!data || !data.email) {
      navigate("/register");
    }

    dispatch(clearOtpState());
    return () => dispatch(clearOtpState());
  }, [navigate, dispatch]);

  useEffect(() => {
    if (otpSuccess) {
      toast.success("OTP verified successfully!");
      const timer = setTimeout(() => {
        navigate(isForgotPasswordFlow ? "/reset-password" : "/login");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [otpSuccess, navigate, isForgotPasswordFlow]);

  useEffect(() => {
    if (!otpError) return;

    let message = "Failed to verify OTP";

    if (otpError?.error) message = otpError.error;
    else if (otpError?.detail) message = otpError.detail;
    else if (otpError?.Error_Message?.error)
      message = otpError.Error_Message.error;
    else if (typeof otpError === "string") message = otpError;

    toast.error(message);
  }, [otpError]);

  useEffect(() => {
    if (resendSuccess) {
      toast.success("OTP resent successfully!");
      dispatch(clearOtpState());
    }

    if (!resendError) return;

    let message = "Failed to resend OTP";

    if (resendError?.error) message = resendError.error;
    else if (resendError?.detail) message = resendError.detail;
    else if (typeof resendError === "string") message = resendError;

    toast.error(message);
  }, [resendSuccess, resendError, dispatch]);

  const handleVerify = (e) => {
    e.preventDefault();

    if (!registeredData?.email) {
      toast.error("No registration email found. Please register again.");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    dispatch(
      verifyOtp({
        email: registeredData.email,
        otp: otp,
      })
    );
  };

  const handleResend = () => {
    if (!registeredData?.email) {
      toast.error("No registration email found.");
      return;
    }

    dispatch(
      resendOtp({
        email: registeredData.email,
      })
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A]  px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-[#151b2b]/80 rounded-2xl border border-[#1e293b] p-8 shadow-lg relative">
          <div className="text-center mb-8 relative">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Gamepad2 className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold">
                <span className="text-blue-500">Esports</span>{" "}
                <span className="bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Arena
                </span>
              </h1>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
              Verify OTP
            </h2>

            <p className="text-gray-400">
              Enter the 6-digit code sent to your email
            </p>
          </div>
          {/* Form */}
          <form onSubmit={handleVerify}>
            <div className="mb-5">
              <label className="block text-white mb-2 font-medium">
                One-Time Password
              </label>

              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter 6-digit OTP"
                className="w-full text-center text-lg tracking-[0.35em] px-4 py-3 rounded-xl bg-[#1a1f2e] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-gray-400 text-xs mt-1">
                Only numbers are allowed
              </p>
            </div>

            <button
              type="submit"
              disabled={otpLoading || otp.length !== 6}
              className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition shadow-[0_0_12px_#3b82f6] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {otpLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="text-center mt-4 text-sm text-slate-300">
              Didn't receive code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50"
              >
                {resendLoading ? "Resending..." : "Resend OTP"}
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-slate-400">
                Go back to{" "}
                <Link
                  to="/register"
                  className="text-blue-500 hover:text-blue-400 font-bold"
                >
                  Register Page
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
