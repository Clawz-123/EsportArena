import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import { Trophy, Users, Zap, Shield, Users2, Bell } from "lucide-react";
import background from "../../assets/Homeimage.jpg";

const Home = () => {
  const stats = [
    { icon: Trophy, label: "Tournaments", value: "500+" },
    { icon: Users, label: "Players", value: "10K+" },
    { icon: Zap, label: "Prize Distributed", value: "₹5M+" }
  ];

  const features = [
    {
      icon: Zap,
      title: "Automated Brackets",
      description:
        "Generate tournament brackets automatically with support for standard formats."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description:
        "Integrated and transparent payment processing for fees and prize distribution."
    },
    {
      icon: Trophy,
      title: "Result Verification",
      description:
        "Match results require confirmation to ensure fairness and accuracy."
    },
    {
      icon: Users2,
      title: "Role-Based Access",
      description:
        "Separate dashboards for admins, organizers, and players."
    },
    {
      icon: Bell,
      title: "Real-Time Notifications",
      description:
        "Receive updates for schedules, matches, and announcements."
    },
    {
      icon: Users,
      title: "Player Community",
      description:
        "Connect with participants and collaborate across tournaments."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Account",
      description: "Register and complete your player profile."
    },
    {
      number: "02",
      title: "Browse & Join",
      description: "View available tournaments and register."
    },
    {
      number: "03",
      title: "Compete",
      description: "Participate in scheduled matches."
    },
    {
      number: "04",
      title: "Track & Withdraw",
      description: "View results and withdraw prize earnings."
    }
  ];

  return (
    <div className="bg-[#0a0e1a] text-white min-h-screen">

      <Navbar />

      {/* HERO SECTION */}
      <section
        className="pt-28 pb-20 px-4 bg-[#020617]"
        style={{
          backgroundImage: `linear-gradient(rgba(2,6,23,.92), rgba(2,6,23,.92)), url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="container mx-auto text-center max-w-3xl">

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Esports Tournament Management Platform
          </h1>

          <p className="text-slate-400 text-base md:text-lg mb-8">
            A structured and reliable platform for organizing and participating
            in esports tournaments with automated brackets, verified results,
            and role-based system workflows.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-md font-semibold"
            >
              Get Started
            </Link>

            <Link
              to="/tournaments"
              className="border border-slate-600 hover:border-blue-500 px-6 py-2.5 rounded-md font-semibold"
            >
              View Tournaments
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-4 bg-[#0f172a]">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="bg-[#020617] border border-slate-700 rounded-lg p-6 text-center"
              >
                <Icon className="h-8 w-8 mx-auto mb-2 text-slate-200" />
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-slate-400 text-sm">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-4 bg-[#020617]">
        <div className="container mx-auto max-w-6xl">

          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
            Platform Features
          </h2>

          <p className="text-slate-400 text-center mb-10">
            Designed to support fair and organized tournament management
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-[#0f172a] border border-slate-700 p-6 rounded-lg"
                >
                  <Icon className="h-7 w-7 mb-3 text-slate-200" />
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-slate-400 text-sm">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-4 bg-[#0f172a]">
        <div className="container mx-auto max-w-6xl">

          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div
                key={i}
                className="bg-[#020617] border border-slate-700 p-6 rounded-lg"
              >
                <p className="text-blue-400 text-xs font-semibold mb-2">
                  {s.number}
                </p>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-[#020617]">
        <div className="container mx-auto text-center max-w-2xl">

          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to Get Started?
          </h2>

          <p className="text-slate-400 mb-8">
            Create your account and begin organizing or participating in tournaments.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-md font-semibold"
            >
              Create Account
            </Link>

            <Link
              to="/login"
              className="border border-slate-600 hover:border-blue-500 px-6 py-2.5 rounded-md font-semibold"
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
