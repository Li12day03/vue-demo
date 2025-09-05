export default class WebSocketService {
  constructor(options) {
    this.url = options.url;
    this.onOpen = options.onOpen || (() => {});
    this.onMessage = options.onMessage || (() => {});
    this.onClose = options.onClose || (() => {});
    this.onReconnect = options.onReconnect || (() => {});

    // WebSocket实例
    this.ws = null;

    // 心跳机制相关变量
    this.heartbeatTimer = null;
    this.heartbeatInterval = 30 * 1000; // 30秒
    this.serverTimeoutTimer = null;
    this.serverTimeout = 5 * 1000; // 5秒

    // 自动重连相关变量
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.reconnectBaseDelay = 2000; // 2秒
    this.reconnectMaxDelay = 60000; // 60秒
  }

  /**
   * WebSocket连接方法
   * 创建WebSocket连接并设置各种事件处理器
   */
  connect() {
    // 创建WebSocket实例，连接到指定URL
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("WebSocket connected.");
      this.onOpen();
      this.resetReconnectAttempts();
      this.startHeartbeat();
    };

    this.ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        // 收到任何消息（包括pong），都代表连接正常，重置心跳
        this.resetHeartbeat();

        if (data.type === "pong") {
          // 如果是pong消息，则不处理业务逻辑
          return;
        }

        this.onMessage(data);
      } catch (e) {
        console.error("Failed to parse message:", event.data);
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected.");
      this.onClose();
      this.stopHeartbeat();
      this.scheduleReconnect();
    };

    this.ws.onerror = err => {
      console.error("WebSocket error:", err);
      // onerror会紧接着触发onclose，所以重连逻辑放在onclose中
    };
  }

  startHeartbeat() {
    console.log("Start heartbeat.");
    // 1. 设置一个定时器，每30秒执行一次
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // 2. 发送一个 "ping" 消息给服务器
        this.ws.send(JSON.stringify({type: "ping"}));

        // 3. 【关键】发送ping后，启动一个“死亡倒计时”定时器
        //    如果5秒内没有收到服务器的任何回应，就认为连接已死
        this.serverTimeoutTimer = setTimeout(() => {
          console.log("Server timeout, closing connection.");

          // 4. 主动关闭连接，这将触发 onclose 事件，进而启动重连
          this.ws.close();
        }, this.serverTimeout);
      }
    }, this.heartbeatInterval);
  }

  resetHeartbeat() {
    clearTimeout(this.serverTimeoutTimer);
  }

  stopHeartbeat() {
    console.log("Stop heartbeat.");
    clearInterval(this.heartbeatTimer);
    clearTimeout(this.serverTimeoutTimer);
  }

  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(
      this.reconnectMaxDelay,
      this.reconnectBaseDelay * Math.pow(2, this.reconnectAttempts)
    );

    this.reconnectAttempts++;

    this.onReconnect(this.reconnectAttempts, delay);

    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect... (Attempt ${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }

  resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not connected. Message not sent:", data);
    }
  }
}
