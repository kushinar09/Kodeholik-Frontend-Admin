"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MESSAGES } from "@/lib/messages"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { requestResetPassword } from "@/lib/api/auth_api"
import LoadingScreen from "@/components/layout/loading"

// Form validation
const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Please enter your email").email("Please enter a valid email address")
})

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const location = useLocation()

  useEffect(() => {
    if (location.state?.tokenExpired) {
      toast({
        title: "Error",
        description: "Your reset link has expired. Please try again.",
        variant: "destructive"
      })
    }
  }, [location])

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  })

  const onSubmit = async (data) => {
    setLoading(true)

    try {

      const result = await requestResetPassword(data.email)
      if (result.status) {
        setLoading(true)
        setTimeout(() => {
          navigate("/login", { state: { sendEmail: true } })
        }, 500)
      } else if (result.field === "email") {
        form.setError("email", {
          type: "manual",
          message: result.message ? result.message : MESSAGES["MSG08"].content
        })
      } else {
        throw new Error("An error occurred while processing your request")
      }
    } catch (error) {
      form.setError("email", {
        type: "manual",
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4 pt-10 bg-bg-primary">
      {loading && <LoadingScreen loadingText="Sending..." />}
      <Card className="h-fit mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>Enter your email address to receive a password reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          className={cn(
                            form.formState.errors.email && "border-border-error focus-visible:ring-0 focus:border-destructive"
                          )}
                          placeholder="m@example.com"
                          type="text"
                          autoComplete="email"
                          autoCapitalize="none"
                          autoCorrect="off"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-semibold"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send"}
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full bg-primary text-primary-foreground font-semibold"
                  disabled={loading}
                >
                  Back
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

