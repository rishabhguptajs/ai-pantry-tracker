"use client"

import React from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image"
import { motion } from "framer-motion"
import Navbar from "./components/navbar"

export default function Home() {
  const { user } = useAuth()

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white overflow-hidden">
      <Navbar />

      <div className="absolute inset-0 bg-gradient-to-b from-violet-600/20 to-transparent opacity-20 pointer-events-none" />
      
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-7xl mx-auto px-6 py-24"
      >
        <motion.div 
          {...fadeInUp}
          className="text-center mb-16 relative"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 blur-[120px] rounded-full -z-10"
          />
          <h1 className="text-7xl font-bold tracking-tight mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Your Smart Kitchen
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
              Companion
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Transform your cooking experience with AI-powered recipe suggestions and intelligent pantry management.
          </p>

          <motion.div 
            className="flex items-center justify-center gap-6 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {user ? (
              <Link href="/dashboard" className="group relative px-8 py-4 bg-white text-black rounded-full font-medium hover:scale-105 transition-all duration-200">
                <span className="relative z-10">Open Dashboard</span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-xl" />
              </Link>
            ) : (
              <Link href="/login" className="group relative px-8 py-4 bg-white text-black rounded-full font-medium hover:scale-105 transition-all duration-200">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-xl" />
              </Link>
            )}
            <Link href="/features" className="px-8 py-4 border border-gray-800 text-gray-300 rounded-full hover:bg-gray-800/50 transition-all duration-200">
              Learn More
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-gray-900 to-black border border-gray-800"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10" />
          <Image
            src="/foodimg.png"
            alt="Pantry Dashboard"
            width={1200}
            height={600}
            className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-6 mt-24"
        >
          {[
            { title: "AI-Powered", desc: "Get personalized recipe suggestions based on your ingredients" },
            { title: "Smart Tracking", desc: "Effortlessly manage your pantry with intelligent organization" },
            { title: "Time Saving", desc: "Reduce food waste and streamline your cooking process" }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="p-6 rounded-xl bg-gradient-to-b from-gray-900 to-gray-900/50 border border-gray-800 hover:border-gray-700 transition-all duration-300"
            >
              <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="w-full border-t border-gray-800 mt-24 py-8 text-center text-gray-500"
      >
        <p className="text-sm">
          © 2024 Shelfie. Crafted with precision.
        </p>
      </motion.footer>
    </main>
  )
}
