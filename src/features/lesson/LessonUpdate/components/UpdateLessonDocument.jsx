import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

function UpdateLessonDocument({ file, setFile, existingFileUrl }) {
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const uploadedFile = e.dataTransfer.files[0];
      setFile(uploadedFile);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-black">Attached File</h4>
        <input
          type="file"
          id="fileUpload"
          accept="*/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      <div
        className="w-full aspect-video rounded-lg border border-gray-700 overflow-hidden flex flex-col items-center justify-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {file || existingFileUrl ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
            <p className="text-black text-center truncate">
              {file ? file.name : existingFileUrl.split("/").pop()}
            </p>
            {file && (
              <p className="text-gray-400 text-sm">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={() => document.getElementById("fileUpload").click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={() => {
                  setFile(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full w-full p-6 cursor-pointer"
            onClick={() => document.getElementById("fileUpload").click()}
          >
            <Upload className="h-8 w-8 text-black mb-4" />
            <p className="text-black text-center">
              Drag and drop a file here
              <br />
              (max 100 MB)
              <br />
              or click to browse
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-4">
              Select File
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default UpdateLessonDocument;