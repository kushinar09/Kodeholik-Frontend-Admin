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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import hljs from "highlight.js"

// Update schema to handle multiple languages
const formSchema = z.object({
  problemInputParameterDto: z.array(
    z.object({
      language: z.string(),
      parameters: z.array(
        z.object({
          inputName: z.string().trim().min(1, "Parameter name is required"),
          inputType: z.string().trim().min(1, "Parameter type is required"),
          otherInputType: z.string().nullable().optional(),
          noDimension: z.number().nullable().optional()
        })
      ),
      templateCode: z.string(),
      functionCode: z.string()
    })
  ),
  sharedFunctionSignature: z.string().trim()
    .min(1, "Function signature is required")
    .regex(/^[^\s]+$/, "Function signature must not contain spaces"),
  sharedReturnType: z.string().trim().min(1, "Return type is required"),
  otherReturnType: z.string().nullable().optional(),
  noDimension: z.number().nullable().optional()
})

export function InputParameters({ formData, updateFormData, onNext, otherType = false, onPrevious }) {
  // Use formData.details.languageSupport if it exists and has items
  const languages =
    formData.details?.languageSupport && formData.details.languageSupport.length > 0
      ? formData.details.languageSupport
      : formData.inputParameter?.length > 0
        ? formData.inputParameter.map((item) => item.language)
        : []

  const initialLanguage = languages.length > 0 ? languages[0] : ""

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
    "OTHER"
  ])

  useEffect(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      if (!(block.hasAttribute("data-highlighted") && block.getAttribute("data-highlighted") == "yes"))
        hljs.highlightElement(block)
    })
  }, [formData, activeLanguage])

  // Initialize form with existing data or create new entries for each language
  const getDefaultValues = () => {
    // If we have existing inputParameter data, use it
    if (formData.inputParameter && formData.inputParameter.length > 0) {
      // Get the first item's shared values
      const firstItem = formData.inputParameter[0]

      // Map existing data to match form structure
      return {
        problemInputParameterDto: languages.map((lang) => {
          const existingParam = formData.inputParameter.find((param) => param.language === lang)
          return {
            language: lang,
            parameters: existingParam?.parameters || [],
            templateCode: existingParam?.templateCode?.code || "",
            functionCode: existingParam?.functionCode || ""
          }
        }),
        // Add shared fields with values from the first item
        sharedFunctionSignature: firstItem.functionSignature || "",
        sharedReturnType: firstItem.returnType || "",
        otherReturnType: firstItem.otherReturnType || "",
        noDimension: firstItem.noDimension || 1
      }
    }

    // Otherwise, create new entries for each supported language
    return {
      problemInputParameterDto: languages.map((lang) => ({
        language: lang,
        parameters: [],
        templateCode: "",
        functionCode: ""
      })),
      sharedFunctionSignature: "",
      sharedReturnType: "",
      otherReturnType: "",
      noDimension: 1
    }
  }

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues()
  })

  // Update form when formData changes
  useEffect(() => {
    if (formData.inputParameter && formData.inputParameter.length > 0) {
      form.reset(getDefaultValues())
    }
  }, [formData.inputParameter, form])

  // Watch for form changes and update parent formData
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (Object.keys(form.formState.dirtyFields).length > 0) {
        // Only update if form has been modified
        const formValues = form.getValues()

        // Extract input parameters from form values
        const inputParameters = formValues.problemInputParameterDto.map((param) => ({
          language: param.language,
          functionSignature: formValues.sharedFunctionSignature,
          returnType: formValues.sharedReturnType === "OTHER" ? "UNKNOWN" : formValues.sharedReturnType,
          otherReturnType: formValues.otherReturnType,
          noDimension: formValues.sharedReturnType.startsWith("ARR_") ? formValues.noDimension : null,
          parameters: param.parameters || [],
          templateCode: {
            code: param.templateCode,
            language: param.language
          },
          functionCode: param.functionCode
        }))

        // Update the parent's formData with the new inputParameter array
        updateFormData(inputParameters, "parameters")
      }
    })

    return () => subscription.unsubscribe()
  }, [form, updateFormData])

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
    // Extract input parameters from form values
    const inputParameters = values.problemInputParameterDto.map((param) => ({
      language: param.language,
      functionSignature: values.sharedFunctionSignature,
      returnType: values.sharedReturnType === "OTHER" ? "UNKNOWN" : values.sharedReturnType,
      otherReturnType: values.otherReturnType,
      noDimension: values.sharedReturnType.startsWith("ARR_") ? values.noDimension : null,
      parameters: param.parameters || [],
      templateCode: {
        code: param.templateCode,
        language: param.language
      },
      functionCode: param.functionCode || ""
    }))

    // Update the parent's formData with the new inputParameter array
    updateFormData(inputParameters, "parameters")

    // Move to the next step
    onNext()
  }

  const onError = (errors) => {
    console.error("Form validation errors:", errors)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, onError)} className="space-y-6">
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
                    <Input placeholder="e.g., twoSum" {...field} />
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

            {/* Other Return Type - only show if "OTHER" is selected */}
            {form.watch("sharedReturnType") === "OTHER" && (
              <FormField
                control={form.control}
                name="otherReturnType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Return Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter custom return type" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Number of Dimensions - only show if return type starts with ARR_ */}
            {form.watch("sharedReturnType")?.startsWith("ARR_") && (
              <FormField
                control={form.control}
                name="noDimension"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Dimensions</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Enter number of dimensions"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Tabs value={activeLanguage} onValueChange={setActiveLanguage} className="bg-muted rounded-md">
          <TabsList>
            {languages.map((language) => (
              <TabsTrigger key={language} value={language} className="flex-1 min-w-24">
                {language}
              </TabsTrigger>
            ))}
          </TabsList>

          {languages.map((language, index) => {
            return (
              <TabsContent key={language} value={language} className="space-y-6 mt-0">
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
                                <div className="flex-1 self-start">
                                  <Label className="text-xs">Parameter Name</Label>
                                  <Input
                                    {...form.register(
                                      `problemInputParameterDto.${index}.parameters.${paramIndex}.inputName`
                                    )}
                                    placeholder={`e.g., ${language === "Java" ? "nums" : "nums_array"}`}
                                  />
                                  {form.formState.errors.problemInputParameterDto?.[index]?.parameters?.[paramIndex]
                                    ?.inputName && (
                                      <p className="text-sm text-destructive mt-1">
                                        {
                                          form.formState.errors.problemInputParameterDto[index].parameters[paramIndex]
                                            .inputName.message
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
                                  {form.formState.errors.problemInputParameterDto?.[index]?.parameters?.[paramIndex]
                                    ?.inputType && (
                                      <p className="text-sm text-destructive mt-1">
                                        {
                                          form.formState.errors.problemInputParameterDto[index].parameters[paramIndex]
                                            .inputType.message
                                        }
                                      </p>
                                    )}
                                  {/* Other Input Type - only show if "OTHER" is selected */}
                                  {form.watch(
                                    `problemInputParameterDto.${index}.parameters.${paramIndex}.inputType`
                                  ) === "OTHER" && (
                                      <FormField
                                        control={form.control}
                                        name={`problemInputParameterDto.${index}.parameters.${paramIndex}.otherInputType`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Custom Input Type</FormLabel>
                                            <FormControl>
                                              <Input placeholder="Enter custom input type" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    )}
                                  {form
                                    .watch(`problemInputParameterDto.${index}.parameters.${paramIndex}.inputType`)
                                    ?.startsWith("ARR_") && (
                                      <FormField
                                        control={form.control}
                                        name={`problemInputParameterDto.${index}.parameters.${paramIndex}.noDimension`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Number of Dimensions</FormLabel>
                                            <FormControl>
                                              <Input
                                                type="number"
                                                min="1"
                                                placeholder="Enter number of dimensions"
                                                {...field}
                                                onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 1)}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
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
                          <FormLabel className="flex gap-2 items-center mb-4">
                            Supplementary Code
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94" />
                                </svg>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-64">This field contains additional comments or supplementary classes to address specific issues. This section will be automatically added to the function code when a problem is successfully created.</p>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
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
                    {/* <FormField
                      name={`problemInputParameterDto.${index}.templateCode`}
                      render={({ field }) => (

                      )}
                    /> */}
                    <FormItem>
                      <FormLabel className="flex gap-2 items-center mb-4">
                        Function Code
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                              <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94" />
                            </svg>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-64">The field where users write code to solve the problem.</p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <pre>
                          <code>{formData?.inputParameter && Array.isArray(formData.inputParameter)
                            ? formData.inputParameter.find((param) => param.language === language)?.functionCode
                            : ""}
                          </code>
                        </pre>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
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

