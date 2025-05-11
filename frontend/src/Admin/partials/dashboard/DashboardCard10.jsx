import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Trash } from "lucide-react"; // Import icons

function DashboardCard10() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // Selected user for modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/users?page=${page}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        // Refresh the user list after deletion
        fetchUsers(pagination.currentPage);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleApproval = async (userId, status) => {
    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/admin/users/${userId}/approval`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchUsers(pagination.currentPage);
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  // Open modal with user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  return (
    <div className="col-span-full xl:col-span-6 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
      <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">
          Users
        </h2>
      </header>
      <div className="p-3">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 dark:bg-opacity-50">
              <tr>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Name</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Email</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Gender</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-center">CreatedAt</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-center">Actions</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 shrink-0 mr-2 sm:mr-3 rounded-[100%] overflow-hidden">
                          <img
                            className="rounded-full"
                            src={`${import.meta.env.VITE_API_BASE_URL}${
                              user.image
                            }`}
                            width="40"
                            height="40"
                            alt={user.fullName}
                          />
                        </div>
                        <div className="font-medium text-slate-800 dark:text-slate-100">
                          {user.fullName}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap dark:text-slate-100">
                      <div className="text-left">{user.email}</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-left font-medium text-green-500">
                        {user.gender}
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-lg text-center dark:text-slate-100">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap flex items-center gap-3">
                      {!user.isApproved ? (
                        <>
                          <button
                            onClick={() => handleApproval(user._id, true)}
                            className="mr-2 px-2 py-1 bg-green-500 text-white rounded"
                          >
                            Approve
                          </button>
                          {/* <button
                            onClick={() => handleApproval(user._id, false)}
                            className="px-2 py-1 bg-red-500 text-white rounded"
                          >
                            Decline
                          </button> */}
                        </>
                      ) : (
                        <span className="text-green-600 font-semibold">
                          Approved
                        </span>
                      )}

                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Eye size={20} />
                      </button>
                      {/* Delete user */}
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 bg-slate-200 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 bg-slate-200 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-96 max-w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              User Details
            </h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Name:</strong> {selectedUser.fullName}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Gender:</strong> {selectedUser.gender}
              </p>
              <p>
                <strong>Type:</strong> {selectedUser.type}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedUser.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Show Document if Available */}
            {selectedUser.document ? (
              <div className="mt-4">
                <p className="font-semibold text-gray-800">
                  Uploaded Document:
                </p>
                {selectedUser.document.endsWith(".pdf") ? (
                  <a
                    href={`${import.meta.env.VITE_API_BASE_URL}${
                      selectedUser.document
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline block mt-1"
                  >
                    View PDF Document
                  </a>
                ) : (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}${
                      selectedUser.document
                    }`}
                    alt="Uploaded Document"
                    className="mt-2 w-full max-h-48 object-cover rounded-lg border"
                  />
                )}
              </div>
            ) : (
              <p className="text-red-500 mt-3">No document uploaded</p>
            )}

            {/* Close Button */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardCard10;
