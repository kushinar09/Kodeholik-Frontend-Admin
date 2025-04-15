"use client"

import { useEffect, useState } from "react"
import ParticipantList from "./participant-list"
import { ParticipantResult } from "./participant-result"
import { useParams } from "react-router-dom"
import LoadingScreen from "@/components/layout/loading"
import { getListParticipantInExam } from "@/lib/api/exam_api"
import { useAuth } from "@/provider/AuthProvider"

export function ExamResult() {
  const [participants, setParticipants] = useState([])

  const { code } = useParams()

  const { apiCall } = useAuth()

  const [selectedParticipantId, setSelectedParticipantId] = useState(
    participants.length > 0 ? participants[0].id : null
  )
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(true)

  const [isLoading, setIsLoading] = useState(false)

  const selectedParticipant = participants.find((p) => p.id === selectedParticipantId) || null

  const toggleParticipantList = () => {
    setIsParticipantListOpen(!isParticipantListOpen)
  }

  const fetchListParticipants = async () => {
    try {
      setIsLoading(true)
      const response = await getListParticipantInExam(apiCall, code)
      setSelectedParticipantId(response[0].id)
      setParticipants(response)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchListParticipants()
  }, [])

  return (
    <>
      {isLoading && <LoadingScreen />}
      {!isLoading && (
        <div className="relative">
          <div className={`grid grid-cols-6 ${isParticipantListOpen ? "gap-6" : ""}`}>
            {/* Participant list with transition */}
            <div
              className={`
                col-span-6 md:col-span-2
                transition-all duration-300 ease-in-out
                ${isParticipantListOpen ? "opacity-100 max-h-[2000px]" : "opacity-0 max-h-0"}
                ${isParticipantListOpen ? "md:translate-x-0" : "-translate-x-full md:relative"}
              `}
            >
              <div
                className={`
                transition-all duration-300 ease-in-out
                ${isParticipantListOpen ? "opacity-100 visible" : "opacity-0 invisible"}
              `}
              >
                <ParticipantList
                  participants={participants}
                  selectedParticipantId={selectedParticipantId}
                  onSelectParticipant={(id) => {
                    setSelectedParticipantId(id)
                    // On mobile, close the list after selecting a participant
                    if (window.innerWidth < 768) {
                      setIsParticipantListOpen(false)
                    }
                  }}
                />
              </div>
            </div>

            {/* Test details - adjust column span based on whether participant list is open */}
            <div
              className={`
                transition-all duration-300 ease-in-out
                ${isParticipantListOpen ? "md:col-span-4" : "md:col-span-6"}
              `}
            >
              {selectedParticipant ? (
                <ParticipantResult
                  participant={selectedParticipant}
                  code={code}
                  toggleParticipantList={toggleParticipantList}
                  isParticipantListOpen={isParticipantListOpen}
                />
              ) : (
                <div className="rounded-lg border p-6 text-center">
                  <p>Select a participant to view their test results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

