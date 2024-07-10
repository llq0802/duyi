const containeDom = document.getElementById('container');
const imgWidth = 220; //每张图片固定宽度


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


// 创建图片函数
function creatImages() {
  // 创建文档片段
  const fragment = document.createDocumentFragment();
  // 循环创建40个图片
  for (let i = 0; i < 40; i++) {
    // 定义图片路径
    const src = './aaa.jpg';
    // 创建图片元素
    const img = document.createElement('img');
    // 设置图片路径
    img.src = src;
    // 将图片添加到文档片段中
    fragment.appendChild(img);
    // 加载图片完成后执行函数
    img.onload = () => {
      // 设置图片位置
      setPoisions();

    };
  }
  // 将文档片段添加到容器中
  containeDom.appendChild(fragment);
}
creatImages();

/**
 * 计算一共多少列和梅一列间隙
 * @returns
 */
function cal() {
  const containerWidth = containeDom.clientWidth;
  // 计算列的数量
  const columns = Math.floor(containerWidth / imgWidth);
  const spaceNumer = columns + 1; //间隙的数量
  const leftSpace = containerWidth - columns * imgWidth;
  const space = leftSpace / spaceNumer; //每个间隙的空间

  return {
    space,
    columns,
  };
}

function setPoisions() {
  const info = cal(); // 得到列数和间隙
  // 该数组的长度为列数,每一项辨识该列的下一个图片的纵坐标
  const nextTops = new Array(info.columns).fill(0);
  for (let i = 0; i < containeDom.children.length; i++) {
    const img = containeDom.children[i];
    // 找到newxtTop中的最小值作为当前图片的纵坐标
    const minTop = Math.min.apply(null, nextTops);
    img.style.top = minTop + 'px';
    //得到一行中最小图片的索引
    let index = nextTops.indexOf(minTop);
    // 重新设置数组这一项的下一个top值
    nextTops[index] += img.height + info.space;
    // 横坐标
    const left = (index + 1) * info.space + index * imgWidth;
    img.style.left = left + 'px';
  }
  const max = Math.max.apply(null, nextTops); //最大值
  containeDom.style.height = max + 'px'; //设置容器的高度
}

let timeId;
window.onresize = function () {
  if (timeId) {
    clearTimeout(timeId);
  }
  timeId = setTimeout(setPoisions, 300);
};
