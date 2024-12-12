"use client"

import React, { useState, useEffect, useRef } from "react"
import Modal from "react-modal"
import Webcam from "react-webcam"
import { useAuth } from "@/context/AuthContext"
import { db, storage } from "@/db/firebase"
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import toast, { Toaster } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "../components/navbar"

interface PantryItem {
  id: string
  name: string
  quantity: number
  userId: string
  imageUrl?: string
  classification?: string
}

const Dashboard = () => {
  const { user } = useAuth()
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [items, setItems] = useState<PantryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [itemId, setItemId] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [classification, setClassification] = useState<string | null>(null)
  const [recipes, setRecipes] = useState<string>("")
  const webcamRef = useRef<Webcam>(null)

  useEffect(() => {
    if (user) {
      fetchItems()
    }
  }, [user])

  const fetchItems = async () => {
    const q = query(collection(db, "pantry"), where("userId", "==", user!.uid))
    const querySnapshot = await getDocs(q)
    const itemsArray = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PantryItem[]
    setItems(itemsArray)
  }

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    setCapturedImage(imageSrc || null)
  }

  const classifyImage = async (imageBlob: Blob) => {
    try {
      if (classification) {
        return { classification }
      }

      const classifyImageHelper = async () => {
        const reader = new FileReader()
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const base64 = reader.result?.toString().split(",")[1]
            if (base64) {
              resolve(base64)
            } else {
              reject(new Error("Failed to convert image to base64"))
            }
          }
          reader.onerror = (error) => reject(error)
          reader.readAsDataURL(imageBlob)
        })

        const base64Image = await base64Promise

        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "mistralai/mixtral-8x7b-instruct",
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: "What's in this image?",
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:image/jpeg;base64,${base64Image}`,
                      },
                    },
                  ],
                },
              ],
              response_format: { type: "json_object" },
            }),
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const result = await response.json()
        return result
      }

      return toast.promise(classifyImageHelper(), {
        loading: "Classifying image...",
        success: "Image classified successfully!",
        error: "Failed to classify image",
      })
    } catch (error) {
      console.error("Error classifying image: ", error)
      throw error
    }
  }

  const suggestRecipes = async () => {
    try {
      const suggestRecipeHelper = async () => {
        const ingredients = items.map((item) => item.name).join(", ")
        console.log("Ingredients: ", ingredients)

        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "qwen/qwen-2-7b-instruct:free",
              messages: [
                {
                  role: "user",
                  content: `Suggest some recipes using the following ingredients: ${ingredients}`,
                },
                {
                  role: "assistant",
                  content: "Sure! Here are some recipes you can try:",
                },
              ],
              response_format: { type: "json_object" },
            }),
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const result = await response.json()

        const rawRecipes = result.choices[0].message.content
        const formattedRecipes = formatRecipes(rawRecipes)

        console.log(formattedRecipes)

        setRecipes(formattedRecipes)
      }

      toast.promise(suggestRecipeHelper(), {
        loading: "Suggesting recipes...",
        success: "Recipes suggested successfully!",
        error: "Failed to suggest recipes",
      })
    } catch (error) {
      console.error("Error suggesting recipes: ", error)
      setRecipes("")
    }
  }

  const formatRecipes = (rawRecipes: string) => {
    return rawRecipes
      .replace(/(\d+)\. /g, "<strong>$1.</strong> ")
      .replace(/(\*\*.*?\*\*)/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br />")
  }

  const handleAddItem = async () => {
    try {
      const addItemHelper = async () => {
        let uploadedImageUrl: string | undefined
        let itemClassification: string | undefined | any
        if (capturedImage) {
          const imageRef = ref(storage, `images/${Date.now()}.jpg`)
          const response = await fetch(capturedImage)
          const blob = await response.blob()
          const classificationResult = await classifyImage(blob)
          console.log(classificationResult)
          itemClassification = classificationResult?.classification || "Unknown"
          setClassification(itemClassification)
          await uploadBytes(imageRef, blob)
          uploadedImageUrl = await getDownloadURL(imageRef)
        }

        const newItem = {
          name,
          quantity,
          userId: user!.uid,
          ...(uploadedImageUrl && { imageUrl: uploadedImageUrl }),
          ...(itemClassification && { classification: itemClassification }),
        }

        if (isUpdateMode && itemId) {
          const itemRef = doc(db, "pantry", itemId)
          await updateDoc(itemRef, newItem)
        } else {
          await addDoc(collection(db, "pantry"), newItem)
        }
        closeModal()
        fetchItems()
      }

      toast.promise(addItemHelper(), {
        loading: "Adding item...",
        success: "Item added successfully!",
        error: "Failed to add item",
      })
    } catch (e) {
      console.error("Error adding/updating document: ", e)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "pantry", id))
      fetchItems()
    } catch (e) {
      console.error("Error deleting document: ", e)
    }
  }

  const handleSearch = async () => {
    const q = query(
      collection(db, "pantry"),
      where("userId", "==", user!.uid),
      where("name", "==", searchTerm)
    )
    const querySnapshot = await getDocs(q)
    const itemsArray = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PantryItem[]
    setItems(itemsArray)
  }

  const openModal = () => {
    setIsUpdateMode(false)
    setCapturedImage(null)
    setClassification(null)
    setModalIsOpen(true)
  }

  const closeModal = () => {
    setModalIsOpen(false)
    setName("")
    setQuantity(1)
    setItemId(null)
    setCapturedImage(null)
    setClassification(null)
  }

  const openUpdateModal = (item: PantryItem) => {
    setIsUpdateMode(true)
    setName(item.name)
    setQuantity(item.quantity)
    setItemId(item.id)
    setCapturedImage(item.imageUrl || null)
    setClassification(item.classification || null)
    setModalIsOpen(true)
  }

  const handleClassifyImage = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault()
    if (capturedImage) {
      const response = await fetch(capturedImage)
      const blob = await response.blob()
      const classified = await classifyImage(blob)
      setClassification(classified?.classification || "Unknown")
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Toaster position="top-right" />
      <Navbar />
      
      <div className="fixed inset-0 bg-gradient-to-b from-violet-600/10 to-fuchsia-600/10 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/20 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto p-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-12"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
              Your Pantry
            </h1>
            <p className="text-gray-400">Welcome back, {user?.email}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openModal}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl text-white font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Item
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your pantry..."
              className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-300"
              >
                {item.imageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {item.name}
                  </h3>
                  <div className="space-y-2 text-gray-400">
                    <p className="flex items-center gap-2">
                      <span className="text-sm">Quantity:</span>
                      <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                        {item.quantity}
                      </span>
                    </p>
                    {item.classification && (
                      <p className="flex items-center gap-2">
                        <span className="text-sm">Type:</span>
                        <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                          {item.classification}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="mt-6 flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openUpdateModal(item)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-all"
                    >
                      Update
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm font-medium transition-all"
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Recipe Suggestions
            </h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={suggestRecipes}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium hover:opacity-90 transition-all flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Generate Recipes
            </motion.button>
          </div>
          {recipes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-invert max-w-none"
            >
              <div
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: recipes }}
              />
            </motion.div>
          )}
        </motion.div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="bg-gray-900/95 backdrop-blur-xl p-8 rounded-2xl border border-gray-800 max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto relative"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
          },
        }}
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-6">
          {isUpdateMode ? "Update Item" : "Add New Item"}
        </h2>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              placeholder="Enter item name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              min="1"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Capture Image
            </label>
            <div className="relative rounded-xl overflow-hidden">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-xl"
              />
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleCapture}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl text-white font-medium hover:opacity-90 transition-all"
              >
                Capture Image
              </motion.button>
              {capturedImage && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleClassifyImage}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium hover:opacity-90 transition-all"
                >
                  Classify Image
                </motion.button>
              )}
            </div>
          </div>

          {capturedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl overflow-hidden"
            >
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full rounded-xl"
              />
              {classification && (
                <div className="mt-2 px-4 py-2 bg-gray-800 rounded-lg text-gray-300">
                  Classification: {classification}
                </div>
              )}
            </motion.div>
          )}

          <div className="flex gap-3 mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              onClick={handleAddItem}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl text-white font-medium hover:opacity-90 transition-all"
            >
              {isUpdateMode ? "Update Item" : "Add Item"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={closeModal}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-all"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Dashboard
