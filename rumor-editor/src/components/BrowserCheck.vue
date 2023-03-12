<template>
  <Modal title="Warning" :show="show" @closed="closed">{{ message }}</Modal>
</template>

<script lang="ts" setup>
import Modal from "@/components/ui/Modal.vue";
import { ref } from "vue";

const MOBILE_NOT_SUPPORTED = `This application currently does not support mobile devices,
but we are hoping to in the future.  You are welcome to continue but we don't guarantee
anything will work.  Thus, please use a desktop/laptop.`;

const BROWSER_NOT_SUPPORTED = `
<div style="padding: 15px">
<h1>Your browser is not supported.</h1>
<p>
Thank you for checking out Rumor.  We're happy you are here.  Unfortunately, your browser is not supported.
Please consider using the latest version of these browsers:</p>
<ul style="list-style: disc">
<li><a href="https://www.mozilla.org/" target="_blank">Mozilla Firefox</a></li>
<li><a href="https://www.google.com/chrome/" target="_blank">Google Chrome</a></li>
</ul>
<p>
Once you've gotten a new browser, come back and we'll get right to showing you the action!
</p>
</div>
`;

function browserNotSupported() {
  document.body.innerHTML = BROWSER_NOT_SUPPORTED;
}

const message = ref("");
const show = ref(false);

if (window.innerWidth < 640 || window.innerHeight < 480) {
  message.value = MOBILE_NOT_SUPPORTED;
  show.value = true;
}

if (!window.PointerEvent) {
  browserNotSupported();
}

function closed() {
  show.value = false;
}

</script>

<style scoped></style>
