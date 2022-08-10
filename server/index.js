const express = require('express');
const app = express();
const port = 3010;
const path = require('path');
const cors = require('cors');

let pages = require('./pages.json')

app.use(cors());
app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('pages/index.html'));
});

app.get('/pages', (req, res) => {
  res.json({
    code: 0,
    data: pages
  })
});

app.delete('/page/:fileName', (req, res) => {
  const { fileName = '' } = req.params
  console.log(fileName);
  if (fileName.length) {
    const index = pages.findIndex(page => page.fileName === fileName)
    if (index === -1) {
      res.json({
        code: -1,
        msg: '未找到要删除的页面'
      })
      return
    }
    pages.splice(index, 1)
    res.json({
      code: 0,
      msg: '删除成功'
    })
  } else {
    res.json({
      code: -1,
      msg: '缺少参数：页面文件名'
    })
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
