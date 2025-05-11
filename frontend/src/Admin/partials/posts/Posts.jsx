import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Sidebar";
import Header from "../Header";
import WelcomeBanner from "../dashboard/WelcomeBanner";
import DashboardAvatars from "../dashboard/DashboardAvatars";
import Banner from "../Banner";

function Posts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/posts/admin`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPosts(response.data.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  // Approve a post
  const handleApprove = async (postId) => {
    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/posts/admin/${postId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, status: "approved" } : post
        )
      );
    } catch (error) {
      console.error("Error approving post:", error);
    }
  };

  // Reject a post
  const handleReject = async (postId) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/admin/${postId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, status: "rejected" } : post
        )
      );
    } catch (error) {
      console.error("Error rejecting post:", error);
    }
  };
  console.log(selectedPost,"::selectedPost")

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
            {/* Modal */}
            {selectedPost && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        Post Details
                      </h3>
                      <button
                        onClick={() => setSelectedPost(null)}
                        className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      {selectedPost.type === "image" && (
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}${
                            selectedPost.content
                          }`}
                          alt={selectedPost.caption}
                          className="rounded-lg max-h-96 object-contain mx-auto"
                        />
                      )}

                      {selectedPost.type === "video" && (
                        <video controls className="rounded-lg w-full max-h-96">
                          <source src={selectedPost.content} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}

                      {selectedPost.type === "text" && (
                        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                          {selectedPost.content}
                        </p>
                      )}
                      {selectedPost.type === "document" && (
                        <a
                          href={`${import.meta.env.VITE_API_BASE_URL}${
                            selectedPost.content
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline block mt-1"
                        >
                          View PDF Document
                        </a>
                      )}
                    </div>

                    {/* Post Metadata */}
                    <div className="p-5 bg-white dark:bg-slate-800 shadow-md rounded-lg">
                      <div className="space-y-4 text-sm">
                        {/* Caption */}
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            Caption:
                          </span>
                          <p className="text-slate-600 dark:text-slate-300">
                            {selectedPost.caption || "No caption"}
                          </p>
                        </div>

                        {/* Author */}
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            Author:
                          </span>
                          <p className="text-slate-600 dark:text-slate-300">
                            {selectedPost.user?.fullName || "Unknown"}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="flex items-center">
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            Status:
                          </span>
                          <span
                            className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                              selectedPost.status === "approved"
                                ? "bg-emerald-100 text-emerald-600"
                                : selectedPost.status === "rejected"
                                ? "bg-rose-100 text-rose-600"
                                : "bg-amber-100 text-amber-600"
                            }`}
                          >
                            {selectedPost.status}
                          </span>
                        </div>

                        {/* Posted At */}
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            Posted at:
                          </span>
                          <p className="text-slate-600 dark:text-slate-300">
                            {selectedPost.createdAt
                              ? new Date(
                                  selectedPost.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Posts Table */}
            <div className="mt-10">
              <table className="min-w-full bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {posts.map((post) => (
                    <tr key={post._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-200">
                        {post.user?.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-200">
                        {post.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-200">
                        {post.type === "text" ? (
                          <button
                            onClick={() => setSelectedPost(post)}
                            className="text-indigo-500 hover:text-indigo-600 cursor-pointer"
                          >
                            View Text
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedPost(post)}
                            className="text-indigo-500 hover:text-indigo-600 cursor-pointer"
                          >
                            View{" "}
                            {post.type.charAt(0).toUpperCase() +
                              post.type.slice(1)}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-200">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            post.status === "approved"
                              ? "bg-emerald-100 text-emerald-600"
                              : post.status === "rejected"
                              ? "bg-rose-100 text-rose-600"
                              : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-200">
                        {post.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(post._id)}
                              className="mr-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(post._id)}
                              className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <Banner />
      </div>
    </div>
  );
}

export default Posts;
