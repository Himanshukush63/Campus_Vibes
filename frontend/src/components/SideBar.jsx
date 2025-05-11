// SideBar.jsx
import {
  ArrowLeftOnRectangleIcon,
  EnvelopeIcon,
  HomeIcon,
  UserIcon,
  FilmIcon,
  MegaphoneIcon,
  BellIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import UsersList from "./UsersList";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CreatePostDropdown from "./CreatePostDropdown";
import CreatePostModal from "./CreatePostModal";
import Logo from "../assets/image.png";
import axios from "axios";

function SideBar({ onCloseMobile }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("text");
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  const [isUsersListOpen, setIsUsersListOpen] = useState(false);
  const current = localStorage.getItem("userId");
  const User = JSON.parse(localStorage.getItem("data"));
  const location = useLocation();
  const [hasUnread, setHasUnread] = useState(false);
  const userData = JSON.parse(localStorage.getItem("data"));
  const navigate = useNavigate();

  const isActive = (path, exact = false) => {
    return exact
      ? location.pathname === path
      : location.pathname.startsWith(path);
  };

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  useEffect(() => {
    const fetchUnreadStatus = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/notifications/${
            userData._id
          }`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setHasUnread(data.some((notif) => !notif.read));
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    };

    fetchUnreadStatus();
  }, []);

  const handleCreatePost = (type) => {
    setModalType(type);
    setIsModalOpen(true);
    onCloseMobile?.();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("data");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState);
  };

  return (
    <>
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
      />
      <UsersList 
        isOpen={isUsersListOpen} 
        onClose={() => setIsUsersListOpen(false)} 
      />
      <div
        className={`bg-white dark:text-white dark:bg-gray-950 text-black ${
          isCollapsed ? "w-16" : "w-64"
        } h-full flex flex-col border-r dark:border-gray-800 transition-all duration-300`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <button onClick={onCloseMobile}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Logo and Toggle Button */}
        <div className="mb-8 mt-12 relative flex justify-center items-center h-24 px-4">
          {!isCollapsed && (
            <h1 className="text-2xl font-bold">
              <img src={Logo} alt="logo" style={{ height: "100px" }} />
            </h1>
          )}
          <button
            onClick={toggleSidebar}
            className={`hidden lg:block absolute ${
              isCollapsed ? "right-3" : "right-2"
            } top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-2 px-2">
          {[
            { path: "/", icon: HomeIcon, label: "Home", exact: true },
            { path: "/messages", icon: EnvelopeIcon, label: "Messages" },
            { path: "/usergroups/groups", icon: UsersIcon, label: "Groups" },
            { path: `/profile/${current}`, icon: UserIcon, label: "Profile" },
            { path: "/reels", icon: FilmIcon, label: "Reels" },
            { 
              path: "/notifications", 
              icon: BellIcon, 
              label: "Notifications",
              badge: hasUnread 
            },
            { path: "/announcements", icon: MegaphoneIcon, label: "Announcements" },
            { 
              action: () => setIsUsersListOpen(true),
              icon: UserPlusIcon, 
              label: "Add Friend"
            },
          ].map((item) => 
            item.path ? (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => {
                  onCloseMobile?.();
                  e.stopPropagation();
                }}
                className={`flex items-center ${
                  isCollapsed ? "justify-center" : "pl-4"
                } space-x-2 p-2 rounded-lg ${
                  isActive(item.path, item.exact)
                    ? "bg-gray-100 dark:bg-gray-800 font-semibold"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                title={item.label}
              >
            
              <div className="relative">
                <item.icon className="w-6 h-6" />
                {item.badge && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
              {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={(e) => {
                  onCloseMobile?.();
                  e.stopPropagation();
                  item.action();
                }}
                className={`flex items-center ${
                  isCollapsed ? "justify-center" : "pl-4"
                } space-x-2 p-2 rounded-lg w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800`}
                title={item.label}
              >
                <div className="relative">
                  <item.icon className="w-6 h-6" />
                  {item.badge && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </div>
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            )
          )}

          <div className={`flex items-center ${
            isCollapsed ? "justify-center" : "pl-4"
          } hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg`}>
            <CreatePostDropdown 
              onCreatePost={(type) => {
                handleCreatePost(type);
              }} 
              isCollapsed={isCollapsed}
              onCloseMobile={onCloseMobile}
            />
          </div>
        </nav>

        {/* User Profile and Logout */}
        <div className="mt-auto p-4">
          <button
            onClick={handleLogout}
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "pl-4"
            } space-x-2 p-2 rounded-lg w-full hover:bg-gray-100 dark:hover:bg-gray-800`}
            title="Logout"
          >
            <ArrowLeftOnRectangleIcon className="w-6 h-6" />
            {!isCollapsed && <span>Logout</span>}
          </button>

          {!isCollapsed && (
            <div className="flex items-center space-x-3 mt-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}${User.image}`}
                alt={User.fullName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold">{User.fullName}</p>
                <span className="px-2 py-1 text-sm font-medium text-white bg-green-500 rounded-full">
                  {User.type}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SideBar;