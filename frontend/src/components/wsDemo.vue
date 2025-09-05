<template>
  <!-- 
  实现websocket(js版本)：
    解决问题：防止断线 -> 解决：定时像服务器发送消息，有回应代表连接，无回应代表断开
    解决问题：实现断线重连 -> 解决： onclose 事件的回调函数中，调用一个负责重新连接的方法 reconnect()
    解决问题：解决重连风暴 -> 解决：不能连不上就一直发送，防止压垮服务器，要翻倍询问，并且设置一个最大上限 
  -->
  <div class="screen-container">
    <h1>智慧边检大屏 - WebSocket高可用Demo (Vue 3)</h1>
    <div id="status" :class="status.style">{{ status.text }}</div>
    <ul id="logs">
      <li v-for="(log, index) in logs" :key="index" :class="log.type">
        [{{ log.time || new Date().toLocaleTimeString() }}] [{{ log.type.toUpperCase() }}] {{ JSON.stringify(log.data ||
          log.message) }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
// import createWebSocketService from '../services/ws';
import createWebSocketService from '../services/wsidb';

// --- 响应式状态定义 ---
const status = ref({
  text: '准备连接...',
  style: ''
});

const logs = ref([]);
const maxLogs = 50; // 仅保留最新的50条日志，防止UI过载

// --- WebSocket服务实例 ---
let wsService = null;

// --- Vue生命周期钩子 ---
onMounted(() => {
  // 实例化服务
  wsService = createWebSocketService({
    url: 'ws://localhost:8080/ws/border-control',

    onOpen: () => {
      status.value = { text: '已连接', style: 'connected' };
    },

    onMessage: (data) => {
      logs.value.unshift(data);
      if (logs.value.length > maxLogs) {
        logs.value.pop();
      }
    },

    onClose: () => {
      status.value = { text: '已断开', style: 'disconnected' };
    },

    onReconnect: (attempt, delay) => {
      status.value = {
        text: `连接已断开，正在进行第 ${attempt} 次重连 (将在 ${delay / 1000}s 后尝试)...`,
        style: 'disconnected'
      };
    }
  });

  // 启动连接
  wsService.connect();
});

onUnmounted(() => {
  // 组件销毁时，调用服务的清理方法
  if (wsService) {
    wsService.close();
  }
});
</script>

<style scoped>
.screen-container {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 20px;
  height: 100vh;
  box-sizing: border-box;
}

#status {
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.connected {
  background: #27ae60;
}

.disconnected {
  background: #c0392b;
}

#logs {
  list-style: none;
  padding: 0;
  height: 80vh;
  overflow-y: auto;
  border: 1px solid #7f8c8d;
  padding: 10px;
}

#logs li {
  padding: 8px;
  border-bottom: 1px solid #34495e;
  font-family: 'Courier New', Courier, monospace;
}

.alert {
  color: #f1c40f;
}

.vehicle {
  color: #3498db;
}

.info {
  color: #95a5a6;
}
</style>