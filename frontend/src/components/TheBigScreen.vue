<template>
  <!-- 
  实现websocket(class版本)：
    解决问题：防止断线 -> 解决：定时像服务器发送消息，有回应代表连接，无回应代表断开
    解决问题：实现断线重连 -> 解决： onclose 事件的回调函数中，调用一个负责重新连接的方法 reconnect()
    解决问题：解决重连风暴 -> 解决：不能连不上就一直发送，防止压垮服务器，要翻倍询问，并且设置一个最大上限 
  -->
  <div class="screen-container">
    <h1>智慧边检大屏 - WebSocket高可用Demo (Vue 3)</h1>
    <!-- 使用 :class 动态绑定样式 -->
    <div id="status" :class="status.style">{{ status.text }}</div>
    <ul id="logs">
      <!-- 使用 v-for 渲染日志列表 -->
      <li v-for="(log, index) in logs" :key="index" :class="log.type">
        [{{ log.time || new Date().toLocaleTimeString() }}] [{{ log.type.toUpperCase() }}] {{ JSON.stringify(log.data ||
          log.message) }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import WebSocketService from '../services/WebSocketService.js';

// ---- 1. 定义响应式状态 ----
const status = ref({
  text: '正在连接...',
  style: ''
});

const logs = ref([]);
const maxLogs = 50; // 最多保留50条日志，防止内存溢出

let wsService = null;

// ---- 2. 在 onMounted 生命周期钩子中初始化 ----
onMounted(() => {
  wsService = new WebSocketService({
    url: 'ws://localhost:8080/ws/border-control',

    // ---- 3. 定义回调函数，更新响应式状态 ----
    onOpen: () => {
      status.value = { text: '已连接', style: 'connected' };
    },

    onMessage: (data) => {
      // 往日志数组头部添加新消息
      logs.value.unshift(data);
      // 如果日志超过最大数量，则移除旧的
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

// ---- 4. 在 onUnmounted 中清理资源 ----
onUnmounted(() => {
  if (wsService && wsService.ws) {
    // 主动关闭连接，会触发 onclose，然后停止心跳和重连
    wsService.ws.close();
  }
});

</script>

<style scoped>
/* 样式与之前版本基本相同 */
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