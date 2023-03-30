import {createGlobalStore } from "@utils/zustand";

const permissions = createGlobalStore({
  notifications: {
    all: false,
  }
}, "tobschat-notification-permissions", localStorage) 

export default permissions;
