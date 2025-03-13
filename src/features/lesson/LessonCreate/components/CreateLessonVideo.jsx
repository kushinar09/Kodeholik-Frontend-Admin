import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import YoutubeInput from "./YoutubeInput";

function CreateLessonVideo({
  file,
  setFile,
  filePreview,
  setFilePreview,
  youtubeUrl,
  setYoutubeUrl,
}) {
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      if (filePreview) URL.revokeObjectURL(filePreview);
      setFile(uploadedFile);
      setFilePreview(URL.createObjectURL(uploadedFile));
      setYoutubeUrl(""); // Xóa URL YouTube nếu người dùng chọn upload file
    }
  };

  const handleRemoveFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null);
    setFilePreview(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Nhập URL YouTube */}
        <YoutubeInput youtubeUrl={youtubeUrl} setYoutubeUrl={setYoutubeUrl} />

        {/* Upload video */}
        {!youtubeUrl && (
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
            <div className="w-full aspect-video rounded-lg border border-gray-700 overflow-hidden flex flex-col items-center justify-center">
              {file && filePreview ? (
                <div className="relative w-full h-full">
                  <video
                    src={filePreview}
                    controls
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={() =>
                        document.getElementById("videoUpload").click()
                      }
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-xs text-black p-2 truncate bg-gray-800/70">
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center h-full w-full p-6 cursor-pointer"
                  onClick={() => document.getElementById("videoUpload").click()}
                >
                  <Upload className="h-8 w-8 text-black mb-4" />
                  <p className="text-black text-center">
                    Drag and drop a video here
                    <br />
                    (max 500 MB)
                    <br />
                    or click to browse
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Select Video
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CreateLessonVideo;
