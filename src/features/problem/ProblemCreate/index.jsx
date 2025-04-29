"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Check } from "lucide-react"
import { ProblemDetails } from "./components/problem-details"
import { InputParameters } from "./components/input-parameters"
import { Editorial } from "./components/editorial"
import { TestCases } from "./components/test-cases"
import { ENDPOINTS } from "@/lib/constants"
import { useAuth } from "@/provider/AuthProvider"
import { toast } from "sonner"
import LoadingScreen from "@/components/layout/loading"

export default function ProblemCreator({ onNavigate }) {
  const { apiCall } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const [activeStep, setActiveStep] = useState("details")
  const [formData, setFormData] = useState({
    // Problem Details
    details: {
      title: "",
      difficulty: "EASY",
      description: "",
      status: "PRIVATE",
      topics: [],
      skills: [],
      isActive: true,
      languageSupport: []
    },
    inputParameter: [],
    editorial: {
      editorialTitle: "",
      editorialTextSolution: "",
      editorialSkills: [],
      solutionCode: []
    },
    testCases: {
      excelFile: null
    }
  })

  const [completedSteps, setCompletedSteps] = useState({
    details: false,
    parameters: false,
    editorial: false,
    testcases: false
  })

  const updateFormData = (stepData, step) => {
    console.log(step, stepData)
    setFormData((prev) => {
      const newData = { ...prev }

      // Update the appropriate section based on the step
      if (step === "details") {
        newData.details = { ...prev.details, ...stepData }
      } else if (step === "parameters") {
        newData.inputParameter = stepData
      } else if (step === "editorial") {
        newData.editorial = { ...prev.editorial, ...stepData }
      } else if (step === "testcases") {
        newData.testCases = { ...prev.testCases, ...stepData }
      }
      return newData
    })
    setCompletedSteps((prev) => ({ ...prev, [step]: true }))
  }

  const handleNext = () => {
    if (activeStep === "details") setActiveStep("parameters")
    else if (activeStep === "parameters") setActiveStep("editorial")
    else if (activeStep === "editorial") setActiveStep("testcases")
  }

  const handlePrevious = () => {
    if (activeStep === "parameters") setActiveStep("details")
    else if (activeStep === "editorial") setActiveStep("parameters")
    else if (activeStep === "testcases") setActiveStep("editorial")
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    console.log(formData)
    try {
      const problemBasicAddDto = {
        title: formData.details.title,
        difficulty: formData.details.difficulty,
        description: formData.details.description,
        status: formData.details.status,
        topics: formData.details.topics,
        skills: formData.details.skills,
        isActive: formData.details.isActive,
        languageSupport: formData.details.languageSupport
      }

      const problemEditorialDto = {
        editorialDtos: {
          editorialTitle: formData.editorial.editorialTitle,
          editorialTextSolution: formData.editorial.editorialTextSolution,
          editorialSkills: formData.editorial.editorialSkills,
          solutionCodes: formData.editorial.solutionCode.map((solution) => ({
            solutionLanguage: solution.solutionLanguage,
            solutionCode: solution.solutionCode
          }))
        }
      }

      const problemInputParameterDto = formData.inputParameter.map((param) => ({
        templateCode: {
          code: param.templateCode,
          language: param.language
        },
        functionSignature: param.functionSignature,
        returnType: param.returnType === "OTHER" ? "UNKNOWN" : param.returnType,
        noDimension: param.noDimension || undefined,
        otherReturnType: param.otherReturnType || undefined,
        language: param.language,
        parameters: param.parameters.map((p) => ({
          inputName: p.inputName,
          inputType: p.inputType === "OTHER" ? "UNKNOWN" : p.inputType,
          noDimension: p.noDimension || undefined,
          otherInputType: p.otherInputType || undefined
        }))
      }))

      const formdataT = new FormData()

      formdataT.append(
        "problemBasicAddDto",
        new Blob([JSON.stringify(problemBasicAddDto)], {
          type: "application/json"
        })
      )
      formdataT.append(
        "problemEditorialDto",
        new Blob([JSON.stringify(problemEditorialDto)], {
          type: "application/json"
        })
      )
      formdataT.append(
        "problemInputParameterDto",
        new Blob([JSON.stringify(problemInputParameterDto)], {
          type: "application/json"
        })
      )

      if (!formData.testCases.excelFile) {
        throw new Error("Please select a file")
      }

      formdataT.append("testCaseFile", formData.testCases.excelFile)

      const requestOptions = {
        method: "POST",
        body: formdataT,
        credentials: "include"
      }

      const response = await apiCall(ENDPOINTS.POST_CREATE_PROBLEM, requestOptions)

      if (response.ok) {
        localStorage.setItem("toastMessage", "Create problem completely !!!")
        onNavigate("/problem")
      } else {
        const errorData = await response.json()
        let errorMessage = "Failed to create problem: " + response.status

        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message[0]?.error || errorMessage
        } else if (typeof errorData.message === "object") {
          errorMessage = errorData.message.error || errorMessage
        } else if (typeof errorData.message === "string") {
          errorMessage = typeof errorData.details === "string" ? errorData.details : errorData.message
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      toast.error("Error", {
        description: error.message || "Error in creat problem. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <div className="container mx-auto px-4 mt-4">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <StepIndicator
            step="details"
            label="Problem Details"
            active={activeStep === "details"}
            completed={completedSteps.details}
            onClick={() => setActiveStep("details")}
          />
          <StepDivider />
          <StepIndicator
            step="parameters"
            label="Input Parameters"
            active={activeStep === "parameters"}
            completed={completedSteps.parameters}
            onClick={() =>
              completedSteps.details ? setActiveStep("parameters") : null
            }
            disabled={!completedSteps.details}
          />
          <StepDivider />
          <StepIndicator
            step="editorial"
            label="Editorial"
            active={activeStep === "editorial"}
            completed={completedSteps.editorial}
            onClick={() =>
              completedSteps.parameters ? setActiveStep("editorial") : null
            }
            disabled={!completedSteps.parameters}
          />
          <StepDivider />
          <StepIndicator
            step="testcases"
            label="Test Cases"
            active={activeStep === "testcases"}
            completed={completedSteps.testcases}
            onClick={() =>
              completedSteps.editorial ? setActiveStep("testcases") : null
            }
            disabled={!completedSteps.editorial}
          />
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <Tabs
            value={activeStep}
            onValueChange={(val) => {
              setActiveStep(val);
            }}
          >
            <TabsContent value="details">
              <ProblemDetails
                formData={formData}
                updateFormData={(data) => updateFormData(data, "details")}
                onNext={handleNext}
              />
            </TabsContent>
            <TabsContent value="parameters">
              <InputParameters
                formData={formData}
                updateFormData={(data) => updateFormData(data, "parameters")}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            </TabsContent>
            <TabsContent value="editorial">
              <Editorial
                formData={formData}
                updateFormData={(data) => updateFormData(data, "editorial")}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            </TabsContent>
            <TabsContent value="testcases">
              <TestCases
                formData={formData}
                updateFormData={(data) => updateFormData(data, "testcases")}
                onPrevious={handlePrevious}
                onSubmit={handleSubmit}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function StepIndicator({ step, label, active, completed, onClick, disabled = false }) {
  return (
    <div
      className={`flex flex-col items-center cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={disabled ? null : onClick}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors
          ${active
            ? "bg-primary text-primary-foreground"
            : completed
              ? "bg-green-500 text-white"
              : "bg-muted text-muted-foreground"
          }`}
      >
        {completed ? <Check className="h-5 w-5" /> : step.charAt(0).toUpperCase()}
      </div>
      <span className={`text-sm ${active ? "font-medium" : ""}`}>{label}</span>
    </div>
  )
}

function StepDivider() {
  return <div className="flex-1 h-0.5 bg-muted mx-2" />
}

