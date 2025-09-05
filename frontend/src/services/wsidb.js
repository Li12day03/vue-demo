/**
 * WebSocketService.js (最终版)
 *
 * 增加了 IndexedDB 持久化能力，支持断线续传。
 */
// 1. 【新增】导入我们刚刚创建的数据库辅助函数
import {getLastMessageId, setLastMessageId} from "./db.js";

export default function createWebSocketService(options) {
  // --- 状态与配置 ---
  const {
    url,
    onOpen = () => {},
    onMessage = () => {},
    onClose = () => {},
    onReconnect = () => {},
  } = options;

  let ws = null;
  let isClosedByClient = false;

  // 2. 【新增】一个内存变量来持有当前会话的 lastMessageId
  let lastMessageId = 0;

  // 心跳和重连变量... (保持不变)
  let heartbeatTimer = null;
  const heartbeatInterval = 30 * 1000;
  let serverTimeoutTimer = null;
  const serverTimeout = 5 * 1000;
  let reconnectTimer = null;
  let reconnectAttempts = 0;
  const reconnectBaseDelay = 2000;
  const reconnectMaxDelay = 60000;

  // --- 内部核心方法 --- (startHeartbeat, stopHeartbeat 等保持不变)
  function startHeartbeat() {
    console.log("Start heartbeat.");
    heartbeatTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({type: "ping"}));

        serverTimeoutTimer = setTimeout(() => {
          console.log("Server timeout, closing connection.");
          ws.close(); // 服务器超时，主动关闭连接，会触发onclose
        }, serverTimeout);
      }
    }, heartbeatInterval);
  }

  function resetHeartbeat() {
    clearTimeout(serverTimeoutTimer);
  }

  function stopHeartbeat() {
    console.log("Stop heartbeat.");
    clearInterval(heartbeatTimer);
    clearTimeout(serverTimeoutTimer);
  }

  function resetReconnectAttempts() {
    reconnectAttempts = 0;
  }

  function scheduleReconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    const delay = Math.min(
      reconnectMaxDelay,
      reconnectBaseDelay * Math.pow(2, reconnectAttempts)
    );
    reconnectAttempts++;
    onReconnect(reconnectAttempts, delay);
    reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect... (Attempt ${reconnectAttempts})`);
      connect();
    }, delay);
  }

  // --- 暴露给外部的API方法 ---

  /**
   * 3. 【修改】将 connect 方法改为 async 函数，以便使用 await
   */
  async function connect() {
    isClosedByClient = false;

    // 4. 【新增】在建立连接之前，先异步地从IndexedDB读取ID
    lastMessageId = await getLastMessageId();
    console.log(`从IndexedDB初始化 lastMessageId: ${lastMessageId}`);

    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("WebSocket connected.");
      onOpen();
      resetReconnectAttempts();
      startHeartbeat();

      // 5. 【新增】连接成功后，如果本地记录了ID，就向服务器请求同步
      if (lastMessageId > 0) {
        console.log(`请求同步ID大于 ${lastMessageId} 的消息`);
        send({type: "sync", lastMessageId: lastMessageId});
      }
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        resetHeartbeat();

        if (data.type === "pong") return;

        // 6. 【新增】收到带ID的消息后，更新ID并异步写入IndexedDB
        if (data.msgId && data.msgId > lastMessageId) {
          lastMessageId = data.msgId;
          // 这是一个“即发即忘”的异步操作，不会阻塞当前的消息处理流程
          setLastMessageId(lastMessageId);
        }

        onMessage(data);
      } catch (e) {
        console.error("Failed to parse message:", event.data);
      }
    };

    // onclose 和 onerror 逻辑保持不变
    ws.onclose = () => {
      console.log("WebSocket disconnected.");
      onClose();
      stopHeartbeat();
      if (!isClosedByClient) {
        scheduleReconnect();
      }
    };
    ws.onerror = err => {
      console.error("WebSocket error:", err);
      // onerror事件后通常会紧接着触发onclose事件，所以统一在onclose中处理重连
    };
  }

  /**
   * 发送数据
   * @param {object} data 要发送的JS对象
   */
  function send(data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not connected. Message not sent:", data);
    }
  }

  /**
   * 主动关闭连接并清理所有资源
   */
  function close() {
    if (!ws) {
      return;
    }
    console.log("Closing WebSocket connection by client.");
    isClosedByClient = true; // 设置标志位，阻止onclose后的重连
    stopHeartbeat(); // 立即停止心跳
    clearTimeout(reconnectTimer); // 清除可能存在的重连计划
    ws.close();
  }

  // --- 返回服务对象 ---
  return {
    connect,
    send,
    close,
  };
}
