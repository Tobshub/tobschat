import store from "@data/zustand";
import { socket } from "@utils/socket";
import { removeToken } from "@utils/token";
import { trpc } from "@utils/trpc";
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export function SidebarComponent(props: { sidebarOpen: boolean }) {
  const navigate = useNavigate();

  const userLogout = useLogout();
  return (
    <header style={{ display: props.sidebarOpen ? "block" : "none" }}>
      <h1>
        <Link to="/" className="navbar-brand">
          TobsChat
        </Link>
      </h1>
      <nav className="navbar">
        <ul className="navbar-nav">
          <li className="nav-item">
            <NavLink to={"/room/list"} className="nav-link">
              ROOMS
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to={"/friends"} className="nav-link">
              FRIENDS
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to={"/user"} className="nav-link">
              ACCOUNT
            </NavLink>
          </li>
        </ul>
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
export function useLogout() {
  const navigate = useNavigate();
  return () => {
    removeToken();
    socket.offAny();
    socket.emit("user:logout");
    navigate("/auth/login");
  };
}

