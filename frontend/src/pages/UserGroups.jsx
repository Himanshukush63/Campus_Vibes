import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Bars3Icon, XMarkIcon, ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import SideBar from "../components/SideBar";
import Navbar from "../components/Navbar";

const UserGroups = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [showGroupsList, setShowGroupsList] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

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
    return () => newSocket.disconnect();
  }, []);

  // Handle new messages via WebSocket
  useEffect(() => {
    if (!socket || !selectedGroup) return;
    socket.emit("join-group", selectedGroup._id);
    socket.on("new-group-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => socket.off("new-group-message");
  }, [socket, selectedGroup]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check scroll position
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const atBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
      setIsAtBottom(atBottom);
    }
  };

  // Scroll to bottom when messages change and user is at bottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  // Set up scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Scroll to bottom initially when group is selected
  useEffect(() => {
    if (selectedGroup) {
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedGroup]);

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
      setIsAtBottom(true);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] flex-col lg:flex-row">
      {/* Mobile Navbar with hamburger menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button onClick={toggleMobileSidebar}>
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Campus Vibes</h1>
          <div className="w-6"></div>
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
      <div className="flex-1 flex flex-col pt-16 lg:pt-0">
        {/* Desktop Navbar */}
        <div className="hidden lg:block">
          <Navbar />
        </div>

        {/* Main Chat Container */}
        <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
          {/* Groups List - Toggleable on mobile */}
          <div 
            className={`w-full lg:w-1/4 bg-white dark:bg-gray-800 shadow-lg p-5 overflow-y-auto no-scrollbar transition-all duration-300
              ${showGroupsList ? 'block' : 'hidden lg:block'} fixed lg:static z-10 h-full lg:h-auto`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Joined Groups
              </h2>
              <button 
                onClick={() => setShowGroupsList(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {joinedGroups.map((group) => (
                <div
                  key={group._id}
                  className={`p-4 rounded-lg cursor-pointer transition-all shadow-sm border ${
                    selectedGroup?._id === group._id
                      ? "bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-500"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent"
                  }`}
                  onClick={() => {
                    setSelectedGroup(group);
                    if (window.innerWidth < 1024) setShowGroupsList(false);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
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
          <div className={`flex-1 bg-white dark:bg-gray-800 shadow-lg p-5 flex flex-col ${
            !showGroupsList ? 'w-full' : 'hidden lg:flex'
          }`}>
            {selectedGroup ? (
              <>
                {/* Group Header with back button for mobile */}
                <div className="pb-4 border-b mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <button 
                      onClick={() => setShowGroupsList(true)}
                      className="lg:hidden mr-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {selectedGroup.name}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedGroup.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto no-scrollbar mb-4 space-y-4 p-2"
                >
                  {messages.map((message) => (
                    <div key={message._id} className="flex items-start gap-3">
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${message.sender.image}`}
                        alt={message.sender.fullName}
                        className="w-10 h-10 rounded-full border shadow-sm"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {message.sender.fullName}
                        </div>
                        <div className="text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                          {message.message}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="flex gap-3 p-3 border-t bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-200"
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                {window.innerWidth < 1024 ? (
                  <button 
                    onClick={() => setShowGroupsList(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
                  >
                    Show Groups
                  </button>
                ) : (
                  "Select a group to start chatting"
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGroups;