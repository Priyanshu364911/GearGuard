"use client"

import type React from "react"

import type { MaintenanceRequest, Equipment, Team, Profile } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { CreateRequestDialog } from "@/components/create-request-dialog"
import { RequestCard } from "@/components/request-card"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface KanbanBoardProps {
  initialRequests: (MaintenanceRequest & {
    equipment: { id: string; name: string; serial_number: string | null } | null
    equipment_categories: { id: string; name: string } | null
    teams: { id: string; name: string } | null
    assigned_profile: { id: string; full_name: string; email: string; avatar_url: string | null } | null
    requester_profile: { id: string; full_name: string; email: string } | null
  })[]
  equipment: (Equipment & {
    equipment_categories: { id: string; name: string } | null
    teams: { id: string; name: string } | null
  })[]
  teams: Team[]
  technicians: Profile[]
  currentUser: Profile
}

const stages = [
  { id: "new", label: "New", color: "bg-blue-500" },
  { id: "in_progress", label: "In Progress", color: "bg-yellow-500" },
  { id: "repaired", label: "Repaired", color: "bg-green-500" },
  { id: "scrap", label: "Scrap", color: "bg-red-500" },
]

export function KanbanBoard({ initialRequests, equipment, teams, technicians, currentUser }: KanbanBoardProps) {
  const router = useRouter()
  const [requests, setRequests] = useState(initialRequests)
  const [draggedRequest, setDraggedRequest] = useState<string | null>(null)

  const handleDragStart = (requestId: string) => {
    setDraggedRequest(requestId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (stage: string) => {
    if (!draggedRequest) return

    const supabase = createClient()

    try {
      const { error } = await supabase.from("maintenance_requests").update({ stage }).eq("id", draggedRequest)

      if (error) throw error

      // Update local state
      setRequests((prev) =>
        prev.map((req) => (req.id === draggedRequest ? { ...req, stage: stage as MaintenanceRequest["stage"] } : req)),
      )

      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating request stage:", error)
    }

    setDraggedRequest(null)
  }

  const getRequestsByStage = (stage: string) => {
    return requests.filter((req) => req.stage === stage)
  }

  const isOverdue = (request: MaintenanceRequest) => {
    if (!request.scheduled_date) return false
    return new Date(request.scheduled_date) < new Date() && request.stage !== "repaired" && request.stage !== "scrap"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateRequestDialog equipment={equipment} teams={teams} technicians={technicians} currentUser={currentUser} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const stageRequests = getRequestsByStage(stage.id)

          return (
            <div
              key={stage.id}
              className="flex flex-col"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
            >
              <Card className="flex-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                      {stage.label}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">{stageRequests.length}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stageRequests.length > 0 ? (
                    stageRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        onDragStart={handleDragStart}
                        isOverdue={isOverdue(request)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">No requests</div>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
