import "@assets/room.scss";
import store from "@data/zustand";
import { socket } from "@utils/socket";
import { getToken } from "@utils/token";
import { trpc } from "@utils/trpc";
import { RefObject, useEffect, useRef, useState } from "react";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";

export async function roomPageLoader({ params }: LoaderFunctionArgs) {
  const { blob } = params;
  return blob;
}

function genId() {
  return (Math.random() + 1).toString(36).substring(2);
}

function scrollBottom(ref: RefObject<HTMLDivElement>) {
  ref.current?.scrollBy({ behavior: "smooth", top: ref.current?.scrollHeight });
}

export function RoomPage() {
  const roomBlob = useLoaderData() as string;
  const room = trpc.room.getRoom.useQuery(roomBlob, { staleTime: 0 });
  const publicId = store.get("publicId");
  const username = store.get("username")
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
      senderPublicId: publicId,
      roomBlob,
    };
    socket.emit("room:message", message, getToken());
    setMessages((state) => [...state, message]);
    sendMessageMut.mutateAsync(message).catch(() => null);
    setNewMessage("");
  };

  const [typing, setTyping] = useState<{isTyping: boolean; username: string | null}>({isTyping: false, username: null});

  // join room and
  // listen to room events
  useEffect(() => {
    socket.emit("room:join", roomBlob);
    socket.on("room:message", (message) => {
      setMessages((state) => [...state, message]);
    });
    socket.on("room:typing", (username: string | null) => {
      if (username) {
        setTyping({isTyping: true, username})
      } else {
        setTyping({isTyping: false, username: null})
      }
    })

    return () => {
      socket.off("room:message");
      socket.off("room:typing")
      socket.emit("room:leave", roomBlob);
    };
  }, []);

  // emit `room:typing` event from socket
  // when user starts/stops typing
  useEffect(() => {
    if (newMessage.length && username) {
      socket.emit("room:typing", roomBlob, username) 
    } else {
      socket.emit("room:typing", roomBlob, null)
    }
  }, [!!newMessage.length])

  const chatContainer = useRef<HTMLDivElement>(null);
  // scroll to the bottom when new messages come in
  useEffect(() => {
    scrollBottom(chatContainer);
  }, [messages]);

  const newMessageInputElement = useRef<HTMLInputElement>(null)


  return (
    <div className="room">
      <h2>{room.data?.value.name}</h2>
      <small>{room.data?.value.members.map((member) => member.username).join(" || ")}</small>
      <div>
        <div className="chat" ref={chatContainer}>
          {room.isInitialLoading ? (
            <>Loading...</>
          ) : messages.length ? (
            messages.map((message) => (
            <MessageComponent 
                {...message} 
                isMe={publicId === message.senderPublicId} 
                senderUsername={room.data?.value.members.find(
                    mem => mem.publicId === message.senderPublicId
                  )?.username as string} 
                />))
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
        <div className="input-group">
          <input
            placeholder="type message..."
            className="form-control"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            ref={newMessageInputElement}
          />
          <button type="submit" className="btn btn-primary" disabled={!newMessage} onClick={() => newMessageInputElement.current?.focus()}>
            SEND
          </button>
        </div>
          {typing.isTyping ? <small>{typing.username} is typing...</small> : null}
      </form>
    </div>
  );
}

function MessageComponent(props: { content: string; createdAt: string; isMe: boolean, senderUsername: string }) {
  return (
    <div className={`message ${props.isMe ? "me" : "not-me"}`}>
      <small>{props.isMe? "You:" : props.senderUsername + ":"}</small>
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

