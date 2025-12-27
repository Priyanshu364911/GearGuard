"use client"

import type { MaintenanceRequest } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface CalendarViewProps {
  requests: (MaintenanceRequest & {
    equipment: { id: string; name: string } | null
    assigned_profile: { id: string; full_name: string; email: string } | null
  })[]
}

export function CalendarView({ requests }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getRequestsForDate = (date: Date) => {
    return requests.filter((req) => {
      if (!req.scheduled_date) return false
      const reqDate = new Date(req.scheduled_date)
      return (
        reqDate.getDate() === date.getDate() &&
        reqDate.getMonth() === date.getMonth() &&
        reqDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const isToday = (day: number | null) => {
    if (!day) return false
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const typeColors = {
    corrective: "border-l-amber-500",
    preventive: "border-l-emerald-500",
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {monthNames[month]} {year}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400 py-2">
                {day}
              </div>
            ))}

            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="min-h-24 p-2 border border-transparent" />
              }

              const date = new Date(year, month, day)
              const dayRequests = getRequestsForDate(date)
              const today = isToday(day)

              return (
                <div
                  key={day}
                  className={`min-h-24 p-2 border rounded-lg ${
                    today
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${today ? "text-blue-600 dark:text-blue-400" : ""}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayRequests.slice(0, 2).map((req) => (
                      <Link key={req.id} href={`/requests/${req.id}`}>
                        <div
                          className={`text-xs p-1.5 rounded border-l-2 ${typeColors[req.request_type]} bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}
                        >
                          <p className="font-medium truncate text-slate-900 dark:text-white">{req.subject}</p>
                          {req.equipment && (
                            <p className="text-slate-500 dark:text-slate-400 truncate">{req.equipment.name}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                    {dayRequests.length > 2 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 pl-1.5">
                        +{dayRequests.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Scheduled Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.slice(0, 10).map((request) => {
                const isOverdue =
                  request.scheduled_date &&
                  new Date(request.scheduled_date) < new Date() &&
                  request.stage !== "repaired" &&
                  request.stage !== "scrap"

                return (
                  <Link
                    key={request.id}
                    href={`/requests/${request.id}`}
                    className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`flex h-12 w-12 flex-col items-center justify-center rounded-lg ${
                          isOverdue ? "bg-red-100 dark:bg-red-900" : "bg-blue-100 dark:bg-blue-900"
                        }`}
                      >
                        <span
                          className={`text-xs ${
                            isOverdue ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {new Date(request.scheduled_date!).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            isOverdue ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {new Date(request.scheduled_date!).getDate()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{request.subject}</h3>
                        <Badge
                          variant={request.request_type === "preventive" ? "default" : "secondary"}
                          className="flex-shrink-0"
                        >
                          {request.request_type}
                        </Badge>
                      </div>
                      {request.equipment && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{request.equipment.name}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(request.scheduled_date!).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {request.assigned_profile && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{request.assigned_profile.full_name || request.assigned_profile.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarIcon className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No scheduled maintenance</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Create requests with scheduled dates to see them here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
