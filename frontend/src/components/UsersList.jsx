import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const UsersList = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("students"); // "students" or "faculty"
  const currentUser = JSON.parse(localStorage.getItem("data"));

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again later.");
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/${userId}/follow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      // Update the local state to reflect the follow/unfollow action
      setUsers(users.map(user => {
        if (user._id === userId) {
          const isCurrentlyFollowing = user.followers.includes(currentUser._id);
          return {
            ...user,
            followers: isCurrentlyFollowing
              ? user.followers.filter(id => id !== currentUser._id)
              : [...user.followers, currentUser._id]
          };
        }
        return user;
      }));
    } catch (err) {
      console.error("Error following/unfollowing user:", err);
    }
  };

  const filteredUsers = users.filter(user => {
    // Filter by type (student/faculty)
    const typeMatch = user.type === activeTab;
    
    // Filter by search query (if any)
    const searchMatch = searchQuery === "" || 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Exclude current user
    const notCurrentUser = user._id !== currentUser._id;
    
    return typeMatch && searchMatch && notCurrentUser;
  });

  const isFollowing = (user) => {
    return user.followers.includes(currentUser._id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={onClose}
        >
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white">Add Friends</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <XMarkIcon className="w-6 h-6 dark:text-white" />
              </button>
            </div>

            {/* Search bar */}
            <div className="p-4 border-b dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 pl-10 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Tabs for Student/Faculty */}
            <div className="flex border-b dark:border-gray-700">
              <button
                className={`flex-1 py-2 font-medium ${
                  activeTab === "student"
                    ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
                onClick={() => setActiveTab("student")}
              >
                Students
              </button>
              <button
                className={`flex-1 py-2 font-medium ${
                  activeTab === "faculty"
                    ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
                onClick={() => setActiveTab("faculty")}
              >
                Faculty
              </button>
            </div>

            {/* User list */}
            <div className="p-4 overflow-y-auto no-scrollbar h-[calc(100%-180px)]">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                  No {activeTab} found
                  {searchQuery && " matching your search"}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 mb-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Link
                      to={`/profile/${user._id}`}
                      className="flex items-center space-x-3 flex-1"
                      onClick={onClose}
                    >
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${user.image}`}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium dark:text-white">{user.fullName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                        </p>
                      </div>
                    </Link>
                    <div className="flex space-x-2">
                      <Link
                        to={`/profile/${user._id}`}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white rounded-full"
                        onClick={onClose}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleFollow(user._id)}
                        className={`px-3 py-1 text-sm rounded-full ${
                          isFollowing(user)
                            ? "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {isFollowing(user) ? "Unfollow" : "Follow"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UsersList;
