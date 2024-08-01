"use client"

import React, { useState } from "react";
import Modal from "react-modal";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/db/firebase";
import { collection, addDoc } from "firebase/firestore";

// Modal.setAppElement("#__next"); // Add this to avoid accessibility issues

const Dashboard = () => {
  const { user } = useAuth();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleAddItem = async () => {
    try {
      const pantryRef = await addDoc(collection(db, "pantry"), {
        name,
        quantity,
        userId: user!.uid,
      });
      console.log("Document written with ID: ", pantryRef.id);
      closeModal();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setName("");
    setQuantity(1);
  };

  return (
    <div className="flex flex-col mx-auto p-4 max-w-screen-md">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-left">Welcome {user?.displayName}</p>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-bold">Pantry</h2>
        <p className="text-left">List of items in your pantry</p>
        
        <div className="mt-4 flex justify-between items-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={openModal}
          >
            Add Item
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search"
            className="border border-gray-400 p-2 rounded col-span-2"
          />
          <div className="flex space-x-2">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Search
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Clear
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add Pantry Item"
        className="bg-white p-8 rounded shadow-md mx-auto my-8 max-w-md"
        overlayClassName="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center"
      >
        <h2 className="text-xl font-bold mb-4">Add Pantry Item</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
              required
              min="1"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
