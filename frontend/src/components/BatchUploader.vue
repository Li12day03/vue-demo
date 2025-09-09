<template>
  <div class="uploader-container">
    <h2>药材质检报告批量上传</h2>
    <p>
      支持并发控制(3)、客户端压缩、状态管理和失败重试
    </p>

    <!-- 使用 el-upload 组件，但自定义其行为 -->
    <el-upload action="#" multiple :show-file-list="false" :http-request="handleUpload"
      :before-upload="handleBeforeUpload">
      <el-button type="primary">选择图片文件</el-button>
    </el-upload>

    <!-- 文件列表展示 -->
    <div class="file-list" v-if="fileList.length > 0">
      <div v-for="file in fileList" :key="file.uid" class="file-item">
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</span>
        </div>
        <div class="file-status">
          <!-- 状态展示 -->
          <el-progress v-if="['compressing', 'uploading'].includes(file.status)" :percentage="file.percentage"
            :text-inside="true" :stroke-width="18" :color="statusColors[file.status]">
            <span>{{ statusTexts[file.status] }}</span>
          </el-progress>

          <el-tag v-else :type="statusColors[file.status]" effect="dark">
            {{ statusTexts[file.status] }}
          </el-tag>

          <!-- 重试按钮 -->
          <el-button v-if="file.status === 'error'" @click="retryUpload(file)" type="warning" size="small" circle
            class="retry-btn">
            重
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import imageCompression from 'browser-image-compression';

// --- 核心配置 ---
const concurrencyLimit = 3; // 并发上传数量

// --- 响应式状态 ---
const fileList = ref([]); // 总的文件队列
let uploadingCount = 0; // 当前正在上传的数量

// --- UI 状态映射 ---
const statusTexts = {
  waiting: '等待上传',
  compressing: '压缩中...',
  uploading: '上传中...',
  success: '上传成功',
  error: '上传失败',
};
const statusColors = {
  waiting: 'info',
  compressing: '#e6a23c',
  uploading: '#409eff',
  success: 'success',
  error: 'danger',
};

// --- 核心方法 ---

// 1. 文件被选择后，加入队列
const handleBeforeUpload = (rawFile) => {
  const task = {
    uid: rawFile.uid,
    name: rawFile.name,
    size: rawFile.size,
    raw: rawFile, // 保存原始文件
    status: 'waiting',
    percentage: 0,
  };
  fileList.value.push(task);
  runQueue(); // 触发任务调度器
  return false; // 阻止 el-upload 自动上传
};

// 2. 任务调度器：控制并发
const runQueue = () => {
  while (uploadingCount < concurrencyLimit && fileList.value.some(f => f.status === 'waiting')) {
    const task = fileList.value.find(f => f.status === 'waiting');
    if (task) {
      uploadingCount++;
      startUpload(task);
    }
  }
};

// 3. 开始单个任务的处理流程 (压缩 -> 上传)
const startUpload = async (task) => {
  try {
    // 3.1 客户端压缩
    task.status = 'compressing';
    task.percentage = 50; // 模拟进度
    const compressedFile = await imageCompression(task.raw, {
      maxSizeMB: 1, // 压缩到最大 1MB
      maxWidthOrHeight: 1920,
      useWebWorker: true, // 使用 worker 压缩，避免阻塞主线程
    });

    // 3.2 真正上传 (这里我们用一个模拟的上传函数)
    task.status = 'uploading';
    await mockUploadRequest(compressedFile, (progressEvent) => {
      // 更新上传进度
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      task.percentage = percentCompleted;
    });

    // 3.3 上传成功
    task.status = 'success';
    task.percentage = 100;
  } catch (error) {
    // 3.4 上传失败
    console.error(`File ${task.name} upload failed:`, error);
    task.status = 'error';
    task.percentage = 0;
  } finally {
    // 3.5 任务结束 (无论成功或失败)
    uploadingCount--;
    runQueue(); // 尝试启动下一个等待中的任务
  }
};

// 4. 重试失败的任务
const retryUpload = (task) => {
  task.status = 'waiting';
  task.percentage = 0;
  runQueue(); // 再次触发调度器
};

// 5. 模拟的 HTTP 上传请求
const mockUploadRequest = (file, onUploadProgress) => {
  return new Promise((resolve, reject) => {
    // 随机模拟成功或失败
    const shouldSuccess = Math.random() > 0.3; // 70% 成功率

    // 模拟上传进度
    let loaded = 0;
    const total = file.size;
    const interval = setInterval(() => {
      loaded += total / 10; // 每次增加10%
      if (loaded >= total) {
        loaded = total;
      }
      onUploadProgress({ loaded, total });

      if (loaded === total) {
        clearInterval(interval);
        setTimeout(() => {
          if (shouldSuccess) {
            console.log(`Mock upload success for ${file.name}`);
            resolve({ data: 'Upload success' });
          } else {
            console.error(`Mock upload failed for ${file.name}`);
            reject(new Error('Mock upload error'));
          }
        }, 500); // 模拟网络延迟
      }
    }, 200); // 每200ms更新一次进度
  });
};

// el-upload 需要一个 http-request 函数，但我们自己管理上传，所以这里留空
const handleUpload = () => { };

</script>

<style scoped>
.uploader-container {
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.file-list {
  margin-top: 20px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.file-info {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 14px;
  color: #606266;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.file-status {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 200px;
}

.retry-btn {
  margin-left: 10px;
}
</style>