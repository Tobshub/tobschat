import { trpc } from "@utils/trpc";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export function CreateRoomPage() {
  const roomNameRef = useRef<HTMLInputElement>(null);
  const [otherMember, setOtherMember] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const createRoomMut = trpc.room.createRoom.useMutation({
    onSuccess(res) {
      if (res.ok) {
        navigate(`/room/${res.value}`);
      } else {
        setErrorMessage(res.message);
      }
    },
    onError(e) {
      console.log(e);
    },
  });

  return (
    <div>
      <h1>Create a new Room</h1>
      {errorMessage && <small className="alert alert-danger py-1">{errorMessage}</small>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createRoomMut.mutate({ name: roomNameRef.current?.value as string, otherMember });
        }}
        style={{
          width: "min(80%, 500px)",
        }}
      >
        <div className="form-group mb-3">
          <label>Room Name: </label>
          <input className="form-control" required ref={roomNameRef} />
        </div>
        <div className="form-group mb-3">
          <label>Members (excluding you): </label>
          <input
            className="form-control"
            required
            placeholder="othermember@example.com"
            onChange={(e) => setOtherMember(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-outline-success" disabled={createRoomMut.isLoading || !otherMember}>
          CREATE NEW ROOM
        </button>
      </form>
    </div>
  );
}

