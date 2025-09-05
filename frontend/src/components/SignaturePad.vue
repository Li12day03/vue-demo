<template>
  <div class="signature-pad-container">
    <div class="controls">
      <label>画笔颜色:</label>
      <input type="color" v-model="penColor" />
      <label>画笔粗细: {{ penWidth }}</label>
      <input type="range" min="1" max="10" v-model="penWidth" />
      <button @click="clearCanvas">清空画板</button>
      <button @click="saveSignature">保存为PNG</button>
    </div>
    <canvas ref="canvasRef" @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing" @mouseleave="stopDrawing"
      @touchstart="startDrawing" @touchmove="draw" @touchend="stopDrawing"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// --- 响应式状态 ---
const canvasRef = ref(null); // 用于获取 canvas DOM 元素
const ctx = ref(null); // 用于持有 2D 渲染上下文
const isDrawing = ref(false);
const penColor = ref('#000000'); // 默认黑色
const penWidth = ref(2);       // 默认粗细为2

// --- 核心绘图逻辑 ---

// 获取相对于 canvas 的坐标
function getCoordinates(event) {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();

  // 区分鼠标和触摸事件
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

// 开始绘制
function startDrawing(event) {
  event.preventDefault(); // 防止触摸事件的默认行为（如滚动）
  const { x, y } = getCoordinates(event);
  if (!ctx.value) return;

  isDrawing.value = true;
  ctx.value.beginPath();
  ctx.value.moveTo(x, y);
}

// 绘制过程
function draw(event) {
  if (!isDrawing.value) return;
  event.preventDefault();
  const { x, y } = getCoordinates(event);
  if (!ctx.value) return;

  ctx.value.lineTo(x, y);
  // 在画线前，设置好画笔的样式
  ctx.value.strokeStyle = penColor.value;
  ctx.value.lineWidth = penWidth.value;
  ctx.value.lineCap = 'round'; // 让线条末端更圆滑
  ctx.value.lineJoin = 'round'; // 让线条转角更圆滑
  ctx.value.stroke();
}

// 停止绘制
function stopDrawing() {
  isDrawing.value = false;
}

// --- 控制功能 ---

// 清空画板
function clearCanvas() {
  if (ctx.value && canvasRef.value) {
    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }
}

// 保存签名
function saveSignature() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  // 1. 获取 Data URL
  const dataUrl = canvas.toDataURL('image/png');

  // 2. 创建一个临时的 a 标签用于下载
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `signature_${Date.now()}.png`; // 设置下载文件名

  // 3. 触发点击事件
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


// --- 生命周期钩子 ---

// 初始化 Canvas
function initCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  // 设置 canvas 的实际像素大小，以匹配其显示大小，防止模糊
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;

  ctx.value = canvas.getContext('2d');
  if (ctx.value) {
    ctx.value.scale(dpr, dpr); // 适应高DPI屏幕
  }
}

onMounted(() => {
  initCanvas();
  // 监听窗口大小变化，以便重新设置 canvas 大小
  window.addEventListener('resize', initCanvas);
});

onUnmounted(() => {
  // 组件销毁时，移除监听器，防止内存泄漏
  window.removeEventListener('resize', initCanvas);
});

</script>

<style scoped>
.signature-pad-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 500px;
  /* 或者根据需要调整 */
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

.controls {
  padding: 10px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  gap: 15px;
  /* 元素间距 */
  flex-wrap: wrap;
  /* 换行 */
}

canvas {
  flex-grow: 1;
  cursor: crosshair;
  background-color: #fff;
}

button {
  padding: 5px 10px;
  cursor: pointer;
}
</style>