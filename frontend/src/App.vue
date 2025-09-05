<template>
  <!-- <TheBigScreen /> -->
  <!-- <wsDemo /> -->

  <!-- <main>
    <h1>前端电子签名 Demo</h1>
    <p>请在下方的白色区域签名：</p>
    <SignaturePad />
  </main> -->

  <watchEffectDemo />
</template>

<script setup>
// import TheBigScreen from './components/TheBigScreen.vue';
// import wsDemo from './components/wsDemo.vue';
// import SignaturePad from './components/SignaturePad.vue';
import watchEffectDemo from './components/watchEffectDemo.vue';
</script>

<style>
/* 移除所有默认样式，让我们的组件全屏显示 */
body,
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 20px;
}

main {
  max-width: 800px;
  margin: 0 auto;
}
</style>