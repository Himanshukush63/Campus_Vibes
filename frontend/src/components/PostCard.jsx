import {
  HeartIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
// import { useAuth } from "../context/AuthContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast from "react-hot-toast";

const PostCard = ({ post }) => {
  const user = JSON.parse(localStorage.getItem("data"));
  const current = localStorage.getItem("userId");
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(
    post.likes?.includes(user._id) || false
  );
  const [commentsCount, setCommentsCount] = useState(
    post.comments?.length || 0
  );
  const [socket, setSocket] = useState(null);
  const mediaUrl = `${import.meta.env.VITE_API_BASE_URL}${post.content}`;
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [Userrrr, setUser] = useState();
  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_BASE_URL);
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on(`post:${post._id}:like`, (updatedLikes) => {
      setLikesCount(updatedLikes.length);
      setIsLiked(updatedLikes.includes(user._id));
    });

    socket.on(`post:${post._id}:comment`, (newComment) => {
      setComments((prev) => [...prev, newComment]);
      setCommentsCount((prev) => prev + 1);
    });

    return () => {
      socket.off(`post:${post._id}:like`);
      socket.off(`post:${post._id}:comment`);
    };
  }, [socket, post._id, post?._id]);

  const handleLike = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${post._id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log(post._id, user._id, post.user._id, "::SDSDFSDFSDF<SDF<SD>>");
      socket.emit("like-post", {
        postId: post._id,
        userId: user._id,
        like: res.data,
        postOwnerId: post.user._id,
      });
      setIsLiked(res.likes.includes(user._id));

      // The actual update will come through the socket event
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Update the handleCommentSubmit function
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${post._id}/comments`,
        { text: newComment },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Optimistic update
      setNewComment("");

      // Emit socket event
      socket.emit("new-comment", {
        postId: post._id,
        comment: response.data,
        userId: user._id,
        postOwnerId: post.user._id,
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        error ||
        "Failed to create comment";
      toast.error(errorMessage, {
        icon: "⚠️",
      });
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${post._id}/comments`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/profile/${user._id}`
        );
        setUser(data);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("data");
        localStorage.removeItem("userId");
        navigate("/login");
        console.error("Error fetching profile:", error);
      }
    };
    fetchUserProfile();
  }, []);
  console.log(
    post,
    Userrrr?.following.some((user) => user._id === post.user._id),
    Userrrr,
    "::>>>dsds"
  );

  useEffect(() => {
    if (isCommentsOpen) {
      fetchComments();
    }
  }, [isCommentsOpen]);
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Simulate loading delay
  }, []);
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md mb-6 p-4">
        <div className="flex items-center mb-4">
          <Skeleton circle height={40} width={40} />
          <div className="ml-3">
            <Skeleton width={120} height={16} />
            <Skeleton width={80} height={12} />
          </div>
        </div>
        <Skeleton height={200} className="mb-4" />
        <Skeleton width="60%" height={16} className="mb-4" />
        <div className="flex space-x-4">
          <Skeleton width={40} height={20} />
          <Skeleton width={40} height={20} />
        </div>
      </div>
    );
  }
  return post.user.profileVisibility === "public" || post.user._id === current ? (
    <>
      <div className="bg-white rounded-lg shadow-md mb-6 p-4 dark:bg-gray-950 dark:text-white dark:border-white dark:border">
        {/* User Header */}
        <div className="flex items-center mb-4">
          <Link to={`/profile/${post.user?._id}`}>
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}${post?.user?.image || '/uploads/default-avatar.png'}`}
              alt={post?.user?.fullName || 'User'}
              className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-gray-200"
              onError={(e) => { e.target.src = `${import.meta.env.VITE_API_BASE_URL}/uploads/default-avatar.png` }}
            />
          </Link>
          <div className="dark:text-white">
            <p className="font-semibold">{post?.user?.fullName}</p>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <div className="mb-4">
            {post.type === "text" ? (
              <p className="text-gray-700 whitespace-pre-line">
                {post?.content}
              </p>
            ) : post.type === "image" ? (
              <img
                src={mediaUrl}
                alt={post.caption || "Post image"}
                className="w-full max-h-[600px] object-contain rounded-lg"
                loading="lazy"
              />
            ) : post.type === "video" ? (
              <video
                controls
                className="w-full rounded-lg"
                poster={`${mediaUrl}?thumbnail=true`}
              >
                <source src={mediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : post.type === "document" ? (
              <iframe
                src={mediaUrl}
                className="w-full h-[600px] rounded-lg"
                title="PDF Document"
              />
            ) : null}
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-gray-600 mb-4 whitespace-pre-line dark:text-white">
            {post?.caption}
          </p>
        )}

        {/* Actions */}
        <div className="flex space-x-4 text-gray-500">
          <button
            onClick={handleLike}
            className={`flex items-center hover:text-red-500 transition-colors ${
              isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
            }`}
          >
            <HeartIcon 
              className="w-5 h-5 mr-1" 
              fill={isLiked ? "currentColor" : "none"}
    stroke="currentColor"
            />
            <span>{likesCount}</span>
          </button>
          <button
            className="flex items-center hover:text-blue-500"
            onClick={() => setIsCommentsOpen(true)}
          >
            <ChatBubbleLeftIcon className="w-5 h-5 mr-1" />
            <span>{commentsCount}</span>
          </button>
        </div>

        {/* Comments Drawer */}
        {isCommentsOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl h-[60vh] p-4 flex flex-col">
              {/* Drawer Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Comments</h2>
                <button
                  onClick={() => setIsCommentsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4">
                {comments.map((comment) => (
                  <div
                    key={comment._id || comment.tempId}
                    className="flex items-start space-x-3"
                  >
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${
                        comment.user.image
                      }`}
                      alt={comment.user.fullName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <p className="font-semibold">{comment.user.fullName}</p>
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="hidden lg:block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Post
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  ) : (
    Userrrr?.following.some((user) => user._id === post.user._id) && (
      <>
        <div className="bg-white rounded-lg shadow-md mb-6 p-4 dark:bg-gray-950 dark:text-white dark:border-white dark:border">
          {/* User Header */}
          <div className="flex items-center mb-4">
            <Link to={`/profile/${post.user?._id}`}>
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}${post?.user?.image}`}
                alt={post.fullName}
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
            </Link>
            <div className="dark:text-white">
              <p className="font-semibold">{post?.fullName}</p>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <div className="mb-4">
              {post.type === "text" ? (
                <p className="text-gray-700 whitespace-pre-line">
                  {post?.content}
                </p>
              ) : post.type === "image" ? (
                <img
                  src={mediaUrl}
                  alt={post.caption || "Post image"}
                  className="w-full max-h-[600px] object-contain rounded-lg"
                  loading="lazy"
                />
              ) : post.type === "video" ? (
                <video
                  controls
                  className="w-full rounded-lg"
                  poster={`${mediaUrl}?thumbnail=true`}
                >
                  <source src={mediaUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : post.type === "document" ? (
                <iframe
                  src={mediaUrl}
                  className="w-full h-[600px] rounded-lg"
                  title="PDF Document"
                />
              ) : null}
            </div>
          </div>

          {/* Caption */}
          {post.caption && (
            <p className="text-gray-600 mb-4 whitespace-pre-line dark:text-white">
              {post?.caption}
            </p>
          )}

          {/* Actions */}
          <div className="flex space-x-4 text-gray-500">
            <button
              onClick={handleLike}
              className={`flex items-center hover:text-red-500 transition-colors ${
                isLiked ? "text-red-500" : ""
              }`}
            >
              <HeartIcon className="w-5 h-5 mr-1" />
              <span>{likesCount}</span>
            </button>
            <button
              className="flex items-center hover:text-blue-500"
              onClick={() => setIsCommentsOpen(true)}
            >
              <ChatBubbleLeftIcon className="w-5 h-5 mr-1" />
              <span>{commentsCount}</span>
            </button>
          </div>

          {/* Comments Drawer */}
          {isCommentsOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl h-[60vh] p-4 flex flex-col">
                {/* Drawer Header */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Comments</h2>
                  <button
                    onClick={() => setIsCommentsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4">
                  {comments.map((comment) => (
                    <div
                      key={comment._id || comment.tempId}
                      className="flex items-start space-x-3"
                    >
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${
                          comment.user.image
                        }`}
                        alt={comment.user.fullName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <p className="font-semibold">
                            {comment.user.fullName}
                          </p>
                          <p className="text-gray-700">{comment.text}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="hidden lg:block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Post
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </>
    )
  );
};

export default PostCard;
