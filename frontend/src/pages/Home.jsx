import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import "react-loading-skeleton/dist/skeleton.css";
import CreatePostDropdown from "../components/CreatePostDropdown";
import CreatePostModal from "../components/CreatePostModal";
import PostCard from "../components/PostCard";
import axios from "axios";
import { io } from "socket.io-client";
import SideBar from "../components/SideBar";
import Navbar from "../components/Navbar";
import GroupList from "../Admin/partials/groupsChats/GroupList";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const socket = io(`${import.meta.env.VITE_API_BASE_URL}`, {
      withCredentials: true,
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchPosts = async (pageNumber) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts?page=${pageNumber}&limit=10`
      );
      setPosts((prev) => {
        const newPosts = response.data.posts.filter(
          (post) => !prev.some((p) => p._id === post._id)
        );
        return [...prev, ...newPosts];
      });
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/suggested`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setSuggestedUsers(response.data);
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      }
    };

    fetchSuggestedUsers();
  }, []);

  const handleSearch = async (query) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/search?query=${query}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <>
      <div className="flex h-screen w-full bg-[#f1f5f9] flex-col lg:flex-row">
        {/* Mobile Navbar with hamburger menu */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button onClick={toggleMobileSidebar}>
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Campus Vibes</h1>
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
        <div className="flex-1 flex flex-col h-screen overflow-hidden pt-16 lg:pt-0">
          {/* Desktop Navbar at the top */}
          <div className="hidden lg:block">
            <Navbar />
          </div>
          
          {/* Middle and Right Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Middle Section (Posts) - Scrollable */}
            <div className="flex-1 overflow-y-auto no-scrollbar dark:bg-gray-950 dark:text-white bg-white">
              <div className="p-4 max-w-2xl mx-auto pb-16">
                {/* Search Bar */}
                <div className="mb-6 relative">
                  <div className="flex items-center border rounded-lg px-2">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearch(e.target.value);
                      }}
                      className="w-full p-2 bg-transparent focus:outline-none"
                    />
                  </div>
                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-lg mt-1">
                      {searchResults.map((user) => (
                        <Link 
                          key={user._id} 
                          to={`/profile/${user._id}`}
                          onClick={() => setShowSearchResults(false)}
                        >
                          <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center">
                            <img
                              src={`${import.meta.env.VITE_API_BASE_URL}${user.image}`}
                              alt={user.fullName}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                            <div>
                              <p className="font-semibold dark:text-white">{user.fullName}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Posts */}
                <div>
                  {posts && posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard key={post._id} post={post} loading={loading} />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6">
                      <img
                        src="https://illustrations.popsy.co/violet/crashed-error.svg"
                        alt="No Posts"
                        className="w-80 h-80"
                      />
                      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mt-4">
                        No posts found
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400">
                        Be the first to share something interesting!
                      </p>
                    </div>
                  )}

                  {/* Load More Button */}
                  {!loading && posts.length > 0 && page < totalPages && (
                    <button
                      onClick={() => setPage((prev) => prev + 1)}
                      className="w-full py-2 text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      Show More
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Fixed - Desktop Only */}
            <div className="hidden lg:flex flex-col w-80 border-l bg-white dark:bg-gray-950 dark:border-gray-800 h-full">
              {/* Suggested Users Section (Top Half) */}
              <div className="flex-1 overflow-y-auto no-scrollbar border-b dark:border-gray-800">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">Suggested Users</h2>
                  <div className="space-y-3">
                    {suggestedUsers.map((user) => (
                      <Link
                        className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg"
                        key={user._id}
                        to={`/profile/${user._id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={`${import.meta.env.VITE_API_BASE_URL}${user.image}`}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-semibold">{user.fullName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              @{user.fullName}
                            </p>
                          </div>
                        </div>
                        <button className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
                          View
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Group List Section (Bottom Half) */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="p-4">
                  <GroupList />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;