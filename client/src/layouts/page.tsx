import "@assets/page.scss";
import { socket } from "@utils/socket";
import { removeToken } from "@utils/token";
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

  const logoutMut = useLogout();

  // render on initial load
  useEffect(() => {
    if (roomsQuery.data) {
      setRooms(roomsQuery.data.value);
    } else if (
      roomsQuery.error?.message === "user not found" ||
      roomsQuery.error?.message === "failed to validate token"
    ) {
      // force logout on not found || validation errors
      logoutMut();
    }
  }, [roomsQuery.isInitialLoading]);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={"page"}>
      <div className="header-toggle" onClick={() => setSidebarOpen((state) => !state)}>
        {sidebarOpen ? "<=" : "=>"}
      </div>
      <header style={{ display: sidebarOpen ? "block" : "none" }}>
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
        <button className="btn btn-danger" onClick={logoutMut}>
          LOGOUT
        </button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function loadUsernameToContext() {
  const userContext = useContext(UserContext);

  const user = trpc.user.getUser.useQuery();
  useEffect(() => {
    if (user.data) {
      userContext.setContext("email", user.data.value.email);
    }
  }, [user.data]);

  return [user.data?.value.email];
}

function useLogout() {
  const navigate = useNavigate();
  return () => {
    removeToken();
    navigate("/auth/login");
  };
}

