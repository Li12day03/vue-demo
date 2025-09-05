/**
 * WebSocketService.js
 *
 * 一个高可用的 WebSocket 服务模块 (JS函数式版本)。
 * 实现了心跳机制、指数退避自动重连，并提供了可靠的清理方法。
 */

/**
 * 创建一个高可用的 WebSocket 服务实例。
 * 这是一个工厂函数，返回一个包含 connect, send, 和 close 方法的服务对象。
 * @param {object} options 配置选项
 * @param {string} options.url 要连接的WebSocket URL
 * @param {function} [options.onOpen] 连接成功时的回调
 * @param {function} [options.onMessage] 收到消息时的回调
 * @param {function} [options.onClose] 连接关闭时的回调
 * @param {function} [options.onReconnect] 尝试重连时的回调
 * @returns {{connect: function, send: function, close: function}}
 */
export default function createWebSocketService(options) {
  // --- 1. 状态与配置 ---
  const {
    url,
    onOpen = () => {},
    onMessage = () => {},
    onClose = () => {},
    onReconnect = () => {},
  } = options;

  let ws = null; // WebSocket 实例
  let isClosedByClient = false; // 标志位：是否由客户端主动关闭

  // 心跳机制相关变量
  let heartbeatTimer = null;
  const heartbeatInterval = 30 * 1000; // 30秒发一次心跳
  let serverTimeoutTimer = null;
  const serverTimeout = 5 * 1000; // 5秒内服务器无响应则认为超时

  // 自动重连相关变量
  let reconnectTimer = null;
  let reconnectAttempts = 0;
  const reconnectBaseDelay = 2000; // 初始重连延迟2秒
  const reconnectMaxDelay = 60000; // 最大重连延迟60秒

  // --- 2. 内部核心方法 ---

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

  // --- 3. 暴露给外部的API方法 ---

  /**
   * 发起WebSocket连接
   */
  function connect() {
    isClosedByClient = false; // 每次连接前，重置主动关闭标志
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("WebSocket connected.");
      onOpen();
      resetReconnectAttempts();
      startHeartbeat();
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        resetHeartbeat(); // 收到任何消息都重置心跳
        if (data.type === "pong") {
          return; // 心跳响应，无需处理
        }
        onMessage(data);
      } catch (e) {
        console.error("Failed to parse message:", event.data);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected.");
      onClose();
      stopHeartbeat(); // 无论如何，先停止心跳

      // 只有在不是客户端主动关闭的情况下，才启动重连
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

  // --- 4. 返回服务对象 ---
  return {
    connect,
    send,
    close,
  };
}
