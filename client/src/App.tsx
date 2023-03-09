import { RouterProvider, createBrowserRouter } from "react-router-dom";
import IndexPage, { indexPageLoader } from "./pages";
import TRPCProvider, { trpc } from "@utils/trpc";
import { useEffect, useState } from "react";
import { socket } from "@utils/socket";
import { SignUpPage } from "@pages/auth/signup";
import { LoginPage } from "@pages/auth/login";
import { CreateRoomPage } from "@pages/rooms/create-room";
import { RoomPage, roomPageLoader } from "@pages/rooms/room";
import Page from "layouts/page";
import UserContext from "context/user";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Page />,
    loader: indexPageLoader /* go to /auth if token is missing */,
    children: [
      { index: true, element: <IndexPage /> },
      {
        path: "/room",
        children: [
          { path: "create", element: <CreateRoomPage /> },
          { path: ":id", loader: roomPageLoader, element: <RoomPage /> },
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
]);

export default function App() {
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  const [email, setEmail] = useState("");
  const setContext = (key: string, value: string) => {
    if (key === "email") {
      setEmail(value);
    }
  };

  return (
    <TRPCProvider>
      <UserContext.Provider value={{ email, setContext }}>
        <RouterProvider router={router} />
      </UserContext.Provider>
    </TRPCProvider>
  );
}

