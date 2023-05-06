/**
 *  防抖
 * @param {*} fn
 * @param {number} [ms=0]
 * @return {*}
 */
const debounce = (fn, ms = 0) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

/**
 * Vue 大量组件的分片渲染 <MyComp v-if='useDefer(index)'>
 * @param {*} maxFrameCount
 * @returns
 */
const useDefer = (maxFrameCount = 1000) => {
  let frameCount = 0;
  const refreshFrameCount = () => {
    window.requestAnimationFrame(() => {
      frameCount++;
      if (frameCount < maxFrameCount) {
        refreshFrameCount();
      }
    });
  };
  refreshFrameCount();

  return function (showInFrameCount) {
    return frameCount <= showInFrameCount;
  };
};

/**
 * 最好的代理单例模式
 * @param {*} classFn
 * @returns
 */
function propxySingle(classFn) {
  let ins;
  return new Proxy(classFn, {
    construct(target, args) {
      if (!ins) {
        ins = new target(...args);
      }
      return ins;
    },
  });
}

/**
 * 并发请求 (异步函数)
 * @param {*} urls
 * @param {*} max
 * @return {*}
 */
function allRequest(urls, max = 3) {
  return new Promise((resolve) => {
    if (urls.length === 0) {
      resolve([]);
      return;
    }

    const result = [];
    let index = 0,
      count = 0;

    async function request() {
      if (index === urls.length) return;
      const i = index;
      curURL = urls[index];
      index++;
      try {
        const ret = await fetch(curURL);
        result[i] = ret;
      } catch (err) {
        result[i] = err;
      } finally {
        count++;
        if (count === urls.length) {
          resolve(result);
        }
        request();
      }
    }

    const num = Math.min(max, urls.length);
    for (let s = 0; s < num; s++) {
      request();
    }
  });
}

/**
 *  并发执行任务
 * @param {*Function} tasks
 * @param {*Number} max 3
 * @returns
 */
function paralleTask(tasks, max = 3) {
  return new Promise((resolve) => {
    if (tasks.length === 0) {
      resolve();
      return;
    }

    let nextIndex = 0;
    let finishCount = 0; // 任务完成数量

    function _run() {
      const currentTask = tasks[nextIndex];
      nextIndex++;

      currentTask.then(() => {
        finishCount++;
        if (nextIndex <= tasks.length) {
          _run();
        } else if (finishCount === tasks.length) {
          resolve();
        }
      });
    }

    const num = Math.min(max, tasks.length);
    for (let s = 0; s < num; s++) {
      _run();
    }
  });
}

/**
 * 返回可复制文字的函数
 * @returns
 */
function copyTextFn() {
  if (navigator.clipboard) {
    return (text) => {
      navigator.clipboard.writeText(text);
    };
  } else {
    return (text) => {
      const input = document.createElement('input');
      input.setAttribute('value', text);
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    };
  }
}
