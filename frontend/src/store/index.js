import {defineStore} from "pinia";

export const useConunterStore = defineStore("counter", {
  state: () => ({
    user: ["user:add"],
  }),
  actions: {},
});
