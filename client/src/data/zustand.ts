import { createGlobalStore } from "@utils/zustand";

const store = createGlobalStore<{
  username: string;
  publicId: string;
  email: string;
  friends: { username: string; publicId: string }[];
}>({
  username: "",
  publicId: "",
  email: "",
  friends: [],
});

export default store;

