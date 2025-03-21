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

const formSchema = z.object({
  excelFile: z.instanceof(File, { message: "Test case file is required" }).nullable()
})

export function TestCases({ formData, updateFormData, onPrevious, onSubmit }) {
  const [file, setFile] = useState(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      excelFile: null
    }
  })

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      form.setValue("excelFile", selectedFile)
    }
  }

  const handleSubmit = (values) => {
    const transformedData = {
      excelFile: values.excelFile
    }

    console.log("Test Cases submitting:", transformedData)
    updateFormData(transformedData, "testcases")
    onSubmit()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold">Test Cases</h2>

        <Alert className="bg-muted">
          <Info className="h-4 w-4" />
          <AlertDescription>Please upload a test case file. Make sure to follow the required format.</AlertDescription>
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
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">File Format Guide:</h3>
              <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                <li>Each test case should be on a new line</li>
                <li>Input and expected output should be separated by a comma</li>
                <li>Follow the standard format for your test cases</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious} className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Create Problem
          </Button>
        </div>
      </form>
    </Form>
  )
}

