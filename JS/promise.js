const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
/**
 * 手写Promise
 */
class MyPromise {
  #result = void 0;
  #state = PENDING;
  #handlers = [];

  constructor(executor) {
    const resolve = (value) => {
      this.#changeState(FULFILLED, value);
    };
    const reject = (value) => {
      this.#changeState(REJECTED, value);
    };

    try {
      // 只能捕获同步错误 (异步错误捕获不到)
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * 改变 Promise的状态
   * @param {*} state 
   * @param {*} result 
   * @returns 
   */
  #changeState(state, result) {
    if (state === PENDING) return;
    this.#state = state;
    this.#result = result;
    this.#runThen();
  }

 /**
  * 判断是否符合PromiseA+规范
  * @returns 
  */ 
#isPromiseLike(){

  return false;
}

/**
 * 模拟实现微队列
 * @param {*} func 
 */
#runMicroTask(func){
  setTimeout(func,0)
}


  #runOne(callback, resolve, reject) {



    this.#runMicroTask(()=>{

      if (typeof callback !== 'function') {
        const settled = this.#state === FULFILLED?:resolve : reject
        settled(this.#result);
        return
      } 

      try {
        const data = onFulfilled(this.#result);

        if(this.#isPromiseLike()){

        }else{
          resolve(data);
        }


      } catch (error) {
        reject(error);
      }



    })
  }


  #runThen() {
    if (this.#state === PENDING) return;

    while (this.#handlers.length) {
      const { onFulfilled, onRejected, resolve, reject } = this.#handlers.shift();

      if (this.#state === FULFILLED) {
        this.#runOne(onFulfilled, resolve, reject);
      } else {
        this.#runOne(onRejected, resolve, reject);
      }
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this.#handlers.push({
        onFulfilled,
        onRejected,
        resolve,
        reject,
      });

      this.#runThen();
    });
  }
}



// 使用
const p = new MyPromise((resolve, reject) => {
  resolve(1);
});

p.then((res) => {
  console.log('成功完成', res);
});
