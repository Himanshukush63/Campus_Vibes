/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "chat-blue": "#007AFF", // Instagram-like blue
        "chat-gray": "#F1F1F1", // Light gray for other user's messages
      },
    },
  },
  plugins: [],
}