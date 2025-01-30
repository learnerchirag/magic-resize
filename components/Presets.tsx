import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Preset } from "@/types/preset"
import * as data from "@/data.json"
import Image from "next/image"

interface PresetSelectorProps {
  onPresetSubmit: (preset: Preset) => void
}

export default function PresetSelector({ onPresetSubmit }: PresetSelectorProps) {
  const [presets, setPresets] = useState<Preset[]>([])
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  useEffect(() => {
    // fetch("https://ai-api.magicstudio.com/api/magic-resize/size-presets", { mode: 'no-cors' })
    //   .then((response) => response.json())
    //   .then((data) => setPresets(data.size_presets))
    //   .catch((error) => console.error("Error fetching presets:", error))

    setPresets(data.size_presets)
  }, [])

  const handleSubmit = () => {
    const preset = presets.find((p) => p.name === selectedPreset)
    if (preset) {
      onPresetSubmit(preset)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select a Preset</h2>
      <div className="grid grid-cols-6 gap-4">
        {presets.map((preset) => (
          <div
            key={preset.name}
            className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${
              selectedPreset === preset.name ? "border-primary-default bg-primary-10" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedPreset(preset.name)}
          >
            <span className="font-medium text-center">{preset.name}</span>
            <div className="relative w-4 h-4 mb-2">
              <Image src={preset.icon_url || "/placeholder.svg"} alt={preset.name} fill className="object-contain" />
            </div>
            <span className="text-sm text-gray-500 text-center">
              {preset.aspect_ratio_label}{"\n"}
              {preset.width}x{preset.height}
            </span>
          </div>
        ))}
      </div>
      <Button onClick={handleSubmit} disabled={!selectedPreset} className="w-full">
        Apply Preset
      </Button>
    </div>
  )
}

