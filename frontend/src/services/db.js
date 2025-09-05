/**
 * db.js
 *
 * IndexedDB 数据库辅助模块。
 * 使用 'idb' 库简化操作，提供异步的 get/set 方法。
 */
import {openDB} from "idb";

const DB_NAME = "BorderControlDB"; // 数据库名称
const STORE_NAME = "appState"; // 对象存储空间名称
const VERSION = 1; // 数据库版本

// 初始化数据库的函数
async function initDB() {
  const db = await openDB(DB_NAME, VERSION, {
    // 当数据库首次创建或版本升级时，此回调会被执行
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // 创建一个名为 'appState' 的对象存储空间
        db.createObjectStore(STORE_NAME);
      }
    },
  });
  return db;
}

/**
 * 从IndexedDB中异步获取最后一条消息的ID
 * @returns {Promise<number>} 返回最后的消息ID，如果不存在或出错则返回0
 */
export async function getLastMessageId() {
  try {
    const db = await initDB();
    // 'readonly' 表示这是一个只读事务
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const lastId = await store.get("lastMessageId"); // 使用固定的key获取值
    await tx.done; // 等待事务完成
    return lastId || 0;
  } catch (error) {
    console.error("从IndexedDB获取 lastMessageId 失败:", error);
    return 0;
  }
}

/**
 * 将最后一条消息的ID异步存入IndexedDB
 * @param {number} id 要存储的消息ID
 */
export async function setLastMessageId(id) {
  try {
    const db = await initDB();
    // 'readwrite' 表示这是一个读写事务
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    // 使用 'lastMessageId' 作为key，存储传入的id值
    await store.put(id, "lastMessageId");
    await tx.done; // 等待事务完成
  } catch (error) {
    console.error("向IndexedDB设置 lastMessageId 失败:", error);
  }
}
