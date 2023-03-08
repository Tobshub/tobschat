import { RouterProvider, createBrowserRouter } from "react-router-dom";
import IndexPage, { indexPageLoader } from "./pages";
import TRPCProvider from "@utils/trpc";
import { useEffect } from "react";
import { socket } from "@utils/socket";
import { SignUpPage } from "@pages/auth/signup";
import { LoginPage } from "@pages/auth/login";
import { CreateRoomPage } from "@pages/rooms/create-room";
import { RoomPage, roomPageLoader } from "@pages/rooms/room";

const router = createBrowserRouter([
  { index: true, loader: indexPageLoader, element: <IndexPage /> },
  {
    path: "/room",
    children: [
      { path: "create", element: <CreateRoomPage /> },
      { path: ":id", loader: roomPageLoader, element: <RoomPage /> },
    ],
  },
  {
    path: "/auth",
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "sign-up", element: <SignUpPage /> },
    ],
  },
]);

export default function App() {
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  });
  return (
    <TRPCProvider>
      <RouterProvider router={router} />
    </TRPCProvider>
  );
}

