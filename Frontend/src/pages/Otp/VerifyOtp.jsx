import React, { useState, useEffect } from "react";
import { Gamepad2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../axios/axiousinstance";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [registeredData, setRegisteredData] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("registeredData"));
    if (!data || !data.email) {
      navigate("/register");
    } else {
      setRegisteredData(data);
    }
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!registeredData?.email) {
      setError("No registration email found. Please register again.");
      setLoading(false);
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        email: registeredData.email,
        otp: otp,
      };

      const response = await axiosInstance.post("/accounts/verify-otp/", payload);
      setSuccess("OTP verified successfully! Redirecting to login...");
      localStorage.removeItem("registeredData");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      let errorMessage = "Failed to verify OTP";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.Error_Message?.error) {
        errorMessage = err.response.data.Error_Message.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");

    if (!registeredData?.email) {
      setError("No registration email found.");
      return;
    }

    try {
      await axiosInstance.post("/accounts/resend-otp/", {
        email: registeredData.email,
      });
      setSuccess("OTP resent successfully!");
    } catch (err) {
      let errorMessage = "Failed to resend OTP";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-[#0f1420] rounded-2xl border border-[#1e293b] p-8 shadow-lg relative overflow-hidden">
                      {/* Background glow circles */}
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

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
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
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
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
                className="text-blue-500 hover:underline font-medium"
              >
               Resend OTP
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