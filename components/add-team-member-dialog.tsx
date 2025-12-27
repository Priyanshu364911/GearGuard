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
import { Plus, User } from "lucide-react"

interface AddTeamMemberDialogProps {
  teamId: string
  availableUsers: Profile[]
}

export function AddTeamMemberDialog({ teamId, availableUsers }: AddTeamMemberDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAdd = async () => {
    if (!selectedUserId) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("team_members").insert([
        {
          team_id: teamId,
          user_id: selectedUserId,
        },
      ])

      if (error) throw error

      setIsOpen(false)
      setSelectedUserId("")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error adding team member:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>Select a user to add to this team</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {availableUsers.length > 0 ? (
            <div className="space-y-2">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{user.full_name || user.email}</span>
                        <span className="text-xs text-muted-foreground capitalize">({user.role})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              All available users are already members of this team
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedUserId || isLoading || availableUsers.length === 0}>
            {isLoading ? "Adding..." : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
