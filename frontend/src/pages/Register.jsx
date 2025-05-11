import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import authService from "../services/authService";
import LogoBannerRegister from "../assets/register.png";

// Validation schema
const schema = yup.object().shape({
  fullName: yup
    .string()
    .required("Full name is required")
    .matches(/^(?=.*[A-Za-z])[A-Za-z0-9@-]+$/, "Name must contain at least one letter and can include letters, numbers, hyphens, or @ symbols"),
  email: yup
    .string()
    .email("Invalid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  image: yup
    .mixed()
    .optional()
    .test("fileType", "Only image files are allowed", (value) => {
      if (!value || !value[0]) return true; // Skip validation if no file
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      return allowedTypes.includes(value[0].type);
    }),
  aboutMe: yup
    .string()
     .optional(),
  gender: yup
    .string()
    .oneOf(["male", "female", "other"], "Invalid gender")
    .required("Gender is required"),
  type: yup
    .string()
    .oneOf(["student", "faculty"], "Invalid type")
    .required("Type is required"),
  document: yup
    .mixed()
    .required("Document is required")
    .test("fileType", "Only PDF or image files are allowed", (value) => {
      if (!value || !value[0]) return false;
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      return allowedTypes.includes(value[0].type);
    }),
});

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const navigate = useNavigate();

  // const onSubmit = async (data) => {
  //   setIsLoading(true);
  //   try {
  //     const formData = new FormData();
  //     formData.append("fullName", data.fullName);
  //     formData.append("email", data.email);
  //     formData.append("password", data.password);
  //     formData.append("aboutMe", data.aboutMe);
  //     formData.append("gender", data.gender);
  //     if (data.image[0]) {
  //       formData.append("image", data.image[0]);
  //     }

  //     const response = await authService.register(formData);
  //     console.log("Registration successful:", response);
  //     navigate("/login");
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Registration failed");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("aboutMe", data.aboutMe);
      formData.append("gender", data.gender);
      formData.append("type", data.type);

      // Append image only if provided, otherwise let backend use default
    if (data.image && data.image[0]) {
      formData.append("image", data.image[0]);
    }
      if (data.document[0]) {
        formData.append("document", data.document[0]);
      }

      const response = await authService.register(formData);
      console.log("Registration successful:", response);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-7xl w-full flex flex-col md:flex-row">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:w-1/2 p-8 flex items-center justify-center bg-gray-100"
        >
          <img
            src={LogoBannerRegister}
            alt="Register Illustration"
            className="max-w-full h-auto"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:w-1/2 p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-600">Join our social community</p>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-center mb-4"
            >
              {error}
            </motion.p>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex justify-between gap-5">
              <div className="w-full space-y-2">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="fullName"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    {...register("fullName")}
                    className={`w-full px-3 py-2 border ${
                      errors.fullName ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={`w-full px-3 py-2 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...register("password")}
                    className={`w-full px-3 py-2 border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Create a password"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="image"
                  >
                    Profile Image
                  </label>
                  <input
                    id="image"
                    type="file"
                    {...register("image")}
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview || "/default-avatar.jpg"} // Path to your default avatar
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="gender"
                  >
                    Gender
                  </label>
                  <select
                    id="gender"
                    {...register("gender")}
                    className={`bg-white w-full px-3 py-2 border ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="w-full space-y-2">
                {/* Type Field */}
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="type"
                  >
                    Type
                  </label>
                  <select
                    id="type"
                    {...register("type")}
                    className={`bg-white w-full px-3 py-2 border ${
                      errors.type ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  >
                    <option value="">Select Type</option>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.type.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="aboutMe"
                  >
                    About Me
                  </label>
                  <textarea
                    id="aboutMe"
                    {...register("aboutMe")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                    placeholder="Tell us about yourself"
                  />
                </div>
                {/* Document Field */}
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="document"
                  >
                    Verification Document
                  </label>
                  <input
                    id="document"
                    type="file"
                    {...register("document")}
                    accept="image/*, application/pdf"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {errors.document && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.document.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200 ease-in-out ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-purple-600 hover:text-purple-500 transition duration-150 ease-in-out"
            >
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
