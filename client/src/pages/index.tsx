import { socket } from "@utils/socket";
import { getToken } from "@utils/token";
import { trpc } from "@utils/trpc";
import { useEffect, useRef, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";

export async function indexPageLoader() {
  const token = getToken();
  if (!token) {
    return redirect("/auth/sign-up");
  }
  return null;
}

export default function IndexPage() {
  // const roomInput = useRef<HTMLInputElement>(null);
  // const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);

  // const newRoom = () => {
  //   console.log("attempting to create new room");
  //   const room = { id: crypto.randomUUID(), name: roomInput.current?.value as string };
  //   setRooms((state) => [...state, room]);
  //   socket.emit("new room", room);
  //   socket.on("room created", console.log);
  // };
  // const inputRef = useRef<HTMLInputElement>(null);
  // const newMessage = () => {
  //   socket.emit("message", { content: inputRef.current?.value, id: "string" });
  //   socket.on("message sent", console.log);
  // };

  // useEffect(() => {
  //   socket.on("new message", console.log);
  //   socket.on("created room", (room) => setRooms((state) => [...state, room]));
  //   // clean up socket connections
  //   return () => {
  //     socket.off("new message");
  //     socket.off("created room");
  //     socket.off("creating room...");
  //     socket.off("message sent");
  //   };
  // }, []);

  const roomsQuery = trpc.user.userRooms.useQuery();

  useEffect(() => {
    socket.emit("user:load", getToken());
  }, []);

  return (
    <div>
      <h1>TobsChat</h1>
      {roomsQuery.isLoading ? (
        <>Loading...</>
      ) : (
        <ul>
          {roomsQuery.data && roomsQuery.data.data.length ? (
            roomsQuery.data.data.map((room) => (
              <li key={room.id}>
                <button className="btn btn-outline-secondary">{room.name}</button>
              </li>
            ))
          ) : (
            <>Nothing to see here...</>
          )}
        </ul>
      )}
    </div>
  );
}

