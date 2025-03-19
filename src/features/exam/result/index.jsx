"use client"

import { useEffect, useState } from "react"
import ParticipantList from "./participant-list";
import { ParticipantResult } from "./participant-result";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useParams } from "react-router-dom";
import LoadingScreen from "@/components/layout/loading";
import { getListParticipantInExam } from "@/lib/api/exam_api";
import { useAuth } from "@/provider/AuthProvider";

export function ExamResult() {
    let [participants, setParticipants] = useState(
        [{
            id: 1,
            avatar: '',
            fullname: '',
            usename: ''
        }]
    );

    const { code } = useParams();

    const { apiCall } = useAuth();

    const [selectedParticipantId, setSelectedParticipantId] = useState(
        participants.length > 0 ? participants[0].id : null,
    )
    const [isParticipantListOpen, setIsParticipantListOpen] = useState(true)

    const [isLoading, setIsLoading] = useState(false)

    const selectedParticipant = participants.find((p) => p.id === selectedParticipantId) || null

    const toggleParticipantList = () => {
        setIsParticipantListOpen(!isParticipantListOpen)
    }

    const fetchListParticipants = async () => {
        try {
            setIsLoading(true);
            const response = await getListParticipantInExam(apiCall, code);
            setSelectedParticipantId(response[0].id);
            setParticipants(response);
            console.log(response);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchListParticipants();
    }, []);

    return (
        <>
            {isLoading && <LoadingScreen />}
            {!isLoading && <div className="relative">
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute -top-12 left-0 md:hidden"
                    onClick={toggleParticipantList}
                    aria-label={isParticipantListOpen ? "Hide participant list" : "Show participant list"}
                >
                    {isParticipantListOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className=" md:flex md:items-center md:gap-2 mb-4"
                    onClick={toggleParticipantList}
                >
                    {isParticipantListOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    {isParticipantListOpen ? "Hide participant list" : "Show participant list"}
                </Button>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
                    {isParticipantListOpen && (
                        <div className="md:col-span-1">
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
                    )}

                    {/* Test details - adjust column span based on whether participant list is open */}
                    <div className={`${isParticipantListOpen ? "md:col-span-5" : "md:col-span-6"}`}>
                        {selectedParticipant ? (
                            <ParticipantResult
                                participant={selectedParticipant}
                                code = {code}
                                onToggleParticipantList={toggleParticipantList}
                                isParticipantListOpen={isParticipantListOpen}
                            />
                        ) : (
                            <div className="rounded-lg border p-6 text-center">
                                <p>Select a participant to view their test results</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>}
        </>
    )
}

