import { createBrowserRouter, Navigate } from "react-router-dom";
import ChatPage from "./layouts/Chat";
import Auth from "./layouts/auth";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";


export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />,
    children: [
      { path: "sign-in", element: <SignIn /> },
      { path: "sign-up", element: <SignUp /> },
      { path: "*", element: <Navigate to="/auth/sign-in" replace /> },

    ],
  },
  {
    path: "/chat",
    element: <ChatPage />,
  },

  // root
  {
    path: "/",
    element: <Navigate to="/auth/sign-in" replace />,
  },

  // 404
  {
    path: "*",
    element: <Navigate to="/auth/sign-in" replace />,
  },
]);

export default router;