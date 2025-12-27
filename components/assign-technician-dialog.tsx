"use client"

import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { UserPlus, User } from "lucide-react"

interface AssignTechnicianDialogProps {
  requestId: string
  technicians: Profile[]
  currentTechnicianId: string | null
}

export function AssignTechnicianDialog({ requestId, technicians, currentTechnicianId }: AssignTechnicianDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>(currentTechnicianId || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleAssign = async () => {
    if (!selectedTechnicianId) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("maintenance_requests")
        .update({ assigned_to: selectedTechnicianId })
        .eq("id", requestId)

      if (error) throw error

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error assigning technician:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
          <UserPlus className="h-4 w-4 mr-1" />
          {currentTechnicianId ? "Reassign" : "Assign Technician"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Technician</DialogTitle>
          <DialogDescription>Select a technician to assign to this request</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a technician" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{tech.full_name || tech.email}</span>
                      <span className="text-xs text-muted-foreground capitalize">({tech.role})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedTechnicianId || isLoading}>
            {isLoading ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
