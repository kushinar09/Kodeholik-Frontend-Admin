"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

function UpdateLessonVideo({
  file,
  setFile,
  filePreview,
  setFilePreview,
  existingFileUrl,
  disabled = false
}) {
  useEffect(() => {
    console.log(file, filePreview, existingFileUrl)
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

  const isYouTubeKey = (url) => {
    return (
      url && url.length === 11 && !url.includes("/") && !url.startsWith("http")
    )
  }

  const renderPreview = () => {
    // Check if there's a new file uploaded
    if (file && filePreview && filePreview.startsWith("blob:")) {
      return (
        <video
          src={filePreview}
          controls
          className="w-full h-full object-cover"
        />
      )
    }

    // Check if existingFileUrl is a YouTube video ID
    if (existingFileUrl && isYouTubeKey(existingFileUrl)) {
      return (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${existingFileUrl}`}
          title="YouTube Video"
          allowFullScreen
        >
        </iframe>
      )
    }

    // Check if existingFileUrl is a regular video file
    if (existingFileUrl && !isYouTubeKey(existingFileUrl)) {
      return (
        <video
          src={existingFileUrl}
          controls
          className="w-full h-full object-cover"
        />
      )
    }

    // No file or URL, show upload prompt
    return (
      <div
        className="flex flex-col items-center justify-center h-full w-full p-6 cursor-pointer"
        onClick={() => !disabled && document.getElementById("videoUpload").click()}
      >
        <Upload className="h-8 w-8 text-black mb-4" />
        <p className="text-black text-center">
          Drag and drop a video here\n(max 500 MB)\nor click to browse
        </p>
        <Button type="button" variant="outline" size="sm" className="mt-4">
          Select Video
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-black">Lesson Video</h4>
        <input
          type="file"
          id="videoUpload"
          accept="video/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      <div className="w-full aspect-[2/1] rounded-lg border border-gray-700 overflow-hidden flex flex-col items-center justify-center">
        <div className="w-full h-full">
          {(file || filePreview) ? (
            <div className="relative w-full h-full">
              {renderPreview()}
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  disabled={disabled}
                  onClick={() => document.getElementById("videoUpload").click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
            : (
              <div
                className="flex flex-col items-center justify-center h-full w-full p-6 cursor-pointer"
                onClick={() => document.getElementById("videoUpload").click()}
              >
                <Upload className="h-8 w-8 text-black mb-4" />
                <p className="text-center text-gray-500">
                  Drag and drop a video here (&lt; 500 MB)
                  <br />
                  or click to browse
                </p>
                <Button type="button" variant="outline" size="sm" className="mt-4">
                  Select Video
                </Button>
              </div>
            )}
          {file && filePreview && filePreview.startsWith("blob:") && (
            <div className="absolute bottom-0 left-0 right-0 text-xs text-black p-2 truncate bg-gray-800/70">
              {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UpdateLessonVideo