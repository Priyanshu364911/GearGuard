"use client"

import type { MaintenanceRequest } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"

interface RequestCardProps {
  request: MaintenanceRequest & {
    equipment: { id: string; name: string; serial_number: string | null } | null
    equipment_categories: { id: string; name: string } | null
    teams: { id: string; name: string } | null
    assigned_profile: { id: string; full_name: string; email: string; avatar_url: string | null } | null
    requester_profile: { id: string; full_name: string; email: string } | null
  }
  onDragStart: (requestId: string) => void
  isOverdue: boolean
}

export function RequestCard({ request, onDragStart, isOverdue }: RequestCardProps) {
  const priorityColors = {
    low: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  const typeColors = {
    corrective: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    preventive: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  }

  return (
    <Link href={`/requests/${request.id}`}>
      <Card
        draggable
        onDragStart={() => onDragStart(request.id)}
        className={`cursor-move hover:shadow-md transition-all ${isOverdue ? "border-l-4 border-l-red-500" : ""}`}
      >
        <CardContent className="p-4 space-y-3">
          {isOverdue && (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span className="font-medium">Overdue</span>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2">{request.subject}</h3>
            {request.equipment && <p className="text-xs text-muted-foreground mt-1">{request.equipment.name}</p>}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className={`text-xs ${priorityColors[request.priority]}`}>
              {request.priority}
            </Badge>
            <Badge variant="secondary" className={`text-xs ${typeColors[request.request_type]}`}>
              {request.request_type}
            </Badge>
          </div>

          {request.assigned_profile && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                <User className="h-3 w-3" />
              </div>
              <span className="truncate">{request.assigned_profile.full_name || request.assigned_profile.email}</span>
            </div>
          )}

          {request.scheduled_date && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(request.scheduled_date).toLocaleDateString()}</span>
            </div>
          )}

          {request.duration_hours && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{request.duration_hours}h</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
