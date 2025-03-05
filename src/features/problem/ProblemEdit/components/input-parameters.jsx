"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import CodeEditor from "@/components/layout/editor-code/CodeEditor"

// Update schema to handle multiple languages
const formSchema = z.object({
  problemInputParameterDto: z.array(
    z.object({
      language: z.string(),
      parameters: z.array(
        z.object({
          inputName: z.string().min(1, "Parameter name is required"),
          inputType: z.string().min(1, "Parameter type is required")
        })
      ),
      templateCode: z.string().min(1, "Template code is required")
    })
  ),
  sharedFunctionSignature: z.string().min(1, "Function signature is required"),
  sharedReturnType: z.string().min(1, "Return type is required")
})

export function InputParameters({ formData, updateFormData, onNext, onPrevious }) {
  // Find the first supported language or use the first one from inputParameter if it exists
  const initialLanguage =
    formData.inputParameter.length > 0 ? formData.inputParameter[0].language : formData.details.languageSupport[0] || ""

  const [activeLanguage, setActiveLanguage] = useState(initialLanguage)
  const [returnTypes] = useState([
    "INT",
    "STRING",
    "BOOLEAN",
    "void",
    "DOUBLE",
    "float",
    "LONG",
    "CHAR",
    "LIST",
    "MAP",
    "SET",
    "ARR_INT",
    "ARR_DOUBLE",
    "ARR_OBJECT",
    "ARR_STRING",
    "OBJECT",
    "UNKNOWN"
  ])

  // Initialize form with existing data or create new entries for each language
  const getDefaultValues = () => {
    // If we have existing inputParameter data, use it
    if (formData.inputParameter && formData.inputParameter.length > 0) {
      // Get the first item's shared values
      const firstItem = formData.inputParameter[0]

      // Map existing data to match form structure
      return {
        problemInputParameterDto: formData.inputParameter.map((param) => ({
          language: param.language,
          parameters: param.parameters || [],
          templateCode: param.templateCode || ""
        })),
        // Add shared fields with values from the first item
        sharedFunctionSignature: firstItem.functionSignature || "",
        sharedReturnType: firstItem.returnType || ""
      }
    }

    // Otherwise, create new entries for each supported language
    return {
      problemInputParameterDto: formData.details.languageSupport.map((lang) => ({
        language: lang,
        parameters: [],
        templateCode: ""
      })),
      sharedFunctionSignature: "",
      sharedReturnType: ""
    }
  }

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues()
  })

  // Update form when formData changes
  useEffect(() => {
    if (formData.inputParameter && formData.inputParameter.length > 0) {
      const firstItem = formData.inputParameter[0]

      const formattedData = {
        problemInputParameterDto: formData.inputParameter.map(param => ({
          language: param.language,
          parameters: param.parameters || [],
          templateCode: param.templateCode || ""
        })),
        sharedFunctionSignature: firstItem.functionSignature || "",
        sharedReturnType: firstItem.returnType || ""
      }
      form.reset(formattedData)
    }
  }, [formData.inputParameter, form])

  const addParameter = (languageIndex) => {
    const currentParams = form.getValues(`problemInputParameterDto.${languageIndex}.parameters`) || []
    form.setValue(`problemInputParameterDto.${languageIndex}.parameters`, [
      ...currentParams,
      { inputName: "", inputType: "" }
    ])
    // Force re-render
    form.trigger(`problemInputParameterDto.${languageIndex}.parameters`)
  }

  const removeParameter = (languageIndex, paramIndex) => {
    const currentParams = form.getValues(`problemInputParameterDto.${languageIndex}.parameters`)
    const updatedParams = currentParams.filter((_, i) => i !== paramIndex)
    form.setValue(`problemInputParameterDto.${languageIndex}.parameters`, updatedParams)
    // Force re-render
    form.trigger(`problemInputParameterDto.${languageIndex}.parameters`)
  }

  // Handle form submission
  const handleSubmit = (values) => {
    console.log("Input Parameters submitting:", values)
    // Extract input parameters from form values
    const inputParameters = values.problemInputParameterDto.map((param) => ({
      language: param.language,
      functionSignature: values.sharedFunctionSignature,
      returnType: values.sharedReturnType,
      parameters: param.parameters || [],
      templateCode: param.templateCode
    }))

    // Update the parent's formData with the new inputParameter array
    updateFormData(inputParameters, "parameters")
    onNext()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold">Input Parameters</h2>

        {/* Shared Function Signature and Return Type */}
        <Card>
          <CardHeader>
            <CardTitle>Common Details (applies to all languages)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Shared Function Signature */}
            <FormField
              control={form.control}
              name="sharedFunctionSignature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Function Signature</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., twoSum"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Shared Return Type */}
            <FormField
              control={form.control}
              name="sharedReturnType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select return type" />
                      </SelectTrigger>
                      <SelectContent>
                        {returnTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
          <TabsList className="w-full">
            {formData.details.languageSupport.map((language) => (
              <TabsTrigger key={language} value={language} className="flex-1">
                {language}
              </TabsTrigger>
            ))}
          </TabsList>

          {formData.details.languageSupport.map((language, index) => {
            return (
              <TabsContent key={language} value={language} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{language} Implementation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Parameters */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Parameters</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addParameter(index)}
                          className="flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Parameter
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {form.watch(`problemInputParameterDto.${index}.parameters`)?.map((_, paramIndex) => (
                          <Card key={paramIndex}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <Label className="text-xs">Parameter Name</Label>
                                  <Input
                                    {...form.register(
                                      `problemInputParameterDto.${index}.parameters.${paramIndex}.inputName`
                                    )}
                                    placeholder={`e.g., ${language === "Java" ? "nums" : "nums_array"}`}
                                  />
                                  {form.formState.errors.problemInputParameterDto?.[index]?.parameters?.[
                                    paramIndex
                                  ]?.inputName && (
                                    <p className="text-sm text-destructive mt-1">
                                      {
                                        form.formState.errors.problemInputParameterDto[index].parameters[
                                          paramIndex
                                        ].inputName.message
                                      }
                                    </p>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <Label className="text-xs">Parameter Type</Label>
                                  <Controller
                                    name={`problemInputParameterDto.${index}.parameters.${paramIndex}.inputType`}
                                    control={form.control}
                                    render={({ field }) => (
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select Parameter Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {returnTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                              {type}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  />
                                  {form.formState.errors.problemInputParameterDto?.[index]?.parameters?.[
                                    paramIndex
                                  ]?.inputType && (
                                    <p className="text-sm text-destructive mt-1">
                                      {
                                        form.formState.errors.problemInputParameterDto[index].parameters[
                                          paramIndex
                                        ].inputType.message
                                      }
                                    </p>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeParameter(index, paramIndex)}
                                  className="mt-4"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Template Code */}
                    <FormField
                      control={form.control}
                      name={`problemInputParameterDto.${index}.templateCode`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Code</FormLabel>
                          <FormControl>
                            <CodeEditor
                              initialCode={field.value || ""}
                              onChange={field.onChange}
                              className="min-h-[200px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious} className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button type="submit" className="flex items-center">
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
