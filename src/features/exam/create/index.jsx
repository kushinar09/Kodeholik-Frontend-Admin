"use client"

import { useEffect, useState } from "react"
import { createExam } from "@/lib/api/exam_api"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/provider/AuthProvider"
import { CreateExamDetails } from "./components/detail"
import { CreateExamProblems } from "./components/problems"
const mockFormData = {
  details: {
    title: "",
    description: "",
    startTime: new Date(),
    duration: 90

  },
  problems: {
    languageSupports: [],
    problems: []
  }
}

const requestData = {
  title: "",
  description: "",
  startTime: Date.now(),
  endTime: Date.now() + 3600000,
  languageSupports: [],
  problemRequests: []
}

export function CreateExam({ onNavigate }) {
  const [activeStep, setActiveStep] = useState("details");
  const [formData, setFormData] = useState({
    details: {
      title: "",
      description: "",
      startTime: new Date(),
      duration: 90
  
    },
    problems: {
      languageSupports: [],
      problems: []
    }
  });
  const { apiCall } = useAuth();

  const [completedSteps, setCompletedSteps] = useState({
    details: false,
    problems: false
  })
  useEffect(() => {
    setFormData(
      {
        details: {
          title: "",
          description: "",
          startTime: new Date(),
          duration: 90
      
        },
        problems: {
          languageSupports: [],
          problems: []
        }
      }
    )
  }, [])
  const updateFormData = (stepData, step) => {
    if (step === "details") {
      mockFormData.details = stepData;
    }
    else if (step === "problems") {
      mockFormData.problems = stepData;
    }
    setFormData(mockFormData);
    setCompletedSteps((prev) => ({ ...prev, [step]: true }))
  }

  const handleNext = async () => {
    if (activeStep === "details") setActiveStep("problems");
    if (activeStep === "problems") {
      await callCreateExam();
      toast.success("Add exam successful!", { duration: 2000 });
      onNavigate("/exam");

    }
  }

  const callCreateExam = async () => {
    try {
      requestData.title = formData.details.title;
      requestData.description = formData.details.description;
      requestData.startTime = formData.details.startTime.toISOString();
      requestData.endTime = new Date(formData.details.startTime.getTime() + formData.details.duration * 60000).toISOString();
      if (formData?.problems?.languageSupports) {
        requestData.languageSupports = [...formData.problems.languageSupports];
      }

      if (formData?.problems?.problems && Array.isArray(formData.problems.problems)) {
        // Map to ensure correct structure and types
        requestData.problemRequests = formData.problems.problems.map(problem => ({
          problemLink: problem.problemLink || '',
          problemPoint: typeof problem.points === 'number' ? problem.points :
            (parseInt(problem.points, 10) || 0) // Convert to number if it's a string
        }));
      }
      setFormData({
        details: {
          title: "",
          description: "",
          startTime: new Date(),
          duration: 90
      
        },
        problems: {
          languageSupports: [],
          problems: []
        }
      })
      await createExam(apiCall, requestData);
      
    } catch (error) {
      console.error("Error fetching exams:", error)
    } finally {
    }
  }

  const handlePrevious = () => {
    if (activeStep === "problems") setActiveStep("details")
  }

  return (
    <div className="container mx-auto px-4 mt-4">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <StepIndicator
            step="details"
            label="Exam Details"
            active={activeStep === "details"}
            completed={completedSteps.details}
            onClick={() => setActiveStep("details")}
          />
          <StepDivider />
          <StepIndicator
            step="problems"
            label="Exam Problems"
            active={activeStep === "problems"}
            completed={completedSteps.problems}
            onClick={() => (completedSteps.details ? setActiveStep("problems") : null)}
            disabled={!completedSteps.details}
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
              <CreateExamDetails
                onNext={handleNext}
                formData={formData}
                updateFormData={updateFormData}
              />
            </TabsContent>
            <TabsContent value="problems">
              <CreateExamProblems
                onNext={handleNext}
                onPrevious={handlePrevious}
                formData={formData}
                updateFormData={updateFormData}
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
