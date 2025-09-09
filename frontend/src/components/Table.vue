<script setup>
import { ref, onMounted } from "vue";

// 表格数据
const tableData = ref([]);
// 加载状态
const loading = ref(true);

// 模拟异步请求
const fetchData = () => {
  loading.value = true;
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("异步请求");

      resolve([
        { id: 1, name: "张三", age: 25 },
        { id: 2, name: "李四", age: 30 },
        { id: 3, name: "王五", age: 28 },
      ]);
    }, 1500); // 模拟1.5秒后返回数据
  });
};

// 获取数据
const getUsers = async () => {
  tableData.value = await fetchData();
  loading.value = false;
};

// 页面挂载时加载
onMounted(() => {
  getUsers();
});

defineExpose({
  submit() {
    console.log('submit');
  }
})
</script>

<template>
  <div>
    <h2>用户列表</h2>
    <el-button type="primary" @click="getUsers">刷新数据</el-button>

    <el-table v-loading="loading" :data="tableData" border style="width: 100%; margin-top: 16px">
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="age" label="年龄" width="120" />
    </el-table>
  </div>
</template>
