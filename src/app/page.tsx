"use client"

import React from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image"

export default function Home() {
  const { user } = useAuth()

  return (
    <main className="flex flex-col items-center justify-center p-12 min-h-screen bg-white">
      <section className="text-left mb-12 flex items-center flex-row w-full">
        <div className="w-1/2">
          <h1 className="text-4xl font-bold text-green-500 mb-4">
            Welcome to Shelfie
          </h1>
          <p className="text-lg text-gray-700 font-normal">
            Manage your{" "}
            <span className="italic font-bold text-green-600">
              favorite foods
            </span>{" "}
            and get customized{" "}
            <span className="italic font-bold text-pink-600/90">
              AI recipe suggestions
            </span>
            , anytime, anywhere!
          </p>

          <div className="mt-8 text-left">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-amber-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-amber-600/9"
              >
                Go to Pantry
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-amber-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-amber-600/85"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
        <div className="w-1/2 flex flex-col gap-3">
          <Image
            src="/foodimg.png"
            alt="Pantry"
            width={500}
            height={500}
            className="rounded-2xl"
            layout="responsive"
          />
          <div className="w-full flex flex-row space-x-2 items-center justify-center">
            <span className="bg-pink-500 w-fit p-2 rounded-3xl text-white text-xs text-center font-jacaurdaFont font-bold uppercase cursor-default">
              add some pasta, huh?
            </span>
            <span className="bg-green-500 w-fit p-2 rounded-3xl text-white text-xs text-center font-jacaurdaFont font-bold uppercase cursor-default">
              maybe some cheese?
            </span>
            <span className="bg-pink-500 w-fit p-2 rounded-3xl text-white text-xs text-center font-jacaurdaFont font-bold uppercase cursor-default">
              or some veggies?
            </span>
            <span className="bg-green-500 w-fit p-2 rounded-3xl text-white text-xs text-center font-jacaurdaFont font-bold uppercase cursor-default">
              or more.
            </span>
          </div>
        </div>
      </section>

      <section className="text-center mb-12"></section>

      <section className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Why Use Our App?
        </h2>
        <ul className="text-base text-gray-600 max-w-md mx-auto list-disc list-inside">
          <li className="mb-2">Keep track of your pantry items</li>
          <li className="mb-2">Get recipe suggestions based on your pantry</li>
          <li className="mb-2">Easy to use and manage</li>
          <li className="mb-2">Save time and reduce food waste</li>
          <li className="mb-2">Classification of images using AI</li>
        </ul>
      </section>

      <footer className="text-center mt-12">
        <p className="text-sm text-gray-500">
          &copy; 2024 Pantry Manager. All rights reserved.
        </p>
      </footer>
    </main>
  )
}
