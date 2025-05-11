import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Sidebar from "../Sidebar";
import Header from "../Header";
import WelcomeBanner from "../dashboard/WelcomeBanner";
import DashboardAvatars from "../dashboard/DashboardAvatars";
import GroupList from "./GroupList";
import { TrashIcon } from "@heroicons/react/24/outline";

function Groups() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState([]);

  // Fetch joined groups
  useEffect(() => {
    const fetchJoinedGroups = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/groups/joined`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setJoinedGroups(response.data);
        // Auto-select first group if none selected
        if (response.data.length > 0 && !selectedGroup) {
          setSelectedGroup(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch joined groups:", error);
      }
    };
    fetchJoinedGroups();
  }, []);

  // Fetch messages when group is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedGroup) return;
      
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/groups/${selectedGroup._id}/messages`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
    fetchMessages();
  }, [selectedGroup]);

  // WebSocket setup
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_BASE_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Handle new messages via WebSocket
  useEffect(() => {
    if (!socket || !selectedGroup) return;

    socket.emit("join-group", selectedGroup._id);
    socket.on("new-group-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("new-group-message");
    };
  }, [socket, selectedGroup]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/groups/${selectedGroup._id}/messages`,
        { message: newMessage },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Delete group handler
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/groups/${groupId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setJoinedGroups((prev) => prev.filter((g) => g._id !== groupId));
      if (selectedGroup?._id === groupId) setSelectedGroup(null);
    } catch (err) {
      let msg = "Failed to delete group.";
      if (err.response && err.response.data && err.response.data.message) {
        msg += `\n${err.response.data.message}`;
      } else if (err.message) {
        msg += `\n${err.message}`;
      }
      alert(msg);
      console.error("Error deleting group:", err);
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
            <WelcomeBanner />
            
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              {/* <DashboardAvatars /> */}
            </div>
            {/* <GroupList/> */}
            {/* Group Chat Layout */}
            <div className="flex gap-8 h-[calc(100vh-200px)] no-scrollbar overflow-y-hidden">
              {/* Joined Groups List */}
              <div className="w-1/4 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Joined Groups</h2>
                <div className="space-y-2">
                  {joinedGroups.map((group) => (
                    <div
                      key={group._id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedGroup?._id === group._id
                          ? "bg-blue-100 border-2 border-blue-200"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                      onClick={() => setSelectedGroup(group)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-800">{group.name}</h3>
                          <p className="text-sm text-gray-600 truncate">
                            {group.description || "No description"}
                          </p>
                        </div>
                        <button
                          className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded-full"
                          title="Delete Group"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group._id);
                          }}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col">
                {selectedGroup ? (
                  <>
                    <div className="pb-4 border-b mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {selectedGroup.name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {selectedGroup.description}
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                      {messages.map((message) => (
                        <div key={message._id} className="flex items-start gap-3">
                          <img
                             src={`${import.meta.env.VITE_API_BASE_URL}${
                              message.sender.image
                            }`}
                            alt={message.sender.fullName}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">
                              {message.sender.fullName}
                            </div>
                            <div className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                              {message.message}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    Select a group to start chatting
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Groups;