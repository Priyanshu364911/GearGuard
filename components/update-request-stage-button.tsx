"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Check, Play, XCircle } from "lucide-react"

interface UpdateRequestStageButtonProps {
  requestId: string
  currentStage: string
  nextStage: string
}

export function UpdateRequestStageButton({ requestId, currentStage, nextStage }: UpdateRequestStageButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const updateData: any = { stage: nextStage }

      // If moving to repaired, set completed_date
      if (nextStage === "repaired") {
        updateData.completed_date = new Date().toISOString()
      }

      const { error } = await supabase.from("maintenance_requests").update(updateData).eq("id", requestId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating request stage:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const stageConfig = {
    in_progress: { label: "Start Work", icon: Play, variant: "default" as const, show: currentStage === "new" },
    repaired: {
      label: "Mark as Repaired",
      icon: Check,
      variant: "default" as const,
      show: currentStage === "in_progress",
    },
    scrap: {
      label: "Mark as Scrap",
      icon: XCircle,
      variant: "destructive" as const,
      show: currentStage !== "scrap" && currentStage !== "repaired",
    },
  }

  const config = stageConfig[nextStage as keyof typeof stageConfig]

  if (!config || !config.show) return null

  const Icon = config.icon

  return (
    <Button variant={config.variant} className="w-full" onClick={handleUpdate} disabled={isLoading}>
      <Icon className="mr-2 h-4 w-4" />
      {isLoading ? "Updating..." : config.label}
    </Button>
  )
}
