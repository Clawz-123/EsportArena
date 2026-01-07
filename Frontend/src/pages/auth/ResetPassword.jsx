import React, { useState, useEffect } from "react";
import { Gamepad2, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { resetPasswordValidationSchema } from "../utils/resetvalidation";
import { resetPassword, clearOtpState } from "../../slices/auth";

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { resetLoading, resetError, resetSuccess } = useSelector(
    (state) => state.auth
  );

  const storedEmail = (() => {
    const forgot = JSON.parse(localStorage.getItem("forgotPasswordEmail"));
    const registered = JSON.parse(localStorage.getItem("registeredData"));
    return forgot?.email || registered?.email || "";
  })();

  const [showPasswords, setShowPasswords] = useState({});

  const resetFields = [
    { id: "newPassword", label: "New Password", type: "password", placeholder: "Enter new password" },
    { id: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Confirm new password" }
  ];

  useEffect(() => {
    dispatch(clearOtpState());
    return () => dispatch(clearOtpState());
  }, [dispatch]);

  useEffect(() => {
    if (resetSuccess) {
      toast.success("Password reset successful! Redirecting to login");
      localStorage.removeItem("forgotPasswordEmail");
      const timer = setTimeout(() => navigate("/login"), 1500);
      return () => clearTimeout(timer);
    }
  }, [resetSuccess, navigate]);

  useEffect(() => {
    if (!resetError) return;

    let msg = "Failed to reset password";

    if (resetError?.error) msg = resetError.error;
    else if (resetError?.detail) msg = resetError.detail;
    else if (resetError?.Error_Message) {
      msg =
        typeof resetError.Error_Message === "string"
          ? resetError.Error_Message
          : Object.values(resetError.Error_Message).flat().join(" ");
    } else if (typeof resetError === "string") msg = resetError;

    toast.error(msg);
  }, [resetError]);

  const formik = useFormik({
    initialValues: resetFields.reduce((acc, f) => ({ ...acc, [f.id]: "" }), {}),
    validationSchema: resetPasswordValidationSchema,
    onSubmit: (values) => {
      if (!storedEmail) {
        toast.error("OTP verification required before resetting password.");
        return;
      }

      dispatch(
        resetPassword({
          email: storedEmail,
          new_password: values.newPassword,
          confirm_password: values.confirmPassword,
        })
      );
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
            <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-gray-400">Enter your new password to continue</p>
          </div>
          <form onSubmit={formik.handleSubmit}>
            {resetFields.map((field) => (
              <div key={field.id} className="mb-4">
                <label className="block text-white mb-2 font-medium">
                  {field.label}
                </label>

                <div className="relative">
                  <input
                    id={field.id}
                    name={field.id}
                    type={showPasswords[field.id] ? "text" : field.type}
                    placeholder={field.placeholder}
                    value={formik.values[field.id]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-3.5 pr-11 rounded-xl bg-white/5 text-white border outline-none placeholder-gray-400
                      ${
                        formik.touched[field.id] && formik.errors[field.id]
                          ? "border-rose-500 focus:ring-2 focus:ring-rose-500"
                          : "border-white/10 focus:ring-2 focus:ring-[#4c7dff]"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, [field.id]: !prev[field.id] }))}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                    aria-label={showPasswords[field.id] ? "Hide password" : "Show password"}
                  >
                    {showPasswords[field.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {formik.touched[field.id] && formik.errors[field.id] && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors[field.id]}
                  </p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resetLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-slate-400">Back to <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium">Login Page</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
