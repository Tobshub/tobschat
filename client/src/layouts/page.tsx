import "@assets/page.scss";
import store from "@data/zustand";
import { socket } from "@utils/socket";
import { trpc } from "@utils/trpc";
import { SidebarComponent } from "./components/sidebar";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { getToken } from "@utils/token";

export default function Page() {
  // load username to context
  loadUserDataToStore();

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
        <div>
          <div className="sidebar-toggler" onClick={() => setSidebarOpen((state) => !state)}>
            <button className="btn py-0" style={{ fontSize: "2rem" }}>
              {sidebarOpen ? "<=" : "=>"}
            </button>
          </div>
          <SidebarComponent sidebarOpen={sidebarOpen} />
        </div>
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

