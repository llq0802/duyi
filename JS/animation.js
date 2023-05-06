/**
 *
 * 动画函数
 * @param {*} { from, to, duration, onProgress }
 */
function myAnimation({ from, to, duration, onProgress }) {
  const dis = to - from; // 变化区间
  const speed = dis / duration; // 速度
  const startTime = Date.now(); // 开始时间
  let currentValue = from; // 当前值
  onProgress(currentValue);

  function _run() {
    const now = Date.now();
    const time = now - startTime;
    if (time >= duration) {
      currentValue = to;
      onProgress(currentValue);

      return;
    }
    const d = time * speed;
    currentValue = from + d;
    onProgress(currentValue);
    requestAnimationFrame(_run);
  }

  requestAnimationFrame(_run);
}
