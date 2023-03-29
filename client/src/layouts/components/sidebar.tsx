import { socket } from "@utils/socket";
import { removeToken } from "@utils/token";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { IconContext } from "react-icons";
import { BsFillChatDotsFill } from "react-icons/bs";
import { FaUserFriends } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { AiFillHome } from "react-icons/ai";
import { FiSettings } from "react-icons/fi";
import store from "@data/zustand";
import { PropsWithChildren } from "react";

export function SidebarComponent(props: { sidebarOpen: boolean }) {
  const userLogout = useLogout();
  return (
    <header style={{ display: props.sidebarOpen ? undefined : "none" }}>
      <IconContext.Provider value={{ className: "react-icons text-light" }}>
        <nav className="navbar">
          <ul className="navbar-nav text-light">
            <SideBarNavLink to="/" title="home">
              <AiFillHome />{" "}
              <span className="lg-screen-only text-light">TobsChat</span>
            </SideBarNavLink>            
            <SideBarNavLink to="/room/list" title="your rooms">
              <BsFillChatDotsFill />{" "}
              <span className="lg-screen-only text-light">ROOMS</span>
            </SideBarNavLink>
            <SideBarNavLink to="/user/friends" title="user friends">
              <FaUserFriends />{" "}
              <span className="lg-screen-only text-light">FRIENDS</span>
            </SideBarNavLink>
            <SideBarNavLink to="/user/settings" title="user settings">
              <FiSettings /> <span className="lg-screen-only text-light">SETTINGS</span>
            </SideBarNavLink>
          </ul>
        </nav>
        <button className="btn btn-danger" onClick={userLogout} title="logout">
          <MdLogout /> <span className="lg-screen-only">LOGOUT</span>
        </button>
      </IconContext.Provider>
    </header>
  );
}

function SideBarNavLink({to, children, title}: PropsWithChildren & {to: string, title: string}) {
  return (
    <li className="nav-item" title={title}>
      <NavLink to={to} className={({isActive}) => `nav-link text-light ${isActive ? "sidebar-active" : ""}`}>
        {children}
      </NavLink>
    </li>
  )
}

/** Logout from the App
 *
 * Remove the user token from storage
 *
 * Stop listening to all socket events
 */
export function useLogout() {
  const navigate = useNavigate();
  return () => {
    removeToken();
    store.reset();
    socket.offAny();
    socket.emit("user:logout");
    navigate("/auth/login");
  };
}
