import store from "@data/zustand";
import { trpc } from "@utils/trpc";
import { useState } from "react";

export default function SettingsPage() {
  const publicId = store.get("publicId");
  const [settings, setSettings] = store.use("settings");
  const user = trpc.user.getUserPublic.useQuery({ publicId });
  const hasNotificationPermission = settings.notifications.all;

  const handleNotificationPermissionChange = (permission: boolean) => {
    if (!permission) {
      setSettings((state) => ({
        ...state,
        notifications: { ...state.notifications, all: false },
      }));
      return;
    }
    setSettings((state) => ({
      ...state,
      notifications: { ...state.notifications, all: true },
    }));
  };

  if (!user.isLoading && (!user.data || !user.data.ok)) {
    return <>An Error Occured</>;
  }
  return (
    <div>
      <h1>Settings</h1>
      <p>Coming Soon...</p>
      <section>
        <h2 id="notifications">Notification Settings</h2>
        <div>
          {!hasNotificationPermission ? (
            <>
              <span>Turn on Notifications</span>
              <button
                className="btn btn-outline-primary"
                onClick={async () => {
                  const permission = await requestNotificationPermission();
                  if (permission) handleNotificationPermissionChange(true);
                }}
              >
                On
              </button>
            </>
          ) : (
            <>
              <span>Turn Off Notifications</span>
              <button
                className="btn btn-outline-primary"
                onClick={async () => {
                  handleNotificationPermissionChange(false);
                }}
              >
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
  const permission = await Notification.requestPermission().then(
    (perm) => perm === "granted"
  );
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
