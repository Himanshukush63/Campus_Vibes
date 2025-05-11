import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FollowersFollowingDrawer = ({ user, type, onClose }) => {
    const [list, setList] = useState(type === "followers" ? user.followers : user.following);

    return (
        <AnimatePresence>
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={onClose} // Close drawer when clicking outside
            >
                <motion.div
                    key="drawer"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "tween", duration: 0.3 }}
                    className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the drawer
                >
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-bold">{type === "followers" ? "Followers" : "Following"}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-4 overflow-y-auto no-scrollbar">
                        {list.map((user) => (
                            <div key={user._id} className="flex items-center space-x-4 mb-4">
                                <img
                                    src={`${import.meta.env.VITE_API_BASE_URL}${user.image}`}
                                    alt={user.fullName}
                                    className="w-10 h-10 rounded-full"
                                />
                                <span className="font-medium">{user.fullName}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FollowersFollowingDrawer;