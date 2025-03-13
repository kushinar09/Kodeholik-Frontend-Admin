import { useState } from "react";

function YoutubeInput({ youtubeUrl, setYoutubeUrl }) {
  const [inputValue, setInputValue] = useState(youtubeUrl || "");

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    setYoutubeUrl(inputValue.trim());
  };

  return (
    <div className="w-full">
      <label className="text-sm font-medium text-black mb-1 block">
        YouTube URL
      </label>
      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
      />
      {youtubeUrl && (
        <div className="mt-2 w-full aspect-video border rounded-lg overflow-hidden">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${getYoutubeVideoId(
              youtubeUrl
            )}`}
            title="YouTube Video"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
}

// Hàm lấy video ID từ URL YouTube
function getYoutubeVideoId(url) {
  const regExp =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : "";
}

export default YoutubeInput;
