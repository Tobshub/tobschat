import { createContext } from "react";

const UserContext = createContext<{ username: string; setContext(key: "username", value: string): void }>({
  username: "",
  setContext(key, value) {},
});
export default UserContext;

