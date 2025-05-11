import {
  DocumentTextIcon,
  PhotoIcon,
  Squares2X2Icon,
  TrashIcon,
  VideoCameraIcon,
  DocumentIcon,
  CogIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tab } from "@headlessui/react";
import axios from "axios";
import { io } from "socket.io-client";
const socket = io(`${import.meta.env.VITE_API_BASE_URL}`);
import capitalizeAndTruncate from "../utils/capitalizeAndTruncate";
import SideBar from "../components/SideBar";
import Navbar from "../components/Navbar";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import FollowersFollowingDrawer from "../components/FollowersFollowingDrawer";

const Profile = () => {
  const { userId } = useParams();
  const current = localStorage.getItem("userId");
  const [user, setUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [isFollowing, setIsFollowing] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState("followers");
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(
    user?.profileVisibility || "public"
  );
  const [fullName, setFullName] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentUser, setCurrentUser] = useState();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [followRequestStatus, setFollowRequestStatus] = useState(null); // null | 'pending' | 'sent'

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("aboutMe", aboutMe);
      formData.append("profileVisibility", profileVisibility);
      
      if (profileImage) {
        formData.append("image", profileImage);
      }
      
      // Update profile
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/profile/update`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data"
          },
        }
      );
      
      // Update visibility if needed
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/profile/${userId}/visibility`,
        { profileVisibility },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      
      setUser(data);
      setIsSettingsOpen(false);
      // Reset preview image
      setPreviewImage(null);
      setProfileImage(null);
      
      // Refresh the page to show updated profile
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenDrawer = (type) => {
    setDrawerType(type);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/profile/${userId}`
        );
        setUser(data);
        setPosts(data?.posts);
        const isFollowingCurrent = data.followers.some(
          (fo) => fo._id === current
        );
        setIsFollowing(isFollowingCurrent);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("data");
        localStorage.removeItem("userId");
        navigate("/login");
        console.error("Error fetching profile:", error);
      }
    };
    fetchUserProfile();

    socket.on("delete-post", (deletedPostId) => {
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post._id !== deletedPostId)
      );
    });
    
    return () => {
      socket.off("new-post");
      socket.off("delete-post");
    };
  }, [socket, userId, isFollowing]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/profile/${current}`
        );
        setCurrentUser(data);
        setProfileVisibility(data.profileVisibility);
        setFullName(data.fullName);
        setAboutMe(data.aboutMe || "");
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

  useEffect(() => {
    if (user && user.profileVisibility === "private" && !isFollowing && userId !== current) {
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/follow-requests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(res => {
        const req = res.data.find(r => r.from._id === current && r.to === userId && r.status === "pending");
        if (req) setFollowRequestStatus("pending");
        else setFollowRequestStatus(null);
      })
      .catch(() => setFollowRequestStatus(null));
    }
  }, [user, isFollowing, userId, current]);

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${postId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      socket.emit("delete-post", postId);
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleFollow = async () => {
    // DEBUG: Print token before sending follow request
    const token = localStorage.getItem("token");
    console.log("Token sent:", token);
    // If private, send follow request
    if (user.profileVisibility === "private" && !isFollowing) {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/follow-requests/${userId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFollowRequestStatus("pending");
      } catch (err) {
        alert(err.response?.data?.message || "Failed to send follow request.");
      }
      return;
    }
    // Normal follow/unfollow logic
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/profile/${
          isFollowing ? "unfollow" : "follow"
        }/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser((prevUser) => ({
        ...prevUser,
        followers: isFollowing
          ? prevUser.followers.filter((id) => id !== current)
          : [...prevUser.followers, current],
      }));
      setIsFollowing(!isFollowing);
      socket.emit("follow-user", {
        followerId: current,
        followingId: userId,
        isFollowing: !isFollowing,
      });
    } catch (err) {
      console.error("Error following/unfollowing:", err);
    }
  };

  if (!user)
    return (
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-44 text-center">
        <div className="lg:w-64">
          <Skeleton height={2000} className="w-full" />
        </div>
        <div className="flex-1 px-4 sm:px-10 lg:px-20 pt-4 lg:pt-10 pb-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Skeleton circle height={80} width={80} />
            <div className="flex-1">
              <Skeleton height={24} width="70%" className="mb-2" />
              <Skeleton height={20} width="90%" />
              <div className="flex gap-4 mt-3">
                <Skeleton height={20} width={60} />
                <Skeleton height={20} width={80} />
                <Skeleton height={20} width={80} />
              </div>
              <Skeleton height={36} width={100} className="mt-3" />
            </div>
          </div>
          <div className="mt-8">
            <div className="flex overflow-x-auto gap-2 sm:gap-4 pb-2">
              {["All", "Images", "Videos", "Text", "Document"].map((tab) => (
                <Skeleton key={tab} height={40} width={80} />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} height={200} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-[#f1f5f9] dark:bg-gray-950 dark:text-white">
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

      {/* Left Sidebar (Menu) - Fixed */}
      <div className={`fixed lg:static z-30 h-screen ${isMobileSidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <SideBar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleMobileSidebar}
        ></div>
      )}

      {/* Main Content Area with Fixed Navbar and Scrollable Content */}
      <div className="flex-1 flex flex-col h-screen mt-16 lg:mt-0">
        {/* Fixed Navbar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
          <Navbar />
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-white dark:bg-gray-800 dark:text-white">
          <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-10">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full">
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}${user.image}`}
                alt={user.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border p-1"
              />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold">{user.fullName}</h2>
                <p className="text-gray-500 text-sm sm:text-base">{user.aboutMe}</p>
                <div className="flex justify-center sm:justify-start gap-3 sm:gap-4 mt-2 text-xs sm:text-sm">
                  <span>
                    <strong>{posts?.length}</strong> Posts
                  </span>
                  <span
                    onClick={() => handleOpenDrawer("followers")}
                    className="cursor-pointer"
                  >
                    <strong>{user?.followers?.length}</strong> Followers
                  </span>
                  <span
                    onClick={() => handleOpenDrawer("following")}
                    className="cursor-pointer"
                  >
                    <strong>{user?.following?.length}</strong> Following
                  </span>
                </div>
                {isDrawerOpen && (
                  <FollowersFollowingDrawer
                    user={user}
                    type={drawerType}
                    onClose={handleCloseDrawer}
                  />
                )}
                {userId !== current && isFollowing !== null && (
                  <button
                    onClick={handleFollow}
                    className="mt-3 px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
                    disabled={followRequestStatus === "pending"}
                  >
                    {isFollowing
                      ? "Unfollow"
                      : user?.profileVisibility === "private" && followRequestStatus === "pending"
                        ? "Request Sent"
                        : "Follow"}
                  </button>
                )}
              </div>
            </div>
            <div className="w-full sm:w-auto">
              {userId === current && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full sm:w-auto mt-2 px-3 py-1 sm:px-4 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm sm:text-base flex items-center justify-center gap-1"
                >
                  <CogIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Settings</span>
                </button>
              )}
            </div>
          </div>

          {/* Settings Modal */}
          {isSettingsOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-4 sm:p-6 rounded-lg dark:text-white dark:bg-slate-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg sm:text-xl font-bold mb-4">Profile Settings</h2>
                
                {/* Profile Image */}
                <div className="mb-4">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img 
                          src={`${import.meta.env.VITE_API_BASE_URL}${user?.image}`} 
                          alt={user?.fullName} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <label className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base cursor-pointer">
                        Choose Image
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Full Name */}
                <div className="mb-4">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:text-black"
                    placeholder="Your full name"
                  />
                </div>
                
                {/* About Me */}
                <div className="mb-4">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                    About Me
                  </label>
                  <textarea
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:text-black"
                    rows="3"
                    placeholder="Tell us about yourself"
                  ></textarea>
                </div>
                
                {/* Profile Visibility */}
                <div className="mb-4">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                    Profile Visibility
                  </label>
                  <select
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:text-black"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tab.Group>
            <Tab.List className="flex overflow-x-auto gap-1 sm:gap-2 mt-6 border-b pb-1 scrollbar-hide">
              {[
                { name: "All", icon: <Squares2X2Icon className="w-5 h-5" /> },
                { name: "Images", icon: <PhotoIcon className="w-5 h-5" /> },
                { name: "Videos", icon: <VideoCameraIcon className="w-5 h-5" /> },
                { name: "Text", icon: <DocumentTextIcon className="w-5 h-5" /> },
                { name: "Document", icon: <DocumentIcon className="w-5 h-5" /> },
              ].map((tab) => (
                <Tab
                  key={tab.name}
                  onClick={() => setSelectedTab(tab.name.toLowerCase())}
                  className={({ selected }) =>
                    `flex items-center gap-1 whitespace-nowrap px-3 py-2 text-sm sm:text-base rounded-t-lg ${
                      selected
                        ? "border-b-2 border-blue-500 text-blue-500 dark:text-white"
                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`
                  }
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.name}</span>
                </Tab>
              ))}
            </Tab.List>

            {/* Content based on visibility */}
            {user?.profileVisibility === "public" || userId === current ? (
              <Tab.Panels className="mt-4">
                {["all", "images", "videos", "text", "document"].map((tab) => (
                  <Tab.Panel key={tab}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {posts
                        ?.filter(
                          (post) => tab === "all" || post.type === tab
                        )
                        .map((post) => (
                          <div
                            key={post._id}
                            className="border rounded-lg overflow-hidden bg-white dark:bg-gray-700 relative"
                          >
                            {user._id === current && (
                              <button
                                onClick={() => handleDeletePost(post._id)}
                                className="absolute top-2 right-2 p-1 sm:p-2 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                              >
                                <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            )}
                            
                            {post.type === "image" && (
                              <img
                                src={`${import.meta.env.VITE_API_BASE_URL}${post.content}`}
                                alt="Post"
                                className="w-full h-40 sm:h-48 object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                                }}
                              />
                            )}
                            
                            {post.type === "video" && (
                              <video
                                controls
                                src={`${import.meta.env.VITE_API_BASE_URL}${post.content}`}
                                className="w-full h-40 sm:h-48"
                                onError={(e) => {
                                  console.error("Video failed to load:", e);
                                }}
                              />
                            )}
                            
                            {post.type === "text" && (
                              <div className="p-3 sm:p-4">
                                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                                  {capitalizeAndTruncate(post.content, 150)}
                                </p>
                              </div>
                            )}
                            
                            {post.type === "document" && (
                              <div className="p-3 sm:p-4">
                                <a
                                  href={`${import.meta.env.VITE_API_BASE_URL}${post.content}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline flex items-center gap-2 text-sm sm:text-base"
                                >
                                  <DocumentIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                  Open Document
                                </a>
                                <iframe
                                  src={`${import.meta.env.VITE_API_BASE_URL}${post.content}`}
                                  className="w-full h-40 rounded-lg mt-2"
                                  title="PDF Document"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            ) : (
              currentUser?.following.some((newuser) => newuser._id === userId) && (
                <Tab.Panels className="mt-4">
                  {["all", "images", "videos", "text", "document"].map((tab) => (
                    <Tab.Panel key={tab}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {posts
                          ?.filter(
                            (post) => tab === "all" || post.type === tab
                          )
                          .map((post) => (
                            <div
                              key={post._id}
                              className="border rounded-lg overflow-hidden bg-white dark:bg-gray-700 relative"
                            >
                              {user._id === current && (
                                <button
                                  onClick={() => handleDeletePost(post._id)}
                                  className="absolute top-2 right-2 p-1 sm:p-2 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                                >
                                  <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              )}
                              
                              {post.type === "image" && (
                                <img
                                  src={`${import.meta.env.VITE_API_BASE_URL}${post.content}`}
                                  alt="Post"
                                  className="w-full h-40 sm:h-48 object-cover"
                                />
                              )}
                              
                              {post.type === "video" && (
                                <video
                                  controls
                                  src={post.content}
                                  className="w-full h-40 sm:h-48"
                                />
                              )}
                              
                              {post.type === "text" && (
                                <div className="p-3 sm:p-4">
                                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                                    {capitalizeAndTruncate(post.content, 150)}
                                  </p>
                                </div>
                              )}
                              
                              {post.type === "document" && (
                                <div className="p-3 sm:p-4">
                                  <a
                                    href={`${import.meta.env.VITE_API_BASE_URL}${post.content}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline flex items-center gap-2 text-sm sm:text-base"
                                  >
                                    <DocumentIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    Open Document
                                  </a>
                                  <iframe
                                    src={`${import.meta.env.VITE_API_BASE_URL}${post.content}`}
                                    className="w-full h-40 rounded-lg mt-2"
                                    title="PDF Document"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              )
            )}
          </Tab.Group>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;