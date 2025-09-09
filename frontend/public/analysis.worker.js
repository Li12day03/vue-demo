// public/analysis.worker.js

/**
 * 模拟一个耗时的、计算密集型的任务
 * @param {Array<object>} salesData - 销售数据
 * @param {Map<number, object>} dictData - 药品字典 (使用Map以提高查找效率)
 * @returns {object} 聚合后的结果
 */
function processData(salesData, dictData) {
  console.log("Worker: 开始进行繁重的数据处理...");
  const startTime = performance.now();

  const aggregatedResult = {};

  // 遍历每一条销售数据
  salesData.forEach(sale => {
    // 模拟查找药品信息
    const drugInfo = dictData.get(sale.drugId);

    if (drugInfo) {
      const manufacturer = drugInfo.manufacturer;
      if (!aggregatedResult[manufacturer]) {
        aggregatedResult[manufacturer] = {totalSales: 0, count: 0};
      }
      aggregatedResult[manufacturer].totalSales += sale.amount;
      aggregatedResult[manufacturer].count++;
    }
  });

  const endTime = performance.now();
  console.log(`Worker: 数据处理完成，耗时: ${(endTime - startTime).toFixed(2)} ms`);
  return aggregatedResult;
}

// 监听来自主线程的消息
self.onmessage = event => {
  console.log("Worker: 收到了来自主线程的数据");
  const {salesData, dictDataMap} = event.data;

  // 执行计算
  const result = processData(salesData, dictDataMap);

  // 将结果发送回主线程
  console.log("Worker: 计算完成，正在将结果发送回主线程...");
  self.postMessage({type: "done", result});
};
