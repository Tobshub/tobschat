import permissions from "@data/permission";
import store from "@data/zustand";
import { trpc } from "@utils/trpc";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const publicId = store.get("publicId");
  const user = trpc.user.getUserPublic.useQuery({ publicId });
  const [hasNotificationPermission, setHasNotificationPermission] = permissions.use("notifications");
  
  if (!user.isLoading && (!user.data || !user.data.ok)) {
    return <>An Error Occured</>
  } 
  return (
    <div>
      <h1>Settings</h1>
      <p>Coming Soon...</p>
      <section>
        <h2 id="notifications">Notification Settings</h2>
        <div>
          {!hasNotificationPermission.all? (
            <>
              <span>Turn on Notifications</span>
              <button className="btn btn-outline-primary" onClick={async () => {
                const permission = await requestNotificationPermission();
                console.log("CLICKED!")
                if (permission) setHasNotificationPermission(state => ({...state, all: true}));
              }}>On</button>
            </>
          ) : (
            <>
              <span>Turn Off Notifications</span>
              <button className="btn btn-outline-primary" onClick={async () => {
                setHasNotificationPermission(state => ({...state, all: false}));
              }}>
                Off
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

/** request notification permission */
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission().then(perm => perm === "granted");
  return permission;
}

function EditableDisabledInput(props: {
  defaultValue: string;
  saveFn: () => Promise<void>;
}) {
  const [isDisabled, setIsDisabled] = useState(true);
  return (
    <div className="input-group">
      <input disabled={isDisabled} defaultValue={props.defaultValue} />
    </div>
  );
}
