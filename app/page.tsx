"use client"

import { useState } from "react"
import ImageUploader from "@/components/ImageUploader"
import CanvasEditor from "@/components/CanvasEditor"
import PresetSelector from "@/components/Presets"
import { Preset } from "@/types/preset"

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [rectPreset, setRectPreset] = useState({
    x: 100,
    y: 100,
    width: 400,
    height: 300,
  })

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl)
  }

  const onPresetSubmit = (preset: Preset) => {
    console.log(preset)
    setRectPreset({
      x: 100,
      y: 100,
      width: preset.width,
      height: preset.height,
    })
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Magic Resize</h1>
      {!uploadedImage ? (
        <ImageUploader onUpload={handleImageUpload} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(800px,1fr)_1fr] gap-8 flex-1">
            <div className="min-w-[800px]">
                {uploadedImage && <CanvasEditor imageUrl={uploadedImage} rectPreset={rectPreset} />}
            </div>
            <div>
                {uploadedImage && <PresetSelector onPresetSubmit={onPresetSubmit} />}
            </div>
        </div>
      )}
    </main>
  )
}