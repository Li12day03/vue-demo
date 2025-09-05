// backend/server.js
import {WebSocketServer} from "ws";

const wss = new WebSocketServer({port: 8080});
console.log("WebSocket server is running on  ws://localhost:8080/ws/border-control");

// 模拟的告警和车辆数据
const alerts = ["A口岸发现可疑人员", "B区域发生拥堵", "C通道设备异常"];
const vehicles = ["粤B-12345", "粤A-67890", "京N-54321"];

wss.on("connection", ws => {
  console.log("Client connected.");

  // 1. 立即发送欢迎消息
  ws.send(JSON.stringify({type: "info", message: "成功连接到智慧边检数据中心！"}));

  // 2. 设置定时器，模拟实时数据推送
  const alertInterval = setInterval(() => {
    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
    ws.send(
      JSON.stringify({
        type: "alert",
        data: randomAlert,
        time: new Date().toLocaleTimeString(),
      })
    );
  }, 5000); // 每5秒推送一条告警

  const vehicleInterval = setInterval(() => {
    const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
    ws.send(
      JSON.stringify({
        type: "vehicle",
        data: {id: randomVehicle, position: [Math.random() * 100, Math.random() * 50]},
        time: new Date().toLocaleTimeString(),
      })
    );
  }, 3000); // 每3秒推送一条车辆动态

  // 3. 监听客户端消息（心跳处理）
  ws.on("message", message => {
    try {
      const data = JSON.parse(message);
      if (data.type === "ping") {
        // 收到ping，立即回复pong
        ws.send(JSON.stringify({type: "pong"}));
      }
    } catch (e) {
      console.log("Received non-JSON message:", message.toString());
    }
  });

  // 4. 处理连接关闭
  ws.on("close", () => {
    console.log("Client disconnected.");
    // 清理定时器，防止内存泄漏
    clearInterval(alertInterval);
    clearInterval(vehicleInterval);
  });
});
