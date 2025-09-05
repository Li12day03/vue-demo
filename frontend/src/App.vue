<template>
  <!-- <TheBigScreen /> -->
  <wsDemo />
</template>

<script setup>
// import TheBigScreen from './components/TheBigScreen.vue';
import wsDemo from './components/wsDemo.vue';
</script>

<style>
/* 移除所有默认样式，让我们的组件全屏显示 */
body,
#app {
  margin: 0;
  padding: 0;
}
</style>