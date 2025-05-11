import React, { useEffect, useState } from "react";
import axios from "axios";
import SideBar from "../components/SideBar";
import Navbar from "../components/Navbar";
import {
  MegaphoneIcon,
  PaperClipIcon,
  TrashIcon,
  Bars3Icon
} from "@heroicons/react/24/outline";

function Announcements() {
  const userData = JSON.parse(localStorage.getItem("data"));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/announcements`
      );
      setAnnouncements(res.data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (file) formData.append("file", file);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/announcements`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setTitle("");
      setDescription("");
      setFile(null);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error posting announcement:", error);
    }
  };

  const handleDelete = async (announcementId) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/announcements/${announcementId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        alert("Announcement deleted successfully.");
        setAnnouncements(announcements.filter((a) => a._id !== announcementId));
      } else {
        alert("Failed to delete announcement.");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] flex-col lg:flex-row dark:bg-gray-950">
      {/* Mobile Navbar with hamburger menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button onClick={toggleMobileSidebar}>
            <Bars3Icon className="w-6 h-6 dark:text-white" />
          </button>
          <h1 className="text-xl font-bold dark:text-white">Campus Vibes</h1>
          <div className="w-6"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Left Sidebar (Menu) */}
      <div className={`fixed lg:static z-30 h-full ${isMobileSidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <SideBar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleMobileSidebar}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="w-full lg:w-[85%] mt-16 lg:mt-0 overflow-y-auto no-scrollbar">
        {/* Desktop Navbar */}
        <div className="hidden lg:block">
          <Navbar />
        </div>
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-semibold flex items-center gap-2 dark:text-white">
            <MegaphoneIcon className="w-7 h-7 text-blue-500" /> Announcements
          </h1>

          {userData.type === "faculty" && (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-4 rounded-lg shadow mt-4 dark:bg-gray-800"
            >
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-lg mb-3 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-lg mb-3 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
              <label className="flex items-center gap-2 cursor-pointer dark:text-white">
                <PaperClipIcon className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                <span>Attach File (Optional)</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
              {file && <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{file.name}</p>}
              <button
                type="submit"
                className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Post Announcement
              </button>
            </form>
          )}

          {/* Announcements List */}
          <div className="mt-6">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div
                  key={announcement._id}
                  className="bg-white p-4 rounded-lg shadow mb-4 relative dark:bg-gray-800 dark:text-white"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">
                      {announcement.title}
                    </h2>
                    {/* Show delete button only for faculty users */}
                    {userData?.type === "faculty" && (
                      <button
                        onClick={() => handleDelete(announcement._id)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                      >
                        <TrashIcon className="w-6 h-6" />
                      </button>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-300">{announcement.description}</p>
                  {announcement.file && (
                    <div className="mt-2">
                      {announcement.file.endsWith(".pdf") ? (
                        <iframe
                          src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${
                            announcement.file
                          }`}
                          className="w-full h-40 rounded-lg"
                          title="PDF Document"
                        />
                      ) : (
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${
                            announcement.file
                          }`}
                          alt="Uploaded File"
                          className="w-full max-h-60 object-contain mt-2"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6">
                <img
                  src="https://illustrations.popsy.co/violet/crashed-error.svg"
                  alt="No Announcements"
                  className="w-60 h-60"
                />
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mt-4">
                  No announcements found
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  {userData?.type === "faculty" 
                    ? "Create your first announcement" 
                    : "Check back later for announcements"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Announcements;