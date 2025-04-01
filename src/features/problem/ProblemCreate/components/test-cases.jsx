"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, Upload, FileText, Info } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import LoadingScreen from "@/components/layout/loading"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from "@/components/ui/dialog"
import ExcelUploadGuidePage from "./guide-testcase"

const formSchema = z.object({
  excelFile: z.instanceof(File, { message: "Test case file is required" }).nullable(),
})

export function TestCases({ formData, updateFormData, onPrevious, onSubmit }) {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      excelFile: null,
    },
  })

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setIsUploading(true)

      try {
        // Simulate file processing time
        // Replace this with your actual file processing logic
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setFile(selectedFile)
        form.setValue("excelFile", selectedFile)
      } catch (error) {
        console.error("Error processing file:", error)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleSubmit = async (values) => {
    setIsUploading(true)

    try {
      // Simulate form submission time
      // Replace this with your actual submission logic
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const transformedData = {
        excelFile: values.excelFile,
      }

      updateFormData(transformedData, "testcases")
      onSubmit()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      {isUploading && <LoadingScreen loadingText="Upload file..." />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <h2 className="text-2xl font-bold">Test Cases</h2>

          <Alert className="bg-muted">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Please upload a test case file. Make sure to follow the required format.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Test Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="excelFile"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <div className="border-2 border-dashed rounded-md p-6">
                        <div className="text-center">
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
                                disabled={isUploading}
                              >
                                Change File
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground mb-1">
                                Drag and drop or click to upload test cases
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById("file-upload").click()}
                                disabled={isUploading}
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
                            disabled={isUploading}
                            {...field}
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Guide</Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-auto sm:max-w-[500px] md:max-w-[600px] lg:max-w-[900px] xl:max-w-[1200px]">
                    <ExcelUploadGuidePage />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              className="flex items-center"
              disabled={isUploading}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isUploading}>
              Create Problem
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

