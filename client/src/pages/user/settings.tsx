import store from "@data/zustand";
import { trpc } from "@utils/trpc";
import { useState } from "react";

export default function SettingsPage() {
  const publicId = store.get("publicId");
  const user = trpc.user.getUserPublic.useQuery({ publicId });
  if (!user.data || !user.data.ok) {
    return <>An Error Occured</>
  }
  return (
    <div>
      <h1>Settings</h1>
    </div>
  );
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
