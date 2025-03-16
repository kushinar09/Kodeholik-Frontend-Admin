import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

function CreateLessonDocument({ file, setFile }) {
  const [filePreview, setFilePreview] = useState(null);
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      if (!allowedTypes.includes(uploadedFile.type)) {
        alert(
          "Only Word (.doc, .docx), PDF (.pdf), and Text (.txt) files are allowed."
        );
        return;
      }
      if (uploadedFile.size > 100 * 1024 * 1024) {
        alert("File must be less than 100 MB.");
        return;
      }
      if (filePreview) URL.revokeObjectURL(filePreview);
      setFile(uploadedFile);
      setFilePreview(URL.createObjectURL(uploadedFile));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const uploadedFile = e.dataTransfer.files[0];
    if (uploadedFile) {
      if (!allowedTypes.includes(uploadedFile.type)) {
        alert(
          "Only Word (.doc, .docx), PDF (.pdf), and Text (.txt) files are allowed."
        );
        return;
      }
      if (uploadedFile.size > 100 * 1024 * 1024) {
        alert("File must be less than 100 MB.");
        return;
      }
      if (filePreview) URL.revokeObjectURL(filePreview);
      setFile(uploadedFile);
      setFilePreview(URL.createObjectURL(uploadedFile));
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-black">Attached File</h4>
        <input
          type="file"
          id="fileUpload"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      <div
        className="w-full aspect-video rounded-lg border border-gray-700 overflow-hidden flex flex-col items-center justify-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
            <p className="text-black text-center truncate">{file.name}</p>
            <p className="text-gray-400 text-sm">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
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
                  if (filePreview) URL.revokeObjectURL(filePreview);
                  setFile(null);
                  setFilePreview(null);
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
              (Word, PDF, TXT - max 100 MB)
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

export default CreateLessonDocument;
