"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Trash2 } from "lucide-react"

interface RemoveTeamMemberButtonProps {
  memberId: string
  memberName: string
}

export function RemoveTeamMemberButton({ memberId, memberName }: RemoveTeamMemberButtonProps) {
  const router = useRouter()
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    setIsRemoving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("team_members").delete().eq("id", memberId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("[v0] Error removing team member:", error)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove team member?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{memberName}</strong> from this team?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={isRemoving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isRemoving ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
