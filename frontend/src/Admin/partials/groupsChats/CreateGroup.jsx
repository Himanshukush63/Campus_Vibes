import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../Sidebar";
import Header from "../Header";
import WelcomeBanner from "../dashboard/WelcomeBanner";
import DashboardAvatars from "../dashboard/DashboardAvatars";
import GroupList from "./GroupList";

function CreateGroup() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/groups`,
        { name, description, isPublic },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setName("");
      setDescription("");
      setIsPublic(false);
      setError(""); // Clear any previous errors
      console.log("Group created:", response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create group");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Welcome banner */}
            <WelcomeBanner />

            {/* Dashboard actions */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              {/* Left: Avatars */}
              {/* <DashboardAvatars /> */}
            </div>

            {/* <div>
              <h2>Create Group</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Group Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  Public Group
                </label>
                <button type="submit">Create Group</button>
              </form>
              {error && <p>{error}</p>}
            </div> */}
            <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-2xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                Create Group
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Group Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label className="text-gray-700">Public Group</label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Create Group
                </button>
              </form>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {/* <GroupList/> */}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreateGroup;
