uni.addInterceptor({
  returnValue (res) {
    /**
     * !!res: 确保 res 不是 null 或 undefined
     * typeof res.then === "function"： res 有一个 then 方法
     */
    // 如果 res 不是一个 Promise 对象，那么直接返回 res
    if (!(!!res && (typeof res === "object" || typeof res === "function") && typeof res.then === "function")) {
      return res;
    }
    return new Promise((resolve, reject) => {
      res.then((res) => {
        if (!res) return resolve(res) // res 是 undefined 或 null，则直接解决新的 Promise
        return res[0] ? reject(res[0]) : resolve(res[1])  // 若res[0] 不存在，则使用 resolve(res[1]) 解决新的 Promise
      });
    });
  },
});