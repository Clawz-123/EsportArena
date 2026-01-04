import React, { useState } from 'react'
import { Gamepad2, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { loginValidationSchema } from '../utils/loginvalidation'
import { toast } from 'react-toastify'

const Login = () => {
  const navigate = useNavigate()

  const loginFields = [
    { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
    { id: 'password', label: 'Password', type: 'password', placeholder: 'Enter your password' },
  ]

  const formik = useFormik({
    initialValues: loginFields.reduce((acc, field) => ({ ...acc, [field.id]: '' }), { remember: false }),
    validationSchema: loginValidationSchema,
    onSubmit: (values) => {
      console.log('Login submitted:', values)
      toast.success('Signed in successfully')
      navigate('/') 
    },
  })

  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0e1a] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-[#0f1420] rounded-2xl border border-[#1e293b] p-8 shadow-lg relative">
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
              <Gamepad2 className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold">
                <span className="text-blue-500">Esports</span>{' '}
                <span className="bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Arena</span>
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Sign in to your account</p>
          </div>

          <form onSubmit={formik.handleSubmit}>
            {loginFields.map((field) => {
              const isPassword = field.id === 'password'
              const inputType = isPassword && showPassword ? 'text' : field.type
              return (
                <div className="mb-4" key={field.id}>
                  <label htmlFor={field.id} className="block text-white mb-2 font-medium">{field.label}</label>
                  <div className="relative">
                    <input
                      id={field.id}
                      name={field.id}
                      type={inputType}
                      placeholder={field.placeholder}
                      value={formik.values[field.id]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-3 pr-11 rounded-xl bg-[#1a1f2e] border transition-colors text-white placeholder-gray-500 focus:outline-none ${formik.touched[field.id] && formik.errors[field.id] ? 'border-red-500' : 'border-[#1e293b] focus:ring-2 focus:ring-blue-500'}`}
                    />
                    {isPassword && (
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                  {formik.touched[field.id] && formik.errors[field.id] && <p className="text-red-500 text-sm mt-1">{formik.errors[field.id]}</p>}
                </div>
              )
            })}

            <div className="flex items-center justify-between text-sm mb-4">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" name="remember" checked={formik.values.remember} onChange={formik.handleChange} className="w-4 h-4 rounded border-[#2d3748]" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-blue-500 hover:text-blue-400">Forgot password?</Link>
            </div>

            <button type="submit" className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition shadow-[0_0_12px_#3b82f6]">
              Sign In
            </button>

            <div className="text-center mt-6">
              <p className="text-slate-400">Don't have an account? <Link to="/register" className="text-blue-500 hover:text-blue-400 font-bold">Sign up here</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login