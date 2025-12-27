"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface TeamFormProps {
  team?: any
}

export function TeamForm({ team }: TeamFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: team?.name || "",
    description: team?.description || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (team) {
        // Update existing team
        const { error: updateError } = await supabase.from("teams").update(formData).eq("id", team.id)

        if (updateError) throw updateError
        router.push(`/teams/${team.id}`)
      } else {
        // Create new team
        const { data, error: insertError } = await supabase.from("teams").insert([formData]).select().single()

        if (insertError) throw insertError
        router.push(`/teams/${data.id}`)
      }

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
            <div className="space-y-2">
              <Label htmlFor="name">
                Team Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mechanics"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this team's responsibilities"
                rows={4}
              />
            </div>

            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            <div className="flex gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href={team ? `/teams/${team.id}` : "/teams"}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : team ? "Update Team" : "Create Team"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
