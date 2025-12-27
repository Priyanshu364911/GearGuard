import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import type { Profile, Team } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, UsersIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function TeamsPage() {
  const supabase = await createClient()

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

  // Fetch all teams with member count
  const { data: teams } = await supabase.from("teams").select(
    `
      *,
      team_members(count)
    `,
  )

  return (
    <DashboardLayout user={profile as Profile}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Maintenance Teams</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your maintenance teams and members</p>
          </div>
          {["admin", "manager"].includes(profile.role) && (
            <Button asChild>
              <Link href="/teams/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams && teams.length > 0 ? (
            teams.map((team) => {
              const typedTeam = team as Team & { team_members: { count: number }[] }
              const memberCount = typedTeam.team_members?.[0]?.count || 0

              return (
                <Link key={typedTeam.id} href={`/teams/${typedTeam.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                            <UsersIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{typedTeam.name}</CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              {memberCount} {memberCount === 1 ? "member" : "members"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    {typedTeam.description && (
                      <CardContent>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {typedTeam.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              )
            })
          ) : (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <UsersIcon className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No teams found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Get started by creating your first maintenance team
                </p>
                {["admin", "manager"].includes(profile.role) && (
                  <Button asChild>
                    <Link href="/teams/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Team
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
