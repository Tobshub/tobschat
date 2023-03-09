import { socket } from "@utils/socket";
import { getToken } from "@utils/token";
import { useEffect } from "react";
import { redirect } from "react-router-dom";

export async function indexPageLoader() {
  const token = getToken();
  if (!token) {
    return redirect("/auth/sign-up");
  }
  return null;
}

export default function IndexPage() {
  // user joins a room with their id
  useEffect(() => {
    socket.emit("user:load", getToken());
  }, []);

  return (
    <div>
      <h2>Welcome to Tobschat</h2>
    </div>
  );
}

