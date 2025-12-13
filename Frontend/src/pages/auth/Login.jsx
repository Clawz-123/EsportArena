import React from 'react'
import { Gamepad2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import { loginValidationSchema } from '../utils/loginvalidation'

const Login = () => {
  const formik = useFormik({
    initialValues: { email: '', password: '', remember: false },
    validationSchema: loginValidationSchema,
    onSubmit: (values) => {
      console.log('Login submitted:', values)
      alert('Login submitted!')
    },
  })

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0e1a] px-4 py-8">
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

          {/* Header */}
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
            <div className="mb-4">
              <label htmlFor="email" className="block text-white mb-2 font-medium">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-3 rounded-xl bg-[#1a1f2e] border transition-colors text-white placeholder-gray-500 focus:outline-none ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-[#1e293b] focus:ring-2 focus:ring-blue-500'}`}
              />
              {formik.touched.email && formik.errors.email && <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-white mb-2 font-medium">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-3 rounded-xl bg-[#1a1f2e] border transition-colors text-white placeholder-gray-500 focus:outline-none ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-[#1e293b] focus:ring-2 focus:ring-blue-500'}`}
              />
              {formik.touched.password && formik.errors.password && <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-sm mb-4">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" name="remember" checked={formik.values.remember} onChange={formik.handleChange} className="w-4 h-4 rounded border-[#2d3748]" />
                Remember me
              </label>
              <Link to="#" className="text-blue-500 hover:text-blue-400">Forgot password?</Link>
            </div>

            <button type="submit" className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition shadow-[0_0_12px_#3b82f6]">Sign In</button>

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
