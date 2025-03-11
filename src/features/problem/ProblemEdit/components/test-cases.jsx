"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, Upload, FileText, Info, Download, XCircle } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import LoadingScreen from "@/components/layout/loading"
import { useAuth } from "@/provider/AuthProvider"

const formSchema = z.object({
  testCase: z.instanceof(File, { message: "Test case file is required" }).nullable()
})

export function TestCases({ formData, updateFormData, onPrevious, onSubmit, urlGetTestCase }) {
  const [file, setFile] = useState(null)
  const [fetchedFile, setFetchedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)

  const { apiCall } = useAuth()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      testCase: null
    }
  })

  // Fetch the default test case file
  useEffect(() => {
    const fetchTestCase = async () => {
      try {
        const response = await apiCall(urlGetTestCase)
        const blob = await response.blob()

        // Convert Blob to File
        const fetchedFile = new File([blob], "Testcase.xlsx", {
          type: blob.type,
          lastModified: new Date().getTime()
        })

        setFetchedFile(fetchedFile)
        setFile(fetchedFile)
        form.setValue("testCase", fetchedFile)
        updateFormData({ testCase: fetchedFile }) // Store File object
      } catch (error) {
        console.error("Error fetching test case file:", error)
      }
    }

    fetchTestCase()
  }, [])

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setIsUploading(true)
      setTimeout(() => {
        setFile(selectedFile)
        form.setValue("testCase", selectedFile)
        updateFormData({ testCase: selectedFile })
        setIsUploading(false)
      }, 1000)
    }
  }

  // Download the fetched test case
  const handleDownload = () => {
    if (!fetchedFile) return

    const url = URL.createObjectURL(fetchedFile)
    const link = document.createElement("a")
    link.href = url
    link.download = fetchedFile.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Remove the selected file and revert to fetched file
  const handleRemoveFile = () => {
    setFile(fetchedFile)
    form.setValue("testCase", fetchedFile)
    updateFormData({ testCase: fetchedFile })
    setShowFileUpload(false)
  }

  const handleSubmit = (values) => {
    console.log("Submitting:", values)
    updateFormData({ testCase: values.testCase })
    onSubmit()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold">Test Cases</h2>

        <Alert className="bg-muted">
          <Info className="h-4 w-4" />
          <AlertDescription>Please upload a test case file or use the default one provided.</AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Test Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button type="button" variant="secondary" onClick={handleDownload} className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Get Current Test Case
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                {showFileUpload ? "Cancel Upload" : "Change File"}
              </Button>
            </div>

            {showFileUpload && (
              <FormField
                control={form.control}
                name="testCase"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <div className="border-2 border-dashed rounded-md p-6 relative">
                        {isUploading && <LoadingScreen />}
                        {file ? (
                          <div className="flex flex-col items-center">
                            <FileText className="h-8 w-8 text-primary mb-2" />
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => document.getElementById("file-upload").click()}
                            >
                              Change File
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="mt-2 flex items-center"
                              onClick={handleRemoveFile}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-1">Drag and drop or click to upload</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("file-upload").click()}
                            >
                              Select File
                            </Button>
                          </div>
                        )}
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".txt,.csv,.xlsx,.xls"
                          onChange={(e) => {
                            handleFileChange(e)
                            onChange(e.target.files[0])
                          }}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious} className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Submit Problem
          </Button>
        </div>
      </form>
    </Form>
  )
}
