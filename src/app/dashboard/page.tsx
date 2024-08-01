"use client";

import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/db/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  userId: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<PantryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  const fetchItems = async () => {
    const q = query(collection(db, "pantry"), where("userId", "==", user!.uid));
    const querySnapshot = await getDocs(q);
    const itemsArray = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PantryItem[];
    setItems(itemsArray);
  };

  const handleAddItem = async () => {
    try {
      if (isUpdateMode && itemId) {
        const itemRef = doc(db, "pantry", itemId);
        await updateDoc(itemRef, {
          name,
          quantity,
        });
      } else {
        await addDoc(collection(db, "pantry"), {
          name,
          quantity,
          userId: user!.uid,
        });
      }
      closeModal();
      fetchItems();
    } catch (e) {
      console.error("Error adding/updating document: ", e);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "pantry", id));
      fetchItems();
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  const handleSearch = async () => {
    const q = query(
      collection(db, "pantry"),
      where("userId", "==", user!.uid),
      where("name", "==", searchTerm)
    );
    const querySnapshot = await getDocs(q);
    const itemsArray = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PantryItem[];
    setItems(itemsArray);
  };

  const openModal = () => {
    setIsUpdateMode(false);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setName("");
    setQuantity(1);
    setItemId(null);
  };

  const openUpdateModal = (item: any) => {
    setIsUpdateMode(true);
    setName(item.name);
    setQuantity(item.quantity);
    setItemId(item.id);
    setModalIsOpen(true);
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-400 p-2 rounded col-span-2"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Search
            </button>
            <button
              onClick={() => {
                setSearchTerm("");
                fetchItems();
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-bold">Items</h2>
        {items.length > 0 ? (
          <ul className="mt-4">
            {items.map((item: any) => (
              <li
                key={item.id}
                className="border border-gray-300 p-4 rounded mb-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openUpdateModal(item)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No items found</p>
        )}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel={isUpdateMode ? "Update Pantry Item" : "Add Pantry Item"}
        className="bg-white p-8 rounded shadow-md mx-auto my-8 max-w-md"
        overlayClassName="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center"
      >
        <h2 className="text-xl font-bold mb-4">
          {isUpdateMode ? "Update Pantry Item" : "Add Pantry Item"}
        </h2>
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
              {isUpdateMode ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
