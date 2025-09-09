// src/api/UserManage.js

// 假设我们有一个通用的请求实例 request
// import request from '@/utils/request';

/**
* 获取 User Mange / 用户管理 列表
*/
export function getUserManageList(params) {
// return request({
// url: '/api/USERMANAGE',
// method: 'get',
// params,
// });
console.log('调用了 getUserManageList API');
return Promise.resolve({ code: 200, data: [], message: 'success' });
}

/**
* 新增 User Mange / 用户管理
*/
export function addUserManage(data) {
// return request({
// url: '/api/USERMANAGE',
// method: 'post',
// data,
// });
}