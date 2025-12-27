"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import type { EquipmentCategory, Team, Profile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EquipmentFormProps {
  categories: EquipmentCategory[]
  teams: Team[]
  technicians: Profile[]
  equipment?: any
}

export function EquipmentForm({ categories, teams, technicians, equipment }: EquipmentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: equipment?.name || "",
    serial_number: equipment?.serial_number || "",
    category_id: equipment?.category_id || "",
    team_id: equipment?.team_id || "",
    assigned_technician_id: equipment?.assigned_technician_id || "",
    department: equipment?.department || "",
    assigned_employee: equipment?.assigned_employee || "",
    purchase_date: equipment?.purchase_date || "",
    warranty_expiry: equipment?.warranty_expiry || "",
    location: equipment?.location || "",
    status: equipment?.status || "active",
    notes: equipment?.notes || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (equipment) {
        // Update existing equipment
        const { error: updateError } = await supabase
          .from("equipment")
          .update({
            ...formData,
            purchase_date: formData.purchase_date || null,
            warranty_expiry: formData.warranty_expiry || null,
          })
          .eq("id", equipment.id)

        if (updateError) throw updateError
      } else {
        // Create new equipment
        const { error: insertError } = await supabase.from("equipment").insert([
          {
            ...formData,
            purchase_date: formData.purchase_date || null,
            warranty_expiry: formData.warranty_expiry || null,
          },
        ])

        if (insertError) throw insertError
      }

      router.push("/equipment")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Equipment Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., CNC Machine 01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  placeholder="e.g., SN-123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger id="category_id">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team_id">Maintenance Team</Label>
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
                <Label htmlFor="assigned_technician_id">Assigned Technician</Label>
                <Select
                  value={formData.assigned_technician_id}
                  onValueChange={(value) => setFormData({ ...formData, assigned_technician_id: value })}
                >
                  <SelectTrigger id="assigned_technician_id">
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

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="scrapped">Scrapped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Production"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_employee">Assigned Employee</Label>
                <Input
                  id="assigned_employee"
                  value={formData.assigned_employee}
                  onChange={(e) => setFormData({ ...formData, assigned_employee: e.target.value })}
                  placeholder="e.g., John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Building A, Floor 2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
                <Input
                  id="warranty_expiry"
                  type="date"
                  value={formData.warranty_expiry}
                  onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this equipment"
                rows={4}
              />
            </div>

            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            <div className="flex gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href="/equipment">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : equipment ? "Update Equipment" : "Create Equipment"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
