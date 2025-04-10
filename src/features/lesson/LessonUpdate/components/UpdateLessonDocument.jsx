"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

function UpdateLessonDocument({ file, setFile }) {
  const [filePreview, setFilePreview] = useState(null)

  useEffect(() => {
    return () => {
      if (filePreview && filePreview.startsWith("blob:")) {
        URL.revokeObjectURL(filePreview)
      }
    }
  }, [filePreview])

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0]
    if (uploadedFile) {
      if (filePreview && filePreview.startsWith("blob:")) {
        URL.revokeObjectURL(filePreview)
      }
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const uploadedFile = e.dataTransfer.files[0]
      if (filePreview && filePreview.startsWith("blob:")) {
        URL.revokeObjectURL(filePreview)
      }
      setFile(uploadedFile)
      setFilePreview(URL.createObjectURL(uploadedFile))
    }
  }

  const handleRemoveFile = () => {
    if (filePreview && filePreview.startsWith("blob:")) {
      URL.revokeObjectURL(filePreview)
    }
    setFile(null)
    setFilePreview(null)
  }

  const getDisplayName = () => {
    if (!file) return ""

    if (typeof file === "string") {
      return file.includes("/") ? file.split("/").pop().split("-").pop() : file
    }

    return file.name
  }

  const getFileSize = () => {
    if (!file || typeof file === "string") return null
    return (file.size / (1024 * 1024)).toFixed(2)
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
              <span className="text-sm font-medium text-black truncate max-w-[200px]">{getDisplayName()}</span>
              {getFileSize() && <span className="text-xs text-gray-300 ml-2">({getFileSize()} MB)</span>}
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
                onClick={handleRemoveFile}
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
            <span className="text-sm text-gray-500">Upload a file (Word, PDF, TXT - max 100 MB)</span>
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

export default UpdateLessonDocument
