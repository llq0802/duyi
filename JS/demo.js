//把数字以三位分割
let str = '10000000000';
const newStss = str.replace(/(?=\B(\d{3})+$)/g, ',');
const newStss2 = Number(str).toLocaleString();

// 手写Promise.all
Promise.myAll = function (promiseArray) {
  return new Promise((resolve, reject) => {
    let arr = [];
    promiseArray.forEach((promise, index) => {
      promise.then(
        // promise成功一定会走这个then方法
        (v) => {
          //不要使用arr.push()；异步的时候可能会使promiseArray的顺序与arr顺序不一样
          arr[index] = v;
          // 只有当每个promise都执行了then才调用成功
          if (arr.length === promiseArray.length) {
            resolve(arr);
          }
        },
        (r) => reject(r)
      );
    });
  });
};
