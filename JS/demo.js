let str = '10000000000';
const newStss = str.replace(/(?=\B(\d{3})+$)/g, ','); //把金额以三位分割
const newStss2 = Number(str).toLocaleString();
