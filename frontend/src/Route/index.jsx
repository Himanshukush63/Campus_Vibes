import React, { lazy } from "react";
import Community from "../Admin/partials/community/Community";
import Posts from "../Admin/partials/posts/Posts";
import { elements } from "chart.js";

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Landing = lazy(() => import("../pages/Landing"));
const Reels = lazy(() => import("../pages/Reels"));
const Notifications = lazy(() => import("../pages/Notifications"));
const Home = lazy(() => import("../pages/Home"));
const Messages = lazy(() => import("../pages/Messages"));
const Profile = lazy(() => import("../pages/Profile"));
const Announcements = lazy(() => import("../pages/Announcements"));
const Dashboard = lazy(() => import("../Admin/pages/Dashboard"));
const ContentModeration = lazy(() =>
  import("../Admin/partials/contentModeration/ContentModeration")
);
const CreateGroup = lazy(() =>
  import("../Admin/partials/groupsChats/CreateGroup")
);
const GroupChat = lazy(() => import("../Admin/partials/groupsChats/GroupChat"))
const Groups = lazy(() => import("../Admin/partials/groupsChats/Groups"))
const UserGroups = lazy(() => import("../pages/UserGroups"))
const PublicRoute = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/Welcome",
    element: <Landing />,
  },
];

const UserRoute = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/messages",
    element: <Messages />,
  },
  {
    path: "/profile/:userId",
    element: <Profile />,
  },
  {
    path: "/reels",
    element: <Reels />,
  },
  {
    path: "/announcements",
    element: <Announcements />,
  },
  {
    path: "/notifications",
    element: <Notifications />,
  },
  {
    path:"/usergroups/groups",
    element: <UserGroups/>
  }
];

const AdminRoute = [
  {
    path: "/admin",
    element: <Dashboard />,
  },
  {
    path: "/community",
    element: <Community />,
  },
  {
    path: "/posts",
    element: <Posts />,
  },
  {
    path: "/contentModeration",
    element: <ContentModeration />,
  },
  {
    path: "/createGroup",
    element: <CreateGroup />,
  },
  {
    path: "/groupchat",
    element: <GroupChat />,
  },
  {
    path: "/groups",
    element: <Groups/>
  }
];

export { PublicRoute, UserRoute, AdminRoute };
