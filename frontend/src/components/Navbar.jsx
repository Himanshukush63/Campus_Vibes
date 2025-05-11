import { Link } from "react-router-dom";
import Logo from "../assets/image.png";
import DarkModeToggle from "./ DarkModeToggle";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const User = JSON.parse(localStorage.getItem("data"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("data");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-950 dark:text-white shadow-md p-2 h-16 flex justify-between items-center border-b-4 dark:border-gray-950">
      <div className="flex items-center space-x-3">
        <p className="text-sm font-semibold">{User?.fullName}</p>
        <span className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
          {User?.type}
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <DarkModeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
