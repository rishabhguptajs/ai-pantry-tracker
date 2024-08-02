"use client";
import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import Webcam from "react-webcam";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/db/firebase";
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  userId: string;
  imageUrl?: string;
  classification?: string;
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
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [classification, setClassification] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<string[]>([]);
  const webcamRef = useRef<Webcam>(null);

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

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    setCapturedImage(imageSrc || null);
  };

  const classifyImage = async (imageBlob: Blob) => {
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result?.toString().split(",")[1];
          if (base64) {
            resolve(base64);
          } else {
            reject(new Error("Failed to convert image to base64"));
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(imageBlob);
      });

      const base64Image = await base64Promise;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
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
                  text: "What's in this image?"
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  }
                }
              ]
            }
          ],
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error classifying image: ", error);
      throw error;
    }
  };

  const suggestRecipes = async () => {
    try {
      const ingredients = items.map((item) => item.name).join(", ");
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mixtral-8x7b-instruct",
          messages: [
            {
              role: "user",
              content: `Suggest some recipes using the following ingredients: ${ingredients}`,
            }
          ],
          response_format: { type: 'json_object' }
        }),
      });

      const result = await response.json();
      const recipeSuggestions = result?.choices?.[0]?.message?.content?.split("\n") || [];
      setRecipes(recipeSuggestions);
    } catch (error) {
      console.error("Error suggesting recipes: ", error);
      setRecipes([]);
    }
  };

  const handleAddItem = async () => {
    try {
      let uploadedImageUrl: string | undefined;
      if (capturedImage) {
        const imageRef = ref(storage, `images/${Date.now()}.jpg`);
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const classificationResult = await classifyImage(blob);
        setClassification(classificationResult?.classification || "Unknown");
        await uploadBytes(imageRef, blob);
        uploadedImageUrl = await getDownloadURL(imageRef);
      }

      if (isUpdateMode && itemId) {
        const itemRef = doc(db, "pantry", itemId);
        await updateDoc(itemRef, {
          name,
          quantity,
          imageUrl: uploadedImageUrl || undefined,
          classification: classification || undefined,
        });
      } else {
        await addDoc(collection(db, "pantry"), {
          name,
          quantity,
          userId: user!.uid,
          imageUrl: uploadedImageUrl || undefined,
          classification: classification || undefined,
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
    setCapturedImage(null);
    setClassification(null);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setName("");
    setQuantity(1);
    setItemId(null);
    setCapturedImage(null);
    setClassification(null);
  };

  const openUpdateModal = (item: PantryItem) => {
    setIsUpdateMode(true);
    setName(item.name);
    setQuantity(item.quantity);
    setItemId(item.id);
    setCapturedImage(item.imageUrl || null);
    setClassification(item.classification || null);
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
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={suggestRecipes}
          >
            Suggest Recipes
          </button>
        </div>

        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-4 px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-2"
          onClick={handleSearch}
        >
          Search
        </button>

        <div className="mt-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center border p-2 my-2">
              <div>
                <h3 className="font-bold">{item.name}</h3>
                <p>Quantity: {item.quantity}</p>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover" />
                )}
                {item.classification && (
                  <p>Classification: {item.classification}</p>
                )}
              </div>
              <div>
                <button
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2"
                  onClick={() => openUpdateModal(item)}
                >
                  Update
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
            {recipes.length > 0 ? (
              recipes.map((recipe : any, index) => (
                <div key={index} className="p-4 border rounded-md mb-4">
                  <h3 className="font-bold text-xl">{recipe.title}</h3>
                  <h4 className="font-bold mt-2">Ingredients:</h4>
                  <ul className="list-disc list-inside">
                    {recipe.ingredients.map((ingredient: any, idx: number) => (
                      <li key={idx}>{ingredient}</li>
                    ))}
                  </ul>
                  <h4 className="font-bold mt-2">Instructions:</h4>
                  <ol className="list-decimal list-inside">
                    {recipe.instructions.map((instruction: any, idx: number) => (
                      <li key={idx}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              ))
            ) : (
              <p>No recipes suggested</p>
            )}
          </div>

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Add Item">
        <h2>{isUpdateMode ? "Update Item" : "Add Item"}</h2>
        <form>
          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>
          {capturedImage && (
            <div>
              <img src={capturedImage} alt="Captured" className="w-20 h-20 object-cover" />
            </div>
          )}
          <div>
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
            <button type="button" onClick={handleCapture}>
              Capture Image
            </button>
          </div>
          <div>
            <button type="button" onClick={handleAddItem}>
              {isUpdateMode ? "Update Item" : "Add Item"}
            </button>
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
