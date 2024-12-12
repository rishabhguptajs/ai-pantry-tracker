"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, signOutAcc } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navbarClass = `fixed w-full top-0 z-50 transition-all duration-300 ${
    scrolled
      ? "bg-black/85 backdrop-blur-lg border-b border-gray-800"
      : "bg-transparent"
  }`

  const menuItems = [
    { label: "Features", href: "/features" },
    ...(user
      ? [
          { label: "Dashboard", href: "/dashboard" },
          {
            label: "Logout",
            onClick: () => {
              signOutAcc()
              router.push("/")
            },
          },
        ]
      : [{ label: "Login", href: "/login" }]),
  ]

  return (
    <nav className={navbarClass}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Shelfie
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className="px-4 py-2 rounded-full text-gray-300 hover:text-white transition-colors relative group"
                  >
                    <span className="relative z-10">{item.label}</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.05 }}
                    />
                  </Link>
                ) : (
                  <button
                    onClick={item.onClick}
                    className="px-4 py-2 rounded-full text-gray-300 hover:text-white transition-colors relative group"
                  >
                    <span className="relative z-10">{item.label}</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.05 }}
                    />
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative z-50 text-gray-300 hover:text-white focus:outline-none"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <span
                className={`transform transition-all duration-300 ${
                  isOpen
                    ? "rotate-45 translate-y-1.5"
                    : "rotate-0 translate-y-0"
                } absolute w-6 h-0.5 bg-current`}
              />
              <span
                className={`transition-opacity duration-300 ${
                  isOpen ? "opacity-0" : "opacity-100"
                } absolute w-6 h-0.5 bg-current`}
              />
              <span
                className={`transform transition-all duration-300 ${
                  isOpen
                    ? "-rotate-45 -translate-y-1.5"
                    : "rotate-0 translate-y-0"
                } absolute w-6 h-0.5 bg-current`}
              />
            </div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-lg border-b border-gray-800"
          >
            <div className="container mx-auto px-6 py-4">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="py-2"
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="block text-gray-300 hover:text-white transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        item.onClick?.()
                        setIsOpen(false)
                      }}
                      className="block w-full text-left text-gray-300 hover:text-white transition-colors"
                    >
                      {item.label}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
