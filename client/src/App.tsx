import { RouterProvider, createBrowserRouter } from "react-router-dom";
import TRPCProvider from "@utils/trpc";
import { Suspense, lazy, useEffect } from "react";
import { socket } from "@utils/socket";
import { ErrorPage } from "@pages/error";

// import route loaders
import {
  landingPageLoader,
  roomPageLoader,
  indexPageLoader,
  publicProfilePageLoader,
} from "@pages/loaders";
// lazy import pages
const LandingPage = lazy(() => import("@pages/landing"));
const IndexPage = lazy(() => import("./pages"));
const SignUpPage = lazy(() => import("@pages/auth/signup"));
const LoginPage = lazy(() => import("@pages/auth/login"));
const CreateRoomPage = lazy(() => import("@pages/rooms/create-room"));
const Page = lazy(() => import("layouts/page"));
const RoomListPage = lazy(() => import("@pages/rooms/room-list"));
const RoomPage = lazy(() => import("@pages/rooms/room"));
const FriendsPage = lazy(() => import("@pages/user/friends"));
const PublicProfilePage = lazy(() => import("@pages/user/public-profile"));
const SettingsPage = lazy(() => import("@pages/user/settings"));

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
      <Suspense fallback={<>Loading...</>}>
        <RouterProvider router={router} />
      </Suspense>
    </TRPCProvider>
  );
}

// TODO: start group chat with a list of friends + able to add more
