import React, { useRef } from "react";
import { PaperClipIcon } from "@heroicons/react/24/outline";

export default function FileUploadButton({ onFileSelect }) {
  const fileInputRef = useRef();

  const handleClick = () => fileInputRef.current.click();

  return (
    <>
      <button
        type="button"
        className="bg-gray-200 dark:bg-gray-700 p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        onClick={handleClick}
        title="Send Photo or File"
      >
        <PaperClipIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={e => onFileSelect(e.target.files[0])}
      />
    </>
  );
}
