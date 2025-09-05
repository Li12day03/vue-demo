<script setup>
import { ref, watchEffect } from 'vue'
const msg = ref('')

// let clicked = false
let clicked = ref(false)

const onClick = () => {
  clicked.value = true
}

watchEffect(() => {
  if (clicked) {
    console.log("msg更新了", msg.value);
  }
})
</script>

<template>
  <button @click="onClick">Click me</button>
  <input type="text" v-model="msg">
</template>