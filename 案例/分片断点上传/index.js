

//  总的切片信息
let partList = []
// 当前文件的哈希值
let hash = '';

let count = 0;

async function changeFile(file) {
  if (!file) return;
  file = file.raw;

  // 解析为BUFFER数据
  // 我们会把文件切片处理：把一个文件分割成为好几个部分（固定数量/固定大小）
  // 每一个切片有自己的部分数据和自己的名字
  // HASH_1.mp4
  // HASH_2.mp4
  // ...
  let buffer = await fileParse(file, "buffer"),
    spark = new SparkMD5.ArrayBuffer(),
    hash,
    suffix;

  spark.append(buffer);
  hash = spark.end();

  suffix = /\.([0-9a-zA-Z]+)$/i.exec(file.name)[1];

  // 首先从服务器获取已经上传过的切换 通过hash判断


  // let max = 1024 * 100
  // tol = Math.ceil(ile.size / max)
  // if (tol > 100) {
  //   max = Math.ceil(file.size / 100)
  //   tol = 100
  // }



  // slice(page * pageSize, (page + 1) * pageSize)

  // 创建100个切片
  partsize = Math.ceil(file.size / 100),//处理精度问题
    cur = 0;
  for (let i = 0; i < 100; i++) {
    let item = {
      chunk: file.slice(cur, cur + partsize),
      filename: `${hash}_${i}.${suffix}`, // 命名当时候，也改成了 hash-1，hash-2 这种形式，
    };
    cur += partsize;
    partList.push(item);
  }


  this.sendRequest();
}





async function sendRequest() {
  // 根据100个切片创造100个请求（集合）
  let requestList = [];
  partList.forEach((item, index) => {


    // 判断已经上传的
    // if (already.length > 0 && already.includes(item.filename)) {

    //   return
    // }

    // 每一个函数都是发送一个切片的请求
    const fn = () => {
      let formData = new FormData();
      formData.append("chunk", item.chunk);
      formData.append("filename", item.filename);
      return axios
        .post("/single3", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((result) => {
          result = result.data;
          if (result.code == 0) {
            count += 1;
            // 传完的切片我们把它移除掉
            partList.splice(index, 1);
          }
        });
    };
    requestList.push(fn);
  });

  // 传递：并行(ajax.abort())/串行(基于标志控制不发送)
  let i = 0;
  let complete = async () => {
    let result = await axios.get("/merge", {
      params: {
        hash: hash,
      },
    });
    result = result.data;
    if (result.code == 0) {
      this.video = result.path;
    }
  };
  let send = async () => {
    // 已经中断则不再上传
    if (this.abort) return;
    if (i >= requestList.length) {
      // 都传完了
      complete();
      return;
    }




    await requestList[i]();

    // i/count*100

    i++;
    send();
  };
  send();
}



function handleBtn() {
  if (this.btn) {
    //断点续传
    this.abort = false;
    this.btn = false;
    this.sendRequest();
    return;
  }
  //暂停上传
  this.btn = true;
  this.abort = true;
}
