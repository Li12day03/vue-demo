<template>
  <div class="analysis-container">
    <h2>药品数据交叉分析 (Web Worker Demo)</h2>
    <div class="card">
      <h3>操作区</h3>
      <p>将模拟生成 50万条 销售数据和 20万条 药品字典，并在前端进行交叉聚合。</p>
      <div class="button-group">
        <el-button type="danger" @click="runOnMainThread" :loading="mainLoading">
          在主线程计算 (会导致页面卡死)
        </el-button>
        <el-button type="success" @click="runWithWebWorker" :loading="workerLoading">
          使用 Web Worker 计算 (UI流畅)
        </el-button>
      </div>
      <div class="tip">
        测试时，请在计算过程中尝试点击下面的动画方块，以验证UI是否被阻塞。
      </div>
    </div>

    <div class="card result-card">
      <h3>分析结果 (按厂家聚合)</h3>
      <pre v-if="resultData">{{ JSON.stringify(resultData, null, 2) }}</pre>
      <p v-else>暂无结果</p>
    </div>

    <div class="card animation-card">
      <h3>UI响应性测试</h3>
      <div class="animated-box"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// --- 状态定义 ---
const mainLoading = ref(false);
const workerLoading = ref(false);
const resultData = ref(null);

// --- 数据生成函数 (模拟) ---
const generateData = () => {
  console.log('正在生成模拟数据...');
  const salesCount = 500000;
  const dictCount = 200000;

  // 生成药品字典 (Array)
  const dictArray = [];
  for (let i = 1; i <= dictCount; i++) {
    dictArray.push({
      id: i,
      name: `药品-${i}`,
      manufacturer: `厂家-${i % 100}`, // 模拟100个厂家
    });
  }

  // 生成销售数据
  const salesData = [];
  for (let i = 0; i < salesCount; i++) {
    salesData.push({
      id: i,
      drugId: Math.floor(Math.random() * dictCount) + 1,
      amount: Math.random() * 1000,
    });
  }
  console.log('模拟数据生成完毕!');
  return { salesData, dictArray };
};

// --- Web Worker 引用 ---
let worker = null;

// --- 主线程计算 ---
const runOnMainThread = () => {
  mainLoading.value = true;
  resultData.value = null;

  // 使用 setTimeout 延迟执行，让 loading 状态先生效
  setTimeout(() => {
    const { salesData, dictArray } = generateData();

    // 为了提高查找效率，将数组转为 Map
    const dictDataMap = new Map(dictArray.map(item => [item.id, item]));

    // 在主线程执行 processData (这是 worker.js 里的同款函数)
    // 这是会导致页面卡死的罪魁祸首！
    const result = processDataOnMain(salesData, dictDataMap);

    resultData.value = result;
    mainLoading.value = false;
  }, 100);
};

// 在主线程执行的同款耗时函数
function processDataOnMain(salesData, dictData) {
  console.log('MainThread: 开始进行繁重的数据处理...');
  const startTime = performance.now();
  const aggregatedResult = {};
  salesData.forEach(sale => {
    const drugInfo = dictData.get(sale.drugId);
    if (drugInfo) {
      const manufacturer = drugInfo.manufacturer;
      if (!aggregatedResult[manufacturer]) {
        aggregatedResult[manufacturer] = { totalSales: 0, count: 0 };
      }
      aggregatedResult[manufacturer].totalSales += sale.amount;
      aggregatedResult[manufacturer].count++;
    }
  });
  const endTime = performance.now();
  console.log(`MainThread: 数据处理完成，耗时: ${(endTime - startTime).toFixed(2)} ms`);
  return aggregatedResult;
}


// --- Web Worker 计算 ---
const runWithWebWorker = () => {
  workerLoading.value = true;
  resultData.value = null;

  // 确保每次都创建一个新的 worker
  if (worker) {
    worker.terminate();
  }

  // 这里的路径是相对于 public 目录的
  worker = new Worker('/analysis.worker.js');

  // 监听来自 worker 的消息
  worker.onmessage = (event) => {
    const { type, result } = event.data;
    if (type === 'done') {
      console.log('MainThread: 收到了来自 Worker 的计算结果');
      resultData.value = result;
      workerLoading.value = false;
      worker.terminate(); // 任务完成，关闭 worker
      worker = null;
    }
  };

  // 监听错误
  worker.onerror = (error) => {
    console.error('Worker error:', error);
    workerLoading.value = false;
  };

  // 生成数据并发送给 worker
  const { salesData, dictArray } = generateData();
  const dictDataMap = new Map(dictArray.map(item => [item.id, item]));

  console.log('MainThread: 正在将数据发送给 Worker...');
  worker.postMessage({ salesData, dictDataMap });
};
</script>

<style scoped>
.analysis-container {
  padding: 20px;
  font-family: sans-serif;
}

.card {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.tip {
  font-size: 14px;
  color: #666;
}

.result-card pre {
  background: #eee;
  padding: 15px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.animation-card {
  height: 100px;
}

.animated-box {
  width: 50px;
  height: 50px;
  background-color: #3498db;
  animation: move 2s infinite alternate;
}

@keyframes move {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(300px);
  }
}
</style>