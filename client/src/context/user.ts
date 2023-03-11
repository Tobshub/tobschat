import { createContext } from "react";

const UserContext = createContext<{ setContext(key: string, value: string): void; [key: string]: any }>({
  setContext: (key, value) => null,
  username: "",
});
export default UserContext;

