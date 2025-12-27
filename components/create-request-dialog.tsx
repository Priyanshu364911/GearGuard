"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import type { Equipment, Team, Profile } from "@/lib/types"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Plus } from "lucide-react"

interface CreateRequestDialogProps {
  equipment: (Equipment & {
    equipment_categories: { id: string; name: string } | null
    teams: { id: string; name: string } | null
  })[]
  teams: Team[]
  technicians: Profile[]
  currentUser: Profile
}

export function CreateRequestDialog({ equipment, teams, technicians, currentUser }: CreateRequestDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    equipment_id: "",
    category_id: "",
    team_id: "",
    assigned_to: "",
    request_type: "corrective" as "corrective" | "preventive",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    scheduled_date: "",
  })

  // Auto-fill logic when equipment is selected
  const handleEquipmentChange = (equipmentId: string) => {
    const selectedEquipment = equipment.find((e) => e.id === equipmentId)

    if (selectedEquipment) {
      setFormData({
        ...formData,
        equipment_id: equipmentId,
        category_id: selectedEquipment.category_id || "",
        team_id: selectedEquipment.team_id || "",
        assigned_to: selectedEquipment.assigned_technician_id || "",
      })
    } else {
      setFormData({ ...formData, equipment_id: equipmentId })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error: insertError } = await supabase.from("maintenance_requests").insert([
        {
          ...formData,
          requested_by: currentUser.id,
          scheduled_date: formData.scheduled_date || null,
          category_id: formData.category_id || null,
          team_id: formData.team_id || null,
          assigned_to: formData.assigned_to || null,
        },
      ])

      if (insertError) throw insertError

      setIsOpen(false)
      setFormData({
        subject: "",
        description: "",
        equipment_id: "",
        category_id: "",
        team_id: "",
        assigned_to: "",
        request_type: "corrective",
        priority: "medium",
        scheduled_date: "",
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Maintenance Request</DialogTitle>
          <DialogDescription>Submit a new maintenance request for equipment</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of the issue"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="equipment_id">
                  Equipment <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.equipment_id} onValueChange={handleEquipmentChange} required>
                  <SelectTrigger id="equipment_id">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} {item.serial_number && `(${item.serial_number})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="request_type">Request Type</Label>
                <Select
                  value={formData.request_type}
                  onValueChange={(value: "corrective" | "preventive") =>
                    setFormData({ ...formData, request_type: value })
                  }
                >
                  <SelectTrigger id="request_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrective">Corrective (Breakdown)</SelectItem>
                    <SelectItem value="preventive">Preventive (Routine)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team_id">Team (Auto-filled)</Label>
                <Select
                  value={formData.team_id}
                  onValueChange={(value) => setFormData({ ...formData, team_id: value })}
                >
                  <SelectTrigger id="team_id">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assign To (Auto-filled)</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                >
                  <SelectTrigger id="assigned_to">
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.full_name || tech.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="scheduled_date">Scheduled Date (Optional)</Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the issue"
                  rows={4}
                />
              </div>
            </div>

            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
