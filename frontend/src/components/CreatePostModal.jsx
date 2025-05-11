// components/CreatePostModal.jsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import axios from "axios";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
const CreatePostModal = ({ isOpen, onClose, type }) => {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [content, setContent] = useState(""); // For text posts
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("type", type);

      if (type === "text") {
        formData.append("content", content);
        if (caption) formData.append("caption", caption);
      } else {
        if (!file) {
          throw new Error("Please select a file to upload");
        }
        formData.append("file", file);
        if (caption) formData.append("caption", caption);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success(
        "Post created successfully, It will be their once admin approved 🎉",
        {
          icon: "🚀",
        }
      );
      console.log("Post created:", response.data);

      // Close the modal and reset form
      onClose();
      setCaption("");
      setContent("");
      setFile(null);
    } catch (err) {
      console.error("Error creating post:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create post";
      setError(errorMessage);
      toast.error(errorMessage, {
        icon: "⚠️",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Basic file validation
    if (type === "image" && !selectedFile.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (type === "video" && !selectedFile.type.startsWith("video/")) {
      setError("Please upload a video file");
      return;
    }

    if (type === "document") {
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are allowed.");
        return;
      }
    }

    // File size validation (e.g., 10MB for images, 100MB for videos)
    const maxSize = type === "video" ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(
        `File size too large (max ${type === "video" ? "100MB" : "10MB"})`
      );
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
          {/* <div className="flex min-h-full items-center justify-center p-4 text-center"> */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-xs sm:max-w-sm md:max-w-md xl:max-w-lg transform overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-xl transition-all">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Create {type.charAt(0).toUpperCase() + type.slice(1)} Post
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {error && (
                  <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                  </div>
                )}

                {type === "text" ? (
                  <>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your post content..."
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      required
                    />
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Add a caption (optional)"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <input
                        type="file"
                        accept={type === "image" ? "image/*" : type === "video" ? "video/*" : "application/pdf"}
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer text-blue-500 hover:text-blue-600"
                      >
                        Click to upload {type}
                      </label>
                      {file && (
                        <p className="mt-2 text-sm text-gray-500">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)}
                          MB)
                        </p>
                      )}
                    </div>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Add a caption (optional)"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </>
                )}

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Posting..." : "Post"}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
        {/* </div> */}
      </Dialog>
    </Transition>
  );
};

export default CreatePostModal;
