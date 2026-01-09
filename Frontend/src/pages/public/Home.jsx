import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import { Shield, Users2, Bell, CheckCircle, Layout, Flag } from "lucide-react";
import background from "../../assets/Homeimage.jpg";

const Home = () => {
  const stats = [
    { label: "Tournaments", value: "500+" },
    { label: "Players", value: "10K+" },
    { label: "Prize (Rs.)", value: "5M+" }
  ];

  const features = [
    {
      icon: Layout, title: "Automated Brackets", description: "Generate tournament brackets automatically with support for single elimination, double elimination, and round robin formats."
    },
    {
      icon: Shield, title: "Secure Payments", description: "Integrated payment processing through eSewa and Khalti for entry fees and prize distribution with full transaction tracking."
    },
    {
      icon: CheckCircle, title: "Result Verification", description: "Match results require verification from both players to ensure fairness and prevent disputes during tournament play."
    },
    {
      icon: Users2, title: "Role-Based Access", description: "Different permission levels for administrators, organizers, and players with tailored dashboards for each role."
    },
    {
      icon: Flag, title: "Content Moderation", description: "Community-driven moderation system allowing users to report inappropriate content and behavior for review."
    },
    {
      icon: Bell, title: "Real-Time Alerts", description: "Instant notifications for match schedules, results, announcements, and important tournament updates."
    }
  ];

  const steps = [
    {
      number: "STEP 01", title: "Create Account", description: "Sign up with your email and complete your player profile to get started on the platform."
    },
    {
      number: "STEP 02", title: "Browse & Join", description: "Explore available tournaments, review details, and register for competitions that match your skill level."
    },
    {
      number: "STEP 03", title: "Compete & Submit", description: "Participate in matches, submit results, and advance through tournament brackets as you win."
    },
    {
      number: "STEP 04", title: "Track & Withdraw", description: "Monitor your performance, view standings, and withdraw your prize money directly to your account."
    }
  ];

  return (
    <div className="bg-[#0b1120] text-white min-h-screen font-sans selection:bg-blue-500/30">
      <Navbar />
      <section className="relative pt-32 pb-40 md:pt-48 md:pb-60 px-6 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[#0b1120]/80 bg-linear-to-t from-[#0b1120] via-[#0b1120]/60 to-[#0b1120]/80" />
        </div>

        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
            Organize & Play <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-rose-600">
              Tournaments
            </span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            A comprehensive platform for organizing esports tournaments with automated bracket management, secure payment integration, and seamless communication between organizers and players.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-40 h-12 flex items-center justify-center rounded-md font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
            >
              Get Started
            </Link>

            <Link
              to="/tournaments"
              className="border border-slate-600 hover:border-slate-400 bg-transparent text-white min-w-40 h-12 flex items-center justify-center rounded-md font-semibold transition-all"
            >
              Browse Tournaments
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 -mt-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-[#111827]/80 backdrop-blur-sm border border-slate-700/50 rounded-lg py-8 px-4 text-center shadow-lg"
            >
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="py-24 px-6 bg-[#0b1120]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Features</h2>
            <p className="text-slate-400">Everything you need to run successful esports tournaments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-[#111827] border border-slate-800 p-8 rounded-xl hover:border-blue-500/30 transition-colors group"
                >
                  <Icon className="h-8 w-8 mb-6 text-white" />
                  <h3 className="text-lg font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#0f1629]">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div
                key={i}
                className="bg-[#1e293b]/30 p-8 rounded-xl border border-slate-800 hover:bg-[#1e293b]/50 transition-colors"
              >
                <div className="text-blue-500 text-xs font-bold tracking-widest mb-4">{s.number}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-24 px-6 bg-[#0b1120]">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-slate-400 mb-10 text-lg">
            Join thousands of players competing in tournaments and winning prizes
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-35 px-6 py-3 rounded-md font-semibold transition-all"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="bg-[#1f2937] hover:bg-[#374151] border border-slate-700 text-white min-w-35 px-6 py-3 rounded-md font-semibold transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
