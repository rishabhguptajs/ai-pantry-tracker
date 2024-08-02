import React from 'react'

const featuresList = [
  {
    title: "Capture and Upload Images",
    description: "Use your device's camera to capture images of pantry items and upload them to the cloud.",
    icon: "📸",
  },
  {
    title: "AI Image Classification",
    description: "Automatically classify images of pantry items using AI.",
    icon: "🤖",
  },
  {
    title: "Pantry Management",
    description: "Keep track of pantry items, including quantity and images.",
    icon: "📦",
  },
  {
    title: "Recipe Suggestions",
    description: "Get recipe suggestions based on the available pantry items.",
    icon: "🍽️",
  },
  {
    title: "Search Functionality",
    description: "Easily search for items in the pantry.",
    icon: "🔍",
  },
  {
    title: "Update and Delete Items",
    description: "Update item details or delete items from the pantry.",
    icon: "✏️",
  },
  {
    title: "User Authentication",
    description: "Securely log in and manage your pantry items.",
    icon: "🔒",
  },
]

const Features = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Features</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuresList.map((feature, index) => (
          <div key={index} className="border p-4 rounded-lg shadow-md flex flex-col items-center">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h2 className="text-xl font-bold mb-2">{feature.title}</h2>
            <p className="text-gray-600 text-center">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Features
