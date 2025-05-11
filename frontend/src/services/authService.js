// services/authService.js
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/users`; // Backend API URL

// Register user
const register = async (formData) => {
  const response = await axios.post(`${API_URL}/register`, formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Set content type for file upload
    },
  });
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  return response.data;
};

const authService = { register, login };

export default authService;