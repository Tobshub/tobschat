import { socket } from "@utils/socket";
import { trpc } from "@utils/trpc";
import { useLogout } from "@layouts/components/sidebar";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import store from "@data/zustand";

export function RoomListPage() {
  const navigate = useNavigate();
  const userLogout = useLogout();
  const publicId = store.get("publicId");
  const roomsQuery = trpc.user.userRooms.useQuery();
  const [rooms, setRooms] = useState(roomsQuery.data?.value ?? []);

  useEffect(() => {
    socket.on("room:new", (room) => {
      setRooms((state) => [...state, room]);
    });
    return () => {
      socket.off("room:new");
    };
  }, []);

  // render on initial load
  useEffect(() => {
    if (roomsQuery.data) {
      setRooms(roomsQuery.data.value);
    } else if (
      roomsQuery.error?.message === "user not found" ||
      roomsQuery.error?.message === "failed to validate token"
    ) {
      // force logout on not found || validation errors
      userLogout();
    }
  }, [roomsQuery.isInitialLoading]);

  return (
    <div>
      <h1>Your Rooms</h1>

      <Link to={"/room/create"} className="btn btn-warning mb-2">
        NEW ROOM
      </Link>
      <ul className="navbar-nav">
        {rooms.length
          ? rooms.map((room) => (
              <li key={room.blob}>
                <Link to={`/room/${room.blob}`} className="btn btn-outline-secondary mb-3">
                  <div style={{ textAlign: "left" }}>
                    <strong style={{ display: "block", textTransform: "capitalize" }}>
                      {room.type === "GROUP"
                        ? room.name
                        : // room name in private rooms will be other user's username
                          room.members.find((member) => member.publicId !== publicId)?.username}
                    </strong>
                    <small>{room.members.map((member) => member.username).join(" | ")}</small>
                  </div>
                </Link>
              </li>
            ))
          : "You aren't in any rooms yet."}
      </ul>
    </div>
  );
}

