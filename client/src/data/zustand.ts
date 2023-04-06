import { createGlobalStore } from "@utils/zustand";

const store = createGlobalStore<{
  username: string;
  publicId: string;
  email: string;
  friends: { username: string; publicId: string }[];
  settings: {
    notifications: {
      all: boolean;
    }
  };
}>({
  username: "",
  publicId: "",
  email: "",
  friends: [],
  settings: {
    notifications: {
      all: true,
    }
  }
});

export default store;

