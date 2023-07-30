<template>
  <div class="login-contents">
    <div class="login-box">
      <Card title="Sign In">
        <label for="login-user">Username:</label>
        <input v-model="username" id="login-user" type="text" />
        <label for="login-pass">Password:</label>
        <input v-model="password" id="login-password" type="password" />

        <button type="button" @click="login" class="btn btn-primary">Login</button>

        <span class="login-error" v-if="errorMsg">{{ errorMsg }}</span>

        <div class="reg-link">
          <a href="https://service.webrpg.dev/register">Register for account</a>
        </div>
      </Card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Card from "@/components/ui/Card.vue";

import { getServiceInterface } from "@/service/rumor";
import { signIn, signInWithToken } from "@/service/signIn";
import { ref } from "vue";
import { useProjectStore } from "./store/project";

// const project = namespace("project");

// <button type="button" @click="useOffline" class="btn btn-secondary">Offline Mode</button>

// @project.Mutation("setLoggedIn") setLoggedIn!: Function;
// @project.Mutation("setOffline") setOffline!: Function;

const username = ref("");
const password = ref("");
const errorMsg = ref("");

const projectStore = useProjectStore();


async function login() {
  if (!username.value || !password.value) {
    errorMsg.value = "Must specify a username and password.";
    return;
  }
  signIn(username.value, password.value)
    .then((token: string) => {
      getServiceInterface()
        .connect(token)
        .then(() => {
          console.log('SIGNED IN')
          window.localStorage.setItem("token", token);

          projectStore.setOffline(false);
          projectStore.setLoggedIn(true);
        });
    })
    .catch(err => {
      errorMsg.value = "Invalid username or password";
    });

  try {
    const res = await signIn(username.value, password.value);
  } catch (err) { }
}

/*
public async useOffline() {
  await createLocalInterface();

  this.setOffline(true);
  this.setLoggedIn(true);
}
*/

</script>

<style>
.login-contents {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

label {
  font-weight: bold;
}

input {
  margin-bottom: 8px;
}

label,
input {
  display: block;
  padding: 4px;
}

button {
  margin-top: 8px;
  margin-right: 8px;
}

.login-box {
  margin-left: 40%;
  margin-top: 15%;
  width: 210px;
}

.login-error {
  margin-top: 4px;
  font-weight: bold;
  display: block;
  color: #bb0000;
}

.reg-link {
  margin-top: 8px;
  font-size: 0.9rem;
}
</style>
