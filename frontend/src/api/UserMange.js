// src/api/UserMange.js

// 假设我们有一个通用的请求实例 request
// import request from '@/utils/request';

/**
* 获取 User Manage / Manage 列表
*/
export function getUserMangeList(params) {
// return request({
// url: '/api/USERMANGE',
// method: 'get',
// params,
// });
console.log('调用了 getUserMangeList API');
return Promise.resolve({ code: 200, data: [], message: 'success' });
}

/**
* 新增 User Manage / Manage
*/
export function addUserMange(data) {
// return request({
// url: '/api/USERMANGE',
// method: 'post',
// data,
// });
}