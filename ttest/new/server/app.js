let express = require('express')
let app = express()
let cors = require('cors')
let bodyParser = require('body-parser')
let router = require('./router')


app.use(bodyParser.json());  //配置解析，用于解析json和urlencoded格式的数据
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors())              //配置跨域，必须在路由之前
app.use(router)
// 服务器托管图片  upload指该文件路径下的所有文件资源  /upload指访问路劲
// 不懂的可以去先试一次，建议不要只看
app.use('/asset', express.static('../asset'))

app.listen(801, () => {
    console.log('服务器启动成功');
})
