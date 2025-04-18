import { useState } from "react"

function YoutubeInput({ youtubeUrl, setYoutubeUrl, disabled = false }) {
  const [inputValue, setInputValue] = useState(youtubeUrl || "")
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setInputValue(e.target.value)
    if (!e.target.value.trim()) {
      setYoutubeUrl("")
      setError("")
    }
  }

  const handleBlur = () => {
    const trimmedUrl = inputValue.trim()
    const videoId = getYoutubeVideoId(trimmedUrl)

    if (trimmedUrl === "") {
      setYoutubeUrl("")
      setError("")
      return
    }

    if (videoId) {
      setYoutubeUrl(trimmedUrl)
      setError("")
    } else {
      setError("Invalid URL. Please enter a valid YouTube link.")
    }
  }

  return (
    <div className="w-full">
      <label className="text-sm font-medium text-black mb-1 block">
        YouTube URL
      </label>
      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={inputValue}
        disabled={disabled}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full px-3 py-2 border rounded-md border-gray-700 focus:outline-none focus:ring-none"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {youtubeUrl && !error && (
        <div className="mt-2 w-full aspect-video border rounded-lg overflow-hidden">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${getYoutubeVideoId(
              youtubeUrl
            )}`}
            title="YouTube Video"
            allowFullScreen
          >
          </iframe>
        </div>
      )}
    </div>
  )
}

function getYoutubeVideoId(url) {
  const regExp =
    /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com|youtu\.be)\/(?:.*v=|.*\/|)([\w-]{11})/
  const match = url.match(regExp)
  return match ? match[1] : null
}


export default YoutubeInput
