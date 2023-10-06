export const pageMake = (obj) => {
  let strTemp = ''
  obj.forEach((element, index) => {
    strTemp = strTemp + `
        <div class="item">
        <div class="seq">${index + 1}.</div>
        <div class="name">${element.name}</div>
        <span>---</span>
        <div class="author">${element.author}</div>
        <span>来自:</span>
        <div class="app">${element.platform}</div>
        </div>\n`
  });

  const data = `
  <div class="box">
  <div class="title">Nazrin-search</div>
  ${strTemp}\n
  </div>
  <style>
  .box {
    border: #37474f 2px solid;
    color: #37474f;
    background: #f3f3f3;
    display: inline-block;
    padding: 8px 0 12px 0;
  }

  .title {
    color: #CE9178;
    width: 100%;
    text-align: center;
  }

  .item {
    width: 100%;
    margin: 0 12px;
  }

  .item>div,
  .item>span {
    display: inline-block;
  }

  .seq {}

  .app {}
  </style>`
  return data
}