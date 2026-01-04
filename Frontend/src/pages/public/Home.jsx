import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import { Trophy, Users, Zap, Shield, Brain, Users2, Bell } from 'lucide-react'

const Home = () => {
  const stats = [
    { icon: Trophy, label: 'Tournaments', value: '500+', color: 'text-[#3A86FF]' },
    { icon: Users, label: 'Players', value: '10K+', color: 'text-pink-500' },
    { icon: Zap, label: 'Prize Distributed', value: '₹5M+', color: 'text-yellow-400' }
  ]

  const features = [
    { icon: Zap, title: 'Automated Brackets', description: 'Generate tournament brackets automatically with intelligent seeding', color: 'text-[#3A86FF]' },
    { icon: Shield, title: 'Secure Payments', description: 'Process entry fees and payouts with bank-grade security', color: 'text-green-400' },
    { icon: Trophy, title: 'Result Verification', description: 'Screenshot-based verification system with instant moderation workflow', color: 'text-yellow-400' },
    { icon: Users2, title: 'Role-Based Access', description: 'Give teams, players, and admins with granular permission controls', color: 'text-purple-400' },
    { icon: Brain, title: 'AI Toxicity Filter', description: 'Keep your community safe with automated content moderation', color: 'text-cyan-400' },
    { icon: Users, title: 'Community Forums', description: 'Connect with players, share strategies, and build your network', color: 'text-pink-500' },
    { icon: Bell, title: 'Real-Time Alerts', description: 'Get instant notifications for matches, results, and updates', color: 'text-orange-400', span: true }
  ]

  const steps = [
    { number: '1', title: 'Create Account', description: 'Sign up in seconds with email or social login' },
    { number: '2', title: 'Browse & Join', description: 'Find tournaments that match your skill level' },
    { number: '3', title: 'Compete & Submit', description: 'Play your matches and upload results' },
    { number: '4', title: 'Win & Withdraw', description: 'Claim your prizes instantly to your account' }
  ]

  const glowEffects = [
    { top: '0%', left: '50%', width: '1000px', height: '1000px', color: 'rgba(58, 134, 255, 0.15)' },
    { top: '20%', left: '20%', width: '600px', height: '600px', color: 'rgba(58, 134, 255, 0.08)' },
    { top: '10%', right: '20%', width: '600px', height: '600px', color: 'rgba(217, 70, 239, 0.08)' }
  ]

  return (
    <div className="bg-[#0a0e1a] text-white min-h-screen relative overflow-hidden">
      {glowEffects.map((glow, idx) => (
        <div
          key={idx}
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: glow.top,
            left: glow.left,
            right: glow.right,
            transform: glow.left === '50%' ? 'translate(-50%, -50%)' : undefined,
            width: glow.width,
            height: glow.height,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glow.color} 0%, rgba(10, 14, 26, 0) 70%)`,
            filter: 'blur(80px)',
            zIndex: 0
          }}
        />
      ))}


      <Navbar />
      <section className="pt-32 pb-20 px-4 relative z-10">
        <div className="container mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="bg-[#1e293b] text-blue-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-slate-700">
              Nepal's #1 Esports Platform
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Organize & Play <br />
            <span className="text-[#3A86FF] drop-shadow-[0_0_15px_rgba(58,134,255,0.3)]">Tournaments</span> Easily
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
            Create, manage, and compete in esports tournaments with automated brackets, secure payments, and real-time updates. Join Nepal's fastest-growing gaming community today.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-linear-to-r from-[#3A86FF] to-pink-500 hover:opacity-90 text-white px-8 py-3 rounded-xl font-bold transition shadow-[0_0_15px_rgba(58,134,255,0.5)]"
            >
              Get Started Free →
            </Link>
            <Link
              to="/tournaments"
              className="border border-slate-700 hover:border-[#3A86FF] bg-[#0f1420] text-slate-300 hover:text-white px-8 py-3 rounded-xl font-bold transition"
            >
              Browse Tournaments
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="border border-slate-700 bg-[#0f1420] rounded-xl p-8 text-center hover:border-[#3A86FF] hover:bg-[#151c2e] transition">
                  <Icon className={`h-12 w-12 ${stat.color} mx-auto mb-4`} />
                  <p className="text-4xl font-bold mb-2">{stat.value}</p>
                  <p className="text-slate-400">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Everything You Need to <span className="text-[#3A86FF]">Dominate</span>
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Powerful features designed for competitive gaming excellence
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className={`border border-slate-700 bg-[#0f1420] rounded-xl p-6 hover:border-[#3A86FF] hover:bg-[#151c2e] transition ${feature.span ? 'lg:col-span-2 md:col-span-1' : ''}`}
                >
                  <Icon className={`h-8 w-8 ${feature.color} mb-4`} />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="border border-slate-700 bg-[#0f1420] rounded-xl p-8 text-center hover:border-[#3A86FF] hover:bg-[#151c2e] transition">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-r from-[#3A86FF] to-pink-500 font-bold text-lg mb-4 shadow-[0_0_15px_rgba(58,134,255,0.4)]">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="bg-linear-to-b from-[#1a1f3a] to-[#0f1420] border border-slate-700 rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
            <div
              aria-hidden
              className="absolute pointer-events-none"
              style={{
                bottom: '-20%',
                right: '-10%',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(58, 134, 255, 0.15) 0%, rgba(10, 14, 26, 0) 70%)',
                filter: 'blur(60px)',
                zIndex: 0
              }}
            />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10 text-white">
              Ready to <span className="text-[#3A86FF]">Level Up</span>Your Game?
            </h2>
            <p className="text-base md:text-lg mb-10 text-slate-300 max-w-2xl mx-auto relative z-10">
              Join thousands of gamers who trust Esports Arena for competitive gaming. Start your journey today and become part of Nepal's premier esports community.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center relative z-10">
              <Link
                to="/register"
                className="bg-linear-to-r from-[#3A86FF] to-pink-500 hover:opacity-90 text-white px-8 py-3 rounded-lg font-bold transition shadow-[0_0_15px_rgba(58,134,255,0.5)]"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="border border-slate-600 hover:border-[#3A86FF] text-slate-300 hover:text-white px-8 py-3 rounded-lg font-bold transition"
              >
                I Already Have an Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
