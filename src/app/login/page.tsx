"use client"

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      console.error("Error during email login:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error during Google login:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in with Email
            </button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or continue with</span>
          </div>
        </div>
        <div>
          <button
            onClick={handleGoogleLogin}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M23.744 12.276c0-.857-.078-1.678-.225-2.464H12v4.664h6.621a5.667 5.667 0 01-2.466 3.725v3.1h3.98c2.335-2.146 3.68-5.306 3.68-9.025z"
                fill="#4285F4"
              />
              <path
                d="M12 24c3.24 0 5.951-1.08 7.936-2.92l-3.98-3.1c-1.11.744-2.52 1.186-3.956 1.186-3.048 0-5.632-2.058-6.556-4.82H1.348v3.072A11.999 11.999 0 0012 24z"
                fill="#34A853"
              />
              <path
                d="M5.444 14.347a6.665 6.665 0 010-4.69V6.585H1.348a11.999 11.999 0 000 10.83l4.096-3.068z"
                fill="#FBBC05"
              />
              <path
                d="M12 4.776c1.565 0 2.967.537 4.076 1.583l3.052-3.052C17.951 1.65 15.24.571 12 .571 7.757.571 4.392 2.98 2.682 6.347l4.096 3.072C6.368 6.834 8.952 4.776 12 4.776z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
