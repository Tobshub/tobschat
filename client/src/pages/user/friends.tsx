import "@assets/friends.scss";
import store from "@data/zustand";
import { socket } from "@utils/socket";
import { trpc } from "@utils/trpc";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function FriendsPage() {
  const [friends, setFriends] = store.use("friends");
  const publicId = store.get("publicId");
  const pidInputRef = useRef<HTMLInputElement>(null);
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
        console.log(data.value.friends);
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
          publicId={pidInputRef.current?.value as string}
        />
      ) : null}
      <h1>Friends</h1>
      <small>Public ID: {publicId}</small>
      <form
        className="input-group mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirm(true);
        }}
      >
        <label className="input-group-text">PUBLIC ID:</label>
        <input className="form-control" type="search" style={{ maxWidth: "500px" }} ref={pidInputRef} />
        <button className="btn btn-outline-secondary" type="submit">
          SEARCH
        </button>
      </form>
      <ul className="navbar-nav">
        {friends.length ? (
          friends.map((friend) => (
            <li key={friend.publicId} className="nav-item">
              <Link to={`/user/@/${friend.publicId}`}>{friend.username}</Link>
              <button className="btn" title="New room with user">
                +
              </button>
            </li>
          ))
        ) : (
          <p>
            You don't have any friends yet.{" "}
            <button className="btn btn-link p-0" onClick={() => pidInputRef.current?.focus()}>
              Add Friends with their public Id
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
              receivedFriendRequests={friendRequests.data.value.receivedFriendRequests}
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
  const [friendRequests, setFriendRequests] = useState(props.sentFriendRequests);

  useEffect(() => {
    // update request that has been accepted
    socket.on("friend_request:accepted", (requestId) => {
      const index = friendRequests.findIndex((request) => request.id === requestId);
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
      const index = friendRequests.findIndex((request) => request.id === requestId);
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
            <Link to={`/user/@/${friendRequest.receiver.publicId}`}>{friendRequest.receiver.username}</Link>'s friend!
          </span>
          <span className="d-flex gap-2">
            {friendRequest.status === "WAITING" ? (
              <>
                <button className="btn btn-outline-danger">CANCEL</button>
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
  const [friendRequests, setFriendRequests] = useState(props.receivedFriendRequests);

  useEffect(() => {
    socket.on("friend_request:new", (friendRequest) => {
      setFriendRequests((state) => [...state, friendRequest]);
    });

    return () => {
      socket.off("friend_request:new");
    };
  }, []);

  const acceptFriendRequestMut = trpc.user.friendRequest.acceptFriendRequest.useMutation();
  const acceptFriendRequest = (requestId: string) => {
    const index = friendRequests.findIndex((request) => request.id === requestId);
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

  const declineFriendRequestMut = trpc.user.friendRequest.declineFriendRequest.useMutation();
  const declineFriendRequest = (requestId: string) => {
    const index = friendRequests.findIndex((request) => request.id === requestId);
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
            <Link to={`/user/@/${friendRequest.sender.publicId}`}>{friendRequest.sender.username}</Link>{" "}
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
                <button className="btn btn-outline-success" onClick={() => acceptFriendRequest(friendRequest.id)}>
                  ACCEPT
                </button>
                <button className="btn btn-outline-danger" onClick={() => declineFriendRequest(friendRequest.id)}>
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

function ConfirmFriendRequestComponent(props: { publicId: string; close: () => void }) {
  const { data, isLoading, error } = trpc.user.searchUser.useQuery({ publicId: props.publicId });
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
    sendFriendRequestMut.mutate({ receiver: { publicId: props.publicId } });
  };

  if (isLoading) {
    return <>Loading...</>;
  }
  if (!data || error) {
    return <small className="alert alert-danger py-0">An Error Occured.</small>;
  }
  if (sendFriendRequestMut.isSuccess) {
    return <small className="alert alert-success py-0">Friend Request Sent</small>;
  }
  return (
    <div className={data.ok ? "overlay" : ""}>
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
              <button className="btn btn-sm btn-outline-primary" onClick={sendFriendRequest}>
                Send friend request
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={props.close}>
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

