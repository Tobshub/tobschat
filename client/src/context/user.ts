import { createContext } from "react";

const UserContext = createContext<{ email: string; setContext(key: "email", value: string): void }>({
  email: "",
  setContext(key, value) {},
});
export default UserContext;

