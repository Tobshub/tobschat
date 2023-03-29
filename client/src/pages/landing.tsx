import { getToken } from "@utils/token";
import { Link, useLoaderData } from "react-router-dom";


export default function LandingPage() {
  const user = useLoaderData() as { loggedIn: boolean };
  return (
    <div className="d-flex flex-column justify-content-start align-items-center py-4">
        <nav className="navbar w-100 px-5 py-1">
          <h1>TobsChat</h1>
          <ul className="navbar-nav flex-row gap-3">
          { !user.loggedIn ? 
            <>
            <li className="nav-item">
              <Link className="btn btn-outline-secondary text-reset" to={"/auth/login"}>Login</Link>
            </li>
            <li className="nav-item">
              <Link className="btn btn-outline-primary text-reset" to={"/auth/sign-up"}>Sign Up</Link>
            </li>
            </>
            : <li><Link className="btn btn-outline-success text-reset" to={"/"}>Continue Chatting</Link></li>
        }
          </ul>
      </nav>

      <main style={{maxWidth: 800,}}>
        <h1 style={{textAlign: "center"}}>Welcome to Chat App!</h1>
        <p>Chat App allows you to connect with friends and family through real-time messaging. You can add friends, create rooms, and start chatting!</p>

        <h2>Features</h2>
        <ul>
          <li>Real-time messaging</li>
          <li>Add friends</li>
          <li>Create rooms</li>
          <li>Customize your profile(coming soon)</li>
        </ul>

        <h2>Get started</h2>
        <p>Log in or sign up to start using Chat App today!</p>
      </main>
    </div>
  );
}
