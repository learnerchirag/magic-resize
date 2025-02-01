"use client"

import { useState } from "react"
import ImageUploader from "@/components/ImageUploader"
import CanvasEditor from "@/components/CanvasEditor"
import PresetSelector from "@/components/Presets"
import { Preset } from "@/types/preset"
import { CanvasData } from "@/types/canvas"

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
    setRectPreset({
      x: 100,
      y: 100,
      width: preset.width,
      height: preset.height,
    })
  }

  const resizeImage = (imageUrl: string,  data: CanvasData) => {

    if (data.left === 0 && data.top === 0 && data.right === 0 && data.bottom === 0) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'resizedImage.png';
      console.log(link)
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const formData = new FormData();
    formData.append('left', data.left.toFixed(0));
    formData.append('top', data.top.toFixed(0));
    formData.append('right', data.right.toFixed(0));
    formData.append('bottom', data.bottom.toFixed(0));
    formData.append('image', imageUrl);
    
    fetch("https://ai-api.magicstudio.com/api/magic-resize", {
      method: "post",
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          console.log(data.results[0].image)
          window.open(data.results[0].image);
        }
      })
      .catch((error) => console.error("Error fetching presets:", error))
  }

  return (
    <main className="container items-center w-full max-w-fit">
      <h1 className="text-3xl font-bold mx-8 mb-8">Magic Resize</h1>
      {!uploadedImage ? (
        <ImageUploader onUpload={handleImageUpload} />
      ) : (
        <div className="grid grid-cols-1 gap-8 flex-1">
            <div className="relative left-0 w-[100vw] h-[800px] bg-slate-500">
                {uploadedImage && <CanvasEditor imageUrl={uploadedImage} rectPreset={rectPreset} onSubmit={resizeImage} />}
            </div>
            <div className="p-4 py-8">
                {uploadedImage && <PresetSelector onPresetSubmit={onPresetSubmit} />}
            </div>
        </div>
      )}
    </main>
  )
}