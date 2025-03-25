import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addUser } from "@/lib/api/user_api"
import { useAuth } from "@/provider/AuthProvider"
import { toast } from "sonner"

const formSchema = z.object({
  username: z.string().min(1, "Invalid username. Username must be 1-50 character long").max(50, "Invalid username. Username must be 1-50 character long"),
  fullname: z.string().min(1, "Invalid full name. Full name must be 1-50 character long").max(50, "Invalid full name. Full name must be 1-50 character long"),
  email: z.string().email("Wrong format email"),
  role: z.string().min(1, "Please select a role for this user")
})
export default function CreateUser({ onNavigate }) {
  const [formValues, setFormValues] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [errorImage, setErrorImage] = useState(false)
  const [roles, setRoles] = useState([
    { key: "STUDENT", name: "Student" },
    { key: "TEACHER", name: "Teacher" },
    { key: "EXAMINER", name: "Examiner" },
    { key: "ADMIN", name: "Admin" }
  ])
  const { apiCall } = useAuth()
  const fileInputRef = useRef(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      fullname: "",
      email: "",
      role: ""
    }
  })
  const watchedValues = form.watch()

  useEffect(() => {
    const values = form.getValues()
    // Only update when non-date fields change to prevent continuous re-renders
    setFormValues((prev) => ({
      ...prev
    }))
  }, [])

  useEffect(() => {
    const subscription = form.watch((value) => {
      // This runs only when form values actually change
      const timeoutId = setTimeout(() => {
        setFormValues(value)
      }, 100) // 100ms debounce

      return () => clearTimeout(timeoutId)
    })

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [form])

  const onSubmit = (values) => {
    if (imageFile == null) {
      setErrorImage(true)
    }
    else {
      const currentValues = form.getValues()
      setErrorImage(false)
      handleAddUser(currentValues)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setErrorImage(false)
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/")) {
        setImageFile(file)
        const reader = new FileReader()
        reader.onload = () => {
          setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleAddUser = async (user) => {
    try {
      const formPayload = new FormData()
      formPayload.append("avatarFile", imageFile)
      formPayload.append("fullname", user.fullname)
      formPayload.append("username", user.username)
      formPayload.append("email", user.email)
      formPayload.append("role", user.role)

      const data = await addUser(apiCall, formPayload)
      if (data == null) {
        toast.success("Add user successful!", { duration: 2000 })
        onNavigate("/user")
      }
    } catch (error) {
      console.error("Error add user:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold">Create User</h2>
        <div className="flex md:flex-row gap-4">
          <div className="lg:w-2/5 space-y-4 w-full md:w-1/2">
            <div className="flex items-center justify-between mb-2">
              <h4 className={`text-sm font-medium ${!errorImage ? "text-black" : "text-red-500"}`}>Avatar</h4>
              <input
                type="file"
                id="imageUpload"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div
              style={{ marginTop: "12px" }}
              className="w-full aspect-video rounded-lg border border-gray-700 overflow-hidden flex flex-col items-center justify-center relative"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <>
                  {/* Image container with fixed aspect ratio */}
                  <div className="w-full h-full">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Course preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Semi-transparent overlay for better button visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                  {/* Control buttons - now with z-index and better positioning */}
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/80 hover:bg-white shadow-md"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                      className="shadow-md"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* File info with better visibility */}
                  {imageFile && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-xs text-white p-2 truncate z-10">
                      {imageFile.name} ({(imageFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center h-48 w-full p-6 cursor-pointer border border-dashed border-gray-300 rounded-lg"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-black mb-4" />
                  <p className="text-black text-center">
                                        Drag and drop an image here
                    <br />
                                        or click to browse
                  </p>
                  <Button type="button" variant="outline" size="sm" className="mt-4">
                                        Select Image
                  </Button>
                </div>
              )}
            </div>
            <div className={`text-red-500 font-medium ${errorImage ? "block" : "hidden"}`}>
                            Please select an avatar for this user
            </div>
          </div>
          <div className="space-y-4 w-full md:w-1/2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input value={field.value} onChange={field.onChange} placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input value={field.value} onChange={field.onChange} placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" value={field.value} onChange={field.onChange} placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(String(value))}
                    defaultValue={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger style={{ height: "44px !important" }} className="h-10">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>

                      {roles.map((role) => (
                        <SelectItem key={role.key} value={String(role.key)}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" className="flex items-center">
                                Create
              </Button>
            </div>
          </div>

        </div>

      </form>
    </Form>
  )
}