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

/**
 * 进入全屏
 */
function fullScreen() {
  const el = document.documentElement;
  const rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  if (typeof rfs != 'undefined' && rfs) {
    rfs.call(el);
  }
}
/**
 * 退出全屏
 */
function exitScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  if (typeof cfs != 'undefined' && cfs) {
    cfs.call(el);
  }
}

/**
 * 手机号脱敏
 * @param {*Number} mobile
 * @returns {*String}
 */
export const hideMobile = (mobile) => {
  return mobile.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
};

/**
 * 生成唯一id
 * @returns
 */
export const uuid = () => {
  const temp_url = URL.createObjectURL(new Blob());
  const uuid = temp_url.toString();
  URL.revokeObjectURL(temp_url); //释放这个url
  return uuid.substring(uuid.lastIndexOf('/') + 1);
};

/**
 * 金额格式化
 * @param {*number} number 要格式化的数字
 * @param {*number} decimals 保留几位小数
 * @param {*string} dec_point 小数点符号
 * @param {*string} thousands_sep 千分位符号
 * @return {*string}
 */
export const moneyFormat = (number, decimals, dec_point, thousands_sep) => {
  number = (number + '').replace(/[^0-9+-Ee.]/g, '');
  const n = !isFinite(+number) ? 0 : +number;
  const prec = !isFinite(+decimals) ? 2 : Math.abs(decimals);
  const sep = typeof thousands_sep === 'undefined' ? ',' : thousands_sep;
  const dec = typeof dec_point === 'undefined' ? '.' : dec_point;
  let s = '';
  const toFixedFix = function (n, prec) {
    const k = Math.pow(10, prec);
    return '' + Math.ceil(n * k) / k;
  };
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  const re = /(-?\d+)(\d{3})/;
  while (re.test(s[0])) {
    s[0] = s[0].replace(re, '$1' + sep + '$2');
  }

  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
};

/**
 * 下载文件
 * @param {*string} api  api 接口
 * @param {*} params 请求参数
 * @param {*string} fileName 文件名
 * @param {*'get'|'post'} type 请求类型
 */
const downloadFile = (api, params, fileName, type = 'get') => {
  axios({
    method: type,
    url: api,
    responseType: 'blob',
    params: params,
  })
    .then((res) => {
      let str = res.headers['content-disposition'];
      if (!res || !str) {
        return;
      }
      let suffix = '';
      // 截取文件名和文件类型
      if (str.lastIndexOf('.')) {
        fileName ? '' : (fileName = window.decodeURI(str.substring(str.indexOf('=') + 1, str.lastIndexOf('.'))));
        suffix = str.substring(str.lastIndexOf('.'), str.length);
      }
      //  如果支持微软的文件下载方式(ie10+浏览器)
      if (window.navigator.msSaveBlob) {
        try {
          const blobObject = new Blob([res.data]);
          window.navigator.msSaveBlob(blobObject, fileName + suffix);
        } catch (e) {
          console.log(e);
        }
      } else {
        //  其他浏览器
        let url = window.URL.createObjectURL(res.data);
        let link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', fileName + suffix);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * 遍历树节点
 * @param {*} data 树形数据
 * @param {*} callback 回调函数
 * @param {*} childrenName children的名字
 */
export const foreachTree = (data, callback, childrenName = 'children') => {
  for (let i = 0; i < data.length; i++) {
    callback(data[i]);
    if (data[i][childrenName] && data[i][childrenName].length > 0) {
      foreachTree(data[i][childrenName], callback, childrenName);
    }
  }
};
