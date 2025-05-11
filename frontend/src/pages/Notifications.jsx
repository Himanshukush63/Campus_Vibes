import React, { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import Navbar from "../components/Navbar";
import { BellIcon, Bars3Icon } from "@heroicons/react/24/outline";
import io from "socket.io-client";
import axios from "axios";

const socket = io(import.meta.env.VITE_API_BASE_URL);

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem("data"));

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  useEffect(() => {
    fetchNotifications();
    socket.on(`notification:${userData._id}`, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => {
      socket.off(`notification:${userData._id}`);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/notifications/${
          userData._id
        }`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] flex-col lg:flex-row dark:bg-gray-950">
      {/* Mobile Navbar with hamburger menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button onClick={toggleMobileSidebar}>
            <Bars3Icon className="w-6 h-6 dark:text-white" />
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

      {/* Main Content Area */}
      <div className="w-full lg:w-[85%] mt-16 lg:mt-0 overflow-y-auto no-scrollbar">
        {/* Desktop Navbar */}
        <div className="hidden lg:block">
          <Navbar />
        </div>

        <div className="flex-1 p-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2 dark:text-white">
            <BellIcon className="h-6 w-6 text-blue-600" /> Notifications
          </h2>
          <div className="mt-4 space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="bg-white p-4 rounded-lg shadow flex items-center justify-between gap-4 dark:text-white dark:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${
                        notification.fromUser?.image
                      }`}
                      alt="Sender"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <p className="text-gray-700 dark:text-white">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6">
                <img
                  src="https://illustrations.popsy.co/violet/crashed-error.svg"
                  alt="No Notifications"
                  className="w-60 h-60"
                />
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mt-4">
                  No notifications yet
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Your notifications will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;