const express = require('express');
const app = express();
const port = 3010;
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

let pages = require('./pages.json')

app.use(cors());
app.use(express.static('static'));
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.sendFile(path.resolve('pages/index.html'));
});

app.get('/pages', (req, res) => {
  res.json({
    code: 0,
    data: pages
  })
});

app.post('/page', (req, res) => {
  const { pageSchema = {} } = req.body
  if (Object.keys(pageSchema).length) {
    console.log(pages.length);
    pages.push(pageSchema)
    console.log(pages.length);
    res.json({
      code: 0,
      msg: '创建新页面成功'
    })
  } else {
    res.json({
      code: -1,
      msg: '缺少参数：页面描述 Schema'
    })
  }
});


app.delete('/page/:fileName', (req, res) => {
  const { fileName = '' } = req.params
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
