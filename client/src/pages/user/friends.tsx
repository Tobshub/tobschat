import "@assets/friends.scss";
import store from "@data/zustand";
import { FriendComponent } from "@layouts/components/friend";
import { socket } from "@utils/socket";
import { trpc } from "@utils/trpc";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function FriendsPage() {
  const [friends, setFriends] = store.use("friends");
  const username = store.get("username");
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const friendRequests = trpc.user.friendRequest.get.useQuery();

  const friendsListQuery = trpc.user.getUserPrivate.useQuery(undefined, {
    enabled: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });
  const refetchFriends = async () => {
    friendsListQuery.refetch().then(({ data }) => {
      if (data && data.ok) {
        setFriends(data.value.friends);
      }
    });
  };

  // TODO: create room with a friend
  return (
    <div>
      {showConfirm ? (
        <ConfirmFriendRequestComponent
          close={() => setShowConfirm(false)}
          username={usernameInputRef.current?.value as string}
        />
      ) : null}
      <h1>Friends</h1>
      <small>You: {username}</small>
      <form
        className="input-group mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirm(true);
        }}
      >
        <label className="input-group-text">Username:</label>
        <input
          className="form-control"
          type="search"
          style={{ maxWidth: "500px" }}
          ref={usernameInputRef}
        />
        <button className="btn btn-outline-secondary" type="submit">
          SEARCH
        </button>
      </form>
      <ul className="navbar-nav">
        {friends.length ? (
          friends.map((friend) => (
            <FriendComponent
              key={friend.publicId}
              friend={friend}
              className={friend.online ? "online" : "offline"}
            />
          ))
        ) : (
          <p>
            You don't have any friends yet.{" "}
            <button
              className="btn btn-link p-0"
              onClick={() => usernameInputRef.current?.focus()}
            >
              Add Friends with their username
            </button>
          </p>
        )}
      </ul>
      <section>
        <h2>Friend Requests</h2>
        <div>
          <h3>Sent</h3>
          {friendRequests.data ? (
            <SentFriendRequests
              sentFriendRequests={friendRequests.data.value.sentFriendRequests}
              refetchFriends={refetchFriends}
            />
          ) : (
            "Loading..."
          )}
        </div>
        <div>
          <h3>Received</h3>
          {friendRequests.data ? (
            <ReceivedFriendRequests
              receivedFriendRequests={
                friendRequests.data.value.receivedFriendRequests
              }
              refetchFriends={refetchFriends}
            />
          ) : (
            "Loading..."
          )}
        </div>
      </section>
    </div>
  );
}

function SentFriendRequests(props: {
  sentFriendRequests: {
    receiver: { username: string; publicId: string };
    status: "WAITING" | "DECLINED" | "ACCEPTED";
    id: string;
  }[];
  refetchFriends: () => Promise<void>;
}) {
  const [friendRequests, setFriendRequests] = useState(
    props.sentFriendRequests
  );

  useEffect(() => {
    // update request that has been accepted
    socket.on("friend_request:accepted", (requestId) => {
      const index = friendRequests.findIndex(
        (request) => request.id === requestId
      );
      if (index >= 0) {
        setFriendRequests((state) => {
          state[index].status = "ACCEPTED";
          return [...state];
        });
        props.refetchFriends();
      }
    });
    // update request that has been rejected
    socket.on("friend_request:declined", (requestId) => {
      const index = friendRequests.findIndex(
        (request) => request.id === requestId
      );
      if (index >= 0) {
        setFriendRequests((state) => {
          state[index].status = "DECLINED";
          return [...state];
        });
      }
    });

    return () => {
      socket.off("friend_request:accepted");
      socket.off("friend_request:declined");
    };
  }, []);

  useEffect(() => {
    socket.on("friend_request:sent", (friendRequest) => {
      setFriendRequests((state) => [...state, friendRequest]);
    });

    return () => {
      socket.off("friend_request:sent");
    };
  }, []);

  const deleteRequestMutation =
    trpc.user.friendRequest.cancelFriendRequest.useMutation({
      onError(err) {
        console.error(err);
      },
    });

  const deleteRequest = (requestId: string) =>
    deleteRequestMutation.mutate({ requestId });

  if (!friendRequests.length) {
    return <>You haven't sent any Friend Requests</>;
  }
  return (
    <ul>
      {friendRequests.map((friendRequest) => (
        <li
          key={friendRequest.id}
          className={`${
            friendRequest.status === "ACCEPTED"
              ? "request-accepted"
              : friendRequest.status === "DECLINED"
              ? "request-declined"
              : ""
          } friend-request`}
        >
          <span>
            {friendRequest.status === "ACCEPTED"
              ? "You are now"
              : friendRequest.status === "DECLINED"
              ? "You are not"
              : "You want to be"}{" "}
            <Link to={`/user/@/${friendRequest.receiver.publicId}`}>
              {friendRequest.receiver.username}
            </Link>
            's friend!
          </span>
          <span className="d-flex gap-2">
            {friendRequest.status === "WAITING" ? (
              <>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => deleteRequest(friendRequest.id)}
                >
                  CANCEL
                </button>
              </>
            ) : (
              <button className="btn btn-outline-warning">HIDE</button>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ReceivedFriendRequests(props: {
  receivedFriendRequests: {
    sender: { username: string; publicId: string };
    status: "WAITING" | "DECLINED" | "ACCEPTED";
    id: string;
  }[];
  refetchFriends: () => Promise<void>;
}) {
  const [friendRequests, setFriendRequests] = useState(
    props.receivedFriendRequests
  );

  useEffect(() => {
    socket.on("friend_request:new", (friendRequest) => {
      setFriendRequests((state) => [...state, friendRequest]);
    });

    return () => {
      socket.off("friend_request:new");
    };
  }, []);

  const acceptFriendRequestMut =
    trpc.user.friendRequest.acceptFriendRequest.useMutation();
  const acceptFriendRequest = (requestId: string) => {
    const index = friendRequests.findIndex(
      (request) => request.id === requestId
    );
    if (index >= 0) {
      setFriendRequests((state) => {
        state[index].status = "ACCEPTED";
        return [...state];
      });
      acceptFriendRequestMut.mutateAsync({ requestId }).then((data) => {
        if (data.ok) {
          props.refetchFriends();
        }
      });
    }
  };

  const declineFriendRequestMut =
    trpc.user.friendRequest.declineFriendRequest.useMutation();
  const declineFriendRequest = (requestId: string) => {
    const index = friendRequests.findIndex(
      (request) => request.id === requestId
    );
    if (index >= 0) {
      setFriendRequests((state) => {
        state[index].status = "ACCEPTED";
        return [...state];
      });
      declineFriendRequestMut.mutateAsync({ requestId }).then((data) => {
        if (data.ok) {
          props.refetchFriends();
        }
      });
    }
  };

  if (!friendRequests.length) {
    return <>You haven't received any Friend Requests.</>;
  }

  return (
    <ul>
      {friendRequests.map((friendRequest) => (
        <li
          key={friendRequest.id}
          className={`${
            friendRequest.status === "ACCEPTED"
              ? "request-accepted"
              : friendRequest.status === "DECLINED"
              ? "request-declined"
              : ""
          } friend-request`}
        >
          <span>
            <Link to={`/user/@/${friendRequest.sender.publicId}`}>
              {friendRequest.sender.username}
            </Link>{" "}
            {friendRequest.status === "ACCEPTED"
              ? "is now"
              : friendRequest.status === "DECLINED"
              ? "is not"
              : "wants to be"}{" "}
            your friend!
          </span>
          <span className="d-flex gap-2">
            {friendRequest.status === "WAITING" ? (
              <>
                <button
                  className="btn btn-outline-success"
                  onClick={() => acceptFriendRequest(friendRequest.id)}
                >
                  ACCEPT
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => declineFriendRequest(friendRequest.id)}
                >
                  DECLINE
                </button>
              </>
            ) : (
              <button className="btn btn-outline-warning">HIDE</button>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ConfirmFriendRequestComponent(props: {
  username: string;
  close: () => void;
}) {
  const { data, isLoading, error } = trpc.user.searchUser.useQuery({
    username: props.username.trim().split(" ").join("_"),
  });
  const [requestError, setRequestError] = useState("");
  const sendFriendRequestMut = trpc.user.friendRequest.send.useMutation({
    onError(err) {
      setRequestError(err.message);
    },
    onSuccess(data) {
      if (data.ok) {
        setTimeout(() => {
          props.close();
        }, 5000);
      }
    },
  });

  const sendFriendRequest = () => {
    if (data && data.ok) {
      sendFriendRequestMut.mutate({
        receiver: { publicId: data.value.publicId },
      });
    }
  };

  if (isLoading) {
    return <>Loading...</>;
  }
  if (!data || error) {
    return <small className="alert alert-danger py-0">An Error Occured.</small>;
  }
  if (sendFriendRequestMut.isSuccess) {
    return (
      <small className="alert alert-success py-0">Friend Request Sent</small>
    );
  }
  return (
    <div className={data.ok ? "overlay" : ""} style={{ color: "black" }}>
      {data.ok ? (
        <div className="overlay-container">
          {requestError ? (
            <small className="alert alert-sm alert-danger py-0">
              <strong>{requestError}</strong>
            </small>
          ) : null}
          <div>
            <p className="m-0">
              Found User: <strong>{data.value.username}</strong>
            </p>
            <small>Public Id: {data.value.publicId}</small>
            <div className="d-flex justify-content-between mt-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={sendFriendRequest}
              >
                Send friend request
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={props.close}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <strong className="alert alert-danger py-0">User not found.</strong>
      )}
    </div>
  );
}
