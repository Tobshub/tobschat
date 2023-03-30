import "@assets/page.scss";
import store from "@data/zustand";
import { socket } from "@utils/socket";
import { trpc } from "@utils/trpc";
import { SidebarComponent } from "./components/sidebar";
import { Suspense, useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { getToken } from "@utils/token";
import permissions from "@data/permission";

export default function Page() {
  // load username to context
  loadUserDataToStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [isDisconnected, forceConnect] = socketStatus();

  return (
    <>
      {isDisconnected && (
        <div className="alert alert-danger alert-sm py-0 rounded-bottom">
          <span className=" fs-6 text-muted">Server connection timed out!</span>
          <button className="btn btn-link py-0" onClick={forceConnect}>
            Re-connect
          </button>
        </div>
      )}
      <RequestNotificationComponent />
      <div className={"page"}>
        <div className="sidebar">
          <div
            className="sidebar-toggler"
            onClick={() => setSidebarOpen((state) => !state)}
          >
            <button className="btn py-0" style={{ fontSize: "2rem" }}>
              {sidebarOpen ? "<=" : "=>"}
            </button>
          </div>
          <SidebarComponent sidebarOpen={sidebarOpen} />
        </div>
        <main>
          <Suspense fallback={<>Loading...</>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </>
  );
}

function RequestNotificationComponent() {
  const [hasNotificationAccess, setHasNotificationAccess] = permissions.use("notifications");
  useEffect(() => {
    Notification.permission === "granted"? setHasNotificationAccess(state => ({...state, all: true})) : null;
  }, [])
  if (hasNotificationAccess.all) {
    return null;
  }
  return (
    <div className="alert alert-warning alert-sm py-0 rounded-0">
      <small>
        <Link to={"/user/settings#notifications"}>Turn on Notifications</Link>{" "}
        to know when you have a message.
      </small>
    </div>
  )
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

  useEffect(() => {
    if (user.data && user.data.ok) {
      store.setAll(user.data.value);
    }
  }, [user.data]);

  return [user.data?.value];
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
      socket.emit("user:load", getToken());
      setIsDisconnected(false);
    });

    () => {
      socket.off("disconnect");
      socket.off("connect");
    };
  }, []);

  return [isDisconnected, forceConnect] as const;
}
