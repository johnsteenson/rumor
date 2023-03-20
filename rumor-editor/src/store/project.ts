import { defineStore } from "pinia";

export const useProjectStore = defineStore('project', {
  state: () => {
    return {
      title: 'My Kewl Project',
      defaultTileSize: {
        w: 16,
        h: 16,
      },
      loggedIn: false,
      offline: false,
      signedInUser: ""
    }
  },

  getters: {

  },

  actions: {
    setSignedInUser(user: string) {
      this.signedInUser = user;
    },

    setOffline(offline: boolean) {
      this.offline = offline;
    },

    setLoggedIn(loggedIn: boolean) {
      this.loggedIn = loggedIn;
    }
  }
});