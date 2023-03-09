import "@assets/page.scss";
import { socket } from "@utils/socket";
import { trpc } from "@utils/trpc";
import UserContext from "context/user";
import { useState, useEffect, useContext } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

export default function Page() {
  // load username to context
  loadUsernameToContext();
  const navigate = useNavigate();

  const roomsQuery = trpc.user.userRooms.useQuery();
  const [rooms, setRooms] = useState(roomsQuery.data?.value ?? []);

  useEffect(() => {
    // FIXIT: refetch when the user is added to a room
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

  // render on initial load
  useEffect(() => {
    if (roomsQuery.data) {
      setRooms(roomsQuery.data.value);
    }
  }, [roomsQuery.isInitialLoading]);

  return (
    <div className={"page"}>
      <header>
        <Link to="/" className="navbar-brand">
          TobsChat
        </Link>
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
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function loadUsernameToContext() {
  const userContext = useContext(UserContext);

  const user = trpc.user.getUsername.useQuery();
  useEffect(() => {
    if (user.data) {
      userContext.setContext("username", user.data.value.username);
    }
  }, [user.data]);

  return [user.data?.value.username];
}

