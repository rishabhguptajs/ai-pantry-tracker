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
import Head from "next/head"
import toast, { Toaster } from "react-hot-toast"

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

        const recipes = result.choices[0].message.content

        console.log(recipes)

        setRecipes(recipes)
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
    <div className="flex flex-col mx-auto p-4 max-w-screen-md">
      <Toaster />
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-left">Welcome {user?.email}</p>
        <button
          onClick={openModal}
          className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
        >
          Add Item
        </button>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for an item"
          className="border p-2 rounded-md w-full"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
        >
          Search
        </button>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-bold">Items</h2>
        <ul>
          {items.map((item) => (
            <li
              key={item.id}
              className="border p-2 rounded-md my-2 flex justify-between"
            >
              <div>
                <p>Name: {item.name}</p>
                <p>Quantity: {item.quantity}</p>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} width={100} />
                )}
                {item.classification && (
                  <p>Classification: {item.classification}</p>
                )}
              </div>
              <div>
                <button
                  onClick={() => openUpdateModal(item)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded-md"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-bold">Recipe Suggestions</h2>
        <button
          onClick={suggestRecipes}
          className="bg-green-500 text-white px-4 py-2 rounded-md mt-2"
        >
          Suggest Recipes
        </button>
        {recipes && (
          <div className="mt-4 p-4 border rounded-md">
            <h3 className="text-lg font-bold">Suggested Recipes:</h3>
            <p>{recipes}</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add Item Modal"
        className="p-4 w-full max-w-md overflow-y-scroll max-h-[90vh] mx-auto mt-8 bg-white rounded-md shadow-md"
        overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-lg font-bold">
          {isUpdateMode ? "Update Item" : "Add Item"}
        </h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <label className="block mt-4">
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded-md w-full"
            />
          </label>
          <label className="block mt-4">
            Quantity:
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border p-2 rounded-md w-full"
            />
          </label>

          <div className="mt-4">
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
            <button
              type="button"
              onClick={handleCapture}
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
            >
              Capture Image
            </button>
          </div>

          {capturedImage && (
            <div className="mt-4">
              <img src={capturedImage} alt="Captured" />
              <button
                type="button"
                onClick={handleClassifyImage}
                className="bg-green-500 text-white px-4 py-2 rounded-md mt-2"
              >
                Classify Image
              </button>
              {classification && <p>Classification: {classification}</p>}
            </div>
          )}

          <button
            type="submit"
            onClick={handleAddItem}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
          >
            {isUpdateMode ? "Update Item" : "Add Item"}
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="bg-gray-500 text-white px-4 py-2 rounded-md mt-4 ml-2"
          >
            Cancel
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default Dashboard
