<template>
  <div id="app">
    <BrowserCheck />
    <div class="app-contents" v-if="projectStore.loggedIn">
      <Header />
      <router-view />
    </div>
    <Login v-if="redirectToLogin && !projectStore.loggedIn" />
    {{ projectStore.loggedIn }}
  </div>
</template>

<script lang="ts">
import Header from "@/components/Header.vue";
import Login from "@/Login.vue";
import BrowserCheck from "@/components/BrowserCheck.vue";

import { signIn, signInWithToken } from "@/service/signIn";
import { getServiceInterface } from "@/service/rumor";
import { useProjectStore } from "./store/project";
import { defineComponent, onMounted, ref } from "vue";
import { computed } from "vue";

export default defineComponent({
  components: {
    BrowserCheck,
    Header,
    Login
  },

  setup() {
    const projectStore = useProjectStore();
    // store.dispatch("project/loggedIn")

    const redirectToLogin = ref(false);

    onMounted(() => {
      const token = window.localStorage.getItem("token");
      if (token) {
        signInWithToken(token)
          .then(() => {
            getServiceInterface()
              .connect(token)
              .then(() => {
                console.log('LOGGG')
                projectStore.setOffline(false)
                projectStore.setLoggedIn(true)
              })
              .catch(() => {
                redirectToLogin.value = true;
              });
          })
          .catch(err => {
            window.localStorage.removeItem("token");
            redirectToLogin.value = true;
          });
      } else {
        redirectToLogin.value = true;
      }
    });

    return {
      projectStore,
      redirectToLogin
    }
  }
});


</script>

<style>
.app-contents {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
}
</style>
