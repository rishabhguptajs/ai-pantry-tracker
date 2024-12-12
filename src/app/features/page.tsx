"use client"

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navbar from '../components/navbar'

const featuresList = [
  {
    title: "AI-Powered Image Recognition",
    description: "Instantly identify and catalog your pantry items using advanced machine learning algorithms.",
    icon: "🤖",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Smart Inventory Management",
    description: "Keep track of your pantry with intelligent organization and automatic quantity updates.",
    icon: "📦",
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    title: "Recipe Generation",
    description: "Get personalized recipe suggestions based on your available ingredients.",
    icon: "🍳",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    title: "Real-time Search",
    description: "Lightning-fast search functionality with smart filters and suggestions.",
    icon: "🔍",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Cloud Sync",
    description: "Access your pantry from anywhere with secure cloud synchronization.",
    icon: "☁️",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "Smart Analytics",
    description: "Track usage patterns and get insights about your pantry habits.",
    icon: "📊",
    gradient: "from-purple-500 to-indigo-500",
  },
]

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16 px-4 relative overflow-hidden">
      <Navbar />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/20 rounded-full blur-[120px] -z-10" />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-20"
      >
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Powerful Features
        </h1>
        <p className="text-gray-400 text-lg">
          Experience the next generation of pantry management with our cutting-edge features
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {featuresList.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl transform transition-transform group-hover:scale-[1.02]" />
            <div className="relative p-8 rounded-2xl border border-gray-800 bg-black/50 backdrop-blur-sm hover:border-gray-700 transition-colors duration-300">
              <div className={`text-5xl mb-6 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                {feature.icon}
              </div>
              <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {feature.title}
              </h2>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-20"
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium hover:opacity-90 transition-opacity group"
        >
          <span>Get Started Now</span>
          <svg
            className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </motion.div>
    </div>
  )
}

export default Features
