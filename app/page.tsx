"use client"

import { useState } from "react"
import ImageUploader from "@/components/ImageUploader"
import CanvasEditor from "@/components/CanvasEditor"

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Magic Resize</h1>
      {!uploadedImage ? (
        <ImageUploader onUpload={handleImageUpload} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {uploadedImage && <CanvasEditor imageUrl={uploadedImage} />}
        </div>
      )}
    </main>
  )
}