<script setup>
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import Table from './Table.vue'
import Authority from './Authority.vue'

const tableRef = ref(null)

const router = useRouter()

const isLogin = ref(false)

const gotoPageHandle = (path) => {
  router.push(path)
}

const loginHandle = () => {
  isLogin.value = true;
}

const handleClick = () => {
  tableRef.value?.submit()
}
</script>

<template>
  <div>
    <button @click="gotoPageHandle('/Home')">按钮1 -> Home</button>
    <button @click="gotoPageHandle('/About')">按钮2 -> About</button>
    <button @click="gotoPageHandle" v-permission="'user:add'">按钮3</button>
    <button @click="gotoPageHandle" v-permission="'user:update'">按钮4</button>
  </div>

  <button @click="handleClick">按钮</button>
  <Authority permission="user:table">
    <Table ref="tableRef" />
  </Authority>
  <!-- <Table v-permission="'user:table'" ref="tableRef" /> -->
  <router-view></router-view>
  <!-- <div>
    <button @click="loginHandle">登录</button>
  </div> -->
</template>