import { socket } from "@utils/socket";
import { removeToken } from "@utils/token";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {IconContext} from "react-icons";
import {BsFillChatDotsFill} from "react-icons/bs";
import {FaUserFriends} from "react-icons/fa";
import {MdAccountCircle, MdLogout, MdOutlineHome} from "react-icons/md";
import {AiFillHome} from "react-icons/ai"

export function SidebarComponent(props: { sidebarOpen: boolean }) {

  const userLogout = useLogout();
  return (
    <header style={{ display: props.sidebarOpen ? undefined : "none" }}>
      <IconContext.Provider value={{className: "react-icons text-light"}} >
      <h1 title="home page">
        <Link to="/" className="navbar-brand">
         <AiFillHome/> <span className="lg-screen-only">TobsChat</span>
        </Link>
      </h1>
      <nav className="navbar">
        <ul className="navbar-nav">
          <li className="nav-item" title="your rooms">
            <NavLink to={"/room/list"} className="nav-link">
              <BsFillChatDotsFill /> <span className="lg-screen-only text-light">ROOMS</span>
            </NavLink>
          </li>
          <li className="nav-item" title="your friends">
            <NavLink to={"/user/friends"} className="nav-link">
              <FaUserFriends/> <span className="lg-screen-only text-light">FRIENDS</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <button className="btn btn-danger" onClick={userLogout} title="logout">
        <MdLogout/> <span className="lg-screen-only">LOGOUT</span>
      </button>
      </IconContext.Provider>
    </header>
  );
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
    socket.offAny();
    socket.emit("user:logout");
    navigate("/auth/login");
  };
}

