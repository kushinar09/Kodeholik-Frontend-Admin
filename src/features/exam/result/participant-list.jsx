"use client"

import { cn } from "@/lib/utils"

export default function ParticipantList({ participants, selectedParticipantId, onSelectParticipant }) {
    return (
        <div className="rounded-lg border">
            <div className="border-b p-4">
                <h2 className="text-lg font-semibold">Participants</h2>
            </div>
            {/* Wrapper with fixed height and scrollbar */}
            <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                <ul className="divide-y">
                    {participants.map((participant) => (
                        <li key={participant.id}>
                            <button
                                className={cn(
                                    "w-full px-4 py-3 text-left transition-colors hover:bg-muted/50",
                                    selectedParticipantId === participant.id && "bg-gray-200"
                                )}
                                onClick={() => onSelectParticipant(participant.id)}
                            >
                                <div className="flex justify-between">
                                    <div className="flex justify-center items-center">
                                        <img
                                            src={participant.avatar}
                                            alt="avatar"
                                            style={{ width: 30, height: 30, borderRadius: "50%", marginRight: 8 }}
                                        />
                                        <span>{participant.username}</span>
                                    </div>
                                    <div>
                                        {participant.grade < 6 && <div className="text-red-600 ml-4 mt-2 font-bold border-2 border-solid rounded-full p-2 border-red-600">
                                            {participant.grade}
                                        </div>}
                                        {participant.grade >= 6 && participant.grade < 8 && <div className="text-yellow-600 ml-4 mt-2 font-bold border-2 border-solid rounded-full p-2 border-yellow-600">
                                            {participant.grade}
                                        </div>}
                                        {participant.grade >= 8 && <div className="text-green-600 ml-4 mt-2 font-bold border-2 border-solid rounded-full p-2 border-green-600">
                                            {participant.grade}
                                        </div>}
                                    </div>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

