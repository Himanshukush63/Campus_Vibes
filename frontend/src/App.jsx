import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Loader } from "./components/Loader";
import { AdminRoute, PublicRoute, UserRoute } from "./Route";
import { AdminMiddleware, PublicMiddleware, UserMiddleware } from "./Route/Middlewares";
import NotFound from "./pages/NotFound"; // Import your 404 page component
import axios from "axios";

const App = () => {
  useEffect(() => {
    // Record a visit when the app loads
    axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/traffic/record-visit`);
  }, []);

  
  useEffect(() => {
    const pingInterval = setInterval(() => {
      axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/ping`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    }, 30 * 1000); // Ping every 1 minute

    return () => clearInterval(pingInterval); // Cleanup on unmount
  }, []);


  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes with Middleware */}
          {PublicRoute?.map((item, index) => (
            <Route
              key={index}
              path={item.path}
              element={<PublicMiddleware>{item.element}</PublicMiddleware>}
            />
          ))}

          {/* User Routes with Middleware */}
          {UserRoute?.map((item, index) => (
            <Route
              key={index}
              path={item.path}
              element={<UserMiddleware>{item.element}</UserMiddleware>}
            />
          ))}

          {/* Admin Routes with Middleware */}
          {AdminRoute?.map((item, index) => (
            <Route
              key={index}
              path={item.path}
              element={<AdminMiddleware>{item.element}</AdminMiddleware>}
            />
          ))}

          {/* 404 - Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
