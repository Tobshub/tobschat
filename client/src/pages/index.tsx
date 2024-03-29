import store from "@data/zustand";
import { FriendComponent } from "@layouts/components/friend";
import { socket } from "@utils/socket";
import { getToken } from "@utils/token";
import { useEffect } from "react";
import { Link } from "react-router-dom";

// TODO: click to copy invite link
// TODO: set up adding friends through invite link
export default function IndexPage() {
  // user joins a room with their id
  useEffect(() => {
    socket.emit("user:load", getToken());
  }, []);

  const user = store.useAll();
  return (
    <div>
      <div className="d-flex gap-3 align-items-center mb-3">
        <img src={`https://source.boringavatars.com/beam/80/${user.publicId}`} />
        <h1>{user.username}</h1>
      </div>
      <div className="d-flex flex-column align-items-start mb-3">
        <small title="click to copy your invite link" className="btn btn-link p-0">
          PublicID: {user.publicId}
        </small>
        <small>Email: {user.email}</small>
      </div>
        <h2>Friends</h2>
      <ul className="navbar-nav">
        {user.friends.length ? (
          user.friends.map((friend) => <FriendComponent key={friend.publicId} friend={friend} className={friend.online? "online" : "offline"} />)
        ) : (
          <p>
            You don't have any friends yet.{" "}
            <Link className="btn btn-link p-0" to={"/user/friends"}>
              Add Friends with their username
            </Link>
          </p>
        )}
      </ul>

    </div>
  );
}

