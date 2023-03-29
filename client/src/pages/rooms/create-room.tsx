import store from "@data/zustand";
import { FriendComponent } from "@layouts/components/friend";
import { trpc } from "@utils/trpc";
import { useRef, useState } from "react";
import { IconContext } from "react-icons";
import { BiPlus } from "react-icons/bi";
import { FaUserMinus} from 'react-icons/fa'
import { Link, useNavigate } from "react-router-dom";

export default function CreateRoomPage() {
  // TODO: support for creating groups
  const roomNameRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const [selectedFriend, setSelectedFriend] = useState<{ publicId: string | null }>({ publicId: null });

  const createRoomMut = trpc.room.createPrivateRoom.useMutation({
    onSuccess(res) {
      if (res.ok) {
        navigate(`/room/${res.value.blob}`);
      } else {
        setErrorMessage(res.message);
      }
    },
    onError(e) {
      setErrorMessage("An Error occured. Please Try Again Later");
      console.log(e);
    },
  });

  const friends = store.get("friends");

  return (
    <div>
      <h1>Create a new Room</h1>
      {errorMessage && <small className="alert alert-danger py-1">{errorMessage}</small>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedFriend.publicId) {
            createRoomMut.mutate({ otherMember: selectedFriend.publicId });
          }
        }}
        style={{
          width: "min(80%, 500px)",
        }}
      >
        <div className="form-group mb-3">
          <label className="mx-2">Room Type: </label>
          <select>
            <option value={"private"}>PRIVATE</option>
            <option disabled>GROUP</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="btn btn-outline-success"
            disabled={createRoomMut.isLoading || !selectedFriend.publicId}
          >
            CREATE NEW ROOM
          </button>
          <p>Choose a friend to the create the room with.</p>
          <ul className="navbar-nav mb-3">
            <IconContext.Provider value={{className: "react-icons"}}>
            {friends.length ? (
              friends.map((friend) => (
                <FriendComponent key={friend.publicId} friend={friend} className={`nav-item ${friend.publicId === selectedFriend.publicId ? "selected-friend" : ""}`}>
                  {friend.publicId !== selectedFriend.publicId ? (
                    <button
                      className="btn py-0"
                      title="Select User"
                      type="button"
                      onClick={() => setSelectedFriend({ publicId: friend.publicId })}
                    >
                      <BiPlus />
                    </button>
                  ) : (
                    <button
                      className="btn py-0"
                      title="Deselect User"
                      type="button"
                      onClick={() => {
                        setSelectedFriend({ publicId: null })
                        setErrorMessage("")
                      }}
                    >
                     <FaUserMinus /> 
                    </button>
                  )}
                </FriendComponent>
              ))
            ) : (
              <p>
                You don't have any friends yet.{" "}
                <Link className="btn btn-link p-0" to={"/user/friends"}>
                  Add Friends
                </Link>
              </p>
            )}
            </IconContext.Provider>
          </ul>
        </div>
      </form>
    </div>
  );
}

