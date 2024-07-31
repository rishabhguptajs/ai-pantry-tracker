"use client";

import Link from 'next/link';
import React from 'react'

const Navbar = () => {
  return (
    <div className='max-w-screen-2xl h-fit flex m-2 bg-gray-700 text-white p-4 rounded-lg justify-between'>
        <div>
            <Link href={'/'}>AI Pantry Tracker</Link>
        </div>
        <div className='w-[30%] flex justify-between'>
            <Link href={'/feaures'}>Features</Link>
            <Link href={'/abou'}>About Us</Link>
            <Link href={'/dashboard'}>Dashboard</Link>
            <Link href={'/contact'}>Contact</Link>
        </div>
    </div>
  )
}

export default Navbar
