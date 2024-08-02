"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOutAcc } = useAuth()
  const router = useRouter()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">
          <Link href="/">AI Pantry Tracker</Link>
        </div>
        <div className="hidden md:flex space-x-4">
          <Link href="/features" className="text-gray-300 hover:text-white">
            Features
          </Link>

          {user ? (
            <Link href="/dashboard" className="text-gray-300 hover:text-white">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="text-gray-300 hover:text-white">
              Login
            </Link>
          )}

          {user && (
            <button
              onClick={() => {
                signOutAcc()
                router.push("/")
              }}
              className="text-gray-300 hover:text-white"
            >
              Logout
            </button>
          )}
        </div>
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden flex flex-col mt-4 space-y-2">
          <Link
            href="/features"
            className="text-gray-300 hover:text-white px-4 py-2"
          >
            Features
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              className="text-gray-300 hover:text-white px-4 py-2"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-gray-300 hover:text-white px-4 py-2"
            >
              Login
            </Link>
          )}

          {user && (
            <div>
              <button
                onClick={() => signOutAcc()}
                className="text-gray-300 hover:text-white px-4 py-2"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
