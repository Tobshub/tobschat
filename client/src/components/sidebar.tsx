import { socket } from "@utils/socket";
import { removeToken } from "@utils/token";
import { trpc } from "@utils/trpc";
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export function SidebarComponent(props: { sidebarOpen: boolean }) {
  const navigate = useNavigate();

  const roomsQuery = trpc.user.userRooms.useQuery();
  const [rooms, setRooms] = useState(roomsQuery.data?.value ?? []);

  useEffect(() => {
    socket.on("room:new", () => {
      roomsQuery.refetch().then(({ data }) => {
        if (data) {
          setRooms(data.value);
        }
      });
    });
    return () => {
      socket.off("room:new");
    };
  }, []);

  const userLogout = useLogout();

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
    <header style={{ display: props.sidebarOpen ? "block" : "none" }}>
      <h1>
        <Link to="/" className="navbar-brand">
          TobsChat
        </Link>
      </h1>
      <button onClick={() => navigate("/room/create")} className="btn btn-warning">
        NEW ROOM
      </button>
      <nav className="navbar">
        {roomsQuery.isInitialLoading ? (
          <>Loading...</>
        ) : (
          <ul className="navbar-nav">
            {rooms.length ? (
              rooms.map((room) => (
                <li key={room.id} className="nav-item">
                  <NavLink
                    to={`/room/${room.id}`}
                    className={({ isActive }) => `${isActive ? "bg-primary" : ""} nav-link px-2`}
                  >
                    {room.name}
                  </NavLink>
                </li>
              ))
            ) : (
              <>Nothing to see here...</>
            )}
          </ul>
        )}
      </nav>
      <button className="btn btn-danger" onClick={userLogout}>
        LOGOUT
      </button>
    </header>
  );
}

/** Logout from the App
 *
 * Remove the user token from storage
 *
 * Stop listening to all socket events
 */
function useLogout() {
  const navigate = useNavigate();
  return () => {
    removeToken();
    socket.offAny();
    socket.emit("user:logout");
    navigate("/auth/login");
  };
}

