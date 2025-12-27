import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Wrench } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">GearGuard</h1>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Account Created!</CardTitle>
              <CardDescription>Check your email to confirm your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                We&apos;ve sent a confirmation email to your inbox. Please click the link in the email to verify your
                account before signing in.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Return to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
