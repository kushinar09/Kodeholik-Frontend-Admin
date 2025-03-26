"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, ChevronLeft, ChevronRight, Check, Copy, RotateCw, Cpu, Info, Menu, ArrowLeft } from "lucide-react"
import { getParticipantResultInExam } from "@/lib/api/exam_api"
import { useAuth } from "@/provider/AuthProvider"
import LoadingScreen from "@/components/layout/loading"
import { formatValue, copyToClipboard } from "@/lib/utils/format-utils"
import { cn } from "@/lib/utils"
import hljs from "highlight.js"
import "highlight.js/styles/default.css"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { CodeHighlighter } from "@/components/layout/editor-code/code-highlighter"

export function ParticipantResult({ participant, code, toggleParticipantList, isParticipantListOpen }) {
  const { apiCall } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [currentProblem, setCurrentProblem] = useState({})
  const [result, setResult] = useState({})
  const [totalProblems, setTotalProblems] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [submitted, setSubmitted] = useState(null)

  // useEffect(() => {
  //   document.querySelectorAll("pre code").forEach((block) => {
  //     if (!(block.hasAttribute("data-highlighted") && block.getAttribute("data-highlighted") == "yes"))
  //       hljs.highlightElement(block)
  //   })
  // }, [submitted])

  useEffect(() => {
    setCopied(false)
  }, [])

  const handleCopyClipBoard = async () => {
    const success = await copyToClipboard(submitted.code)
    setCopied(success)
    setTimeout(() => setCopied(false), 2000)
  }

  const goToNextProblem = () => {
    if (currentProblemIndex < totalProblems - 1) {
      setCurrentProblem(result.problemResults[currentProblemIndex + 1])
      setSubmitted(result.problemResults[currentProblemIndex + 1].submissionResponseDto)
      setCurrentProblemIndex(currentProblemIndex + 1)
    }
  }

  const goToPreviousProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblem(result.problemResults[currentProblemIndex - 1])
      setSubmitted(result.problemResults[currentProblemIndex - 1].submissionResponseDto)
      setCurrentProblemIndex(currentProblemIndex - 1)
    }
  }

  const fetchResultDetail = async () => {
    try {
      setIsLoading(true)
      const response = await getParticipantResultInExam(apiCall, code, participant.id)
      setResult(response)
      setTotalProblems(response.noProblems)
      if (response.problemResults != null) {
        setCurrentProblemIndex(0)
        setCurrentProblem(response.problemResults[0])
        setSubmitted(response.problemResults[0].submissionResponseDto)
      }
      else {
        setCurrentProblem(null)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    fetchResultDetail()
  }, [participant])

  return (
    <>
      {isLoading && <LoadingScreen />}
      {!isLoading &&
        <div className="space-y-6">
          <div className="flex flex-col justify-between">
            <div className="flex items-center">
              <div className="flex gap-2 items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2 md:flex md:items-center md:gap-2"
                  onClick={toggleParticipantList}
                >
                  {isParticipantListOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </div>
              <h2 className="text-2xl font-bold">{participant.username} ({participant.fullname})</h2>
              {
                participant.grade < 6 &&
                <div className="text-red-600 ml-4 mt-2 font-bold border-2 border-solid rounded-full p-2 border-red-600">
                  {participant.grade}
                </div>
              }
              {
                participant.grade >= 6 && participant.grade < 8 &&
                <div className="text-yellow-600 ml-4 mt-2 font-bold border-2 border-solid rounded-full p-2 border-yellow-600">
                  {participant.grade}
                </div>
              }
              {
                participant.grade >= 8 &&
                <div className="text-green-600 ml-4 mt-2 font-bold border-2 border-solid rounded-full p-2 border-green-600">
                  {participant.grade}
                </div>
              }
            </div>
            <div style={{ marginTop: "2px" }} className="text-sm text-muted-foreground">
              Problem #{currentProblemIndex + 1} / {totalProblems}


            </div>
          </div>

          <Card style={{ marginTop: "10px" }}>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  Problem {currentProblemIndex + 1}: {currentProblem.title}
                  {currentProblem.percentPassed == "100%"
                    ?
                    <div className="flex items-center">
                      <svg className="ml-4 h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="ml-1 text-green-600">{currentProblem.point} points</span>
                    </div>
                    :
                    <div className="flex items-center">
                      <svg className="ml-4 h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="ml-1 text-red-600">{currentProblem.point} points</span>
                    </div>

                  }
                </div>
              </CardTitle>
            </CardHeader>
            {submitted == null &&
              <CardContent className="space-y-4">
                <div className="flex justify-between flex-wrap gap-4">
                  This user haven&apos;t submitted code for this problem
                </div>
              </CardContent>
            }
            {currentProblem != null && submitted != null &&
              <CardContent className="space-y-4">
                <div className="flex justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-black" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <rect x="5" y="3" width="14" height="18" rx="2" />  <line x1="9" y1="7" x2="15" y2="7" />  <line x1="9" y1="11" x2="15" y2="11" />  <line x1="9" y1="15" x2="13" y2="15" /></svg>
                    <span>
                      {currentProblem.noTestCasePassed} Test Cases Passed ({currentProblem.percentPassed})
                    </span>
                  </div>
                </div>
                {submitted != null && submitted.status && submitted.status.toLowerCase() === "success" && (
                  <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="relative bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-gray-700" />
                              <span className="font-medium text-gray-700">Runtime</span>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button>
                                  <Info className="h-4 w-4 text-gray-400" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-80 p-4 text-sm bg-white text-black" side="bottom">
                                <p>
                                  The time taken to execute the submitted code in milliseconds.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-3xl font-bold">{submitted.executionTime}</span>
                            <span className="text-gray-500 text-sm">ms</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="relative bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <Cpu className="h-4 w-4 text-gray-700" />
                              <span className="font-medium text-gray-700">Memory</span>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button>
                                  <Info className="h-4 w-4 text-gray-400" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-100 p-4 text-sm bg-white text-black" side="bottom">
                                <p>The amount of memory consumed by the execution process in megabytes.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">{submitted.memoryUsage}</span>
                            <span className="text-gray-500 text-sm">mb</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TooltipProvider>
                )}

                {submitted != null && submitted.status !== "Success" && submitted.message && (
                  <div className="rounded-lg border-t border-red-200 bg-red-50 p-4">
                    <pre className="text-sm text-red-600 break-words whitespace-pre-wrap">{submitted.message}</pre>
                  </div>
                )}

                {submitted != null && submitted.inputWrong && (
                  <div>
                    <Label className="text-sm text-black">Input</Label>

                    <div className="space-y-4 rounded-xl border bg-card p-2 mt-2 text-card-foreground shadow">
                      <div className="space-y-2">

                        {submitted.inputWrong.inputs.map((param, index) => (
                          <div key={index} className="rounded bg-input-bg text-input-text p-2">
                            <div className="space-y-2">
                              <Label className="text-sm text-input-text">{param.name} =</Label>
                              <div className="text-md text-input-text font-bold">{formatValue(param.value)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-black">Output =</Label>
                        <div
                          className={`rounded bg-input-bg text-input-text p-2 ${submitted.inputWrong.status === "Failed" ? "text-text-error" : "text-text-success"}`}
                        >
                          {formatValue(submitted.inputWrong.actualOutput)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-black">Expected Output =</Label>
                        <div className="rounded bg-input-bg text-input-text p-2">
                          {formatValue(submitted.inputWrong.expectedOutput)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {submitted != null &&
                  <Card>
                    <CardContent className="p-0">
                      <div className="border-b border-border p-4 py-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Code</span>
                          <span className="text-sm text-muted-foreground">|</span>
                          <span className="text-sm">{submitted.languageName}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={handleCopyClipBoard}>
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon">
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {/* <div className={cn("p-4 overflow-hidden transition-all duration-300", isExpanded ? "h-auto" : "max-h-[230px]")}>
                        <pre className="text-sm">
                          <code>{submitted.code}</code>
                        </pre>
                      </div> */}
                      <CodeHighlighter className={cn("p-4 overflow-hidden transition-all duration-300", isExpanded ? "h-auto" : "max-h-[300px]")}
                        code={submitted.code}
                        language="java"
                        showLineNumbers={false}
                      />
                      {submitted.code && submitted.code.split("\n").length > 10 && (
                        <div className="border-t border-border p-2 text-center">
                          <Button
                            variant="ghost"
                            className="text-sm text-muted-foreground"
                            onClick={() => setIsExpanded(!isExpanded)}
                          >
                            {isExpanded ? "View less" : "View more"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                }
              </CardContent>
            }
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={goToPreviousProblem} disabled={currentProblemIndex === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous problem
              </Button>
              <Button variant="outline" onClick={goToNextProblem} disabled={currentProblemIndex === totalProblems - 1}>
                Next problem
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

        </div>}
    </>
  )
}

