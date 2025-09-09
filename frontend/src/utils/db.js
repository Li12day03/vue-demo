// --- 1. 数据库配置 ---
const DB_NAME = "BorderControlDB"; // 数据库名称
const DB_VERSION = 1; // 数据库版本
const STORE_NAME = "appState"; // 数据仓库（类似表）的名称
const KEY_NAME = "lastMessageId"; // 我们要存储的数据的键名

let db = null; // 用来持有数据库连接实例

/**
 * 打开或创建 IndexedDB 数据库
 * @returns {Promise<IDBDatabase>} 返回一个 Promise，解析为数据库实例
 */
function openDB() {
  return new Promise((resolve, reject) => {
    // 如果已经有连接，直接返回
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = event => {
      console.error("IndexedDB error:", event.target.error);
      reject("IndexedDB error");
    };

    request.onsuccess = event => {
      db = event.target.result;
      console.log("IndexedDB opened successfully.");
      resolve(db);
    };

    // 仅在首次创建数据库或版本升级时触发
    request.onupgradeneeded = event => {
      const dbInstance = event.target.result;
      // 创建一个名为 STORE_NAME 的对象仓库
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME);
        console.log(`Object store "${STORE_NAME}" created.`);
      }
    };
  });
}

/**
 * 从 IndexedDB 中读取 lastMessageId
 * @returns {Promise<number>} 返回一个 Promise，解析为最后的消息ID，如果不存在则为0
 */
export async function getLastMessageId() {
  const dbInstance = await openDB();
  return new Promise(resolve => {
    const transaction = dbInstance.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(KEY_NAME);

    request.onsuccess = () => {
      // 如果 request.result 是 undefined (没找到), 则返回 0
      resolve(request.result || 0);
    };

    request.onerror = () => {
      console.error("Failed to get lastMessageId from IndexedDB");
      // 出错时也返回 0，确保程序能继续运行
      resolve(0);
    };
  });
}

/**
 * 将 lastMessageId 写入 IndexedDB
 * @param {number} id 要写入的消息ID
 * @returns {Promise<void>}
 */
export async function setLastMessageId(id) {
  const dbInstance = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(id, KEY_NAME);

    request.onsuccess = () => {
      // console.log(`Successfully set lastMessageId to ${id}`); // 可以取消注释来调试
      resolve();
    };

    request.onerror = event => {
      console.error("Failed to set lastMessageId in IndexedDB:", event.target.error);
      reject();
    };
  });
}

// 立即调用一次 openDB，以便在应用启动时就初始化数据库连接
openDB();
