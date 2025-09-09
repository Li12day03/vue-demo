<template>
  <slot v-if="counterStore.user.includes(permission)"></slot>
</template>

<script setup>
import { useConunterStore } from '@/store'

const counterStore = useConunterStore();

defineProps(['permission'])
</script>