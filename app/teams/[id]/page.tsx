import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import type { Profile, TeamMember } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, User, Edit } from "lucide-react"
import { DeleteTeamButton } from "@/components/delete-team-button"
import { AddTeamMemberDialog } from "@/components/add-team-member-dialog"
import { RemoveTeamMemberButton } from "@/components/remove-team-member-button"

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Fetch team details
  const { data: team } = await supabase.from("teams").select("*").eq("id", id).single()

  if (!team) {
    redirect("/teams")
  }

  // Fetch team members with profile info
  const { data: teamMembers } = await supabase
    .from("team_members")
    .select(
      `
      *,
      profiles(id, full_name, email, role, avatar_url)
    `,
    )
    .eq("team_id", id)

  // Get all users who can be added to the team (not already members)
  const memberUserIds = teamMembers?.map((tm) => tm.user_id) || []
  const { data: availableUsers } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["technician", "manager", "admin"])
    .not("id", "in", `(${memberUserIds.length > 0 ? memberUserIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)

  const isAdmin = ["admin", "manager"].includes(profile.role)

  return (
    <DashboardLayout user={profile as Profile}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/teams">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Teams
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{team.name}</h1>
            {team.description && <p className="text-slate-500 dark:text-slate-400">{team.description}</p>}
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/teams/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
              <DeleteTeamButton teamId={id} teamName={team.name} />
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Team Members ({teamMembers?.length || 0})</CardTitle>
              {isAdmin && <AddTeamMemberDialog teamId={id} availableUsers={availableUsers || []} />}
            </div>
          </CardHeader>
          <CardContent>
            {teamMembers && teamMembers.length > 0 ? (
              <div className="space-y-3">
                {teamMembers.map((member) => {
                  const typedMember = member as TeamMember & {
                    profiles: Profile
                  }
                  return (
                    <div
                      key={typedMember.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {typedMember.profiles.full_name || typedMember.profiles.email}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                            {typedMember.profiles.role}
                          </p>
                        </div>
                      </div>
                      {isAdmin && (
                        <RemoveTeamMemberButton
                          memberId={typedMember.id}
                          memberName={typedMember.profiles.full_name || typedMember.profiles.email}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No members yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Add team members to start assigning maintenance tasks
                </p>
                {isAdmin && <AddTeamMemberDialog teamId={id} availableUsers={availableUsers || []} />}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
