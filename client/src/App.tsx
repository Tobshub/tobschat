import { RouterProvider, createBrowserRouter } from "react-router-dom";
import IndexPage, { indexPageLoader } from "./pages";
import TRPCProvider from "@utils/trpc";
import { useEffect } from "react";
import { socket } from "@utils/socket";
import { SignUpPage } from "@pages/auth/signup";
import { LoginPage } from "@pages/auth/login";
import { CreateRoomPage } from "@pages/rooms/create-room";
import { RoomPage, roomPageLoader } from "@pages/rooms/room";
import Page from "layouts/page";
import { RoomListPage } from "@pages/rooms/room-list";
import FriendsPage from "@pages/user/friends";
import {
  PublicProfilePage,
  publicProfilePageLoader,
} from "@pages/user/public-profile";
import { LandingPage, landingPageLoader } from "@pages/landing";
import { SettingsPage } from "@pages/user/settings";
import { ErrorPage } from "@pages/error";

// TODO: Support for user's to edit their account information
// Notifications when you receive a message
// Friends' online status
// Usage instructions on the landing page
const router = createBrowserRouter([
  {
    path: "/",
    element: <Page />,
    errorElement: <ErrorPage />,
    loader: indexPageLoader /* go to /auth if token is missing */,
    children: [
      { index: true, element: <IndexPage /> },
      {
        path: "/room",
        children: [
          { path: "list", element: <RoomListPage /> },
          { path: "create", element: <CreateRoomPage /> },
          { path: ":blob", loader: roomPageLoader, element: <RoomPage /> },
        ],
      },
      {
        path: "/user",
        children: [
          { path: "friends", element: <FriendsPage /> },
          {
            path: "@/:publicId",
            loader: publicProfilePageLoader,
            element: <PublicProfilePage />,
          },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: "/auth",
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "sign-up", element: <SignUpPage /> },
    ],
  },
  {
    path: "/about",
    loader: landingPageLoader,
    element: <LandingPage />,
  },
]);

export default function App() {
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <TRPCProvider>
      <RouterProvider router={router} />
    </TRPCProvider>
  );
}

// TODO: start group chat with a list of friends + able to add more
