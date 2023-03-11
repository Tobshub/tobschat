import "@assets/page.scss";
import store from "@data/zustand";
import { socket } from "@utils/socket";
import { removeToken } from "@utils/token";
import { trpc } from "@utils/trpc";
import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

export default function Page() {
  // load username to context
  loadUserDataToStore();
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

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [isDisconnected, forceConnect] = socketStatus();

  return (
    <>
      {isDisconnected && (
        <div className="alert alert-danger alert-sm py-0">
          <span className=" fs-6 text-muted">Server connection timed out!</span>
          <button className="btn btn-link py-0" onClick={forceConnect}>
            Re-connect
          </button>
        </div>
      )}
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
          <button className="btn btn-danger" onClick={userLogout}>
            LOGOUT
          </button>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}

/** Load the user's email to `UserContext` */
function loadUserDataToStore() {
  const user = trpc.user.getUserPrivate.useQuery(undefined, {
    staleTime: Infinity,
    cacheTime: Infinity,
    onSuccess(data) {
      if (data.ok) {
        store.setAll(data.value);
      }
    },
  });

  return [user.data?.value.username];
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

/** Monitor socket status and let user know if the connection status is bad */
function socketStatus() {
  const [isDisconnected, setIsDisconnected] = useState(false);
  const forceConnect = () => socket.connect();

  useEffect(() => {
    socket.on("disconnect", () => {
      console.log("DISCONN!");
      setIsDisconnected(true);
    });
    socket.on("connect", () => {
      console.log("CONN!");
      setIsDisconnected(false);
    });

    () => {
      socket.off("disconnect");
      socket.off("connect");
    };
  }, []);

  return [isDisconnected, forceConnect] as const;
}

