"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"

// Update schema to handle multiple languages
const formSchema = z.object({
  problemInputParameterDto: z.array(
    z.object({
      language: z.string(),
      functionSignature: z.string().min(1, "Function signature is required"),
      returnType: z.string().min(1, "Return type is required"),
      parameters: z.array(
        z.object({
          inputName: z.string().min(1, "Parameter name is required"),
          inputType: z.string().min(1, "Parameter type is required")
        })
      ),
      templateCode: z.string().min(1, "Template code is required")
    })
  )
})

export function InputParameters({ formData, updateFormData, onNext, onPrevious }) {
  const [activeLanguage, setActiveLanguage] = useState(formData.details.languageSupport[0] || "")
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
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      problemInputParameterDto: formData.details.languageSupport.map((lang) => ({
        language: lang,
        functionSignature: "",
        returnType: "",
        parameters: [],
        templateCode: ""
      }))
    }
  })

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

  // Fix the form structure and handleSubmit function to match parent's expected format
  // Replace the handleSubmit function with:
  const handleSubmit = (values) => {
    // Transform the data to match the parent component's expected structure
    const transformedData = values.problemInputParameterDto.map((param) => ({
      language: param.language,
      functionSignature: param.functionSignature,
      returnType: param.returnType,
      parameters: param.parameters || [],
      templateCodes: param.templateCode
    }))

    console.log("Input Parameters submitting:", transformedData)
    updateFormData(transformedData, "parameters")
    onNext()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold">Input Parameters</h2>

        <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
          <TabsList className="w-full">
            {formData.details.languageSupport.map((language) => (
              <TabsTrigger key={language} value={language} className="flex-1">
                {language}
              </TabsTrigger>
            ))}
          </TabsList>

          {formData.details.languageSupport.map((language, languageIndex) => (
            <TabsContent key={language} value={language} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{language} Implementation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Function Signature */}
                  <FormField
                    control={form.control}
                    name={`problemInputParameterDto.${languageIndex}.functionSignature`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Function Signature</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`e.g., ${language === "Java" ? "public int[] twoSum" : "int* twoSum"}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Return Type */}
                  <FormField
                    control={form.control}
                    name={`problemInputParameterDto.${languageIndex}.returnType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Return Type</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        {field.value === "other" && (
                          <Input
                            className="mt-2"
                            onChange={(e) => field.onChange(e.target.value)}
                            placeholder="Enter custom return type"
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Parameters */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Parameters</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addParameter(languageIndex)}
                        className="flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Parameter
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {form.watch(`problemInputParameterDto.${languageIndex}.parameters`)?.map((_, paramIndex) => (
                        <Card key={paramIndex}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <Label className="text-xs">Parameter Name</Label>
                                <Input
                                  {...form.register(
                                    `problemInputParameterDto.${languageIndex}.parameters.${paramIndex}.inputName`
                                  )}
                                  placeholder={`e.g., ${language === "Java" ? "nums" : "nums_array"}`}
                                />
                                {form.formState.errors.problemInputParameterDto?.[languageIndex]?.parameters?.[
                                  paramIndex
                                ]?.inputName && (
                                  <p className="text-sm text-destructive mt-1">
                                    {
                                      form.formState.errors.problemInputParameterDto[languageIndex].parameters[
                                        paramIndex
                                      ].inputName.message
                                    }
                                  </p>
                                )}
                              </div>
                              <div className="flex-1">
                                <Label className="text-xs">Parameter Type</Label>
                                <Controller
                                  name={`problemInputParameterDto.${languageIndex}.parameters.${paramIndex}.inputType`}
                                  control={form.control}
                                  render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select Paramete Type" />
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
                                {form.formState.errors.problemInputParameterDto?.[languageIndex]?.parameters?.[
                                  paramIndex
                                ]?.inputType && (
                                  <p className="text-sm text-destructive mt-1">
                                    {
                                      form.formState.errors.problemInputParameterDto[languageIndex].parameters[
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
                                onClick={() => removeParameter(languageIndex, paramIndex)}
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
                    name={`problemInputParameterDto.${languageIndex}.templateCode`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Code</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={
                              language === "Java"
                                ? "public int[] twoSum(int[] nums, int target) {\n    // Write your code here\n}"
                                : "int* twoSum(int* nums, int numsSize, int target) {\n    // Write your code here\n}"
                            }
                            className="font-mono min-h-[200px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
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

