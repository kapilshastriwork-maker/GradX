"use client";

import Link from "next/link";
import {
  Compass,
  TrendingUp,
  Target,
  PenTool,
  MessageCircle,
  IndianRupee,
  Star,
  Menu,
  X,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  Building,
  FileText,
  Wallet,
  Heart,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-purple-600">GradX</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("loan")}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Loan
              </button>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left text-gray-600 py-2"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="block w-full text-left text-gray-600 py-2"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("loan")}
                className="block w-full text-left text-gray-600 py-2"
              >
                Loan
              </button>
              <Link href="/login" className="block text-gray-600 py-2">
                Login
              </Link>
              <Link
                href="/signup"
                className="block bg-purple-600 text-white px-4 py-2 rounded-lg text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50 opacity-50" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Your AI Companion for the{" "}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Study Abroad Journey
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              From choosing the right university to getting your education
              loan sanctioned — GradX guides every step with AI.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Start Your Journey
              </Link>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-purple-600 hover:text-purple-600 transition-all"
              >
                See How It Works
              </button>
            </div>
          </div>

          {/* Floating Student Cards */}
          <div className="mt-16 relative">
            <div className="flex flex-wrap justify-center gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-xl p-4 shadow-xl border border-gray-100 w-64 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Rahul Sharma</p>
                    <p className="text-sm text-gray-500">IIT Bombay</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Admission Probability</span>
                    <span className="font-semibold text-emerald-600">87%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "87%" }} />
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-xl p-4 shadow-xl border border-gray-100 w-64 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Priya Patel</p>
                    <p className="text-sm text-gray-500">DU Delhi</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ROI Timeline</span>
                    <span className="font-semibold text-indigo-600">2.8 years</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: "72%" }} />
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-xl p-4 shadow-xl border border-gray-100 w-64 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Arjun Nair</p>
                    <p className="text-sm text-gray-500">BITS Pilani</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Readiness Score</span>
                    <span className="font-semibold text-purple-600">92/100</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">50,000+</p>
              <p className="text-sm sm:text-base text-gray-600">Students Guided</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600">200+</p>
              <p className="text-sm sm:text-base text-gray-600">Universities Covered</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600">₹500 Cr+</p>
              <p className="text-sm sm:text-base text-gray-600">Loans Facilitated</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">4.9★</p>
              <p className="text-sm sm:text-base text-gray-600">Student Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything You Need for Your{" "}
              <span className="text-purple-600">Study Abroad</span> Journey
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful AI tools to guide you from application to admission
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Compass className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Career Navigator</h3>
              <p className="text-gray-600">
                Find your perfect university, country, and course in 5 minutes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ROI Calculator</h3>
              <p className="text-gray-600">
                See exactly when your investment pays off, down to the month.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Admit Predictor</h3>
              <p className="text-gray-600">
                Know your real chances before you apply.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                <PenTool className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">SOP Co-Pilot</h3>
              <p className="text-gray-600">
                Draft a publication-quality Statement of Purpose in minutes.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Mentor Shikha</h3>
              <p className="text-gray-600">
                Your 24/7 personal guide for every doubt and decision.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all" id="loan">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Education Loan</h3>
              <p className="text-gray-600">
                Seamless, AI-assisted loan application when you are ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How It <span className="text-purple-600">Works</span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Your journey to abroad studies in 4 simple steps
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">1</span>
                </div>
                <Building className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Build Your Profile
                </h3>
                <p className="text-gray-600 text-sm">
                  Tell us your academics, goals, and budget.
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ArrowRight className="w-8 h-8 text-gray-300" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">2</span>
                </div>
                <Compass className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Explore & Plan
                </h3>
                <p className="text-gray-600 text-sm">
                  Use AI tools to discover universities and plan your journey.
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ArrowRight className="w-8 h-8 text-gray-300" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-emerald-600">3</span>
                </div>
                <FileText className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Apply with Confidence
                </h3>
                <p className="text-gray-600 text-sm">
                  Get AI help with SOPs, timelines, and applications.
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ArrowRight className="w-8 h-8 text-gray-300" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">4</span>
              </div>
              <Wallet className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fund Your Dream
              </h3>
              <p className="text-gray-600 text-sm">
                Get your education loan through our seamless loan partner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              What Students <span className="text-purple-600">Say</span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Thousands of Indian students trust GradX for their abroad studies
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "GradX helped me get into MIT for my MS in Computer Science. The
                admit predictor showed I had a 78% chance, and I got in! The ROI
                calculator helped me plan my finances perfectly."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-purple-600">AK</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Arjun Krishnan</p>
                  <p className="text-sm text-gray-500">MIT USA • MS CS</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The SOP Co-Pilot is a game changer! I drafted my entire
                Statement of Purpose in just 2 hours. It sounded so professional
                and unique. Got admitted to Oxford!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-indigo-600">SP</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Punjabi</p>
                  <p className="text-sm text-gray-500">Oxford UK • MBA</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "AI Mentor Shikha answered all my doubts at 2 AM! She guided
                me through the entire process. The education loan process was
                so smooth - got sanctioned in 5 days!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-emerald-600">VR</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Vikram Reddy</p>
                  <p className="text-sm text-gray-500">Stanford USA • MS EE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Start Your Study Abroad Journey Today — It&apos;s Free
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join 50,000+ Indian students who got their dream admit
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-purple-600 px-10 py-4 rounded-lg text-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Create Your Free Account
          </Link>
          <p className="mt-6 text-sm text-purple-200">
            No credit card required. 100% free to use.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">GradX</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                About
              </a>
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#loan" className="text-gray-400 hover:text-white transition-colors">
                Loan
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">
              © 2026 GradX. Powered by AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}