import { socket } from "@utils/socket";
import { getToken } from "@utils/token";
import { trpc } from "@utils/trpc";
import { useEffect, useRef, useState } from "react";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";

export async function roomPageLoader({ params }: LoaderFunctionArgs) {
  const roomId = params.id;
  return roomId;
}

function genId() {
  return (Math.random() + 1).toString(36).substring(2);
}

export function RoomPage() {
  const roomId = useLoaderData() as string;
  const room = trpc.room.getRoom.useQuery(roomId);
  // TODO: diff messages by user
  const [messages, setMessage] = useState(room.data?.data.messages ?? []);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    const message = { key: genId(), content: newMessage, createdAt: new Date().toISOString(), roomId };
    socket.emit("room:message", message, getToken());
    setMessage((state) => [...state, message]);
    // FIXIT: update messages in the db for persistence
    setNewMessage("");
  };

  useEffect(() => {
    socket.emit("room:join", roomId);
    socket.on("room:message", (message) => {
      setMessage((state) => [...state, message]);
    });

    return () => {
      socket.off("room:message");
    };
  }, []);

  return (
    <div className="page">
      <h2>{room.data?.data.name}</h2>
      <div>
        {room.isInitialLoading ? (
          <>Loading...</>
        ) : (
          <div>
            {messages.length ? (
              messages.map((message) => <MessageComponent {...message} />)
            ) : (
              <p>No messages yet... Try saying hello</p>
            )}
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <div className="input-group">
          <input
            placeholder="type message..."
            className="form-control"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={!newMessage}>
            SEND
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageComponent(props: { content: string; createdAt: string }) {
  return (
    <div>
      <p>{props.content}</p>
      <time>{props.createdAt}</time>
    </div>
  );
}

