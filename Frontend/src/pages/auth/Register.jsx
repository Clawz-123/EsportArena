import React, { useState } from "react";
import { Gamepad2, User, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import { playerValidationSchema, organizerValidationSchema } from '../utils/registervalidation';

const Register = () => {
  const [userType, setUserType] = useState("player");

  // Fields for Player
  const playerFields = [
    { id: "fullName", label: "Full Name", type: "text", placeholder: "Enter your full name" },
    { id: "email", label: "Email", type: "email", placeholder: "Enter your email" },
    { id: "phone", label: "Phone Number", type: "tel", placeholder: "Enter your phone number" },
    { id: "password", label: "Password", type: "password", placeholder: "Create a password" },
    { id: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Confirm your password" },
  ];

  // Fields for Organizer
  const organizerFields = [
    { id: "orgName", label: "Organizer Name", type: "text", placeholder: "Enter your organizer name" },
    { id: "email", label: "Email", type: "email", placeholder: "Enter your email" },
    { id: "phone", label: "Phone Number", type: "tel", placeholder: "Enter your phone number" },
    { id: "password", label: "Password", type: "password", placeholder: "Create a password" },
    { id: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Confirm your password" },
  ];

  // Determine which fields and validation to use
  const fieldsToShow = userType === "player" ? playerFields : organizerFields;
  const validationSchema = userType === "player" ? playerValidationSchema : organizerValidationSchema;

  // Formik setup
  const formik = useFormik({
    initialValues: fieldsToShow.reduce((acc, field) => ({ ...acc, [field.id]: "" }), {}),
    validationSchema,
    onSubmit: (values) => {
      console.log("Form Submitted:", { userType, ...values });
    },
    enableReinitialize: true, 
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] px-4 py-8">
      <div className="w-full max-w-md">
          <div className="bg-[#0f1420] rounded-2xl border border-[#1e293b] p-8 shadow-lg relative">
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

          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gamepad2 className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold">
                <span className="text-blue-500">Esports</span>{" "}
                <span className="bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Arena
                </span>
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Create Your Account</h2>
            <p className="text-gray-400">Join the gaming revolution in Nepal</p>
          </div>

          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-white mb-3 font-medium">I want to be a</label>
            <div className="grid grid-cols-2 gap-4">
              {[{ type: "player", label: "Player", icon: User }, { type: "organizer", label: "Organizer", icon: Users }].map((item) => {
                const Icon = item.icon;
                const selected = userType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setUserType(item.type)}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-colors
                      ${selected ? "border-blue-500 bg-blue-500/10" : "border-[#1e293b] bg-[#1a1f2e] hover:border-blue-500"}`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${selected ? "text-blue-500" : "text-gray-400"}`} />
                    <span className={`${selected ? "text-blue-500" : "text-gray-400"}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={formik.handleSubmit}>
            {/* Render dynamic fields */}
            {fieldsToShow.map((field) => (
              <div className="mb-4" key={field.id}>
                <label htmlFor={field.id} className="block text-white mb-2 font-medium">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  id={field.id}
                  name={field.id}
                  placeholder={field.placeholder}
                  value={formik.values[field.id]}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 rounded-xl bg-[#1a1f2e] border text-white placeholder-gray-500 focus:outline-none transition-colors
                    ${formik.touched[field.id] && formik.errors[field.id] ? "border-red-500" : "border-[#1e293b] focus:ring-2 focus:ring-blue-500"}`}
                />
                {formik.touched[field.id] && formik.errors[field.id] && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors[field.id]}</p>
                )}
              </div>
            ))}

            {/* Terms */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded border-2 border-[#1e293b] bg-[#1a1f2e]" />
                <span className="text-gray-400 text-sm">
                  I agree to the{" "}
                  <Link to="/terms" className="text-blue-500 hover:underline">Terms of Service</Link> and{" "}
                  <Link to="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button type="submit" className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors mb-4">
              Create Account
            </button>

            <p className="text-center text-gray-400 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
