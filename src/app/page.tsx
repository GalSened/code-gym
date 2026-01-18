import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-white">Code Gym</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Level Up Your
              <span className="block bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Coding Skills
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Master programming through interactive challenges, real-world projects,
              bug hunting exercises, and structured learning paths — all with AI-powered mentorship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Learning Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-gray-600 text-gray-300 hover:bg-gray-800">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Mastery Mode */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-primary-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Mastery Mode</h3>
              <p className="text-gray-400">
                LeetCode-style coding challenges with progressive difficulty and AI hints.
              </p>
            </div>

            {/* Build Mode */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-primary-500/50 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Build Mode</h3>
              <p className="text-gray-400">
                Guided project building with milestones and real-world applications.
              </p>
            </div>

            {/* Hunt Mode */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-primary-500/50 transition-colors">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Hunt Mode</h3>
              <p className="text-gray-400">
                Find and fix bugs in code with daily challenges and competitions.
              </p>
            </div>

            {/* Academy Mode */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-primary-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Academy Mode</h3>
              <p className="text-gray-400">
                Structured 7-phase learning paths from beginner to deployment.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-400">100+</div>
              <div className="text-gray-400 mt-1">Coding Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-400">50+</div>
              <div className="text-gray-400 mt-1">Bug Hunts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-400">10+</div>
              <div className="text-gray-400 mt-1">Real Projects</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-400">AI</div>
              <div className="text-gray-400 mt-1">Powered Mentor</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-24 text-center bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to become a better developer?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of developers who are leveling up their skills with Code Gym.
              Start your journey today — completely free.
            </p>
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-gray-400">Code Gym</span>
              </div>
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Code Gym. Built for developers, by developers.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
