import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { animateScroll } from 'react-scroll';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import SideBar from "../components/SideBar";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import EmojiPicker from "../components/EmojiPicker";
import FileUploadButton from "../components/FileUploadButton";

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const userId = localStorage.getItem("userId");

  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);

  const scrollToBottom = () => {
    animateScroll.scrollToBottom({
      containerId: 'messages-container',
      duration: 200,
      smooth: true,
      isDynamic: true
    });
  };

  // Check if user has scrolled up
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 50;
      setAutoScroll(isNearBottom);
    }
  };

  // Connect to WebSocket
  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_API_BASE_URL}`, { withCredentials: true });
    setSocket(newSocket);
    newSocket.emit("join-user-room", userId);

    return () => newSocket.disconnect();
  }, [userId]);

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/messages/chats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
        // Add chatbot to chats list
        const chatbotChat = Chatbot.createChatObject();
        const allChats = [chatbotChat, ...response.data];
        setChats(allChats);
        socket?.emit("new-chat", allChats);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };
    fetchChats();
  }, [socket]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    // Handle chatbot separately
    if (selectedChat.isBot) {
      // Initialize with welcome message
      const welcomeMessage = Chatbot.createWelcomeMessage();
      setMessages([welcomeMessage]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/messages/messages/${selectedChat._id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setMessages(response.data);
        setAutoScroll(true);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
    socket?.emit("join-user-room", selectedChat._id);
  }, [selectedChat, socket]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.chat === selectedChat?._id) {
        setMessages((prev) => [...prev, message]);
      }

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === message.chat ? { ...chat, lastMessage: message } : chat
        )
      );
    };

    socket.on("new-message", handleNewMessage);
    return () => socket.off("new-message", handleNewMessage);
  }, [socket, selectedChat]);

  // Search users
  const handleSearch = async (query) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/search?query=${query}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  // Start new chat
  const startNewChat = async (userId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/chats/start`,
        { userId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setChats((prev) => [response.data, ...prev]);
      setSelectedChat(response.data);
      setShowSearchResults(false);
      setSearchQuery("");
      setShowChatList(false);
      socket.emit("new-chat", response.data);
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    // Handle chatbot messages
    if (selectedChat.isBot) {
      // Add user message
      const userMessage = {
        _id: `user-msg-${Date.now()}`,
        content: newMessage,
        sender: userId,
        createdAt: new Date().toISOString(),
        chat: selectedChat._id
      };
      setMessages(prev => [...prev, userMessage]);
      setNewMessage("");
      setAutoScroll(true);

      // Get chatbot response
      const botResponse = await Chatbot.getResponse(newMessage);
      const botMessage = {
        _id: `chatbot-msg-${Date.now()}`,
        content: botResponse,
        sender: Chatbot.profile._id,
        createdAt: new Date().toISOString(),
        chat: selectedChat._id
      };
      setMessages(prev => [...prev, botMessage]);
      setAutoScroll(true);

      // Update last message in chat list
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.isBot ? { ...chat, lastMessage: { ...chat.lastMessage, content: newMessage } } : chat
        )
      );
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/messages/send`,
        { chatId: selectedChat._id, content: newMessage },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      socket.emit("send-message", response.data);
      setNewMessage("");
      setAutoScroll(true);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Add emoji to message
  const handleEmojiSelect = (emoji) => {
    setNewMessage((msg) => msg + emoji);
    setShowEmojiPicker(false);
  };

  // Handle file upload
  const handleFileSelect = async (file) => {
    if (!file) return;
    setFileUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("chatId", selectedChat._id);
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/messages/send`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data"
          },
        }
      );
      setMessages((prev) => [...prev, res.data]);
      setAutoScroll(true);
    } catch (err) {
      alert("Failed to send file.");
    }
    setFileUploadLoading(false);
  };

  const otherParticipant = selectedChat?.participants?.find(
    (participant) => participant?._id !== userId
  ) || null;

  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] flex-col lg:flex-row">
      {/* Mobile Navbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button onClick={toggleMobileSidebar}>
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-16 lg:pt-0">
        {/* Desktop Navbar */}
        <div className="hidden lg:block">
          <Navbar />
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
          {/* Chat List - Toggleable on mobile */}
          <div 
            className={`w-full lg:w-1/4 bg-white dark:bg-gray-800 shadow-lg p-4 overflow-y-auto no-scrollbar transition-all duration-300
              ${showChatList ? 'block' : 'hidden lg:block'} fixed lg:static z-10 h-full lg:h-auto`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold dark:text-white">Chats</h2>
              <button 
                onClick={() => setShowChatList(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <div className="flex items-center border rounded-lg px-2 dark:border-gray-600">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-full p-2 bg-transparent focus:outline-none dark:text-white"
                />
              </div>

              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 dark:bg-gray-800 dark:border-gray-700">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => startNewChat(user._id)}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center dark:hover:bg-gray-700"
                    >
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${user.image || '/uploads/default-avatar.png'}`}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full mr-2 object-cover border border-gray-200"
                        onError={(e) => { e.target.src = `${import.meta.env.VITE_API_BASE_URL}/uploads/default-avatar.png` }}
                      />
                      <div>
                        <p className="font-semibold dark:text-white">{user.fullName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {chats.map((chat) => {
                const otherUser = chat.participants?.find(p => p?._id !== userId) || null;
                return (
                  <div
                    key={chat._id}
                    onClick={() => {
                      setSelectedChat(chat);
                      setShowChatList(false);
                    }}
                    className={`p-3 rounded-lg cursor-pointer ${
                      selectedChat?._id === chat._id
                        ? "bg-blue-100 dark:bg-blue-800"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center">
                      {chat.isBot ? (
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}/uploads/imp/chatbot.png`}
                          alt="Campus Assistant"
                          className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-blue-200"
                        />
                      ) : otherUser ? (
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}${otherUser.image || '/uploads/default-avatar.png'}`}
                          alt={otherUser.fullName || 'User'}
                          className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-gray-200"
                          onError={(e) => { e.target.src = `${import.meta.env.VITE_API_BASE_URL}/uploads/default-avatar.png` }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full mr-3 bg-gray-300 flex items-center justify-center border-2 border-gray-200">
                          <span className="text-gray-600">?</span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold dark:text-white">{chat.isBot ? 'Campus Assistant' : otherUser?.fullName || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {chat.isBot ? 'Your Smart Campus Buddy' : chat.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 bg-white dark:bg-gray-800 shadow-lg flex flex-col ${
            !showChatList ? 'w-full' : 'hidden lg:flex'
          }`}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b dark:border-gray-700 flex items-center">
                  <button 
                    onClick={() => setShowChatList(true)}
                    className="lg:hidden mr-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  {selectedChat.isBot ? (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/uploads/imp/chatbot.png`}
                      alt="Campus Assistant"
                      className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-blue-200"
                    />
                  ) : otherParticipant ? (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${otherParticipant.image || '/uploads/default-avatar.png'}`}
                      alt={otherParticipant.fullName || 'User'}
                      className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-gray-200"
                      onError={(e) => { e.target.src = `${import.meta.env.VITE_API_BASE_URL}/uploads/default-avatar.png` }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full mr-3 bg-gray-300 flex items-center justify-center border-2 border-gray-200">
                      <span className="text-gray-600">?</span>
                    </div>
                  )}
                  <p className="font-semibold dark:text-white">{selectedChat.isBot ? 'Campus Assistant' : otherParticipant?.fullName || 'Unknown User'}</p>
                </div>

                {/* Messages */}
                <div 
                  id="messages-container"
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 p-4 overflow-y-auto no-scrollbar"
                >
                  {messages.map((message, index) => {
                    const isUser = message.sender === userId || message.sender._id === userId;
                    const showAvatar = index === 0 || 
                      (messages[index-1] && 
                       (messages[index-1].sender !== message.sender && 
                        messages[index-1].sender._id !== message.sender._id));
                    
                    return (
                      <div key={message._id} className="mb-4">
                        <div className={`flex items-start ${isUser ? 'justify-end' : 'justify-start'}`}>
                          {!isUser && showAvatar && (
                            <div className="mr-2 flex-shrink-0">
                              {selectedChat.isBot ? (
                                <img 
                                  src={`${import.meta.env.VITE_API_BASE_URL}/uploads/imp/chatbot.png`}
                                  alt="Campus Assistant"
                                  className="w-8 h-8 rounded-full object-cover border border-blue-200"
                                />
                              ) : (
                                <img 
                                  src={`${import.meta.env.VITE_API_BASE_URL}${otherParticipant?.image || '/uploads/default-avatar.png'}`}
                                  alt={otherParticipant?.fullName || 'User'}
                                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                  onError={(e) => { e.target.src = `${import.meta.env.VITE_API_BASE_URL}/uploads/default-avatar.png` }}
                                />
                              )}
                            </div>
                          )}
                          <div className={`max-w-[75%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
                            <div
                              className={`p-3 rounded-lg ${isUser 
                                ? "bg-blue-500 text-white rounded-tr-none" 
                                : "bg-gray-200 dark:bg-gray-700 dark:text-white rounded-tl-none"}`}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1 text-right">
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          {isUser && showAvatar && (
                            <div className="ml-2 flex-shrink-0">
                              <img 
                                src={`${import.meta.env.VITE_API_BASE_URL}${localStorage.getItem("userImage") || '/uploads/default-avatar.png'}`}
                                alt="You"
                                className="w-8 h-8 rounded-full object-cover border border-blue-200"
                                onError={(e) => { e.target.src = `${import.meta.env.VITE_API_BASE_URL}/uploads/default-avatar.png` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700">
                  <div className="relative flex gap-2 items-end">
                    <button
                      type="button"
                      className="text-2xl px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setShowEmojiPicker((v) => !v)}
                      title="Insert Emoji"
                    >
                      😊
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-full transform -translate-x-1/2 mb-3 z-50">
                        <EmojiPicker onSelect={handleEmojiSelect} />
                      </div>
                    )}
                    <FileUploadButton onFileSelect={handleFileSelect} />
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      disabled={fileUploadLoading}
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      disabled={fileUploadLoading}
                    >
                      {fileUploadLoading ? "..." : "Send"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center dark:text-gray-400">
                {window.innerWidth < 1024 ? (
                  <button 
                    onClick={() => setShowChatList(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Show Chats
                  </button>
                ) : (
                  "Select a chat to start messaging"
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;