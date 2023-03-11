import "@assets/room.scss";
import store from "@data/zustand";
import { socket } from "@utils/socket";
import { getToken } from "@utils/token";
import { trpc } from "@utils/trpc";
import UserContext from "context/user";
import { RefObject, useContext, useEffect, useRef, useState } from "react";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";

export async function roomPageLoader({ params }: LoaderFunctionArgs) {
  const roomId = params.id;
  return roomId;
}

function genId() {
  return (Math.random() + 1).toString(36).substring(2);
}

function scrollBottom(ref: RefObject<HTMLDivElement>) {
  ref.current?.scrollBy({ behavior: "smooth", top: ref.current?.scrollHeight });
}

export function RoomPage() {
  const roomId = useLoaderData() as string;
  const room = trpc.room.getRoom.useQuery(roomId);
  const publicId = store.get("publicId");
  const [messages, setMessages] = useState(room.data?.value.messages ?? []);
  const [newMessage, setNewMessage] = useState("");
  const sendMessageMut = trpc.room.sendMessage.useMutation({
    onError(err) {
      console.error(err);
    },
  });

  useEffect(() => {
    if (room.data) {
      setMessages(room.data.value.messages);
    }
  }, [room.data]);

  const sendMessage = () => {
    const message = {
      key: genId(),
      content: newMessage,
      createdAt: new Date().toISOString(),
      roomId,
      senderPublicId: publicId,
    };
    socket.emit("room:message", message, getToken());
    setMessages((state) => [...state, message]);
    sendMessageMut.mutateAsync(message).catch(() => null);
    setNewMessage("");
  };

  useEffect(() => {
    socket.emit("room:join", roomId);
    socket.on("room:message", (message) => {
      setMessages((state) => [...state, message]);
    });

    return () => {
      socket.off("room:message");
      socket.emit("room:leave", roomId);
    };
  }, []);

  const chatContainer = useRef<HTMLDivElement>(null);
  // scroll to the bottom when new messages come in
  useEffect(() => {
    scrollBottom(chatContainer);
  }, [messages]);

  return (
    <div className="room">
      <h2>{room.data?.value.name}</h2>
      <small>{room.data?.value.members.map((member) => member.username).join(" || ")}</small>
      <div>
        <div className="chat" ref={chatContainer}>
          {room.isInitialLoading ? (
            <>Loading...</>
          ) : messages.length ? (
            messages.map((message) => <MessageComponent {...message} isMe={publicId === message.senderPublicId} />)
          ) : (
            <p>No messages yet... Try saying hello</p>
          )}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <div className="input-group mb-3">
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

function MessageComponent(props: { content: string; createdAt: string; isMe: boolean }) {
  return (
    <div className={`message ${props.isMe ? "me" : "not-me"}`}>
      <p>{props.content}</p>
      <small>{formatMessageDate(new Date(props.createdAt))}</small>
    </div>
  );
}

function formatMessageDate(date: Date): string {
  if (date.getTime() >= Date.now() - 1000 * 60 * 60 * 24) {
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  return date.toLocaleDateString();
}

