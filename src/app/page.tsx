"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="flex flex-col items-center justify-center p-24 min-h-screen bg-gray-100">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to Your Pantry Manager!</h1>
        <p className="text-lg text-gray-700">Manage your pantry and discover new recipes effortlessly.</p>
      </header>
      
      <section className="text-center mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Get Started</h2>
        <p className="text-base text-gray-600 max-w-md mx-auto mb-6">
          Easily add, update, and manage the items in your pantry. Let our AI suggest delicious recipes based on what you have!
        </p>
        
        { user ? (
          <Link href="/dashboard"  className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700">
            Go to Pantry
          </Link>
        ) : (
          <Link href="/signup"  className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700">
            Sign Up
          </Link>
        ) }

      </section>
      
      <section className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Why Use Our App?</h2>
        <ul className="text-base text-gray-600 max-w-md mx-auto list-disc list-inside">
          <li className="mb-2">Keep track of your pantry items</li>
          <li className="mb-2">Get recipe suggestions based on your pantry</li>
          <li className="mb-2">Easy to use and manage</li>
          <li className="mb-2">Save time and reduce food waste</li>
          <li className="mb-2">Classification of images using AI</li>
        </ul>
      </section>
      
      <footer className="text-center mt-12">
        <p className="text-sm text-gray-500">&copy; 2024 Pantry Manager. All rights reserved.</p>
      </footer>
    </main>
  );
}
