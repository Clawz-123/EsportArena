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
    { name: "email", label: "Email", type: "email", placeholder: "Enter your email" },
    { name: "phone", label: "Phone Number", type: "tel", placeholder: "Enter your phone number" },
    { name: "password", label: "Password", type: "password", placeholder: "Create a password" },
    { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Confirm your password" },
  ];

  const organizerFields = [
    { name: "orgName", label: "Organizer Name", type: "text", placeholder: "Enter organizer name" },
    { name: "email", label: "Email", type: "email", placeholder: "Enter your email" },
    { name: "phone", label: "Phone Number", type: "tel", placeholder: "Enter your phone number" },
    { name: "password", label: "Password", type: "password", placeholder: "Create a password" },
    { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Confirm your password" },
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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-[#0f1420] rounded-2xl border border-[#1e293b] p-8 shadow-lg">
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
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gamepad2 className="w-8 h-8 text-[#3A86FF]" />
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#3A86FF] to-pink-500">
                Esports Arena
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-400">
              Join the gaming revolution in Nepal
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-white mb-3 font-medium">
              I want to be a
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[{ type: "player", label: "Player" }, { type: "organizer", label: "Organizer" }].map(
                ({ type, label }) => {
                  const selected = userType === type;
                  const IconComponent = type === "player" ? User : Users;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUserType(type)}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 ${
                        selected
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-[#1e293b] bg-[#1a1f2e]"
                      }`}
                    >
                      <IconComponent className={`w-6 h-6 mb-2 ${selected ? "text-blue-500" : "text-gray-400"}`} />
                      <span className={selected ? "text-blue-500" : "text-gray-400"}>
                        {label}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form>
                {fieldsToShow.map((field) => {
                  const isPassword = field.type === "password";
                  const inputType = isPassword && showPasswords[field.name] ? "text" : field.type;
                  if (!isPassword) {
                    return (
                      <div className="mb-4" key={field.name}>
                        <label className="block text-white mb-2 font-medium">
                          {field.label}
                        </label>
                        <Field
                          name={field.name}
                          type={field.type}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 rounded-xl bg-[#1a1f2e] border border-[#1e293b] text-white"
                        />
                        <ErrorMessage
                          name={field.name}
                          component="p"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    );
                  }

                  return (
                    <div className="mb-4" key={field.name}>
                      <label className="block text-white mb-2 font-medium">
                        {field.label}
                      </label>
                      <div className="relative">
                        <Field
                          name={field.name}
                          type={inputType}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 pr-11 rounded-xl bg-[#1a1f2e] border border-[#1e293b] text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, [field.name]: !prev[field.name] }))}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                          aria-label={showPasswords[field.name] ? "Hide password" : "Show password"}
                        >
                          {showPasswords[field.name] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <ErrorMessage
                        name={field.name}
                        component="p"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  );
                })}

                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Field type="checkbox" name="terms" className="mt-1" />
                    <span className="text-gray-400 text-sm">
                      I agree to the{" "}
                      <Link to="/terms" className="text-blue-500">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-blue-500">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  <ErrorMessage
                    name="terms"
                    component="p"
                    className="text-red-500 text-sm mt-1 ml-6"
                  />
                </div>

                <button
                  type="submit"
                  disabled={registerLoading || isSubmitting}
                  className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold disabled:opacity-60"
                >
                  {registerLoading ? "Creating Account..." : "Create Account"}
                </button>

                <p className="text-center text-gray-400 text-sm mt-4">
                  Already have an account?{" "}
                  <Link to="/login" className="text-blue-500">
                    Login
                  </Link>
                </p>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Register;
