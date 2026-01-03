import React, { useState, useEffect } from "react";
import { Gamepad2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
    const data = JSON.parse(localStorage.getItem("registeredData"));
    return data || null;
  });
  const [displayError, setDisplayError] = useState("");
  const [displaySuccess, setDisplaySuccess] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("registeredData"));
    if (!data || !data.email) {
      navigate("/register");
    }

    dispatch(clearOtpState());

    return () => {
      dispatch(clearOtpState());
    };
  }, [navigate, dispatch]);

  useEffect(() => {
    if (otpSuccess) {
      setTimeout(() => {
        setDisplaySuccess("OTP verified successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }, 0);
    }

    if (otpError) {
      setTimeout(() => {
        let errorMessage = "Failed to verify OTP";
        if (otpError?.error) {
          errorMessage = otpError.error;
        } else if (otpError?.detail) {
          errorMessage = otpError.detail;
        } else if (otpError?.Error_Message?.error) {
          errorMessage = otpError.Error_Message.error;
        } else if (typeof otpError === 'string') {
          errorMessage = otpError;
        }
        setDisplayError(errorMessage);
      }, 0);
    }
  }, [otpSuccess, otpError, navigate]);

  useEffect(() => {
    if (resendSuccess) {
      setTimeout(() => {
        setDisplaySuccess("OTP resent successfully!");
        setTimeout(() => {
          setDisplaySuccess("");
          dispatch(clearOtpState());
        }, 3000);
      }, 0);
    }

    if (resendError) {
      setTimeout(() => {
        let errorMessage = "Failed to resend OTP";
        if (resendError?.error) {
          errorMessage = resendError.error;
        } else if (resendError?.detail) {
          errorMessage = resendError.detail;
        } else if (typeof resendError === 'string') {
          errorMessage = resendError;
        }
        setDisplayError(errorMessage);
      }, 0);
    }
  }, [resendSuccess, resendError, dispatch]);

  const handleVerify = (e) => {
    e.preventDefault();
    setDisplayError("");
    setDisplaySuccess("");

    if (!registeredData?.email) {
      setDisplayError("No registration email found. Please register again.");
      return;
    }

    if (otp.length !== 6) {
      setDisplayError("Please enter a valid 6-digit OTP");
      return;
    }

    dispatch(verifyOtp({
      email: registeredData.email,
      otp: otp,
    }));
  };

  const handleResend = () => {
    setDisplayError("");
    setDisplaySuccess("");

    if (!registeredData?.email) {
      setDisplayError("No registration email found.");
      return;
    }

    dispatch(resendOtp({
      email: registeredData.email,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-[#0f1420] rounded-2xl border border-[#1e293b] p-8 shadow-lg relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              aria-hidden
              className="absolute"
              style={{
                width: 420,
                height: 420,
                borderRadius: '50%',
                background: '#3A86FF',
                opacity: 0.10,
                filter: 'blur(80px)',
                transform: 'translateX(-80px)'
              }}
            />
            <div
              aria-hidden
              className="absolute"
              style={{
                width: 520,
                height: 520,
                borderRadius: '50%',
                background: '#D946EF',
                opacity: 0.08,
                filter: 'blur(80px)',
                transform: 'translateX(80px)'
              }}
            />
          </div>
          <div className="relative text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gamepad2 className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">
                <span className="text-blue-500">Esports</span>{" "}
                <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-pink-500">Arena</span>
              </h1>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">Verify OTP</h2>
            <p className="text-gray-400">Enter the 6-digit code sent to your email</p>
          </div>

          {displaySuccess && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">{displaySuccess}</p>
            </div>
          )}

          {displayError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className="mb-6">
              <label className="block text-white mb-2 font-medium">One Time Password (6 digits)</label>
              <input
                type="text"
                maxLength="6"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setOtp(value);
                }}
                className="w-full text-center tracking-[0.4em] text-xl px-4 py-3 rounded-xl bg-[#1a1f2e] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-400 text-sm mt-2">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <button
              type="submit"
              disabled={otpLoading || otp.length !== 6}
              className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {otpLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </span>
              ) : "Verify OTP"}
            </button>

            <div className="text-center text-sm text-gray-400 mb-6">
              <span> Did't get the code, </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-blue-500 hover:underline font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resendLoading ? "Resending..." : "Resend OTP"}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-[#1e293b]">
              <p className="text-center text-gray-400 text-sm">
                <span> Go Back to, </span>
                <Link to="/register" className="text-blue-500 hover:underline font-medium">
                  Register
                </Link>
                <span> Page </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;