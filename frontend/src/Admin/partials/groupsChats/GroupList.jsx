import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function GroupList() {
  const [groups, setGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState(new Set()); // Track joined groups
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/groups`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setGroups(response.data);

        // Check if the user is already in a group (from localStorage or previous session)
        const savedJoinedGroups = JSON.parse(localStorage.getItem("joinedGroups")) || [];
        setJoinedGroups(new Set(savedJoinedGroups));
      } catch (error) {
        setError("No Groups Found");
      }
    };
    fetchGroups();
  }, []);

  const handleJoinGroup = async (groupId) => {
    if (joinedGroups.has(groupId)) return; // Prevent duplicate joins

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/groups/${groupId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update local state and save joined groups to localStorage
      const updatedJoinedGroups = new Set(joinedGroups).add(groupId);
      setJoinedGroups(updatedJoinedGroups);
      localStorage.setItem("joinedGroups", JSON.stringify([...updatedJoinedGroups]));

      navigate(`/usergroups/groups`);
    } catch (error) {
      console.error("No Groups Found", error);
    }
  };

  return (
    <div className="w-64 mt-6 mx-auto p-4 bg-white dark:bg-gray-800 shadow-md rounded-xl">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 text-center">
        Groups
      </h2>

      {error && <p className="text-red-500 text-xs text-center">{error}</p>}

      <div className="space-y-3">
        {groups.map((group) => (
          <div
            key={group._id}
            className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700"
          >
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {group.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
              {group.description}
            </p>
            <button
              onClick={() => handleJoinGroup(group._id)}
              disabled={joinedGroups.has(group._id)}
              className={`mt-2 w-full text-xs p-1.5 rounded-lg font-medium transition ${
                joinedGroups.has(group._id)
                  ? "bg-gray-400 text-gray-700 dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              }`}
            >
              {joinedGroups.has(group._id) ? "Joined" : "Join"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GroupList;
