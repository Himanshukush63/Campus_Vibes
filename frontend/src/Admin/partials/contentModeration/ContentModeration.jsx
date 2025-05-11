import React, { useEffect, useState } from "react";
import DashboardAvatars from "../dashboard/DashboardAvatars";
import WelcomeBanner from "../dashboard/WelcomeBanner";
import Header from "../Header";
import Sidebar from "../Sidebar";
import axios from "axios";

function ContentModeration() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blockedWords, setBlockedWords] = useState([]);
  const [newWord, setNewWord] = useState("");

  useEffect(() => {
    fetchBlockedWords();
  }, []);

  const fetchBlockedWords = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/moderation`);
      setBlockedWords(res.data);
    } catch (error) {
      console.error("Error fetching blocked words:", error);
    }
  };

  const addWord = async () => {
    if (!newWord.trim()) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/moderation/add`, { word: newWord });
      setNewWord("");
      fetchBlockedWords();
    } catch (error) {
      console.error("Error adding word:", error);
    }
  };

  const removeWord = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/moderation/${id}`);
      fetchBlockedWords();
    } catch (error) {
      console.error("Error deleting word:", error);
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

            <div className="p-4 max-w-xl mx-auto">
              <h2 className="text-xl font-bold mb-4">Content Moderation</h2>

              {/* Add Word */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  className="border p-2 w-full rounded"
                  placeholder="Enter a word to block"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                />
                <button
                  onClick={addWord}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Add
                </button>
              </div>

              {/* Blocked Words List */}
              <ul className="bg-white shadow p-4 rounded">
                {blockedWords.length === 0 ? (
                  <p className="text-gray-500">No blocked words.</p>
                ) : (
                  blockedWords.map((word) => (
                    <li
                      key={word._id}
                      className="flex justify-between p-2 border-b"
                    >
                      <span>{word.word}</span>
                      <button
                        onClick={() => removeWord(word._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ContentModeration;
