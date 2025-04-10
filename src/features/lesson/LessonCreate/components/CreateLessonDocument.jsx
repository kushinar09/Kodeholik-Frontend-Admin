"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

function CreateLessonDocument({ file, setFile }) {
  const [filePreview, setFilePreview] = useState(null)
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
  ]

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview)
    }
  }, [filePreview])

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0]
    if (uploadedFile) {
      if (!allowedTypes.includes(uploadedFile.type)) {
        alert("Only Word (.doc, .docx), PDF (.pdf), and Text (.txt) files are allowed.")
        return
      }
      if (uploadedFile.size > 100 * 1024 * 1024) {
        alert("File must be less than 100 MB.")
        return
      }
      if (filePreview) URL.revokeObjectURL(filePreview)
      setFile(uploadedFile)
      setFilePreview(URL.createObjectURL(uploadedFile))
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const uploadedFile = e.dataTransfer.files[0]
    if (uploadedFile) {
      if (!allowedTypes.includes(uploadedFile.type)) {
        alert("Only Word (.doc, .docx), PDF (.pdf), and Text (.txt) files are allowed.")
        return
      }
      if (uploadedFile.size > 100 * 1024 * 1024) {
        alert("File must be less than 100 MB.")
        return
      }
      if (filePreview) URL.revokeObjectURL(filePreview)
      setFile(uploadedFile)
      setFilePreview(URL.createObjectURL(uploadedFile))
    }
  }

  return (
    <div className="w-full">
      <input type="file" id="fileUpload" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="hidden" />
      <div
        className="w-full h-10 rounded-md border border-gray-700 overflow-hidden flex items-center px-3"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center overflow-hidden">
              <span className="text-sm font-medium text-black truncate max-w-full">{file.name}</span>
              <span className="text-xs text-gray-400 ml-2">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </div>
            <div className="flex gap-1 ml-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => document.getElementById("fileUpload").click()}
              >
                <Upload className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-red-50 hover:text-red-500"
                onClick={() => {
                  if (filePreview) URL.revokeObjectURL(filePreview)
                  setFile(null)
                  setFilePreview(null)
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center justify-between w-full cursor-pointer"
            onClick={() => document.getElementById("fileUpload").click()}
          >
            <span className="text-sm text-gray-500">Upload an attached file (max 100 MB)</span>
            <Button type="button" variant="ghost" size="sm" className="h-8">
              <Upload className="h-3.5 w-3.5 mr-1" />
              Browse
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateLessonDocument
