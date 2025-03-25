"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ProblemDetails } from "./components/problem-details"
import { InputParameters } from "./components/input-parameters"
import { Editorial } from "./components/editorial"
import { TestCases } from "./components/test-cases"
import { ENDPOINTS } from "@/lib/constants"
import { useAuth } from "@/provider/AuthProvider"
import { useParams } from "react-router-dom"
import LoadingScreen from "@/components/layout/loading"
import { toast } from "sonner"

export default function ProblemEdit({ onNavigate, setCurrentTitleProblem }) {
  const { id } = useParams()
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
      solutionCodes: []
    },
    testCases: {
      excelFile: null
    }
  })

  // Modify your fetch functions to handle loading state
  const fetchDetails = async () => {
    try {
      const response = await apiCall(ENDPOINTS.GET_TEACHER_PROBLEM_DETAILS.replace(":id", id))
      const text = await response.text()
      if (text) {
        const data = JSON.parse(text)
        setCurrentTitleProblem(data.title)

        // Update the formData state with the fetched details
        setFormData(prevState => ({
          ...prevState,
          details: {
            ...prevState.details,
            title: data.title || "",
            difficulty: data.difficulty || "EASY",
            description: data.description || "",
            status: data.status || "PRIVATE",
            topics: data.topics || [],
            skills: data.skills || [],
            isActive: data.active !== null ? data.active : true
          }
        }))
      }
    } catch (error) {
      console.error("Error fetching problem details:", error)
    }
  }

  const fetchEditorial = async () => {
    try {
      const response = await apiCall(ENDPOINTS.GET_TEACHER_PROBLEM_EDITORIAL.replace(":id", id))
      const text = await response.text()

      if (text) {
        const data = JSON.parse(text).editorialDto

        // Update the formData state with the fetched details
        setFormData(prevState => ({
          ...prevState,
          editorial: {
            ...prevState.editorial,
            editorialTitle: data.editorialTitle || "",
            editorialTextSolution: data.editorialTextSolution || "",
            editorialSkills: data.editorialSkills || [],
            solutionCodes: data.solutionCodes || []
          }
        }))
      }
    } catch (error) {
      console.error("Error fetching editorial:", error)
    }
  }

  const fetchTemplate = async () => {
    try {
      const response = await apiCall(ENDPOINTS.GET_TEACHER_PROBLEM_TEMPLATE.replace(":id", id))
      const text = await response.text()

      if (text) {
        const data = JSON.parse(text)

        const languages = new Set()

        Object.values(data).forEach((item) => {
          if (item.language) {
            languages.add(item.language)
          }
          if (item.templateCodes?.language) {
            languages.add(item.templateCodes.language)
          }
        })

        setFormData(prevState => ({
          ...prevState,
          details: {
            ...prevState.details,
            languageSupport: Array.from(languages) || []
          }
        }))

        // Update the formData state with the fetched details
        setFormData(prevState => ({
          ...prevState,
          inputParameter: data.map((i) => ({
            language: i.language,
            functionSignature: i.functionSignature,
            returnType: i.returnType === "OTHER" ? "UNKNOWN" : i.returnType,
            otherReturnType: i.otherReturnType,
            noDimension: i.returnType.startsWith("ARR_") ? i.noDimension : null,
            parameters: i.parameters || [],
            templateCode: {
              code: i.templateCodes.templateCode,
              language: i.language
            },
            functionCode: i.templateCodes.functionCode
          }))
        }))
      }
    } catch (error) {
      console.error("Error fetching template:", error)
    }
  }

  const fetchFileTestcase = async () => {
    try {
      const response = await apiCall(ENDPOINTS.GET_TEACHER_PROBLEM_TESTCASE.replace(":id", id))
      if (!response.ok) throw new Error("Failed to download file")
      const blob = await response.blob()
      setFormData(prevState => ({
        ...prevState,
        testCases: {
          excelFile: blob
        }
      }))
    } catch (error) {
      console.error("Error fetching testcase:", error)
    }
  }

  // Create a function to fetch all data
  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      // Use Promise.all to run fetches concurrently
      await Promise.all([
        fetchDetails(),
        fetchEditorial(),
        fetchTemplate(),
        fetchFileTestcase()
      ])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Update your useEffect to call fetchAllData
  useEffect(() => {
    fetchAllData()
  }, [])

  const [completedSteps, setCompletedSteps] = useState({
    details: false,
    parameters: false,
    editorial: false,
    testcases: false
  })

  const updateFormData = (stepData, step) => {
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

      // console.log(`Updated ${step}:`, newData)
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
          solutionCodes: formData.editorial.solutionCodes.map((solution) => ({
            solutionLanguage: solution.solutionLanguage,
            solutionCode: solution.solutionCode
          }))
        }
      }

      const problemInputParameterDto = formData.inputParameter

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
        method: "PUT",
        body: formdataT,
        credentials: "include"
      }

      const response = await apiCall(ENDPOINTS.POST_UPDATE_PROBLEM.replace(":id", id), requestOptions)

      if (response.ok) {
        localStorage.setItem("toastMessage", "Problem updated successfully!")
        onNavigate("/problem")
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.message || "An error occurred"
        throw new Error(errorMessage)
      }
    } catch (error) {
      toast.error("Error", {
        description: error.message || "Error updating problem. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading ? (
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
                onClick={() => (completedSteps.details ? setActiveStep("parameters") : null)}
                disabled={!completedSteps.details}
              />
              <StepDivider />
              <StepIndicator
                step="editorial"
                label="Editorial"
                active={activeStep === "editorial"}
                completed={completedSteps.editorial}
                onClick={() => (completedSteps.parameters ? setActiveStep("editorial") : null)}
                disabled={!completedSteps.parameters}
              />
              <StepDivider />
              <StepIndicator
                step="testcases"
                label="Test Cases"
                active={activeStep === "testcases"}
                completed={completedSteps.testcases}
                onClick={() => (completedSteps.editorial ? setActiveStep("testcases") : null)}
                disabled={!completedSteps.editorial}
              />
            </div>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <Tabs value={activeStep} onValueChange={(val) => {
                setActiveStep(val)
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
                    urlGetTestCase={ENDPOINTS.GET_TEACHER_PROBLEM_TESTCASE.replace(":id", id)}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

function StepIndicator({ step, label, active, completed, onClick, disabled = false }) {
  return (
    <div
      className={`flex flex-col items-center cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={disabled ? null : onClick}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors bg-muted text-muted-foreground
          ${active
            ? "bg-primary text-primary-foreground"
            : ""
          }`}
      >
        {step.charAt(0).toUpperCase()}
      </div>
      <span className={`text-sm ${active ? "font-medium" : ""}`}>{label}</span>
    </div>
  )
}

function StepDivider() {
  return <div className="flex-1 h-0.5 bg-muted mx-2" />
}

