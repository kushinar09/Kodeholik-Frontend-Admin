"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordInput } from "@/components/ui/password-input"
import { toast } from "@/hooks/use-toast"

import { validateResetToken, resetPassword } from "@/lib/api/auth_api"
import LoadingScreen from "@/components/layout/loading"

// Schema for password validation
const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(20, { message: "Password must be at most 20 characters long" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[\W_]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  })

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isValidating, setIsValidating] = useState(true)

  const searchParams = new URLSearchParams(location.search)
  const token = searchParams.get("token")

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  })

  useEffect(() => {
    async function checkToken() {
      const result = await validateResetToken(token)
      if (!result.valid) {
        navigate(result.expired ? "/forgot" : "/login", { state: { tokenExpired: result.expired } })
      }
      setIsValidating(false)
    }

    checkToken()
  }, [token, navigate])

  async function onSubmit(values) {
    try {
      await resetPassword(token, values.password)
      navigate("/login", { state: { resetSuccess: true } })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex h-screen pt-10 bg-bg-primary w-full items-center justify-center px-4">
      {isValidating && <LoadingScreen loadingText="Sending..." />}
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your new password to reset your password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="password">New Password</FormLabel>
                      <FormControl>
                        <PasswordInput id="password" autoComplete="new-password" {...field} disabled={isValidating} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput id="confirmPassword" autoComplete="new-password" {...field} disabled={isValidating} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" variant="outline" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
