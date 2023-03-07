import { socket } from "@utils/socket";
import { getToken } from "@utils/token";
import { trpc } from "@utils/trpc";
import { useEffect } from "react";
import { redirect, useNavigate } from "react-router-dom";

export async function indexPageLoader() {
  const token = getToken();
  if (!token) {
    return redirect("/auth/sign-up");
  }
  return null;
}

export default function IndexPage() {
  const navigate = useNavigate();
  // user joins a room with their id
  useEffect(() => {
    socket.emit("user:load", getToken());
  }, []);

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
    // refetch when the user is added to a room
    socket.on("room:new", () => {
      roomsQuery.refetch();
    });
    return () => {
      socket.off("room:new");
    };
  }, []);

  return (
    <div className="page">
      <h1>TobsChat</h1>
      <button onClick={() => navigate("/room/create")}>NEW ROOM</button>
      {roomsQuery.isInitialLoading ? (
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

