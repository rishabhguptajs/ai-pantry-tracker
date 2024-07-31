"use client";

import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/db/firebase';
import { collection, addDoc } from 'firebase/firestore';

const Dashboard = () => {
    const { user } = useAuth();

    // const handleAddItem = async () => {
    //     const pantryRef = await addDoc(collection(db, 'pantry'), {
    //         name: 'Milk',
    //         quantity: 1,
    //         userId: user!.uid
    //     });
    //     console.log('Document written with ID: ', pantryRef.id);
    // }

  return (
    <div className='flex flex-col justify-center items-center mx-auto p-4'>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className='text-left'>Welcome {user?.displayName}</p>
    </div>
  )
}

export default Dashboard
