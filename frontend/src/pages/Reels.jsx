import { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import Navbar from "../components/Navbar";
import "react-loading-skeleton/dist/skeleton.css";
import PostCard from "../components/PostCard";
import axios from "axios";
import { Bars3Icon } from "@heroicons/react/24/outline";

const Reels = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const fetchPosts = async (pageNumber) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/posts?page=${pageNumber}&limit=10`
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

  // Initial fetch
  useEffect(() => {
    fetchPosts(page);
  }, [page]);
  
  const videoPosts = posts?.filter((post) => post.type === "video");

  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] flex-col lg:flex-row dark:bg-black">
      {/* Mobile Navbar with hamburger menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button onClick={toggleMobileSidebar}>
            <Bars3Icon className="w-6 h-6" />
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

      {/* Middle Section (Search + Posts) */}
      <div className="w-full lg:w-[85%] mt-16 lg:mt-0 overflow-y-auto no-scrollbar">
        {/* Desktop Navbar */}
        <div className="hidden lg:block">
          <Navbar />
        </div>
        
        <div className="flex-1 p-4 max-w-2xl mx-auto pb-16">
          {/* Posts */}
          <div className="max-h-screen">
            {videoPosts.length > 0 ? (
              videoPosts.map((post) => (
                <PostCard key={post._id} post={post} loading={loading} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6">
                <img
                  src="https://illustrations.popsy.co/violet/crashed-error.svg"
                  alt="No Posts"
                  className="w-60 h-60"
                />
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mt-4">
                  No reels found
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Be the first to share an amazing reel!
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
    </div>
  );
};

export default Reels;