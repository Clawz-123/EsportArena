import React, { useState, useEffect } from "react";
import { Gamepad2, User, Users, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { registerUser, clearError } from "../../slices/auth";
import {
  playerValidationSchema,
  organizerValidationSchema,
} from "../utils/registerValidation";

const Register = () => {
  const [userType, setUserType] = useState("player");
  const [showPasswords, setShowPasswords] = useState({});
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { registerLoading, registerError } = useAppSelector(
    (state) => state.auth
  );

  const playerFields = [
    { name: "fullName", label: "Full Name", type: "text", placeholder: "Enter your full name" },
    { name: "email", label: "Email", type: "email", placeholder: "your.email@example.com" },
    { name: "phone", label: "Phone Number", type: "tel", placeholder: "+977 98XXXXXXXX" },
    { name: "password", label: "Password", type: "password", placeholder: "Create a strong password" },
    { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Re-enter your password" },
  ];

  const organizerFields = [
    { name: "orgName", label: "Organizer Name", type: "text", placeholder: "Enter organizer name" },
    { name: "email", label: "Email", type: "email", placeholder: "your.email@example.com" },
    { name: "phone", label: "Phone Number", type: "tel", placeholder: "+977 98XXXXXXXX" },
    { name: "password", label: "Password", type: "password", placeholder: "Create a strong password" },
    { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Re-enter your password" },
  ];

  const fieldsToShow = userType === "player" ? playerFields : organizerFields;

  const validationSchema =
    userType === "player"
      ? playerValidationSchema
      : organizerValidationSchema;

  const formatErrorMessage = (error, fallback = "Registration failed") => {
    if (!error) return fallback;
    if (error.error) return error.error;
    if (error.detail) return error.detail;
    if (error.Error_Message) {
      if (typeof error.Error_Message === "string") return error.Error_Message;
      const values = Object.values(error.Error_Message);
      if (Array.isArray(values)) return values.flat().join(" ");
    }
    if (error.message) return error.message;
    return typeof error === "string" ? error : fallback;
  };

  const initialValues = {
    ...fieldsToShow.reduce((acc, field) => {
      acc[field.name] = "";
      return acc;
    }, {}),
    terms: false,
  };

  const handleSubmit = async (values, actions) => {
    const payload = {
      email: values.email,
      name: userType === "player" ? values.fullName : values.orgName,
      phone_number: values.phone,
      password: values.password,
      is_organizer: userType === "organizer",
    };

    try {
      const result = await dispatch(registerUser(payload));

      if (registerUser.fulfilled.match(result)) {
        actions.resetForm();
        toast.success("Account created! Check your email for the OTP");
        navigate("/verify-otp");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, userType]);

  useEffect(() => {
    if (!registerError) return;
    toast.error(formatErrorMessage(registerError));
  }, [registerError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] relative overflow-hidden font-sans">
      <div className="w-full max-w-md p-6 relative z-10">
        <div className="bg-[#151b2b]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Gamepad2 className="w-8 h-8 text-[#3A86FF]" />
              <h1 className="text-2xl font-bold bg-linear-to-r from-[#3A86FF] to-[#ff0080] bg-clip-text text-transparent">
                Esports Arena
              </h1>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-400 text-sm">
              Join the gaming revolution in Nepal
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            {[{ type: "player", label: "Player" }, { type: "organizer", label: "Organizer" }].map(
              ({ type, label }) => {
                const selected = userType === type;
                const IconComponent = type === "player" ? User : Users;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all duration-300 ${selected
                        ? "border-[#3A86FF] bg-[#3A86FF]/10 text-white"
                        : "border-[#2a303c] bg-[#1a1f2e] text-gray-400 hover:border-gray-500"
                      }`}
                  >
                    <IconComponent className={`w-5 h-5 mb-1 ${selected ? "text-[#3A86FF]" : "text-gray-400"}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                );
              }
            )}
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {fieldsToShow.map((field) => {
                  const isPassword = field.type === "password";
                  const inputType = isPassword && showPasswords[field.name] ? "text" : field.type;

                  return (
                    <div key={field.name}>
                      <label className="block text-gray-300 text-xs font-medium mb-1.5 ml-1">
                        {field.label}
                      </label>
                      <div className="relative">
                        <Field
                          name={field.name}
                          type={inputType}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 rounded-xl bg-[#1e2532] border border-[#2a303c] text-white placeholder-gray-500 focus:outline-none focus:border-[#3A86FF] focus:ring-1 focus:ring-[#3A86FF] transition-all text-sm"
                        />
                        {isPassword && (
                          <button
                            type="button"
                            onClick={() => setShowPasswords((prev) => ({ ...prev, [field.name]: !prev[field.name] }))}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-white transition-colors"
                          >
                            {showPasswords[field.name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                      <ErrorMessage
                        name={field.name}
                        component="p"
                        className="text-red-400 text-xs mt-1 ml-1"
                      />
                    </div>
                  );
                })}

                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <Field
                        type="checkbox"
                        name="terms"
                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-600 bg-[#1e2532] transition-all checked:border-[#3A86FF] checked:bg-[#3A86FF]"
                      />
                      <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-gray-400 text-xs leading-5">
                      I agree to{" "}
                      <Link to="/terms" className="text-[#3A86FF] hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-[#3A86FF] hover:underline">
                        Private Policy
                      </Link>
                    </span>
                  </label>
                  <ErrorMessage
                    name="terms"
                    component="p"
                    className="text-red-400 text-xs mt-1 ml-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={registerLoading || isSubmitting}
                  className="w-full py-3.5 mt-2 rounded-xl bg-[#3A86FF] hover:bg-blue-600 text-white text-sm font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {registerLoading ? "Creating Account..." : "Create Account"}
                </button>

                <div className="text-center mt-6">
                  <p className="text-gray-400 text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-[#3A86FF] hover:text-blue-400 font-medium transition-colors">
                      Login
                    </Link>
                  </p>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Register;
